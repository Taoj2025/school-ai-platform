from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AwardCreate(BaseModel):
    name: str
    award_type: str
    academic_year: str
    semester: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None


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

    class Config:
        from_attributes = True


class AwardRecipientCreate(BaseModel):
    award_id: str
    student_id: str
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    reason: Optional[str] = None
    amount: Optional[float] = None


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
