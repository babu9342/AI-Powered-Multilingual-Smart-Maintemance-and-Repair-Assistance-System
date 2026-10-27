import re
from typing import Dict, Any, List, Optional
from backend.ai.language_detector import detect_language

# ── MULTILINGUAL NEGATION PATTERNS ──────────────────────────────────────────
NEGATION_PATTERNS: Dict[str, Dict[str, Any]] = {
    "leakage": {
        "label_en": "No Water Leakage",
        "label_ta": "தண்ணீர் கசிவு இல்லை",
        "label_hi": "कोई रिसाव / लीकेज नहीं",
        "prohibited_terms": [
            "fix leak", "fixing leak", "leakage repair", "leaking washer",
            "replace leaking washer", "water leaking", "dripping leak",
            "pipe burst", "sealing leak", "teflon tape for leak",
            "தண்ணீர் கசிவு சரிசெய்தல்", "கசிவை அடைக்கவும்", "ரிसाव ठीक करें",
            "leakage", "leaking", "தண்ணீர் கசிவு", "நீர் கசிவு"
        ],
        "targeted_focus_plumbing_low_flow": [
            "Clean faucet aerator mesh filter",
            "Descale aerator with white vinegar to clear limescale sediment",
            "Check under-sink angle isolation valve is fully open",
            "Inspect faucet ceramic cartridge for mineral clogging"
        ],
        "patterns": [
            # English
            r'\b(?:no|not|without|zero|never|absent|none|no\s+more)\s+(?:water\s+)?(?:leak|leaking|leakage|drip|dripping|spill|burst)\b',
            r'\b(?:leak|leaking|leakage|drip|dripping)\s+(?:is\s+)?(?:not\s+present|absent|none|false|no|zero|stopped)\b',
            r'\bwithout\s+(?:any\s+)?(?:leak|leakage|water\s+leak)\b',
            # Tamil / Tanglish
            r'(?:கசிவு|லீக்கேஜ்|leak|leakage|ஒழுகல்|தண்ணீர்\s+ஒழுகல்)\s*(?:இல்லை|இல்ல|இல்லவே\s*இல்லை|illa|illai|varala|aagala|கிடையாது)',
            r'(?:தண்ணீர்|water)\s*(?:கசியவில்லை|ஒழுகவில்லை|leak\s*aagala|leak\s*illa)',
            r'leakage\s*இல்லை',
            r'leak\s*இல்லை',
            r'leaking\s*illa',
            r'leak\s*illa',
            r'leakage\s*illa',
            r'leakage\s*illai',
            # Hindi / Hinglish
            r'(?:कोई\s+)?(?:रिसाव|लीकेज|टपकन|पानी\s+का\s+रिसाव|leak|leakage)\s*(?:नहीं\s+है|नहीं|na\s+hai|nahi\s+hai|nahi\s+ho\s+raha)',
            r'(?:पानी|water)\s*(?:लीक\s*नहीं\s*हो\s*रहा|टपक\s*नहीं\s*रहा|leak\s*nahi\s*hai)',
            # Telugu, Malayalam, Kannada
            r'(?:లీకేజీ|నీటి\s*లీకేజీ)\s*(?:లేదు|కారుట\s*లేదు)',
            r'(?:ചോർച്ച|വെള്ളച്ചോർച്ച)\s*(?:ഇല്ല|ഉണ്ടായിട്ടില്ല)',
            r'(?:ಸೋರಿಕೆ|ನೀರು\s*ಸೋರಿಕೆ)\s*(?:ಇಲ್ಲ|ಆಗುತ್ತಿಲ್ಲ)'
        ]
    },
    "spark": {
        "label_en": "No Electrical Sparking / Arcing",
        "label_ta": "மின்கசிவு / தீப்பொறி இல்லை",
        "label_hi": "कोई स्पार्क / चिंगारी नहीं",
        "prohibited_terms": ["short circuit repair", "replace burnt terminal", "spark repair", "தீப்பொறி பழுது"],
        "targeted_focus": ["Check voltage supply", "Inspect capacitor", "Check regulator contact"],
        "patterns": [
            r'\b(?:no|not|without|zero)\s+(?:spark|sparking|sparks|arcing|flame|flash)\b',
            r'\b(?:spark|sparking)\s+(?:is\s+)?(?:not\s+present|absent|none|no|illa|illai)\b',
            r'(?:தீப்பொறி|ஸ்பார்க்|spark|sparking)\s*(?:இல்லை|இல்ல|illa|illai|varala|கிடையாது)',
            r'(?:स्पार्क|चिंगारी)\s*(?:नहीं\s+है|नहीं|nahi\s+hai)'
        ]
    },
    "noise": {
        "label_en": "No Abnormal Noise / Silent Operation",
        "label_ta": "சத்தம் இல்லை / அமைதியாக உள்ளது",
        "label_hi": "कोई आवाज / शोर नहीं",
        "prohibited_terms": ["bearing replacement", "greasing rattling parts", "vibration fix", "சத்தம் குறைத்தல்"],
        "targeted_focus": ["Electrical circuit check", "Capacitor voltage check", "Switch contact check"],
        "patterns": [
            r'\b(?:no|not|without|zero)\s+(?:noise|sound|vibration|rattling|humming|squeaking)\b',
            r'\b(?:noise|sound)\s+(?:is\s+)?(?:not\s+present|absent|none|no|illa|illai)\b',
            r'\bcompletely\s+silent\b',
            r'(?:சத்தம்|ஒலி|noise|sound)\s*(?:இல்லை|இல்ல|illa|illai|varala|கேட்கவில்லை)',
            r'(?:आवाज|शोर|ध्वनि)\s*(?:नहीं\s+है|नहीं\s+आ\s+रही|nahi\s+hai)'
        ]
    },
    "smoke": {
        "label_en": "No Smoke or Burning Odor",
        "label_ta": "புகை அல்லது கருகிய வாசனை இல்லை",
        "label_hi": "कोई धुआं या जलने की गंध नहीं",
        "prohibited_terms": ["burnt coil replacement", "smoke hazard isolation", "overheat replacement"],
        "targeted_focus": ["Normal diagnostic check", "Wiring connection check"],
        "patterns": [
            r'\b(?:no|not|without)\s+(?:smoke|burning\s+smell|burnt\s+smell|odor|smell)\b',
            r'(?:புகை|கருகிய\s+வாசனை|எரிந்த\s+வாசனை|smoke|smell)\s*(?:இல்லை|இல்ல|illa|illai|varala)',
            r'(?:धुआं|जलने\s+की\s+बदबू|गंध)\s*(?:नहीं\s+है|नहीं|nahi\s+hai)'
        ]
    },
    "heat": {
        "label_en": "No Overheating / Normal Temperature",
        "label_ta": "அதிக வெப்பம் இல்லை",
        "label_hi": "कोई अत्यधिक गर्मी या हीटिंग नहीं",
        "prohibited_terms": ["thermal cutoff replacement", "overheat repair", "heat sink replacement"],
        "targeted_focus": ["Normal circuit diagnostic check", "Operational test"],
        "patterns": [
            r'\b(?:no|not|without)\s+(?:heat|heating|overheat|overheating|hot)\b',
            r'(?:அதிக\s*வெப்பம்|சூடாகவில்லை|heat\s*aagala|சூடு\s*இல்லை|hot\s*illa)',
            r'(?:गर्म\s*नहीं\s*हो\s*रहा|हीटिंग\s*नहीं\s*है|heat\s*nahi\s*hai)'
        ]
    },
    "vibration": {
        "label_en": "No Excessive Vibration",
        "label_ta": "அதிர்வு அல்லது நடுக்கம் இல்லை",
        "label_hi": "कोई कंपन या हिलना नहीं",
        "prohibited_terms": ["balancing blade replacement", "anchor bolt tightening"],
        "targeted_focus": ["Electrical motor diagnostic"],
        "patterns": [
            r'\b(?:no|not|without)\s+(?:vibration|shaking|wobbling)\b',
            r'(?:அதிர்வு|நடுக்கம்|ஆட்டம்)\s*(?:இல்லை|இல்ல|illa|illai|aagala)',
            r'(?:कंपन|हिलना)\s*(?:नहीं\s*है|nahi\s*hai)'
        ]
    },
    "power_cut": {
        "label_en": "Power is Active (No Power Outage)",
        "label_ta": "மின்சாரம் உள்ளது (மின்தடை இல்லை)",
        "label_hi": "बिजली चालू है (पावर कट नहीं)",
        "prohibited_terms": ["check main grid power outage", "wait for power restoration", "மின்தடை சரிபார்த்தல்"],
        "targeted_focus": ["Internal appliance capacitor/regulator check", "Switch point check"],
        "patterns": [
            r'\b(?:power|current|electricity)\s+(?:is\s+)?(?:on|available|working|present|there)\b',
            r'\bno\s+power\s+cut\b',
            r'(?:current|power|மின்சாரம்)\s*(?:irukku|iruku|உள்ளது|வரவில்லை\s*என்பது\s*பொய்|on\s*la\s*irukku)',
            r'(?:बिजली|करंट|power)\s*(?:ஆ\s+रही\s+है|चालू\s+है|hai)'
        ]
    }
}

def is_condition_negated(condition_key: str, text: str, description: Optional[str] = None) -> bool:
    """
    Reusable multilingual negation evaluator.
    Returns True if the specified condition (e.g. 'leakage', 'noise', 'smoke', 'spark', 'heat', 'vibration')
    is explicitly negated in the text or description (with description having priority).
    """
    cond_data = NEGATION_PATTERNS.get(condition_key)
    if not cond_data:
        return False
    
    # Priority 1: Check description first if provided
    if description:
        desc_lower = description.lower()
        for pat in cond_data["patterns"]:
            if re.search(pat, desc_lower, re.IGNORECASE):
                return True

    # Priority 2: Check overall text
    if text:
        text_lower = text.lower()
        for pat in cond_data["patterns"]:
            if re.search(pat, text_lower, re.IGNORECASE):
                return True

    return False

# ── POSITIVE SYMPTOM CLUSTER MATCHER ─────────────────────────────────────────
SYMPTOM_CLUSTERS = [
    {
        "key": "low_water_flow",
        "category": "plumbing",
        "patterns": [
            r'\b(?:water\s+flow|flow|pressure|tap\s+water|water\s+pressure)\s+(?:is\s+)?(?:very\s+)?(?:low|slow|weak|reduced|trickl|poor|kammi)\b',
            r'\b(?:low|slow|weak|poor|trickling)\s+(?:water\s+)?(?:flow|pressure|stream)\b',
            r'(?:தண்ணீர்|நீர்|water)\s*(?:வேகம்|ஓட்டம்|pressure|flow)\s*(?:குறைவு|குறைவாக|kammi|slow|romba\s*kammi|varala|varamatenguthu)',
            r'(?:flow|pressure)\s*(?:kammi|slow|low)',
            r'(?:தண்ணீர்\s*வேகம்\s*மிகவும்\s*குறைவு|நீர்\s*அழுத்தம்\s*குறைவு)',
            r'(?:पानी\s+का\s+बहाव|प्रेशर|फ्लो|पानी\s+का\s+दबाव)\s*(?:कम|धीमा|बहुत\s+कम|slow|kam|कमजोर)',
            r'tap\s+water\s+flow\s+is\s+very\s+low'
        ],
        "name_en": "Low Water Flow / Reduced Tap Pressure",
        "name_ta": "குழாயில் குறைந்த நீர் அழுத்தம் / ஓட்டம்",
        "name_hi": "नल में पानी का कम बहाव",
        "true_root_causes": [
            "Aerator mesh clogged with sand, mineral sediment, or scale particles",
            "Mineral limescale accumulation inside tap ceramic cartridge",
            "Partially closed under-sink angle isolation stopcock valve"
        ]
    },
    {
        "key": "fan_slow_speed",
        "category": "electrical",
        "patterns": [
            r'\b(?:fan\s+)?(?:speed|rotating)\s+(?:is\s+)?(?:very\s+)?(?:slow|reduced|kammi)\b',
            r'\bfan\s+slow\b',
            r'(?:மின்விசிறி|fan)\s*(?:மெதுவாக|slow\s*aah|romba\s*slow)\s*(?:ஓடுகிறது|சுழல்கிறது|poguthu|oduthu)',
            r'(?:पंखा)\s*(?:धीमा|slow)\s*(?:चल\s+रहा\s+है|घूम\s+रहा\s+है)'
        ],
        "name_en": "Ceiling Fan Low Rotation Speed",
        "name_ta": "மின்விசிறி குறைந்த வேகத்தில் சுழல்கிறது",
        "name_hi": "पंखा धीमी गति से चल रहा है",
        "true_root_causes": [
            "Run capacitor capacitance degradation (microfarad rating drop)",
            "Electronic wall regulator potentiometer resistance drift",
            "Dry dust accumulation causing slight spindle friction"
        ]
    },
    {
        "key": "light_flicker",
        "category": "electrical",
        "patterns": [
            r'\b(?:light|bulb|tubelight)\s+(?:is\s+)?(?:flickering|blinking|dim)\b',
            r'(?:விளக்கு|light)\s*(?:மின்மினுக்குகிறது|blink\s*aaguthu|flicker\s*aaguthu)',
            r'(?:लाइट|बल्ब)\s*(?:टिमटिमा\s+रहा\s+है|ब्लिंक\s+हो\s+रहा\s+है)'
        ],
        "name_en": "Light Flickering / Inconsistent Illumination",
        "name_ta": "விளக்கு மின்மினுத்தல்",
        "name_hi": "लाइट टिमटिमाना",
        "true_root_causes": [
            "Loose terminal contact screw in holder or switch",
            "Electronic LED driver / electronic ballast capacitor degradation"
        ]
    }
]


def extract_complaint_constraints(
    text: str,
    user_lang: Optional[str] = None,
    title: Optional[str] = None,
    description: Optional[str] = None,
    lang: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligently analyzes the user's maintenance complaint to extract:
      1. Detected positive symptoms
      2. Negative conditions / Explicit denials (e.g. 'Leakage = FALSE')
      3. Prohibited solution keywords (e.g. NEVER suggest fixing pipe leaks)
      4. Targeted root causes (e.g. aerator cleaning, descaling)
      5. Cleaned text for legacy classifiers without misleading negated terms
      6. Handles mixed signals: description negation always overrides title assertion.
    """
    combined_text = text or ""
    if title and description:
        combined_text = f"{title}. {description}"
    elif description and not combined_text:
        combined_text = description
    elif title and not combined_text:
        combined_text = title

    if not combined_text:
        return {
            "mainProblem": "Unspecified Maintenance Issue",
            "detectedLanguage": "en",
            "positiveSymptoms": [],
            "negativeConditions": {},
            "userConstraints": [],
            "mentionedExclusions": [],
            "prohibitedSolutions": [],
            "targetedFocus": [],
            "cleanedText": "",
            "confidenceScore": 0.90
        }

    raw_text = combined_text.strip()
    detected_lang = user_lang or lang or detect_language(raw_text)

    negative_conditions: Dict[str, bool] = {}
    user_constraints: List[Dict[str, Any]] = []
    mentioned_exclusions: List[str] = []
    prohibited_solutions: List[str] = []
    targeted_focus: List[str] = []

    cleaned_text = raw_text

    # 1. Evaluate Negative Conditions & Denials (giving priority to description if present)
    text_to_scan_for_negation = description or raw_text

    for cond_key, cond_data in NEGATION_PATTERNS.items():
        is_negated = False
        matched_phrase = ""

        for pat in cond_data["patterns"]:
            # Check description or raw_text
            m = re.search(pat, text_to_scan_for_negation, re.IGNORECASE)
            if not m and description and title:
                m = re.search(pat, raw_text, re.IGNORECASE)
            if m:
                is_negated = True
                matched_phrase = m.group(0)
                # Strip matched negative phrase from cleaned text to prevent misclassification
                cleaned_text = re.sub(pat, ' ', cleaned_text, flags=re.IGNORECASE)
                break

        if is_negated:
            negative_conditions[cond_key] = False  # Explicitly FALSE (absent)
            label = cond_data.get(f"label_{detected_lang}") or cond_data["label_en"]
            user_constraints.append({
                "condition": cond_key,
                "negated": True,
                "rawPhrase": matched_phrase,
                "meaning": label,
                "status": "CONFIRMED_ABSENT"
            })
            mentioned_exclusions.append(f"{label} ({matched_phrase})")
            prohibited_solutions.extend(cond_data.get("prohibited_terms", []))

            # If leakage is false and plumbing low flow is present, inject targeted aerator focus
            if cond_key == "leakage":
                targeted_focus.extend(cond_data.get("targeted_focus_plumbing_low_flow", []))

    # Clean up excess spaces in cleaned text
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()

    # 2. Extract Positive Symptoms
    positive_symptoms: List[str] = []
    main_problem = ""
    target_causes: List[str] = []

    for cluster in SYMPTOM_CLUSTERS:
        for pat in cluster["patterns"]:
            if re.search(pat, raw_text, re.IGNORECASE) or (cleaned_text and re.search(pat, cleaned_text, re.IGNORECASE)):
                symptom_name = cluster.get(f"name_{detected_lang}") or cluster["name_en"]
                positive_symptoms.append(symptom_name)
                if not main_problem:
                    main_problem = symptom_name
                target_causes.extend(cluster["true_root_causes"])
                break

    # If no specific cluster matched, pick best non-negated sentence
    if not main_problem:
        sentences = [s.strip() for s in re.split(r'[.!?\n]+', cleaned_text) if len(s.strip()) > 3]
        if sentences:
            main_problem = sentences[0]
        else:
            main_problem = raw_text.split('.')[0].strip()

    return {
        "rawText": raw_text,
        "cleanedText": cleaned_text,
        "detectedLanguage": detected_lang,
        "mainProblem": main_problem,
        "positiveSymptoms": positive_symptoms,
        "negativeConditions": negative_conditions,
        "userConstraints": user_constraints,
        "mentionedExclusions": mentioned_exclusions,
        "prohibitedSolutions": list(set(prohibited_solutions)),
        "targetedFocus": list(set(targeted_focus + target_causes)),
        "understandingConfidence": 0.96 if user_constraints or positive_symptoms else 0.90
    }
