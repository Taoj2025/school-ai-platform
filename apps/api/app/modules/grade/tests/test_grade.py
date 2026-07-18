"""
Tests for Grade Module (EduGrade - AI智能成绩分析系统)
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import date


class TestGradeSchemas:
    """Test Grade schemas validation"""

    def test_exam_session_create_schema(self):
        """Test ExamSessionCreate schema"""
        from apps.api.app.modules.grade.schemas import ExamSessionCreate

        data = {
            "name": "中二数学期中考试",
            "exam_date": "2025-11-15",
            "semester": "1",
            "academic_year": "2025-2026",
            "subject": "数学",
            "grade": "中二",
            "class_ids": [1, 2, 3],
            "total_score": 100,
            "answer_key": {"Q1": 20, "Q2": 30, "Q3": 50},
        }

        schema = ExamSessionCreate(**data)
        assert schema.name == "中二数学期中考试"
        assert schema.total_score == 100
        assert schema.answer_key == {"Q1": 20, "Q2": 30, "Q3": 50}

    def test_score_create_schema(self):
        """Test ScoreCreate schema"""
        from apps.api.app.modules.grade.schemas import ScoreCreate

        data = {
            "exam_session_id": "test-session-id",
            "student_id": "test-student-id",
            "scores_by_question": {"Q1": 18, "Q2": 28, "Q3": 45},
            "total_score": 91,
            "percentage": 0.91,
        }

        schema = ScoreCreate(**data)
        assert schema.total_score == 91
        assert schema.percentage == 0.91

    def test_ocr_exam_request_schema(self):
        """Test OCRExamRequest schema"""
        from apps.api.app.modules.grade.schemas import OCRExamRequest

        data = {
            "file_id": 123,
            "exam_session_id": "test-session-id",
            "answer_key": {"Q1": 20, "Q2": 30},
        }

        schema = OCRExamRequest(**data)
        assert schema.file_id == 123


class TestGradeService:
    """Test Grade service layer"""

    def test_determine_level(self):
        """Test level determination based on percentage"""
        from apps.api.app.modules.grade.service import GradeService

        service = GradeService.__new__(GradeService)

        assert service._determine_level(0.95) == "A"
        assert service._determine_level(0.85) == "B"
        assert service._determine_level(0.75) == "C"
        assert service._determine_level(0.65) == "D"
        assert service._determine_level(0.55) == "E"

    def test_extract_scores_from_ocr(self):
        """Test OCR score extraction"""
        from apps.api.app.modules.grade.service import GradeService

        service = GradeService.__new__(GradeService)

        ocr_text = "Q1: 18 / 20, Q2: 28 / 30, Q3: 45 / 50"
        answer_key = {"Q1": 20, "Q2": 30, "Q3": 50}

        scores = service._extract_scores_from_ocr(ocr_text, answer_key)

        assert len(scores) == 3
        assert scores[0]["question"] == "Q1"
        assert scores[0]["score"] == 18
        assert scores[1]["question"] == "Q2"
        assert scores[1]["score"] == 28

    def test_generate_chart_data(self):
        """Test chart data generation"""
        from apps.api.app.modules.grade.service import GradeService

        service = GradeService.__new__(GradeService)

        statistics = {
            "total_students": 30,
            "mean": 75.5,
            "pass_rate": 0.85,
            "excellent_rate": 0.30,
            "class_comparison": {
                "中二甲": {"mean": 78.0, "pass_rate": 0.90},
                "中二乙": {"mean": 73.0, "pass_rate": 0.80},
            },
        }

        chart_data = service._generate_chart_data(statistics)

        assert "score_distribution" in chart_data
        assert "class_comparison" in chart_data
        assert "summary" in chart_data
        assert chart_data["summary"]["mean"] == 75.5


class TestStatisticsCalculation:
    """Test statistics calculations"""

    def test_mean_calculation(self):
        """Test mean calculation"""
        import numpy as np

        scores = [85, 90, 78, 92, 88]
        mean = np.mean(scores)

        assert abs(mean - 86.6) < 0.1

    def test_standard_deviation(self):
        """Test standard deviation calculation"""
        import numpy as np

        scores = [85, 90, 78, 92, 88]
        std = np.std(scores)

        assert abs(std - 5.3) < 0.5

    def test_percentile_calculation(self):
        """Test percentile calculation"""
        import numpy as np

        scores = list(range(1, 101))
        p90 = np.percentile(scores, 90)
        p50 = np.percentile(scores, 50)

        assert p90 == 91
        assert p50 == 51

    def test_discrimination_index(self):
        """Test discrimination index calculation"""
        import numpy as np

        top_scores = [90, 88, 85, 92, 87]
        bottom_scores = [60, 55, 58, 62, 50]

        top_avg = np.mean(top_scores)
        bottom_avg = np.mean(bottom_scores)
        discrimination = top_avg - bottom_avg

        assert discrimination > 20
