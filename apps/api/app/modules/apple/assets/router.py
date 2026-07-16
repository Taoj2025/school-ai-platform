from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.schemas import ResponseSchema
from app.core.permissions import get_current_user
from app.db.session import get_db
from app.modules.apple.assets.repository import AssetRepository
from app.modules.apple.assets.schemas import AssetCreate, AssetMovementCreate, AssetMovementRead, AssetRead
from app.modules.apple.assets.service import AssetService

router = APIRouter(prefix="/apple/assets", tags=["Apple - Assets"])


@router.get("", response_model=ResponseSchema[list[AssetRead]])
async def list_assets(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AssetService(AssetRepository(db))
    assets = await service.list_assets()
    return ResponseSchema(data=[AssetRead.model_validate(a) for a in assets], meta={})


@router.post("", response_model=ResponseSchema[AssetRead])
async def create_asset(
    data: AssetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AssetService(AssetRepository(db))
    asset = await service.create_asset(data, current_user["user_id"])
    return ResponseSchema(data=AssetRead.model_validate(asset), meta={})


@router.get("/{asset_id}", response_model=ResponseSchema[AssetRead])
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AssetService(AssetRepository(db))
    asset = await service.get_asset(asset_id)
    return ResponseSchema(data=AssetRead.model_validate(asset), meta={})


@router.get("/{asset_id}/movements", response_model=ResponseSchema[list[AssetMovementRead]])
async def list_movements(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AssetService(AssetRepository(db))
    movements = await service.list_movements(asset_id)
    return ResponseSchema(data=[AssetMovementRead.model_validate(m) for m in movements], meta={})


@router.post("/{asset_id}/movements", response_model=ResponseSchema[AssetMovementRead])
async def add_movement(
    asset_id: str,
    data: AssetMovementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = AssetService(AssetRepository(db))
    movement = await service.add_movement(asset_id, data, current_user["user_id"])
    return ResponseSchema(data=AssetMovementRead.model_validate(movement), meta={})
