import asyncio
import json
import sys
import httpx

# Ensure stdout encodes unicode cleanly
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

TEST_CASES = [
    {
        "id": "case_1_tap_flow",
        "name": "Tap low flow with negative condition (Tanglish)",
        "payload": {
            "text": "Bathroom tap water flow is very low. Leakage illai.",
            "category": "plumbing",
            "preferredLang": "ta"
        },
        "expected_category": "plumbing",
        "expected_not_in_title": ["Corridor", "Spill", "Dustbin", "தரைக்கசிவு"],
        "expected_in_title": ["குழாய்", "நீர்", "ஏரேட்டர்", "Tap", "Flow", "Aerator"],
        "must_be_safe": True
    },
    {
        "id": "case_2_fan",
        "name": "Ceiling fan speed / capacitor",
        "payload": {
            "text": "Ceiling fan is running very slow at regulator speed 5",
            "category": "electrical",
            "preferredLang": "en"
        },
        "expected_category": "electrical",
        "expected_not_in_title": ["Corridor", "Spill", "Tap"],
        "expected_in_title": ["Fan", "Capacitor", "Regulator"],
        "must_be_safe": True
    },
    {
        "id": "case_3_corridor",
        "name": "Corridor floor dirty & waste bin",
        "payload": {
            "text": "Corridor floor is dirty, dustbin overflowing with waste",
            "category": "cleaning",
            "preferredLang": "en"
        },
        "expected_category": "cleaning",
        "expected_in_title": ["Spill", "Floor", "Sanitization", "Corridor", "Waste"],
        "must_be_safe": True
    },
    {
        "id": "case_4_wifi",
        "name": "WiFi connectivity problem",
        "payload": {
            "text": "WiFi is not connecting in lab, router red light",
            "category": "network",
            "preferredLang": "en"
        },
        "expected_category": "network",
        "expected_not_in_title": ["Corridor", "Spill"],
        "expected_in_title": ["Wi-Fi", "Router", "Network"],
        "must_be_safe": True
    },
    {
        "id": "case_5_off_topic",
        "name": "Off-topic non-maintenance query refusal",
        "payload": {
            "text": "write java code for binary search algorithm",
            "category": "other",
            "preferredLang": "en"
        },
        "expected_category": "other",
        "must_refuse": True
    },
    {
        "id": "case_6_washing_machine_drain",
        "name": "Edge Case: Washing machine drain blocked (contains 'clean')",
        "payload": {
            "text": "Washing machine drain blocked and needs cleaning",
            "category": "plumbing",
            "preferredLang": "en"
        },
        "expected_category": "plumbing",
        "expected_not_in_title": ["Corridor", "Dustbin", "Floor Spill"],
        "must_be_safe": True
    },
    {
        "id": "case_7_water_purifier",
        "name": "Edge Case: Water purifier not working, needs filter clean",
        "payload": {
            "text": "Water purifier not working, needs filter clean",
            "category": "plumbing",
            "preferredLang": "en"
        },
        "expected_category": "plumbing",
        "expected_not_in_title": ["Corridor", "Dustbin", "Floor Spill"],
        "must_be_safe": True
    },
    {
        "id": "case_8_ac_filter",
        "name": "Edge Case: AC not cooling, dust in filter",
        "payload": {
            "text": "AC not cooling, dust in filter clean needed",
            "category": "electrical",
            "preferredLang": "en"
        },
        "expected_category": "electrical",
        "expected_not_in_title": ["Corridor", "Dustbin", "Floor Spill"],
        "must_be_safe": True
    }
]

async def run_tests():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=15.0) as client:
        print("=" * 70)
        print("RUNNING FIXLINK AI SOLUTION VERIFICATION INTEGRATION TEST SUITE")
        print("=" * 70)
        
        all_passed = True
        tap_case_result = None

        for idx, tc in enumerate(TEST_CASES, 1):
            print(f"\n[Test {idx}/{len(TEST_CASES)}] {tc['name']}")
            print(f"  Input: {tc['payload']}")
            
            try:
                res = await client.post("/api/ai/diagnose", json=tc["payload"])
                assert res.status_code == 200, f"Status code {res.status_code}: {res.text}"
                data = res.json()

                if tc["id"] == "case_1_tap_flow":
                    tap_case_result = {
                        "request": tc["payload"],
                        "response": data
                    }

                # Check off-topic
                if tc.get("must_refuse"):
                    is_off_topic = data.get("isOffTopic", False) or data.get("verificationDecision") == "OFF_TOPIC_REFUSAL"
                    if is_off_topic:
                        print("  [SUCCESS] Correctly refused off-topic query.")
                        print(f"  Refusal explanation: {data.get('explanation') or data.get('verifiedSolution', {}).get('recommendedSolution')}")
                    else:
                        print(f"  [FAILURE] Off-topic query was not refused! data: {data}")
                        all_passed = False
                    continue

                # Check Category
                diag_cat = data.get("category")
                print(f"  Category: {diag_cat} (Expected: {tc['expected_category']})")
                assert diag_cat == tc["expected_category"], f"Category mismatch: {diag_cat} != {tc['expected_category']}"

                # Check Single Source of Truth guide
                guide = data.get("diyGuide") or data.get("verifiedSolution")
                assert guide is not None, "Guide is missing in response!"

                title = guide.get("title", "")
                print(f"  Guide Title: '{title}'")
                print(f"  Estimated Minutes: {guide.get('estimatedMinutes')}")
                print(f"  Difficulty: {guide.get('difficulty')}")
                print(f"  Tools: {guide.get('tools') or guide.get('requiredTools')}")
                print(f"  Steps Count: {len(guide.get('steps') or guide.get('recommendedSolution') or [])}")

                # Check no unwanted corridor spill hijacking
                for bad in tc.get("expected_not_in_title", []):
                    assert bad.lower() not in title.lower(), f"Violated: '{bad}' found in guide title '{title}'!"

                if tc.get("expected_in_title"):
                    matched_in_title = any(good.lower() in title.lower() for good in tc["expected_in_title"])
                    assert matched_in_title, f"None of {tc['expected_in_title']} found in title '{title}'!"

                # Check verification report
                verif = data.get("verificationReport") or {}
                print(f"  Verification Decision: {data.get('verificationDecision') or verif.get('decision')}")
                print(f"  Consensus Score: {verif.get('verificationScore')}")

                print("  [SUCCESS] PASSED")

            except Exception as e:
                print(f"  [FAILURE] with error: {e}")
                all_passed = False

        print("\n" + "=" * 70)
        if all_passed:
            print("ALL 8 TEST CASES PASSED SUCCESSFULLY!")
        else:
            print("SOME TEST CASES FAILED. CHECK LOGS ABOVE.")
        print("=" * 70)

        # Save tap case result for report
        with open("tap_case_result.json", "w", encoding="utf-8") as f:
            json.dump(tap_case_result, f, ensure_ascii=False, indent=2)
        print("Tap case result saved to tap_case_result.json")

if __name__ == "__main__":
    asyncio.run(run_tests())
