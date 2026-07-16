from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class File(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "files"

    original_filename: Mapped[str] = mapped_column(String(500))
    stored_path: Mapped[str] = mapped_column(String(1000))
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    module: Mapped[str | None] = mapped_column(String(50), nullable=True)
