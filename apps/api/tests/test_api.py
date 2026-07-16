from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_docs_accessible():
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_json():
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "paths" in schema

    expected_paths = [
        "/api/v1/files/upload",
        "/api/v1/ocr/jobs",
        "/api/v1/ai/generate",
        "/api/v1/audit/logs",
    ]
    for path in expected_paths:
        assert path in schema["paths"], f"Missing path: {path}"


def test_shared_api_paths_in_openapi():
    response = client.get("/api/v1/openapi.json")
    schema = response.json()
    paths = list(schema["paths"].keys())

    assert any("/ocr/jobs" in p for p in paths)
    assert any("/ai/generate" in p for p in paths)
    assert any("/audit/logs" in p for p in paths)
    assert any("/files/upload" in p for p in paths)


def test_apple_module_paths_in_openapi():
    response = client.get("/api/v1/openapi.json")
    schema = response.json()
    paths = list(schema["paths"].keys())

    assert any("apple/awards" in p for p in paths)
    assert any("apple/finance" in p for p in paths)
    assert any("apple/assets" in p for p in paths)
    assert any("apple/students" in p for p in paths)
