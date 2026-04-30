---
title: "001-US | Security: Data Privacy and Input Sanitization for Add Candidate"
date: 2026-04-30
priority: High
status: [ ] Open
estimated_effort: 1 day
tags: [security, privacy, sanitization, auth, gdpr, backend, devops]
---

# 001-US | Security: Data Privacy and Input Sanitization for Add Candidate

## Role

**Owner:** Security-focused Backend Engineer or Application Security Engineer (Senior).
**Required expertise:** OWASP Top 10, input sanitization, JWT authentication, HTTPS/TLS, PII data handling, GDPR fundamentals, secrets management, HTTP security headers.
**Stakeholders:** All feature engineers (tasks 001–004), Legal/Compliance, DevOps.

## Context

The Add Candidate feature collects and stores Personally Identifiable Information (PII): full name, email, phone, address, work history, and CV documents. This data must be handled with strict security and privacy controls from the moment it leaves the user's browser to when it is persisted in storage.

This task does not build new features in isolation — it defines, implements, and audits the security controls that must be in place before the feature is considered production-ready. It cuts across the frontend, API, database, and infrastructure layers.

**Regulatory context:** Candidate data is subject to GDPR (if EU candidates are processed) and potentially local labor data protection laws. At minimum, data must be encrypted at rest and in transit, access must be authenticated and role-scoped, and there must be an audit trail of who created each record.

## Instructions

### Step 1 — Transport Security

- All API communication must occur over HTTPS (TLS 1.2 minimum, TLS 1.3 preferred).
- Enforce HTTPS at the infrastructure level (load balancer / reverse proxy redirect). Do not rely on application-level redirect alone.
- Verify HSTS header is set: `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- Verify no sensitive data (PII, tokens) appears in URLs, query strings, or server logs.

### Step 2 — Authentication & Authorization

- The `POST /api/v1/candidates` endpoint must require a valid JWT issued by the ATS auth service.
- Verify token signature, expiry (`exp`), issuer (`iss`), and audience (`aud`) on every request.
- Authorize only users with role `recruiter` or `admin`. Return `403 Forbidden` for authenticated users with insufficient roles.
- Implement token validation as a reusable middleware/guard, not inline in the route handler.
- Refresh token handling: do not accept expired tokens even for "grace period" scenarios.

### Step 3 — Input Sanitization (XSS Prevention)

- Strip or encode HTML/script tags from all string inputs before persistence. Use a library such as `DOMPurify` (frontend) and `sanitize-html` or equivalent (backend).
- Do not render stored candidate data as raw HTML anywhere in the application without re-sanitizing at render time.
- Apply sanitization after validation (sanitize valid input, do not sanitize to make invalid input pass).
- Filenames from CV uploads must be sanitized: strip path traversal sequences (`../`, `..\\`), special characters, and enforce a max length of 100 characters.

### Step 4 — SQL / NoSQL Injection Prevention

- All database queries must use the ORM's parameterized query interface. Never concatenate user input into query strings.
- If raw queries are unavoidable (e.g., full-text search), use parameterized prepared statements exclusively.
- Review the `education` and `workExperience` JSON fields: if stored as serialized JSON, validate the structure schema before persisting. Do not `JSON.parse` untrusted input without schema validation.

### Step 5 — File Upload Security

- Enforce MIME type validation via magic bytes (not header alone) — see task 003.
- Set a hard file size limit at the infrastructure level (nginx `client_max_body_size` or equivalent) in addition to the application-level limit.
- Store uploaded files in a private object storage bucket. Never expose a direct public URL to the CV file; generate time-limited signed URLs on demand.
- Scan uploaded files for malware if a scanning service is available (ClamAV, AWS Macie, etc.).
- The storage key must not contain the original filename directly — use a UUID prefix to prevent enumeration.

### Step 6 — Data Encryption at Rest

- Confirm the database uses encryption at rest (most managed DB services do by default — verify and document).
- For file storage, enable server-side encryption on the bucket (SSE-S3 or SSE-KMS).
- Do not store CV file content in the database (store only the object storage key/URL).

### Step 7 — PII Data Handling & Audit Trail

- Log candidate creation events to an audit log (separate from application logs): `{ timestamp, action: "CANDIDATE_CREATED", actorId, candidateId }`.
- Do not log PII values (email, phone, name) in application logs — log only IDs and non-sensitive metadata.
- Ensure the `createdBy` field on the candidate record links to the authenticated recruiter's user ID for auditability.
- Document the data retention policy in the codebase (even if just a `DATA_RETENTION.md` placeholder) — this is required for GDPR compliance groundwork.

### Step 8 — HTTP Security Headers

Verify the following response headers are set on all API responses:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: (appropriate policy for the app)
Referrer-Policy: strict-origin-when-cross-origin
```

Use `helmet` (Express) or equivalent middleware to set these automatically.

### Step 9 — Rate Limiting

- Apply rate limiting to the `POST /api/v1/candidates` endpoint to prevent abuse: e.g., max 20 requests per minute per authenticated user.
- Use `express-rate-limit` or equivalent. Store rate limit state in Redis if the app is multi-instance.

### Step 10 — Secrets Management

- No credentials, bucket names, or signing keys in source code or committed `.env` files.
- Use environment variables loaded from a secrets manager (AWS Secrets Manager, Vault, or platform-native secret store).
- Rotate storage signing keys and JWT secrets on a documented schedule.

## Tone & Style

- Security measures must be documented with the rationale ("why"), not just implementation ("what"), so future engineers understand the risk being mitigated.
- Every security control should be testable — write at least one automated test per control (e.g., a test that verifies the endpoint returns 401 without a token).
- When in doubt, apply the principle of least privilege: grant only the access that is required.

## Expected Output

- [ ] HTTPS enforcement verified and documented (infrastructure config or ADR).
- [ ] JWT auth middleware implemented and applied to the candidate creation endpoint.
- [ ] Role-based authorization guard with `recruiter` / `admin` roles.
- [ ] Input sanitization applied to all string fields (server-side) and file names.
- [ ] Parameterized query audit: confirm no raw string interpolation in DB calls.
- [ ] File upload security: MIME validation, size limit, private bucket, signed URL generation.
- [ ] Audit log entry on candidate creation (actor, candidate ID, timestamp).
- [ ] HTTP security headers configured via middleware.
- [ ] Rate limiting applied to the POST endpoint.
- [ ] Security-focused test suite: unauthorized request (401), forbidden role (403), XSS payload rejected, oversized file rejected, disallowed MIME rejected.
- [ ] `.env.example` updated with all new required variables, no real values committed.
- [ ] A brief `SECURITY_NOTES.md` or inline ADR documenting decisions made (PII logging policy, file storage access model, retention placeholder).
