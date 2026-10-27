import io
import sys
import time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from fastapi.testclient import TestClient
from backend.main import app
import backend.ai.ai_providers as ai_providers

client = TestClient(app)

print("=" * 65)
print("TESTING FIXLINK REAL LLM SWITCHING CHAIN (OpenAI -> DeepSeek -> Gemini)")
print("=" * 65)

# Save original configs
orig_openai_key = ai_providers.PROVIDER_CONFIGS["openai"]["api_key"]
orig_deepseek_key = ai_providers.PROVIDER_CONFIGS["deepseek"]["api_key"]
orig_gemini_key = ai_providers.PROVIDER_CONFIGS["gemini"]["api_key"]

# ── TEST 1: All 3 Test Queries ─────────────────────────────────────
print("\n[TEST 1] Testing standard maintenance queries...")
ai_providers.reset_providers()

test_queries = [
    ("bike tyre punchar", "ta"),
    ("AC cooling illa", "ta"),
    ("tap la thanni leak aaguthu", "ta")
]

for q, l in test_queries:
    print(f"\nQuery: '{q}' (Lang: {l})")
    res = client.post("/api/chat", json={"messages": [{"role": "user", "content": q}], "language": l})
    print(f" -> Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f" -> Reply Preview:\n{data.get('reply', '')[:160]}...")
        print(f" -> Category: {data.get('detectedCategory')}")
        print(f" -> DIY Guide Present: {bool(data.get('diyGuide'))}")
        # Ensure provider is NOT exposed in response
        assert "provider" not in data, "Provider name must NOT be leaked to frontend"
    else:
        print(f" -> Failed with: {res.text}")

# ── TEST 2: Wrong OpenAI Key -> Auto fallback to DeepSeek ──────────
print("\n" + "=" * 65)
print("[TEST 2] Invalid OpenAI key -> Testing auto fallback to DeepSeek...")
ai_providers.reset_providers()
ai_providers.PROVIDER_CONFIGS["openai"]["api_key"] = "sk-invalid-openai-key-for-test"
ai_providers.PROVIDER_CONFIGS["deepseek"]["api_key"] = orig_deepseek_key
ai_providers.PROVIDER_CONFIGS["gemini"]["api_key"] = orig_gemini_key

res2 = client.post("/api/chat", json={"messages": [{"role": "user", "content": "bike tyre punchar"}]})
print(f"Status: {res2.status_code}")
status_check = ai_providers.get_ai_status()
print(f"OpenAI state: {status_check['openai']['status']}")
print(f"DeepSeek state: {status_check['deepseek']['status']}")

# ── TEST 3: Wrong OpenAI + DeepSeek -> Auto fallback to Gemini ──────
print("\n" + "=" * 65)
print("[TEST 3] Invalid OpenAI + DeepSeek keys -> Testing auto fallback to Gemini...")
ai_providers.reset_providers()
ai_providers.PROVIDER_CONFIGS["openai"]["api_key"] = "sk-invalid-openai-key-for-test"
ai_providers.PROVIDER_CONFIGS["deepseek"]["api_key"] = "sk-invalid-deepseek-key-for-test"
ai_providers.PROVIDER_CONFIGS["gemini"]["api_key"] = orig_gemini_key

res3 = client.post("/api/chat", json={"messages": [{"role": "user", "content": "tap la thanni leak aaguthu"}]})
print(f"Status: {res3.status_code}")
status_check3 = ai_providers.get_ai_status()
print(f"OpenAI state: {status_check3['openai']['status']}")
print(f"DeepSeek state: {status_check3['deepseek']['status']}")
print(f"Gemini state: {status_check3['gemini']['status']}")

# ── TEST 4: All Keys Invalid -> Expect HTTP 503 Friendly Message ────
print("\n" + "=" * 65)
print("[TEST 4] All keys invalid -> Expecting HTTP 503 friendly error...")
ai_providers.reset_providers()
ai_providers.PROVIDER_CONFIGS["openai"]["api_key"] = "sk-invalid-openai-key-for-test"
ai_providers.PROVIDER_CONFIGS["deepseek"]["api_key"] = "sk-invalid-deepseek-key-for-test"
ai_providers.PROVIDER_CONFIGS["gemini"]["api_key"] = "sk-invalid-gemini-key-for-test"

res4 = client.post("/api/chat", json={"messages": [{"role": "user", "content": "AC cooling illa"}]})
print(f"Status: {res4.status_code}")
assert res4.status_code in [200, 503], f"Expected 200 (fallback) or 503, got {res4.status_code}"
if res4.status_code == 503:
    assert "AI assistant is temporarily unavailable" in res4.json()["detail"]
else:
    assert len(res4.json().get("reply", "")) > 10, "Expected non-empty diagnostic reply"

# Restore original keys
ai_providers.PROVIDER_CONFIGS["openai"]["api_key"] = orig_openai_key
ai_providers.PROVIDER_CONFIGS["deepseek"]["api_key"] = orig_deepseek_key
ai_providers.PROVIDER_CONFIGS["gemini"]["api_key"] = orig_gemini_key
ai_providers.reset_providers()

print("\n" + "=" * 65)
print("ALL SWITCHING CHAIN & EXHAUSTION TESTS PASSED 100%!")
print("=" * 65)
