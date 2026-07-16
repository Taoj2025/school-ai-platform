# Apple 子系统 API 设计规范

> **版本**: v1.0  
> **日期**: 2025-07-17  
> **适用**: Apple 子系统所有 API 设计

---

## 1. 概述

本文档定义了 Apple 子系统的 API 设计规范，确保所有模块接口的一致性和可扩展性。

### 1.1 技术栈

- **后端框架**: FastAPI
- **数据库**: PostgreSQL + SQLAlchemy
- **认证**: JWT Token
- **权限**: Role-Based Access Control (RBAC)

### 1.2 基础 URL

```
开发环境: http://localhost:8000
生产环境: https://api.schoolai.edu.hk
```

---

## 2. 通用规范

### 2.1 路由格式

所有 Apple 模块 API 使用统一前缀：

```
/api/v1/apple/{module}/{action}
```

示例：
```
/api/v1/apple/awards
/api/v1/apple/awards/{id}
/api/v1/apple/students/{id}/attendance
```

### 2.2 HTTP 方法

| 方法 | 用途 |
|------|------|
| GET | 查询资源列表或单个资源 |
| POST | 创建新资源 |
| PATCH | 更新资源部分字段 |
| PUT | 更新资源全部字段 |
| DELETE | 删除资源 |

### 2.3 请求头

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

### 2.4 响应格式

**成功响应 (200/201)**:
```json
{
  "data": { ... },
  "meta": {
    "request_id": "uuid-v4",
    "timestamp": "2025-07-17T10:30:00Z"
  }
}
```

**分页响应**:
```json
{
  "data": [ ... ],
  "meta": {
    "request_id": "uuid-v4",
    "timestamp": "2025-07-17T10:30:00Z",
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

**错误响应 (4xx/5xx)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      { "field": "name", "message": "名称不能为空" }
    ]
  },
  "meta": {
    "request_id": "uuid-v4",
    "timestamp": "2025-07-17T10:30:00Z"
  }
}
```

### 2.5 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| UNAUTHORIZED | 401 | 未认证或 Token 过期 |
| FORBIDDEN | 403 | 无权限访问 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 3. Apple 模块 API 清单

### 3.1 奖项模块 (awards)

```
GET    /api/v1/apple/awards                           # 奖项列表
POST   /api/v1/apple/awards                           # 创建奖项
GET    /api/v1/apple/awards/{id}                      # 奖项详情
PATCH  /api/v1/apple/awards/{id}                      # 更新奖项
DELETE /api/v1/apple/awards/{id}                      # 删除奖项
POST   /api/v1/apple/awards/{id}/recipients           # 添加获奖学生
DELETE /api/v1/apple/awards/{id}/recipients/{rid}     # 移除获奖学生
POST   /api/v1/apple/awards/{id}/calculate            # 计算奖学金
POST   /api/v1/apple/awards/{id}/certificates         # 生成奖状 PDF
GET    /api/v1/apple/awards/{id}/script               # 生成读稿
```

### 3.2 财务模块 (finance)

```
GET    /api/v1/apple/finance/income                   # 收入列表
POST   /api/v1/apple/finance/income                   # 记录收入
GET    /api/v1/apple/finance/expense                  # 支出列表
POST   /api/v1/apple/finance/expense                  # 记录支出
GET    /api/v1/apple/finance/quotations               # 报价单列表
POST   /api/v1/apple/finance/quotations               # 创建报价单
POST   /api/v1/apple/finance/quotations/analyze       # 分析报价单
POST   /api/v1/apple/finance/address-labels           # 生成地址标签
```

### 3.3 资产模块 (assets)

```
GET    /api/v1/apple/assets                            # 资产列表
POST   /api/v1/apple/assets                            # 创建资产
GET    /api/v1/apple/assets/{id}                       # 资产详情
PATCH  /api/v1/apple/assets/{id}                       # 更新资产
DELETE /api/v1/apple/assets/{id}                       # 删除资产
GET    /api/v1/apple/assets/{id}/movements            # 移动记录
POST   /api/v1/apple/assets/{id}/movements             # 记录移动
POST   /api/v1/apple/assets/stocktake                 # 开始盘点
POST   /api/v1/apple/assets/{id}/writeoff              # 资产注销
POST   /api/v1/apple/assets/print-labels              # 批量打印标签
```

### 3.4 学生模块 (students)

```
GET    /api/v1/apple/students                         # 学生列表
POST   /api/v1/apple/students                         # 创建学生
GET    /api/v1/apple/students/{id}                   # 学生详情
PATCH  /api/v1/apple/students/{id}                   # 更新学生
DELETE /api/v1/apple/students/{id}                   # 删除学生
POST   /api/v1/apple/students/import                  # 批量导入
GET    /api/v1/apple/students/{id}/attendance         # 考勤记录
POST   /api/v1/apple/students/{id}/attendance/import # 导入考勤
GET    /api/v1/apple/students/{id}/certificates       # 证明申请
POST   /api/v1/apple/students/{id}/certificates      # 申请证明
GET    /api/v1/apple/students/{id}/certificates/{cid}/pdf # 下载证明 PDF
```

---

## 4. 通用 API

### 4.1 文件上传

```
POST /api/v1/files/upload
```

请求: `multipart/form-data`
- `file`: 文件
- `category`: 文件分类 (receipt, invoice, certificate, etc.)

响应:
```json
{
  "file_id": "uuid",
  "file_name": "receipt_20250717.jpg",
  "file_url": "/uploads/2025/07/receipt_20250717.jpg",
  "file_size": 102400
}
```

### 4.2 OCR 任务

```
POST /api/v1/ocr/jobs                    # 提交 OCR 任务
GET  /api/v1/ocr/jobs/{job_id}           # 查询任务状态
```

### 4.3 AI 生成

```
POST /api/v1/ai/generate
```

### 4.4 审计日志

```
GET /api/v1/audit/logs
```

---

## 5. 权限配置

Apple 模块权限格式: `{module}:{resource}:{action}`

| 权限 | 说明 |
|------|------|
| apple:awards:read | 查看奖项 |
| apple:awards:write | 管理奖项 |
| apple:awards:approve | 审核奖项 |
| apple:finance:read | 查看财务 |
| apple:finance:write | 管理财务 |
| apple:finance:approve | 审核财务 |
| apple:assets:read | 查看资产 |
| apple:assets:write | 管理资产 |
| apple:students:read | 查看学生 |
| apple:students:write | 管理学生 |

---

## 6. 版本管理

API 版本通过 URL 路径管理 (`/api/v1/`)

未来版本规划:
- v2: GraphQL 支持
- v3: 实时 WebSocket 通知

---

*文档版本: v1.0 · 编制日期: 2025-07-17*
