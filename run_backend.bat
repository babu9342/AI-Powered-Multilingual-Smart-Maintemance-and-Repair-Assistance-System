@echo off
title FixLink Backend Server (Port 8000)
echo ====================================================
echo Starting FixLink FastAPI AI Backend on http://127.0.0.1:8000
echo ====================================================
cd /d "%~dp0"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
