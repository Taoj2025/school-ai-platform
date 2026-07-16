from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class Asset(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_assets"

    asset_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    purchase_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    source_file_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    movements: Mapped[list["AssetMovement"]] = relationship(
        "AssetMovement", back_populates="asset", cascade="all, delete-orphan"
    )


class AssetMovement(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_asset_movements"

    asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("apple_assets.id"))
    movement_type: Mapped[str] = mapped_column(String(50))
    from_location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    to_location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    movement_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset: Mapped["Asset"] = relationship("Asset", back_populates="movements")
