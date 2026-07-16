from pydantic import BaseModel
from datetime import datetime


class FileUploadResponse(BaseModel):
    id: str
    original_filename: str
    stored_path: str
    mime_type: str | None = None
    file_size: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
