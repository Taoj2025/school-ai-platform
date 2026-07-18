from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AiGenerateRequest(BaseModel):
    job_type: str
    prompt: str
    model: str = "kimi-k2.5"
    module: Optional[str] = None


class AiJobResponse(BaseModel):
    id: str
    job_type: str
    prompt: str
    result: Optional[str] = None
    status: str
    model: str
    error_message: Optional[str] = None
    module: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
