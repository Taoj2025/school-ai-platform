from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class StudentCreate(BaseModel):
    student_no: str
    name_en: str
    name_zh: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    class_name: str
    class_no: Optional[str] = None
    admission_date: Optional[date] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class StudentResponse(BaseModel):
    id: str
    student_no: str
    name_en: str
    name_zh: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    class_name: str
    class_no: Optional[str] = None
    admission_date: Optional[date] = None
    status: str
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    student_id: str
    date: date
    status: str
    period: Optional[str] = None
    remark: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: str
    student_id: str
    date: date
    status: str
    period: Optional[str] = None
    remark: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CertificateRequestCreate(BaseModel):
    student_id: str
    certificate_type: str
    purpose: Optional[str] = None
    quantity: int = 1
    notes: Optional[str] = None


class CertificateRequestResponse(BaseModel):
    id: str
    student_id: str
    certificate_type: str
    purpose: Optional[str] = None
    quantity: int
    status: str
    issued_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
