from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import AuditMixin, Base, TimestampMixin, UUIDMixin


class Award(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_awards"

    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50))
    amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    semester: Mapped[str] = mapped_column(String(50))
    year: Mapped[int] = mapped_column(Integer)

    recipients: Mapped[list["AwardRecipient"]] = relationship(
        "AwardRecipient", back_populates="award", cascade="all, delete-orphan"
    )


class AwardRecipient(Base, UUIDMixin, TimestampMixin, AuditMixin):
    __tablename__ = "apple_award_recipients"

    award_id: Mapped[str] = mapped_column(String(36), ForeignKey("apple_awards.id"))
    student_id: Mapped[str] = mapped_column(String(36))
    score: Mapped[float | None] = mapped_column(nullable=True)
    ranking: Mapped[int | None] = mapped_column(Integer, nullable=True)
    certificate_generated: Mapped[bool] = mapped_column(default=False)
    certificate_pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    award: Mapped["Award"] = relationship("Award", back_populates="recipients")
