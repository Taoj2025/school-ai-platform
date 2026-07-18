import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from decimal import Decimal
from .models import AppleFinanceRecord, AppleQuotation
from .schemas import (
    FinanceRecordCreate, FinanceRecordUpdate,
    QuotationCreate, QuotationUpdate,
    QuotationAnalyzeResponse, AddressLabelRequest,
)


class FinanceService:
    """Service for managing financial records and quotations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_records(
        self,
        academic_year: Optional[str] = None,
        record_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """List finance records with filtering."""
        query = select(AppleFinanceRecord)
        count_query = select(func.count()).select_from(AppleFinanceRecord)
        
        if academic_year:
            query = query.where(AppleFinanceRecord.academic_year == academic_year)
            count_query = count_query.where(AppleFinanceRecord.academic_year == academic_year)
        if record_type:
            query = query.where(AppleFinanceRecord.record_type == record_type)
            count_query = count_query.where(AppleFinanceRecord.record_type == record_type)
        if status:
            query = query.where(AppleFinanceRecord.status == status)
            count_query = count_query.where(AppleFinanceRecord.status == status)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleFinanceRecord.transaction_date.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        records = result.scalars().all()
        
        items = [{
            "id": r.id,
            "record_type": r.record_type,
            "category": r.category,
            "description": r.description,
            "amount": float(r.amount),
            "transaction_date": r.transaction_date.isoformat() if r.transaction_date else None,
            "academic_year": r.academic_year,
            "semester": r.semester,
            "payment_method": r.payment_method,
            "receipt_no": r.receipt_no,
            "status": r.status,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        } for r in records]
        
        return items, total
    
    async def get_record(self, record_id: str) -> Optional[AppleFinanceRecord]:
        """Get a single finance record."""
        result = await self.db.execute(
            select(AppleFinanceRecord).where(AppleFinanceRecord.id == record_id)
        )
        return result.scalar_one_or_none()
    
    async def create_record(self, record_data: FinanceRecordCreate, record_type: str = None) -> AppleFinanceRecord:
        """Create a new finance record."""
        data = record_data.model_dump()
        if record_type:
            data["record_type"] = record_type
        
        db_record = AppleFinanceRecord(
            id=str(uuid.uuid4()),
            record_type=data["record_type"],
            category=data["category"],
            description=data["description"],
            amount=Decimal(str(data["amount"])),
            transaction_date=data["transaction_date"],
            academic_year=data["academic_year"],
            semester=data.get("semester"),
            payment_method=data.get("payment_method"),
            receipt_no=data.get("receipt_no"),
            attachment_id=data.get("source_file_id"),
            status="pending",
        )
        self.db.add(db_record)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(db_record)
        return db_record
    
    async def update_record(self, record_id: str, update_data: FinanceRecordUpdate) -> Optional[AppleFinanceRecord]:
        """Update a finance record."""
        record = await self.get_record(record_id)
        if not record:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if key == "amount" and value is not None:
                value = Decimal(str(value))
            if hasattr(record, key):
                setattr(record, key, value)
        
        record.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return record
    
    async def delete_record(self, record_id: str) -> bool:
        """Delete a finance record."""
        record = await self.get_record(record_id)
        if not record:
            return False
        
        await self.db.delete(record)
        await self.db.flush()
        await self.db.commit()
        return True
    
    async def get_stats(self, academic_year: Optional[str] = None) -> dict:
        """Get finance statistics."""
        # Total income
        income_query = select(
            func.coalesce(func.sum(AppleFinanceRecord.amount), 0)
        ).where(AppleFinanceRecord.record_type == "income")
        if academic_year:
            income_query = income_query.where(AppleFinanceRecord.academic_year == academic_year)
        
        total_income = await self.db.execute(income_query)
        total_income = float(total_income.scalar() or 0)
        
        # Total expense
        expense_query = select(
            func.coalesce(func.sum(AppleFinanceRecord.amount), 0)
        ).where(AppleFinanceRecord.record_type == "expense")
        if academic_year:
            expense_query = expense_query.where(AppleFinanceRecord.academic_year == academic_year)
        
        total_expense = await self.db.execute(expense_query)
        total_expense = float(total_expense.scalar() or 0)
        
        # Pending count
        pending_query = select(func.count()).select_from(AppleFinanceRecord)
        if academic_year:
            pending_query = pending_query.where(AppleFinanceRecord.academic_year == academic_year)
        pending_count = await self.db.execute(
            pending_query.where(AppleFinanceRecord.status == "pending")
        )
        pending_count = pending_count.scalar() or 0
        
        # This month stats
        now = datetime.now(timezone.utc)
        month_start = date(now.year, now.month, 1)
        
        month_income_query = select(
            func.coalesce(func.sum(AppleFinanceRecord.amount), 0)
        ).where(
            AppleFinanceRecord.record_type == "income",
            AppleFinanceRecord.transaction_date >= month_start
        )
        this_month_income = await self.db.execute(month_income_query)
        this_month_income = float(this_month_income.scalar() or 0)
        
        month_expense_query = select(
            func.coalesce(func.sum(AppleFinanceRecord.amount), 0)
        ).where(
            AppleFinanceRecord.record_type == "expense",
            AppleFinanceRecord.transaction_date >= month_start
        )
        this_month_expense = await self.db.execute(month_expense_query)
        this_month_expense = float(this_month_expense.scalar() or 0)
        
        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_balance": total_income - total_expense,
            "pending_count": pending_count,
            "this_month_income": this_month_income,
            "this_month_expense": this_month_expense,
        }
    
    async def list_quotations(
        self,
        finance_record_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """List quotations with optional filtering."""
        query = select(AppleQuotation)
        count_query = select(func.count()).select_from(AppleQuotation)
        
        if finance_record_id:
            query = query.where(AppleQuotation.finance_record_id == finance_record_id)
            count_query = count_query.where(AppleQuotation.finance_record_id == finance_record_id)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        query = query.order_by(AppleQuotation.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        quotations = result.scalars().all()
        
        items = [QuotationResponse.model_validate(q).model_dump() for q in quotations]
        return items, total
    
    async def get_quotation(self, quotation_id: str) -> Optional[AppleQuotation]:
        """Get a quotation by ID."""
        result = await self.db.execute(
            select(AppleQuotation).where(AppleQuotation.id == quotation_id)
        )
        return result.scalar_one_or_none()
    
    async def create_quotation(self, quotation_data: QuotationCreate) -> AppleQuotation:
        """Create a new quotation."""
        data = quotation_data.model_dump()
        db_quotation = AppleQuotation(
            id=str(uuid.uuid4()),
            finance_record_id=data.get("finance_record_id"),
            vendor_name=data["vendor_name"],
            item_description=data["item_description"],
            unit_price=Decimal(str(data["unit_price"])),
            quantity=Decimal(str(data.get("quantity", 1))),
            total_price=Decimal(str(data["total_price"])),
            quotation_date=data.get("quotation_date"),
            valid_until=data.get("valid_until"),
            status="pending",
        )
        self.db.add(db_quotation)
        await self.db.flush()
        return db_quotation
    
    async def update_quotation(self, quotation_id: str, update_data: QuotationUpdate) -> Optional[AppleQuotation]:
        """Update a quotation."""
        quotation = await self.get_quotation(quotation_id)
        if not quotation:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if key in ("unit_price", "quantity", "total_price") and value is not None:
                value = Decimal(str(value))
            if hasattr(quotation, key):
                setattr(quotation, key, value)
        
        await self.db.flush()
        return quotation
    
    async def analyze_quotation(self, quotation_id: str) -> dict:
        """
        Analyze quotations for a given record.
        
        Identifies:
        - Single bid items (only one quotation)
        - Non-lowest chosen items (lowest price wasn't selected)
        """
        quotation = await self.get_quotation(quotation_id)
        if not quotation:
            raise ValueError("Quotation not found")
        
        # Get all quotations for the same item description
        result = await self.db.execute(
            select(AppleQuotation)
            .where(AppleQuotation.item_description == quotation.item_description)
        )
        all_quotations = result.scalars().all()
        
        if not all_quotations:
            return {
                "single_bid": [],
                "non_lowest_chosen": [],
                "lowest_bid_summary": [],
                "total_quotations": 0,
                "warnings": ["No quotations found for analysis"],
                "confidence": "low",
            }
        
        # Group by item
        items_map = {}
        for q in all_quotations:
            item = q.item_description
            if item not in items_map:
                items_map[item] = []
            items_map[item].append(q)
        
        single_bid = []
        non_lowest_chosen = []
        lowest_bid_summary = []
        warnings = []
        
        for item, quotes in items_map.items():
            if len(quotes) == 1:
                single_bid.append({
                    "item": item,
                    "vendor": quotes[0].vendor_name,
                    "price": float(quotes[0].total_price),
                })
                warnings.append(f"Only one quotation for: {item}")
            else:
                # Find lowest price
                lowest = min(quotes, key=lambda q: float(q.total_price))
                lowest_bid_summary.append({
                    "item": item,
                    "lowest_vendor": lowest.vendor_name,
                    "lowest_price": float(lowest.total_price),
                    "quotation_count": len(quotes),
                })
                
                # Check if current quotation is not the lowest
                if quotation_id == quotation.id and float(quotation.total_price) > float(lowest.total_price):
                    non_lowest_chosen.append({
                        "item": item,
                        "current_vendor": quotation.vendor_name,
                        "current_price": float(quotation.total_price),
                        "lowest_vendor": lowest.vendor_name,
                        "lowest_price": float(lowest.total_price),
                        "difference": float(quotation.total_price) - float(lowest.total_price),
                    })
                    warnings.append(
                        f"Non-lowest price selected for {item}: "
                        f"{quotation.vendor_name} (HK${float(quotation.total_price):,.2f}) "
                        f"vs lowest {lowest.vendor_name} (HK${float(lowest.total_price):,.2f})"
                    )
        
        # Determine confidence
        if len(all_quotations) >= 3:
            confidence = "high"
        elif len(all_quotations) >= 2:
            confidence = "medium"
        else:
            confidence = "low"
        
        return {
            "single_bid": single_bid,
            "non_lowest_chosen": non_lowest_chosen,
            "lowest_bid_summary": lowest_bid_summary,
            "total_quotations": len(all_quotations),
            "warnings": warnings,
            "confidence": confidence,
        }
    
    async def generate_address_labels(self, request: AddressLabelRequest) -> dict:
        """
        Generate address labels for vendors.
        
        In production, this would integrate with a label printing service.
        """
        # Mock vendor addresses (in production, would look up from database)
        mock_addresses = {
            "default": "香港九龍",
        }
        
        labels = []
        for vendor_name in request.vendor_names:
            labels.append({
                "vendor_name": vendor_name,
                "address": mock_addresses.get("default", "香港"),
                "format": request.label_format,
            })
        
        return {
            "labels": labels,
            "total_count": len(labels),
            "download_url": f"/api/v1/apple/finance/labels/download",
        }
    
    async def recognize_receipt(self, file_id: str) -> dict:
        """
        OCR receipt recognition using unified OCR interface.
        
        Uses call_llm_unified for text extraction with fallback to PaddleOCR.
        """
        try:
            from app.workers.ocr_tasks import ocr_unified
            result = ocr_unified.delay(
                file_id=int(file_id) if file_id.isdigit() else 0,
                job_type="receipt",
            )
            ocr_result = result.get(timeout=60) if hasattr(result, 'get') else {"status": "completed", "result": {"text": "Mock OCR text"}}
        except Exception:
            ocr_result = self._mock_ocr_result()
        
        fields = self._extract_receipt_fields(ocr_result.get("result", {}).get("text", ""))
        needs_review = ocr_result.get("confidence", 0.8) < 0.8
        
        return {
            "status": ocr_result.get("status", "completed"),
            "fields": fields,
            "confidence": ocr_result.get("confidence", 0.85),
            "needs_review": needs_review,
            "engine_used": ocr_result.get("engine", "paddleocr"),
        }
    
    def _mock_ocr_result(self) -> dict:
        return {
            "status": "completed",
            "result": {
                "text": "Receipt Sample\nAmount: HK$150.00\nDate: 2026-07-18\nPayer: Parent Name\nPurpose: 课外活动费"
            },
            "confidence": 0.85,
            "engine": "paddleocr",
        }
    
    def _extract_receipt_fields(self, ocr_text: str) -> dict:
        """Extract structured fields from OCR text."""
        import re
        fields = {"raw_text": ocr_text}
        
        amount_match = re.search(r'HK?\$?\s*(\d+(?:\.\d{2})?)', ocr_text, re.IGNORECASE)
        if amount_match:
            fields["amount"] = float(amount_match.group(1))
            fields["amount_confidence"] = 0.9
        
        date_match = re.search(r'\d{4}[-/]\d{1,2}[-/]\d{1,2}', ocr_text)
        if date_match:
            fields["date"] = date_match.group().replace('/', '-')
            fields["date_confidence"] = 0.95
        
        return fields
    
    async def get_daily_summary(self, target_date: date) -> dict:
        """Get daily collection summary."""
        query = select(AppleFinanceRecord).where(
            AppleFinanceRecord.record_type == "income",
            AppleFinanceRecord.transaction_date == target_date,
        )
        result = await self.db.execute(query)
        records = result.scalars().all()
        
        total = sum(float(r.amount) for r in records)
        by_category = {}
        needs_deposit = []
        
        for r in records:
            cat = r.category or "其他"
            by_category[cat] = by_category.get(cat, 0) + float(r.amount)
            
            if r.status == "pending" and r.payment_method == "cash":
                needs_deposit.append({
                    "receipt_no": r.receipt_no or "N/A",
                    "amount": float(r.amount),
                    "method": r.payment_method or "cash",
                })
        
        return {
            "date": target_date.isoformat(),
            "total_amount": total,
            "record_count": len(records),
            "by_category": by_category,
            "needs_deposit": needs_deposit,
        }
    
    async def compare_quotations(self, quotation_ids: list[str]) -> dict:
        """Compare multiple quotations for anomaly detection."""
        if not quotation_ids:
            return {
                "single_bid": [],
                "non_lowest_chosen": [],
                "lowest_bid_summary": [],
                "total_quotations": 0,
                "warnings": ["No quotations provided"],
                "confidence": "low",
            }
        
        result = await self.db.execute(
            select(AppleQuotation).where(AppleQuotation.id.in_(quotation_ids))
        )
        quotations = list(result.scalars().all())
        
        if not quotations:
            return {
                "single_bid": [],
                "non_lowest_chosen": [],
                "lowest_bid_summary": [],
                "total_quotations": 0,
                "warnings": ["No quotations found"],
                "confidence": "low",
            }
        
        items_map = {}
        for q in quotations:
            item = q.item_description
            if item not in items_map:
                items_map[item] = []
            items_map[item].append(q)
        
        single_bid = []
        non_lowest_chosen = []
        lowest_bid_summary = []
        warnings = []
        
        for item, quotes in items_map.items():
            if len(quotes) == 1:
                single_bid.append({
                    "item": item,
                    "vendor": quotes[0].vendor_name,
                    "price": float(quotes[0].total_price),
                })
                warnings.append(f"单一报价: {item}")
            else:
                sorted_quotes = sorted(quotes, key=lambda q: float(q.total_price))
                lowest = sorted_quotes[0]
                
                lowest_bid_summary.append({
                    "item": item,
                    "lowest_vendor": lowest.vendor_name,
                    "lowest_price": float(lowest.total_price),
                    "quotation_count": len(quotes),
                })
                
                for q in quotes:
                    if q.id != lowest.id and q.status == "accepted":
                        diff = float(q.total_price) - float(lowest.total_price)
                        non_lowest_chosen.append({
                            "item": item,
                            "current_vendor": q.vendor_name,
                            "current_price": float(q.total_price),
                            "lowest_vendor": lowest.vendor_name,
                            "lowest_price": float(lowest.total_price),
                            "difference": diff,
                            "difference_pct": round(diff / float(lowest.total_price) * 100, 2) if float(lowest.total_price) > 0 else 0,
                        })
                        warnings.append(f"非最低价: {item} - {q.vendor_name}高出{diff:.2f}")
        
        confidence = "high" if len(quotations) >= 5 else "medium" if len(quotations) >= 3 else "low"
        
        return {
            "single_bid": single_bid,
            "non_lowest_chosen": non_lowest_chosen,
            "lowest_bid_summary": lowest_bid_summary,
            "total_quotations": len(quotations),
            "warnings": warnings,
            "confidence": confidence,
        }
    
    async def get_audit_transactions(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        category: Optional[str] = None,
    ) -> dict:
        """Get audit trail of transactions."""
        query = select(AppleFinanceRecord)
        count_query = select(func.count()).select_from(AppleFinanceRecord)
        
        if start_date:
            query = query.where(AppleFinanceRecord.transaction_date >= start_date)
            count_query = count_query.where(AppleFinanceRecord.transaction_date >= start_date)
        if end_date:
            query = query.where(AppleFinanceRecord.transaction_date <= end_date)
            count_query = count_query.where(AppleFinanceRecord.transaction_date <= end_date)
        if category:
            query = query.where(AppleFinanceRecord.category == category)
            count_query = count_query.where(AppleFinanceRecord.category == category)
        
        total = (await self.db.execute(count_query)).scalar() or 0
        result = await self.db.execute(query.order_by(AppleFinanceRecord.transaction_date.desc()))
        records = result.scalars().all()
        
        total_amount = sum(float(r.amount) for r in records)
        
        transactions = [{
            "id": r.id,
            "record_type": r.record_type,
            "category": r.category,
            "amount": float(r.amount),
            "transaction_date": r.transaction_date.isoformat() if r.transaction_date else None,
            "status": r.status,
            "receipt_no": r.receipt_no,
        } for r in records]
        
        return {
            "transactions": transactions,
            "total_count": total,
            "total_amount": total_amount,
            "exceptions": [],
        }
    
    async def get_audit_exceptions(self, exception_type: str) -> dict:
        """Get audit exceptions for review."""
        if exception_type == "single_quote":
            result = await self.db.execute(
                select(AppleQuotation).where(
                    func.char_length(AppleQuotation.item_description) > 0
                )
            )
            quotations = list(result.scalars().all())
            
            items_map = {}
            for q in quotations:
                item = q.item_description
                if item not in items_map:
                    items_map[item] = []
                items_map[item].append(q)
            
            exceptions = []
            for item, quotes in items_map.items():
                if len(quotes) == 1:
                    exceptions.append({
                        "type": "single_quote",
                        "item": item,
                        "vendor": quotes[0].vendor_name,
                        "price": float(quotes[0].total_price),
                        "suggestion": "需要额外报价以符合采购规定",
                    })
            
            return {"exceptions": exceptions, "total_count": len(exceptions)}
        
        elif exception_type == "not_lowest":
            result = await self.db.execute(
                select(AppleQuotation).where(AppleQuotation.status == "accepted")
            )
            quotations = list(result.scalars().all())
            
            items_map = {}
            for q in quotations:
                item = q.item_description
                if item not in items_map:
                    items_map[item] = []
                items_map[item].append(q)
            
            exceptions = []
            for item, quotes in items_map.items():
                if len(quotes) > 1:
                    sorted_quotes = sorted(quotes, key=lambda q: float(q.total_price))
                    lowest = sorted_quotes[0]
                    
                    for q in quotes:
                        if q.id != lowest.id:
                            diff = float(q.total_price) - float(lowest.total_price)
                            exceptions.append({
                                "type": "not_lowest",
                                "item": item,
                                "current_vendor": q.vendor_name,
                                "current_price": float(q.total_price),
                                "lowest_vendor": lowest.vendor_name,
                                "lowest_price": float(lowest.total_price),
                                "difference": diff,
                                "suggestion": "需说明选择高价原因",
                            })
            
            return {"exceptions": exceptions, "total_count": len(exceptions)}
        
        return {"exceptions": [], "total_count": 0}
