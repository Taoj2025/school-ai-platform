# Awards Module (A1)

## Overview

The Awards module manages school awards, scholarships, and certificate generation.

## Database Schema

### Award Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Award title (Chinese) |
| title_en | VARCHAR(255) | Award title (English) |
| award_type | ENUM | academic, conduct, service, sports, art, other |
| academic_year | VARCHAR(20) | e.g., "2024-2025" |
| semester | INT | 1 or 2 |
| status | ENUM | draft, pending, approved, published, cancelled |
| description | TEXT | Award description |
| criteria | TEXT | Award criteria |
| ceremony_date | DATE | Award ceremony date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

### Scholarship Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| award_id | UUID | Foreign key to Award |
| student_id | UUID | Foreign key to Student |
| amount | DECIMAL | Scholarship amount |
| currency | VARCHAR(3) | Currency code (HKD) |
| status | ENUM | pending, approved, rejected, paid |
| approved_by | VARCHAR(100) | Approver name |
| approved_at | TIMESTAMP | Approval timestamp |
| paid_at | TIMESTAMP | Payment timestamp |

## API Endpoints

### Awards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/awards` | List all awards |
| POST | `/api/v1/apple/awards` | Create new award |
| GET | `/api/v1/apple/awards/{id}` | Get award details |
| PATCH | `/api/v1/apple/awards/{id}` | Update award |
| DELETE | `/api/v1/apple/awards/{id}` | Delete award |
| POST | `/api/v1/apple/awards/{id}/calculate` | Calculate scholarships |
| POST | `/api/v1/apple/awards/{id}/certificates` | Generate certificates |
| GET | `/api/v1/apple/awards/{id}/script` | Generate ceremony script |

### Scholarships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/scholarships` | List all scholarships |
| GET | `/api/v1/apple/scholarships/{id}` | Get scholarship details |
| PATCH | `/api/v1/apple/scholarships/{id}` | Update scholarship status |

## Scholarship Amounts

| Award Type | Amount (HKD) |
|------------|-------------|
| Academic | 1,000 |
| Conduct | 500 |
| Service | 400 |
| Sports | 600 |
| Art | 400 |
| Other | 300 |

## Usage Examples

### Create Award

```bash
curl -X POST http://localhost:8000/api/v1/apple/awards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2024-2025學年學業獎",
    "award_type": "academic",
    "academic_year": "2024-2025",
    "semester": 1,
    "ceremony_date": "2025-03-15"
  }'
```

### Calculate Scholarships

```bash
curl -X POST http://localhost:8000/api/v1/apple/awards/{award_id}/calculate
```

### Generate Certificates

```bash
curl -X POST http://localhost:8000/api/v1/apple/awards/{award_id}/certificates
```

## Workflow

1. **Create Award** - Draft the award details
2. **Add Recipients** - Add students who will receive the award
3. **Calculate Scholarships** - System calculates scholarship amounts
4. **Approve** - Manager approves scholarships
5. **Generate Certificates** - Create certificate PDFs
6. **Publish** - Make award public
7. **Pay** - Process scholarship payments
