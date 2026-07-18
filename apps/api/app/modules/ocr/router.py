from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import OcrJob, OcrJobStatus
from .schemas import OcrJobCreate, OcrJobResponse
from ...db.session import get_db
from ...common.schemas import success_response

router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.post("/jobs", response_model=dict)
async def create_ocr_job(job: OcrJobCreate, db: AsyncSession = Depends(get_db)):
    ocr_job = OcrJob(
        file_id=job.file_id,
        file_path=job.file_path,
        language=job.language,
        status=OcrJobStatus.PENDING,
    )
    db.add(ocr_job)
    await db.flush()
    
    try:
        from app.workers.ocr_tasks import ocr_unified
        task = ocr_unified.delay(
            file_id=int(job.file_id) if job.file_id else 0,
            job_type="general",
        )
        ocr_job.status = OcrJobStatus.PROCESSING
        await db.flush()
    except Exception:
        pass
    
    return success_response(data=OcrJobResponse.model_validate(ocr_job).model_dump())


@router.get("/jobs/{job_id}", response_model=dict)
async def get_ocr_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OcrJob).where(OcrJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="OCR job not found")
    return success_response(data=OcrJobResponse.model_validate(job).model_dump())
