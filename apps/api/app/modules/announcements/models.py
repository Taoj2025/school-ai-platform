import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from ...db.session import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title_zh = Column(String(500), nullable=True)
    title_en = Column(String(500), nullable=True)
    body_zh = Column(Text, nullable=True)
    body_en = Column(Text, nullable=True)
    
    announcement_type = Column(String(50), nullable=False, index=True)
    target_audience = Column(String(50), nullable=False)
    academic_year = Column(String(20), nullable=True)
    semester = Column(String(20), nullable=True)
    
    key_dates = Column(JSON, nullable=True)
    key_location = Column(String(500), nullable=True)
    subject = Column(String(200), nullable=True)
    teachers = Column(JSON, nullable=True)
    special_notes = Column(Text, nullable=True)
    
    formality = Column(String(20), default="formal")
    status = Column(String(50), default="draft", index=True)
    
    template_id = Column(String(36), nullable=True)
    ai_generated = Column(Boolean, default=False)
    ai_confidence = Column(String(20), nullable=True)
    ai_warnings = Column(JSON, nullable=True)
    
    created_by = Column(String(36), nullable=True)
    approved_by = Column(String(36), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AnnouncementTemplate(Base):
    __tablename__ = "announcement_templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    
    title_zh_template = Column(String(500), nullable=True)
    title_en_template = Column(String(500), nullable=True)
    body_zh_template = Column(Text, nullable=True)
    body_en_template = Column(Text, nullable=True)
    
    required_params = Column(JSON, nullable=True)
    
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    avg_rating = Column(Integer, nullable=True)
    
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class SendLog(Base):
    __tablename__ = "send_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    announcement_id = Column(String(36), ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(String(36), nullable=True)
    recipient_name = Column(String(200), nullable=True)
    
    channel = Column(String(20), nullable=False)
    target_address = Column(String(500), nullable=True)
    
    status = Column(String(20), default="pending", index=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)


Index('ix_announcements_academic_year', 'academic_year')
Index('ix_announcements_semester', 'semester')
Index('ix_send_logs_status', 'status')
