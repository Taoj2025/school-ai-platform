from pydantic import BaseModel
from datetime import datetime


class AiGenerateRequest(BaseModel):
    job_type: str
    module: str | None = None
    source_file_id: str | None = None
    ocr_job_id: str | None = None
    prompt_name: str | None = None
    input_data: dict | None = None


class AiGenerateResponse(BaseModel):
    id: str
    job_type: str
    status: str
    result: dict | None = None
    error_message: str | None = None
    confidence: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
