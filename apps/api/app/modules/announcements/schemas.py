from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date


class AnnouncementInput(BaseModel):
    title_type: str = Field(..., description="exam/holiday/payment/weather/activity/other")
    target_audience: str = Field(..., description="whole_school/grade_X/class_X")
    key_dates: list[datetime] = Field(..., description="Key event dates")
    key_location: Optional[str] = Field(None, description="Event location")
    subject: Optional[str] = Field(None, description="Exam subject (for exam type)")
    teachers: Optional[list[str]] = Field(None, description="Teachers involved")
    special_notes: Optional[str] = Field(None, description="Special requirements")
    deadline: Optional[datetime] = Field(None, description="Payment/response deadline")
    formality: str = Field("formal", description="formal/semi-formal/casual")
    school_name: str = Field("香港培英文具", description="School name")
    template_id: Optional[str] = Field(None, description="Template ID to use")
    terminology_glossary_id: Optional[str] = Field(None, description="Terminology glossary ID")


class BilingualAnnouncement(BaseModel):
    title_zh: str
    title_en: str
    body_zh: str
    body_en: str
    confidence: str
    warnings: list[str]


class AnnouncementCreate(BaseModel):
    title_zh: str
    title_en: str
    body_zh: str
    body_en: str
    announcement_type: str
    target_audience: str
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    key_dates: Optional[list[datetime]] = None
    key_location: Optional[str] = None
    subject: Optional[str] = None
    teachers: Optional[list[str]] = None
    special_notes: Optional[str] = None
    formality: str = "formal"
    template_id: Optional[str] = None


class AnnouncementUpdate(BaseModel):
    title_zh: Optional[str] = None
    title_en: Optional[str] = None
    body_zh: Optional[str] = None
    body_en: Optional[str] = None
    announcement_type: Optional[str] = None
    target_audience: Optional[str] = None
    key_location: Optional[str] = None
    subject: Optional[str] = None
    teachers: Optional[list[str]] = None
    special_notes: Optional[str] = None
    formality: Optional[str] = None
    status: Optional[str] = None


class AnnouncementResponse(BaseModel):
    id: str
    title_zh: Optional[str] = None
    title_en: Optional[str] = None
    body_zh: Optional[str] = None
    body_en: Optional[str] = None
    announcement_type: str
    target_audience: str
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    key_dates: Optional[list] = None
    key_location: Optional[str] = None
    subject: Optional[str] = None
    teachers: Optional[list[str]] = None
    special_notes: Optional[str] = None
    formality: str
    status: str
    template_id: Optional[str] = None
    ai_generated: bool
    ai_confidence: Optional[str] = None
    ai_warnings: Optional[list[str]] = None
    created_by: Optional[str] = None
    approved_by: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TemplateCreate(BaseModel):
    name: str
    category: str
    title_zh_template: Optional[str] = None
    title_en_template: Optional[str] = None
    body_zh_template: Optional[str] = None
    body_en_template: Optional[str] = None
    required_params: Optional[list[str]] = None


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    title_zh_template: Optional[str] = None
    title_en_template: Optional[str] = None
    body_zh_template: Optional[str] = None
    body_en_template: Optional[str] = None
    required_params: Optional[list[str]] = None
    is_active: Optional[bool] = None


class TemplateResponse(BaseModel):
    id: str
    name: str
    category: str
    title_zh_template: Optional[str] = None
    title_en_template: Optional[str] = None
    body_zh_template: Optional[str] = None
    body_en_template: Optional[str] = None
    required_params: Optional[list[str]] = None
    is_active: bool
    usage_count: int
    avg_rating: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SendLogResponse(BaseModel):
    id: str
    announcement_id: str
    recipient_id: Optional[str] = None
    recipient_name: Optional[str] = None
    channel: str
    target_address: Optional[str] = None
    status: str
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int

    class Config:
        from_attributes = True


class ReadStatusResponse(BaseModel):
    total_recipients: int
    sent_count: int
    delivered_count: int
    read_count: int
    pending_count: int
    read_rate: float
