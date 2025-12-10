
import pdfplumber
from io import BytesIO
from app.core.logging import logger

class PDFService:
    def extract_text(self, pdf_bytes: bytes) -> tuple[str, float]:
        """
        Extracts text from PDF bytes.
        Returns: (extracted_text, confidence_score)
        """
        try:
            text_content = []
            with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)
            
            full_text = "\n".join(text_content)
            # Heuristic confidence: if text length > 0, we assume decent extraction
            confidence = 1.0 if full_text.strip() else 0.0
            
            # TODO: Fallback to OCR if text is empty (omitted for brevity, can call ocr_service)
            return full_text, confidence
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            return "", 0.0

pdf_service = PDFService()
