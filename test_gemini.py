import os
import json
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

for m in ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash"]:
    try:
        model = genai.GenerativeModel(m, generation_config={"response_mime_type": "application/json"})
        res = model.generate_content("Output strict JSON: {\"status\": \"active\", \"model\": \"" + m + "\"}")
        print(f"Model {m}: SUCCESS -> {res.text.strip()}")
    except Exception as e:
        print(f"Model {m}: FAILED -> {e}")
