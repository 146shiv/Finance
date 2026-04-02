# Finance Data Processing and Access Control Backend

Production-ready backend foundation for secure financial record management with role-based access control.

## Project Overview

This backend system provides:

- User and role management (`Viewer`, `Analyst`, `Admin`)
- Financial records CRUD with filtering
- Dashboard summary APIs for analytics
- JWT authentication and middleware-based authorization
- Centralized validation, responses, and error handling

Tech constraints:
- Node.js
- Express.js
- MongoDB (Mongoose)
- REST APIs
- ES Modules (`"type": "module"`)

## Features

- Create/manage users and roles
- Activate/deactivate users
- Create/read/update/delete financial records
- Filters by date range, type, category
- Dashboard endpoints:
  - total income
  - total expenses
  - net balance
  - category-wise totals
  - monthly trends
  - recent transactions
- Consistent response/error structure
- Soft delete support (recommended)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (role included in payload)
- **Module system**: ES Modules

## Folder Structure

```text
/src
  /config
  /db
  /controllers
  /services
  /models
  /routes
  /middlewares
  /utils
  /validations
    response.js
    error.js
  app.js
```

Notes:
- Use `/db` for connection logic and `/config` for environment/constants.
- Keep controllers thin; business logic belongs in services.

## Setup Instructions

## 1) Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (or equivalent package manager)
- MongoDB instance (local or cloud)

## 2) Install dependencies

```bash
npm install
```

## 3) Configure environment variables

Create `.env` in project root:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/finance_backend
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=1h
```

## 4) Run in development (nodemon)

```bash
npm run dev
```

Suggested script:

```json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js"
  }
}
```

## 5) Run in production mode

```bash
npm run start
```

## API Documentation Overview

Base URL: `/api/v1`

Core route groups:
- `/auth` -> login/register/token flow
- `/users` -> user management and role updates
- `/financial-records` -> finance CRUD and filtering
- `/dashboard` -> summary and aggregation APIs

Example:

```http
GET /api/v1/financial-records?startDate=2026-01-01&endDate=2026-03-31&type=expense&category=Food&page=1&limit=20
Authorization: Bearer <token>
```

## Standard Response Contract

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | App port |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection URI |
| `JWT_SECRET` | Yes | Secret for signing JWT |
| `JWT_EXPIRES_IN` | Yes | Access token expiry (e.g. `1h`) |

## Security and Engineering Notes

- Never commit `.env` or secrets.
- Include role in JWT payload and enforce middleware authorization.
- Validate all request payloads and query params.
- Use centralized error handler and do not expose stack traces in production.
- Apply indexes for frequent filter and dashboard queries.

## Assumptions

- Initial Admin bootstrap strategy exists (script or secured endpoint).
- Records are stored in UTC; clients convert for display.
- Soft delete is used for auditability.
- Pagination is mandatory for list endpoints.

## Future Improvements

- Refresh tokens and token revocation
- Audit logs for role and finance updates
- Rate limiting and advanced threat protection
- OpenAPI/Swagger documentation generation
- Redis cache for dashboard-heavy traffic
- Background jobs for report exports

## Documentation in This Folder

- `coding-standards.md`
- `communication-rules.md`
- `restrictions.md`
- `system-identity.md`
- `tech-stack.md`
- `README.md` (this file)
