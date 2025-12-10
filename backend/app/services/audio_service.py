
from app.services.llm_gemini import gemini_service
from app.core.logging import logger
import tempfile
import os

class AudioService:
    async def process_audio(self, audio_bytes: bytes, filename: str) -> dict:
        """
        Transcribes and summarizes audio using Gemini.
        """
        try:
            # Save bytes to temp file because Gemini upload needs path
            # In production, might use cleaner temp handling
            # Note: We need a file extension for Gemini to recognize MIME type
            ext = os.path.splitext(filename)[1]
            if not ext:
                ext = ".mp3" # default
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            # Prompt to get specific format
            prompt = """
            Please transcribe this audio and provide a summary.
            Output ONLY valid JSON with keys:
            - transcript
            - one_line_summary
            - bullet_points (list of 3 strings)
            - five_sentence_summary
            - duration (string like '5:30' or '300s')
            """
            
            # Use generation service
            # We assume gemini_service can handle audio upload
            response_text = await gemini_service.generate_with_audio(tmp_path, prompt)
            
            # Clean up
            os.unlink(tmp_path)
            
            return response_text # Logic to parse JSON goes in task executor
            
        except Exception as e:
            logger.error(f"Audio processing failed: {e}")
            return {"error": str(e)}

audio_service = AudioService()
