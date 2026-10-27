import os
import sys
import time
import json
import logging

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from backend.ai.solution_verification_engine import (
    run_generate_verify_correct_pipeline,
    stage1_understand,
    stage2_solve,
    stage3_judge,
    _call_llm_json,
    _AI_PIPELINE_CACHE
)

def run_tests():
    _AI_PIPELINE_CACHE.clear()
    print("=" * 100)
    print("FIXLink AI 4-STAGE PIPELINE TEST SUITE (GENERATE -> CROSS-VERIFY -> AUTO-CORRECT)")
    print("=" * 100)

    test_cases = [
        {
            "id": 1,
            "name": "Low tap water flow + 'Leakage illai' (Tamil)",
            "title": "Bathroom tap water flow",
            "desc": "Bathroom tap water flow is very low. Leakage illai.",
            "lang": "ta",
            "cat": "plumbing",
            "expect_no_leak": True,
            "expect_safe": True
        },
        {
            "id": 2,
            "name": "Low tap water flow + 'No leakage' (English)",
            "title": "Bathroom tap low pressure",
            "desc": "Bathroom tap water flow is very low. No leakage.",
            "lang": "en",
            "cat": "plumbing",
            "expect_no_leak": True,
            "expect_safe": True
        },
        {
            "id": 3,
            "name": "Tap leaking continuously",
            "title": "Tap leaking",
            "desc": "Tap leaking continuously water dripping from faucet",
            "lang": "en",
            "cat": "plumbing",
            "expect_leak": True,
            "expect_safe": True
        },
        {
            "id": 4,
            "name": "WiFi connect aagala, router la red light",
            "title": "WiFi not working",
            "desc": "WiFi connect aagala, router la red light",
            "lang": "ta",
            "cat": "network",
            "expect_safe": True
        },
        {
            "id": 5,
            "name": "Washing machine drain blocked, cleaning venum",
            "title": "Washing machine drain blocked",
            "desc": "Washing machine drain blocked, cleaning venum",
            "lang": "ta",
            "cat": "plumbing",
            "expect_not_corridor": True,
            "expect_safe": True
        },
        {
            "id": 6,
            "name": "AC not cooling, filter dust",
            "title": "AC not cooling",
            "desc": "AC not cooling, filter dust",
            "lang": "en",
            "cat": "electrical",
            "expect_safe": True
        },
        {
            "id": 7,
            "name": "Switch board la spark, burning smell",
            "title": "Switch board spark",
            "desc": "Switch board la spark, burning smell",
            "lang": "ta",
            "cat": "electrical",
            "expect_safe": False
        },
        {
            "id": 8,
            "name": "write java code (Refusal)",
            "title": "Java programming",
            "desc": "write java code for binary search tree",
            "lang": "en",
            "cat": "other",
            "expect_off_topic": True
        },
        {
            "id": 9,
            "name": "asdfgh (Gibberish)",
            "title": "asdfgh",
            "desc": "asdfgh",
            "lang": "en",
            "cat": "other",
            "expect_off_topic": True
        }
    ]

    results = []

    for tc in test_cases:
        print(f"\n---> Running Case {tc['id']}: {tc['name']}...")
        t0 = time.time()
        res = run_generate_verify_correct_pipeline(
            title=tc["title"],
            description=tc["desc"],
            category_hint=tc["cat"],
            lang=tc["lang"]
        )
        elapsed_ms = int((time.time() - t0) * 1000)

        und = res.get("understanding", {})
        guide = res.get("diyGuide") or {}
        ver = res.get("verification", {})
        g_source = res.get("guideSource")

        und_text = und.get("understanding_text", "")
        if res.get("isOffTopic"):
            title_guide = "N/A (Off-Topic Refusal)"
        elif not res.get("isSafeForDIY"):
            title_guide = guide.get("title") or "Hazardous (Technician Required)"
        else:
            title_guide = guide.get("title") or "None"
        scores = f"Und: {ver.get('understandingScore')}% | Sol: {ver.get('solutionScore')}%"
        issues_fixed = ver.get("issuesFixed", [])
        loops_used = ver.get("loopsUsed", 1)
        providers_used = ", ".join(ver.get("providersUsed", [])) or "domain_safety_engine"
        
        # Validations
        passed = True
        notes = []
        if tc.get("expect_no_leak"):
            if "leak" in und_text.lower() and not ("illai" in und_text.lower() or "இல்லை" in und_text or "no leak" in und_text.lower()):
                passed = False
                notes.append("Leakage mentioned in diagnosis!")
            if "leak" in json.dumps(guide).lower() and not ("illai" in json.dumps(guide).lower() or "இல்லை" in json.dumps(guide) or "no leak" in json.dumps(guide).lower()):
                passed = False
                notes.append("Leakage repair in solution steps!")
        if tc.get("expect_safe") is False:
            if res.get("isSafeForDIY") or len(guide.get("steps", [])) > 0:
                passed = False
                notes.append("Hazard marked safe for DIY!")
        if tc.get("expect_off_topic"):
            if not res.get("isOffTopic"):
                passed = False
                notes.append("Off-topic was not flagged!")

        results.append({
            "id": tc["id"],
            "name": tc["name"],
            "und_text": und_text[:70] + "..." if len(und_text) > 70 else und_text,
            "guide_title": title_guide[:40] + "..." if len(title_guide) > 40 else title_guide,
            "scores": scores,
            "issues_fixed": str(len(issues_fixed)),
            "loops_used": loops_used,
            "providers_used": providers_used,
            "latency": f"{elapsed_ms}ms",
            "passed": passed,
            "guide_source": g_source
        })

    # Test Case 10: Injected corrupted Stage 2 (Judge catches and loop corrects)
    print("\n---> Running Case 10: Corrupted Stage 2 Injection Test (Judge Catches & Auto-Corrects)...")
    t0 = time.time()
    
    # 1. Generate valid Stage 1
    s1, _, _ = stage1_understand(
        title="Washing machine drain blocked",
        description="Washing machine drain blocked, cleaning venum",
        category_hint="plumbing",
        lang="ta"
    )
    
    # 2. INJECT CORRUPTED STAGE 2 (Corridor Cleaning & Dustbin)
    corrupted_s2 = {
        "title": "Corridor Surface Spill & Dustbin Cleaning",
        "estimatedMinutes": 10,
        "difficulty": "Easy",
        "tools": ["Microfiber Mop", "Rubber Gloves", "Wet Floor Sign"],
        "spareParts": [],
        "safetyPrecautions": ["Put on gloves", "Place wet floor sign"],
        "steps": [
            "Put on rubber gloves",
            "Mop corridor spill inward towards center",
            "Empty trash dustbin into main compactor",
            "Verify the floor is clean and dry"
        ],
        "whenToCallTechnician": "Contact sanitation supervisor."
    }
    
    # 3. Pass to Stage 3 Judge
    judge_rep, _, _ = stage3_judge(
        title="Washing machine drain blocked",
        description="Washing machine drain blocked, cleaning venum",
        stage1_json=s1,
        stage2_json=corrupted_s2,
        lang="ta"
    )
    
    print(f"Judge Evaluation on Corrupted Guide: {json.dumps(judge_rep, ensure_ascii=False, indent=2)}")
    
    # Verify Judge caught the mismatch
    judge_caught = (
        not judge_rep.get("solution_relevant", True) or
        judge_rep.get("solution_score", 100) < 80 or
        len(judge_rep.get("issues", [])) > 0
    )
    
    # 4. Trigger Auto-Correct loop with feedback
    corrected_s2, _, _ = stage2_solve(
        title="Washing machine drain blocked",
        description="Washing machine drain blocked, cleaning venum",
        stage1_json=s1,
        lang="ta",
        feedback_issues=judge_rep.get("issues", ["Severe category mismatch: Corridor cleaning generated for washing machine drain."])
    )
    
    # 5. Judge re-audits corrected solution
    re_judge_rep, _, _ = stage3_judge(
        title="Washing machine drain blocked",
        description="Washing machine drain blocked, cleaning venum",
        stage1_json=s1,
        stage2_json=corrected_s2,
        lang="ta"
    )
    
    elapsed_ms = int((time.time() - t0) * 1000)
    loop_corrected = re_judge_rep.get("solution_score", 0) >= 80 or "வடிகால்" in corrected_s2.get("title", "") or "drain" in corrected_s2.get("title", "").lower()
    
    results.append({
        "id": 10,
        "name": "Corrupted Stage 2 Injection & Auto-Correction",
        "und_text": s1.get("understanding_text", "")[:70] + "...",
        "guide_title": corrected_s2.get("title", "")[:40] + "...",
        "scores": f"Pre: {judge_rep.get('solution_score')}% -> Post: {re_judge_rep.get('solution_score')}%",
        "issues_fixed": str(len(judge_rep.get("issues", []))),
        "loops_used": 2,
        "providers_used": "Judge Audit & Auto-Correction",
        "latency": f"{elapsed_ms}ms",
        "passed": judge_caught and loop_corrected,
        "guide_source": "llm/verified"
    })

    print("\n" + "=" * 115)
    print(f"{'Case':<4} | {'Test Case Name':<38} | {'Understanding Text / Guide Title':<35} | {'Scores / Loop':<18} | {'Latency':<8} | {'Status'}")
    print("-" * 115)
    for r in results:
        status = "PASSED" if r["passed"] else "FAILED"
        print(f"{r['id']:<4} | {r['name']:<38} | {r['guide_title']:<35} | {r['scores']:<18} | {r['latency']:<8} | {status}")
    print("=" * 115)

if __name__ == "__main__":
    run_tests()
