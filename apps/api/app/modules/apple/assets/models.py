import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from ....db.session import Base


class AppleAsset(Base):
    __tablename__ = "apple_assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    purchase_date = Column(Date, nullable=True)
    purchase_price = Column(Numeric(12, 2), nullable=True)
    current_value = Column(Numeric(12, 2), nullable=True)
    location = Column(String(200), nullable=True)
    status = Column(String(50), default="in_use")
    condition = Column(String(50), default="good")
    serial_number = Column(String(200), nullable=True)
    warranty_until = Column(Date, nullable=True)
    attachment_id = Column(String(36), nullable=True)
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    movements = relationship("AppleAssetMovement", back_populates="asset", cascade="all, delete-orphan")


class AppleAssetMovement(Base):
    __tablename__ = "apple_asset_movements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String(36), ForeignKey("apple_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    movement_type = Column(String(50), nullable=False)
    from_location = Column(String(200), nullable=True)
    to_location = Column(String(200), nullable=True)
    from_person = Column(String(200), nullable=True)
    to_person = Column(String(200), nullable=True)
    reason = Column(Text, nullable=True)
    movement_date = Column(Date, nullable=False)
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    asset = relationship("AppleAsset", back_populates="movements")
