
# System Architecture

## Overview
The application follows a client-server architecture. 
- **Frontend**: A React Single Page Application (SPA) served via Vite.
- **Backend**: A Python FastAPI server exposing REST endpoints.

## Agent Design
The core intelligence is split into two phases:

### 1. Planning Phase (`AgentPlanner`)
- **Input**: User text, file type, conversation history.
- **Process**: Uses Gemini Pro/Flash to analyze intent. It generates a dynamic list of steps (e.g., "extract_text", then "summarize").
- **Output**: A JSON plan containing steps and descriptions. Or a clarification question if ambiguous.

### 2. Execution Phase (`AgentExecutor`)
- **Input**: The Plan.
- **Process**: Iterates through steps. Each step corresponds to a specific service capability.
- **Context Passing**: Intermediate results (like extracted text) are passed in a context dictionary to subsequent steps.
- **Logging**: Each step execution is timed and logged.

## Services
- **OCRService**: Uses `pytesseract` to extract text from images.
- **PDFService**: Uses `pdfplumber` for text extraction.
- **YouTubeService**: Fetches transcripts using `youtube_transcript_api`.
- **AudioService**: Uses Gemini's native multimodal capabilities to transcribe and summarize audio files.
- **GeminiService**: Central wrapper for Google Generative AI interactions.

## Security & Config
- API Keys are managed via `.env` file and `pydantic-settings`.
- Frontend communicates with Backend via standard HTTP requests (multipart form data).
