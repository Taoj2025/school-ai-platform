from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from .models import Announcement, AnnouncementTemplate
from .schemas import (
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse,
    AnnouncementInput, BilingualAnnouncement,
    TemplateCreate, TemplateUpdate, TemplateResponse,
    SendLogResponse, ReadStatusResponse,
)
from .service import AnnouncementService, TemplateService
from ...db.session import get_db
from ...common.schemas import success_response
from ...common.pagination import paginate

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("", response_model=dict)
async def list_announcements(
    academic_year: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    announcement_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    items, total = await service.list_announcements(
        academic_year=academic_year,
        semester=semester,
        announcement_type=announcement_type,
        status=status,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@router.post("/generate", response_model=dict)
async def generate_announcement(
    input_data: AnnouncementInput,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    result = await service.generate_bilingual(input_data)
    return success_response(data=result)


@router.post("", response_model=dict)
async def create_announcement(
    data: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    ann = await service.create_announcement(data)
    return success_response(data=AnnouncementResponse.model_validate(ann).model_dump())


@router.get("/{announcement_id}", response_model=dict)
async def get_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    ann = await service.get_announcement(announcement_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success_response(data=AnnouncementResponse.model_validate(ann).model_dump())


@router.patch("/{announcement_id}", response_model=dict)
async def update_announcement(
    announcement_id: str,
    update_data: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    ann = await service.update_announcement(announcement_id, update_data)
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success_response(data=AnnouncementResponse.model_validate(ann).model_dump())


@router.delete("/{announcement_id}", response_model=dict)
async def delete_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    deleted = await service.delete_announcement(announcement_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success_response(data={"deleted": True, "id": announcement_id})


@router.post("/{announcement_id}/submit", response_model=dict)
async def submit_for_approval(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    ann = await service.submit_for_approval(announcement_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success_response(data=AnnouncementResponse.model_validate(ann).model_dump())


@router.post("/{announcement_id}/approve", response_model=dict)
async def approve_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    ann = await service.approve_announcement(announcement_id, approver_id="system")
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success_response(data=AnnouncementResponse.model_validate(ann).model_dump())


@router.post("/{announcement_id}/send", response_model=dict)
async def send_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    ann = await service.send_announcement(announcement_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success_response(data=AnnouncementResponse.model_validate(ann).model_dump())


@router.get("/{announcement_id}/read-status", response_model=dict)
async def get_read_status(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = AnnouncementService(db)
    status = await service.get_read_status(announcement_id)
    return success_response(data=status)


templates_router = APIRouter(prefix="/announcements/templates", tags=["announcement-templates"])


@templates_router.get("", response_model=dict)
async def list_templates(
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = TemplateService(db)
    items, total = await service.list_templates(
        category=category,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )
    return success_response(data=paginate(items, total, page, page_size))


@templates_router.post("", response_model=dict)
async def create_template(
    data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
):
    service = TemplateService(db)
    template = await service.create_template(data)
    return success_response(data=TemplateResponse.model_validate(template).model_dump())


@templates_router.get("/recommend", response_model=dict)
async def recommend_templates(
    announcement_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = TemplateService(db)
    templates = await service.recommend_templates({"announcement_type": announcement_type})
    items = [TemplateResponse.model_validate(t).model_dump() for t in templates]
    return success_response(data={"items": items, "total": len(items)})
