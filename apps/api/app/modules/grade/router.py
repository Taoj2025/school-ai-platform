from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import date as date_type
from .models import ExamSession, Score, GeneratedComment, CommentFeedback, RegressionAlert
from .schemas import (
    ExamSessionCreate, ExamSessionUpdate, ExamSessionResponse,
    ScoreCreate, ScoreUpdate, ScoreResponse,
    GeneratedCommentCreate, GeneratedCommentUpdate, GeneratedCommentResponse,
    CommentFeedbackCreate, CommentFeedbackResponse,
    RegressionAlertResponse,
    ExamStatistics,
    OCRExamRequest, OCRExamResponse,
    ExcelImportRequest,
    CommentGenerateRequest,
    ReportGenerateRequest,
)
from .service import GradeService
from ...db.session import get_db
from ...common.schemas import success_response
from ...common.pagination import paginate

router = APIRouter(prefix="/grade", tags=["grade"])


@router.post("/exam-sessions", response_model=dict)
async def create_exam_session(
    data: ExamSessionCreate,
    db: AsyncSession = Depends(get_db),
):
    service = GradeService(db)
    exam_session = await service.create_exam_session(data.model_dump(), user_id="system")
    return success_response(data=ExamSessionResponse.model_validate(exam_session).model_dump())


@router.get("/exam-sessions", response_model=dict)
async def list_exam_sessions(
    semester: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    grade: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = GradeService(db)
    items, total = await service.list_exam_sessions(
        semester=semester,
        subject=subject,
        grade=grade,
        status=status,
        page=page,
        page_size=page_size,
    )
    serialized = [ExamSessionResponse.model_validate(item).model_dump() for item in items]
    return success_response(data=paginate(serialized, total, page, page_size))


@router.get("/exam-sessions/{session_id}", response_model=dict)
async def get_exam_session(session_id: str, db: AsyncSession = Depends(get_db)):
    service = GradeService(db)
    exam_session = await service.get_exam_session(session_id)
    if not exam_session:
        raise HTTPException(status_code=404, detail="Exam session not found")
    return success_response(data=ExamSessionResponse.model_validate(exam_session).model_dump())


@router.patch("/exam-sessions/{session_id}", response_model=dict)
async def update_exam_session(
    session_id: str,
    data: ExamSessionUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = GradeService(db)
    exam_session = await service.update_exam_session(session_id, data.model_dump(exclude_unset=True))
    if not exam_session:
        raise HTTPException(status_code=404, detail="Exam session not found")
    return success_response(data=ExamSessionResponse.model_validate(exam_session).model_dump())


@router.post("/exam-sessions/{session_id}/ocr", response_model=dict)
async def recognize_exam_ocr(
    session_id: str,
    request: OCRExamRequest,
    db: AsyncSession = Depends(get_db),
):
    """OCR exam paper recognition using unified interface."""
    service = GradeService(db)
    result = await service.recognize_exam_ocr(
        file_id=request.file_id,
        exam_session_id=session_id,
        answer_key=request.answer_key,
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("error"))
    return success_response(data=result)


@router.post("/exam-sessions/{session_id}/import", response_model=dict)
async def import_scores_from_excel(
    session_id: str,
    request: ExcelImportRequest,
    db: AsyncSession = Depends(get_db),
):
    """Import scores from Excel file."""
    service = GradeService(db)
    result = await service.import_scores_from_excel(
        file_id=request.file_id,
        exam_session_id=session_id,
        column_mapping=request.column_mapping,
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("error"))
    return success_response(data=result)


@router.get("/exam-sessions/{session_id}/statistics", response_model=dict)
async def get_exam_statistics(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get exam session statistics."""
    service = GradeService(db)
    statistics = await service.get_statistics(session_id)
    if not statistics:
        raise HTTPException(status_code=404, detail="Statistics not available")
    return success_response(data=statistics)


@router.get("/exam-sessions/{session_id}/report", response_model=dict)
async def generate_class_report(
    session_id: str,
    class_ids: Optional[List[int]] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Generate class report with charts."""
    service = GradeService(db)
    result = await service.generate_class_report(session_id, class_ids)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("error"))
    return success_response(data=result)


@router.get("/exam-sessions/{session_id}/scores", response_model=dict)
async def get_exam_scores(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get all scores for an exam session."""
    service = GradeService(db)
    scores = await service.get_scores_by_exam_session(session_id)
    return success_response(data=[ScoreResponse.model_validate(s).model_dump() for s in scores])


@router.post("/scores", response_model=dict)
async def create_score(
    data: ScoreCreate,
    db: AsyncSession = Depends(get_db),
):
    service = GradeService(db)
    score = await service.create_score(data.model_dump())
    return success_response(data=ScoreResponse.model_validate(score).model_dump())


@router.get("/scores/{score_id}", response_model=dict)
async def get_score(score_id: str, db: AsyncSession = Depends(get_db)):
    service = GradeService(db)
    score = await service.get_score(score_id)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    return success_response(data=ScoreResponse.model_validate(score).model_dump())


@router.patch("/scores/{score_id}", response_model=dict)
async def update_score(
    score_id: str,
    data: ScoreUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = GradeService(db)
    score = await service.get_score(score_id)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(score, key, value)

    await db.commit()
    await db.refresh(score)
    return success_response(data=ScoreResponse.model_validate(score).model_dump())


@router.post("/scores/{score_id}/generate-comment", response_model=dict)
async def generate_comment(
    score_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Generate AI comment for a score."""
    service = GradeService(db)

    exam_session = await service.get_exam_session(
        (await service.get_score(score_id)).exam_session_id
    )
    statistics = await service.get_statistics(exam_session.id) if exam_session else {}

    history = []
    result = await service.generate_comment(score_id, statistics, history)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("error"))
    return success_response(data=result)


@router.post("/exam-sessions/{session_id}/generate-comments", response_model=dict)
async def batch_generate_comments(
    session_id: str,
    student_ids: Optional[List[str]] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Batch generate AI comments for all students in an exam session."""
    service = GradeService(db)
    scores = await service.get_scores_by_exam_session(session_id)

    if student_ids:
        scores = [s for s in scores if s.student_id in student_ids]

    statistics = await service.get_statistics(session_id)
    results = []

    for score in scores:
        history = []
        result = await service.generate_comment(score.id, statistics, history)
        results.append(result)

    return success_response(data={
        "total": len(scores),
        "results": results,
    })


@router.get("/comments", response_model=dict)
async def list_generated_comments(
    exam_session_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    from .repository import GradeRepository
    repo = GradeRepository(db)
    items, total = await repo.list_generated_comments(
        exam_session_id=exam_session_id,
        status=status,
        page=page,
        page_size=page_size,
    )
    serialized = [GeneratedCommentResponse.model_validate(item).model_dump() for item in items]
    return success_response(data=paginate(serialized, total, page, page_size))


@router.patch("/comments/{comment_id}", response_model=dict)
async def update_comment(
    comment_id: str,
    data: GeneratedCommentUpdate,
    db: AsyncSession = Depends(get_db),
):
    from .repository import GradeRepository
    repo = GradeRepository(db)
    comment = await repo.update_generated_comment(comment_id, **data.model_dump(exclude_unset=True))
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return success_response(data=GeneratedCommentResponse.model_validate(comment).model_dump())


@router.post("/comments/{comment_id}/feedback", response_model=dict)
async def submit_comment_feedback(
    comment_id: str,
    data: CommentFeedbackCreate,
    db: AsyncSession = Depends(get_db),
):
    service = GradeService(db)
    feedback = await service.submit_comment_feedback(
        comment_id, data.model_dump(), teacher_id="system"
    )
    if not feedback:
        raise HTTPException(status_code=404, detail="Comment not found")
    return success_response(data=CommentFeedbackResponse.model_validate(feedback).model_dump())


@router.post("/exam-sessions/{session_id}/detect-regressions", response_model=dict)
async def detect_regressions(session_id: str, db: AsyncSession = Depends(get_db)):
    """Detect score regressions for an exam session."""
    service = GradeService(db)
    alerts = await service.detect_regressions(session_id)
    return success_response(data={"alerts": alerts})


@router.get("/alerts", response_model=dict)
async def list_regression_alerts(
    exam_session_id: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    notified: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = GradeService(db)
    alerts = await service.list_regression_alerts(
        exam_session_id=exam_session_id,
        student_id=student_id,
        notified=notified,
    )
    return success_response(data=[RegressionAlertResponse.model_validate(a).model_dump() for a in alerts])
