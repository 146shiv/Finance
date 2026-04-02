# Product Requirements Document (PRD)

## Product Name
Finance Data Processing and Access Control Backend

## Version
v1.0

## Owner
Backend Engineering + Product

## Last Updated
2026-04-01

---

## 1. Overview

The **Finance Data Processing and Access Control Backend** is a RESTful backend service for managing users, roles, and financial records while enforcing secure access controls.

The system is designed for:
- Small to mid-scale finance tracking workflows
- Multi-role teams (Viewer, Analyst, Admin)
- Reliable data operations and analytics-ready summaries

This backend will be implemented with:
- **Node.js** runtime
- **Express.js** framework
- **MongoDB** with **Mongoose**
- **REST APIs**
- **ES Modules** (`"type": "module"` in `package.json`)

---

## 2. Goals & Objectives

### Primary Goals
- Provide secure, role-aware access to financial data.
- Support complete CRUD lifecycle for financial records.
- Deliver summary and trend APIs for dashboard use cases.
- Standardize request/response handling, validation, and errors.
- Ensure maintainable, scalable architecture from day one.

### Success Criteria
- All endpoints follow REST naming and status code standards.
- JWT-based auth is enforced on protected routes.
- Role-based access is consistently applied using middleware.
- Financial data can be filtered, aggregated, and retrieved efficiently.
- Clear folder boundaries support team-based development.

---

## 3. System Architecture

### High-Level Architecture
- **Client Layer**: Web/Mobile/Admin consumers call REST APIs.
- **API Layer (Express)**: Routes -> Middlewares -> Controllers.
- **Business Layer (Services)**: Core business logic, computations, policies.
- **Data Layer (Mongoose Models)**: MongoDB schemas and persistence logic.
- **Cross-cutting Layer**: Validation, error handling, standardized responses, utilities.

### Request Lifecycle
1. Incoming request hits route.
2. Auth middleware verifies JWT (for protected routes).
3. Authorization middleware checks role permissions.
4. Validation middleware checks payload/query params.
5. Controller forwards request to service.
6. Service performs business logic + model operations.
7. Standardized response is returned via `validations/response.js`.
8. Errors are propagated to centralized error handler in `validations/error.js`.

### Scalability Principles
- Separation of concerns (route/controller/service/model).
- Reusable middlewares for auth and validation.
- Query indexing strategy for filter/aggregation performance.
- Soft delete compatibility for future auditability.

---

## 4. Folder Structure (Inside `/src`)

```text
/src
  /config                 # Environment setup, app-level configuration
  /db                     # MongoDB connection module (use either /config or /db as per team choice)
  /controllers            # HTTP handlers; parse req and shape response
    auth.controller.js
    user.controller.js
    financialRecord.controller.js
    dashboard.controller.js
  /services               # Business logic, rules, orchestration
    auth.service.js
    user.service.js
    financialRecord.service.js
    dashboard.service.js
  /models                 # Mongoose schemas and model definitions
    User.model.js
    FinancialRecord.model.js
  /routes                 # Express route definitions and route grouping
    auth.routes.js
    user.routes.js
    financialRecord.routes.js
    dashboard.routes.js
    index.routes.js
  /middlewares            # Authentication, authorization, validation, error wrappers
    auth.middleware.js
    role.middleware.js
    validate.middleware.js
  /utils                  # Reusable helpers (token, hashing, date, constants)
    jwt.util.js
    hash.util.js
    pagination.util.js
  /validations            # Centralized response and error strategy
    response.js
    error.js
  app.js                  # Main Express app initialization
```

> Note: Use **either** `/config` **or** `/db` for MongoDB connection logic.  
> If both are kept, use `/db` for connection and `/config` for environment constants.

### Folder Responsibilities
- `/config`: Environment variable mapping, app constants.
- `/db`: MongoDB connection setup and connection lifecycle events.
- `/controllers`: Endpoint-level handlers; no heavy business logic.
- `/services`: Core domain logic; invoked by controllers.
- `/models`: Schema definitions, indexes, and model methods.
- `/routes`: REST endpoint mapping to controllers.
- `/middlewares`: Reusable middleware for auth, role checks, validation.
- `/utils`: Generic helpers used across layers.
- `/validations`: Consistent API response contract and error abstraction.
- `app.js`: Express bootstrap, middlewares, route mounting, global error handling.

---

## 5. Data Models

## 5.1 User Model

### Purpose
Manages identity, authentication data, role assignment, and active status.

### Suggested Fields
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (required, unique, indexed, lowercase)
- `passwordHash`: String (required)
- `role`: Enum (`Viewer`, `Analyst`, `Admin`) (required, default `Viewer`)
- `isActive`: Boolean (default `true`)
- `isDeleted`: Boolean (default `false`) *(for soft delete)*
- `createdAt`, `updatedAt`: Timestamps

### Indexing
- Unique index on `email`
- Optional compound index: `{ role: 1, isActive: 1 }`

## 5.2 FinancialRecord Model

### Purpose
Stores individual finance entries for income/expense tracking.

### Suggested Fields
- `_id`: ObjectId
- `userId`: ObjectId (ref: `User`, required, indexed)
- `amount`: Number (required, min > 0)
- `type`: Enum (`income`, `expense`) (required)
- `category`: String (required, indexed)
- `date`: Date (required, indexed)
- `notes`: String (optional, max length recommended)
- `isDeleted`: Boolean (default `false`) *(soft delete)*
- `createdBy`: ObjectId (ref: `User`) *(optional but useful for audit)*
- `updatedBy`: ObjectId (ref: `User`) *(optional but useful for audit)*
- `createdAt`, `updatedAt`: Timestamps

### Indexing
- `{ userId: 1, date: -1 }`
- `{ type: 1, category: 1 }`
- `{ isDeleted: 1 }`

---

## 6. API Design (REST)

Base path suggestion: `/api/v1`

## 6.1 Authentication APIs

- `POST /auth/register` - Create user account (usually Admin-only after initial bootstrap)
- `POST /auth/login` - Authenticate and issue JWT
- `POST /auth/refresh` *(optional)* - Refresh token flow for long sessions

## 6.2 User & Role Management APIs

- `GET /users` - List users (Admin)
- `POST /users` - Create user (Admin)
- `GET /users/:id` - Get user details (Admin or self, based on policy)
- `PATCH /users/:id/role` - Update user role (Admin)
- `PATCH /users/:id/status` - Activate/Deactivate user (Admin)
- `DELETE /users/:id` - Soft delete user (Admin)

## 6.3 Financial Records APIs

- `POST /financial-records` - Create financial record (Analyst/Admin)
- `GET /financial-records` - List records with filters (Viewer/Analyst/Admin)
- `GET /financial-records/:id` - Get record by id
- `PATCH /financial-records/:id` - Update record (owner/Analyst/Admin by policy)
- `DELETE /financial-records/:id` - Soft delete record (Analyst/Admin)

### Query Filters for `GET /financial-records`
- `startDate` (ISO date)
- `endDate` (ISO date)
- `type` (`income`/`expense`)
- `category` (string)
- `page`, `limit`, `sortBy`, `sortOrder`

## 6.4 Dashboard APIs

- `GET /dashboard/summary` - Total income, total expenses, net balance
- `GET /dashboard/category-breakdown` - Category-wise totals
- `GET /dashboard/monthly-trends` - Month-wise income/expense trends
- `GET /dashboard/recent-transactions` - Most recent N records

### Endpoint Design Table

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/v1/auth/login` | User login and JWT issue | Public |
| POST | `/api/v1/users` | Create user | Admin |
| PATCH | `/api/v1/users/:id/role` | Assign role | Admin |
| PATCH | `/api/v1/users/:id/status` | Activate/deactivate user | Admin |
| POST | `/api/v1/financial-records` | Add income/expense record | Analyst, Admin |
| GET | `/api/v1/financial-records` | List/filter records | Viewer, Analyst, Admin |
| PATCH | `/api/v1/financial-records/:id` | Update record | Analyst, Admin |
| DELETE | `/api/v1/financial-records/:id` | Soft delete record | Analyst, Admin |
| GET | `/api/v1/dashboard/summary` | Dashboard totals | Viewer, Analyst, Admin |

---

## 6.5 Sample Request/Response Formats

### A) Login
**Request**
```json
{
  "email": "admin@finance.com",
  "password": "SecurePass123!"
}
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt-token>",
    "user": {
      "id": "65f0b4...",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "Admin",
      "isActive": true
    }
  }
}
```

### B) Create Financial Record
**Request**
```json
{
  "amount": 2500,
  "type": "income",
  "category": "Salary",
  "date": "2026-03-30",
  "notes": "March salary"
}
```

**Success Response (201)**
```json
{
  "success": true,
  "message": "Financial record created",
  "data": {
    "id": "65f0d1...",
    "amount": 2500,
    "type": "income",
    "category": "Salary",
    "date": "2026-03-30T00:00:00.000Z",
    "notes": "March salary"
  }
}
```

### C) Validation Error
**Response (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than zero"
    }
  ]
}
```

---

## 6.6 Status Codes

- `200 OK` - Fetch/update success
- `201 Created` - New resource created
- `400 Bad Request` - Input validation failure
- `401 Unauthorized` - Missing/invalid JWT
- `403 Forbidden` - Authenticated but not allowed
- `404 Not Found` - Resource does not exist
- `409 Conflict` - Duplicate resource (e.g., email exists)
- `422 Unprocessable Entity` *(optional)* - Semantic validation error
- `500 Internal Server Error` - Unexpected server issue

---

## 7. Authentication & Authorization Flow

## 7.1 JWT Authentication
1. User logs in with email/password.
2. Server validates credentials and user `isActive`.
3. Server issues JWT containing:
   - `sub` (user id)
   - `role` (Viewer/Analyst/Admin) **[required]**
   - `email` *(optional)*
   - `iat`, `exp`
4. Client includes JWT in header: `Authorization: Bearer <token>`.
5. Auth middleware verifies token signature and expiry.

## 7.2 Role-Based Authorization
- A role middleware checks `req.user.role` from JWT payload.
- Routes declare allowed roles, e.g.:
  - `POST /users` -> `Admin` only
  - `GET /financial-records` -> `Viewer`, `Analyst`, `Admin`
  - `DELETE /financial-records/:id` -> `Analyst`, `Admin`

## 7.3 Active User Enforcement
- Even with a valid JWT, if user is deactivated (`isActive = false`), access should be rejected (`403` or `401` based on policy).

---

## 8. Business Logic Explanation

### 8.1 User & Role Management
- Admin creates users and assigns initial roles.
- Role updates are controlled and audited.
- Deactivation blocks login and protected route access.
- Soft delete marks user as deleted without removing history.

### 8.2 Financial Records Management
- Each record is validated and associated with `userId`.
- Updates respect ownership and/or role policy.
- Deleting a record sets `isDeleted = true`.
- List APIs exclude `isDeleted = true` by default.

### 8.3 Dashboard Calculations
- **Total Income**: Sum of `amount` where `type = income`.
- **Total Expenses**: Sum of `amount` where `type = expense`.
- **Net Balance**: `totalIncome - totalExpenses`.
- **Category Breakdown**: Aggregation grouped by category and optionally type.
- **Monthly Trends**: Group by month/year for chart-friendly output.
- **Recent Transactions**: Date-desc sorted records with limit.

### 8.4 Service Layer Priority
- Controllers remain thin.
- Services own business decisions, aggregate logic, and reusable workflows.
- Models remain persistence-focused (schemas, indexes, static methods).

---

## 9. Validation & Error Handling Strategy

## 9.1 Input Validation
- Validate body, params, and query inputs before controller execution.
- Recommended libraries: `zod`, `joi`, or `express-validator`.
- Reject malformed IDs, invalid enum values, negative amounts, invalid dates.

## 9.2 `validations/response.js` (Central Response Format)

Recommended success format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Recommended paginated format:
```json
{
  "success": true,
  "message": "Records fetched",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

## 9.3 `validations/error.js` (Central Error Handling)
- Define application error class (e.g., `AppError`) with:
  - `statusCode`
  - `message`
  - `errorCode` *(optional)*
  - `details` *(optional)*
- Global Express error handler:
  - Converts known errors to standard structure
  - Hides stack trace in production
  - Handles Mongoose cast/duplicate/validation errors uniformly

Recommended error format:
```json
{
  "success": false,
  "message": "Forbidden",
  "error": {
    "code": "ACCESS_DENIED",
    "details": null
  }
}
```

---

## 10. Soft Delete Strategy (Preferred)

### Why
- Preserve historical records for audit and analytics.
- Avoid accidental permanent data loss.

### Approach
- Add `isDeleted: Boolean` (default `false`) and optional `deletedAt`, `deletedBy`.
- Update delete APIs to mark records deleted.
- Exclude soft-deleted documents in all read queries unless explicitly requested.
- Optional background archival job for long-term retention.

---

## 11. Assumptions

- Initial Admin user can be bootstrapped via script or secure setup endpoint.
- Passwords are hashed (bcrypt or equivalent), never stored in plain text.
- MongoDB instance and environment variables are provisioned externally.
- Timezone handling uses UTC for storage and conversion for UI.
- Pagination is required for list endpoints to protect performance.

---

## 12. Future Enhancements

- Refresh token + token revocation list
- Multi-tenant data partitioning by organization
- Fine-grained permissions beyond role-level RBAC
- Audit logging for role changes and sensitive operations
- CSV/Excel export for finance reports
- Webhook/event-driven pipeline for external analytics
- Caching layer (Redis) for dashboard-heavy workloads

---

## Non-Functional Requirements (Recommended)

- **Security**: Helmet, CORS policy, rate limiting, input sanitization.
- **Performance**: Indexed queries and aggregation optimization.
- **Reliability**: Health endpoint and graceful shutdown handling.
- **Observability**: Structured logs, request IDs, centralized error logging.
- **Maintainability**: Layered architecture, linting, consistent response contracts.

---

## Implementation Notes (ES Modules)

- `package.json` must include:
```json
{
  "type": "module"
}
```

- Use `import/export` consistently across all backend modules.
- Keep `app.js` as Express composition root:
  - middleware registration
  - route mounting (`/api/v1`)
  - not-found handler
  - global error middleware

