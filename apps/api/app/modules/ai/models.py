from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class AiJob(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "ai_jobs"

    job_type: Mapped[str] = mapped_column(String(100))
    module: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_file_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("files.id"), nullable=True)
    ocr_job_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("ocr_jobs.id"), nullable=True)
    prompt_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    input_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[str | None] = mapped_column(String(20), nullable=True)
