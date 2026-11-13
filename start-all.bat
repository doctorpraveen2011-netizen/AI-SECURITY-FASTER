@echo off
echo ========================================================
echo    AI SECURITY FASTER — AI Security Testing Lab
echo ========================================================
echo Starting Backend in a separate window...
start "AI Security Faster - Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak >nul
echo Starting Frontend in a separate window...
start "AI Security Faster - Frontend" cmd /k "cd frontend && npm run dev"
echo Platform starting:
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8000/docs
echo ========================================================

