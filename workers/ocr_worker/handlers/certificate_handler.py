"""
Certificate Handler for OCR Worker
Handles certificate/document OCR processing
"""
import logging
from typing import Optional
from ..services.ocr_engine import OCREngine

logger = logging.getLogger(__name__)


class CertificateHandler:
    """
    Handler for certificate OCR processing.
    Extracts student information from certificate documents.
    """
    
    def __init__(self, ocr_engine: OCREngine):
        """
        Initialize certificate handler.
        
        Args:
            ocr_engine: OCR engine instance
        """
        self.ocr_engine = ocr_engine
    
    def process(self, file_path: str, job_id: str) -> dict:
        """
        Process a certificate document.
        
        Args:
            file_path: Path to certificate image/PDF
            job_id: Job identifier
        
        Returns:
            dict with extracted fields
        """
        try:
            # Perform OCR
            ocr_result = self.ocr_engine.process_file(file_path, language="zh-HK")
            
            raw_text = ocr_result["text"]
            
            # Extract structured data
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
            logger.error(f"Certificate processing failed: {str(e)}")
            return {
                "job_id": job_id,
                "status": "failed",
                "error": str(e),
            }
    
    def _extract_fields(self, raw_text: str, ocr_result: dict) -> dict:
        """
        Extract structured fields from certificate text.
        
        Args:
            raw_text: OCR extracted text
            ocr_result: OCR result metadata
        
        Returns:
            dict with extracted fields
        """
        import re
        
        fields = {
            "student_name": None,
            "student_no": None,
            "class_name": None,
            "certificate_type": None,
            "issue_date": None,
            "school_name": None,
        }
        warnings = []
        
        # Extract student name
        name_patterns = [
            r"學生(?:姓名|Name)[:：]\s*([^\n]+)",
            r"茲證明\s*\n+([^\n]+)",
            r"學生[:：]\s*([A-Za-z\s]+)",
        ]
        for pattern in name_patterns:
            match = re.search(pattern, raw_text)
            if match:
                fields["student_name"] = match.group(1).strip()
                break
        
        # Extract student number
        student_no_patterns = [
            r"學號[:：]\s*([A-Z0-9]+)",
            r"Student\s*(?:Number|No)[:：]\s*([A-Z0-9]+)",
        ]
        for pattern in student_no_patterns:
            match = re.search(pattern, raw_text)
            if match:
                fields["student_no"] = match.group(1).strip()
                break
        
        # Extract class
        class_patterns = [
            r"(?:班別|Class)[:：]\s*([A-Za-z0-9.]+)",
            r"F\.?(\d+)[A-Z]",
        ]
        for pattern in class_patterns:
            match = re.search(pattern, raw_text)
            if match:
                fields["class_name"] = match.group(0).strip()
                break
        
        # Extract certificate type
        if "在學" in raw_text or "enrollment" in raw_text.lower():
            fields["certificate_type"] = "enrollment"
        elif "出席" in raw_text or "attendance" in raw_text.lower():
            fields["certificate_type"] = "attendance"
        elif "畢業" in raw_text or "graduation" in raw_text.lower():
            fields["certificate_type"] = "graduation"
        elif "轉校" in raw_text or "transfer" in raw_text.lower():
            fields["certificate_type"] = "transfer"
        
        # Extract date
        date_patterns = [
            r"(\d{4})年(\d{1,2})月(\d{1,2})日",
            r"(\d{4})-(\d{1,2})-(\d{1,2})",
        ]
        for pattern in date_patterns:
            match = re.search(pattern, raw_text)
            if match:
                try:
                    if "年" in pattern:
                        year, month, day = match.groups()
                    else:
                        year, month, day = match.groups()
                    fields["issue_date"] = f"{int(year):04d}-{int(month):02d}-{int(day):02d}"
                    break
                except (ValueError, IndexError):
                    pass
        
        # Check for school name
        if "培英" in raw_text:
            fields["school_name"] = "香港培英中學"
        elif "Po Ying" in raw_text or "Po Ying" in raw_text:
            fields["school_name"] = "Po Ying Secondary School"
        
        # Determine confidence
        found_fields = sum(1 for v in fields.values() if v)
        total_fields = len(fields)
        
        if found_fields >= 4:
            confidence = "high"
        elif found_fields >= 2:
            confidence = "medium"
        else:
            confidence = "low"
            warnings.append("Very few fields extracted - document may be low quality")
        
        # Add warnings for missing fields
        if not fields["student_name"]:
            warnings.append("Student name not found")
        if not fields["student_no"]:
            warnings.append("Student number not found")
        
        return {
            **fields,
            "confidence": confidence,
            "warnings": warnings,
        }
