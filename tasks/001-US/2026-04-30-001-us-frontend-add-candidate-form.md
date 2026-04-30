---
title: "001-US | Frontend: Add Candidate Form UI"
date: 2026-04-30
priority: High
status: [ ] Open
estimated_effort: 2 days
tags: [frontend, react, typescript, forms, accessibility, ux]
---

# 001-US | Frontend: Add Candidate Form UI

## Role

**Owner:** Frontend Engineer (Mid–Senior)
**Required expertise:** React 18+, TypeScript, form state management (React Hook Form or Formik), component libraries (e.g., MUI, shadcn/ui, or custom design system), responsive/accessible UI development.
**Stakeholders:** UX Designer, Product Owner, QA Engineer.

## Context

This task is part of User Story 001-US for the ATS (Applicant Tracking System): "Add Candidate to the System." The system currently lacks any UI flow for creating candidate records. Recruiters need an intuitive, accessible form that collects candidate profile data and initiates the submission workflow.

The form must be accessible from the main recruiter dashboard via a clearly visible CTA (button or link), and must work correctly across modern browsers (Chrome, Firefox, Safari, Edge) and device types (desktop, tablet, mobile).

**Current state:** No Add Candidate UI exists.
**Desired state:** A fully functional, validated, accessible multi-field form with success/error feedback.

## Instructions

### Step 1 — Dashboard Entry Point
- Add a prominent "Add Candidate" button/link to the main dashboard, positioned consistently with existing CTAs in the layout.
- On click, navigate to the Add Candidate form (separate route or modal — choose based on existing routing pattern in the codebase).

### Step 2 — Form Fields
Implement the following fields with appropriate input types:

| Field | Type | Required |
|---|---|---|
| First Name | Text input | Yes |
| Last Name | Text input | Yes |
| Email | Email input | Yes |
| Phone | Tel input | No |
| Address | Text input / Textarea | No |
| Education | Dynamic list (add/remove entries) | No |
| Work Experience | Dynamic list (add/remove entries) | No |
| CV Upload | File input (PDF/DOCX) | No |

- Education and Work Experience entries should support autocomplete suggestions where feasible (use a datalist or async combobox component).
- Each dynamic list entry should have an "Add" and "Remove" control.

### Step 3 — Form State Management
- Use React Hook Form (preferred) or an equivalent for state, validation triggering, and submission handling.
- Keep form state local; do not persist draft state to a global store unless the team has an existing pattern for it.

### Step 4 — Client-Side Validation (see also task 004)
- Mark required fields visually (asterisk + aria label).
- Validate on blur and on submit attempt:
  - Email: must match RFC-compliant email regex.
  - Required fields: must not be empty or whitespace-only.
  - Phone: optional, but if provided, validate format.
- Display inline error messages adjacent to each invalid field.
- Disable the submit button while submission is in progress.

### Step 5 — Submission Flow
- On submit, call the backend API endpoint (POST /api/candidates — see backend task 002).
- Show a loading indicator during the request.
- On success: display a success toast/banner and either redirect to the candidate detail page or reset the form.
- On network/server error: display a user-friendly error message (not raw error codes) with a retry option.

### Step 6 — Accessibility
- All form controls must have associated `<label>` elements or `aria-label` attributes.
- Keyboard navigation must work end-to-end (Tab, Shift+Tab, Enter to submit).
- Error messages must be announced by screen readers (use `role="alert"` or `aria-live`).
- Color contrast must meet WCAG 2.1 AA.

### Step 7 — Responsiveness
- Form layout must be usable on mobile (single column), tablet, and desktop.
- File upload control must be touch-friendly.

## Tone & Style

- Code should be written for a **senior audience** but commented at decision points where non-obvious choices are made.
- Use TypeScript strict mode; no `any` types.
- Follow the project's existing component/file naming conventions.
- CSS: use the existing styling solution (CSS Modules / Tailwind / styled-components — match what is already in the codebase).
- Component structure: prefer small, single-responsibility components composed together.

## Expected Output

- [ ] `AddCandidateButton` component integrated into the dashboard layout.
- [ ] `AddCandidateForm` page/component with all specified fields.
- [ ] Dynamic list sub-components for Education and Work Experience.
- [ ] Client-side validation logic (inline errors, required field marking).
- [ ] Success and error feedback UI (toast or banner).
- [ ] Unit tests for validation logic and form submission states (Jest + React Testing Library).
- [ ] Manual test checklist verified across Chrome, Firefox, Safari, Edge on desktop and mobile viewport.
- [ ] PR description includes screenshots of the form in default, error, and success states.
- [ ] No TypeScript errors or ESLint warnings introduced.
