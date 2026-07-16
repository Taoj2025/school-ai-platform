import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File as FastAPIFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from .models import File
from .schemas import FileResponse, FileUploadResponse
from ...db.session import get_db
from ...common.schemas import success_response
from ...core.config import settings

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    module: str = "general",
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    upload_dir = os.path.join(settings.UPLOAD_DIR, module)
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    stored_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, stored_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    file_record = File(
        original_name=file.filename,
        stored_name=stored_name,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        module=module,
    )
    db.add(file_record)
    await db.flush()

    return success_response(data=FileResponse.model_validate(file_record).model_dump())
