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


class StudentUpdate(BaseModel):
    name_en: Optional[str] = None
    name_zh: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    class_name: Optional[str] = None
    class_no: Optional[str] = None
    status: Optional[str] = None
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
    address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    student_id: str
    date: date
    status: str  # "present", "late", "absent", "sick_leave", "leave"
    period: Optional[str] = None
    remark: Optional[str] = None


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    period: Optional[str] = None
    remark: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: str
    student_id: str
    date: date
    status: str
    period: Optional[str] = None
    remark: Optional[str] = None
    recorded_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceImportRequest(BaseModel):
    records: list[AttendanceCreate]


class AttendanceStatsResponse(BaseModel):
    total_records: int
    present: int
    late: int
    absent: int
    sick_leave: int
    leave: int
    attendance_rate: float


class CertificateRequestCreate(BaseModel):
    student_id: str
    certificate_type: str  # "enrollment", "attendance", "graduation", "transfer", "other"
    purpose: Optional[str] = None
    quantity: int = 1
    notes: Optional[str] = None


class CertificateRequestUpdate(BaseModel):
    certificate_type: Optional[str] = None
    purpose: Optional[str] = None
    quantity: Optional[int] = None
    status: Optional[str] = None
    issued_date: Optional[date] = None
    notes: Optional[str] = None


class CertificateRequestResponse(BaseModel):
    id: str
    student_id: str
    certificate_type: str
    purpose: Optional[str] = None
    quantity: int
    status: str
    requested_by: Optional[str] = None
    issued_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentImportRequest(BaseModel):
    students: list[StudentCreate]


class StudentImportResponse(BaseModel):
    imported: int
    failed: int
    errors: list[str]


class StudentStatsResponse(BaseModel):
    total_students: int
    active: int
    graduated: int
    transferred: int
    suspended: int
    classes: dict
