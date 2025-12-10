
import google.generativeai as genai
from app.core.config import settings
from app.core.logging import logger
from typing import Optional, List, Dict, Any
import json

class GeminiService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Using gemini-2.0-flash-exp as requested (interpreted from "2.5")
            self.model = genai.GenerativeModel('gemini-2.5-flash') 
            self.vision_model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            logger.warning("GEMINI_API_KEY not set. Gemini service will fail if used.")
            self.model = None

    async def generate_text(self, prompt: str) -> str:
        if not self.model:
            raise ValueError("Gemini API Key not set")
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            raise e

    async def generate_with_audio(self, audio_file_path: str, prompt: str) -> str:
        # Placeholder for native audio support
        # logic: upload file to gemini, then prompting
        # efficient implementation:
        if not self.model:
             raise ValueError("Gemini API Key not set")
        try:
            # Upload the file
            audio_file = genai.upload_file(path=audio_file_path)
            response = await self.model.generate_content_async([prompt, audio_file])
            return response.text
        except Exception as e:
             logger.error(f"Gemini audio generation error: {e}")
             raise e

    async def generate_from_image(self, image_bytes: bytes, prompt: str) -> str:
        if not self.vision_model:
            raise ValueError("Gemini API Key not set")
        try:
            from PIL import Image
            import io
            
            image = Image.open(io.BytesIO(image_bytes))
            response = await self.vision_model.generate_content_async([prompt, image])
            return response.text
        except Exception as e:
            logger.error(f"Gemini vision generation error: {e}")
            raise e

gemini_service = GeminiService()
