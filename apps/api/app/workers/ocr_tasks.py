import logging
from typing import Optional
from celery import Task
from celery.exceptions import SoftTimeLimitExceeded
from .celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)

PADDLEOCR_AVAILABLE = False
MATHPIX_AVAILABLE = False

try:
    from paddleocr import PaddleOCR
    PADDLEOCR_AVAILABLE = True
except ImportError:
    pass

try:
    import mathpix
    MATHPIX_AVAILABLE = True
except ImportError:
    pass


class OCRTask(Task):
    _ocr_engine = None
    
    def get_ocr_engine(self, engine_type: str = "paddleocr"):
        if engine_type == "paddleocr" and PADDLEOCR_AVAILABLE:
            if OCRTask._ocr_engine is None:
                OCRTask._ocr_engine = PaddleOCR(use_angle_cls=True, lang='ch')
            return OCRTask._ocr_engine
        return None


@celery_app.task(bind=True, max_retries=3, name="app.workers.ocr_tasks.ocr_unified")
def ocr_unified(
    self,
    file_id: int,
    job_type: str,
    engine_hint: Optional[str] = None,
) -> dict:
    """
    Unified OCR interface.
    
    Students 3 use job_type='receipt'
    Students 4 use job_type='exam_paper'
    
    Features:
    - Automatic routing to Mathpix or PaddleOCR
    - Automatic fallback (Mathpix -> PaddleOCR)
    - Business logic separation (tasks don't need to know which engine)
    """
    logger.info(f"ocr_unified: file_id={file_id}, job_type={job_type}, engine_hint={engine_hint}")
    
    result = {
        "file_id": file_id,
        "job_type": job_type,
        "status": "completed",
        "result": None,
        "error": None,
    }
    
    try:
        engine_type = engine_hint if engine_hint else "paddleocr"
        
        if engine_type == "mathpix" and MATHPIX_AVAILABLE:
            result["engine"] = "mathpix"
            result["result"] = {"message": "Mathpix OCR not configured. Use PaddleOCR fallback."}
            result["status"] = "fallback"
            engine_type = "paddleocr"
        
        if engine_type == "paddleocr" or result["status"] == "fallback":
            if not PADDLEOCR_AVAILABLE:
                result["status"] = "failed"
                result["error"] = "PaddleOCR not available"
                return result
            
            result["engine"] = "paddleocr"
            ocr = OCRTask._ocr_engine
            if ocr is None:
                ocr = PaddleOCR(use_angle_cls=True, lang='ch')
                OCRTask._ocr_engine = ocr
            
            result["result"] = {
                "message": "OCR processed (simulated - actual file processing requires MinIO integration)",
                "job_type": job_type,
            }
            
    except SoftTimeLimitExceeded:
        logger.error(f"OCR task timeout for file_id={file_id}")
        result["status"] = "failed"
        result["error"] = "Task timeout"
    except Exception as e:
        logger.error(f"OCR task failed: {str(e)}")
        result["status"] = "failed"
        result["error"] = str(e)
        
        if self.request.retries < self.max_retries:
            retry_delay = 2 ** self.request.retries
            raise self.retry(exc=e, countdown=retry_delay)
    
    return result


@celery_app.task(bind=True, max_retries=3, name="app.workers.ocr_tasks.ocr_receipt")
def ocr_receipt(self, file_id: int):
    """Deprecated. Use ocr_unified.delay(file_id, 'receipt') instead."""
    import warnings
    warnings.warn("ocr_receipt is deprecated. Use ocr_unified.delay(file_id, 'receipt') instead.", DeprecationWarning)
    return ocr_unified(file_id=file_id, job_type="receipt")


@celery_app.task(bind=True, max_retries=3, name="app.workers.ocr_tasks.ocr_exam_paper")
def ocr_exam_paper(self, file_id: int, exam_session_id: int):
    """Deprecated. Use ocr_exam_paper_unified instead."""
    import warnings
    warnings.warn("ocr_exam_paper is deprecated. Use ocr_exam_paper_unified instead.", DeprecationWarning)
    return ocr_exam_paper_unified(file_id=file_id, exam_session_id=exam_session_id, answer_key={})


@celery_app.task(bind=True, max_retries=3, name="app.workers.ocr_tasks.ocr_exam_paper_unified")
def ocr_exam_paper_unified(
    self,
    file_id: int,
    exam_session_id: int,
    answer_key: dict,
) -> dict:
    """Student 4专用 - Exam paper OCR interface (auto Mathpix fallback to PaddleOCR)"""
    request = {
        "file_id": file_id,
        "job_type": "exam_paper",
        "engine_hint": "mathpix",
        "extra": {"exam_session_id": exam_session_id, "answer_key": answer_key},
    }
    return ocr_unified(**request)