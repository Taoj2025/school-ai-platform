# OCR Worker Documentation

## Overview

The OCR Worker is a Celery-based asynchronous worker for processing documents using OCR (Optical Character Recognition).

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   FastAPI   │────▶│    Redis    │────▶│  OCR Worker │
│   Backend   │     │   Broker    │     │   (Celery)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   OCR Engine│
                                        │(PaddleOCR)  │
                                        └─────────────┘
```

## Quick Start

### 1. Start Redis

```bash
redis-server
```

### 2. Start Celery Worker

```bash
cd school-ai-platform
celery -A workers.ocr_worker.main worker --loglevel=info
```

### 3. Submit Jobs

```python
from workers.ocr_worker.tasks import process_receipt

# Submit a receipt OCR job
task = process_receipt.delay(
    job_id="job-001",
    file_path="/path/to/receipt.jpg"
)

# Get result
result = task.get(timeout=120)
print(result)
```

## Tasks

### process_ocr_job

General OCR processing task.

```python
process_ocr_job(
    job_id: str,           # Unique job identifier
    file_path: str,        # Path to file
    language: str = "zh-HK"  # Language code
)
```

### process_receipt

Receipt-specific OCR with field extraction.

```python
process_receipt(
    job_id: str,
    file_path: str
)
```

Returns:
```json
{
  "job_id": "job-001",
  "status": "succeeded",
  "raw_text": "...",
  "extracted_fields": {
    "amount": 1500.00,
    "date": "2025-07-15",
    "payer": "家長會"
  },
  "confidence": "high",
  "warnings": []
}
```

### process_certificate

Certificate OCR with structured extraction.

```python
process_certificate(
    job_id: str,
    file_path: str
)
```

### process_document

General document OCR.

```python
process_document(
    job_id: str,
    file_path: str,
    doc_type: str = "general"
)
```

### batch_process

Process multiple files in parallel.

```python
batch_process(
    file_paths: List[str],
    job_type: str = "receipt"  # receipt, certificate, general
)
```

## Handlers

### ReceiptHandler

Processes receipt images and extracts:
- Amount
- Date
- Payer
- Purpose
- Receipt number
- Payment method

### CertificateHandler

Processes certificate documents and extracts:
- Certificate type
- Student name
- Issue date
- Issuing authority

### DocumentHandler

Processes general documents:
- Raw text extraction
- Document classification
- Key-value pair extraction

## OCR Engine

### PaddleOCR (Primary)

Best for Chinese text recognition.

```python
from workers.ocr_worker.services.ocr_engine import OCREngine

engine = OCREngine()
result = engine.process_file("/path/to/image.jpg", language="zh-HK")
```

### Tesseract (Fallback)

Fallback OCR engine if PaddleOCR is unavailable.

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| REDIS_URL | Redis connection URL | redis://localhost:6379/0 |
| OCR_ENGINE | OCR engine to use | paddle |
| OCR_TIMEOUT | OCR timeout (seconds) | 300 |

## Error Handling

All tasks return error information in case of failure:

```json
{
  "job_id": "job-001",
  "status": "failed",
  "error": "File not found"
}
```

## Monitoring

### Check Worker Health

```python
from workers.ocr_worker.main import health_check

result = health_check.delay()
print(result.get())
```

### View Active Tasks

```bash
celery -A workers.ocr_worker.main inspect active
```

### View Task Results

```bash
celery -A workers.ocr_worker.main inspect registered
```
