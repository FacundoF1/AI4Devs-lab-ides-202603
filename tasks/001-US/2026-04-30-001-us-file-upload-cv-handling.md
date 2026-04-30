---
title: "001-US | File Upload: CV Upload Handling (PDF/DOCX)"
date: 2026-04-30
priority: High
status: [ ] Open
estimated_effort: 1 day
tags: [backend, file-upload, storage, security, pdf, docx]
---

# 001-US | File Upload: CV Upload Handling (PDF/DOCX)

## Role

**Owner:** Backend Engineer (Mid–Senior) with infrastructure/storage exposure.
**Required expertise:** Multipart form handling (multer or busboy), cloud object storage (S3-compatible, GCS, or Azure Blob), MIME type validation, virus scanning integration (optional but recommended), signed URL generation.
**Stakeholders:** Backend API engineer (task 002), Security engineer (task 005), DevOps (storage bucket config).

## Context

As part of the Add Candidate feature, recruiters must be able to attach a CV document (PDF or DOCX) to a candidate record. This task covers the complete file upload lifecycle: receiving the file on the backend, validating it, storing it securely in object storage, and returning a stable URL to be persisted on the candidate record.

Files must never be stored on the application server's local filesystem in production. The storage solution must be durable, access-controlled, and capable of generating time-limited download URLs for internal use.

**Current state:** No file upload infrastructure exists in the ATS.
**Desired state:** A reusable upload service that accepts a CV file, validates it, stores it, and returns a permanent (or CDN-backed) reference URL.

## Instructions

### Step 1 — Upload Middleware Configuration

- Use `multer` (or `busboy` for streaming) to parse `multipart/form-data`.
- Configuration constraints:
  - **Allowed MIME types:** `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
  - **Max file size:** 10 MB (make this configurable via environment variable `MAX_CV_FILE_SIZE_MB`).
  - **Storage engine:** use `memoryStorage` (buffer) in production so the file is never written to disk before upload to cloud storage.
- Reject files that fail MIME or size checks with `400 Bad Request` before any storage call is made.

### Step 2 — MIME Type Validation (Double-Check)

- Do not trust the `Content-Type` header alone — a malicious actor can spoof it.
- Use `file-type` (npm) or `magic-bytes.js` to read the file's magic bytes and confirm the actual format is PDF or DOCX.
- Reject the upload if the declared MIME type does not match the detected type.

### Step 3 — Object Storage Upload

- Implement a `StorageService` with a single method: `uploadCandidateCV(file: Buffer, originalName: string, candidateId: string): Promise<string>` returning the stored file URL.
- Storage key pattern: `candidates/{candidateId}/cv/{uuid}-{sanitized-filename}` (strip path traversal characters from the original filename).
- Set the object's `Content-Type` and `Content-Disposition` metadata correctly.
- Object must NOT be publicly readable by default — use private ACL / bucket policy.
- Generate a pre-signed URL (expiry: configurable, default 1 hour) when the file needs to be served to the recruiter. Store only the permanent object key in the database, not the signed URL.
- Support at minimum AWS S3 (or an S3-compatible store like MinIO for local dev). Abstract behind an interface so the provider can be swapped.

### Step 4 — Local Development Support

- For local development, provide a MinIO docker-compose service or a local filesystem adapter behind the same `StorageService` interface.
- Document in the README how to configure local storage.

### Step 5 — Error Handling

- If the storage upload fails after the candidate record has already been inserted, log the error with the candidate ID and return the candidate record with `cvFileUrl: null`. Do not fail the entire candidate creation request for a file upload failure — surface a non-blocking warning in the API response.
- Implement retry logic (max 2 retries with exponential backoff) for transient storage errors.

### Step 6 — (Recommended) Virus Scanning

- If the team has a ClamAV or cloud-native scanning service available, integrate a scan step between receipt and storage.
- If not available now, add a `TODO` comment and a feature flag placeholder so it can be enabled later without a structural refactor.

## Tone & Style

- The `StorageService` must be an injectable class/module (compatible with NestJS DI or Express DI pattern in use).
- No hardcoded bucket names, regions, or credentials — all via environment variables with clear names (`CV_STORAGE_BUCKET`, `CV_STORAGE_REGION`, `CV_STORAGE_ENDPOINT`).
- All configuration values must be validated at app startup (fail fast if required env vars are missing).
- Comment non-obvious decisions (e.g., why memoryStorage is used over diskStorage).

## Expected Output

- [ ] `StorageService` with S3 upload implementation and local dev adapter.
- [ ] Multer middleware configured with MIME + size constraints.
- [ ] Magic-byte MIME validation utility.
- [ ] Signed URL generation method for download use.
- [ ] Environment variable documentation (`.env.example` updated).
- [ ] Unit tests for `StorageService` (mock the S3 client).
- [ ] Integration test: upload a real PDF and DOCX, confirm stored key returned; upload a disallowed type, confirm 400.
- [ ] docker-compose entry for MinIO (local dev).
- [ ] PR description explains storage key naming convention and access control decisions.
