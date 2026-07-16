"""
Tests for Finance Module
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class TestFinanceSchemas:
    """Test Finance schemas validation"""
    
    def test_income_create_schema(self):
        """Test IncomeCreate schema"""
        from apps.api.app.modules.apple.finance.schemas import IncomeCreate
        
        data = {
            "category": "tuition",
            "amount": 50000.00,
            "currency": "HKD",
            "date": "2025-03-01",
            "payer": "家長會",
            "description": "學期學費"
        }
        
        schema = IncomeCreate(**data)
        assert schema.category == "tuition"
        assert schema.amount == 50000.00
    
    def test_expense_create_schema(self):
        """Test ExpenseCreate schema"""
        from apps.api.app.modules.apple.finance.schemas import ExpenseCreate
        
        data = {
            "category": "equipment",
            "amount": 15000.00,
            "currency": "HKD",
            "date": "2025-03-05",
            "vendor": "科技公司",
            "description": "購買電腦"
        }
        
        schema = ExpenseCreate(**data)
        assert schema.category == "equipment"
        assert schema.amount == 15000.00


class TestFinanceService:
    """Test Finance service layer"""
    
    @pytest.fixture
    def mock_repository(self):
        """Create mock repository"""
        repo = MagicMock()
        repo.get_by_id = AsyncMock(return_value=MagicMock(
            id="test-id",
            vendor="Test Vendor",
            amount=10000,
            is_lowest=True
        ))
        return repo
    
    @pytest.mark.asyncio
    async def test_analyze_quotation_single_bid(self, mock_repository):
        """Test quotation analysis for single bid"""
        from apps.api.app.modules.apple.finance.service import FinanceService
        
        mock_repository.get_by_id = AsyncMock(return_value=MagicMock(
            id="test-id",
            vendor="Only Vendor",
            amount=10000,
            quotations=[]  # No other quotations = single bid
        ))
        
        with patch("apps.api.app.modules.apple.finance.service.FinanceRepository", return_value=mock_repository):
            service = FinanceService()
            
            result = await service.analyze_quotation("test-id")
            
            assert "is_single_bid" in result
            assert result["is_single_bid"] == True
            assert "warnings" in result
    
    @pytest.mark.asyncio
    async def test_get_stats(self):
        """Test finance stats calculation"""
        from apps.api.app.modules.apple.finance.service import FinanceService
        
        mock_repo = MagicMock()
        mock_repo.get_total_income = AsyncMock(return_value=125000)
        mock_repo.get_total_expense = AsyncMock(return_value=68000)
        
        with patch("apps.api.app.modules.apple.finance.service.FinanceRepository", return_value=mock_repo):
            service = FinanceService()
            
            result = await service.get_stats()
            
            assert result["total_income"] == 125000
            assert result["total_expense"] == 68000
            assert result["net_balance"] == 57000


class TestFinanceRouter:
    """Test Finance router endpoints"""
    
    def test_create_income_endpoint(self):
        """Test POST /api/v1/apple/finance/income"""
        pass
    
    def test_get_expense_endpoint(self):
        """Test GET /api/v1/apple/finance/expense"""
        pass
