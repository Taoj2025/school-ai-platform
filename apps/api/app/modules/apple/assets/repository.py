from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import AppleAsset, AppleAssetMovement


async def get_asset(db: AsyncSession, asset_id: str) -> AppleAsset | None:
    result = await db.execute(select(AppleAsset).where(AppleAsset.id == asset_id))
    return result.scalar_one_or_none()


async def get_movements(db: AsyncSession, asset_id: str) -> list[AppleAssetMovement]:
    result = await db.execute(select(AppleAssetMovement).where(AppleAssetMovement.asset_id == asset_id).order_by(AppleAssetMovement.movement_date.desc()))
    return list(result.scalars().all())
