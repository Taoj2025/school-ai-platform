from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AppleFinanceRecord


async def list_records(db: AsyncSession, academic_year: str | None = None, record_type: str | None = None, skip: int = 0, limit: int = 20):
    query = select(AppleFinanceRecord)
    if academic_year:
        query = query.where(AppleFinanceRecord.academic_year == academic_year)
    if record_type:
        query = query.where(AppleFinanceRecord.record_type == record_type)
    result = await db.execute(query.order_by(AppleFinanceRecord.transaction_date.desc()).offset(skip).limit(limit))
    return list(result.scalars().all())


async def count_records(db: AsyncSession, academic_year: str | None = None, record_type: str | None = None) -> int:
    query = select(func.count()).select_from(AppleFinanceRecord)
    if academic_year:
        query = query.where(AppleFinanceRecord.academic_year == academic_year)
    if record_type:
        query = query.where(AppleFinanceRecord.record_type == record_type)
    return (await db.execute(query)).scalar() or 0
