from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class AssetCreate(BaseModel):
    asset_code: str
    name: str
    category: str
    description: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    location: Optional[str] = None
    serial_number: Optional[str] = None
    warranty_until: Optional[date] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    condition: Optional[str] = None
    current_value: Optional[float] = None


class AssetResponse(BaseModel):
    id: str
    asset_code: str
    name: str
    category: str
    description: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    location: str
    status: str
    condition: str
    serial_number: Optional[str] = None
    warranty_until: Optional[date] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssetMovementCreate(BaseModel):
    movement_type: str  # "transfer", "maintenance", "repair"
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    from_person: Optional[str] = None
    to_person: Optional[str] = None
    reason: Optional[str] = None
    movement_date: date


class AssetMovementUpdate(BaseModel):
    movement_type: Optional[str] = None
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    from_person: Optional[str] = None
    to_person: Optional[str] = None
    reason: Optional[str] = None
    movement_date: Optional[date] = None


class AssetMovementResponse(BaseModel):
    id: str
    asset_id: str
    movement_type: str
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    from_person: Optional[str] = None
    to_person: Optional[str] = None
    reason: Optional[str] = None
    movement_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class StocktakeRequest(BaseModel):
    location: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None


class StocktakeResponse(BaseModel):
    stocktake_id: str
    total_assets: int
    found_assets: list[str]
    missing_assets: list[str]
    locations_checked: list[str]


class WriteoffRequest(BaseModel):
    reason: str
    approved_by: Optional[str] = None
    notes: Optional[str] = None


class WriteoffResponse(BaseModel):
    asset_id: str
    writeoff_date: date
    reason: str
    status: str


class PrintLabelRequest(BaseModel):
    asset_ids: list[str]
    label_format: str = "standard"  # "standard", "barcode", "qrcode"


class PrintLabelResponse(BaseModel):
    labels: list[dict]
    download_url: str
    total_count: int


class AssetStatsResponse(BaseModel):
    total_assets: int
    in_use: int
    under_maintenance: int
    written_off: int
    total_value: float
    categories: dict


class AssetScanRequest(BaseModel):
    qr_code: str
    scan_status: str  # "found", "missing", "damaged", "transferred"
    location_id: Optional[str] = None
    remarks: Optional[str] = None
    photo_id: Optional[str] = None


class AssetScanResponse(BaseModel):
    status: str
    asset_id: Optional[str] = None
    asset_name: Optional[str] = None
    message: str


class BatchScanRequest(BaseModel):
    scans: list[AssetScanRequest]


class BatchScanResponse(BaseModel):
    processed: int
    success: int
    failed: int
    results: list[AssetScanResponse]


class RemarksInferRequest(BaseModel):
    ocr_text: str
    context: Optional[dict] = None


class RemarksInferResponse(BaseModel):
    inferred_meaning: str
    category: str
    confidence: float
    alternatives: list[str]
    needs_confirmation: bool


class AssetLocatorRequest(BaseModel):
    asset_id: str


class AssetLocatorResponse(BaseModel):
    recommendations: list[dict]
    total_count: int


class AnnualReportRequest(BaseModel):
    academic_year: str
    include_depreciation: bool = True
    include_movements: bool = True


class AnnualReportResponse(BaseModel):
    academic_year: str
    total_assets: int
    total_value: float
    by_category: dict
    depreciation_summary: dict
    download_url: str
