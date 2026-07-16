from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class FinanceRecordCreate(BaseModel):
    record_type: str
    category: str
    description: str
    amount: float
    transaction_date: date
    academic_year: str
    semester: Optional[str] = None
    payment_method: Optional[str] = None
    receipt_no: Optional[str] = None


class FinanceRecordResponse(BaseModel):
    id: str
    record_type: str
    category: str
    description: str
    amount: float
    transaction_date: date
    academic_year: str
    semester: Optional[str] = None
    payment_method: Optional[str] = None
    receipt_no: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuotationCreate(BaseModel):
    vendor_name: str
    item_description: str
    unit_price: float
    quantity: float = 1
    total_price: float
    quotation_date: Optional[date] = None
    valid_until: Optional[date] = None


class QuotationResponse(BaseModel):
    id: str
    vendor_name: str
    item_description: str
    unit_price: float
    quantity: float
    total_price: float
    quotation_date: Optional[date] = None
    valid_until: Optional[date] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
