from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import AppleAward, AppleAwardRecipient


async def get_award(db: AsyncSession, award_id: str) -> AppleAward | None:
    result = await db.execute(select(AppleAward).where(AppleAward.id == award_id))
    return result.scalar_one_or_none()


async def get_recipients(db: AsyncSession, award_id: str) -> list[AppleAwardRecipient]:
    result = await db.execute(select(AppleAwardRecipient).where(AppleAwardRecipient.award_id == award_id))
    return list(result.scalars().all())
