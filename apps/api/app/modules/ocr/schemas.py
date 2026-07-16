from pydantic import BaseModel
from datetime import datetime


class OcrJobCreate(BaseModel):
    file_id: str
    job_type: str = "ocr.extract"
    module: str | None = None


class OcrJobResponse(BaseModel):
    id: str
    file_id: str
    job_type: str
    status: str
    result: dict | None = None
    error_message: str | None = None
    confidence: str | None = None
    raw_text: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
