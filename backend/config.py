import os
from dotenv import load_dotenv

# Load .env file from project root or backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "fixlink_db")
JWT_SECRET = os.getenv("JWT_SECRET", "fixlink_super_secret_jwt_key_2026_production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── LLM API Keys & Settings (Fixed order: OpenAI -> DeepSeek -> Gemini) ──
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
GEMINI_FALLBACK_MODELS = [
    m.strip()
    for m in os.getenv("GEMINI_FALLBACK_MODELS", "gemini-3.5-flash-lite,gemini-3.8-flash,gemini-2.5-pro,gemini-1.5-flash,gemini-flash-latest").split(",")
    if m.strip()
]

DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").strip()
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/").strip()

# Cooldown durations in minutes after quota/exhaustion
OPENAI_COOLDOWN_MIN = int(os.getenv("OPENAI_COOLDOWN_MIN", "60"))
DEEPSEEK_COOLDOWN_MIN = int(os.getenv("DEEPSEEK_COOLDOWN_MIN", "60"))
GEMINI_COOLDOWN_MIN = int(os.getenv("GEMINI_COOLDOWN_MIN", "15"))

CHAT_RATE_LIMIT_PER_MINUTE = int(os.getenv("CHAT_RATE_LIMIT_PER_MINUTE", "15"))


