import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas import ResponseSchema
from app.core.config import settings
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.files.models import File
from app.modules.files.schemas import FileUploadResponse

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload", response_model=ResponseSchema[FileUploadResponse])
async def upload_file(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    upload_dir = os.path.join(settings.UPLOAD_DIR, current_user["user_id"])
    os.makedirs(upload_dir, exist_ok=True)

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "")[1]
    stored_name = f"{file_id}{ext}"
    stored_path = os.path.join(upload_dir, stored_name)

    async with aiofiles.open(stored_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    db_file = File(
        id=file_id,
        original_filename=file.filename or "unknown",
        stored_path=stored_path,
        mime_type=file.content_type,
        file_size=len(content),
        created_by=current_user["user_id"],
    )
    db.add(db_file)
    await db.flush()

    return ResponseSchema(data=FileUploadResponse.model_validate(db_file), meta={})
