from app.modules.apple.finance.models import FinanceRecord, Quotation
from app.modules.apple.finance.repository import FinanceRepository
from app.modules.apple.finance.schemas import FinanceRecordCreate, QuotationCreate


class FinanceService:
    def __init__(self, repo: FinanceRepository):
        self.repo = repo

    async def list_records(self, record_type: str | None = None) -> list[FinanceRecord]:
        return await self.repo.list_records(record_type)

    async def create_record(self, data: FinanceRecordCreate, user_id: str) -> FinanceRecord:
        record = FinanceRecord(
            record_type=data.record_type,
            description=data.description,
            amount=data.amount,
            currency=data.currency,
            payment_method=data.payment_method,
            invoice_number=data.invoice_number,
            vendor=data.vendor,
            transaction_date=data.transaction_date,
            note=data.note,
            created_by=user_id,
        )
        return await self.repo.create_record(record)

    async def list_quotations(self) -> list[Quotation]:
        return await self.repo.list_quotations()

    async def create_quotation(self, data: QuotationCreate, user_id: str) -> Quotation:
        quotation = Quotation(
            project_name=data.project_name,
            vendor_name=data.vendor_name,
            amount=data.amount,
            currency=data.currency,
            is_chosen=data.is_chosen,
            is_lowest=data.is_lowest,
            note=data.note,
            created_by=user_id,
        )
        return await self.repo.create_quotation(quotation)
