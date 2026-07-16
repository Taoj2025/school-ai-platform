"""
OCR Tasks for School AI Platform
Defines Celery tasks for OCR processing
"""
import logging
from typing import Optional
from celery import chain, group
from .main import celery_app
from .handlers.receipt_handler import ReceiptHandler
from .handlers.certificate_handler import CertificateHandler
from .handlers.document_handler import DocumentHandler
from .services.ocr_engine import OCREngine

logger = logging.getLogger(__name__)

# Initialize handlers
ocr_engine = OCREngine()
receipt_handler = ReceiptHandler(ocr_engine)
certificate_handler = CertificateHandler(ocr_engine)
document_handler = DocumentHandler(ocr_engine)


@celery_app.task(bind=True, name="workers.ocr_worker.tasks.process_ocr_job")
def process_ocr_job(self, job_id: str, file_path: str, language: str = "zh-HK") -> dict:
    """
    Process an OCR job.
    
    Args:
        job_id: Unique job identifier
        file_path: Path to file to process
        language: Language code (zh-HK, en, mixed)
    
    Returns:
        dict with result and metadata
    """
    try:
        logger.info(f"Processing OCR job {job_id} for file {file_path}")
        
        # Perform OCR
        result = ocr_engine.process_file(file_path, language=language)
        
        logger.info(f"OCR job {job_id} completed successfully")
        return {
            "job_id": job_id,
            "status": "succeeded",
            "result_text": result["text"],
            "confidence": result.get("confidence", "medium"),
            "pages": result.get("pages", 1),
        }
        
    except Exception as e:
        logger.error(f"OCR job {job_id} failed: {str(e)}")
        return {
            "job_id": job_id,
            "status": "failed",
            "error": str(e),
        }


@celery_app.task(bind=True, name="workers.ocr_worker.tasks.process_receipt")
def process_receipt(self, job_id: str, file_path: str) -> dict:
    """
    Process a receipt document with OCR and structured extraction.
    
    Args:
        job_id: Unique job identifier
        file_path: Path to receipt image
    
    Returns:
        dict with extracted fields
    """
    try:
        logger.info(f"Processing receipt job {job_id}")
        
        # Process receipt
        result = receipt_handler.process(file_path, job_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Receipt job {job_id} failed: {str(e)}")
        return {
            "job_id": job_id,
            "status": "failed",
            "error": str(e),
        }


@celery_app.task(bind=True, name="workers.ocr_worker.tasks.process_certificate")
def process_certificate(self, job_id: str, file_path: str) -> dict:
    """
    Process a certificate/document with OCR and structured extraction.
    
    Args:
        job_id: Unique job identifier
        file_path: Path to certificate document
    
    Returns:
        dict with extracted fields
    """
    try:
        logger.info(f"Processing certificate job {job_id}")
        
        # Process certificate
        result = certificate_handler.process(file_path, job_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Certificate job {job_id} failed: {str(e)}")
        return {
            "job_id": job_id,
            "status": "failed",
            "error": str(e),
        }


@celery_app.task(bind=True, name="workers.ocr_worker.tasks.process_document")
def process_document(self, job_id: str, file_path: str, doc_type: str = "general") -> dict:
    """
    Process a general document with OCR.
    
    Args:
        job_id: Unique job identifier
        file_path: Path to document
        doc_type: Document type (general, award, etc.)
    
    Returns:
        dict with OCR result
    """
    try:
        logger.info(f"Processing document job {job_id} (type: {doc_type})")
        
        # Process document
        result = document_handler.process(file_path, job_id, doc_type)
        
        return result
        
    except Exception as e:
        logger.error(f"Document job {job_id} failed: {str(e)}")
        return {
            "job_id": job_id,
            "status": "failed",
            "error": str(e),
        }


@celery_app.task(bind=True, name="workers.ocr_worker.tasks.batch_process")
def batch_process(self, file_paths: list, job_type: str = "receipt") -> dict:
    """
    Process multiple files in batch.
    
    Args:
        file_paths: List of file paths to process
        job_type: Type of processing (receipt, certificate, general)
    
    Returns:
        dict with batch results
    """
    try:
        logger.info(f"Processing batch of {len(file_paths)} files")
        
        # Create task group
        if job_type == "receipt":
            tasks = [process_receipt.s(fp, f"batch_{i}") for i, fp in enumerate(file_paths)]
        elif job_type == "certificate":
            tasks = [process_certificate.s(fp, f"batch_{i}") for i, fp in enumerate(file_paths)]
        else:
            tasks = [process_document.s(fp, f"batch_{i}") for i, fp in enumerate(file_paths)]
        
        # Execute in parallel
        job = group(tasks)
        results = job.apply_async()
        
        # Wait for all results
        all_results = results.get(disable_sync_subtasks=False)
        
        # Summarize
        succeeded = sum(1 for r in all_results if r.get("status") == "succeeded")
        failed = sum(1 for r in all_results if r.get("status") == "failed")
        
        return {
            "total": len(file_paths),
            "succeeded": succeeded,
            "failed": failed,
            "results": all_results,
        }
        
    except Exception as e:
        logger.error(f"Batch job failed: {str(e)}")
        return {
            "total": len(file_paths),
            "succeeded": 0,
            "failed": len(file_paths),
            "error": str(e),
        }
