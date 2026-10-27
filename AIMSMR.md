# 🔧 FixLink — AI-Powered Multilingual Smart Maintenance System

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Tests](https://img.shields.io/badge/tests-43%20passing-brightgreen)

FixLink is a full-stack web platform for neighbourhoods and campuses that connects **residents** with **registered repair persons**. A resident describes a problem in their own language (English, Tamil, Tanglish or Hindi), the AI understands it, asks for confirmation, and then either gives a **safe step-by-step self-repair guide** or directs the complaint to a repair person. Dangerous faults (electric shock, sparking, gas smell, structural cracks) never get DIY steps.

---

## 📸 Screenshots

| Login | User Dashboard |
|---|---|
| ![Login](docs/screenshots/01-login.png) | ![User dashboard](docs/screenshots/02-user-dashboard.png) |

| Raise Complaint | Repair Person Dashboard |
|---|---|
| ![Raise complaint](docs/screenshots/03-raise-complaint.png) | ![Repair person dashboard](docs/screenshots/04-repair-person-dashboard.png) |

---

## ✨ Features

- **Multilingual complaints** — English, Tamil, Tanglish and Hindi, with spelling correction and negation handling (e.g. *"leakage illai"* does not trigger leak-repair steps).
- **Multiple input modes** — typed text, voice (browser Web Speech API) and photo / camera evidence.
- **AI diagnosis with confirmation** — category match %, explanation of the detected problem, and a confirmation step before any solution is shown.
- **Safe DIY repair guide** — tools, spare parts, safety precautions, interactive checklist and a final verification step.
- **Hazard handling** — risky faults are escalated to a repair person with no self-repair steps.
- **Generate → Judge → Auto-correct pipeline** — one LLM writes the solution, a different provider checks it, and errors are corrected automatically.
- **Honest verification labels** — if only one AI provider is available, the answer is labelled `UNVERIFIED` instead of being shown as verified.
- **Provider fallback** — OpenAI → DeepSeek → Gemini with automatic cool-down when a quota is exhausted.
- **Scope-restricted AI chat** — answers only maintenance and repair questions, refuses unrelated topics, with per-minute rate limiting.
- **Verified knowledge base** — 100 seed entries (English / Tamil / Tanglish keywords) with human review (`pending_review` → `approved`) before they are used as reference.
- **Complaint lifecycle** — repair person accepts or rejects, updates progress, adds remarks and marks completion; users track status and give feedback; in-app notifications.
- **Role-based accounts** — Resident User and Repair Person (Technician), passwords hashed with bcrypt, JWT sessions.

---

## 🧠 How the AI pipeline works

```
Complaint (text / voice / image)
        │
        ▼
Language detection → Spelling correction → Category classification
                                           (TF-IDF + Logistic Regression)
        │
        ▼
Safety check ── hazard? ──► No DIY steps, escalate to repair person
        │ safe
        ▼
Retrieve approved knowledge-base entries (RAG-style)
        │
        ▼
Stage 1+2  Understand & generate solution   (Provider A)
        │
        ▼
Stage 3    Cross-check / judge              (Provider B)
        │ fails ──► Auto-correct (max 2 loops) ──┐
        ▼ passes                                  │
Final answer + decision label  ◄──────────────────┘
(VERIFIED / UNVERIFIED_SINGLE_PROVIDER / UNVERIFIED_FALLBACK)
```

**Techniques used:** TF-IDF + Logistic Regression (scikit-learn), fuzzy matching with `difflib`, Unicode-range language detection, regex-based negation detection, keyword hazard matching, LLM-as-a-judge, provider failover with cool-down, SHA-256 keyed response cache, bcrypt, JWT.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, react-markdown, Web Speech API |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Database | MongoDB (Motor / PyMongo) with in-memory fallback for local demos |
| Auth | JWT (python-jose), bcrypt (passlib) |
| ML / NLP | scikit-learn (TF-IDF + Logistic Regression), difflib |
| LLM providers | OpenAI, DeepSeek, Google Gemini (called over HTTP with `requests`) |
| Testing | pytest |

---

## 📁 Project Structure

```
.
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── config.py                # Environment configuration
│   ├── auth.py                  # JWT + password hashing helpers
│   ├── database.py              # MongoDB manager (+ in-memory fallback)
│   ├── models.py                # Pydantic request/response models
│   ├── ai/
│   │   ├── solution_verification_engine.py   # Generate → Judge → Correct pipeline
│   │   ├── ai_providers.py      # Chat engine, provider chain, scope guard
│   │   ├── ml_classifier.py     # TF-IDF + Logistic Regression
│   │   ├── language_detector.py
│   │   ├── spell_corrector.py
│   │   ├── complaint_understanding.py   # Negation handling
│   │   ├── safety_engine.py     # Hazard / DIY safety rules
│   │   └── vision_engine.py     # Image analysis via vision-capable LLM
│   ├── routes/                  # auth, complaints, technicians, ai, notifications, reports
│   ├── data/kb_seed.json        # 100 seed knowledge-base entries
│   ├── scripts/                 # load_kb_seed.py, validate_kb.py
│   └── tests/                   # eval_cases.json, test_ai_eval.py
├── frontend/                    # React + Vite app
├── docs/screenshots/
├── run_backend.bat / run_all.bat
└── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- MongoDB (optional — if it is not running, the backend falls back to in-memory storage so the app still starts)
- At least one LLM API key (OpenAI, DeepSeek or Gemini). Two or more providers are needed for cross-verification.

### 1. Clone

```bash
git clone https://github.com/babu9342/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Configure environment

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

Open `.env` and add your own keys. **Never commit `.env`** — it is already in `.gitignore`.

### 3. Run the backend

```bash
pip install -r backend/requirements.txt scikit-learn
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

- API: http://127.0.0.1:8000
- Interactive docs: http://127.0.0.1:8000/docs

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The API base URL is set in `frontend/src/api.js` (`BACKEND_URL`).

### Windows one-click start

```bat
run_all.bat
```

### 5. Load the knowledge-base seed (optional)

```bash
python -m backend.scripts.validate_kb      # checks all 100 entries
python -m backend.scripts.load_kb_seed     # upserts them (status: pending_review)
```

Seed entries are AI-drafted and start as `pending_review`. They are only used as reference after a person approves them through the review endpoints.

---

## ⚙️ Environment Variables

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY` | Provider keys (use your own) |
| `OPENAI_MODEL`, `DEEPSEEK_MODEL`, `GEMINI_MODEL` | Model names |
| `GEMINI_FALLBACK_MODELS` | Backup Gemini models if the primary is unavailable |
| `JUDGE_PROVIDER`, `JUDGE_MODEL` | Provider/model used for cross-checking |
| `LLM_TIMEOUT_SEC` | Per-call timeout (default 25) |
| `OPENAI_COOLDOWN_MIN`, `DEEPSEEK_COOLDOWN_MIN`, `GEMINI_COOLDOWN_MIN` | Cool-down after a provider's quota is exhausted |
| `USE_EMBEDDINGS` | Optional embeddings-based retrieval (default `false`) |
| `CHAT_RATE_LIMIT_PER_MINUTE` | AI chat rate limit per user |
| `MONGO_URI`, `DB_NAME` | MongoDB connection |
| `JWT_SECRET` | Secret for signing tokens — **set a long random value in production** |

---

## 🔌 API Overview

| Group | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register/user`, `POST /api/auth/register/technician`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| **Complaints** | `GET/POST /api/complaints`, `GET /api/complaints/{id}`, `POST /api/complaints/{id}/select-technician`, `POST /api/complaints/{id}/complete-self-repair`, `POST /api/complaints/{id}/feedback` |
| **Repair persons** | `GET /api/technicians`, `GET /api/technicians/jobs`, `POST /api/technicians/jobs/{id}/accept`, `POST /api/technicians/jobs/{id}/reject`, `PATCH /api/technicians/jobs/{id}/status`, `PATCH /api/technicians/status` |
| **AI** | `POST /api/ai/diagnose`, `POST /api/ai/confirm`, `POST /api/ai/verify-solution`, `POST /api/ai/chat`, `GET/DELETE /api/ai/chat/history`, `POST /api/ai/chat/extract-ticket`, `POST /api/ai/upload`, `POST /api/ai/feedback`, `GET /api/ai/status` |
| **Knowledge base** | `GET /api/ai/knowledge-base`, `GET /api/ai/knowledge-base/pending`, `POST /api/ai/knowledge-base/{id}/approve`, `POST /api/ai/knowledge-base/{id}/reject` |
| **Notifications & reports** | `GET /api/notifications`, `POST /api/notifications/read`, `GET /api/reports/analytics`, `GET /api/reports/{id}` |

Full request/response schemas are available at `/docs` when the backend is running.

---

## ✅ Testing

```bash
pip install pytest
python -m pytest backend/tests -q
```

The suite contains 42 multilingual evaluation cases (English, Tamil, Tanglish) covering category detection, hazard handling, negation and language matching. By default it runs **offline** against the deterministic fallback path; pass `--live` to run against real providers.

---

## 🛡️ Design Principles

- **No fake verification** — answers are only labelled verified when a second provider actually checked them.
- **Safety first** — hazardous faults never receive DIY steps.
- **Human-reviewed knowledge** — knowledge-base entries are used only after approval.
- **Secrets stay out of Git** — keys live in `.env`; rotate any key that was ever exposed.

---

## ⚠️ Known Limitations

- Accuracy against live LLM providers has not been benchmarked yet; the automated suite validates the offline path.
- Repair persons are chosen from the registered list of matching category and accepted or rejected by them; automatic nearest-technician assignment is not enabled.
- Image analysis needs a vision-capable provider key; without one it reports that image analysis is unavailable.
- The predictive-maintenance card is a prototype and does not use real analytics yet.
- Uploaded files are stored on the local server; production use needs file-type/size validation and cloud storage.
- There is no admin console yet; knowledge-base review is done through the API.

---

## 🗺️ Roadmap

- Role-based admin console with analytics dashboard
- Automatic technician ranking by specialty, availability and distance
- Real predictive maintenance from complaint history
- Technician rating and review system
- Mobile app and push / SMS notifications
- AR-assisted repair guidance

---

## 👤 Author

**Babu M** — B.Tech Information Technology, Shree Venkateshwara Hi-Tech Engineering College, Erode (Anna University, Chennai)

[GitHub](https://github.com/babu9342) · [LinkedIn](https://linkedin.com/in/babu-m-b9072b317)

This project was built as an academic mini project.
