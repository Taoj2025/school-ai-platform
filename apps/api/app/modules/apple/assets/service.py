from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AppleAsset


async def list_assets(db: AsyncSession, category: str | None = None, status: str | None = None, skip: int = 0, limit: int = 20):
    query = select(AppleAsset)
    if category:
        query = query.where(AppleAsset.category == category)
    if status:
        query = query.where(AppleAsset.status == status)
    result = await db.execute(query.order_by(AppleAsset.created_at.desc()).offset(skip).limit(limit))
    return list(result.scalars().all())


async def count_assets(db: AsyncSession, category: str | None = None, status: str | None = None) -> int:
    query = select(func.count()).select_from(AppleAsset)
    if category:
        query = query.where(AppleAsset.category == category)
    if status:
        query = query.where(AppleAsset.status == status)
    return (await db.execute(query)).scalar() or 0
