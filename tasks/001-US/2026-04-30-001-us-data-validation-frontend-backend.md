---
title: "001-US | Data Validation: Frontend + Backend Candidate Form"
date: 2026-04-30
priority: High
status: [ ] Open
estimated_effort: 1 day
tags: [validation, frontend, backend, typescript, forms, security]
---

# 001-US | Data Validation: Frontend + Backend Candidate Form

## Role

**Owner:** Fullstack Engineer (Mid–Senior), or split between Frontend and Backend engineers working in coordination.
**Required expertise:** Frontend — React Hook Form + Yup/Zod resolver; Backend — class-validator or Zod, Express middleware or NestJS pipes.
**Stakeholders:** Frontend engineer (task 001), Backend engineer (task 002), Security engineer (task 005).

## Context

Validation for the Add Candidate feature must be implemented at two layers: client-side (immediate UX feedback, reduce unnecessary server round-trips) and server-side (authoritative, non-bypassable). Both layers must enforce the same business rules and share a single source of truth schema wherever possible.

This task defines, documents, and implements the full validation rule set for the candidate creation form.

**Key principle:** Client-side validation is a UX convenience. Server-side validation is a security requirement. Never trust client-side alone.

## Instructions

### Step 1 — Define the Canonical Validation Schema

Create a shared validation schema (e.g., using Zod) that can be consumed by both the frontend and the backend. If the project structure does not allow code sharing (separate repos), implement equivalent schemas in both layers.

**Field rules:**

| Field | Rule | Error Message |
|---|---|---|
| firstName | Required, non-empty after trim, max 100 chars | "First name is required" / "Max 100 characters" |
| lastName | Required, non-empty after trim, max 100 chars | "Last name is required" / "Max 100 characters" |
| email | Required, valid RFC 5321 format, max 254 chars | "Valid email is required" |
| phone | Optional; if provided: E.164 format or local format TBD with product | "Invalid phone number format" |
| address | Optional, max 500 chars | "Max 500 characters" |
| education[].institution | Optional, max 200 chars | "Max 200 characters" |
| education[].degree | Optional, max 200 chars | "Max 200 characters" |
| education[].year | Optional, 4-digit year between 1900 and current year + 10 | "Invalid year" |
| workExperience[].company | Optional, max 200 chars | "Max 200 characters" |
| workExperience[].role | Optional, max 200 chars | "Max 200 characters" |
| workExperience[].startDate | Optional, valid date, not in the future | "Invalid start date" |
| workExperience[].endDate | Optional, valid date, must be >= startDate if provided | "End date must be after start date" |
| cvFile | Optional; if provided: MIME type PDF or DOCX, size <= 10 MB | "File must be PDF or DOCX, max 10MB" |

### Step 2 — Frontend Validation Implementation

- Integrate the Zod (or Yup) schema as a React Hook Form resolver.
- Trigger validation on `onBlur` for each field individually.
- Trigger full-form validation on submit attempt before any network call is made.
- Display error messages:
  - Inline, immediately below the relevant input field.
  - Red border on the invalid field.
  - Summary error count at the top of the form (optional, but recommended for accessibility: "3 errors found").
- Prevent form submission if any required-field or format validation fails.
- For the CV file input: validate size and MIME type client-side using the File API before the user attempts to submit.

### Step 3 — Backend Validation Implementation

- Create a `CreateCandidateDto` class or Zod schema that maps exactly to the frontend schema.
- Apply validation as a middleware/pipe on the `POST /api/v1/candidates` route — before any service or database logic runs.
- On validation failure, return `400 Bad Request` with a structured body:
  ```json
  {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": {
      "email": ["Valid email is required"],
      "firstName": ["First name is required"]
    }
  }
  ```
- Sanitize string fields (trim whitespace) before validation and before persisting.
- Validate the `cvFile` MIME type server-side using magic bytes (see task 003), independent of the Content-Type header.

### Step 4 — Email Uniqueness Check

- After format validation passes, check the database for an existing candidate with the same email.
- Return `409 Conflict` (not `400`) with message: `"A candidate with this email already exists"`.
- On the frontend, handle `409` specifically and display the error on the email field.

### Step 5 — Schema Synchronization Strategy

- If a shared schema is used (e.g., a `packages/shared` monorepo package), document how it is imported on both sides.
- If schemas are duplicated, add a comment in both files referencing the other, and add a lint rule or CI check to detect drift (e.g., a script that diffs the rule sets).

## Tone & Style

- Validation rules must be the single source of truth — define them once and reference them, never duplicate magic values (e.g., max lengths) across files.
- Error messages must be human-readable and actionable (tell the user what to fix, not what went wrong internally).
- All validation logic must be unit-testable in isolation from the framework (pure functions or schema parse calls).

## Expected Output

- [ ] Canonical Zod/Yup schema with all field rules documented.
- [ ] Frontend resolver integration with React Hook Form (all fields validated, errors displayed correctly).
- [ ] Backend DTO/pipe with identical rule set applied before service logic.
- [ ] Sanitization (trim) applied to all string fields server-side.
- [ ] `409` handling for duplicate email on both client and server.
- [ ] Unit tests for the schema: one test per rule, covering valid and invalid cases.
- [ ] Frontend integration tests: verify error messages appear for each invalid field.
- [ ] Backend integration tests: verify 400 body structure for each invalid field and 409 for duplicate email.
- [ ] Schema synchronization documentation or CI check in place.
