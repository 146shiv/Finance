# Tech Stack

Backend stack for `Finance Data Processing and Access Control Backend`.

## 1) Node.js

### What it provides

- High-performance JavaScript runtime
- Event-driven, non-blocking I/O for API workloads
- Large ecosystem and tooling support

### Why chosen

- Team can use one language across backend and frontend.
- Strong fit for REST API services and I/O-heavy workloads.
- Fast iteration speed for product development.

### Trade-offs

- CPU-heavy tasks can block event loop if not designed correctly.
- Requires discipline around async patterns and performance monitoring.

## 2) Express.js

### What it provides

- Minimal and flexible HTTP framework
- Middleware-based architecture for auth/validation/logging
- Easy route composition and testability

### Why chosen

- Lightweight and widely adopted for production APIs.
- Works well with layered architecture (route -> controller -> service).
- Easy to enforce internal engineering standards.

### Trade-offs

- Less opinionated than full frameworks, so standards must be documented and enforced.
- More manual setup for advanced concerns (validation, docs, metrics).

## 3) MongoDB with Mongoose

### What it provides

- Document database suited for evolving schemas
- Aggregation pipelines for dashboard summaries
- Mongoose schema/model layer with validation and middleware hooks

### Why chosen

- Financial records and dashboard queries map well to document + aggregation model.
- Fast development with flexible schema evolution.
- Mongoose offers structure and consistency on top of MongoDB.

### Trade-offs

- Requires indexing discipline for query performance.
- Complex relational patterns can be harder than SQL systems.
- Aggregation pipelines can become complex and must be reviewed carefully.

## 4) REST APIs

### What it provides

- Predictable resource-oriented API contracts
- Broad tooling and client compatibility
- Simple versioning strategy (`/api/v1`)

### Why chosen

- Team familiarity and strong ecosystem support.
- Clear contract for frontend and QA collaboration.
- Easy to secure using JWT and middleware.

### Trade-offs

- Multiple endpoint calls may be needed for complex UI views.
- Strict contract governance needed to avoid drift.

## 5) ES Modules (`type: module`)

### What it provides

- Standardized JavaScript module system (`import`/`export`)
- Better alignment with modern Node.js patterns

### Why chosen

- Future-friendly and consistent with current JS ecosystem direction.
- Improves module clarity and interoperability in modern tooling.

### Trade-offs

- Some older CommonJS examples/packages require adaptation.
- Import path and tooling configuration must be consistent.

## 6) How Components Interact

1. Client calls REST endpoint.
2. Express route applies middlewares (auth/role/validation).
3. Controller parses request and calls service.
4. Service performs business logic and uses Mongoose models.
5. MongoDB persists/retrieves data.
6. Controller returns standardized success/error response.

## 7) Why This Stack as a Whole

- Fast delivery without sacrificing maintainability
- Strong support for RBAC and middleware-driven policies
- Scales from MVP to medium-complexity production workloads
- Enables predictable collaboration across backend, frontend, and QA
