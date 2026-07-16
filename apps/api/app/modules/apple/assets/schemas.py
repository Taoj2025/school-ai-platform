from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class AssetCreate(BaseModel):
    asset_number: str
    name: str
    category: str | None = None
    location: str | None = None
    purchase_date: date | None = None
    purchase_price: Decimal | None = None
    note: str | None = None


class AssetRead(BaseModel):
    id: str
    asset_number: str
    name: str
    category: str | None = None
    location: str | None = None
    purchase_date: date | None = None
    purchase_price: Decimal | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AssetMovementCreate(BaseModel):
    movement_type: str
    from_location: str | None = None
    to_location: str | None = None
    movement_date: date | None = None
    reason: str | None = None


class AssetMovementRead(BaseModel):
    id: str
    asset_id: str
    movement_type: str
    from_location: str | None = None
    to_location: str | None = None
    movement_date: date | None = None
    reason: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
