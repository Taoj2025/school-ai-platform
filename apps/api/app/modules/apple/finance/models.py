from datetime import date
from decimal import Decimal

from sqlalchemy import JSON, Boolean, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class FinanceRecord(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_finance_records"

    record_type: Mapped[str] = mapped_column(String(20))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(10), default="HKD")
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    invoice_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vendor: Mapped[str | None] = mapped_column(String(200), nullable=True)
    handler_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    source_file_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    transaction_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    ocr_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)


class Quotation(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_quotations"

    project_name: Mapped[str] = mapped_column(String(200))
    vendor_name: Mapped[str] = mapped_column(String(200))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(10), default="HKD")
    is_chosen: Mapped[bool] = mapped_column(Boolean, default=False)
    is_lowest: Mapped[bool] = mapped_column(Boolean, default=False)
    source_file_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
