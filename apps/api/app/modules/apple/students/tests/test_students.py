"""
Tests for Students Module
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime


class TestStudentsSchemas:
    """Test Students schemas validation"""
    
    def test_student_create_schema(self):
        """Test StudentCreate schema"""
        from apps.api.app.modules.apple.students.schemas import StudentCreate
        
        data = {
            "student_no": "S2024001",
            "name_zh": "陳小明",
            "name_en": "Chan Ming",
            "gender": "M",
            "class_name": "1A",
            "grade": 1,
            "date_of_birth": "2018-05-15"
        }
        
        schema = StudentCreate(**data)
        assert schema.student_no == "S2024001"
        assert schema.name_zh == "陳小明"
        assert schema.gender == "M"
    
    def test_student_status_enum(self):
        """Test student status enum"""
        from apps.api.app.modules.apple.students.schemas import StudentStatus
        
        assert StudentStatus.ACTIVE == "active"
        assert StudentStatus.GRADUATED == "graduated"
        assert StudentStatus.TRANSFERRED == "transferred"
        assert StudentStatus.SUSPENDED == "suspended"


class TestStudentsService:
    """Test Students service layer"""
    
    @pytest.fixture
    def mock_repository(self):
        """Create mock repository"""
        repo = MagicMock()
        repo.get_by_id = AsyncMock(return_value=MagicMock(
            id="test-id",
            student_no="S2024001",
            name_zh="Test Student",
            status="active"
        ))
        return repo
    
    @pytest.mark.asyncio
    async def test_generate_certificate(self, mock_repository):
        """Test certificate generation"""
        from apps.api.app.modules.apple.students.service import StudentsService
        
        with patch("apps.api.app.modules.apple.students.service.StudentsRepository", return_value=mock_repository):
            service = StudentsService()
            
            result = await service.generate_certificate(
                "test-id",
                certificate_type="enrollment"
            )
            
            assert "id" in result
            assert "certificate_no" in result
            assert "download_url" in result
    
    @pytest.mark.asyncio
    async def test_import_students(self):
        """Test student batch import"""
        from apps.api.app.modules.apple.students.service import StudentsService
        
        mock_repo = MagicMock()
        mock_repo.bulk_create = AsyncMock(return_value=[])
        
        with patch("apps.api.app.modules.apple.students.service.StudentsRepository", return_value=mock_repo):
            service = StudentsService()
            
            # Mock Excel data
            excel_data = [
                {"student_no": "S2024001", "name_zh": "陳小明", "gender": "M"},
                {"student_no": "S2024002", "name_zh": "李小華", "gender": "M"},
            ]
            
            result = await service.import_students(excel_data)
            
            assert result["total"] == 2
            assert result["success"] == 2
            assert result["failed"] == 0
    
    @pytest.mark.asyncio
    async def test_import_students_with_errors(self):
        """Test student import with validation errors"""
        from apps.api.app.modules.apple.students.service import StudentsService
        
        mock_repo = MagicMock()
        mock_repo.bulk_create = AsyncMock(side_effect=[
            Exception("Duplicate student_no"),
            None
        ])
        
        with patch("apps.api.app.modules.apple.students.service.StudentsRepository", return_value=mock_repo):
            service = StudentsService()
            
            excel_data = [
                {"student_no": "S2024001", "name_zh": "陳小明", "gender": "M"},
                {"student_no": "S2024001", "name_zh": "李小華", "gender": "M"},  # Duplicate
            ]
            
            result = await service.import_students(excel_data)
            
            assert result["total"] == 2
            assert result["failed"] == 1
            assert len(result["errors"]) == 1


class TestStudentsRouter:
    """Test Students router endpoints"""
    
    def test_create_student_endpoint(self):
        """Test POST /api/v1/apple/students"""
        pass
    
    def test_import_students_endpoint(self):
        """Test POST /api/v1/apple/students/import"""
        pass
    
    def test_get_student_certificates_endpoint(self):
        """Test GET /api/v1/apple/students/{id}/certificates"""
        pass
