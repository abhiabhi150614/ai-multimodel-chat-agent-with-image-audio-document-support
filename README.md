
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

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  External APIs  │
│   (React)       │    │   (FastAPI)     │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Chat UI       │◄──►│ • Agent Planner │◄──►│ • Gemini API    │
│ • File Upload   │    │ • Agent Executor│    │ • YouTube API   │
│ • Plan/Logs     │    │ • OCR Service   │    │ • Tesseract OCR │
│ • Glassmorphism │    │ • PDF Service   │    │                 │
└─────────────────┘    │ • Audio Service │    └─────────────────┘
                       │ • History Mgmt  │
                       └─────────────────┘
```

### Core Components

**Frontend (React + TypeScript)**
- `ChatLayout.tsx` - Main chat interface
- `MessageList.tsx` - Message display  
- `InputBar.tsx` - User input handling
- `PlanAndLogsPanel.tsx` - Execution visualization

**Backend Services**
- **Agent Planner**: Analyzes intent, creates execution plans, handles clarification
- **Agent Executor**: Executes plans with real-time logging and error recovery
- **LLM Service**: Gemini API integration with timeout management
- **OCR Service**: Image text extraction with confidence scoring
- **PDF Service**: Document text extraction
- **Audio Service**: Transcription and summarization
- **YouTube Service**: Video transcript fetching
- **History Service**: Conversation state management

### Data Flow
```
User Input → Intent Analysis → Plan Generation → Execution → Response
     ↓              ↓              ↓           ↓         ↓
File Upload → Context Building → Service Dispatch → Logging → UI Update
```

### Key Features
- **Intelligent Planning**: Fast-path for common queries, clarification logic
- **Multimodal Processing**: Images, PDFs, Audio, YouTube URLs
- **Real-time Monitoring**: Step-by-step execution logs and performance metrics
- **Conversation Context**: Persistent chat history and context awareness
