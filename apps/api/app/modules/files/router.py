import os
import uuid
import shutil
import io
from fastapi import APIRouter, UploadFile, File as FastAPIFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from .models import File
from .schemas import FileResponse, FileUploadResponse
from ...db.session import get_db
from ...common.schemas import success_response
from ...core.config import settings

router = APIRouter(prefix="/files", tags=["files"])

MINIO_AVAILABLE = False
try:
    from minio import Minio
    MINIO_AVAILABLE = True
except ImportError:
    pass

_minio_client = None

def get_minio_client():
    global _minio_client
    if MINIO_AVAILABLE and _minio_client is None:
        _minio_client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
    return _minio_client


@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    module: str = "general",
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    stored_name = f"{uuid.uuid4()}{ext}"
    
    file_content = await file.read()
    file_size = len(file_content)
    
    minio_client = get_minio_client()
    
    if minio_client:
        try:
            bucket_name = f"{settings.MINIO_BUCKET}-{module}"
            if not minio_client.bucket_exists(bucket_name):
                minio_client.make_bucket(bucket_name)
            
            object_name = f"{module}/{stored_name}"
            minio_client.put_object(
                bucket_name,
                object_name,
                io.BytesIO(file_content),
                length=file_size,
                content_type=file.content_type,
            )
            
            file_path = f"minio://{bucket_name}/{object_name}"
        except Exception as e:
            file_path = await _save_local_file(file_content, module, stored_name)
    else:
        file_path = await _save_local_file(file_content, module, stored_name)

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

    return success_response(data={
        **FileResponse.model_validate(file_record).model_dump(),
        "url": f"/api/v1/files/{file_record.id}/download",
    })


async def _save_local_file(content: bytes, module: str, stored_name: str) -> str:
    upload_dir = os.path.join(settings.UPLOAD_DIR, module)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, stored_name)
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    return file_path
