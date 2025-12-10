
# Agentic AI Workspace

A production-quality agentic application built with **FastAPI** (Backend) and **React** (Frontend). It uses **Google Gemini** for intelligent planning and execution of tasks including text extraction, summarization, sentiment analysis, audio transcription, and code explanation.

## Features
- **Multimodal Input**: Text, Images, PDFs, Audio, and YouTube URLs.
- **Agentic Workflow**: 
    - **Planner**: Determines intent and creates a step-by-step plan.
    - **Executor**: Executes steps (OCR, ASR, LLM calls) and logs progress.
- **Clean UI**: Premium Glassmorphism design using Vanilla CSS.
- **Explainability**: View detailed execution plans and logs.

## Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key

### Backend
1. Navigate to `backend/`.
2. Create virtual env: `python -m venv venv`.
3. Activate: `venv\Scripts\activate`.
4. Install: `pip install -r requirements.txt`.
5. Set up `.env`: Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
6. Run: `python -m uvicorn app.main:app --reload`.

### Frontend
1. Navigate to `frontend/`.
2. Install: `npm install`.
3. Run: `npm run dev`.

### Usage
- Open `http://localhost:5173`.
- Type a query or upload a file.
- Example: 
    - Upload an image of code -> "Explain this".
    - Paste a YouTube URL -> "Summarize this video".

## Architecture
See `docs/architecture.md` for details.
