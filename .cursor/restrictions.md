# Engineering Restrictions

Hard restrictions for safe, maintainable backend delivery.

## 1) Architecture Restrictions

- Do not call Mongoose models directly from `controllers/`.
- Do not place business logic in `routes/`.
- Do not access `req`/`res` objects in `services/`.
- Do not write cross-layer circular dependencies.

## 2) Validation Restrictions

- Do not process requests without input validation.
- Do not accept unknown fields silently for protected resources.
- Do not trust client role/user identifiers from payload when JWT identity exists.
- Do not skip ObjectId validation for path params.

## 3) Security Restrictions

- Do not hardcode secrets, DB URIs, tokens, or credentials.
- Do not commit `.env` or private keys.
- Do not log password hashes, secrets, or raw JWT tokens.
- Do not expose stack traces or internal error objects in production responses.
- Do not allow role changes without Admin authorization checks.

## 4) Async and Error Restrictions

- Do not use callback-based async patterns in new code.
- Do not leave unhandled promise rejections.
- Do not swallow exceptions in `catch` blocks.
- Do not return success responses from failed DB writes.

## 5) API Contract Restrictions

- Do not introduce breaking API contract changes without versioning plan.
- Do not return inconsistent response shapes across endpoints.
- Do not use incorrect status codes for known outcomes.
- Do not bypass centralized `response.js` and `error.js` conventions.

## 6) Data Handling Restrictions

- Do not hard-delete records unless explicitly approved.
- Do not expose soft-deleted data by default.
- Do not perform full collection scans for frequent dashboard APIs.
- Do not allow negative or zero amounts for financial records unless business rule explicitly permits.

## 7) Performance Restrictions

- Do not fetch unbounded lists; pagination is mandatory.
- Do not run N+1 style repetitive DB calls where aggregation/batched queries are possible.
- Do not add non-indexed filter fields in high-traffic queries without index review.
- Do not block event loop with CPU-heavy synchronous operations.

## 8) Testing and Delivery Restrictions

- Do not merge critical logic without tests.
- Do not merge with failing CI checks.
- Do not skip security review for authentication/authorization changes.
- Do not release features with undocumented assumptions.

## 9) Examples (Forbidden Patterns)

Forbidden:

```js
// Controller directly querying DB and doing business logic
const user = await User.findById(req.params.id);
if (user.role !== "Admin") { ... }
```

Required:

```js
// Controller delegates to service
const result = await userService.updateUserRole({ actorId, targetUserId, role });
```
