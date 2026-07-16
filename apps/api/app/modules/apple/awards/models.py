import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, Numeric, ForeignKey, Date
from sqlalchemy.orm import relationship
from ....db.session import Base


class AppleAward(Base):
    __tablename__ = "apple_awards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    award_type = Column(String(100), nullable=False)
    academic_year = Column(String(20), nullable=False)
    semester = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(12, 2), nullable=True)
    status = Column(String(50), default="draft")
    created_by = Column(String(36), nullable=True)
    approved_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    recipients = relationship("AppleAwardRecipient", back_populates="award", cascade="all, delete-orphan")


class AppleAwardRecipient(Base):
    __tablename__ = "apple_award_recipients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    award_id = Column(String(36), ForeignKey("apple_awards.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), nullable=False, index=True)
    student_name = Column(String(200), nullable=True)
    class_name = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    amount = Column(Numeric(12, 2), nullable=True)
    status = Column(String(50), default="nominated")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    award = relationship("AppleAward", back_populates="recipients")
