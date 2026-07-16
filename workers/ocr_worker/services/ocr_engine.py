"""
OCR Engine - Wrapper for OCR engines (PaddleOCR/Tesseract)
"""
import logging
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class OCREngine:
    """
    OCR Engine that wraps PaddleOCR with fallback to Tesseract.
    """
    
    def __init__(self, use_gpu: bool = False):
        """
        Initialize OCR engine.
        
        Args:
            use_gpu: Whether to use GPU acceleration
        """
        self.use_gpu = use_gpu
        self._engine = None
        self._engine_type = None
    
    def _get_engine(self):
        """Get or initialize the OCR engine."""
        if self._engine is not None:
            return self._engine
        
        # Try PaddleOCR first
        try:
            from paddleocr import PaddleOCR
            self._engine = PaddleOCR(
                use_angle_cls=True,
                lang='ch',
                use_gpu=self.use_gpu,
                show_log=False,
            )
            self._engine_type = "paddleocr"
            logger.info("Initialized PaddleOCR engine")
            return self._engine
        except ImportError:
            logger.warning("PaddleOCR not available, falling back to Tesseract")
        
        # Fallback to Tesseract
        try:
            import pytesseract
            from PIL import Image
            self._engine = {"pytesseract": pytesseract, "Image": Image}
            self._engine_type = "tesseract"
            logger.info("Initialized Tesseract OCR engine")
            return self._engine
        except ImportError:
            logger.error("No OCR engine available")
            raise ImportError("Neither PaddleOCR nor Tesseract is available")
    
    def process_file(self, file_path: str, language: str = "zh-HK") -> dict:
        """
        Process a file and extract text.
        
        Args:
            file_path: Path to the file
            language: Language code (zh-HK, en, mixed)
        
        Returns:
            dict with extracted text and metadata
        """
        engine = self._get_engine()
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Check file type
        ext = path.suffix.lower()
        if ext not in [".pdf", ".jpg", ".jpeg", ".png", ".bmp", ".tiff"]:
            raise ValueError(f"Unsupported file type: {ext}")
        
        if self._engine_type == "paddleocr":
            return self._process_with_paddleocr(file_path, language)
        elif self._engine_type == "tesseract":
            return self._process_with_tesseract(file_path, language)
        else:
            raise RuntimeError("No OCR engine initialized")
    
    def _process_with_paddleocr(self, file_path: str, language: str) -> dict:
        """Process file with PaddleOCR."""
        engine = self._get_engine()
        
        # Run OCR
        result = engine.ocr(file_path, cls=True)
        
        # Extract text
        lines = []
        confidences = []
        
        if result and result[0]:
            for line in result[0]:
                if line:
                    text = line[1][0]
                    confidence = line[1][1]
                    lines.append(text)
                    confidences.append(confidence)
        
        # Calculate average confidence
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Determine confidence level
        if avg_confidence > 0.9:
            confidence_level = "high"
        elif avg_confidence > 0.7:
            confidence_level = "medium"
        else:
            confidence_level = "low"
        
        return {
            "text": "\n".join(lines),
            "confidence": confidence_level,
            "avg_confidence": avg_confidence,
            "pages": 1,
            "lines": len(lines),
            "engine": "paddleocr",
        }
    
    def _process_with_tesseract(self, file_path: str, language: str) -> dict:
        """Process file with Tesseract."""
        engine = self._get_engine()
        pytesseract = engine["pytesseract"]
        Image = engine["Image"]
        
        # Load image
        image = Image.open(file_path)
        
        # Determine Tesseract language config
        lang_map = {
            "zh-HK": "chi_tra",
            "en": "eng",
            "mixed": "chi_tra+eng",
        }
        tess_lang = lang_map.get(language, "chi_tra+eng")
        
        # Run OCR
        text = pytesseract.image_to_string(
            image,
            lang=tess_lang,
            config="--psm 6"
        )
        
        return {
            "text": text.strip(),
            "confidence": "medium",  # Tesseract doesn't provide per-block confidence
            "avg_confidence": 0.75,
            "pages": 1,
            "lines": len(text.split("\n")),
            "engine": "tesseract",
        }
    
    def process_pdf(self, pdf_path: str, language: str = "zh-HK") -> dict:
        """
        Process a multi-page PDF.
        
        Args:
            pdf_path: Path to PDF file
            language: Language code
        
        Returns:
            dict with extracted text from all pages
        """
        import fitz  # PyMuPDF
        
        doc = fitz.open(pdf_path)
        all_text = []
        pages = len(doc)
        
        for page_num in range(pages):
            page = doc[page_num]
            # Convert page to image
            mat = fitz.Matrix(2, 2)  # 2x zoom
            pix = page.get_pixmap(matrix=mat)
            
            # Save to temporary file
            temp_path = f"/tmp/ocr_page_{page_num}.png"
            pix.save(temp_path)
            
            # Process page
            result = self.process_file(temp_path, language)
            all_text.append(result["text"])
        
        doc.close()
        
        return {
            "text": "\n\n".join(all_text),
            "confidence": "medium",
            "pages": pages,
            "lines": sum(len(t.split("\n")) for t in all_text),
            "engine": self._engine_type,
        }
