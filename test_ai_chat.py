import json
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from backend.ai.ai_providers import dispatch_chat

test_queries = [
    ("bike tyre punchar", "ta"),
    ("AC cooling illa", "ta"),
    ("tap la thanni leak aaguthu", "ta"),
    ("fan is sparking and making noise", "en")
]

for q, l in test_queries:
    print("=" * 60)
    print(f"Testing Query: '{q}' (Lang: {l})")
    res = dispatch_chat("claude", [{"role": "user", "content": q}], user_lang=l)
    print(f"Provider: {res.get('provider')} | Model: {res.get('model')}")
    print(f"Structured Ticket: {res.get('structuredTicket')}")
    if res.get("diyGuide"):
        print(f"Interactive DIY Guide Steps: {len(res['diyGuide']['steps'])} steps")
    print(f"Reply Preview:\n{res.get('reply')[:250]}...\n")

print("ALL TEST QUERIES COMPLETED SUCCESSFULLY!")
