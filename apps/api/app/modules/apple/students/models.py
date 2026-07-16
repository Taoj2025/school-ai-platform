import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ....db.session import Base


class AppleStudent(Base):
    __tablename__ = "apple_students"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_no = Column(String(50), unique=True, nullable=False, index=True)
    name_en = Column(String(200), nullable=False)
    name_zh = Column(String(200), nullable=True)
    gender = Column(String(10), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    class_name = Column(String(100), nullable=False, index=True)
    class_no = Column(String(10), nullable=True)
    admission_date = Column(Date, nullable=True)
    status = Column(String(50), default="active")
    parent_name = Column(String(200), nullable=True)
    parent_phone = Column(String(50), nullable=True)
    parent_email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    attendance_records = relationship("AppleAttendance", back_populates="student", cascade="all, delete-orphan")
    certificate_requests = relationship("AppleCertificateRequest", back_populates="student", cascade="all, delete-orphan")


class AppleAttendance(Base):
    __tablename__ = "apple_attendance"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("apple_students.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(String(50), nullable=False)
    period = Column(String(20), nullable=True)
    remark = Column(Text, nullable=True)
    recorded_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = relationship("AppleStudent", back_populates="attendance_records")


class AppleCertificateRequest(Base):
    __tablename__ = "apple_certificate_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("apple_students.id", ondelete="CASCADE"), nullable=False, index=True)
    certificate_type = Column(String(100), nullable=False)
    purpose = Column(Text, nullable=True)
    quantity = Column(Integer, default=1)
    status = Column(String(50), default="pending")
    requested_by = Column(String(36), nullable=True)
    issued_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("AppleStudent", back_populates="certificate_requests")
