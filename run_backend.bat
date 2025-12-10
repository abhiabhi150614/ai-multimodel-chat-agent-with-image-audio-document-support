
@echo off
echo Starting Backend...
cd backend
call venv\Scripts\activate
python -m uvicorn app.main:app --reload
pause
