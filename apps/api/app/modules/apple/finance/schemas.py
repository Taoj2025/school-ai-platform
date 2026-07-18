from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class FinanceRecordCreate(BaseModel):
    record_type: str  # "income" or "expense"
    category: str
    description: str
    amount: float
    transaction_date: date
    academic_year: str
    semester: Optional[str] = None
    payment_method: Optional[str] = None
    receipt_no: Optional[str] = None
    source_file_id: Optional[str] = None  # For OCR integration


class FinanceRecordUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    transaction_date: Optional[date] = None
    semester: Optional[str] = None
    payment_method: Optional[str] = None
    receipt_no: Optional[str] = None
    status: Optional[str] = None


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
    updated_at: Optional[datetime] = None

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
    finance_record_id: Optional[str] = None


class QuotationUpdate(BaseModel):
    vendor_name: Optional[str] = None
    item_description: Optional[str] = None
    unit_price: Optional[float] = None
    quantity: Optional[float] = None
    total_price: Optional[float] = None
    quotation_date: Optional[date] = None
    valid_until: Optional[date] = None
    status: Optional[str] = None


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


class QuotationAnalyzeResponse(BaseModel):
    single_bid: list[dict]  # Items with only one quotation
    non_lowest_chosen: list[dict]  # Items where lowest wasn't selected
    lowest_bid_summary: list[dict]  # Summary of lowest bids per item
    total_quotations: int
    warnings: list[str]
    confidence: str


class AddressLabelRequest(BaseModel):
    vendor_names: list[str]
    label_format: str = "standard"  # "standard" or "shipping"


class AddressLabelResponse(BaseModel):
    labels: list[dict]
    total_count: int
    download_url: str


class FinanceStatsResponse(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float
    pending_count: int
    this_month_income: float
    this_month_expense: float


class OCRReceiptRequest(BaseModel):
    file_id: str
    source: str = "file"


class OCRReceiptResponse(BaseModel):
    status: str
    fields: dict
    confidence: float
    needs_review: bool
    engine_used: Optional[str] = None


class DailySummaryRequest(BaseModel):
    date: date


class DailySummaryResponse(BaseModel):
    date: date
    total_amount: float
    record_count: int
    by_category: dict[str, float]
    needs_deposit: list[dict]


class QuotationComparisonRequest(BaseModel):
    quotation_ids: list[str]


class QuotationComparisonResponse(BaseModel):
    single_bid: list[dict]
    non_lowest_chosen: list[dict]
    lowest_bid_summary: list[dict]
    total_quotations: int
    warnings: list[str]
    confidence: str


class AuditTransactionRequest(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: Optional[str] = None


class AuditExceptionRequest(BaseModel):
    exception_type: str  # "single_quote" or "not_lowest"


class FinanceAuditResponse(BaseModel):
    transactions: list[dict]
    total_count: int
    total_amount: float
    exceptions: list[dict]
