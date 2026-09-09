# AGENTS.md — Frontend Repository

## Project

Frontend application using:

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt UI 4
- SSR

The application source directory is `app/`.

## Core Working Rules

- Make the smallest change required for the task.
- Follow existing project patterns before introducing new abstractions.
- Do not refactor unrelated code.
- Do not add dependencies unless required.
- Preserve SSR compatibility.
- Do not add backend/database responsibilities to Nitro unless explicitly required.
- Do not introduce new `any`.
- Do not change API contracts unless the task requires it.

## Required Reading

For frontend implementation tasks, read:

- `skills/frontend/SKILL.md`

Then read only the additional files relevant to the task:

- Backend API calls, uploads, downloads, SSE → `skills/frontend/API.md`
- Authentication, session, refresh, RBAC → `skills/frontend/AUTH.md`
- Components, pages, Nuxt UI, styling, dark mode, i18n → `skills/frontend/UI.md`
- State, forms, zod, TypeScript types → `skills/frontend/TYPES_VALIDATION.md`

Reference documentation is on-demand:

- Endpoint/request/response behavior → `docs/API_CONTRACT.md`
- Known unresolved repository questions → `docs/FRONTEND_OPEN_QUESTIONS.md`
- Known implementation traps → `docs/FRONTEND_FOOTGUNS.md`

Do not read unrelated skill/reference files unless required by the current task or by directly related code discovered during implementation.

## Validation

Use the narrowest useful validation first.

Typical frontend validation commands are documented in `skills/frontend/SKILL.md`.
Do not run backend commands in this repository.
