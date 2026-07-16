from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AppleAsset, AppleAssetMovement
from .schemas import AssetCreate, AssetResponse, AssetMovementCreate, AssetMovementResponse
from ....db.session import get_db
from ....common.schemas import success_response
from ....common.pagination import paginate

router = APIRouter(prefix="/apple/assets", tags=["apple-assets"])


@router.get("", response_model=dict)
async def list_assets(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(AppleAsset)
    count_query = select(func.count()).select_from(AppleAsset)
    if category:
        query = query.where(AppleAsset.category == category)
        count_query = count_query.where(AppleAsset.category == category)
    if status:
        query = query.where(AppleAsset.status == status)
        count_query = count_query.where(AppleAsset.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AppleAsset.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [AssetResponse.model_validate(a).model_dump() for a in result.scalars().all()]
    return success_response(data=paginate(items, total, page, page_size))


@router.post("", response_model=dict)
async def create_asset(asset: AssetCreate, db: AsyncSession = Depends(get_db)):
    db_asset = AppleAsset(**asset.model_dump())
    db.add(db_asset)
    await db.flush()
    return success_response(data=AssetResponse.model_validate(db_asset).model_dump())


@router.get("/{asset_id}", response_model=dict)
async def get_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AppleAsset).where(AppleAsset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return success_response(data=AssetResponse.model_validate(asset).model_dump())


@router.post("/{asset_id}/movements", response_model=dict)
async def add_movement(asset_id: str, movement: AssetMovementCreate, db: AsyncSession = Depends(get_db)):
    db_movement = AppleAssetMovement(asset_id=asset_id, **movement.model_dump())
    db.add(db_movement)
    await db.flush()
    return success_response(data=AssetMovementResponse.model_validate(db_movement).model_dump())


@router.get("/{asset_id}/movements", response_model=dict)
async def list_movements(asset_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AppleAssetMovement).where(AppleAssetMovement.asset_id == asset_id).order_by(AppleAssetMovement.movement_date.desc()))
    items = [AssetMovementResponse.model_validate(m).model_dump() for m in result.scalars().all()]
    return success_response(data={"items": items, "total": len(items)})
