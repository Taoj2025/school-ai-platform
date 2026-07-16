from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OcrJobCreate(BaseModel):
    file_id: Optional[str] = None
    file_path: str
    language: str = "eng+chi_tra"


class OcrJobResponse(BaseModel):
    id: str
    file_id: Optional[str] = None
    file_path: str
    status: str
    result_text: Optional[str] = None
    error_message: Optional[str] = None
    language: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
