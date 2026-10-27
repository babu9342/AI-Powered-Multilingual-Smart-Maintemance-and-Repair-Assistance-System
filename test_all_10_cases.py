import os
import sys
import json
import time

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from backend.ai.solution_verification_engine import (
    run_generate_verify_correct_pipeline,
    stage1_understand,
    stage2_solve,
    stage3_judge,
    generate_stage1_and_2_combined,
    PROVIDER_CONFIGS,
    _AI_PIPELINE_CACHE
)

TEST_CASES = [
    {
        "id": 1,
        "name": "Tap flow low + 'Leakage illai' (Tanglish/Tamil)",
        "title": "Bathroom tap water flow is very low. Leakage",
        "description": "Bathroom tap water flow is very low. Leakage illai.",
        "category": "plumbing",
        "lang": "ta"
    },
    {
        "id": 2,
        "name": "Ceiling fan slow speed (English)",
        "title": "Ceiling fan slow speed",
        "description": "Ceiling fan speed is very slow and making humming noise.",
        "category": "electrical",
        "lang": "en"
    },
    {
        "id": 3,
        "name": "Corridor floor dirty (English)",
        "title": "Corridor garbage spill",
        "description": "Corridor floor is full of garbage and muddy water.",
        "category": "cleaning",
        "lang": "en"
    },
    {
        "id": 4,
        "name": "Wi-Fi not connecting (English)",
        "title": "Wi-Fi down",
        "description": "Campus Wi-Fi is not connecting in lab, router blinking red.",
        "category": "network",
        "lang": "en"
    },
    {
        "id": 5,
        "name": "Off-topic Java coding query (English)",
        "title": "Java Code Request",
        "description": "Please write a Java program for binary search tree.",
        "category": "other",
        "lang": "en"
    },
    {
        "id": 6,
        "name": "Washing machine drain blocked with wrong category hint (cleaning)",
        "title": "Washing machine drain blocked",
        "description": "Washing machine drain blocked, cleaning venum",
        "category": "cleaning",
        "lang": "ta"
    },
    {
        "id": 7,
        "name": "Hazard detection - Tanglish Electric Shock",
        "title": "Switch shock",
        "description": "switch ah thottaa shock adikkudhu",
        "category": "electrical",
        "lang": "ta"
    },
    {
        "id": 8,
        "name": "Hazard detection - Gas leak odor",
        "title": "Gas smell",
        "description": "kitchen la gas vaasam varudhu",
        "category": "infrastructure",
        "lang": "ta"
    },
    {
        "id": 9,
        "name": "Gibberish / Unclear input",
        "title": "",
        "description": "asdfgh",
        "category": None,
        "lang": "en"
    },
    {
        "id": 10,
        "name": "Corrupted Stage 2 Mismatch Simulation & Judge Audit",
        "title": "Bathroom tap low water flow",
        "description": "Bathroom tap water flow is very low. Leakage illai.",
        "category": "plumbing",
        "lang": "ta",
        "is_corrupt_simulation": True
    }
]

def run_test_suite():
    print("=" * 100)
    print("4-STAGE 'GENERATE -> CROSS-VERIFY -> AUTO-CORRECT' PIPELINE PROOF SUITE")
    print("=" * 100)

    for tc in TEST_CASES:
        _AI_PIPELINE_CACHE.clear() # fresh execution per test case
        print(f"\n{'='*40} [TEST CASE {tc['id']}: {tc['name']}] {'='*40}")
        print(f"INPUT: Title: '{tc['title']}' | Desc: '{tc['description']}' | Lang: '{tc['lang']}' | Category Hint: '{tc['category']}'")

        if tc.get("is_corrupt_simulation"):
            # Explicitly run Stage 1, corrupt Stage 2 with corridor cleaning, and submit to Stage 3 Judge
            print("\n>>> SIMULATING CORRUPTED STAGE 2 (CORRIDOR HIJACK) TO PROVE REAL JUDGE MISMATCH DETECTION <<<")
            s1 = {
                "normalized_problem_en": "Bathroom tap low water flow with aerator blockage",
                "category": "plumbing",
                "sub_issue": "Aerator clogging",
                "symptoms": ["low water flow"],
                "negated_symptoms": ["leakage"],
                "severity": "medium",
                "is_safe_for_diy": True,
                "is_maintenance_related": True,
                "understanding_text": "குழாயில் நீர் ஓட்டம் குறைவாக உள்ளது."
            }
            # Corrupted solution (corridor cleaning)
            corrupted_s2 = {
                "title": "Corridor Surface Spill & Dustbin Cleaning",
                "estimatedMinutes": 15,
                "difficulty": "Easy",
                "tools": ["Mop", "Gloves", "Wet Floor Sign"],
                "spareParts": ["Disinfectant Cleaner"],
                "safetyPrecautions": ["Place wet floor caution sign"],
                "steps": [
                    "Put on rubber gloves and prepare mop bucket with disinfectant",
                    "Place caution sign in corridor",
                    "Mop the spill inward to prevent spreading",
                    "Empty dustbin and dispose garbage safely",
                    "Wipe floor dry with clean mop"
                ],
                "whenToCallTechnician": "Contact sanitation team if chemical spill persists."
            }
            
            j_rep, j_lat, j_live, j_err, j_raw = stage3_judge(
                title=tc["title"],
                description=tc["description"],
                stage1_json=s1,
                stage2_json=corrupted_s2,
                lang=tc["lang"],
                judge_provider_id="gemini"
            )
            print(f"\n[STAGE 3 JUDGE AUDIT RESULT ON CORRUPTED SOLUTION]")
            print(f"  Provider Used : {'Gemini' if j_live else 'Deterministic Auditor'}")
            print(f"  Latency       : {j_lat} ms")
            print(f"  Understanding Score : {j_rep.get('understanding_score')} ({j_rep.get('understanding_score_justification')})")
            print(f"  Solution Score      : {j_rep.get('solution_score')} ({j_rep.get('solution_score_justification')})")
            print(f"  Solution Relevant   : {j_rep.get('solution_relevant')}")
            print(f"  Negations Respected : {j_rep.get('negations_respected')}")
            print(f"  Safety OK           : {j_rep.get('safety_ok')}")
            print(f"  Issues Flagged      : {j_rep.get('issues')}")
            print(f"  RAW Response (200c) : {j_raw[:200]}")
            continue

        res = run_generate_verify_correct_pipeline(
            title=tc["title"],
            description=tc["description"],
            category_hint=tc["category"],
            lang=tc["lang"]
        )

        print("\n[EXECUTION SUMMARY]")
        print(f"  Input Quality       : {res.get('inputQuality')}")
        print(f"  Guide Source        : {res.get('guideSource')}")
        print(f"  Category Diagnosed  : {res.get('category')}")
        print(f"  Severity / DIY Safe : {res.get('severity')} / isSafeForDIY={res.get('isSafeForDIY')}")
        print(f"  Negated Symptoms    : {res.get('understanding', {}).get('negatedSymptoms')}")
        print(f"  Verified Decision   : {res.get('verification', {}).get('decision')}")
        print(f"  Understanding Score : {res.get('verification', {}).get('understandingScore')} ({res.get('verification', {}).get('understandingScoreJustification')})")
        print(f"  Solution Score      : {res.get('verification', {}).get('solutionScore')} ({res.get('verification', {}).get('solutionScoreJustification')})")
        print(f"  Guide Title         : {res.get('diyGuide', {}).get('title') if res.get('diyGuide') else 'None'}")
        print(f"  Steps Count         : {len(res.get('diyGuide', {}).get('steps', [])) if res.get('diyGuide') else 0}")
        if res.get('diyGuide') and res.get('diyGuide', {}).get('steps'):
            print(f"  Steps Preview       :")
            for idx, s in enumerate(res.get('diyGuide', {}).get('steps')[:3], 1):
                print(f"    {idx}. {s}")

        stage_logs = res.get("verification", {}).get("rawStageLogs", [])
        print("\n[PER-STAGE RAW LLM LOGS]")
        if not stage_logs:
            print("  (Pre-filter or Guard resolved request without requiring LLM rounds)")
        for log in stage_logs:
            print(f"  * Stage: {log.get('stage')}")
            print(f"    - Provider : {log.get('provider')} | Model: {log.get('model')}")
            print(f"    - Latency  : {log.get('latencyMs')} ms | Live: {log.get('isLive')} | Token Est: {log.get('tokenEstimate')}")
            print(f"    - Raw Snip : {log.get('rawSnippet')}")

if __name__ == "__main__":
    run_test_suite()
