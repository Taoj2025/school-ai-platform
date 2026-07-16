from app.modules.apple.assets.models import Asset, AssetMovement
from app.modules.apple.assets.repository import AssetRepository
from app.modules.apple.assets.schemas import AssetCreate, AssetMovementCreate
from app.common.errors import NotFoundError


class AssetService:
    def __init__(self, repo: AssetRepository):
        self.repo = repo

    async def list_assets(self) -> list[Asset]:
        return await self.repo.list()

    async def get_asset(self, asset_id: str) -> Asset:
        asset = await self.repo.get_by_id(asset_id)
        if not asset:
            raise NotFoundError(f"Asset {asset_id} not found")
        return asset

    async def create_asset(self, data: AssetCreate, user_id: str) -> Asset:
        asset = Asset(
            asset_number=data.asset_number,
            name=data.name,
            category=data.category,
            location=data.location,
            purchase_date=data.purchase_date,
            purchase_price=data.purchase_price,
            note=data.note,
            created_by=user_id,
        )
        return await self.repo.create(asset)

    async def add_movement(self, asset_id: str, data: AssetMovementCreate, user_id: str) -> AssetMovement:
        await self.get_asset(asset_id)
        movement = AssetMovement(
            asset_id=asset_id,
            movement_type=data.movement_type,
            from_location=data.from_location,
            to_location=data.to_location,
            movement_date=data.movement_date,
            reason=data.reason,
            created_by=user_id,
        )
        return await self.repo.add_movement(movement)

    async def list_movements(self, asset_id: str) -> list[AssetMovement]:
        return await self.repo.list_movements(asset_id)
