from datetime import date, datetime

from pydantic import BaseModel


class StudentCreate(BaseModel):
    student_number: str
    name: str
    class_name: str | None = None
    grade: str | None = None
    enrollment_date: date | None = None
    parent_contact: str | None = None


class StudentUpdate(BaseModel):
    name: str | None = None
    class_name: str | None = None
    grade: str | None = None
    enrollment_date: date | None = None
    parent_contact: str | None = None


class StudentRead(BaseModel):
    id: str
    student_number: str
    name: str
    class_name: str | None = None
    grade: str | None = None
    enrollment_date: date | None = None
    parent_contact: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AttendanceCreate(BaseModel):
    attendance_date: date
    attendance_status: str
    note: str | None = None


class AttendanceRead(BaseModel):
    id: str
    student_id: str
    attendance_date: date
    attendance_status: str
    note: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CertificateRequestCreate(BaseModel):
    certificate_type: str
    purpose: str | None = None


class CertificateRequestRead(BaseModel):
    id: str
    student_id: str
    certificate_type: str
    purpose: str | None = None
    status: str
    pdf_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
