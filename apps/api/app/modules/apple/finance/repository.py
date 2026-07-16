from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .models import AppleFinanceRecord, AppleQuotation


class FinanceRepository:
    """Repository for finance data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, record_id: str) -> Optional[AppleFinanceRecord]:
        """Get finance record by ID."""
        result = await self.db.execute(
            select(AppleFinanceRecord).where(AppleFinanceRecord.id == record_id)
        )
        return result.scalar_one_or_none()
    
    async def get_quotation_by_id(self, quotation_id: str) -> Optional[AppleQuotation]:
        """Get quotation by ID."""
        result = await self.db.execute(
            select(AppleQuotation).where(AppleQuotation.id == quotation_id)
        )
        return result.scalar_one_or_none()
    
    async def list_quotations_by_item(self, item_description: str) -> List[AppleQuotation]:
        """Get all quotations for a specific item."""
        result = await self.db.execute(
            select(AppleQuotation)
            .where(AppleQuotation.item_description == item_description)
            .order_by(AppleQuotation.total_price)
        )
        return list(result.scalars().all())
    
    async def sum_by_type(
        self,
        record_type: str,
        academic_year: Optional[str] = None,
    ) -> float:
        """Sum amounts by record type."""
        query = select(
            func.coalesce(func.sum(AppleFinanceRecord.amount), 0)
        ).where(AppleFinanceRecord.record_type == record_type)
        
        if academic_year:
            query = query.where(AppleFinanceRecord.academic_year == academic_year)
        
        result = await self.db.execute(query)
        return float(result.scalar() or 0)
    
    async def count_pending(self, academic_year: Optional[str] = None) -> int:
        """Count pending records."""
        query = select(func.count()).select_from(AppleFinanceRecord)
        query = query.where(AppleFinanceRecord.status == "pending")
        
        if academic_year:
            query = query.where(AppleFinanceRecord.academic_year == academic_year)
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def list_by_month(
        self,
        record_type: str,
        year: int,
        month: int,
    ) -> List[AppleFinanceRecord]:
        """List records by type and month."""
        from datetime import date
        month_start = date(year, month, 1)
        if month == 12:
            month_end = date(year + 1, 1, 1)
        else:
            month_end = date(year, month + 1, 1)
        
        result = await self.db.execute(
            select(AppleFinanceRecord)
            .where(AppleFinanceRecord.record_type == record_type)
            .where(AppleFinanceRecord.transaction_date >= month_start)
            .where(AppleFinanceRecord.transaction_date < month_end)
            .order_by(AppleFinanceRecord.transaction_date)
        )
        return list(result.scalars().all())
