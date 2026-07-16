# Apple 子系统

> 香港培英中學 AI 數智化平台 - Apple 子系统

## 概述

Apple 子系统是为香港培英中學开发的校园管理系统，包含奖状奖学金、财务收支、资产盘点、学生事务四大功能模块。

## 技术栈

### 前端
- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Variables
- **图标**: Lucide React

### 后端
- **框架**: FastAPI
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy
- **任务队列**: Celery

### AI/OCR
- **OCR 引擎**: PaddleOCR / Tesseract
- **AI 模型**: 支持 GPT-4 等大语言模型

## 模块功能

### 1. 奖状奖学金管理 (A1)
- 奖项列表和详情管理
- 奖学金自动核算
- 奖状批量生成 PDF
- 颁奖读稿自动生成
- OCR 识别获奖名单

### 2. 财务收支管理 (A2)
- 收入/支出记录
- OCR 识别收据
- 报价单分析
- 财务报表生成

### 3. 资产盘点管理 (A3)
- 资产列表和分类
- OCR 识别发票
- 资产移动记录
- 年度盘点任务
- 资产注销流程

### 4. 学生事务管理 (A4)
- 学生信息管理
- Excel 批量导入
- 考勤记录
- 在学证明申请
- AI 生成证明书

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.11+
- PostgreSQL 16
- Docker (可选)

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd school-ai-platform

# 安装前端依赖
cd apps/web
npm install

# 安装后端依赖
cd ../api
pip install -r requirements.txt
```

### 启动开发服务器

```bash
# 启动前端
cd apps/web
npm run dev

# 启动后端 (另一个终端)
cd apps/api
uvicorn app.main:app --reload

# 启动 OCR Worker (可选)
cd workers/ocr_worker
celery -A main worker --loglevel=info
```

### Docker 启动 (推荐)

```bash
docker-compose up
```

访问地址:
- 前端: http://localhost:3001
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 演示账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | password123 |
| Apple 负责人 | apple | password123 |

## 主题切换

系统支持 4 种主题:
- 浅色 (Light) - 默认
- 深色 (Dark)
- 蓝色 (Blue)
- 绿色 (Green)

点击右上角主题按钮即可切换。

## 目录结构

```
school-ai-platform/
├── apps/
│   ├── web/                    # Next.js 前端
│   │   ├── app/
│   │   │   └── dashboard/
│   │   │       └── apple/     # Apple 子系统页面
│   │   └── components/
│   │       ├── layout/        # 布局组件
│   │       └── modules/       # 业务组件
│   │           └── apple/      # Apple 模块组件
│   └── api/                    # FastAPI 后端
│       └── app/
│           └── modules/
│               └── apple/     # Apple 业务模块
│                   ├── awards/
│                   ├── finance/
│                   ├── assets/
│                   ├── students/
│                   └── prompts/ # AI Prompt 模板
├── docs/                        # 文档
├── workers/
│   └── ocr_worker/            # OCR Worker
└── templates/
    └── apple/                  # DOCX 模板
```

## API 文档

完整 API 文档请访问: http://localhost:8000/docs

### 主要 API 端点

**奖状模块**:
- `GET /api/v1/apple/awards` - 奖项列表
- `POST /api/v1/apple/awards` - 创建奖项
- `POST /api/v1/apple/awards/{id}/certificates` - 生成奖状

**财务模块**:
- `GET /api/v1/apple/finance/income` - 收入列表
- `POST /api/v1/apple/finance/income` - 记录收入

**资产模块**:
- `GET /api/v1/apple/assets` - 资产列表
- `POST /api/v1/apple/assets/stocktake` - 开始盘点

**学生模块**:
- `GET /api/v1/apple/students` - 学生列表
- `POST /api/v1/apple/students/import` - 批量导入

## 开发规范

### 前端规范
- 使用 CSS 变量进行主题适配
- 使用 `inputStyle` 统一表单样式
- 组件使用 `'use client'` 指令
- 使用 React Context 管理状态

### 后端规范
- 使用 Pydantic 进行数据验证
- 使用 SQLAlchemy 进行数据库操作
- 遵循 RESTful API 设计规范
- 所有改动需要权限验证

## 测试

```bash
# 运行前端测试
cd apps/web
npm test

# 运行后端测试
cd apps/api
pytest
```

## 文档列表

| 文档 | 说明 |
|------|------|
| 00-apple-system-overview.md | 子系统总览 |
| 03-module-awards.md | 奖状奖学金模块文档 |
| 04-module-finance-assets.md | 财务资产模块文档 |
| 05-module-students-ai.md | 学生事务模块文档 |
| 06-ocr-worker.md | OCR Worker 技术文档 |
| 08-testing-report.md | 测试报告 |
| 09-demo-guide.md | 演示手册 |
| 10-acceptance-checklist.md | 验收清单 |
| api.md | API 设计规范 |

## 团队成员

| 角色 | 负责模块 |
|------|----------|
| 同学 1 | 架构师 / Leader |
| 同学 2 | 奖状奖学金模块 |
| 同学 3 | 财务 + 资产模块 |
| 同学 4 | 学生事务 + AI |
| 同学 5 | 汇总 + 总览页 |

## 许可

本项目为香港培英中學内部使用。

---

*最后更新: 2025-07-17*
