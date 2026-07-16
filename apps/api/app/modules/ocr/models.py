from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class OcrJob(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "ocr_jobs"

    file_id: Mapped[str] = mapped_column(String(36), ForeignKey("files.id"))
    job_type: Mapped[str] = mapped_column(String(100))
    module: Mapped[str | None] = mapped_column(String(50), nullable=True)
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[str | None] = mapped_column(String(20), nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
