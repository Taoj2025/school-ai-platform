from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "School AI Platform"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    DATABASE_URL: str = "postgresql+asyncpg://school_ai:school_ai_dev@localhost:5432/school_ai_platform"
    SYNC_DATABASE_URL: str = "postgresql://school_ai:school_ai_dev@localhost:5432/school_ai_platform"
    REDIS_URL: str = "redis://localhost:6379/0"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    DEBUG: bool = True
    OCR_PROVIDER: str = "tesseract"
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: Optional[str] = None
    
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "school-ai-files"
    MINIO_SECURE: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
