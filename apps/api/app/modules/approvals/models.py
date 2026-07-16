from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class Approval(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "approvals"

    module: Mapped[str] = mapped_column(String(50))
    resource_type: Mapped[str] = mapped_column(String(100))
    resource_id: Mapped[str] = mapped_column(String(36))
    approver_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    requester_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
