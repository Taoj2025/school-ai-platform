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


class AssetResponse(BaseModel):
    id: str
    asset_code: str
    name: str
    category: str
    description: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    location: Optional[str] = None
    status: str
    condition: str
    serial_number: Optional[str] = None
    warranty_until: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AssetMovementCreate(BaseModel):
    movement_type: str
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    from_person: Optional[str] = None
    to_person: Optional[str] = None
    reason: Optional[str] = None
    movement_date: date


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
