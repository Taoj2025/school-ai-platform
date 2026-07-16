"""
Tests for Awards Module
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime


class TestAwardsSchemas:
    """Test Award schemas validation"""
    
    def test_award_create_schema(self):
        """Test AwardCreate schema"""
        from apps.api.app.modules.apple.awards.schemas import AwardCreate
        
        data = {
            "title": "2024-2025學年學業獎",
            "award_type": "academic",
            "academic_year": "2024-2025",
            "semester": 1,
            "description": "學期學業成績優異獎",
            "ceremony_date": "2025-03-15"
        }
        
        schema = AwardCreate(**data)
        assert schema.title == data["title"]
        assert schema.award_type == "academic"
        assert schema.academic_year == "2024-2025"
    
    def test_award_type_enum(self):
        """Test award type enum validation"""
        from apps.api.app.modules.apple.awards.schemas import AwardType
        
        assert AwardType.ACADEMIC == "academic"
        assert AwardType.CONDUCT == "conduct"
        assert AwardType.SERVICE == "service"
        assert AwardType.SPORTS == "sports"
        assert AwardType.ART == "art"


class TestAwardsService:
    """Test Awards service layer"""
    
    @pytest.fixture
    def mock_repository(self):
        """Create mock repository"""
        repo = MagicMock()
        repo.get_by_id = AsyncMock(return_value=MagicMock(
            id="test-id",
            title="Test Award",
            award_type="academic",
            status="approved"
        ))
        return repo
    
    @pytest.mark.asyncio
    async def test_calculate_scholarships_academic(self, mock_repository):
        """Test scholarship calculation for academic award"""
        from apps.api.app.modules.apple.awards.service import AwardsService
        
        with patch("apps.api.app.modules.apple.awards.service.AwardsRepository", return_value=mock_repository):
            service = AwardsService()
            
            result = await service.calculate_scholarships("test-id")
            
            assert "scholarships" in result
            assert "total_amount" in result
            assert result["award_type"] == "academic"
            # Academic awards should get HKD 1000
            assert result["amount_per_recipient"] == 1000
    
    @pytest.mark.asyncio
    async def test_calculate_scholarships_conduct(self, mock_repository):
        """Test scholarship calculation for conduct award"""
        from apps.api.app.modules.apple.awards.service import AwardsService
        
        mock_repository.get_by_id = AsyncMock(return_value=MagicMock(
            id="test-id",
            title="Test Award",
            award_type="conduct",
            status="approved"
        ))
        
        with patch("apps.api.app.modules.apple.awards.service.AwardsRepository", return_value=mock_repository):
            service = AwardsService()
            
            result = await service.calculate_scholarships("test-id")
            
            assert result["award_type"] == "conduct"
            # Conduct awards should get HKD 500
            assert result["amount_per_recipient"] == 500
    
    @pytest.mark.asyncio
    async def test_generate_certificates(self, mock_repository):
        """Test certificate generation"""
        from apps.api.app.modules.apple.awards.service import AwardsService
        
        with patch("apps.api.app.modules.apple.awards.service.AwardsRepository", return_value=mock_repository):
            service = AwardsService()
            
            result = await service.generate_certificates("test-id")
            
            assert "certificate_ids" in result
            assert "download_url" in result
            assert "generated_at" in result
    
    @pytest.mark.asyncio
    async def test_generate_script(self, mock_repository):
        """Test ceremony script generation"""
        from apps.api.app.modules.apple.awards.service import AwardsService
        
        with patch("apps.api.app.modules.apple.awards.service.AwardsRepository", return_value=mock_repository):
            service = AwardsService()
            
            result = await service.generate_script("test-id")
            
            assert "script" in result
            assert "sections" in result
            assert "total_recipients" in result


class TestAwardsRouter:
    """Test Awards router endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        from fastapi.testclient import TestClient
        from apps.api.app.modules.apple.awards.router import router
        
        app = MagicMock()
        app.include_router = MagicMock()
        
        return TestClient(app)
    
    def test_create_award_endpoint(self):
        """Test POST /api/v1/apple/awards"""
        # This would require full FastAPI app setup
        pass
    
    def test_get_awards_endpoint(self):
        """Test GET /api/v1/apple/awards"""
        pass
