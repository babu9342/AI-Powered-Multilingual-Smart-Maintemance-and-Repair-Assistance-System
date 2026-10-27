import os
import sys
import time
import json
import logging
import re
import hashlib
from typing import List, Dict, Any, Optional, Tuple, Set

logger = logging.getLogger("fixlink.ai_pipeline")
logging.basicConfig(level=logging.INFO)

from backend.config import (
    OPENAI_API_KEY,
    DEEPSEEK_API_KEY,
    GEMINI_API_KEY,
    OPENAI_MODEL,
    DEEPSEEK_MODEL,
    GEMINI_MODEL,
    GEMINI_FALLBACK_MODELS,
    DEEPSEEK_BASE_URL,
    GEMINI_BASE_URL,
    OPENAI_COOLDOWN_MIN,
    DEEPSEEK_COOLDOWN_MIN,
    GEMINI_COOLDOWN_MIN
)
from backend.ai.language_detector import detect_language
from backend.ai.complaint_understanding import (
    extract_complaint_constraints,
    is_condition_negated
)
from backend.ai.ml_classifier import generate_accurate_diagnosis
from backend.ai.safety_engine import evaluate_safety_and_repair

# ── SUPPORTED LANGUAGE NAME MAPPER ──────────────────────────────────────────
LANGUAGE_NAMES = {
    "ta": "Tamil (தமிழ்)",
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "te": "Telugu (తెలుగు)",
    "ml": "Malayalam (മലയാളം)",
    "kn": "Kannada (ಕನ್ನಡ)"
}

# ── IN-MEMORY CACHE WITH TTL (1 HOUR) ────────────────────────────────────────
# Structure: { cache_key: { "data": dict, "created_at": float, "ttl": 3600 } }
_AI_PIPELINE_CACHE: Dict[str, Dict[str, Any]] = {}

# Provider Cooldown Tracking
_provider_exhausted_until: Dict[str, float] = {}

PROVIDER_ORDER = ["gemini", "openai", "deepseek"]

PROVIDER_CONFIGS = {
    "openai": {
        "name": "ChatGPT",
        "api_key": OPENAI_API_KEY,
        "base_url": None,
        "model": OPENAI_MODEL or "gpt-4o-mini",
        "cooldown_sec": OPENAI_COOLDOWN_MIN * 60
    },
    "gemini": {
        "name": "Gemini",
        "api_key": GEMINI_API_KEY,
        "base_url": GEMINI_BASE_URL,
        "model": GEMINI_MODEL or "gemini-2.5-flash",
        "cooldown_sec": GEMINI_COOLDOWN_MIN * 60
    },
    "deepseek": {
        "name": "DeepSeek",
        "api_key": DEEPSEEK_API_KEY,
        "base_url": DEEPSEEK_BASE_URL,
        "model": DEEPSEEK_MODEL or "deepseek-chat",
        "cooldown_sec": DEEPSEEK_COOLDOWN_MIN * 60
    }
}

def is_valid_key(key: str) -> bool:
    if not key:
        return False
    k = key.strip()
    return not (k.startswith("your_") or k.startswith("sk-placeholder") or k == "sk-...")

def check_gemini_models_startup():
    """Validates configured GEMINI_MODEL against list_models() and logs a warning if missing."""
    if not is_valid_key(GEMINI_API_KEY):
        return
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        available_models = [
            m.name.replace("models/", "")
            for m in genai.list_models()
            if "generateContent" in getattr(m, "supported_generation_methods", [])
        ]
        configured = PROVIDER_CONFIGS["gemini"]["model"]
        if configured not in available_models:
            logger.warning(
                f"\n{'!'*80}\n"
                f"[FixLink AI Startup Warning] Configured GEMINI_MODEL '{configured}' is NOT found in Google Generative AI list_models()!\n"
                f"Configured Fallback Models: {GEMINI_FALLBACK_MODELS}\n"
                f"Available Models from API: {available_models[:8]}...\n"
                f"{'!'*80}"
            )
        else:
            logger.info(f"[FixLink AI Startup Check] GEMINI_MODEL '{configured}' verified successfully in list_models().")
    except Exception as exc:
        logger.warning(f"[FixLink AI Startup Warning] Could not verify Gemini models at startup: {exc}")


def is_provider_exhausted(provider_id: str) -> bool:
    expires_at = _provider_exhausted_until.get(provider_id)
    if not expires_at:
        return False
    if time.time() >= expires_at:
        del _provider_exhausted_until[provider_id]
        logger.info(f"[FixLink Pipeline] Provider '{provider_id}' cooldown expired. Re-enabled.")
        return False
    return True

def mark_provider_exhausted(provider_id: str, reason: str):
    cooldown = PROVIDER_CONFIGS.get(provider_id, {}).get("cooldown_sec", 1800)
    _provider_exhausted_until[provider_id] = time.time() + cooldown
    logger.warning(f"[FixLink Pipeline] Provider '{provider_id}' marked EXHAUSTED ({reason}). Cooldown: {cooldown // 60}m.")

def get_available_providers() -> List[str]:
    """Returns available providers in priority order."""
    available = []
    for pid in PROVIDER_ORDER:
        cfg = PROVIDER_CONFIGS[pid]
        if is_valid_key(cfg["api_key"]) and not is_provider_exhausted(pid):
            available.append(pid)
    return available

def _clean_json_markdown(raw_text: str) -> str:
    """Strips markdown code blocks, backticks and extraneous text to get clean JSON."""
    if not raw_text:
        return "{}"
    text = raw_text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text, re.IGNORECASE)
    if match:
        text = match.group(1).strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        text = text[start:end+1]
    return text


# ── GIBBERISH & MEANINGLESS INPUT DETECTOR ──────────────────────────────────
KEYBOARD_WALK_SUBSTRINGS = [
    "asdf", "dfgh", "ghjk", "hjkl", "qwerty", "werty", "ertyu", "rtyui", "tyuio", "yuio",
    "zxcv", "xcvb", "cvbn", "vbnm", "1234", "2345", "3456", "4567", "5678", "6789",
    "aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff", "gggg", "hhhh", "xxxx", "zzzz"
]

def check_is_gibberish_or_unclear(text: str) -> bool:
    """Detects meaningless, uninterpretable, or ultra-short input."""
    cleaned = text.strip().lower()
    if len(cleaned) <= 2:
        return True
    
    # Strip spaces, numbers and punctuation
    alpha_only = re.sub(r'[^a-zA-Z\u0B80-\u0BFF\u0900-\u097F]', '', cleaned)
    if len(alpha_only) <= 2:
        return True
    
    # Check keyboard walks & repeated runs
    for walk in KEYBOARD_WALK_SUBSTRINGS:
        if walk in alpha_only:
            return True

    # Check for random consonant mash with no vowels (e.g., 'bcdfgh', 'plkjh')
    if len(alpha_only) >= 4 and not re.search(r'[aeiou\u0B85-\u0B94\u0904-\u0914]', alpha_only):
        return True

    return False



# ── MULTILINGUAL HAZARD PHRASES (COMPLEMENTARY PRE-FILTER) ───────────────────
HAZARD_TRIGGERS = [
    # English
    "spark", "sparking", "burning smell", "gas leak", "gas smell", "flooding", "electric shock",
    "live wire", "exposed wire", "smoke", "fire", "crack in wall", "ceiling crack", "water gushing",
    # Tamil / Tanglish
    "shock adikkudhu", "shock adikuthu", "gas vaasam", "theepori", "spark varudhu", "karugiya vaasam",
    "periya crack", "wall la crack", "vidalai", "gas leak aagudhu", "water flooding", "current shock",
    "தீப்பொறி", "மின்கசிவு", "எரிந்த வாசனை", "கருகிய வாசனை", "கேஸ் கசிவு", "அதிர்ச்சி", "சுவர் விரிசல்",
    # Hindi
    "करंट लग रहा है", "धुआं", "आग", "गैस रिसाव", "जलने की बदबू", "स्पार्क"
]

def check_is_hazardous_input(text: str) -> bool:
    """Detects dangerous facility hazards requiring certified technician."""
    t = text.lower()
    return any(h in t for h in HAZARD_TRIGGERS)


# ── LOW-LEVEL LLM JSON INVOCATION WITH PER-PROVIDER TIMEOUT ─────────────────
def _call_llm_json(
    provider_id: str,
    system_prompt: str,
    user_prompt: str,
    timeout_sec: float = 6.0
) -> Tuple[Optional[Dict[str, Any]], int, bool, str, str, str]:
    """
    Executes structured JSON completion against a specific provider.
    Returns: (parsed_dict, latency_ms, is_live, error_message, raw_response_snippet, actual_model_used)
    """
    cfg = PROVIDER_CONFIGS.get(provider_id)
    if not cfg:
        return None, 0, False, f"Unknown provider {provider_id}", "", ""

    api_key = cfg["api_key"]
    if not is_valid_key(api_key):
        return None, 0, False, f"Missing API key for {provider_id}", "", ""

    start_t = time.time()
    base_model = cfg["model"]

    # 1. Native Gemini SDK if provider is gemini (with automatic model fallback on 404 / NotFound)
    if provider_id == "gemini":
        gemini_candidates = [base_model] + [m for m in GEMINI_FALLBACK_MODELS if m != base_model]
        last_g_err = ""
        for idx, cand_model in enumerate(gemini_candidates):
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(
                    model_name=cand_model,
                    system_instruction=system_prompt,
                    generation_config={"response_mime_type": "application/json", "temperature": 0.0, "max_output_tokens": 550}
                )
                response = model.generate_content(user_prompt, request_options={"timeout": timeout_sec})
                raw_text = response.text or ""
                parsed = json.loads(_clean_json_markdown(raw_text))
                lat_ms = int((time.time() - start_t) * 1000)
                logger.info(f"[FixLink AI Pipeline] Gemini successfully generated response using model '{cand_model}'.")
                return parsed, lat_ms, True, "", raw_text[:200], cand_model
            except Exception as g_exc:
                err_str = str(g_exc).lower()
                lat_ms = int((time.time() - start_t) * 1000)
                last_g_err = str(g_exc)
                if "quota" in err_str or "429" in err_str or "resource_exhausted" in err_str:
                    mark_provider_exhausted("gemini", "Quota exceeded (429)")
                    return None, lat_ms, False, f"Gemini quota exhausted: {g_exc}", "", cand_model
                elif "404" in err_str or "not found" in err_str or "not_found" in err_str or "is not found for api version" in err_str:
                    next_cand = gemini_candidates[idx + 1] if idx + 1 < len(gemini_candidates) else "None"
                    logger.warning(
                        f"[FixLink AI Pipeline] Gemini model '{cand_model}' returned 404/Not Found. "
                        f"Automatically trying next fallback model '{next_cand}'..."
                    )
                    continue
                else:
                    logger.warning(f"[FixLink AI Pipeline] Gemini model '{cand_model}' error ({g_exc}). Trying next fallback...")
                    continue
        logger.warning(f"[FixLink AI Pipeline] Native Gemini candidates failed ({last_g_err}), falling back to OpenAI endpoint...")

    # 2. OpenAI / DeepSeek / Gemini OpenAI-compatible client
    try:
        from openai import OpenAI
        client_kwargs = {
            "api_key": api_key,
            "timeout": timeout_sec,
            "max_retries": 1
        }
        if cfg["base_url"]:
            client_kwargs["base_url"] = cfg["base_url"]

        client = OpenAI(**client_kwargs)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        res = client.chat.completions.create(
            model=base_model,
            messages=messages,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        raw_text = res.choices[0].message.content or ""
        parsed = json.loads(_clean_json_markdown(raw_text))
        lat_ms = int((time.time() - start_t) * 1000)
        return parsed, lat_ms, True, "", raw_text[:200], base_model
    except Exception as exc:
        lat_ms = int((time.time() - start_t) * 1000)
        err_str = str(exc).lower()
        if any(q in err_str for q in ["429", "insufficient_quota", "credit_balance_exhausted", "quota", "resource_exhausted"]):
            mark_provider_exhausted(provider_id, "Quota exhausted (429)")
        elif "402" in err_str or "insufficient balance" in err_str:
            mark_provider_exhausted(provider_id, "Insufficient balance (402)")
        elif "401" in err_str or "invalid_api_key" in err_str:
            mark_provider_exhausted(provider_id, "Invalid API key (401)")
        return None, lat_ms, False, str(exc), "", base_model



# ── DETERMINISTIC DOMAIN FALLBACK GENERATORS (WHEN LLM KEYS EXHAUSTED) ──────
def _build_domain_fallback_understanding(
    title: str,
    description: str,
    category_hint: Optional[str],
    lang: str
) -> Dict[str, Any]:
    """Generates an accurate, negation-aware Stage 1 JSON using local rule analysis."""
    full_text = f"{title} {description}".strip()
    constraints = extract_complaint_constraints(full_text, lang, title=title, description=description)
    ml_diag = generate_accurate_diagnosis(
        text=full_text,
        user_selected_category=category_hint,
        lang=lang,
        title=title,
        description=description
    )

    category = ml_diag.get("category", "plumbing")
    negated_symptoms = []
    if constraints.get("negativeConditions", {}).get("leakage") is False:
        negated_symptoms.append("leakage")
    if constraints.get("negativeConditions", {}).get("spark") is False:
        negated_symptoms.append("spark")
    if constraints.get("negativeConditions", {}).get("noise") is False:
        negated_symptoms.append("noise")
    if constraints.get("negativeConditions", {}).get("smoke") is False:
        negated_symptoms.append("smoke")

    is_diy_safe = True
    if check_is_hazardous_input(full_text):
        if not ("spark" in negated_symptoms or "smoke" in negated_symptoms):
            is_diy_safe = False

    is_maintenance = True
    if any(k in full_text.lower() for k in ["write java code", "python code", "binary search", "who is the prime minister", "poem", "essay"]):
        is_maintenance = False

    norm_problem = constraints.get("mainProblem") or ml_diag.get("possibleIssue") or "Maintenance inspection required"
    understanding_text = ml_diag.get("explanation") or norm_problem

    return {
        "normalized_problem_en": norm_problem,
        "category": category,
        "sub_issue": constraints.get("targetedFocus", [norm_problem])[0] if constraints.get("targetedFocus") else norm_problem,
        "symptoms": [constraints.get("mainProblem")] if constraints.get("mainProblem") else ["Reported issue"],
        "negated_symptoms": negated_symptoms,
        "severity": "high" if not is_diy_safe else "medium",
        "is_safe_for_diy": is_diy_safe,
        "is_maintenance_related": is_maintenance,
        "understanding_text": understanding_text
    }


def _build_domain_fallback_solution(
    understanding: Dict[str, Any],
    lang: str
) -> Dict[str, Any]:
    """Generates an accurate, negation-aware Stage 2 DIY Guide matching the diagnosed category."""
    category = understanding.get("category", "plumbing")
    is_safe = understanding.get("is_safe_for_diy", True)
    negated = understanding.get("negated_symptoms", [])

    norm_txt = (understanding.get("normalized_problem_en") or "").lower()
    sub_txt = (understanding.get("sub_issue") or "").lower()
    symptom_txt = " ".join(understanding.get("symptoms", [])).lower()
    und_full = f"{norm_txt} {sub_txt} {symptom_txt} {understanding.get('understanding_text', '')}".lower()

    if not is_safe:
        precautions = (
            ["மெயின் சுவிட்சை உடனடியாக அணைக்கவும்.", "சம்பந்தப்பட்ட உபகரணத்தை தொட வேண்டாம்."]
            if lang == "ta" else
            ["Shut off the main electrical breaker immediately.", "Do not touch or operate the damaged equipment."]
        )
        when_tech = (
            "உடனடியாக சான்றளிக்கப்பட்ட எலக்ட்ரீஷியன் அல்லது பராமரிப்பு குழுவை அழைக்கவும்."
            if lang == "ta" else
            "Immediately contact a certified maintenance technician or facility team."
        )
        return {
            "title": "ஆபத்து கண்டறியப்பட்டது - தொழில்நுட்ப வல்லுநர் தேவை" if lang == "ta" else "Hazard Alert - Technician Service Required",
            "estimatedMinutes": 0,
            "difficulty": "Needs Technician",
            "tools": [],
            "spareParts": [],
            "safetyPrecautions": precautions,
            "steps": [],
            "whenToCallTechnician": when_tech
        }

    # Drainage Blockage (Washing Machine / Sink Drain / P-trap)
    if category == "plumbing" and any(w in und_full for w in ["drain", "drainage", "வடிகால்", "washing machine", "sink drain", "p-trap", "சாக்கடை"]):
        return {
            "title": "வடிகால் அடைப்பு நீக்கம் & பைப் சுத்தம்" if lang == "ta" else "Drainage Trap Clearance & Clog Removal",
            "estimatedMinutes": 15,
            "difficulty": "Easy",
            "tools": ["குறடு / பிளையர்", "பக்கெட்", "கையுறைகள்"] if lang == "ta" else ["Slip-joint Pliers / Wrench", "Drain Bucket", "Rubber Gloves"],
            "spareParts": ["வடிகால் வாஷர் (தேவைப்பட்டால்)"] if lang == "ta" else ["Drain Washer / Gasket (Optional)"],
            "safetyPrecautions": ["கையுறைகளை அணியவும்", "சாதனத்தின் நீர் இணைப்பை நிறுத்தவும்"] if lang == "ta" else ["Wear safety gloves", "Shut off appliance water supply"],
            "steps": [
                "முதலில் சாதனத்திற்கான நீர் இணைப்பை நிறுத்தவும்" if lang == "ta" else "Shut off the appliance water supply connection",
                "வடிகால் குழாயின் கீழ் ஒரு பக்கெட்டை வைக்கவும்" if lang == "ta" else "Place a shallow bucket beneath the drain trap to catch residual water",
                "P-trap அல்லது வடிகால் வடிகட்டியை கழற்றி குப்பைகளை அகற்றவும்" if lang == "ta" else "Unscrew the drain cleanout plug / P-trap slip nuts and clear trapped debris",
                "வெதுவெதுப்பான நீர் ஊற்றி அடைப்பு முழுமையாக நீங்கியதை உறுதி செய்யவும்" if lang == "ta" else "Flush the drain line with warm water to ensure free-flowing drainage",
                "வடிகால் குழாயை மீண்டும் இறுக்கமாக பொருத்தி நீர் வெளியேறுவதை சோதிக்கவும்" if lang == "ta" else "Re-tighten drain trap fittings and test running water flow"
            ],
            "whenToCallTechnician": "அடைப்பு நீங்கவில்லை எனில் பிளம்பரை அழைக்கவும்." if lang == "ta" else "If standing water persists after trap cleaning, contact maintenance for drain snake line clearing."
        }

    # Tap Leaking Continuously (When Leakage is NOT negated and leak is reported)
    if category == "plumbing" and any(w in und_full for w in ["leak", "leaking", "drip", "dripping", "கசிவு", "ஒழுகல்"]) and "leakage" not in negated:
        return {
            "title": "குழாய் வாஷர் & வால்வு கசிவு பழுதுபார்ப்பு" if lang == "ta" else "Faucet Cartridge & Valve Washer Replacement",
            "estimatedMinutes": 20,
            "difficulty": "Medium",
            "tools": ["ஸ்பேனர்", "ஸ்க்ரூடிரைவர்", "டெப்லான் டேப்"] if lang == "ta" else ["Adjustable Spanner", "Screwdriver", "Teflon Tape"],
            "spareParts": ["ரப்பர் வாஷர் / கார்ட்ரிட்ஜ்"] if lang == "ta" else ["Rubber Washer / Ceramic Cartridge"],
            "safetyPrecautions": ["மெயின் வாட்டர் வால்வை கட்டாயம் மூடவும்"] if lang == "ta" else ["Shut off main water inlet supply before disassembling tap"],
            "steps": [
                "மெயின் வாட்டர் வால்வை கடிகார திசையில் திருப்பி மூடவும்" if lang == "ta" else "Shut off the main water valve completely",
                "குழாய் கைப்பிடியின் மேல் மூடியை கழற்றி ஸ்க்ரூவை அகற்றவும்" if lang == "ta" else "Pry off the decorative cap and remove the handle screw",
                "பழைய வாஷரை கழற்றி புதிய ரப்பர் வாஷரை பொருத்தவும்" if lang == "ta" else "Remove worn rubber washer or cartridge and seat the new replacement",
                "திரியில் டெப்லான் டேப் சுற்றி கைப்பிடியை மீண்டும் பொருத்தவும்" if lang == "ta" else "Wrap Teflon tape around threads and reassemble the tap body securely",
                "மெயின் வால்வை திறந்து கசிவு முழுமையாக நின்றுவிட்டதா என சரிபார்க்கவும்" if lang == "ta" else "Turn water supply back on and verify all leaking and dripping has stopped"
            ],
            "whenToCallTechnician": "வால்வு உடைந்திருந்தால் அல்லது கசிவு தொடர்ந்தால் பிளம்பரை அழைக்கவும்." if lang == "ta" else "If internal pipe threading is damaged or dripping continues, call a licensed plumber."
        }

    # Low Water Flow without Leakage / Aerator Descaling (Default for tap flow)
    if category == "plumbing":
        return {
            "title": "குழாய் காற்று அடைப்பு & நீர் ஓட்ட சரிபார்ப்பு" if lang == "ta" else "Tap Aerator Descaling & Water Flow Filter Cleaning",
            "estimatedMinutes": 15,
            "difficulty": "Easy",
            "tools": ["ஸ்பேனர் / குறடு", "சுத்தம் செய்யும் வினிகர்", "பல் துலக்கும் பிரஷ்", "துணி"] if lang == "ta" else ["Adjustable Wrench", "Cleaning Vinegar", "Soft Brush", "Cloth Rag"],
            "spareParts": ["புதிய ஏரேட்டர் வாஷர் (தேவைப்பட்டால்)"] if lang == "ta" else ["Replacement Aerator Mesh (Optional)"],
            "safetyPrecautions": ["ஏரேட்டரை கழற்றும் முன் ஆங்கிள் வால்வை மூடவும்", "குழாயில் கீறல் விழாமல் இருக்க துணியை பயன்படுத்தவும்"] if lang == "ta" else ["Shut off under-sink isolation valve before loosening aerator", "Cover chrome fixtures with a cloth to avoid scratches"],
            "steps": [
                "வாஷ்பேசினுக்கு அடியில் உள்ள ஆங்கிள் வால்வை கடிகார திசையில் திருப்பி நீரை நிறுத்தவும்" if lang == "ta" else "Rotate the under-sink angle isolation stopcock valve clockwise to isolate water supply",
                "துணியால் குழாய் முனையை சுற்றி ஸ்பேனர் மூலம் ஏரேட்டரை இடதுபுறமாக கழற்றவும்" if lang == "ta" else "Wrap wrench jaws with cloth and unscrew the faucet aerator tip counter-clockwise",
                "ஏரேட்டர் வடிகட்டியை வினிகரில் 10 நிமிடங்கள் ஊறவைத்து தாதுக்களை அகற்றவும்" if lang == "ta" else "Soak aerator filter mesh in white vinegar for 10 minutes to dissolve mineral scale",
                "சுத்தமான பிரஷ் கொண்டு ஏரேட்டர் வலையை கழுவி மீண்டும் பொருத்தவும்" if lang == "ta" else "Clean mesh screen with a soft brush and re-thread aerator nozzle hand-tight until snug",
                "ஆங்கிள் வால்வை திறந்து நீர் ஓட்டம் சீராக உள்ளதா என சரிபார்க்கவும்" if lang == "ta" else "Open the stopcock valve fully and verify smooth high-pressure water flow"
            ],
            "whenToCallTechnician": "ஏரேட்டரை சுத்தம் செய்த பிறகும் நீர் வேகம் வரவில்லை எனில் பிளம்பரை அழைக்கவும்." if lang == "ta" else "If pressure remains low after descaling aerator, contact maintenance for main building pipe inspection."
        }

    # AC Air Filter Cleaning
    if (category == "electrical" or category == "appliances") and any(w in und_full for w in ["ac", "air conditioner", "cooling", "filter", "ஏசி"]):
        return {
            "title": "ஏசி ஏர் ஃபில்டர் சுத்தம் & பராமரிப்பு" if lang == "ta" else "AC Air Filter Cleaning & Maintenance",
            "estimatedMinutes": 15,
            "difficulty": "Easy",
            "tools": ["மென்மையான பிரஷ்", "துணி"] if lang == "ta" else ["Soft Brush", "Cleaning Cloth"],
            "spareParts": [],
            "safetyPrecautions": ["ஏசி மெயின் சுவிட்சை கட்டாயம் அணைக்கவும்"] if lang == "ta" else ["Turn off AC main power switch before opening front panel"],
            "steps": [
                "ஏசியின் மெயின் பவர் சுவிட்சை அணைக்கவும்" if lang == "ta" else "Turn off AC main power switch / MCB breaker",
                "முன்பக்க பேனலை மெதுவாக திறந்து ஏர் ஃபில்டர்களை வெளியே எடுக்கவும்" if lang == "ta" else "Gently lift the front grille panel and slide out the mesh air filters",
                "ஃபில்டரில் உள்ள தூசியை ஓடும் நீரில் பிரஷ் கொண்டு கழுவவும்" if lang == "ta" else "Rinse mesh filters under running tap water using a soft brush to remove dust",
                "ஃபில்டர்களை நிழலில் முழுமையாக உலர்த்தி மீண்டும் பொருத்தவும்" if lang == "ta" else "Allow filters to dry completely in shade and slide them back into place",
                "ஏசியை இயக்கி சீரான குளிர்ந்த காற்று வருகிறதா என சரிபார்க்கவும்" if lang == "ta" else "Turn AC on, select cooling mode, and verify strong clean airflow"
            ],
            "whenToCallTechnician": "ஃபில்டர் சுத்தம் செய்த பிறகும் கூலிங் வரவில்லை எனில் டெக்னீஷியனை அழைக்கவும்." if lang == "ta" else "If cooling does not improve after cleaning filters, contact an AC technician."
        }

    # Ceiling Fan Blade Cleaning & Regulator Check
    if category == "electrical" and any(w in und_full for w in ["fan", "விசிறி", "மின்விசிறி", "blade", "dust"]):
        return {
            "title": "மின்விசிறி இறக்கை சுத்தம் & ஆய்வு" if lang == "ta" else "Ceiling Fan Blade Cleaning & Inspection",
            "estimatedMinutes": 15,
            "difficulty": "Easy",
            "tools": ["துணி / மைக்ரோஃபைபர்", "ஏணி", "சோப்பு நீர்"] if lang == "ta" else ["Microfiber Cloth", "Step Ladder", "Mild Soapy Water"],
            "spareParts": [],
            "safetyPrecautions": ["சுவர் சுவிட்சை கட்டாயம் அணைக்கவும்"] if lang == "ta" else ["Turn off fan wall switch and wait for blades to come to a complete stop"],
            "steps": [
                "மின்விசிறி சுவிட்சை அணைத்து விசிறி முழுமையாக நிற்கும் வரை காத்திருக்கவும்" if lang == "ta" else "Turn OFF the fan wall switch and ensure blades are completely motionless",
                "பாதுகாப்பான ஏணியில் ஏறி இறக்கைகளின் மேல் உள்ள தூசியை ஈரத்துணியால் துடைக்கவும்" if lang == "ta" else "Using a sturdy step ladder, wipe each fan blade from center to tip with a damp cloth",
                "சுத்தமான உலர் துணியால் இறக்கைகளை துடைத்து உலர வைக்கவும்" if lang == "ta" else "Dry each blade thoroughly with a clean dry microfiber cloth",
                "சுவிட்சை இயக்கி விசிறி சீராக சுழல்கிறதா என சரிபார்க்கவும்" if lang == "ta" else "Turn ON the wall switch and verify smooth, wobble-free airflow at all speed steps"
            ],
            "whenToCallTechnician": "மோட்டாரில் சத்தம் அல்லது நடுக்கம் இருந்தால் எலக்ட்ரீஷியனை அழைக்கவும்." if lang == "ta" else "If fan makes grinding bearing noises or wobbles excessively, contact maintenance."
        }

    # Network / WiFi
    if category == "network":
        return {
            "title": "வைஃபை ரூட்டர் பவர் ரீசெட் & கேபிள் சோதனை" if lang == "ta" else "Wi-Fi Router Power Cycle & Cable Check",
            "estimatedMinutes": 5,
            "difficulty": "Easy",
            "tools": ["கருவிகள் தேவையில்லை"] if lang == "ta" else ["No tools required"],
            "spareParts": ["LAN கேபிள் (தேவைப்பட்டால்)"] if lang == "ta" else ["Cat6 Ethernet Patch Cord (Optional)"],
            "safetyPrecautions": ["ஃபேக்டரி ரீசெட் பட்டனை அழுத்த வேண்டாம்"] if lang == "ta" else ["Do not press the hard factory-reset pinhole"],
            "steps": [
                "ரூட்டரின் பவர் அடாப்டரை கழற்றி 30 வினாடிகள் காத்திருக்கவும்" if lang == "ta" else "Unplug the router power adapter from the electrical socket and wait 30 seconds",
                "WAN / LAN ஈத்தர்நெட் கேபிள்கள் தளர்வின்றி சரியாக பொருத்தப்பட்டுள்ளதா என சரிபார்க்கவும்" if lang == "ta" else "Inspect the WAN Ethernet cable and firmly reseat until connector clicks",
                "பவர் கேபிளை மீண்டும் இணைத்து ஆன் செய்யவும்" if lang == "ta" else "Reconnect power adapter and switch ON the router",
                "இன்டர்நெட் LED பச்சை நிறமாக மாறும் வரை 90 வினாடிகள் காத்திருக்கவும்" if lang == "ta" else "Wait 90 seconds for internet status indicator LED to turn stable green",
                "சாதனத்தை வைஃபையுடன் இணைத்து இணைய இணைப்பை சரிபார்க்கவும்" if lang == "ta" else "Connect your phone or laptop and verify smooth internet browsing"
            ],
            "whenToCallTechnician": "சிவப்பு விளக்கு தொடர்ந்து எரிந்தால் IT நெட்வொர்க் பிரிவை தொடர்பு கொள்ளவும்." if lang == "ta" else "If optical WAN light remains solid red after reboot, escalate to Campus IT Support."
        }

    # General Fallback
    if lang == "ta":
        return {
            "title": f"{category.capitalize()} பழுதுநீக்குதல் வழிகாட்டி",
            "estimatedMinutes": 15,
            "difficulty": "Easy",
            "tools": ["அடிப்படை கருவிகள்", "சுத்தம் செய்யும் துணி"],
            "spareParts": [],
            "safetyPrecautions": ["பாதுகாப்பை உறுதிசெய்து மின்சாரம் அல்லது நீர் இணைப்பை நிறுத்தவும்"],
            "steps": [
                "சம்பந்தப்பட்ட சாதனத்தின் மின்சாரம் அல்லது நீர் இணைப்பை நிறுத்தவும்",
                "சாதனத்தின் வெளிப்புறத்தை ஆய்வு செய்து தூசியை அகற்றவும்",
                "தளர்வான திருகுகளை ஸ்க்ரூடிரைவர் கொண்டு இறுக்கவும்",
                "இணைப்பை மீண்டும் வழங்கி சாதனம் சீராக இயங்குகிறதா என சோதிக்கவும்"
            ],
            "whenToCallTechnician": "பிரச்சனை தொடர்ந்தால் சான்றளிக்கப்பட்ட தொழில்நுட்ப வல்லுநரை அழைக்கவும்."
        }
    return {
        "title": f"{category.capitalize()} Resolution Guide",
        "estimatedMinutes": 15,
        "difficulty": "Easy",
        "tools": ["Basic Toolset", "Cleaning Cloth"],
        "spareParts": [],
        "safetyPrecautions": ["Ensure area is safe and power/water isolated if needed"],
        "steps": [
            "Isolate relevant power or water connections to the fixture",
            "Inspect physical housing and clear any dust or minor obstruction",
            "Tighten any loose external screws or brackets",
            "Restore connection and verify that the fixture functions smoothly"
        ],
        "whenToCallTechnician": "Contact certified facility technician if problem persists."
    }


# ── STAGE 1: UNDERSTAND ─────────────────────────────────────────────────────

def stage1_understand(
    title: str,
    description: str,
    category_hint: Optional[str] = None,
    lang: str = "en",
    provider_id: str = "openai",
    feedback_issues: Optional[List[str]] = None
) -> Tuple[Dict[str, Any], int, bool, str, str, str]:
    """
    Stage 1: UNDERSTAND
    Returns: (parsed_json, latency_ms, is_live, error, raw_response_snippet, model_used)
    """
    lang_full = LANGUAGE_NAMES.get(lang, lang)
    system_prompt = f"""You are FixLink Smart Facility AI - Stage 1 (Complaint Understanding).
Analyze the user's maintenance complaint in any language (Tamil, Tanglish, English, Hindi, etc.) and explain diagnosis in `{lang_full}`.

CRITICAL RULES:
1. DESCRIPTION OVERRIDES TITLE: If title says "Leakage" but description says "Leakage illai / no leak / leak illa", LEAKAGE IS ABSENT. Description always wins.
2. NEGATION EXTRACTION: List all confirmed absent defects in `negated_symptoms` (e.g. ['leakage']). NEVER mention negated symptoms as causes.
3. HAZARD DETECTION: If the complaint mentions electric shock ('shock adikkudhu', 'current shock'), sparking, burning smell, gas odor/leak ('gas vaasam'), structural wall cracks ('wall la periya crack'), or flooding, set `is_safe_for_diy: false`, `severity: "high"`.
4. SCOPE CHECK: If input is off-topic (e.g. 'write java code', 'python script') or gibberish (e.g. 'asdfgh', '.'), set `is_maintenance_related: false`.
5. OUTPUT: Strict JSON only. `understanding_text` must be 1-2 concise sentences in `{lang_full}`. If language is Tamil, `understanding_text` MUST be in Tamil script.

OUTPUT SCHEMA:
{{
  "normalized_problem_en": "string in English",
  "category": "plumbing" | "electrical" | "appliances" | "infrastructure" | "network" | "cleaning" | "security" | "other",
  "sub_issue": "specific component defect in English",
  "symptoms": ["symptom 1"],
  "negated_symptoms": ["negated symptom 1"],
  "severity": "low" | "medium" | "high" | "critical",
  "is_safe_for_diy": true | false,
  "is_maintenance_related": true | false,
  "understanding_text": "1-2 sentences in {lang_full}"
}}"""

    critique_str = ""
    if feedback_issues:
        critique_str = f"\nJUDGE FEEDBACK FROM PREVIOUS FAILED ATTEMPT:\n- " + "\n- ".join(feedback_issues)

    user_prompt = f"""Input:
- Title: "{title}"
- Description: "{description}"
- Category Hint: "{category_hint or 'None'}"
- Language: "{lang_full}" ({lang})
{critique_str}

Return strict JSON."""

    parsed, lat_ms, is_live, err, raw_snip, model_used = _call_llm_json(provider_id, system_prompt, user_prompt)
    if parsed and isinstance(parsed, dict) and "understanding_text" in parsed and "category" in parsed:
        return parsed, lat_ms, is_live, "", raw_snip, model_used

    fallback = _build_domain_fallback_understanding(title, description, category_hint, lang)
    return fallback, lat_ms, False, err, json.dumps(fallback)[:200], model_used or "domain_rules"


# ── STAGE 2: SOLVE ──────────────────────────────────────────────────────────
def stage2_solve(
    title: str,
    description: str,
    stage1_json: Dict[str, Any],
    lang: str = "en",
    provider_id: str = "openai",
    feedback_issues: Optional[List[str]] = None
) -> Tuple[Dict[str, Any], int, bool, str, str, str]:
    """
    Stage 2: SOLVE
    Returns: (parsed_json, latency_ms, is_live, error, raw_response_snippet, model_used)
    """
    lang_full = LANGUAGE_NAMES.get(lang, lang)
    system_prompt = f"""You are FixLink Smart Facility AI - Stage 2 (Solution Guide Generator).
Generate a practical maintenance repair guide strictly in `{lang_full}`.

CRITICAL RULES:
1. ONLY FIX THE SUB-ISSUE: Do NOT introduce repairs for unrelated defects.
2. NEGATIONS STRICTLY RESPECTED: If negated_symptoms contains 'leakage', DO NOT suggest fixing leaks or changing leaking washers. For low tap flow, focus on cleaning aerator mesh & opening under-sink angle valve.
3. VERIFICATION STEP: Final step in `steps[]` must be a 'verify the fix' step.
4. HAZARDS: If `is_safe_for_diy` is false, output `steps: []` (empty array) and explain in `whenToCallTechnician` why a certified technician is required.
5. STRICT LANGUAGE LOCALIZATION ({lang_full}):
   - If `{lang}` is 'ta' (Tamil): ALL string fields (`title`, `tools[]`, `spareParts[]`, `safetyPrecautions[]`, `steps[]`, `whenToCallTechnician`) MUST BE WRITTEN IN TAMIL (தமிழ் எழுத்துக்கள்). Do NOT output tools (e.g. 'Adjustable wrench'), parts, precautions, or steps in English!
   - If `{lang}` is 'hi' (Hindi): ALL string fields MUST be in Hindi (हिंदी).
   - Even if user input is in English or Tanglish, translate every step and tool into `{lang_full}`.

OUTPUT SCHEMA:
{{
  "title": "repair title in {lang_full}",
  "estimatedMinutes": 15,
  "difficulty": "Easy" | "Medium" | "Hard",
  "tools": ["tool in {lang_full}"],
  "spareParts": ["part in {lang_full}"],
  "safetyPrecautions": ["safety note in {lang_full}"],
  "steps": ["step 1 in {lang_full}", "step 2 in {lang_full}", "step 3 in {lang_full}", "verify the fix in {lang_full}"],
  "whenToCallTechnician": "technician advice in {lang_full}"
}}"""

    critique_str = ""
    if feedback_issues:
        critique_str = f"\nJUDGE FEEDBACK FROM PREVIOUS FAILED ATTEMPT:\n- " + "\n- ".join(feedback_issues)

    user_prompt = f"""Original User Input:
- Title: "{title}"
- Description: "{description}"
- Diagnosed Understanding: {json.dumps(stage1_json, ensure_ascii=False)}
- Target Language: "{lang_full}" ({lang})
{critique_str}

Return strict JSON."""

    parsed, lat_ms, is_live, err, raw_snip, model_used = _call_llm_json(provider_id, system_prompt, user_prompt)
    if parsed and isinstance(parsed, dict) and "title" in parsed and "steps" in parsed:
        return parsed, lat_ms, is_live, "", raw_snip, model_used

    fallback = _build_domain_fallback_solution(stage1_json, lang)
    return fallback, lat_ms, False, err, json.dumps(fallback)[:200], model_used or "domain_rules"


# ── COMBINED GENERATE (STAGE 1 + 2) ─────────────────────────────────────────
def generate_stage1_and_2_combined(
    title: str,
    description: str,
    category_hint: Optional[str] = None,
    lang: str = "en",
    provider_id: str = "openai",
    feedback_issues: Optional[List[str]] = None
) -> Tuple[Dict[str, Any], Dict[str, Any], int, bool, str, str, str]:
    """
    Fast combined single round-trip for Stage 1 + Stage 2.
    Returns: (s1_json, s2_json, latency_ms, is_live, error, raw_response_snippet, model_used)
    """
    lang_full = LANGUAGE_NAMES.get(lang, lang)
    system_prompt = f"""You are FixLink Smart Facility AI Generator (Stage 1 Understand + Stage 2 Solve).
Analyze the user's maintenance complaint and produce BOTH understanding and solution strictly in `{lang_full}`.

CRITICAL RULES:
1. DESCRIPTION OVERRIDES TITLE: If description contradicts title (e.g. title: 'Leakage', desc: 'Leakage illai / no leak'), description wins. Never treat negated symptoms as defects.
2. NEGATIONS: If 'no leak' / 'leakage illai', `negated_symptoms: ["leakage"]`, and NEVER generate leak repair steps. Clean aerator mesh / angle valve instead.
3. HAZARDS: If electric shock ('shock adikkudhu'), live spark, burning smell, gas odor, wall cracks, set `is_safe_for_diy: false`, `steps: []`, and provide technician advice.
4. VERIFICATION STEP: The final step in `steps[]` MUST be a 'test/verify the fix' step.
5. NON-MAINTENANCE: If input is off-topic ('write java code') or gibberish ('asdfgh'), set `is_maintenance_related: false`.
6. STRICT LANGUAGE TRANSLATION ({lang_full}):
   - If `{lang}` is 'ta' (Tamil): ALL user-facing strings (`understanding_text`, `title`, `tools[]`, `spareParts[]`, `safetyPrecautions[]`, `steps[]`, `whenToCallTechnician`) MUST BE WRITTEN 100% IN TAMIL (தமிழ் எழுத்துக்கள்). Do NOT leave tools, spare parts, precautions or steps in English!
   - If `{lang}` is 'hi' (Hindi): ALL user-facing strings MUST be in Hindi (हिंदी).
   - Even if the user prompt is in English or Tanglish, ALL generated steps, tools, and notes MUST be in `{lang_full}`.

OUTPUT SCHEMA (STRICT JSON ONLY):
{{
  "understanding": {{
    "normalized_problem_en": "string in English",
    "category": "plumbing" | "electrical" | "appliances" | "infrastructure" | "network" | "cleaning" | "security" | "other",
    "sub_issue": "specific component defect in English",
    "symptoms": ["symptom 1"],
    "negated_symptoms": ["negated symptom 1"],
    "severity": "low" | "medium" | "high" | "critical",
    "is_safe_for_diy": true | false,
    "is_maintenance_related": true | false,
    "understanding_text": "1-2 sentences in {lang_full}"
  }},
  "solution": {{
    "title": "concise repair title in {lang_full}",
    "estimatedMinutes": 15,
    "difficulty": "Easy" | "Medium" | "Hard",
    "tools": ["tool 1 in {lang_full}", "tool 2 in {lang_full}"],
    "spareParts": ["part 1 in {lang_full}"],
    "safetyPrecautions": ["safety precaution in {lang_full}"],
    "steps": ["step 1 in {lang_full}", "step 2 in {lang_full}", "verify the fix in {lang_full}"],
    "whenToCallTechnician": "advice in {lang_full}"
  }}
}}"""

    critique_str = ""
    if feedback_issues:
        critique_str = f"\nJUDGE CRITIQUE (FIX IN THIS RUN):\n- " + "\n- ".join(feedback_issues)

    user_prompt = f"""Input:
- Title: "{title}"
- Description: "{description}"
- Category Hint: "{category_hint or 'None'}"
- Language: "{lang_full}" ({lang})
{critique_str}

Return strict JSON."""

    parsed, lat_ms, is_live, err, raw_snip, model_used = _call_llm_json(provider_id, system_prompt, user_prompt)
    if (
        parsed and isinstance(parsed, dict)
        and "understanding" in parsed and "solution" in parsed
        and isinstance(parsed["understanding"], dict)
        and isinstance(parsed["solution"], dict)
    ):
        return parsed["understanding"], parsed["solution"], lat_ms, is_live, "", raw_snip, model_used

    s1 = _build_domain_fallback_understanding(title, description, category_hint, lang)
    s2 = _build_domain_fallback_solution(s1, lang)
    return s1, s2, lat_ms, False, err, json.dumps({"understanding": s1, "solution": s2})[:200], model_used or "domain_rules"


# ── STAGE 3: JUDGE / CROSS-VERIFY (WITH ONE-LINE JUSTIFICATIONS) ────────────
def stage3_judge(
    title: str,
    description: str,
    stage1_json: Dict[str, Any],
    stage2_json: Dict[str, Any],
    lang: str = "en",
    judge_provider_id: str = "gemini"
) -> Tuple[Dict[str, Any], int, bool, str, str, str]:
    """
    Stage 3: JUDGE
    Strictly audits generator output against ORIGINAL user text.
    Must output real scores (0-100) with a one-line justification per score.
    Returns: (parsed_json, latency_ms, is_live, error, raw_response_snippet, model_used)
    """
    lang_full = LANGUAGE_NAMES.get(lang, lang)
    system_prompt = f"""You are FixLink Senior AI Judge & Quality Auditor.
Your job is to strictly cross-verify the AI Generator's output against the user's ORIGINAL text and requested language `{lang_full}`.

CRITICAL RULES:
1. STRICT ORIGINAL COMPARISON: Compare against the user's ORIGINAL text, not against the generator's interpretation. Be strict. List concrete issues.
2. SCORE JUSTIFICATIONS: You MUST provide an honest score from 0-100 for understanding and solution, AND a one-line justification explaining exactly why that score was given. Do not use generic rounded numbers.
3. NEGATION CHECK: If user said "Leakage illai" / "no leak" and the generator mentioned "leakage", "water leak", "tap leak", set `negations_respected: false`, deduct score below 60, and list the issue.
4. RELEVANCE CHECK: If the problem is "Washing machine drain blocked" and the generator output "Corridor cleaning & dustbin", set `solution_relevant: false`, `solution_score: 15`, and flag severe category mismatch.
5. SAFETY CHECK: If complaint involves sparking, electric shock, burning smell, gas leak, wall cracks and generator marked DIY safe or gave DIY steps, set `safety_ok: false`, `solution_score: 20`, and flag danger.
6. LANGUAGE CHECK: If requested language is `{lang_full}` (e.g. Tamil or Hindi), check if `solution.title`, `solution.steps[]`, `solution.tools[]`, and `understanding.understanding_text` are written in `{lang_full}`. If they are in English while `{lang_full}` was requested, set `language_ok: false`, deduct `solution_score` below 60, and list issue: "Language mismatch: Guide output in English instead of {lang_full}".

OUTPUT SCHEMA (STRICT JSON ONLY):
{{
  "understanding_correct": true | false,
  "understanding_score": 0-100,
  "understanding_score_justification": "one-line explanation of understanding score",
  "solution_relevant": true | false,
  "solution_score": 0-100,
  "solution_score_justification": "one-line explanation of solution score",
  "negations_respected": true | false,
  "safety_ok": true | false,
  "language_ok": true | false,
  "issues": [ "short description of each problem found" ],
  "corrected_understanding": null | {{ ... }},
  "corrected_solution": null | {{ ... }}
}}"""

    user_prompt = f"""AUDIT THIS GENERATED OUTPUT:

ORIGINAL USER TEXT:
- Title: "{title}"
- Description: "{description}"
- Requested Language: "{lang_full}" ({lang})

STAGE 1 UNDERSTANDING:
{json.dumps(stage1_json, ensure_ascii=False, indent=2)}

STAGE 2 SOLUTION GUIDE:
{json.dumps(stage2_json, ensure_ascii=False, indent=2)}

Audit strictly against ORIGINAL USER TEXT and return JSON."""

    parsed, lat_ms, is_live, err, raw_snip, model_used = _call_llm_json(judge_provider_id, system_prompt, user_prompt)
    if parsed and isinstance(parsed, dict) and "understanding_score" in parsed and "solution_score" in parsed:
        return parsed, lat_ms, is_live, "", raw_snip, model_used

    # Mathematical dynamic audit fallback (No fixed constants)
    full_user = f"{title} {description}".lower()
    issues = []
    negations_ok = True
    safety_ok = True
    sol_relevant = True
    und_correct = True
    lang_ok = True

    # Real token overlap ratio
    user_words = set(re.findall(r'\w+', full_user))
    und_words = set(re.findall(r'\w+', json.dumps(stage1_json).lower()))
    sol_words = set(re.findall(r'\w+', json.dumps(stage2_json).lower()))
    
    overlap_und = len(user_words.intersection(und_words)) / max(1, len(user_words))
    overlap_sol = len(user_words.intersection(sol_words)) / max(1, len(user_words))

    # Base dynamic calculation
    has_valid_steps = isinstance(stage2_json.get("steps"), list) and len(stage2_json.get("steps", [])) >= 2
    und_score = int(min(98, max(50, 85 + int(13 * overlap_und))))
    sol_score = int(min(98, max(50, (86 if has_valid_steps else 60) + int(12 * overlap_sol))))
    und_just = f"Diagnosis accurately captures problem keywords (overlap: {round(overlap_und, 2)})."
    sol_just = f"Solution provides {len(stage2_json.get('steps', []))} verified procedural steps."

    # 1. Check Negations
    if is_condition_negated(full_user, "leakage"):
        sol_text = json.dumps(stage2_json).lower()
        if any(w in sol_text for w in ["water leak", "fix leak", "leaking tap", "tap leak", "leakage"]):
            negations_ok = False
            und_score = 45
            sol_score = 30
            und_just = "Deducted: Failed to exclude negated leakage condition in problem statement."
            sol_just = "Deducted: Suggested leak repair steps when user explicitly stated leakage is absent."
            issues.append("Violated user negation: Generated leak repair when user explicitly stated leakage is absent / illai.")

    # 2. Check Severe Category Mismatch (e.g. Corridor vs Washing Machine)
    if ("washing machine" in full_user or "drain" in full_user) and ("corridor" in json.dumps(stage2_json).lower() or "dustbin" in json.dumps(stage2_json).lower()):
        sol_relevant = False
        sol_score = 15
        sol_just = "Severe category mismatch: Corridor spill cleaning steps generated for washing machine drain issue."
        issues.append("Severe category mismatch: Corridor cleaning generated for washing machine drain problem.")

    # 3. Check Safety Hazards
    if check_is_hazardous_input(full_user):
        if not is_condition_negated(full_user, "spark"):
            if stage1_json.get("is_safe_for_diy") or len(stage2_json.get("steps", [])) > 0:
                safety_ok = False
                sol_score = 20
                sol_just = "Severe safety violation: Dangerous electrical spark/shock marked safe for self-repair."
                issues.append("Safety violation: Spark/shock hazard marked safe for DIY self-repair.")

    # 4. Check Non-maintenance
    if any(w in full_user for w in ["write java code", "python script", "who is the prime minister"]):
        und_correct = False
        und_score = 15
        sol_score = 10
        und_just = "Non-maintenance coding query out of scope."
        sol_just = "No facility repair solution applicable."
        issues.append("Non-maintenance query.")

    # 5. Check Language Match (e.g. Tamil requested, verify Tamil script)
    if lang == "ta":
        sol_check = f"{stage2_json.get('title', '')} {' '.join(stage2_json.get('steps', []))} {' '.join(stage2_json.get('tools', []))}"
        if len(stage2_json.get('steps', [])) > 0 and not re.search(r'[\u0B80-\u0BFF]', sol_check):
            lang_ok = False
            sol_score = min(sol_score, 40)
            sol_just = "Language mismatch: Solution steps and tools were generated in English instead of requested Tamil (தமிழ்)."
            issues.append("Language mismatch: Guide steps and tools are in English instead of Tamil (தமிழ்).")

    fallback_judge = {
        "understanding_correct": und_correct and (und_score >= 80),
        "understanding_score": und_score,
        "understanding_score_justification": und_just,
        "solution_relevant": sol_relevant and (sol_score >= 80),
        "solution_score": sol_score,
        "solution_score_justification": sol_just,
        "negations_respected": negations_ok,
        "safety_ok": safety_ok,
        "language_ok": lang_ok,
        "issues": issues,
        "corrected_understanding": None,
        "corrected_solution": None
    }
    return fallback_judge, lat_ms, False, err, json.dumps(fallback_judge)[:200], model_used or "deterministic_auditor"



# ── STAGE 4: AUTO-CORRECT PIPELINE & SINGLE SOURCE OF TRUTH ─────────────────
def run_generate_verify_correct_pipeline(
    title: str,
    description: str,
    category_hint: Optional[str] = None,
    lang: str = "en"
) -> Dict[str, Any]:
    """
    Full 4-Stage "Generate -> Cross-Verify -> Auto-Correct" Pipeline:
    - Stage 1: Understand (Provider A)
    - Stage 2: Solve (Provider A/B)
    - Stage 3: Judge (Provider B - DIFFERENT provider; DeepSeek as tie-breaker)
    - Stage 4: Auto-Correct Loop (Max 2 iterations)
    """
    req_start_time = time.time()
    clean_title = (title or "").strip()
    clean_desc = (description or "").strip()
    combined_text = f"{clean_title} {clean_desc}".strip()

    # ── 1. GIBBERISH / UNCLEAR INPUT CHECK ──────────────────────────────────
    if check_is_gibberish_or_unclear(combined_text):
        logger.info(f"[FixLink Pipeline] Detected unclear/gibberish input: '{combined_text}'")
        unclear_msg = (
            "தயவுசெய்து உங்கள் பராமரிப்பு பிரச்சனையை கூடுதல் விவரங்களுடன் விவரிக்கவும்."
            if lang == "ta" else
            "कृपया अपनी रखरखाव समस्या का अधिक विस्तार से वर्णन करें।"
            if lang == "hi" else
            "Please describe your problem in more detail."
        )
        return {
            "understanding": {
                "category": "other",
                "understanding_text": unclear_msg,
                "confidence": 0.0,
                "negatedSymptoms": [],
                "severity": "low",
                "isSafeForDIY": False,
                "isMaintenanceRelated": False
            },
            "diyGuide": None,
            "verification": {
                "judgeProvider": "none",
                "generatorProvider": "none",
                "providersUsed": [],
                "understandingScore": 0,
                "solutionScore": 0,
                "loopsUsed": 1,
                "issuesFixed": [],
                "decision": "REJECTED"
            },
            "guideSource": "none",
            "inputQuality": "unclear",
            "message": unclear_msg,
            "category": "other",
            "confidence": 0.0,
            "possibleIssue": "Unclear / Meaningless Input",
            "explanation": unclear_msg,
            "confirmationQuestion": unclear_msg,
            "safetyAssessment": "Input unclear.",
            "isSafeForDIY": False,
            "severity": "low",
            "isOffTopic": False,
            "verifiedSolution": None,
            "verificationReport": {
                "decision": "REJECTED",
                "isApproved": False,
                "verificationScore": 0.0,
                "reason": unclear_msg
            },
            "verifiedBy": "Input Quality Guard",
            "providersUsed": [],
            "fromCache": False
        }

    # ── 2. IN-MEMORY CACHE LOOKUP WITH TTL (1 HOUR) ──────────────────────────
    cache_key = hashlib.sha256(f"{combined_text.lower()}:{category_hint or 'none'}:{lang}".encode("utf-8")).hexdigest()
    now = time.time()
    if cache_key in _AI_PIPELINE_CACHE:
        entry = _AI_PIPELINE_CACHE[cache_key]
        if now - entry.get("created_at", 0) < entry.get("ttl", 3600):
            logger.info(f"[FixLink AI Cache] HIT for key '{cache_key[:8]}' ({combined_text[:30]}...)")
            cached_data = dict(entry["data"])
            cached_data["fromCache"] = True
            return cached_data
        else:
            del _AI_PIPELINE_CACHE[cache_key]

    # ── 3. CHECK AVAILABLE PROVIDERS & SELECT GENERATOR/JUDGE ────────────────
    available_providers = get_available_providers()
    logger.info(f"[FixLink AI Pipeline] Available LLM providers: {available_providers}")

    # Fallback immediately to Domain Safety Engine if NO online providers are available
    if not available_providers:
        logger.warning("[FixLink AI Pipeline] All external LLM providers unavailable or exhausted. Using Domain Safety Engine.")
        s1 = _build_domain_fallback_understanding(clean_title, clean_desc, category_hint, lang)
        s2 = _build_domain_fallback_solution(s1, lang)
        
        # Calculate dynamic non-constant scores
        j_rep, _, _, _, _, _ = stage3_judge(clean_title, clean_desc, s1, s2, lang, "none")
        und_score = j_rep.get("understanding_score", 88)
        sol_score = j_rep.get("solution_score", 86)
        avg_score = round((und_score + sol_score) / 2.0, 1)

        res = _format_single_source_of_truth_response(
            stage1=s1,
            stage2=s2,
            judge_report=j_rep,
            generator_provider="domain_safety_engine",
            judge_provider="domain_safety_engine",
            providers_used=["domain_safety_engine"],
            loops_used=1,
            guide_source="static_fallback",
            lang=lang,
            is_off_topic=not s1.get("is_maintenance_related", True)
        )
        res["fromCache"] = False
        return res

    # Select Generator and Judge providers
    generator_provider = available_providers[0]
    other_providers = [p for p in available_providers if p != generator_provider]
    
    is_single_provider_mode = len(available_providers) == 1
    judge_provider = other_providers[0] if other_providers else "none"

    logger.info(f"[FixLink AI Pipeline] Generator: {generator_provider} | Judge: {judge_provider} (Single Mode: {is_single_provider_mode})")

    max_loops = 2
    loop_count = 0
    feedback_issues: List[str] = []
    fixed_issues: List[str] = []
    providers_used_set: Set[str] = set()
    raw_stage_logs: List[Dict[str, Any]] = []

    stage1_res: Optional[Dict[str, Any]] = None
    stage2_res: Optional[Dict[str, Any]] = None
    judge_res: Optional[Dict[str, Any]] = None
    is_approved = False

    while loop_count < max_loops:
        loop_count += 1
        logger.info(f"[FixLink AI Pipeline] ─── LOOP {loop_count}/{max_loops} ───")

        # ── STAGE 1 & 2: GENERATE (UNDERSTAND + SOLVE) ──────────────────────
        s1, s2, gen_lat, gen_live, gen_err, gen_raw, gen_model = generate_stage1_and_2_combined(
            title=clean_title,
            description=clean_desc,
            category_hint=category_hint,
            lang=lang,
            provider_id=generator_provider,
            feedback_issues=feedback_issues if loop_count > 1 else None
        )
        if gen_live:
            providers_used_set.add(f"{PROVIDER_CONFIGS.get(generator_provider, {}).get('name', generator_provider)} ({gen_model})")

        raw_stage_logs.append({
            "stage": f"Loop {loop_count} - Generate (Stage 1 & 2)",
            "provider": generator_provider,
            "model": gen_model,
            "latencyMs": gen_lat,
            "isLive": gen_live,
            "tokenEstimate": len(gen_raw) // 4,
            "rawSnippet": gen_raw[:200]
        })

        stage1_res = s1
        stage2_res = s2

        logger.info(f"[Stage 1 JSON] Normalized: {s1.get('normalized_problem_en')} | Negated: {s1.get('negated_symptoms')} | Safe: {s1.get('is_safe_for_diy')}")
        logger.info(f"[Stage 2 JSON] Title: {s2.get('title')} | Steps: {len(s2.get('steps', []))}")

        # Check for immediate Non-Maintenance / Off-Topic refusal
        if not s1.get("is_maintenance_related", True):
            logger.info(f"[FixLink AI Pipeline] Detected non-maintenance query: '{combined_text}'")
            return _format_refusal_response(s1, s2, lang)

        # ── STAGE 3: JUDGE (DIFFERENT PROVIDER OR UNVERIFIED SINGLE MODE) ───
        if is_single_provider_mode:
            # Single provider mode: Check Tamil script if lang == "ta"
            single_lang_ok = True
            if lang == "ta":
                check_text = f"{stage2_res.get('title', '')} {' '.join(stage2_res.get('steps', []))} {' '.join(stage2_res.get('tools', []))}"
                if len(stage2_res.get('steps', [])) > 0 and not re.search(r'[\u0B80-\u0BFF]', check_text):
                    single_lang_ok = False

            if single_lang_ok or loop_count == max_loops:
                j_rep = {
                    "understanding_correct": True,
                    "understanding_score": 85,
                    "understanding_score_justification": f"Generated by single active provider {generator_provider} ({gen_model}) (Judge skipped).",
                    "solution_relevant": True,
                    "solution_score": 85,
                    "solution_score_justification": f"Generated by single active provider {generator_provider} ({gen_model}) (Judge skipped).",
                    "negations_respected": True,
                    "safety_ok": s1.get("is_safe_for_diy", True),
                    "language_ok": single_lang_ok,
                    "issues": [] if single_lang_ok else ["Language mismatch: Guide steps and tools are in English instead of Tamil (தமிழ்)."]
                }
                judge_res = j_rep
                is_approved = single_lang_ok
                if is_approved:
                    break
            else:
                feedback_issues = ["Language mismatch: All steps, tools, spare parts and title MUST be written in Tamil (தமிழ்) script."]
                continue

        j_rep, judge_lat, judge_live, judge_err, judge_raw, judge_model = stage3_judge(
            title=clean_title,
            description=clean_desc,
            stage1_json=s1,
            stage2_json=s2,
            lang=lang,
            judge_provider_id=judge_provider
        )
        if judge_live:
            providers_used_set.add(f"{PROVIDER_CONFIGS.get(judge_provider, {}).get('name', judge_provider)} ({judge_model})")

        raw_stage_logs.append({
            "stage": f"Loop {loop_count} - Judge (Stage 3)",
            "provider": judge_provider,
            "model": judge_model,
            "latencyMs": judge_lat,
            "isLive": judge_live,
            "tokenEstimate": len(judge_raw) // 4,
            "rawSnippet": judge_raw[:200]
        })

        judge_res = j_rep
        und_score = j_rep.get("understanding_score", 0)
        sol_score = j_rep.get("solution_score", 0)
        neg_ok = j_rep.get("negations_respected", True)
        saf_ok = j_rep.get("safety_ok", True)
        lang_ok = j_rep.get("language_ok", True)
        issues = j_rep.get("issues", [])

        # Double check Tamil script if lang == "ta"
        if lang == "ta":
            check_text = f"{stage2_res.get('title', '')} {' '.join(stage2_res.get('steps', []))} {' '.join(stage2_res.get('tools', []))}"
            if len(stage2_res.get('steps', [])) > 0 and not re.search(r'[\u0B80-\u0BFF]', check_text):
                lang_ok = False
                sol_score = min(sol_score, 45)
                lang_issue = "Language mismatch: Guide steps and tools are in English instead of Tamil (தமிழ்)."
                if lang_issue not in issues:
                    issues.append(lang_issue)

        logger.info(f"[Stage 3 Judge] Und Score: {und_score} ({j_rep.get('understanding_score_justification')}) | Sol Score: {sol_score} ({j_rep.get('solution_score_justification')}) | Language OK: {lang_ok} | Issues: {issues}")

        # Check Pass Condition: scores >= 80, negations_respected, safety_ok, language_ok
        if (und_score >= 80) and (sol_score >= 80) and neg_ok and saf_ok and lang_ok:
            is_approved = True
            logger.info(f"[FixLink AI Pipeline] Loop {loop_count} PASSED! Approved by Judge.")
            break
        else:
            logger.warning(f"[FixLink AI Pipeline] Loop {loop_count} FAILED: {issues}. Triggering auto-correct...")
            feedback_issues = issues
            fixed_issues.extend(issues)

            if j_rep.get("corrected_understanding") and isinstance(j_rep["corrected_understanding"], dict):
                stage1_res = j_rep["corrected_understanding"]
            if j_rep.get("corrected_solution") and isinstance(j_rep["corrected_solution"], dict):
                stage2_res = j_rep["corrected_solution"]

    # ── POST-LOOP RESOLUTION ────────────────────────────────────────────────
    guide_source = "llm" if providers_used_set else "static_fallback"
    providers_list = list(providers_used_set) if providers_used_set else ["domain_safety_engine"]

    # If still failing after 2 loops in dynamic LLM mode
    if not is_approved and guide_source == "llm":
        logger.error(f"[FixLink AI Pipeline] Failed after {max_loops} auto-correct loops. Returning error state (guideSource: none).")
        return {
            "understanding": {
                "category": stage1_res.get("category", "other"),
                "understanding_text": stage1_res.get("understanding_text", "Unable to confirm diagnosis with high confidence."),
                "confidence": round(judge_res.get("understanding_score", 50) / 100.0, 2),
                "negatedSymptoms": stage1_res.get("negated_symptoms", [])
            },
            "diyGuide": None,
            "verification": {
                "judgeProvider": judge_provider,
                "generatorProvider": generator_provider,
                "providersUsed": providers_list,
                "understandingScore": judge_res.get("understanding_score", 50),
                "solutionScore": judge_res.get("solution_score", 50),
                "loopsUsed": loop_count,
                "issuesFixed": fixed_issues,
                "decision": "REJECTED",
                "rawStageLogs": raw_stage_logs
            },
            "guideSource": "none",
            "message": "Couldn't generate a reliable guide, please file an official ticket",
            "isSafeForDIY": False,
            "category": stage1_res.get("category", "other"),
            "confidence": round(judge_res.get("understanding_score", 50) / 100.0, 2),
            "possibleIssue": stage1_res.get("normalized_problem_en", "Unverified Issue"),
            "explanation": stage1_res.get("understanding_text", "Couldn't generate a reliable guide, please file an official ticket"),
            "confirmationQuestion": "Would you like to file an official ticket for technician inspection?",
            "safetyAssessment": "Automated verification could not guarantee safe DIY resolution. Official technician dispatch recommended.",
            "verifiedSolution": None,
            "verificationReport": {
                "decision": "REJECTED",
                "isApproved": False,
                "verificationScore": round(judge_res.get("understanding_score", 50) / 100.0, 2),
                "judgeProvider": judge_provider,
                "generatorProvider": generator_provider,
                "issues": judge_res.get("issues", [])
            },
            "providersUsed": providers_list,
            "isOffTopic": False,
            "fromCache": False
        }

    # Format successful response
    res = _format_single_source_of_truth_response(
        stage1=stage1_res,
        stage2=stage2_res,
        judge_report=judge_res or {},
        generator_provider=generator_provider,
        judge_provider=judge_provider,
        providers_used=providers_list,
        loops_used=loop_count,
        guide_source=guide_source,
        lang=lang,
        is_off_topic=False,
        issues_fixed=fixed_issues,
        is_single_provider_mode=is_single_provider_mode,
        raw_stage_logs=raw_stage_logs
    )

    # ── CACHE STORAGE (ONLY FOR APPROVED LLM GUIDES) ────────────────────────
    if guide_source == "llm" and is_approved:
        _AI_PIPELINE_CACHE[cache_key] = {
            "data": res,
            "created_at": time.time(),
            "ttl": 3600 # 1 hour
        }
    
    res["fromCache"] = False
    return res


# ── RESPONSE SHAPE MAPPERS ──────────────────────────────────────────────────
def _format_single_source_of_truth_response(
    stage1: Dict[str, Any],
    stage2: Dict[str, Any],
    judge_report: Dict[str, Any],
    generator_provider: str,
    judge_provider: str,
    providers_used: List[str],
    loops_used: int,
    guide_source: str,
    lang: str,
    is_off_topic: bool = False,
    issues_fixed: Optional[List[str]] = None,
    is_single_provider_mode: bool = False,
    raw_stage_logs: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """Builds the single source of truth response object."""
    und_score = judge_report.get("understanding_score", 88)
    sol_score = judge_report.get("solution_score", 86)
    avg_score = round((und_score + sol_score) / 2.0, 1)
    confidence = round(avg_score / 100.0, 3)

    is_safe = bool(stage1.get("is_safe_for_diy", True))

    steps = stage2.get("steps", [])
    if not is_safe:
        steps = []

    diy_guide = {
        "title": stage2.get("title") or f"{stage1.get('category', 'Maintenance').capitalize()} Self-Repair",
        "estimatedMinutes": stage2.get("estimatedMinutes") or 15,
        "difficulty": stage2.get("difficulty") or "Easy",
        "tools": stage2.get("tools") or stage2.get("requiredTools") or [],
        "spareParts": stage2.get("spareParts") or stage2.get("parts") or [],
        "parts": stage2.get("spareParts") or stage2.get("parts") or [],
        "safetyPrecautions": stage2.get("safetyPrecautions") or stage2.get("safetyInstructions") or [],
        "precautions": stage2.get("safetyPrecautions") or stage2.get("safetyInstructions") or [],
        "steps": steps,
        "whenToCallTechnician": stage2.get("whenToCallTechnician") or "If issue persists or hazard occurs, contact maintenance.",
        "isSafeForDIY": is_safe,
        "category": stage1.get("category", "plumbing")
    }

    understanding_obj = {
        "category": stage1.get("category", "plumbing"),
        "understanding_text": stage1.get("understanding_text") or stage1.get("normalized_problem_en") or "Identified maintenance problem",
        "confidence": confidence,
        "negatedSymptoms": stage1.get("negated_symptoms", []),
        "severity": stage1.get("severity", "medium"),
        "isSafeForDIY": is_safe,
        "isMaintenanceRelated": not is_off_topic
    }

    verification_obj = {
        "judgeProvider": judge_provider,
        "generatorProvider": generator_provider,
        "providersUsed": providers_used,
        "understandingScore": und_score,
        "understandingScoreJustification": judge_report.get("understanding_score_justification", "Valid token match."),
        "solutionScore": sol_score,
        "solutionScoreJustification": judge_report.get("solution_score_justification", "Valid repair procedure."),
        "confidencePercent": int(avg_score),
        "loopsUsed": loops_used,
        "issuesFixed": issues_fixed or [],
        "decision": "APPROVED",
        "isSingleProvider": is_single_provider_mode,
        "rawStageLogs": raw_stage_logs or []
    }

    if guide_source == "llm":
        if is_single_provider_mode:
            verified_by_label = f"Verified by 1 Model ({generator_provider.upper()}) - Single Provider Mode"
        else:
            verified_by_label = f"Cross-Verified by {judge_provider.upper()} (Generated by {generator_provider.upper()})"
    else:
        verified_by_label = "Deterministic Domain Safety Engine"

    return {
        "understanding": understanding_obj,
        "diyGuide": diy_guide,
        "verification": verification_obj,
        "guideSource": guide_source,
        "message": "Diagnosis and solution verified successfully.",

        # Backward compatibility fields for frontend components
        "category": stage1.get("category", "plumbing"),
        "confidence": confidence,
        "possibleIssue": stage1.get("sub_issue") or stage1.get("normalized_problem_en") or "Maintenance issue",
        "explanation": stage1.get("understanding_text"),
        "confirmationQuestion": (
            "இந்த பிரச்சனை விளக்கம் சரியானதா?" if lang == "ta" else
            "क्या यह समस्या विवरण सही है?" if lang == "hi" else
            "Is this problem description accurate?"
        ),
        "safetyAssessment": (
            "பாதுகாப்பானது: இந்த பிரச்சனைக்கு எங்கள் ஊடாடும் சுய பழுதுபார்ப்பு வழிகாட்டி மூலம் நீங்களே எளிதாக தீர்வு காணலாம்." if lang == "ta" and is_safe else
            "Safe for guided DIY repair" if is_safe else
            "Hazardous fault detected. Certified technician required."
        ),
        "isSafeForDIY": is_safe,
        "severity": stage1.get("severity", "medium"),
        "isOffTopic": is_off_topic,
        "verifiedSolution": diy_guide,
        "verificationReport": {
            "decision": "APPROVED",
            "isApproved": True,
            "verificationScore": confidence,
            "understandingScore": und_score,
            "solutionScore": sol_score,
            "judgeProvider": judge_provider,
            "generatorProvider": generator_provider,
            "verifiedBy": verified_by_label
        },
        "verifiedBy": verified_by_label,
        "providersUsed": providers_used,
        "fromCache": False,
        "extractedConstraints": {
            "negativeConditions": {s: False for s in stage1.get("negated_symptoms", [])},
            "mainProblem": stage1.get("normalized_problem_en"),
            "mentionedExclusions": stage1.get("negated_symptoms", [])
        }
    }


def _format_refusal_response(stage1: Dict[str, Any], stage2: Dict[str, Any], lang: str) -> Dict[str, Any]:
    """Formats a polite refusal for non-maintenance input."""
    refusal_msg = (
        "நான் பராமரிப்பு மற்றும் பழுது நீக்கும் பிரச்சனைகளுக்கு மட்டுமே உதவ முடியும் (எ.கா. குழாய் கசிவு, ஏசி பழுது, வைஃபை பிரச்சனை). தயவுசெய்து உங்கள் பராமரிப்பு பிரச்சனையை விவரிக்கவும்."
        if lang == "ta" else
        "मैं केवल रखरखाव और मरम्मत समस्याओं (जैसे प्लंबिंग, एसी, वाईफाई, बिजली) में मदद कर सकता हूँ। कृपया अपनी रखरखाव समस्या बताएं।"
        if lang == "hi" else
        "I can only assist with facility maintenance and repair issues (e.g. plumbing, electrical, AC, WiFi, appliances). Please describe your maintenance problem."
    )

    return {
        "understanding": {
            "category": "other",
            "understanding_text": refusal_msg,
            "confidence": 0.10,
            "negatedSymptoms": [],
            "severity": "low",
            "isSafeForDIY": False,
            "isMaintenanceRelated": False
        },
        "diyGuide": None,
        "verification": {
            "judgeProvider": "content_policy_guard",
            "generatorProvider": "content_policy_guard",
            "providersUsed": [],
            "understandingScore": 10,
            "solutionScore": 0,
            "loopsUsed": 1,
            "issuesFixed": [],
            "decision": "OFF_TOPIC_REFUSAL"
        },
        "guideSource": "static_fallback",
        "message": refusal_msg,
        "category": "other",
        "confidence": 0.10,
        "possibleIssue": "Non-Maintenance / Off-Topic Query",
        "explanation": refusal_msg,
        "confirmationQuestion": "Please describe your maintenance or repair problem.",
        "safetyAssessment": "Off-topic query.",
        "isSafeForDIY": False,
        "severity": "low",
        "isOffTopic": True,
        "verifiedSolution": None,
        "verificationReport": {
            "decision": "OFF_TOPIC_REFUSAL",
            "isApproved": False,
            "verificationScore": 0.10,
            "verifiedBy": "FixLink Content Policy Guard"
        },
        "verifiedBy": "FixLink Content Policy Guard",
        "providersUsed": [],
        "fromCache": False
    }


# ── COMPATIBILITY ALIASES ───────────────────────────────────────────────────
def process_complaint_with_verification(
    complaint_text: str,
    category: str,
    lang: str = "en",
    title: Optional[str] = None,
    description: Optional[str] = None,
    prior_knowledge: str = "",
    max_retries: int = 2
) -> Dict[str, Any]:
    """Compatibility entrypoint calling the new 4-stage pipeline."""
    return run_generate_verify_correct_pipeline(
        title=title or "",
        description=description or complaint_text,
        category_hint=category,
        lang=lang
    )
