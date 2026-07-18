from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .common.middleware import ErrorHandlerMiddleware, RequestLoggingMiddleware
from .common.schemas import success_response
from .core.config import settings
from .core.audit import setup_audit_listeners
from .modules.accounts.router import router as accounts_router
from .modules.ai.router import router as ai_router
from .modules.announcements.router import router as announcements_router
from .modules.announcements.router import templates_router as announcement_templates_router
from .modules.apple.assets.router import router as apple_assets_router
from .modules.apple.awards.router import router as apple_awards_router
from .modules.apple.finance.router import router as apple_finance_router
from .modules.apple.students.router import router as apple_students_router
from .modules.approvals.router import router as approvals_router
from .modules.audit.router import router as audit_router
from .modules.files.router import router as files_router
from .modules.ocr.router import router as ocr_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_audit_listeners()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts_router, prefix=settings.API_V1_PREFIX)
app.include_router(announcements_router, prefix=settings.API_V1_PREFIX)
app.include_router(announcement_templates_router, prefix=settings.API_V1_PREFIX)
app.include_router(files_router, prefix=settings.API_V1_PREFIX)
app.include_router(ocr_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)
app.include_router(approvals_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)
app.include_router(apple_awards_router, prefix=settings.API_V1_PREFIX)
app.include_router(apple_finance_router, prefix=settings.API_V1_PREFIX)
app.include_router(apple_assets_router, prefix=settings.API_V1_PREFIX)
app.include_router(apple_students_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", response_model=dict)
async def health_check():
    return success_response(data={"status": "ok", "service": settings.PROJECT_NAME})
