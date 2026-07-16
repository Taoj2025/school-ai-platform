from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.apple.awards.models import Award, AwardRecipient


class AwardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, offset: int = 0, limit: int = 20) -> list[Award]:
        result = await self.db.execute(
            select(Award).offset(offset).limit(limit).order_by(Award.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, award_id: str) -> Award | None:
        result = await self.db.execute(
            select(Award).options(selectinload(Award.recipients)).where(Award.id == award_id)
        )
        return result.scalar_one_or_none()

    async def create(self, award: Award) -> Award:
        self.db.add(award)
        await self.db.flush()
        return award

    async def delete(self, award: Award) -> None:
        await self.db.delete(award)

    async def add_recipient(self, recipient: AwardRecipient) -> AwardRecipient:
        self.db.add(recipient)
        await self.db.flush()
        return recipient
