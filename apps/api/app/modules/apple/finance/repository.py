from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import AppleFinanceRecord, AppleQuotation


async def get_record(db: AsyncSession, record_id: str) -> AppleFinanceRecord | None:
    result = await db.execute(select(AppleFinanceRecord).where(AppleFinanceRecord.id == record_id))
    return result.scalar_one_or_none()


async def get_quotations_for_record(db: AsyncSession, record_id: str) -> list[AppleQuotation]:
    result = await db.execute(select(AppleQuotation).where(AppleQuotation.finance_record_id == record_id))
    return list(result.scalars().all())
