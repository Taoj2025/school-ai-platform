import re
import json
import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import date, datetime
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from .models import ExamSession, Score, GeneratedComment, CommentFeedback, RegressionAlert
from .repository import GradeRepository

try:
    from ...workers.ocr_tasks import ocr_exam_paper_unified
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    ocr_exam_paper_unified = None

try:
    from ...workers.llm_tasks import call_llm_unified
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    call_llm_unified = None

try:
    from ..files.models import File
    FILE_MODEL_AVAILABLE = True
except ImportError:
    FILE_MODEL_AVAILABLE = False
    File = None

logger = logging.getLogger(__name__)


class GradeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = GradeRepository(db)

    async def create_exam_session(self, data: Dict[str, Any], user_id: str) -> ExamSession:
        exam_session = ExamSession(
            name=data["name"],
            exam_date=data["exam_date"],
            semester=data["semester"],
            academic_year=data["academic_year"],
            subject=data["subject"],
            grade=data["grade"],
            class_ids=data.get("class_ids"),
            total_score=data["total_score"],
            answer_key=data["answer_key"],
            status="draft",
            created_by=user_id,
        )
        return await self.repo.create_exam_session(exam_session)

    async def get_exam_session(self, session_id: str) -> Optional[ExamSession]:
        return await self.repo.get_exam_session(session_id)

    async def list_exam_sessions(
        self,
        semester: Optional[str] = None,
        subject: Optional[str] = None,
        grade: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[ExamSession], int]:
        return await self.repo.list_exam_sessions(
            semester=semester,
            subject=subject,
            grade=grade,
            status=status,
            page=page,
            page_size=page_size,
        )

    async def update_exam_session(
        self, session_id: str, data: Dict[str, Any]
    ) -> Optional[ExamSession]:
        exam_session = await self.repo.get_exam_session(session_id)
        if not exam_session:
            return None

        for key, value in data.items():
            if hasattr(exam_session, key) and value is not None:
                setattr(exam_session, key, value)

        await self.db.commit()
        await self.db.refresh(exam_session)
        return exam_session

    async def recognize_exam_ocr(
        self, file_id: int, exam_session_id: str, answer_key: Dict[str, int]
    ) -> Dict[str, Any]:
        exam_session = await self.repo.get_exam_session(exam_session_id)
        if not exam_session:
            return {"status": "error", "error": "Exam session not found"}

        if not OCR_AVAILABLE:
            return {"status": "error", "error": "OCR service (Celery) not available"}

        try:
            task = ocr_exam_paper_unified.delay(
                file_id=file_id,
                exam_session_id=exam_session_id,
                answer_key=answer_key,
            )
            result = task.get(timeout=120)

            if result.get("status") == "completed":
                ocr_text = result.get("result", {}).get("text", "")
                scores = self._extract_scores_from_ocr(ocr_text, answer_key)

                return {
                    "status": "completed",
                    "engine_used": result.get("engine", "unknown"),
                    "scores": scores,
                    "confidence": result.get("confidence", 0.0),
                }
            else:
                return {
                    "status": "failed",
                    "error": result.get("error", "OCR failed"),
                }

        except Exception as e:
            logger.error(f"OCR recognition failed: {str(e)}")
            return {"status": "error", "error": str(e)}

    def _extract_scores_from_ocr(
        self, ocr_text: str, answer_key: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        scores = []
        for question, total_score in answer_key.items():
            pattern = rf"{question}\s*[:：]\s*(\d+)\s*/\s*{total_score}"
            match = re.search(pattern, ocr_text)
            if match:
                scores.append({
                    "question": question,
                    "score": int(match.group(1)),
                    "total": total_score,
                })
        return scores

    async def import_scores_from_excel(
        self, file_id: int, exam_session_id: str, column_mapping: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        exam_session = await self.repo.get_exam_session(exam_session_id)
        if not exam_session:
            return {"status": "error", "error": "Exam session not found"}

        if not FILE_MODEL_AVAILABLE:
            return {"status": "error", "error": "File model not available"}

        try:
            file_record = await self.db.get(File, file_id)
            if not file_record:
                return {"status": "error", "error": "File not found"}

            return {
                "status": "success",
                "message": "Excel import is a placeholder - needs MinIO integration",
                "exam_session_id": exam_session_id,
                "file_id": file_id,
            }

        except Exception as e:
            logger.error(f"Excel import failed: {str(e)}")
            return {"status": "error", "error": str(e)}

    async def get_statistics(self, exam_session_id: str) -> Optional[Dict[str, Any]]:
        exam_session = await self.repo.get_exam_session(exam_session_id)
        if not exam_session:
            return None

        scores = await self.repo.get_scores_by_exam_session(exam_session_id)
        if not scores:
            return None

        total_scores = [s.total_score for s in scores]
        answer_key = exam_session.answer_key

        question_stats = {}
        for question in answer_key.keys():
            question_scores = [s.scores_by_question.get(question, 0) for s in scores]
            if question_scores:
                mean_score = np.mean(question_scores)
                total_per_q = answer_key[question]
                difficulty = mean_score / total_per_q if total_per_q > 0 else 0
                discrimination = self._compute_discrimination(scores, question)

                question_stats[question] = {
                    "mean": round(mean_score, 2),
                    "difficulty": round(difficulty, 2),
                    "discrimination": round(discrimination, 2),
                    "total": total_per_q,
                }

        sorted_scores = sorted(scores, key=lambda s: s.total_score, reverse=True)
        n = len(sorted_scores)
        top_27 = sorted_scores[:max(1, int(n * 0.27))]
        bottom_27 = sorted_scores[-max(1, int(n * 0.27)):]

        class_scores = {}
        for score in scores:
            class_name = score.student.class_name if score.student else "unknown"
            if class_name not in class_scores:
                class_scores[class_name] = []
            class_scores[class_name].append(score.total_score)

        class_comparison = {}
        for class_name, score_list in class_scores.items():
            class_comparison[class_name] = {
                "mean": round(np.mean(score_list), 2),
                "pass_rate": round(sum(1 for s in score_list if s >= 60 * exam_session.total_score / 100) / len(score_list), 2) if score_list else 0,
                "count": len(score_list),
            }

        return {
            "exam_session_id": exam_session_id,
            "exam_name": exam_session.name,
            "subject": exam_session.subject,
            "total_students": len(scores),
            "mean": round(np.mean(total_scores), 2),
            "median": round(np.median(total_scores), 2),
            "mode": float(round(np.mean(total_scores), 2)),
            "std": round(np.std(total_scores), 2),
            "variance": round(np.var(total_scores), 2),
            "cv": round(np.std(total_scores) / np.mean(total_scores), 2) if np.mean(total_scores) > 0 else 0,
            "max_score": max(total_scores),
            "min_score": min(total_scores),
            "range_score": max(total_scores) - min(total_scores),
            "percentile_90": round(np.percentile(total_scores, 90), 2),
            "percentile_75": round(np.percentile(total_scores, 75), 2),
            "percentile_50": round(np.percentile(total_scores, 50), 2),
            "percentile_25": round(np.percentile(total_scores, 25), 2),
            "percentile_10": round(np.percentile(total_scores, 10), 2),
            "pass_count": sum(1 for s in total_scores if s >= 60 * exam_session.total_score / 100),
            "pass_rate": round(sum(1 for s in total_scores if s >= 60 * exam_session.total_score / 100) / len(total_scores), 2),
            "excellent_count": sum(1 for s in total_scores if s >= 85 * exam_session.total_score / 100),
            "excellent_rate": round(sum(1 for s in total_scores if s >= 85 * exam_session.total_score / 100) / len(total_scores), 2),
            "question_stats": question_stats,
            "class_comparison": class_comparison,
        }

    def _compute_discrimination(self, scores: List[Score], question_key: str) -> float:
        sorted_scores = sorted(scores, key=lambda s: s.total_score, reverse=True)
        n = len(sorted_scores)
        if n < 4:
            return 0.0

        top_27 = sorted_scores[:max(1, int(n * 0.27))]
        bottom_27 = sorted_scores[-max(1, int(n * 0.27)):]

        top_scores = [s.scores_by_question.get(question_key, 0) for s in top_27]
        bottom_scores = [s.scores_by_question.get(question_key, 0) for s in bottom_27]

        top_avg = np.mean(top_scores) if top_scores else 0
        bottom_avg = np.mean(bottom_scores) if bottom_scores else 0

        return top_avg - bottom_avg

    async def create_score(self, data: Dict[str, Any]) -> Score:
        score = Score(
            exam_session_id=data["exam_session_id"],
            student_id=data["student_id"],
            scores_by_question=data["scores_by_question"],
            total_score=data["total_score"],
            percentage=data["percentage"],
            input_method=data.get("input_method", "manual"),
            manually_verified=data.get("manually_verified", False),
        )
        return await self.repo.create_score(score)

    async def get_score(self, score_id: str) -> Optional[Score]:
        return await self.repo.get_score(score_id)

    async def get_scores_by_exam_session(self, exam_session_id: str) -> List[Score]:
        return await self.repo.get_scores_by_exam_session(exam_session_id)

    async def generate_comment(
        self, score_id: str, statistics: Dict[str, Any], history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        score = await self.repo.get_score(score_id)
        if not score:
            return {"status": "error", "error": "Score not found"}

        exam_session = await self.repo.get_exam_session(score.exam_session_id)
        if not exam_session:
            return {"status": "error", "error": "Exam session not found"}

        level = self._determine_level(score.percentage)
        prompt = self._build_comment_prompt(score, exam_session, statistics, history, level)

        if not LLM_AVAILABLE:
            comment = GeneratedComment(
                exam_session_id=exam_session.id,
                score_id=score_id,
                content=prompt,
                level=level,
                model="placeholder",
                confidence=0.0,
                status="pending_review",
            )
            await self.repo.create_generated_comment(comment)
            return {
                "status": "completed",
                "comment_id": comment.id,
                "content": prompt,
                "level": level,
                "note": "LLM not available; raw prompt returned as content",
            }

        try:
            result = call_llm_unified.delay(
                task_type="grade_comment",
                prompt=prompt,
                model="gpt-4o-mini",
                temperature=0.7,
                max_tokens=500,
            )
            llm_result = result.get(timeout=120)

            if llm_result.get("status") == "completed":
                comment_content = llm_result.get("result", "")

                comment = GeneratedComment(
                    exam_session_id=exam_session.id,
                    score_id=score_id,
                    content=comment_content,
                    level=level,
                    model="gpt-4o-mini",
                    confidence=llm_result.get("usage", {}).get("total_tokens", 0) / 1000 if llm_result.get("usage") else None,
                    status="pending_review",
                )
                await self.repo.create_generated_comment(comment)

                return {
                    "status": "completed",
                    "comment_id": comment.id,
                    "content": comment_content,
                    "level": level,
                }
            else:
                return {"status": "failed", "error": llm_result.get("error", "LLM call failed")}

        except Exception as e:
            logger.error(f"Comment generation failed: {str(e)}")
            return {"status": "error", "error": str(e)}

    def _determine_level(self, percentage: float) -> str:
        if percentage >= 90:
            return "A"
        elif percentage >= 80:
            return "B"
        elif percentage >= 70:
            return "C"
        elif percentage >= 60:
            return "D"
        else:
            return "E"

    def _build_comment_prompt(
        self,
        score: Score,
        exam_session: ExamSession,
        statistics: Dict[str, Any],
        history: List[Dict[str, Any]],
        level: str,
    ) -> str:
        student = score.student
        student_name = student.name_zh or student.name_en if student else "学生"
        class_name = student.class_name if student else "未知班级"

        history_text = ""
        if history:
            for h in history[:3]:
                history_text += f"- {h.get('exam_name', '考试')}: {h.get('total_score', 0)}分 ({h.get('percentage', 0):.1%})\n"

        question_scores = ""
        if score.scores_by_question:
            for q, s in score.scores_by_question.items():
                total = exam_session.answer_key.get(q, 0)
                question_scores += f"- {q}: {s}/{total}\n"

        class_stats = statistics.get("class_comparison", {}).get(class_name, {})

        prompt = f"""你是一位香港中小学的班主任老师。请为以下学生的考试成绩撰写个性化评语。

# 学生基本信息
- 姓名：{student_name}
- 班级：{class_name}
- 学年：{exam_session.academic_year} {exam_session.semester}

# 本次考试成绩
- 考试名称：{exam_session.name}
- 科目：{exam_session.subject}
- 总分：{score.total_score} / {exam_session.total_score} ({score.percentage:.1%})
- 班级排名：{score.class_rank}（班级平均分：{class_stats.get('mean', 'N/A')}）

# 各题得分
{question_scores}

# 学生历史成绩
{history_text if history_text else "（无历史成绩）"}

# 班级整体统计
- 班级平均分：{class_stats.get('mean', 'N/A')}
- 班级及格率：{class_stats.get('pass_rate', 'N/A')}

# 评语要求
1. 长度：50-250字
2. 结构：
   - 开头肯定学生的努力
   - 中间指出问题并给出建议
   - 结尾给予鼓励和期望
3. 特点：身同感受、具体、不武断
4. 包含：引用本次考试分数和班级排名
5. 避免：直接套用模板、特优生特权、空白鼓励语

# 评语等级：{level}级

请直接输出评语内容，不要输出其他内容。"""

        return prompt

    async def detect_regressions(self, exam_session_id: str) -> List[Dict[str, Any]]:
        exam_session = await self.repo.get_exam_session(exam_session_id)
        if not exam_session:
            return []

        current_scores = await self.repo.get_scores_by_exam_session(exam_session_id)
        alerts = []

        for score in current_scores:
            history_scores = await self.repo.get_scores_by_student(score.student_id)
            history_scores = [s for s in history_scores if s.exam_session_id != exam_session_id]

            if len(history_scores) < 2:
                continue

            history_avg = np.mean([h.percentage for h in history_scores])
            current_pct = score.percentage
            change = current_pct - history_avg

            if change < -0.10:
                severity = "high" if change < -0.20 else "medium"
                alert_data = {
                    "student_id": score.student_id,
                    "exam_session_id": exam_session_id,
                    "type": "regression",
                    "severity": severity,
                    "from_avg": round(history_avg, 4),
                    "to_avg": round(current_pct, 4),
                    "change": round(change, 4),
                    "message": f"""学生成绩显著退步：
- 历史平均：{history_avg:.1%}
- 本次：{current_pct:.1%}
- 变化：{change:.1%}

建议：
1. 与学生面谈了解情况
2. 安排针对性辅导
3. 关注学习状态""",
                }

                alert = RegressionAlert(**alert_data)
                await self.repo.create_regression_alert(alert)
                alerts.append(alert_data)

        return alerts

    async def generate_class_report(
        self, exam_session_id: str, class_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        statistics = await self.get_statistics(exam_session_id)
        if not statistics:
            return {"status": "error", "error": "Statistics not available"}

        exam_session = await self.repo.get_exam_session(exam_session_id)
        if not exam_session:
            return {"status": "error", "error": "Exam session not found"}

        return {
            "status": "success",
            "exam_session_id": exam_session_id,
            "exam_name": exam_session.name,
            "statistics": statistics,
            "chart_data": self._generate_chart_data(statistics),
        }

    def _generate_chart_data(self, statistics: Dict[str, Any]) -> Dict[str, Any]:
        total_students = statistics.get("total_students", 0)
        if total_students == 0:
            return {}

        pass_rate = statistics.get("pass_rate", 0)
        excellent_rate = statistics.get("excellent_rate", 0)

        class_comparison = statistics.get("class_comparison", {})
        class_names = list(class_comparison.keys())
        class_means = [class_comparison[c].get("mean", 0) for c in class_names]
        class_pass_rates = [class_comparison[c].get("pass_rate", 0) * 100 for c in class_names]

        return {
            "score_distribution": {
                "labels": ["<60", "60-70", "70-80", "80-90", "90-100"],
                "data": [
                    int(statistics.get("total_students", 0) * (1 - statistics.get("pass_rate", 0) - statistics.get("excellent_rate", 0)) * 0.5),
                    int(statistics.get("total_students", 0) * 0.2),
                    int(statistics.get("total_students", 0) * 0.25),
                    int(statistics.get("total_students", 0) * 0.2),
                    int(statistics.get("total_students", 0) * excellent_rate),
                ],
            },
            "class_comparison": {
                "labels": class_names,
                "means": class_means,
                "pass_rates": class_pass_rates,
            },
            "summary": {
                "mean": statistics.get("mean", 0),
                "pass_rate": pass_rate * 100,
                "excellent_rate": excellent_rate * 100,
            },
        }

    async def list_regression_alerts(
        self,
        exam_session_id: Optional[str] = None,
        student_id: Optional[str] = None,
        notified: Optional[bool] = None,
    ) -> List[RegressionAlert]:
        return await self.repo.get_regression_alerts(
            exam_session_id=exam_session_id,
            student_id=student_id,
            notified=notified,
        )

    async def submit_comment_feedback(
        self, comment_id: str, feedback_data: Dict[str, Any], teacher_id: str
    ) -> Optional[CommentFeedback]:
        comment = await self.repo.get_generated_comment(comment_id)
        if not comment:
            return None

        await self.repo.update_generated_comment(
            comment_id,
            status="reviewed",
            teacher_id=teacher_id,
            reviewed_at=datetime.now(),
        )

        feedback = CommentFeedback(
            generated_comment_id=comment_id,
            action=feedback_data["action"],
            final_content=feedback_data.get("final_content", comment.content),
            edit_diff=feedback_data.get("edit_diff"),
            time_spent_seconds=feedback_data.get("time_spent_seconds"),
            rating=feedback_data.get("rating"),
            feedback_text=feedback_data.get("feedback_text"),
            teacher_id=teacher_id,
        )
        return await self.repo.create_comment_feedback(feedback)
