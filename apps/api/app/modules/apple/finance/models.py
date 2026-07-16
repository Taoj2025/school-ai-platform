import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from ....db.session import Base


class AppleFinanceRecord(Base):
    __tablename__ = "apple_finance_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    record_type = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    transaction_date = Column(Date, nullable=False)
    academic_year = Column(String(20), nullable=False)
    semester = Column(String(20), nullable=True)
    payment_method = Column(String(50), nullable=True)
    receipt_no = Column(String(100), nullable=True)
    attachment_id = Column(String(36), nullable=True)
    status = Column(String(50), default="pending")
    created_by = Column(String(36), nullable=True)
    approved_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AppleQuotation(Base):
    __tablename__ = "apple_quotations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    finance_record_id = Column(String(36), ForeignKey("apple_finance_records.id", ondelete="SET NULL"), nullable=True, index=True)
    vendor_name = Column(String(200), nullable=False)
    item_description = Column(Text, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Numeric(10, 2), default=1)
    total_price = Column(Numeric(12, 2), nullable=False)
    quotation_date = Column(Date, nullable=True)
    valid_until = Column(Date, nullable=True)
    attachment_id = Column(String(36), nullable=True)
    status = Column(String(50), default="pending")
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
