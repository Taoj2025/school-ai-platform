from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from .models import AppleAsset, AppleAssetMovement
from .schemas import (
    AssetCreate, AssetUpdate, AssetResponse,
    AssetMovementCreate, AssetMovementUpdate, AssetMovementResponse,
    StocktakeRequest, StocktakeResponse,
    WriteoffRequest, WriteoffResponse,
    PrintLabelRequest, PrintLabelResponse,
    AssetStatsResponse,
    AssetScanRequest, AssetScanResponse,
    BatchScanRequest, BatchScanResponse,
    RemarksInferRequest, RemarksInferResponse,
    AssetLocatorRequest, AssetLocatorResponse,
    AnnualReportRequest, AnnualReportResponse,
)
from .service import AssetService
from ....db.session import get_db
from ....common.schemas import success_response
from ....common.pagination import paginate

router = APIRouter(prefix="/apple/assets", tags=["apple-assets"])


@router.get("", response_model=dict)
async def list_assets(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    items, total = await service.list_assets(
        category=category,
        status=status,
        location=location,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.get("/stats", response_model=dict)
async def get_asset_stats(
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    stats = await service.get_stats()
    return success_response(data=stats)


@router.post("", response_model=dict)
async def create_asset(asset: AssetCreate, db: AsyncSession = Depends(get_db)):
    service = AssetService(db)
    db_asset = await service.create_asset(asset)
    return success_response(data=AssetResponse.model_validate(db_asset).model_dump())


@router.get("/{asset_id}", response_model=dict)
async def get_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    service = AssetService(db)
    asset = await service.get_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return success_response(data=AssetResponse.model_validate(asset).model_dump())


@router.patch("/{asset_id}", response_model=dict)
async def update_asset(
    asset_id: str,
    update_data: AssetUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    asset = await service.update_asset(asset_id, update_data)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return success_response(data=AssetResponse.model_validate(asset).model_dump())


@router.delete("/{asset_id}", response_model=dict)
async def delete_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    service = AssetService(db)
    deleted = await service.delete_asset(asset_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Asset not found")
    return success_response(data={"deleted": True, "id": asset_id})


@router.get("/{asset_id}/movements", response_model=dict)
async def list_movements(asset_id: str, db: AsyncSession = Depends(get_db)):
    service = AssetService(db)
    items, total = await service.list_movements(asset_id)
    return success_response(data={"items": items, "total": total})


@router.post("/{asset_id}/movements", response_model=dict)
async def add_movement(
    asset_id: str,
    movement: AssetMovementCreate,
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    db_movement = await service.add_movement(asset_id, movement)
    return success_response(data=AssetMovementResponse.model_validate(db_movement).model_dump())


@router.patch("/{asset_id}/movements/{movement_id}", response_model=dict)
async def update_movement(
    asset_id: str,
    movement_id: str,
    update_data: AssetMovementUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    movement = await service.update_movement(asset_id, movement_id, update_data)
    if not movement:
        raise HTTPException(status_code=404, detail="Movement not found")
    return success_response(data=AssetMovementResponse.model_validate(movement).model_dump())


@router.post("/stocktake", response_model=dict)
async def create_stocktake(
    request: StocktakeRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    result = await service.perform_stocktake(request)
    return success_response(data=result)


@router.post("/{asset_id}/writeoff", response_model=dict)
async def writeoff_asset(
    asset_id: str,
    request: WriteoffRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    result = await service.writeoff_asset(asset_id, request)
    return success_response(data=result)


@router.post("/print-labels", response_model=dict)
async def print_labels(
    request: PrintLabelRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    result = await service.print_labels(request)
    return success_response(data=result)


@router.post("/scan", response_model=dict)
async def scan_asset(
    request: AssetScanRequest,
    db: AsyncSession = Depends(get_db),
):
    """Process asset scan from mobile."""
    service = AssetService(db)
    result = await service.scan_asset(request.qr_code, request.scan_status, request.remarks)
    return success_response(data=result)


@router.post("/scan/batch", response_model=dict)
async def batch_scan_assets(
    request: BatchScanRequest,
    db: AsyncSession = Depends(get_db),
):
    """Process batch asset scans."""
    service = AssetService(db)
    result = await service.batch_scan(request.scans)
    return success_response(data=result)


@router.post("/remarks/infer", response_model=dict)
async def infer_remarks(
    request: RemarksInferRequest,
    db: AsyncSession = Depends(get_db),
):
    """AI inference for handwritten remarks."""
    service = AssetService(db)
    result = await service.infer_remarks(request.ocr_text, request.context)
    return success_response(data=result)


@router.post("/locate", response_model=dict)
async def locate_asset(
    request: AssetLocatorRequest,
    db: AsyncSession = Depends(get_db),
):
    """AI-powered asset location recommendation."""
    service = AssetService(db)
    result = await service.locate_asset(request.asset_id)
    return success_response(data=result)


@router.get("/reports/annual", response_model=dict)
async def generate_annual_report(
    academic_year: str = Query(..., description="e.g., 2025-2026"),
    include_depreciation: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """Generate annual asset report."""
    service = AssetService(db)
    result = await service.generate_annual_report(academic_year, include_depreciation)
    return success_response(data=result)
