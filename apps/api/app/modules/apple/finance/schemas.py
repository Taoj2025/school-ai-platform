from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class FinanceRecordCreate(BaseModel):
    record_type: str
    description: str | None = None
    amount: Decimal
    currency: str = "HKD"
    payment_method: str | None = None
    invoice_number: str | None = None
    vendor: str | None = None
    transaction_date: date | None = None
    note: str | None = None


class FinanceRecordRead(BaseModel):
    id: str
    record_type: str
    description: str | None = None
    amount: Decimal
    currency: str
    payment_method: str | None = None
    invoice_number: str | None = None
    vendor: str | None = None
    transaction_date: date | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class QuotationCreate(BaseModel):
    project_name: str
    vendor_name: str
    amount: Decimal
    currency: str = "HKD"
    is_chosen: bool = False
    is_lowest: bool = False
    note: str | None = None


class QuotationRead(BaseModel):
    id: str
    project_name: str
    vendor_name: str
    amount: Decimal
    currency: str
    is_chosen: bool
    is_lowest: bool
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
