from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AppleAsset, AppleAssetMovement


class AssetRepository:
    """Repository for asset data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, asset_id: str) -> Optional[AppleAsset]:
        """Get asset by ID."""
        result = await self.db.execute(
            select(AppleAsset).where(AppleAsset.id == asset_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_code(self, asset_code: str) -> Optional[AppleAsset]:
        """Get asset by asset code."""
        result = await self.db.execute(
            select(AppleAsset).where(AppleAsset.asset_code == asset_code)
        )
        return result.scalar_one_or_none()
    
    async def get_movement_by_id(self, movement_id: str) -> Optional[AppleAssetMovement]:
        """Get movement by ID."""
        result = await self.db.execute(
            select(AppleAssetMovement).where(AppleAssetMovement.id == movement_id)
        )
        return result.scalar_one_or_none()
    
    async def list_by_location(self, location: str) -> List[AppleAsset]:
        """Get all assets at a specific location."""
        result = await self.db.execute(
            select(AppleAsset)
            .where(AppleAsset.location == location)
            .order_by(AppleAsset.asset_code)
        )
        return list(result.scalars().all())
    
    async def list_by_category(self, category: str) -> List[AppleAsset]:
        """Get all assets in a specific category."""
        result = await self.db.execute(
            select(AppleAsset)
            .where(AppleAsset.category == category)
            .order_by(AppleAsset.asset_code)
        )
        return list(result.scalars().all())
    
    async def count_by_status(self, status: str) -> int:
        """Count assets by status."""
        result = await self.db.execute(
            select(func.count()).select_from(AppleAsset)
            .where(AppleAsset.status == status)
        )
        return result.scalar() or 0
    
    async def sum_current_value(self) -> float:
        """Sum of all asset current values."""
        result = await self.db.execute(
            select(func.coalesce(func.sum(AppleAsset.current_value), 0))
            .select_from(AppleAsset)
        )
        return float(result.scalar() or 0)
    
    async def get_all_locations(self) -> List[str]:
        """Get all unique locations."""
        result = await self.db.execute(
            select(AppleAsset.location)
            .distinct()
            .where(AppleAsset.location.isnot(None))
        )
        return [row[0] for row in result.all()]
