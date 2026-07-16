"""
Document Handler for OCR Worker
Handles general document OCR processing
"""
import logging
from typing import Optional
from ..services.ocr_engine import OCREngine

logger = logging.getLogger(__name__)


class DocumentHandler:
    """
    Handler for general document OCR processing.
    """
    
    def __init__(self, ocr_engine: OCREngine):
        """
        Initialize document handler.
        
        Args:
            ocr_engine: OCR engine instance
        """
        self.ocr_engine = ocr_engine
    
    def process(self, file_path: str, job_id: str, doc_type: str = "general") -> dict:
        """
        Process a general document.
        
        Args:
            file_path: Path to document
            job_id: Job identifier
            doc_type: Document type (general, award, etc.)
        
        Returns:
            dict with OCR result
        """
        try:
            # Perform OCR
            ocr_result = self.ocr_engine.process_file(file_path, language="mixed")
            
            raw_text = ocr_result["text"]
            
            # Determine document category
            category = self._classify_document(raw_text)
            
            return {
                "job_id": job_id,
                "status": "succeeded",
                "raw_text": raw_text,
                "document_type": doc_type,
                "detected_category": category,
                "confidence": ocr_result["confidence"],
                "stats": {
                    "pages": ocr_result.get("pages", 1),
                    "lines": ocr_result.get("lines", 0),
                },
            }
            
        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}")
            return {
                "job_id": job_id,
                "status": "failed",
                "error": str(e),
            }
    
    def _classify_document(self, text: str) -> Optional[str]:
        """
        Classify document based on content.
        
        Args:
            text: OCR extracted text
        
        Returns:
            Document category or None
        """
        text_lower = text.lower()
        
        # Award related
        if any(kw in text for kw in ["獎學金", "獎狀", "學業獎", "品行獎", "服務獎", "體育獎"]):
            return "award"
        
        # Receipt related
        if any(kw in text for kw in ["收據", "收據編號", "付款", "港幣", "HK$"]):
            return "receipt"
        
        # Certificate related
        if any(kw in text for kw in ["茲證明", "在學證明", "出席證明", "學號"]):
            return "certificate"
        
        # Invoice related
        if any(kw in text for kw in ["發票", "發票編號", "稅項"]):
            return "invoice"
        
        # Letter related
        if any(kw in text for kw in ["敬啟者", "啟者", "來函"]):
            return "letter"
        
        return "general"
    
    def extract_key_value_pairs(self, text: str) -> dict:
        """
        Extract key-value pairs from structured text.
        
        Args:
            text: OCR extracted text
        
        Returns:
            dict of extracted key-value pairs
        """
        import re
        
        pairs = {}
        
        # Common patterns
        patterns = [
            r"([^\n:：]+)[:：]\s*([^\n]+)",
            r"([A-Za-z]+):\s*([^\n]+)",
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                key = match.group(1).strip()
                value = match.group(2).strip()
                if key and value and len(key) < 50:
                    pairs[key] = value
        
        return pairs
