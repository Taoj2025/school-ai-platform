import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from decimal import Decimal
from .models import AppleAsset, AppleAssetMovement
from .schemas import (
    AssetCreate, AssetUpdate,
    AssetMovementCreate, AssetMovementUpdate,
    StocktakeRequest, WriteoffRequest, PrintLabelRequest,
)


class AssetService:
    """Service for managing assets and inventory."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_assets(
        self,
        category: Optional[str] = None,
        status: Optional[str] = None,
        location: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """List assets with filtering and pagination."""
        query = select(AppleAsset)
        count_query = select(func.count()).select_from(AppleAsset)
        
        if category:
            query = query.where(AppleAsset.category == category)
            count_query = count_query.where(AppleAsset.category == category)
        if status:
            query = query.where(AppleAsset.status == status)
            count_query = count_query.where(AppleAsset.status == status)
        if location:
            query = query.where(AppleAsset.location == location)
            count_query = count_query.where(AppleAsset.location == location)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleAsset.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        assets = result.scalars().all()
        
        items = [{
            "id": a.id,
            "asset_code": a.asset_code,
            "name": a.name,
            "category": a.category,
            "description": a.description,
            "purchase_date": a.purchase_date.isoformat() if a.purchase_date else None,
            "purchase_price": float(a.purchase_price) if a.purchase_price else None,
            "current_value": float(a.current_value) if a.current_value else None,
            "location": a.location,
            "status": a.status,
            "condition": a.condition,
            "serial_number": a.serial_number,
            "warranty_until": a.warranty_until.isoformat() if a.warranty_until else None,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        } for a in assets]
        
        return items, total
    
    async def get_asset(self, asset_id: str) -> Optional[AppleAsset]:
        """Get a single asset."""
        result = await self.db.execute(
            select(AppleAsset).where(AppleAsset.id == asset_id)
        )
        return result.scalar_one_or_none()
    
    async def create_asset(self, asset_data: AssetCreate) -> AppleAsset:
        """Create a new asset."""
        data = asset_data.model_dump()
        db_asset = AppleAsset(
            id=str(uuid.uuid4()),
            asset_code=data["asset_code"],
            name=data["name"],
            category=data["category"],
            description=data.get("description"),
            purchase_date=data.get("purchase_date"),
            purchase_price=Decimal(str(data["purchase_price"])) if data.get("purchase_price") else None,
            current_value=Decimal(str(data["purchase_price"])) if data.get("purchase_price") else None,
            location=data.get("location") or "Unknown",
            status="in_use",
            condition="good",
            serial_number=data.get("serial_number"),
            warranty_until=data.get("warranty_until"),
        )
        self.db.add(db_asset)
        await self.db.flush()
        return db_asset
    
    async def update_asset(self, asset_id: str, update_data: AssetUpdate) -> Optional[AppleAsset]:
        """Update an asset."""
        asset = await self.get_asset(asset_id)
        if not asset:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if key in ("purchase_price", "current_value") and value is not None:
                value = Decimal(str(value))
            if hasattr(asset, key):
                setattr(asset, key, value)
        
        asset.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return asset
    
    async def delete_asset(self, asset_id: str) -> bool:
        """Delete an asset."""
        asset = await self.get_asset(asset_id)
        if not asset:
            return False
        
        await self.db.delete(asset)
        await self.db.flush()
        return True
    
    async def get_stats(self) -> dict:
        """Get asset statistics."""
        # Total count by status
        total = await self.db.execute(select(func.count()).select_from(AppleAsset))
        total = total.scalar() or 0
        
        # By status
        in_use = await self.db.execute(
            select(func.count()).select_from(AppleAsset).where(AppleAsset.status == "in_use")
        )
        in_use = in_use.scalar() or 0
        
        maintenance = await self.db.execute(
            select(func.count()).select_from(AppleAsset).where(AppleAsset.status == "maintenance")
        )
        maintenance = maintenance.scalar() or 0
        
        written_off = await self.db.execute(
            select(func.count()).select_from(AppleAsset).where(AppleAsset.status == "written_off")
        )
        written_off = written_off.scalar() or 0
        
        # Total value
        total_value = await self.db.execute(
            select(func.coalesce(func.sum(AppleAsset.current_value), 0)).select_from(AppleAsset)
        )
        total_value = float(total_value.scalar() or 0)
        
        # Categories
        categories_result = await self.db.execute(
            select(AppleAsset.category, func.count(AppleAsset.id))
            .group_by(AppleAsset.category)
        )
        categories = {row[0]: row[1] for row in categories_result.all()}
        
        return {
            "total_assets": total,
            "in_use": in_use,
            "under_maintenance": maintenance,
            "written_off": written_off,
            "total_value": total_value,
            "categories": categories,
        }
    
    async def list_movements(self, asset_id: str):
        """List movements for an asset."""
        result = await self.db.execute(
            select(AppleAssetMovement)
            .where(AppleAssetMovement.asset_id == asset_id)
            .order_by(AppleAssetMovement.movement_date.desc())
        )
        movements = result.scalars().all()
        
        items = [{
            "id": m.id,
            "asset_id": m.asset_id,
            "movement_type": m.movement_type,
            "from_location": m.from_location,
            "to_location": m.to_location,
            "from_person": m.from_person,
            "to_person": m.to_person,
            "reason": m.reason,
            "movement_date": m.movement_date.isoformat() if m.movement_date else None,
            "created_at": m.created_at,
        } for m in movements]
        
        return items, len(items)
    
    async def add_movement(self, asset_id: str, movement_data: AssetMovementCreate) -> AppleAssetMovement:
        """Add a movement record for an asset."""
        data = movement_data.model_dump()
        
        db_movement = AppleAssetMovement(
            id=str(uuid.uuid4()),
            asset_id=asset_id,
            movement_type=data["movement_type"],
            from_location=data.get("from_location"),
            to_location=data.get("to_location"),
            from_person=data.get("from_person"),
            to_person=data.get("to_person"),
            reason=data.get("reason"),
            movement_date=data["movement_date"],
        )
        self.db.add(db_movement)
        
        # Update asset location if moving
        if data.get("to_location"):
            asset = await self.get_asset(asset_id)
            if asset:
                asset.location = data["to_location"]
        
        await self.db.flush()
        return db_movement
    
    async def update_movement(
        self,
        asset_id: str,
        movement_id: str,
        update_data: AssetMovementUpdate,
    ) -> Optional[AppleAssetMovement]:
        """Update a movement record."""
        result = await self.db.execute(
            select(AppleAssetMovement)
            .where(AppleAssetMovement.id == movement_id)
            .where(AppleAssetMovement.asset_id == asset_id)
        )
        movement = result.scalar_one_or_none()
        if not movement:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(movement, key):
                setattr(movement, key, value)
        
        await self.db.flush()
        return movement
    
    async def perform_stocktake(self, request: StocktakeRequest) -> dict:
        """
        Perform stocktake/inventory check.
        
        In production, this would integrate with OCR scanning for asset codes.
        """
        query = select(AppleAsset)
        if request.location:
            query = query.where(AppleAsset.location == request.location)
        if request.category:
            query = query.where(AppleAsset.category == request.category)
        
        result = await self.db.execute(query)
        all_assets = result.scalars().all()
        
        # Mock found assets (in production, would come from barcode scanner)
        found_assets = [a.asset_code for a in all_assets[:len(all_assets)//2]]
        missing_assets = [a.asset_code for a in all_assets[len(all_assets)//2:]]
        
        locations_checked = list(set([a.location for a in all_assets]))
        
        return {
            "stocktake_id": str(uuid.uuid4()),
            "total_assets": len(all_assets),
            "found_assets": found_assets,
            "missing_assets": missing_assets,
            "locations_checked": locations_checked,
            "notes": request.notes,
        }
    
    async def writeoff_asset(self, asset_id: str, request: WriteoffRequest) -> dict:
        """Write off an asset."""
        asset = await self.get_asset(asset_id)
        if not asset:
            raise ValueError("Asset not found")
        
        asset.status = "written_off"
        asset.current_value = 0
        asset.updated_at = datetime.now(timezone.utc)
        
        # Add movement record
        movement = AppleAssetMovement(
            id=str(uuid.uuid4()),
            asset_id=asset_id,
            movement_type="write_off",
            reason=request.reason,
            movement_date=date.today(),
        )
        self.db.add(movement)
        
        await self.db.flush()
        
        return {
            "asset_id": asset_id,
            "writeoff_date": date.today().isoformat(),
            "reason": request.reason,
            "status": "written_off",
        }
    
    async def print_labels(self, request: PrintLabelRequest) -> dict:
        """
        Generate labels for assets.
        
        In production, this would integrate with a label printing service.
        """
        result = await self.db.execute(
            select(AppleAsset).where(AppleAsset.id.in_(request.asset_ids))
        )
        assets = result.scalars().all()
        
        labels = []
        for asset in assets:
            labels.append({
                "asset_id": asset.id,
                "asset_code": asset.asset_code,
                "name": asset.name,
                "location": asset.location,
                "category": asset.category,
                "format": request.label_format,
            })
        
        return {
            "labels": labels,
            "download_url": f"/api/v1/apple/assets/labels/download",
            "total_count": len(labels),
        }
