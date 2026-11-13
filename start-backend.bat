@echo off
echo Starting AI SECURITY FASTER Backend on http://localhost:8000 ...
cd backend
python -m uvicorn app.main:app --reload --port 8000

