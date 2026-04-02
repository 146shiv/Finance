# Communication Rules

Rules for coordination between Backend Developer, Frontend Developer, QA Engineer, and Product Manager.

## 1) Team Communication Principles

- Be specific, concise, and evidence-based.
- Communicate in writing for decisions impacting API behavior.
- Confirm assumptions before implementation for ambiguous requirements.
- Use shared language: endpoint, payload, status code, role policy, acceptance criteria.

## 2) Role Responsibilities

### Backend Developer

- Own API contract, data integrity, validation, and authorization.
- Communicate API changes before merge.
- Provide migration notes for any schema changes.

### Frontend Developer

- Consume only documented endpoints/contracts.
- Report contract mismatches with reproducible request/response examples.
- Share UI validation expectations early.

### QA Engineer

- Validate happy path + edge cases + authorization boundaries.
- Verify status codes, response schema, and error behavior.
- Attach test evidence (request payloads, responses, logs if needed).

### Product Manager

- Define acceptance criteria and role-based behavior clearly.
- Confirm business rules for records, dashboard metrics, and user roles.
- Approve scope changes and trade-offs.

## 3) API Contract Communication

For every API change, share:

- Endpoint and method
- Request schema (required/optional fields)
- Response schema
- Status code changes
- Authorization rules
- Backward compatibility impact

Minimum format:

```md
Endpoint: PATCH /api/v1/users/:id/role
Change: Added role validation for Viewer/Analyst/Admin
Impact: 400 on invalid role values
Auth: Admin only
```

## 4) Pull Request Rules

- Small, focused PRs are preferred.
- Include:
  - What changed
  - Why it changed
  - API contract impact
  - Security/performance impact
  - Test plan and evidence
- At least one backend reviewer required for backend logic.
- Do not merge with failing checks.

## 5) Documentation Expectations

- Update docs in the same PR when behavior changes.
- Required updates depending on change:
  - API contract -> API docs + README
  - Architecture/layer rule -> `coding-standards.md` or `restrictions.md`
  - Product logic -> PRD and acceptance notes

## 6) Handoff Checklist (Backend -> Frontend/QA)

- Endpoint available in target environment
- Example request/response shared
- Error scenarios documented
- Role restrictions documented
- Test data guidance shared

## 7) Conflict Resolution Guidelines

- Step 1: Align on facts (logs, contract, requirement text).
- Step 2: Identify owner by domain (product vs technical).
- Step 3: Escalate unresolved decisions to Engineering Manager.
- Step 4: Record final decision in docs/PR comments.

No unresolved design debates should block critical bug fixes unless safety/security is impacted.

## 8) SLA for Internal Responses

- Production blocker: acknowledge within 15 minutes
- Critical bug: acknowledge within 1 hour
- Normal feature discussion: within 1 business day

## 9) Non-Negotiables

- Never communicate contract-breaking changes informally only.
- Never ask QA or frontend to “guess behavior.”
- Never merge undocumented behavior changes.
