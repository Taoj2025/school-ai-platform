# Finance & Assets Modules

## Finance Module (A2)

### Overview

The Finance module manages income, expenses, and quotation analysis.

### Database Schema

#### Income Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| category | ENUM | tuition, donation, event, other |
| amount | DECIMAL | Income amount |
| currency | VARCHAR(3) | Currency code |
| date | DATE | Transaction date |
| payer | VARCHAR(255) | Payer name |
| description | TEXT | Income description |
| receipt_no | VARCHAR(50) | Receipt number |
| ocr_raw_text | TEXT | Raw OCR text if scanned |

#### Expense Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| category | ENUM | salary, equipment, maintenance, event, other |
| amount | DECIMAL | Expense amount |
| currency | VARCHAR(3) | Currency code |
| date | DATE | Transaction date |
| vendor | VARCHAR(255) | Vendor name |
| description | TEXT | Expense description |
| payment_status | ENUM | unpaid, partial, paid |

#### Quotation Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| expense_id | UUID | Foreign key to Expense |
| vendor | VARCHAR(255) | Vendor name |
| amount | DECIMAL | Quoted amount |
| currency | VARCHAR(3) | Currency code |
| date | DATE | Quotation date |
| is_lowest | BOOLEAN | Is lowest bid |
| is_single_bid | BOOLEAN | Is single bid |
| anomalies | JSON | Detected anomalies |

### API Endpoints

#### Income

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/finance/income` | List income records |
| POST | `/api/v1/apple/finance/income` | Create income (OCR supported) |
| GET | `/api/v1/apple/finance/income/{id}` | Get income details |
| PATCH | `/api/v1/apple/finance/income/{id}` | Update income |
| DELETE | `/api/v1/apple/finance/income/{id}` | Delete income |

#### Expense

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/finance/expense` | List expense records |
| POST | `/api/v1/apple/finance/expense` | Create expense |
| GET | `/api/v1/apple/finance/expense/{id}` | Get expense details |
| PATCH | `/api/v1/apple/finance/expense/{id}` | Update expense |

#### Quotations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/finance/quotations` | List quotations |
| POST | `/api/v1/apple/finance/quotations` | Create quotation |
| GET | `/api/v1/apple/finance/quotations/{id}` | Get quotation |
| POST | `/api/v1/apple/finance/quotations/{id}/analyze` | Analyze for anomalies |

---

## Assets Module (A3)

### Overview

The Assets module manages school assets, movements, and inventory stocktakes.

### Database Schema

#### Asset Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Asset name |
| asset_no | VARCHAR(50) | Asset number (unique) |
| category | ENUM | furniture, electronics, equipment, vehicle, other |
| location | VARCHAR(255) | Current location |
| purchase_date | DATE | Purchase date |
| purchase_price | DECIMAL | Purchase price |
| currency | VARCHAR(3) | Currency code |
| status | ENUM | in_use, storage, maintenance, written_off |
| serial_no | VARCHAR(100) | Serial number |
| remarks | TEXT | Additional notes |

#### AssetMovement Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| asset_id | UUID | Foreign key to Asset |
| movement_type | ENUM | in, out, transfer, maintenance |
| from_location | VARCHAR(255) | Original location |
| to_location | VARCHAR(255) | New location |
| reason | TEXT | Movement reason |
| moved_by | VARCHAR(100) | Staff who moved |

#### StocktakeTask Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| task_no | VARCHAR(50) | Task number |
| location | VARCHAR(255) | Stocktake location |
| status | ENUM | pending, in_progress, completed |
| assigned_to | VARCHAR(100) | Assigned staff |
| scheduled_date | DATE | Scheduled date |
| completed_date | DATE | Completion date |

### API Endpoints

#### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/assets` | List assets |
| POST | `/api/v1/apple/assets` | Create asset |
| GET | `/api/v1/apple/assets/{id}` | Get asset details |
| PATCH | `/api/v1/apple/assets/{id}` | Update asset |
| DELETE | `/api/v1/apple/assets/{id}` | Delete asset |
| GET | `/api/v1/apple/assets/stats` | Get asset statistics |

#### Movements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/apple/assets/{id}/movements` | Get movement history |
| POST | `/api/v1/apple/assets/{id}/movements` | Record movement |

#### Write-off

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/apple/assets/{id}/writeoff` | Write off asset |

#### Stocktake

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/apple/assets/stocktake` | Create stocktake task |
| GET | `/api/v1/apple/assets/stocktake/{id}` | Get stocktake details |
| PATCH | `/api/v1/apple/assets/stocktake/{id}` | Update stocktake |

#### Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/apple/assets/print-labels` | Generate label PDFs |

## Anomaly Detection

The Finance module includes quotation analysis that detects:

- **Single Bid**: Only one quotation received
- **Non-Lowest Selection**: A non-lowest quotation was selected
- **Large Variance**: Significant price difference between quotations
