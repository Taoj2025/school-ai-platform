import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Enum as SAEnum
from ...db.session import Base
import enum


class AiJobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AiJob(Base):
    __tablename__ = "ai_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_type = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=False)
    result = Column(Text, nullable=True)
    status = Column(SAEnum(AiJobStatus), default=AiJobStatus.PENDING, nullable=False)
    model = Column(String(100), default="gpt-4")
    error_message = Column(Text, nullable=True)
    created_by = Column(String(36), nullable=True)
    module = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
