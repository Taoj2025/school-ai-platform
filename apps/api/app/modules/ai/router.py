from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .models import AiJob
from .schemas import AiGenerateRequest, AiJobResponse
from ...db.session import get_db
from ...common.schemas import success_response

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate", response_model=dict)
async def generate_ai(request: AiGenerateRequest, db: AsyncSession = Depends(get_db)):
    ai_job = AiJob(
        job_type=request.job_type,
        prompt=request.prompt,
        model=request.model,
        module=request.module,
    )
    db.add(ai_job)
    await db.flush()
    return success_response(data=AiJobResponse.model_validate(ai_job).model_dump())
