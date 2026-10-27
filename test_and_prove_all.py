import os
import sys
import time
import json
import requests
import statistics

# Ensure UTF-8 output on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"

def print_separator(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def main():
    print_separator("PART 1 & 2: VERIFYING DYNAMIC SCORING, JUSTIFICATIONS & HAZARDS / GIBBERISH")
    from backend.ai.solution_verification_engine import (
        run_generate_verify_correct_pipeline,
        check_is_gibberish_or_unclear,
        check_is_hazardous_input,
        _AI_PIPELINE_CACHE,
        PROVIDER_CONFIGS
    )

    # 1. Test Gibberish
    print("\n[TEST: GIBBERISH DETECTION]")
    gibberish_cases = ["asdfgh", ".", "xyz", "???", "   ", "bcdfgh", "qwertyuiop"]
    for g in gibberish_cases:
        res = run_generate_verify_correct_pipeline(title="", description=g, category_hint=None, lang="en")
        print(f"Input: '{g}' -> inputQuality: '{res.get('inputQuality')}', guideSource: '{res.get('guideSource')}', message: '{res.get('message')}', diyGuide is None: {res.get('diyGuide') is None}")

    # 2. Test Hazard Detection (Tamil/Tanglish/Hindi/English)
    print("\n[TEST: HAZARD DETECTION VIA STAGE 1 & PRE-FILTER]")
    hazard_cases = [
        ("switch ah thottaa shock adikkudhu", "ta"),
        ("kitchen la gas vaasam varudhu", "ta"),
        ("wall la periya crack vandhuduchu", "ta"),
        ("ceiling has major structural crack", "en"),
        ("main board la spark varudhu", "ta")
    ]
    for h_txt, lang in hazard_cases:
        res = run_generate_verify_correct_pipeline(title=h_txt, description=h_txt, category_hint="electrical" if "shock" in h_txt or "spark" in h_txt else "infrastructure" if "crack" in h_txt else "other", lang=lang)
        print(f"\nHazard Input: '{h_txt}'")
        print(f"  Category: {res.get('category')} | isSafeForDIY: {res.get('isSafeForDIY')} | Severity: {res.get('severity')}")
        print(f"  Steps Count: {len(res.get('diyGuide', {}).get('steps', [])) if res.get('diyGuide') else 0}")
        tech_advice = res.get('diyGuide', {}).get('whenToCallTechnician') if res.get('diyGuide') else res.get('safetyAssessment')
        print(f"  When To Call Tech: {tech_advice}")
        print(f"  Judge Und Justification: {res.get('verification', {}).get('understandingScoreJustification')}")
        print(f"  Judge Sol Justification: {res.get('verification', {}).get('solutionScoreJustification')}")

    # 3. Test Negation ("Bathroom tap water flow is very low. Leakage illai.")
    print("\n[TEST: NEGATION HANDLING]")
    neg_res = run_generate_verify_correct_pipeline(
        title="Bathroom tap water flow is very low. Leakage",
        description="Bathroom tap water flow is very low. Leakage illai.",
        category_hint="plumbing",
        lang="ta"
    )
    print(f"Negation Result:")
    print(f"  Category: {neg_res.get('category')}")
    print(f"  Possible Issue: {neg_res.get('possibleIssue')}")
    print(f"  Explanation: {neg_res.get('explanation')}")
    print(f"  Negated Symptoms in S1: {neg_res.get('understanding', {}).get('negatedSymptoms')}")
    print(f"  DIY Guide Title: {neg_res.get('diyGuide', {}).get('title')}")
    print(f"  DIY Steps: {json.dumps(neg_res.get('diyGuide', {}).get('steps', []), ensure_ascii=False, indent=2)}")
    print(f"  Verification Decision: {neg_res.get('verification', {}).get('decision')}")
    print(f"  Und Score: {neg_res.get('verification', {}).get('understandingScore')} ({neg_res.get('verification', {}).get('understandingScoreJustification')})")
    print(f"  Sol Score: {neg_res.get('verification', {}).get('solutionScore')} ({neg_res.get('verification', {}).get('solutionScoreJustification')})")

    # 4. Run Live HTTP Requests to POST /api/ai/diagnose
    print_separator("PART 5: END-TO-END HTTP TESTS (POST /api/ai/diagnose)")
    
    e2e_cases = [
        {
            "name": "a) Low tap flow with negation (Tamil)",
            "payload": {
                "title": "Bathroom tap water flow is very low. Leakage",
                "description": "Bathroom tap water flow is very low. Leakage illai.",
                "preferredLang": "ta"
            }
        },
        {
            "name": "b) Washing machine drain blocked with wrong category hint (cleaning -> plumbing)",
            "payload": {
                "title": "Washing machine drain blocked",
                "description": "Washing machine drain blocked, cleaning venum",
                "category": "cleaning",
                "preferredLang": "ta"
            }
        },
        {
            "name": "c) Gibberish input 'asdfgh'",
            "payload": {
                "title": "",
                "description": "asdfgh",
                "preferredLang": "en"
            }
        },
        {
            "name": "d) Fan blades cleaning (Tamil)",
            "payload": {
                "title": "Fan dust",
                "description": "Fan blades clean pannanum, romba dust",
                "preferredLang": "ta"
            }
        }
    ]

    for c in e2e_cases:
        print(f"\n==================== TEST: {c['name']} ====================")
        print("REQUEST PAYLOAD:")
        print(json.dumps(c["payload"], indent=2))
        
        t0 = time.time()
        resp = requests.post(f"{BASE_URL}/api/ai/diagnose", json=c["payload"])
        lat = round((time.time() - t0) * 1000, 1)
        
        print(f"\nHTTP STATUS: {resp.status_code} (Latency: {lat} ms)")
        resp_json = resp.json()
        print("RESPONSE JSON (Full):")
        print(json.dumps(resp_json, ensure_ascii=False, indent=2))

    # Test 5e: All keys removed / offline simulation
    print("\n==================== TEST: 5e) All Provider Keys Removed (Static Fallback / None) ====================")
    from backend.ai import solution_verification_engine as sve
    orig_configs = dict(sve.PROVIDER_CONFIGS)
    # Temporarily clear keys
    sve.PROVIDER_CONFIGS = {
        "openai": {"name": "ChatGPT", "api_key": "", "base_url": None, "model": "gpt-4o-mini", "cooldown_sec": 1800},
        "gemini": {"name": "Gemini", "api_key": "", "base_url": None, "model": "gemini-3.5-flash-lite", "cooldown_sec": 1800},
        "deepseek": {"name": "DeepSeek", "api_key": "", "base_url": None, "model": "deepseek-chat", "cooldown_sec": 1800},
    }
    _AI_PIPELINE_CACHE.clear()
    offline_res = sve.run_generate_verify_correct_pipeline(
        title="Bathroom tap water flow is very low",
        description="Bathroom tap water flow is very low. Leakage illai.",
        category_hint="plumbing",
        lang="ta"
    )
    print("Offline Result (Guide Source should be 'static_fallback' or 'none', matching category):")
    print(f"  guideSource: {offline_res.get('guideSource')}")
    print(f"  category: {offline_res.get('category')}")
    print(f"  diyGuide Title: {offline_res.get('diyGuide', {}).get('title') if offline_res.get('diyGuide') else 'None'}")
    print(f"  fromCache: {offline_res.get('fromCache')}")
    print(f"  verifiedBy: {offline_res.get('verifiedBy')}")

    # Test 5f: Single Provider Active (Only OpenAI valid, Gemini & DeepSeek removed)
    print("\n==================== TEST: 5f) Single Provider Active (OpenAI only) ====================")
    sve.PROVIDER_CONFIGS = {
        "openai": dict(orig_configs["openai"]),
        "gemini": {"name": "Gemini", "api_key": "", "base_url": None, "model": "gemini-3.5-flash-lite", "cooldown_sec": 1800},
        "deepseek": {"name": "DeepSeek", "api_key": "", "base_url": None, "model": "deepseek-chat", "cooldown_sec": 1800},
    }
    _AI_PIPELINE_CACHE.clear()
    single_res = sve.run_generate_verify_correct_pipeline(
        title="Fan noisy",
        description="Ceiling fan making squeaking noise while running",
        category_hint="electrical",
        lang="en"
    )
    print("Single Provider Result:")
    print(f"  providersUsed: {single_res.get('providersUsed')}")
    print(f"  verifiedBy: {single_res.get('verifiedBy')}")
    print(f"  judgeProvider: {single_res.get('verification', {}).get('judgeProvider')}")
    print(f"  rawStageLogs count: {len(single_res.get('verification', {}).get('rawStageLogs', []))}")

    # Restore configs
    sve.PROVIDER_CONFIGS = orig_configs

    # Part 4 & 6: Latency Benchmark & Cache Prove
    print_separator("PART 4 & 6: CACHE VERIFICATION & LATENCY BENCHMARK")
    _AI_PIPELINE_CACHE.clear()
    
    test_req = {
        "title": "Air Conditioner filter dusty",
        "description": "AC is blowing less cold air because filter is clogged with dust",
        "category": "appliances",
        "preferredLang": "en"
    }

    fresh_latencies = []
    print("\nRunning 5 First-Time (Fresh) Requests...")
    for i in range(5):
        _AI_PIPELINE_CACHE.clear() # force fresh
        t0 = time.time()
        r = requests.post(f"{BASE_URL}/api/ai/diagnose", json=test_req)
        lat = (time.time() - t0) * 1000
        fresh_latencies.append(lat)
        data = r.json()
        print(f"  Fresh Request #{i+1}: {round(lat, 1)} ms | fromCache: {data.get('fromCache')} | guideSource: {data.get('guideSource')}")

    cached_latencies = []
    print("\nRunning 5 Cached Requests...")
    for i in range(5):
        t0 = time.time()
        r = requests.post(f"{BASE_URL}/api/ai/diagnose", json=test_req)
        lat = (time.time() - t0) * 1000
        cached_latencies.append(lat)
        data = r.json()
        print(f"  Cached Request #{i+1}: {round(lat, 1)} ms | fromCache: {data.get('fromCache')} | guideSource: {data.get('guideSource')}")

    print("\nLATENCY REPORT:")
    print(f"  Fresh Requests (p50): {round(statistics.median(fresh_latencies), 1)} ms")
    print(f"  Fresh Requests (Max): {round(max(fresh_latencies), 1)} ms")
    print(f"  Cached Requests (p50): {round(statistics.median(cached_latencies), 1)} ms")
    print(f"  Cached Requests (Max): {round(max(cached_latencies), 1)} ms")

if __name__ == "__main__":
    main()
