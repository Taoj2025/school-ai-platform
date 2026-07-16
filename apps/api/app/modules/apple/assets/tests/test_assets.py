"""
Tests for Assets Module
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class TestAssetsSchemas:
    """Test Assets schemas validation"""
    
    def test_asset_create_schema(self):
        """Test AssetCreate schema"""
        from apps.api.app.modules.apple.assets.schemas import AssetCreate
        
        data = {
            "name": "投影機 A",
            "asset_no": "EQ-2024-001",
            "category": "electronics",
            "location": "101教室",
            "purchase_price": 15000.00,
            "status": "in_use"
        }
        
        schema = AssetCreate(**data)
        assert schema.name == "投影機 A"
        assert schema.asset_no == "EQ-2024-001"
        assert schema.category == "electronics"
    
    def test_asset_movement_schema(self):
        """Test AssetMovementCreate schema"""
        from apps.api.app.modules.apple.assets.schemas import AssetMovementCreate
        
        data = {
            "movement_type": "transfer",
            "from_location": "101教室",
            "to_location": "102教室",
            "reason": "教學需要"
        }
        
        schema = AssetMovementCreate(**data)
        assert schema.movement_type == "transfer"
        assert schema.from_location == "101教室"
        assert schema.to_location == "102教室"


class TestAssetsService:
    """Test Assets service layer"""
    
    @pytest.fixture
    def mock_repository(self):
        """Create mock repository"""
        repo = MagicMock()
        repo.get_by_id = AsyncMock(return_value=MagicMock(
            id="test-id",
            name="Test Asset",
            asset_no="TEST-001",
            status="in_use"
        ))
        return repo
    
    @pytest.mark.asyncio
    async def test_record_movement(self, mock_repository):
        """Test recording asset movement"""
        from apps.api.app.modules.apple.assets.service import AssetsService
        
        with patch("apps.api.app.modules.apple.assets.service.AssetsRepository", return_value=mock_repository):
            service = AssetsService()
            
            result = await service.record_movement(
                "test-id",
                movement_type="transfer",
                from_location="101",
                to_location="102",
                reason="教學需要"
            )
            
            assert "id" in result
            assert result["asset_id"] == "test-id"
            assert result["movement_type"] == "transfer"
    
    @pytest.mark.asyncio
    async def test_write_off_asset(self, mock_repository):
        """Test asset write-off"""
        from apps.api.app.modules.apple.assets.service import AssetsService
        
        with patch("apps.api.app.modules.apple.assets.service.AssetsRepository", return_value=mock_repository):
            service = AssetsService()
            
            result = await service.write_off("test-id", reason="老化報廢")
            
            assert result["status"] == "written_off"
            assert result["reason"] == "老化報廢"
    
    @pytest.mark.asyncio
    async def test_get_stats(self):
        """Test asset stats calculation"""
        from apps.api.app.modules.apple.assets.service import AssetsService
        
        mock_repo = MagicMock()
        mock_repo.get_count_by_status = AsyncMock(return_value={
            "in_use": 50,
            "storage": 20,
            "maintenance": 5,
            "written_off": 3
        })
        mock_repo.get_total_value = AsyncMock(return_value=500000)
        
        with patch("apps.api.app.modules.apple.assets.service.AssetsRepository", return_value=mock_repo):
            service = AssetsService()
            
            result = await service.get_stats()
            
            assert result["total_assets"] == 78
            assert result["total_value"] == 500000


class TestAssetsRouter:
    """Test Assets router endpoints"""
    
    def test_create_asset_endpoint(self):
        """Test POST /api/v1/apple/assets"""
        pass
    
    def test_record_movement_endpoint(self):
        """Test POST /api/v1/apple/assets/{id}/movements"""
        pass
