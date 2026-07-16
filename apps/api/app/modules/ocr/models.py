import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Enum as SAEnum
from ...db.session import Base
import enum


class OcrJobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class OcrJob(Base):
    __tablename__ = "ocr_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String(36), nullable=True)
    file_path = Column(Text, nullable=False)
    status = Column(SAEnum(OcrJobStatus), default=OcrJobStatus.PENDING, nullable=False)
    result_text = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    language = Column(String(10), default="eng+chi_tra")
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
