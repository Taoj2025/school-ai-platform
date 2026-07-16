from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AppleAward, AppleAwardRecipient


async def list_awards(db: AsyncSession, academic_year: str | None = None, status: str | None = None, skip: int = 0, limit: int = 20):
    query = select(AppleAward)
    if academic_year:
        query = query.where(AppleAward.academic_year == academic_year)
    if status:
        query = query.where(AppleAward.status == status)
    result = await db.execute(query.order_by(AppleAward.created_at.desc()).offset(skip).limit(limit))
    return list(result.scalars().all())


async def count_awards(db: AsyncSession, academic_year: str | None = None, status: str | None = None) -> int:
    query = select(func.count()).select_from(AppleAward)
    if academic_year:
        query = query.where(AppleAward.academic_year == academic_year)
    if status:
        query = query.where(AppleAward.status == status)
    return (await db.execute(query)).scalar() or 0


async def get_award(db: AsyncSession, award_id: str) -> AppleAward | None:
    result = await db.execute(select(AppleAward).where(AppleAward.id == award_id))
    return result.scalar_one_or_none()
