from app.services.llm_gemini import gemini_service
from app.core.logging import logger

class OCRService:
    async def extract_text(self, image_bytes: bytes) -> tuple[str, float]:
        """
        Extracts text from image bytes using Gemini Vision.
        Returns: (extracted_text, confidence_score)
        """
        try:
            # We use Gemini 1.5 Flash for fast OCR
            text = await gemini_service.generate_from_image(
                image_bytes, 
                "Extract all visible text from this image. Output ONLY the extracted text. Maintain layout if possible."
            )
            
            # Confidence is hard to get from LLM, so we assume high if successful
            return text.strip(), 0.95
            
        except Exception as e:
            logger.error(f"OCR (Gemini) failed: {e}")
            return "", 0.0

ocr_service = OCRService()
