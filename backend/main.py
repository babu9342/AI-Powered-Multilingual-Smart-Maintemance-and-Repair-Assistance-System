import os
import sys

# Ensure root workspace directory is in sys.path for robust relative/absolute imports
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import UPLOAD_DIR
from backend.database import db_manager
from backend.routes.auth import router as auth_router
from backend.routes.complaints import router as complaints_router
from backend.routes.technicians import router as technicians_router
from backend.routes.ai import router as ai_router
from backend.routes.notifications import router as notifications_router
from backend.routes.reports import router as reports_router

from backend.ai.solution_verification_engine import check_gemini_models_startup

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[FixLink] Starting up backend server...")
    check_gemini_models_startup()
    await db_manager.connect()
    yield
    print("[FixLink] Shutting down backend server...")
    if db_manager.client:
        db_manager.client.close()


app = FastAPI(
    title="FixLink: AI-Powered Multilingual Smart Maintenance System API",
    description="Production-level FastAPI backend connecting Users and Technicians with Multilingual AI Diagnostics, Computer Vision, and Predictive Maintenance.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite port 5173 / 3000 / localhost / 127.0.0.1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media mount
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(technicians_router)
app.include_router(ai_router)
app.include_router(notifications_router)
app.include_router(reports_router)

# Direct aliases for /api/chat and AI status
from backend.models import ChatRequest, StructuredTicketRequest
from backend.routes.auth import get_optional_user
from backend.routes.ai import chat_with_assistant, get_chat_history, clear_chat_history, extract_ticket, check_ai_status
from fastapi import Request, Depends
from typing import Optional

@app.get("/api/ai-status", tags=["AI Engine"])
async def direct_ai_status():
    return await check_ai_status()

@app.post("/api/chat", tags=["AI Engine"])
async def direct_chat(request: Request, payload: ChatRequest, current_user: Optional[dict] = Depends(get_optional_user)):
    return await chat_with_assistant(request, payload, current_user)

@app.get("/api/chat/history", tags=["AI Engine"])
async def direct_chat_history(current_user: Optional[dict] = Depends(get_optional_user)):
    return await get_chat_history(current_user)

@app.delete("/api/chat/history", tags=["AI Engine"])
async def direct_clear_chat_history(current_user: Optional[dict] = Depends(get_optional_user)):
    return await clear_chat_history(current_user)

@app.post("/api/chat/extract-ticket", tags=["AI Engine"])
async def direct_extract_ticket(payload: StructuredTicketRequest):
    return await extract_ticket(payload)


@app.get("/api/health")
async def health():
    return {
        "app": "FixLink",
        "status": "healthy",
        "database": "mongodb" if db_manager.use_mongo else "in-memory fallback",
        "roles": ["User", "Technician"],
        "adminModule": False
    }

# Mount Frontend Dist assets if directory exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
assets_dir = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/")
async def serve_spa_root():
    from fastapi.responses import FileResponse, HTMLResponse
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse("<h2>FixLink Backend Running. Open frontend at <a href='http://localhost:5173'>http://localhost:5173</a> or run <code>npm run build</code> in frontend.</h2>")

@app.get("/{full_path:path}")
async def serve_spa_catchall(full_path: str):
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    if full_path.startswith("api") or full_path.startswith("uploads") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    file_path = os.path.join(frontend_dist, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="SPA index not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
