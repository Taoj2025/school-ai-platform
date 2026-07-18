from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from .models import AiJob, AiJobStatus
from .schemas import AiGenerateRequest, AiJobResponse
from ...db.session import get_db
from ...common.schemas import success_response
from ...core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/jobs", response_model=dict)
async def create_ai_job(request: AiGenerateRequest, db: AsyncSession = Depends(get_db)):
    ai_job = AiJob(
        job_type=request.job_type,
        prompt=request.prompt,
        model=request.model,
        module=request.module,
        status=AiJobStatus.PENDING,
    )
    db.add(ai_job)
    await db.flush()
    
    try:
        from app.workers.llm_tasks import call_llm_unified
        task = call_llm_unified.delay(
            task_type=request.job_type,
            prompt=request.prompt,
            model=request.model,
        )
        ai_job.status = AiJobStatus.PROCESSING
        await db.flush()
    except Exception:
        pass
    
    return success_response(data=AiJobResponse.model_validate(ai_job).model_dump())


@router.get("/jobs/{job_id}", response_model=dict)
async def get_ai_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AiJob).where(AiJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="AI job not found")
    return success_response(data=AiJobResponse.model_validate(job).model_dump())


@router.post("/generate", response_model=dict)
async def generate_ai(request: AiGenerateRequest, db: AsyncSession = Depends(get_db)):
    ai_job = AiJob(
        job_type=request.job_type,
        prompt=request.prompt,
        model=request.model or settings.LLM_MODEL,
        module=request.module,
        status=AiJobStatus.PROCESSING,
    )
    db.add(ai_job)
    await db.flush()

    try:
        from app.core.llm import generate_text

        result = await generate_text(request.prompt, model=request.model or None)
        ai_job.result = result
        ai_job.status = AiJobStatus.COMPLETED
        ai_job.completed_at = datetime.utcnow()
        await db.flush()
    except Exception as e:
        ai_job.status = AiJobStatus.FAILED
        ai_job.error_message = str(e)
        await db.flush()

    return success_response(data=AiJobResponse.model_validate(ai_job).model_dump())
