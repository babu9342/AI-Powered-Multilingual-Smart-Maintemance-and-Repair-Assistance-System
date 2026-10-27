import os
import shutil
import time
import logging
import asyncio
from collections import defaultdict
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from typing import Optional, List, Dict, Any

from backend.models import (
    DiagnoseRequest,
    ConfirmRequest,
    ChatMessageRequest,
    ChatRequest,
    StructuredTicketRequest
)
from backend.config import UPLOAD_DIR, CHAT_RATE_LIMIT_PER_MINUTE
from backend.ai.language_detector import detect_language
from backend.ai.vision_engine import analyze_vision
from backend.ai.safety_engine import evaluate_safety_and_repair
from backend.ai.confirmation_ai import generate_confirmation_dialog, generate_refinement_response
from backend.ai.predictive import analyze_predictive_maintenance
from backend.ai.ai_providers import ask_ai, get_ai_status, reset_providers, extract_ticket_suggestion, AllProvidersFailedException
from backend.database import db_manager
from backend.ai.spell_corrector import correct_spelling
from backend.ai.ml_classifier import generate_accurate_diagnosis
from backend.routes.auth import get_optional_user

logger = logging.getLogger("fixlink.routes.ai")
router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

# ── In-Memory Rate Limiter (15 req / min) ───────────────────────────
class ChatRateLimiter:
    def __init__(self, requests_per_minute: int = 15):
        self.limit = requests_per_minute
        self.requests = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self.requests[key] = [t for t in self.requests[key] if now - t < 60]
        if len(self.requests[key]) >= self.limit:
            return False
        self.requests[key].append(now)
        return True

rate_limiter = ChatRateLimiter(requests_per_minute=CHAT_RATE_LIMIT_PER_MINUTE)

from backend.ai.solution_verification_engine import (
    run_generate_verify_correct_pipeline,
    process_complaint_with_verification
)

@router.get("/status")
async def check_ai_status():
    return {"providers": get_ai_status()}

@router.post("/reset-providers")
async def do_reset_providers():
    reset_providers()
    return {"status": "ok", "message": "All AI provider cooldown states reset."}

@router.get("/knowledge-base")
@router.get("/verified-knowledge")
async def get_knowledge_base(category: Optional[str] = None, q: Optional[str] = None):
    """Retrieve verified maintenance solutions from continuous learning repository."""
    if q:
        results = await db_manager.search_verified_knowledge(q, category=category)
    else:
        results = await db_manager.get_verified_solutions(category=category, limit=50)
    return results

@router.post("/verify-solution")
async def verify_solution_endpoint(payload: DiagnoseRequest):
    """Explicitly triggers Multi-LLM analysis & consensus verification for an issue."""
    raw_text = payload.text or payload.description or ""
    title = payload.title or ""
    description = payload.description or raw_text
    corrected_text, _ = correct_spelling(raw_text)
    lang = payload.preferredLang or detect_language(corrected_text or raw_text)
    
    # Retrieve prior verified knowledge if available
    prior_matches = await db_manager.search_verified_knowledge(corrected_text, payload.category)
    prior_context = ""
    if prior_matches:
        prior_context = f"Known fix: {prior_matches[0].get('identifiedProblem')} -> {', '.join(prior_matches[0].get('verifiedSolution', []))}"

    result = process_complaint_with_verification(
        complaint_text=corrected_text,
        category=payload.category or "general",
        lang=lang,
        title=title,
        description=description,
        prior_knowledge=prior_context
    )
    return result

@router.post("/diagnose")
async def diagnose(payload: DiagnoseRequest):
    raw_text = payload.text or payload.description or ""
    title = payload.title or ""
    description = payload.description or raw_text
    corrected_text, corrections = correct_spelling(raw_text)

    req_lang = (payload.preferredLang or "").strip().lower()
    if req_lang in ["ta", "en", "ml", "hi", "te", "kn"]:
        lang = req_lang
    else:
        lang = detect_language(corrected_text or raw_text)

    vision = None
    if payload.imageUrl:
        category_hint = payload.category or "other"
        vision = analyze_vision(category_hint, corrected_text)

    # ── Execute 4-Stage AI Pipeline: Understand -> Solve -> Cross-Verify -> Auto-Correct ──
    pipeline_res = await asyncio.to_thread(
        run_generate_verify_correct_pipeline,
        title=title,
        description=description,
        category_hint=payload.category,
        lang=lang
    )

    # Attach original text corrections and optional vision analysis
    response_payload = dict(pipeline_res)
    response_payload["originalText"] = raw_text
    response_payload["correctedText"] = corrected_text
    response_payload["corrections"] = corrections
    response_payload["language"] = lang
    if vision:
        response_payload["visionAnalysis"] = vision

    return response_payload

@router.post("/confirm")
async def handle_confirmation(payload: ConfirmRequest):
    if payload.confirmed:
        return {
            "status": "confirmed",
            "message": "Diagnosis confirmed. Proceeding to safety assessment & resolution guidance."
        }
    else:
        refinement_msg = generate_refinement_response(payload.language or "en")
        return {
            "status": "refining",
            "message": refinement_msg,
            "questions": [
                "Does the problem happen intermittently or continuously?",
                "Are there any burning smells, buzzing noises, or visible fluid stains?",
                "Would you like to capture another close-up photo or 5-second video?"
            ]
        }

@router.get("/predictive")
async def get_predictive_alerts():
    complaints = await db_manager.get_complaints()
    alerts = analyze_predictive_maintenance(complaints)
    return alerts

@router.post("/chat")
async def chat_with_assistant(
    request: Request,
    payload: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    # 1. Rate Limiting Check (15 req/min per user or IP)
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_key = current_user.get("id") if current_user else client_ip
    if not rate_limiter.is_allowed(user_key):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. You can send up to 15 requests per minute. Please wait a moment."
        )

    # 2. Extract & Format Messages
    messages_data: List[Dict[str, Any]] = []
    if payload.messages and len(payload.messages) > 0:
        for m in payload.messages:
            messages_data.append({
                "role": m.role,
                "content": m.content
            })
    elif payload.message:
        messages_data.append({
            "role": "user",
            "content": payload.message
        })
    else:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    # 3. Call priority chain (OpenAI -> DeepSeek -> Gemini) with Layer 2 Off-Topic Guard
    user_lang = payload.language or "en"
    try:
        result = ask_ai(
            messages=messages_data,
            user_lang=user_lang,
            user_key=user_key
        )
    except AllProvidersFailedException as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Unexpected chat error: {exc}")
        raise HTTPException(
            status_code=503,
            detail="AI assistant is temporarily unavailable. Please try again later or raise a complaint directly."
        )

    is_offtopic = result.get("offTopic", False)

    # 4. Save to Database if user is logged in (skip storing off-topic chit-chat)
    if current_user and not is_offtopic:
        user_id = current_user.get("id")
        last_user_msg = messages_data[-1]["content"] if messages_data and messages_data[-1]["role"] == "user" else ""
        if last_user_msg:
            await db_manager.save_chat_message(user_id, {
                "role": "user",
                "content": last_user_msg,
                "lang": user_lang
            })
        await db_manager.save_chat_message(user_id, {
            "role": "assistant",
            "content": result["reply"],
            "lang": user_lang
        })

    # Return pure reply, offTopic flag, and structured ticket / DIY metadata (NO provider names)
    return {
        "reply": result["reply"],
        "offTopic": is_offtopic,
        "detectedCategory": result["detectedCategory"],
        "diyGuide": result.get("diyGuide") if not is_offtopic else None,
        "structuredTicket": result.get("structuredTicket") if not is_offtopic else None
    }

@router.get("/chat/history")
async def get_chat_history(current_user: Optional[dict] = Depends(get_optional_user)):
    if not current_user:
        return []
    history = await db_manager.get_chat_history(current_user.get("id"), limit=50)
    return history

@router.delete("/chat/history")
async def clear_chat_history(current_user: Optional[dict] = Depends(get_optional_user)):
    if not current_user:
        return {"status": "ok", "cleared": False}
    await db_manager.clear_chat_history(current_user.get("id"))
    return {"status": "ok", "cleared": True}

@router.post("/chat/extract-ticket")
async def extract_ticket(payload: StructuredTicketRequest):
    messages_data = [{"role": m.role, "content": m.content} for m in payload.messages]
    ticket = extract_ticket_suggestion(messages_data, "")
    return ticket

@router.post("/upload")
async def upload_evidence(file: UploadFile = File(...)):
    filename = f"media_{int(time.time() * 1000)}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"imageUrl": f"/uploads/{filename}"}
