from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import csv
import io
from datetime import datetime
from .models import AppleAward, AppleAwardRecipient
from .schemas import (
    AwardCreate, AwardUpdate, AwardResponse,
    AwardRecipientCreate, AwardRecipientUpdate, AwardRecipientResponse,
    ScholarshipCalculationRequest, ScholarshipCalculationResponse,
    CertificateGenerationRequest, CertificateGenerationResponse,
    ScriptGenerationRequest, ScriptGenerationResponse,
    ExportFormat,
)
from .service import AwardService
from ....db.session import get_db
from ....common.schemas import success_response
from ....common.pagination import paginate

router = APIRouter(prefix="/apple/awards", tags=["apple-awards"])


@router.get("", response_model=dict)
async def list_awards(
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    items, total = await service.list_awards(
        academic_year=academic_year,
        status=status,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.get("/export")
async def export_awards(
    format: ExportFormat = Query(default=ExportFormat.CSV),
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Export awards data in various formats.
    
    - **format**: CSV, Excel (XLSX), or PDF
    - **academic_year**: Filter by academic year
    - **status**: Filter by status
    """
    service = AwardService(db)
    awards, _ = await service.list_awards(
        academic_year=academic_year,
        status=status,
        page=1,
        page_size=10000,  # Export all
    )
    
    if format == ExportFormat.CSV:
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            '序號', '獎項名稱', '類型', '學年', '學期',
            '獎金金額', '狀態', '創建日期'
        ])
        
        # Data rows
        for idx, award in enumerate(awards, 1):
            writer.writerow([
                idx,
                award['name'],
                award.get('award_type', ''),
                award.get('academic_year', ''),
                award.get('semester', ''),
                award.get('amount', 0),
                award.get('status', ''),
                award.get('created_at', ''),
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=awards_export_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
    
    elif format == ExportFormat.EXCEL:
        # For Excel, return CSV with proper content type
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            '序號', '獎項名稱', '類型', '學年', '學期',
            '獎金金額', '狀態', '創建日期'
        ])
        for idx, award in enumerate(awards, 1):
            writer.writerow([
                idx,
                award['name'],
                award.get('award_type', ''),
                award.get('academic_year', ''),
                award.get('semester', ''),
                award.get('amount', 0),
                award.get('status', ''),
                award.get('created_at', ''),
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="application/vnd.ms-excel",
            headers={
                "Content-Disposition": f"attachment; filename=awards_export_{datetime.now().strftime('%Y%m%d')}.xlsx"
            }
        )
    
    else:
        # PDF - return JSON with data for client-side PDF generation
        return success_response(data={
            "format": "pdf",
            "filename": f"awards_export_{datetime.now().strftime('%Y%m%d')}.pdf",
            "data": awards,
            "total": len(awards),
            "generated_at": datetime.now().isoformat(),
        })


@router.post("", response_model=dict)
async def create_award(award: AwardCreate, db: AsyncSession = Depends(get_db)):
    service = AwardService(db)
    db_award = await service.create_award(award)
    return success_response(data=AwardResponse.model_validate(db_award).model_dump())


@router.get("/{award_id}", response_model=dict)
async def get_award(award_id: str, db: AsyncSession = Depends(get_db)):
    service = AwardService(db)
    award = await service.get_award(award_id)
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")
    return success_response(data=AwardResponse.model_validate(award).model_dump())


@router.patch("/{award_id}", response_model=dict)
async def update_award(
    award_id: str,
    award_update: AwardUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    award = await service.update_award(award_id, award_update)
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")
    return success_response(data=AwardResponse.model_validate(award).model_dump())


@router.delete("/{award_id}", response_model=dict)
async def delete_award(award_id: str, db: AsyncSession = Depends(get_db)):
    service = AwardService(db)
    deleted = await service.delete_award(award_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Award not found")
    return success_response(data={"deleted": True, "id": award_id})


@router.post("/{award_id}/recipients", response_model=dict)
async def add_recipient(
    award_id: str,
    recipient: AwardRecipientCreate,
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    db_recipient = await service.add_recipient(award_id, recipient)
    return success_response(data=AwardRecipientResponse.model_validate(db_recipient).model_dump())


@router.get("/{award_id}/recipients", response_model=dict)
async def list_recipients(award_id: str, db: AsyncSession = Depends(get_db)):
    service = AwardService(db)
    items, total = await service.list_recipients(award_id)
    return success_response(data={"items": items, "total": total})


@router.patch("/{award_id}/recipients/{recipient_id}", response_model=dict)
async def update_recipient(
    award_id: str,
    recipient_id: str,
    update_data: AwardRecipientUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    recipient = await service.update_recipient(recipient_id, update_data)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    return success_response(data=AwardRecipientResponse.model_validate(recipient).model_dump())


@router.delete("/{award_id}/recipients/{recipient_id}", response_model=dict)
async def delete_recipient(
    award_id: str,
    recipient_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    deleted = await service.delete_recipient(recipient_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Recipient not found")
    return success_response(data={"deleted": True, "id": recipient_id})


@router.post("/{award_id}/calculate", response_model=dict)
async def calculate_scholarships(
    award_id: str,
    request: ScholarshipCalculationRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    result = await service.calculate_scholarships(award_id, request)
    return success_response(data=result)


@router.post("/{award_id}/certificates", response_model=dict)
async def generate_certificates(
    award_id: str,
    request: CertificateGenerationRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    result = await service.generate_certificates(award_id, request)
    return success_response(data=result)


@router.post("/{award_id}/script", response_model=dict)
async def generate_script(
    award_id: str,
    request: ScriptGenerationRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AwardService(db)
    result = await service.generate_script(award_id, request)
    return success_response(data=result)
