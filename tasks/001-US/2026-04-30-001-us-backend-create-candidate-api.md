---
title: "001-US | Backend: Create Candidate REST API Endpoint"
date: 2026-04-30
priority: High
status: [ ] Open
estimated_effort: 1.5 days
tags: [backend, api, rest, nodejs, express, database, typescript]
---

# 001-US | Backend: Create Candidate REST API Endpoint

## Role

**Owner:** Backend Engineer (Mid–Senior)
**Required expertise:** Node.js, TypeScript, Express (or NestJS if already in use), ORM (Prisma / TypeORM / Sequelize), relational or document database, REST API design, multipart form handling.
**Stakeholders:** Frontend Engineer (consumes the API), DBA/DevOps (schema migrations), Security Engineer.

## Context

This task implements the server-side logic for User Story 001-US. The frontend form (task 001-US-FE) will submit candidate data via HTTP POST. The backend must receive, validate, persist, and return a structured response for each candidate creation request.

The ATS stores candidate records that will later be linked to job postings and selection pipeline stages. The data model must be designed with extensibility in mind (e.g., future addition of pipeline stage references, recruiter assignment, tags).

**Current state:** No candidate entity or API endpoint exists.
**Desired state:** A secure, validated POST endpoint that persists a new candidate record and returns a canonical candidate DTO.

## Instructions

### Step 1 — Data Model / Schema

Define the `Candidate` entity with at minimum the following fields:

```
id             UUID (PK, auto-generated)
firstName      String (required)
lastName       String (required)
email          String (required, unique)
phone          String (nullable)
address        String (nullable)
education      JSON / relation table (nullable)
workExperience JSON / relation table (nullable)
cvFileUrl      String (nullable) — populated after file upload (task 003)
createdAt      DateTime (auto)
updatedAt      DateTime (auto)
createdBy      UUID FK → User (recruiter who added the candidate)
```

- If using a relational DB: model `Education` and `WorkExperience` as child tables with a FK to `Candidate`, or use a JSON column if the DB supports it and the team agrees.
- Generate and run the migration before merging.

### Step 2 — API Endpoint

```
POST /api/v1/candidates
Content-Type: multipart/form-data   (to support file upload in the same request)
Authorization: Bearer <JWT>
```

**Request body fields:** firstName, lastName, email, phone (optional), address (optional), education (optional, JSON array), workExperience (optional, JSON array), cvFile (optional, binary).

**Success response — 201 Created:**
```json
{
  "id": "uuid",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1-555-0100",
  "address": "123 Main St",
  "education": [...],
  "workExperience": [...],
  "cvFileUrl": "https://storage.example.com/cv/uuid.pdf",
  "createdAt": "2026-04-30T12:00:00Z"
}
```

**Error responses:**
- `400 Bad Request` — validation failure (body includes field-level error details).
- `409 Conflict` — email already registered.
- `401 Unauthorized` — missing or invalid JWT.
- `500 Internal Server Error` — unexpected failure (log full error server-side, return generic message to client).

### Step 3 — Request Handling

- Parse `multipart/form-data` using `multer` (or equivalent).
- Delegate file storage to the upload service (task 003); the endpoint should call that service and store the returned URL in `cvFileUrl`.
- Wrap the database write and file upload in a transaction or compensating pattern: if DB insert succeeds but file upload fails, roll back or mark the record incomplete (define this behavior with the team).

### Step 4 — Server-Side Validation (see also task 004)

- Validate all fields before touching the database.
- Email: format validation + uniqueness check.
- Required fields: non-empty after trimming.
- Reject unknown fields (strip or 400 — decide per project convention).
- Return structured validation errors per field:
  ```json
  { "errors": { "email": "Invalid email format", "firstName": "Required" } }
  ```

### Step 5 — Authentication & Authorization

- Endpoint must require a valid JWT (recruiter or admin role).
- Extract `userId` from the token and set `createdBy` on the candidate record.
- Reject requests with expired or tampered tokens with `401`.

### Step 6 — Logging & Observability

- Log each request at INFO level: method, path, authenticated user ID, response status, duration.
- Log validation errors at WARN level with field names (no PII values).
- Log unexpected errors at ERROR level with stack trace.

## Tone & Style

- TypeScript strict mode throughout.
- Service/controller separation: controller handles HTTP concerns only; all business logic lives in a `CandidateService`.
- Follow existing project layering conventions (routes → controller → service → repository).
- All exported functions and classes must have JSDoc comments describing purpose, params, and return type.
- No raw SQL unless the ORM cannot express the query — and if so, use parameterized queries only.

## Expected Output

- [ ] `Candidate` database schema + migration file.
- [ ] `POST /api/v1/candidates` route, controller, service, and repository.
- [ ] Input DTO type / class with validation decorators (class-validator or Zod).
- [ ] Response DTO type (no internal fields like passwords or internal IDs exposed).
- [ ] Unit tests for `CandidateService` (mock the repository).
- [ ] Integration test for the POST endpoint (real DB or test container): happy path, validation error, duplicate email, unauthorized.
- [ ] Postman/Insomnia collection or OpenAPI spec entry for the endpoint.
- [ ] PR description documents the data model and any migration steps required.
