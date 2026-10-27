import os
import sys
import json
import logging

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO)

from backend.ai import solution_verification_engine as sve

print("=" * 80)
print("TESTING GEMINI MODEL FALLBACK & STARTUP WARNING")
print("=" * 80)

# 1. Test Startup Warning with invalid model
print("\n[STEP 1: TESTING STARTUP CHECK WITH INVALID MODEL NAME]")
sve.PROVIDER_CONFIGS["gemini"]["model"] = "gemini-nonexistent-404-test"
sve.check_gemini_models_startup()

# 2. Test 404 Fallback in LLM Execution
print("\n[STEP 2: TESTING 404 AUTOMATIC FALLBACK IN LLM INVOCATION]")
sys_prompt = "You are a test assistant. Return JSON."
usr_prompt = "Return {\"status\": \"ok\", \"tested\": true}"

parsed, lat_ms, is_live, err, raw_snip, model_used = sve._call_llm_json(
    provider_id="gemini",
    system_prompt=sys_prompt,
    user_prompt=usr_prompt
)

print(f"\nResult:")
print(f"  Parsed JSON : {parsed}")
print(f"  Is Live     : {is_live}")
print(f"  Model Used  : {model_used} (Expected fallback model from list)")
print(f"  Latency     : {lat_ms} ms")

# 3. Test In Full Pipeline
print("\n[STEP 3: TESTING FULL PIPELINE OUTPUT WITH MODEL NAME IN providersUsed]")
sve._AI_PIPELINE_CACHE.clear()
res = sve.run_generate_verify_correct_pipeline(
    title="Sink pipe leaking",
    description="Sink pipe under bathroom is dripping water continuously",
    category_hint="plumbing",
    lang="en"
)
print(f"\nPipeline Providers Used: {res.get('providersUsed')}")
print(f"Pipeline Verified By: {res.get('verifiedBy')}")
print(f"Raw Stage Logs:")
for log in res.get("verification", {}).get("rawStageLogs", []):
    print(f"  Stage: {log.get('stage')} | Provider: {log.get('provider')} | Model: {log.get('model')} | Live: {log.get('isLive')}")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
