"""
OCR Worker for School AI Platform
Celery worker for asynchronous OCR processing
"""
from celery import Celery
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "ocr_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "workers.ocr_worker.tasks",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Hong_Kong",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_routes={
        "workers.ocr_worker.tasks.process_ocr_job": {"queue": "ocr"},
        "workers.ocr_worker.tasks.process_document": {"queue": "ocr"},
    },
)


@celery_app.task(bind=True, name="health_check")
def health_check(self):
    """Health check task."""
    return {"status": "ok", "worker": "ocr_worker"}


if __name__ == "__main__":
    celery_app.start()
