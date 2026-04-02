# Coding Standards

Standards for `Finance Data Processing and Access Control Backend` using Node.js, Express.js, MongoDB, REST APIs, and ES Modules.

## 1) Naming Conventions

- Variables/functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case` for route/controller/service files, `PascalCase.model.js` for Mongoose models
- Route paths: lowercase, plural nouns (`/financial-records`)
- Boolean fields: prefix with `is`/`has` (`isActive`, `isDeleted`)

### Examples

```js
const maxPageSize = 100;
function calculateNetBalance(income, expense) {}
class AuthService {}
const JWT_EXPIRES_IN = "1h";
```

## 2) Folder Structure Rules

Follow strict responsibilities:

- `routes/`: route registration only
- `controllers/`: HTTP request/response orchestration only
- `services/`: business logic and workflow rules
- `models/`: schema and DB model definitions
- `middlewares/`: auth, authorization, validation, request concerns
- `validations/`: standardized response and error wrappers
- `utils/`: shared helper utilities
- `db/` or `config/`: connection and config setup

Do not bypass the intended layer flow.

## 3) Controller-Service-Model Separation

- Controllers must not contain domain/business logic.
- Services must not know Express `req`/`res`.
- Models must not include endpoint-specific logic.

Expected flow:

1. Route -> middleware(s)
2. Controller -> service call
3. Service -> model query/update
4. Controller -> standardized response

## 4) API Response Format Consistency

Use common shape from `validations/response.js`.

```json
{
  "success": true,
  "message": "Financial records fetched",
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 86 }
}
```

Error shape from `validations/error.js`:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "amount", "message": "Amount must be > 0" }]
  }
}
```

## 5) Async/Await Rules

- Use `async/await` only (no callbacks for async control flow).
- Wrap controller actions with async error wrapper middleware.
- Never leave unhandled promises.

Bad:

```js
User.findById(id, (err, user) => {});
```

Good:

```js
const user = await User.findById(id);
```

## 6) Error Handling Rules

- Throw typed application errors from service layer.
- Centralized global error middleware must format all errors.
- Do not expose stack traces in production.
- Return correct HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`).

## 7) Logging Standards

- Use structured logs (JSON-like fields), not plain console strings in production code.
- Log context fields: `requestId`, `userId`, `route`, `statusCode`, latency.
- Never log secrets, passwords, JWTs, or full PII payloads.
- Levels:
  - `info`: business events
  - `warn`: recoverable issues/policy violations
  - `error`: failures requiring investigation

## 8) Clean Code Principles

- Keep functions small and single-purpose.
- Avoid duplicated logic; extract shared service or utility.
- Prefer explicit names over short cryptic names.
- Validate inputs early; fail fast.
- Keep route handlers thin.
- Add tests for non-trivial business rules.

## 9) Comments and Documentation

- Write self-explanatory code first.
- Add comments only when intent is not obvious.
- Keep comments updated with behavior changes.
- Every public API must have request/response examples in API docs.
- Update README/PRD when behavior or contracts change.

## 10) API Contract Versioning

- Base path should be versioned: `/api/v1`.
- Breaking changes require version bump or compatibility layer.
- Deprecations must be announced in release notes and API docs.
