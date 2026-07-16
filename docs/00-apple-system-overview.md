# Apple Subsystem Documentation

## Overview

The Apple Subsystem is a comprehensive school management system built with FastAPI backend and Next.js frontend. It consists of 4 main modules:

- **Awards Module (A1)** - Award and scholarship management
- **Finance Module (A2)** - Income, expense, and quotation management
- **Assets Module (A3)** - Asset tracking and inventory management
- **Students Module (A4)** - Student records and certificate generation

## Technology Stack

- **Backend**: FastAPI with async SQLAlchemy
- **Database**: PostgreSQL with Alembic migrations
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **OCR**: PaddleOCR/Tesseract with Celery workers
- **AI**: LLM integration for structured data extraction

## Project Structure

```
school-ai-platform/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── core/          # Core configuration
│   │   │   ├── modules/
│   │   │   │   ├── apple/     # Apple subsystem
│   │   │   │   │   ├── awards/
│   │   │   │   │   ├── finance/
│   │   │   │   │   ├── assets/
│   │   │   │   │   └── students/
│   │   │   │   └── ai/        # AI service module
│   │   │   └── prompts/       # AI prompts
│   │   └── alembic/           # Database migrations
│   └── web/                   # Next.js frontend
│       ├── app/
│       │   └── dashboard/
│       │       └── apple/     # Apple pages
│       ├── components/
│       └── lib/
├── workers/
│   └── ocr_worker/            # Celery OCR worker
├── packages/
│   └── shared-types/          # Shared TypeScript types
└── docs/                      # Documentation
```

## Module Documentation

- [Awards Module](./03-module-awards.md)
- [Finance & Assets Modules](./04-module-finance-assets.md)
- [Students Module](./05-module-students-ai.md)
- [OCR Worker](./06-ocr-worker.md)
