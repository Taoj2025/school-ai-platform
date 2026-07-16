from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.apple.finance.models import FinanceRecord, Quotation


class FinanceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_records(self, record_type: str | None = None, offset: int = 0, limit: int = 20) -> list[FinanceRecord]:
        query = select(FinanceRecord).offset(offset).limit(limit).order_by(FinanceRecord.created_at.desc())
        if record_type:
            query = query.where(FinanceRecord.record_type == record_type)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_record(self, record: FinanceRecord) -> FinanceRecord:
        self.db.add(record)
        await self.db.flush()
        return record

    async def list_quotations(self, offset: int = 0, limit: int = 20) -> list[Quotation]:
        result = await self.db.execute(
            select(Quotation).offset(offset).limit(limit).order_by(Quotation.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_quotation(self, quotation: Quotation) -> Quotation:
        self.db.add(quotation)
        await self.db.flush()
        return quotation
