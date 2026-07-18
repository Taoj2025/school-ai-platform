from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime, date
from enum import Enum


class ExportFormat(str, Enum):
    """Export format options"""
    CSV = "csv"
    EXCEL = "excel"
    PDF = "pdf"


class AwardCreate(BaseModel):
    name: str
    award_type: str
    academic_year: str
    semester: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None


class AwardUpdate(BaseModel):
    name: Optional[str] = None
    award_type: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None


class AwardResponse(BaseModel):
    id: str
    name: str
    award_type: str
    academic_year: str
    semester: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AwardRecipientCreate(BaseModel):
    award_id: Optional[str] = None
    student_id: str
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    reason: Optional[str] = None
    amount: Optional[float] = None


class AwardRecipientUpdate(BaseModel):
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    reason: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None


class AwardRecipientResponse(BaseModel):
    id: str
    award_id: str
    student_id: str
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    reason: Optional[str] = None
    amount: Optional[float] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ScholarshipCalculationRequest(BaseModel):
    recipient_ids: list[str]
    custom_amounts: Optional[dict[str, float]] = None


class ScholarshipCalculationResponse(BaseModel):
    award_id: str
    total_recipients: int
    total_amount: float
    breakdown: list[dict]


class CertificateGenerationRequest(BaseModel):
    recipient_ids: list[str]
    template_id: str = "default"
    signatory: str = "Principal"
    ceremony_date: Optional[date] = None


class CertificateGenerationResponse(BaseModel):
    certificate_ids: list[str]
    download_url: str
    total_generated: int


class ScriptGenerationRequest(BaseModel):
    group_by: Literal["grade", "class", "student_no"] = "class"
    include_amounts: bool = True


class ScriptGenerationResponse(BaseModel):
    script: str
    recipient_count: int
    grouped_by: str
