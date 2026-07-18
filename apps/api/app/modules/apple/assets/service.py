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
    
    async def scan_asset(self, qr_code: str, scan_status: str, remarks: Optional[str] = None) -> dict:
        """Process asset scan from mobile."""
        result = await self.db.execute(
            select(AppleAsset).where(AppleAsset.asset_code == qr_code)
        )
        asset = result.scalar_one_or_none()
        
        if not asset:
            return {
                "status": "not_found",
                "asset_id": None,
                "asset_name": None,
                "message": f"Asset with code {qr_code} not found",
            }
        
        asset.status = scan_status
        asset.updated_at = datetime.now(timezone.utc)
        
        movement = AppleAssetMovement(
            id=str(uuid.uuid4()),
            asset_id=asset.id,
            movement_type="scan",
            to_location=asset.location,
            reason=remarks or f"Status changed to {scan_status}",
            movement_date=date.today(),
        )
        self.db.add(movement)
        await self.db.flush()
        
        return {
            "status": "success",
            "asset_id": asset.id,
            "asset_name": asset.name,
            "message": f"Asset {asset.name} scanned successfully",
        }
    
    async def batch_scan(self, scans: list) -> dict:
        """Process batch asset scans."""
        results = []
        success_count = 0
        failed_count = 0
        
        for scan in scans:
            result = await self.scan_asset(
                scan.get("qr_code", ""),
                scan.get("scan_status", "found"),
                scan.get("remarks"),
            )
            results.append(result)
            if result["status"] == "success":
                success_count += 1
            else:
                failed_count += 1
        
        return {
            "processed": len(scans),
            "success": success_count,
            "failed": failed_count,
            "results": results,
        }
    
    async def infer_remarks(self, ocr_text: str, context: Optional[dict] = None) -> dict:
        """AI inference for handwritten remarks."""
        try:
            from app.workers.llm_tasks import call_llm_unified
            
            prompt = f"""你是学校资产管理助手。请根据以下OCR文本推断最可能的含义。

# OCR文本
{ocr_text}

# 上下文
{context or {}}

# 选项类别
1. 正常 / 良好
2. 已损坏（需维修或更换）
3. 已丢失（需说明原因）
4. 正常磨损
5. 其他（需说明原因）
6. 报废

# 输出格式（JSON）
{{"inferred_meaning": "最可能的含义", "category": "1-6中的类别", "confidence": 0.0-1.0, "alternatives": ["其他可能的选项"], "needs_confirmation": true/false}}
"""
            
            result = call_llm_unified.delay(
                task_type="remarks_infer",
                prompt=prompt,
                model="gpt-4o-mini",
            )
            llm_result = result.get(timeout=60) if hasattr(result, 'get') else None
        except Exception:
            llm_result = None
        
        if llm_result and llm_result.get("status") == "completed":
            import json
            try:
                import re
                json_match = re.search(r'\{.*\}', llm_result.get("result", "{}"), re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group())
                    return {
                        "inferred_meaning": parsed.get("inferred_meaning", "未知"),
                        "category": parsed.get("category", "1"),
                        "confidence": parsed.get("confidence", 0.5),
                        "alternatives": parsed.get("alternatives", []),
                        "needs_confirmation": parsed.get("needs_confirmation", True),
                    }
            except Exception:
                pass
        
        return {
            "inferred_meaning": ocr_text[:50] if len(ocr_text) > 50 else ocr_text,
            "category": "1",
            "confidence": 0.5,
            "alternatives": ["需人工确认"],
            "needs_confirmation": True,
        }
    
    async def locate_asset(self, asset_id: str) -> dict:
        """AI-powered asset location recommendation."""
        asset = await self.get_asset(asset_id)
        if not asset:
            return {"recommendations": [], "total_count": 0}
        
        try:
            from app.workers.llm_tasks import call_llm_unified
            
            prompt = f"""你是学校资产管理助手。请根据以下信息推荐最可能的资产位置。

# 资产信息
- 名称: {asset.name}
- 资产码: {asset.asset_code}
- 类别: {asset.category}
- 当前状态: {asset.status}
- 当前/历史位置: {asset.location or "未知"}

# 你的任务
基于以上信息，推测该资产最可能在的位置，并给出推荐理由。

# 输出格式（JSON数组）
{{"recommendations": [{{"location": "位置名称", "reason": "推荐理由", "priority": 1-3}}], "total_count": 数量}}
"""
            
            result = call_llm_unified.delay(
                task_type="asset_locator",
                prompt=prompt,
                model="gpt-4o-mini",
            )
            llm_result = result.get(timeout=60) if hasattr(result, 'get') else None
        except Exception:
            llm_result = None
        
        if llm_result and llm_result.get("status") == "completed":
            import json
            try:
                import re
                json_match = re.search(r'\[.*\]', llm_result.get("result", "[]"), re.DOTALL)
                if json_match:
                    recommendations = json.loads(json_match.group())
                    return {
                        "recommendations": recommendations[:5],
                        "total_count": len(recommendations),
                    }
            except Exception:
                pass
        
        return {
            "recommendations": [
                {"location": asset.location or "当前位置", "reason": "基于当前位置", "priority": 1},
                {"location": "仓库", "reason": "常见存储位置", "priority": 2},
            ],
            "total_count": 2,
        }
    
    async def generate_annual_report(self, academic_year: str, include_depreciation: bool = True) -> dict:
        """Generate annual asset report."""
        result = await self.db.execute(
            select(AppleAsset)
        )
        assets = list(result.scalars().all())
        
        total_value = sum(float(a.purchase_price or 0) for a in assets)
        by_category = {}
        for a in assets:
            cat = a.category or "其他"
            if cat not in by_category:
                by_category[cat] = {"count": 0, "value": 0}
            by_category[cat]["count"] += 1
            by_category[cat]["value"] += float(a.purchase_price or 0)
        
        depreciation_summary = {}
        if include_depreciation:
            from decimal import Decimal
            for a in assets:
                if a.purchase_date and a.purchase_price:
                    years = (date.today() - a.purchase_date).days / 365.25
                    if years >= 5:
                        current_val = 0
                    else:
                        current_val = float(a.purchase_price) * (1 - years / 5)
                    depreciation_summary[a.asset_code] = {
                        "original": float(a.purchase_price),
                        "current": round(current_val, 2),
                        "depreciation": round(float(a.purchase_price) - current_val, 2),
                    }
        
        return {
            "academic_year": academic_year,
            "total_assets": len(assets),
            "total_value": total_value,
            "by_category": by_category,
            "depreciation_summary": depreciation_summary,
            "download_url": f"/api/v1/apple/assets/reports/{academic_year}/download",
        }
