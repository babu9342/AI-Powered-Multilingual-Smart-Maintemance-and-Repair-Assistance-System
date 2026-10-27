@echo off
title FixLink Launcher
echo ====================================================
echo Starting FixLink System (Backend + Frontend)
echo ====================================================

start "FixLink Backend (Port 8000)" cmd /k "cd /d "%~dp0" && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "FixLink Frontend (Port 5173)" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

echo.
echo FixLink is starting!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
pause
