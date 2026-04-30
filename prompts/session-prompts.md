# Session Prompts — 2026-04-30

## Context
Implementation of Jira ticket KAN-1 (LTI Talent Tracking System — Firebase backend + React frontend base).

---

## Prompts Used

### 1. Initial attempt (rejected)
```
@agent-task-project-tracker implementation jira card https://facundof1.atlassian.net/browse/KAN-1
```

### 2. Implementation prompt
```
@agent-task-project-tracker implement card jira https://facundof1.atlassian.net/browse/KAN-1 in AI4Devs-lab-ides-202603
```
**Result:** Agent fetched KAN-1, migrated backend from Prisma/PostgreSQL to Firebase Admin SDK (Firestore). Created `POST /users` and `GET /users` routes, removed docker-compose, deleted Prisma schema, updated `.env` with Firebase vars.

### 3. Create prompts folder
```
i need create folder with prompts used
```

### 4. Document prompts
```
create the file with the prompts used in this session
```
