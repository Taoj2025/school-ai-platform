from datetime import date, datetime

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class Student(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_students"

    student_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    class_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    grade: Mapped[str | None] = mapped_column(String(20), nullable=True)
    enrollment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    parent_contact: Mapped[str | None] = mapped_column(String(200), nullable=True)

    attendance_records: Mapped[list["Attendance"]] = relationship(
        "Attendance", back_populates="student", cascade="all, delete-orphan"
    )
    certificate_requests: Mapped[list["CertificateRequest"]] = relationship(
        "CertificateRequest", back_populates="student", cascade="all, delete-orphan"
    )


class Attendance(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "apple_attendance"

    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("apple_students.id"))
    attendance_date: Mapped[date] = mapped_column(Date)
    attendance_status: Mapped[str] = mapped_column(String(20))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    student: Mapped["Student"] = relationship("Student", back_populates="attendance_records")


class CertificateRequest(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_certificate_requests"

    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("apple_students.id"))
    certificate_type: Mapped[str] = mapped_column(String(100))
    purpose: Mapped[str | None] = mapped_column(String(500), nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    student: Mapped["Student"] = relationship("Student", back_populates="certificate_requests")
