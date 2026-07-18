from fastapi.testclient import TestClient

from app.core.role_permissions import ROLES, check_permission
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["status"] == "ok"
    assert "meta" in body


def test_docs_accessible():
    response = client.get("/docs")
    assert response.status_code == 200
    assert "Swagger UI" in response.text


def test_openapi_json():
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    assert response.json()["info"]["title"] == "School AI Platform"


def test_shared_api_paths_in_openapi():
    paths = client.get("/api/v1/openapi.json").json()["paths"]
    for path in [
        "/api/v1/files/upload",
        "/api/v1/ocr/jobs",
        "/api/v1/ocr/jobs/{job_id}",
        "/api/v1/ai/jobs",
        "/api/v1/ai/jobs/{job_id}",
        "/api/v1/ai/generate",
        "/api/v1/audit/logs",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/me",
    ]:
        assert path in paths


def test_apple_module_paths_in_openapi():
    paths = client.get("/api/v1/openapi.json").json()["paths"]
    for path in [
        "/api/v1/apple/awards",
        "/api/v1/apple/finance",
        "/api/v1/apple/assets",
        "/api/v1/apple/students",
    ]:
        assert path in paths


def test_announcement_paths_in_openapi():
    paths = client.get("/api/v1/openapi.json").json()["paths"]
    for path in [
        "/api/v1/announcements",
        "/api/v1/announcements/generate",
        "/api/v1/announcements/templates",
    ]:
        assert path in paths


def test_award_paths_in_openapi():
    paths = client.get("/api/v1/openapi.json").json()["paths"]
    for path in [
        "/api/v1/apple/awards",
        "/api/v1/apple/awards/export",
        "/api/v1/apple/awards/{award_id}/calculate",
        "/api/v1/apple/awards/{award_id}/certificates",
        "/api/v1/apple/awards/{award_id}/script",
    ]:
        assert path in paths


def test_role_permission_contract():
    assert set(ROLES) == {"admin", "apple", "danielle", "steven", "tommy", "wendy", "leung", "reviewer"}
    assert check_permission(["apple:awards:*"], "apple:awards:create") is True
    assert check_permission(["apple:awards:read"], "apple:finance:read") is False
