from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class ExamSessionCreate(BaseModel):
    name: str
    exam_date: date
    semester: str
    academic_year: str
    subject: str
    grade: str
    class_ids: Optional[List[int]] = None
    total_score: int
    answer_key: Dict[str, int]


class ExamSessionUpdate(BaseModel):
    name: Optional[str] = None
    exam_date: Optional[date] = None
    status: Optional[str] = None
    class_ids: Optional[List[int]] = None


class ExamSessionResponse(BaseModel):
    id: str
    name: str
    exam_date: date
    semester: str
    academic_year: str
    subject: str
    grade: str
    class_ids: Optional[List[int]] = None
    total_score: int
    answer_key: Dict[str, int]
    status: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ScoreCreate(BaseModel):
    exam_session_id: str
    student_id: str
    scores_by_question: Dict[str, int]
    total_score: int
    percentage: float
    input_method: str = "manual"
    manually_verified: bool = False


class ScoreUpdate(BaseModel):
    scores_by_question: Optional[Dict[str, int]] = None
    total_score: Optional[int] = None
    percentage: Optional[float] = None
    class_rank: Optional[int] = None
    grade_rank: Optional[int] = None
    manually_verified: Optional[bool] = None


class ScoreResponse(BaseModel):
    id: str
    exam_session_id: str
    student_id: str
    scores_by_question: Dict[str, int]
    total_score: int
    percentage: float
    class_rank: Optional[int] = None
    grade_rank: Optional[int] = None
    input_method: str
    file_id: Optional[str] = None
    manually_verified: bool
    teacher_id: Optional[str] = None
    ocr_confidence: Optional[float] = None
    ocr_engine: Optional[str] = None
    anomalies: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GeneratedCommentCreate(BaseModel):
    exam_session_id: str
    score_id: str
    content: str
    level: str
    model: str = "gpt-4o-mini"
    confidence: Optional[float] = None


class GeneratedCommentUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[str] = None
    teacher_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None


class GeneratedCommentResponse(BaseModel):
    id: str
    exam_session_id: str
    score_id: str
    content: str
    level: str
    model: str
    confidence: Optional[float] = None
    status: str
    teacher_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CommentFeedbackCreate(BaseModel):
    action: str
    final_content: Optional[str] = None
    edit_diff: Optional[Dict[str, Any]] = None
    time_spent_seconds: Optional[int] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_text: Optional[str] = None


class CommentFeedbackResponse(BaseModel):
    id: str
    generated_comment_id: str
    action: str
    final_content: Optional[str] = None
    edit_diff: Optional[Dict[str, Any]] = None
    time_spent_seconds: Optional[int] = None
    rating: Optional[int] = None
    feedback_text: Optional[str] = None
    teacher_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RegressionAlertResponse(BaseModel):
    id: str
    student_id: str
    exam_session_id: str
    type: str
    severity: str
    from_avg: float
    to_avg: float
    change: float
    message: str
    notified: bool
    notified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ExamStatistics(BaseModel):
    mean: float
    median: float
    mode: Optional[float] = None
    std: float
    variance: float
    cv: float
    max_score: int
    min_score: int
    range_score: int
    percentile_90: float
    percentile_75: float
    percentile_50: float
    percentile_25: float
    percentile_10: float
    pass_count: int
    pass_rate: float
    excellent_count: int
    excellent_rate: float
    total_students: int
    question_stats: Dict[str, Any]
    class_comparison: Dict[str, Any]


class ScoreDistributionItem(BaseModel):
    range: str
    count: int
    percentage: float


class QuestionStatItem(BaseModel):
    question: str
    mean: float
    difficulty: float
    discrimination: float


class StudentScoreHistory(BaseModel):
    exam_session_id: str
    exam_name: str
    exam_date: date
    subject: str
    total_score: int
    percentage: float
    class_rank: Optional[int] = None
    grade_rank: Optional[int] = None


class CommentExample(BaseModel):
    level: str
    subject: str
    content: str
    embedding: Optional[List[float]] = None


class OCRExamRequest(BaseModel):
    file_id: int
    exam_session_id: str
    answer_key: Dict[str, int]


class OCRExamResponse(BaseModel):
    file_id: int
    exam_session_id: str
    status: str
    engine_used: Optional[str] = None
    scores: Optional[List[Dict[str, Any]]] = None
    confidence: Optional[float] = None
    error: Optional[str] = None


class ExcelImportRequest(BaseModel):
    file_id: int
    exam_session_id: str
    column_mapping: Optional[Dict[str, str]] = None


class CommentGenerateRequest(BaseModel):
    exam_session_id: str
    student_ids: Optional[List[str]] = None


class ReportGenerateRequest(BaseModel):
    exam_session_id: str
    report_type: str = "class"
    class_ids: Optional[List[int]] = None
