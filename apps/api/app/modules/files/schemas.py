from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FileResponse(BaseModel):
    id: str
    original_name: str
    stored_name: str
    file_size: int
    mime_type: Optional[str] = None
    module: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    file: FileResponse
    url: Optional[str] = None
