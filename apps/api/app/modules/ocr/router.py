from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.errors import NotFoundError
from app.common.schemas import ResponseSchema
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.ocr.models import OcrJob
from app.modules.ocr.schemas import OcrJobCreate, OcrJobResponse

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/jobs", response_model=ResponseSchema[OcrJobResponse])
async def create_ocr_job(
    data: OcrJobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    job = OcrJob(
        file_id=data.file_id,
        job_type=data.job_type,
        module=data.module,
        status="pending",
        created_by=current_user["user_id"],
    )
    db.add(job)
    await db.flush()
    return ResponseSchema(data=OcrJobResponse.model_validate(job), meta={})


@router.get("/jobs/{job_id}", response_model=ResponseSchema[OcrJobResponse])
async def get_ocr_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(OcrJob).where(OcrJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise NotFoundError(f"OCR job {job_id} not found")
    return ResponseSchema(data=OcrJobResponse.model_validate(job), meta={})
