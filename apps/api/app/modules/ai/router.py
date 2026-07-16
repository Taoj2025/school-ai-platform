from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas import ResponseSchema
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.ai.models import AiJob
from app.modules.ai.schemas import AiGenerateRequest, AiGenerateResponse

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate", response_model=ResponseSchema[AiGenerateResponse])
async def generate(
    data: AiGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    job = AiJob(
        job_type=data.job_type,
        module=data.module,
        source_file_id=data.source_file_id,
        ocr_job_id=data.ocr_job_id,
        prompt_name=data.prompt_name,
        input_data=data.input_data,
        status="pending",
        created_by=current_user["user_id"],
    )
    db.add(job)
    await db.flush()
    return ResponseSchema(data=AiGenerateResponse.model_validate(job), meta={})
