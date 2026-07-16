# Students Module (A4) & AI Integration

## Students Module

### Overview

The Students module manages student records, attendance, and certificate generation.

### Database Schema

#### Student Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| student_no | VARCHAR(50) | Student number (unique) |
| name_zh | VARCHAR(100) | Chinese name |
| name_en | VARCHAR(100) | English name |
| gender | ENUM | M, F |
| class_name | VARCHAR(20) | Class name (e.g., "1A") |
| grade | INT | Grade level (1-6) |
| enrollment_date | DATE | Enrollment date |
| graduation_date | DATE | Graduation date |
| status | ENUM | active, graduated, transferred, suspended |
| date_of_birth | DATE | Date of birth |

#### StudentCertificate Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to Student |
| certificate_type | ENUM | enrollment, attendance, graduation, other |
| issued_at | TIMESTAMP | Issue date |
| valid_until | DATE | Validity date |
| download_url | VARCHAR(500) | PDF download URL |
| remarks | TEXT | Additional notes |

#### AttendanceRecord Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to Student |
| date | DATE | Attendance date |
| status | ENUM | present, absent, late, leave |
| remarks | TEXT | Additional notes |

### API Endpoints

#### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/students` | List students |
| POST | `/api/v1/apple/students` | Create student |
| GET | `/api/v1/apple/students/{id}` | Get student details |
| PATCH | `/api/v1/apple/students/{id}` | Update student |
| DELETE | `/api/v1/apple/students/{id}` | Delete student |
| POST | `/api/v1/apple/students/import` | Batch import from Excel |

#### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/students/{id}/attendance` | Get attendance records |
| POST | `/api/v1/apple/students/{id}/attendance/import` | Import attendance |

#### Certificates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/students/{id}/certificates` | List certificates |
| GET | `/api/v1/apple/students/{id}/certificates/{cid}/pdf` | Download certificate PDF |

---

## AI Integration

### Overview

The AI service provides structured data extraction from documents using LLM.

### Available Prompts

#### Award Extraction (`award_extract_zh_hk.md`)

Extracts award information from Excel or text input:

```json
{
  "recipients": [
    {
      "student_no": "S2024001",
      "student_name": "陳小明",
      "class_name": "1A",
      "grade": 1
    }
  ],
  "confidence": "high",
  "warnings": []
}
```

#### Receipt Extraction (`receipt_extract_zh_hk.md`)

Extracts fields from receipt OCR text:

```json
{
  "fields": {
    "amount": 1500.00,
    "currency": "HKD",
    "date": "2025-07-15",
    "payer": "家長",
    "purpose": "課外活動費"
  },
  "confidence": "high",
  "warnings": []
}
```

#### Quotation Analysis (`quotation_analyze_zh_hk.md`)

Analyzes quotations for procurement anomalies:

```json
{
  "is_single_bid": false,
  "is_lowest": true,
  "anomalies": [],
  "recommendation": "正常"
}
```

#### Student Certificate (`student_certificate_zh_hk.md`)

Generates certificate content for students:

```json
{
  "certificate_type": "enrollment",
  "content": {
    "title": "在學證明",
    "student_name": "陳小明",
    "class_name": "1A",
    "enrollment_date": "2024-09-01"
  }
}
```

---

## OCR Worker

### Overview

The OCR worker processes documents asynchronously using Celery.

### Tasks

| Task | Description |
|------|-------------|
| `process_ocr_job` | General OCR processing |
| `process_receipt` | Receipt-specific OCR |
| `process_certificate` | Certificate OCR |
| `process_document` | General document OCR |
| `batch_process` | Batch file processing |

### Usage

```python
from workers.ocr_worker.tasks import process_receipt

# Submit OCR job
task = process_receipt.delay(job_id="job-001", file_path="/uploads/receipt.jpg")

# Get result
result = task.get(timeout=60)
```

### Handlers

- `receipt_handler.py` - Receipt-specific processing
- `certificate_handler.py` - Certificate processing
- `document_handler.py` - General document handling

### OCR Engine

Supports:
- **PaddleOCR** - Primary (better for Chinese)
- **Tesseract** - Fallback option
