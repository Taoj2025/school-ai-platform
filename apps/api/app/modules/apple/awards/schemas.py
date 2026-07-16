from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class AwardCreate(BaseModel):
    name: str
    category: Literal["學業", "品行", "服務", "體育"]
    amount: Decimal | None = None
    semester: Literal["上學期", "下學期", "畢業禮"]
    year: int


class AwardUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    amount: Decimal | None = None
    semester: str | None = None
    year: int | None = None


class AwardRead(BaseModel):
    id: str
    name: str
    category: str
    amount: Decimal | None = None
    semester: str
    year: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AwardRecipientCreate(BaseModel):
    student_id: str
    score: float | None = None
    ranking: int | None = None


class AwardRecipientRead(BaseModel):
    id: str
    award_id: str
    student_id: str
    score: float | None = None
    ranking: int | None = None
    status: str
    certificate_generated: bool
    certificate_pdf_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
