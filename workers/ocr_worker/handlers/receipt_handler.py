"""
Receipt Handler for OCR Worker
Handles receipt-specific OCR processing and structured extraction
"""
import logging
from typing import Optional
from ..services.ocr_engine import OCREngine

logger = logging.getLogger(__name__)


class ReceiptHandler:
    """
    Handler for receipt OCR processing.
    Extracts structured financial fields from receipt images.
    """
    
    # Prompt for receipt extraction
    EXTRACTION_PROMPT = """
    You are a receipt data extraction assistant for Hong Kong schools.
    
    Extract the following fields from the OCR text:
    - amount: Total amount in HKD (number)
    - date: Transaction date (YYYY-MM-DD)
    - payer: Name of payer (if visible)
    - purpose: Description of payment
    - receipt_no: Receipt number (if visible)
    - payment_method: cash/cheque/card/transfer
    
    Return a JSON object with the extracted fields.
    If a field is not visible or unclear, use null.
    Include a confidence level: high/medium/low.
    Add warnings for any OCR issues.
    """
    
    def __init__(self, ocr_engine: OCREngine):
        """
        Initialize receipt handler.
        
        Args:
            ocr_engine: OCR engine instance
        """
        self.ocr_engine = ocr_engine
    
    def process(self, file_path: str, job_id: str) -> dict:
        """
        Process a receipt image.
        
        Args:
            file_path: Path to receipt image
            job_id: Job identifier
        
        Returns:
            dict with extracted fields
        """
        try:
            # Perform OCR
            ocr_result = self.ocr_engine.process_file(file_path, language="zh-HK")
            
            raw_text = ocr_result["text"]
            
            # Extract structured data (mock implementation)
            # In production, this would call an LLM API
            extracted = self._extract_fields(raw_text, ocr_result)
            
            return {
                "job_id": job_id,
                "status": "succeeded",
                "raw_text": raw_text,
                "extracted_fields": extracted,
                "confidence": ocr_result["confidence"],
                "warnings": extracted.get("warnings", []),
            }
            
        except Exception as e:
            logger.error(f"Receipt processing failed: {str(e)}")
            return {
                "job_id": job_id,
                "status": "failed",
                "error": str(e),
            }
    
    def _extract_fields(self, raw_text: str, ocr_result: dict) -> dict:
        """
        Extract structured fields from OCR text.
        
        This is a mock implementation. In production, integrate with LLM API.
        
        Args:
            raw_text: OCR extracted text
            ocr_result: OCR result metadata
        
        Returns:
            dict with extracted fields
        """
        import re
        from datetime import datetime
        
        fields = {
            "amount": None,
            "currency": "HKD",
            "date": None,
            "payer": None,
            "purpose": None,
            "receipt_no": None,
            "payment_method": None,
        }
        warnings = []
        
        # Extract amount
        amount_patterns = [
            r"HK\$\s*([\d,]+\.?\d*)",
            r"港幣?\s*([\d,]+\.?\d*)",
            r"\$\s*([\d,]+\.?\d*)",
        ]
        for pattern in amount_patterns:
            match = re.search(pattern, raw_text)
            if match:
                amount_str = match.group(1).replace(",", "")
                try:
                    fields["amount"] = float(amount_str)
                    break
                except ValueError:
                    pass
        
        # Extract date
        date_patterns = [
            r"(\d{4})[年/](\d{1,2})[月/](\d{1,2})",
            r"(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})",
        ]
        for pattern in date_patterns:
            match = re.search(pattern, raw_text)
            if match:
                try:
                    if len(match.group(1)) == 4:
                        year, month, day = match.groups()
                    else:
                        day, month, year = match.groups()
                        year = "20" + year if len(year) == 2 else year
                    fields["date"] = f"{int(year):04d}-{int(month):02d}-{int(day):02d}"
                    break
                except (ValueError, IndexError):
                    pass
        
        # Extract receipt number
        receipt_match = re.search(r"收據[號編]?[:：]?\s*([A-Z0-9]+)", raw_text)
        if receipt_match:
            fields["receipt_no"] = receipt_match.group(1)
        
        # Extract purpose (last significant line)
        lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
        if lines:
            for line in reversed(lines):
                if any(kw in line for kw in ["項目", "用途", "費用", "項目:"]):
                    fields["purpose"] = line.split(":", 1)[-1].strip() if ":" in line else line
                    break
        
        # Extract payment method
        if "現金" in raw_text:
            fields["payment_method"] = "cash"
        elif "支票" in raw_text:
            fields["payment_method"] = "cheque"
        elif "轉帳" in raw_text:
            fields["payment_method"] = "transfer"
        elif "信用卡" in raw_text:
            fields["payment_method"] = "card"
        
        # Determine confidence
        if fields["amount"] and fields["date"]:
            confidence = "high" if ocr_result.get("confidence") == "high" else "medium"
        elif fields["amount"] or fields["date"]:
            confidence = "medium"
        else:
            confidence = "low"
            warnings.append("Critical fields (amount or date) not extracted")
        
        # Add warnings for missing fields
        if not fields["amount"]:
            warnings.append("Amount not found in receipt")
        if not fields["date"]:
            warnings.append("Date not found in receipt")
        
        return {
            **fields,
            "confidence": confidence,
            "warnings": warnings,
        }
