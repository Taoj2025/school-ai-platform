import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Text
from ...db.session import Base


class File(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    original_name = Column(String(500), nullable=False)
    stored_name = Column(String(500), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(200), nullable=True)
    uploaded_by = Column(String(36), nullable=True)
    module = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
