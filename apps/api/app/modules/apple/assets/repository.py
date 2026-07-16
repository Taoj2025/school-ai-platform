from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.apple.assets.models import Asset, AssetMovement


class AssetRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, offset: int = 0, limit: int = 20) -> list[Asset]:
        result = await self.db.execute(
            select(Asset).offset(offset).limit(limit).order_by(Asset.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, asset_id: str) -> Asset | None:
        result = await self.db.execute(
            select(Asset).options(selectinload(Asset.movements)).where(Asset.id == asset_id)
        )
        return result.scalar_one_or_none()

    async def create(self, asset: Asset) -> Asset:
        self.db.add(asset)
        await self.db.flush()
        return asset

    async def add_movement(self, movement: AssetMovement) -> AssetMovement:
        self.db.add(movement)
        await self.db.flush()
        return movement

    async def list_movements(self, asset_id: str) -> list[AssetMovement]:
        result = await self.db.execute(
            select(AssetMovement).where(AssetMovement.asset_id == asset_id).order_by(AssetMovement.created_at.desc())
        )
        return list(result.scalars().all())
