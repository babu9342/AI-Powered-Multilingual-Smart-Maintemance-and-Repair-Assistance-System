import io
import sys
import json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("=" * 60)
print("RUNNING FIXLINK FULL SUITE VERIFICATION")
print("=" * 60)

# 1. Health check
res = client.get("/api/health")
print(f"1. Health Status: {res.status_code} -> {res.json()}")
assert res.status_code == 200

# 2. Login as user to get token
login_res = client.post("/api/auth/login", json={"email": "user@fixlink.ai", "password": "password123", "role": "user"})
print(f"2. Auth Login: {login_res.status_code}")
assert login_res.status_code == 200
token = login_res.json()["accessToken"]
headers = {"Authorization": f"Bearer {token}"}

# 3. Test multi-query chat API
queries = [
    ("bike tyre punchar", "ta"),
    ("AC cooling illa", "ta"),
    ("tap la thanni leak aaguthu", "ta"),
    ("ceiling fan not rotating", "en")
]

for q, l in queries:
    chat_res = client.post("/api/chat", json={
        "provider": "claude",
        "messages": [{"role": "user", "content": q}],
        "language": l
    }, headers=headers)
    assert chat_res.status_code == 200, f"Chat failed for {q}: {chat_res.text}"
    data = chat_res.json()
    print(f"\n[Query]: '{q}' (Lang: {l})")
    print(f" -> Provider: {data.get('provider')} | Model: {data.get('model')}")
    print(f" -> Ticket Suggestion: {data.get('structuredTicket')}")
    print(f" -> DIY Guide Detected: {bool(data.get('diyGuide'))}")
    print(f" -> Reply Preview: {data.get('reply')[:120]}...")

# 4. Test Chat History retrieval
hist_res = client.get("/api/chat/history", headers=headers)
assert hist_res.status_code == 200
hist = hist_res.json()
print(f"\n4. User Chat History Retrieved: {len(hist)} saved messages")

# 5. Test Extract Ticket API
extract_res = client.post("/api/chat/extract-ticket", json={
    "messages": [{"role": "user", "content": "bike tyre punchar and air is leaking"}],
    "language": "en"
})
assert extract_res.status_code == 200
print(f"5. Ticket Extract API: {extract_res.json()}")

print("\n" + "=" * 60)
print("ALL BACKEND SUITE TESTS PASSED 100%!")
print("=" * 60)
