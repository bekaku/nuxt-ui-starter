---
name: task-planning
description: Create a new task file from tasks/TASK_TEMPLATE.md for the Nuxt admin console — use when planning work before implementing.
---

# Task Planning

## Purpose

Create a resumable, cross-session work specification from `tasks/TASK_TEMPLATE.md` based on real source code in this repo — not guesswork.

## When to Use

- When the user asks for a new task, feature plan, bug fix, or refactor.
- When a requirement must be converted into a checklist, checkpoints (CP0–CP4), and acceptance criteria.
- When the work touches the backend contract (requires `External Backend Dependencies`).

## When Not to Use

- Do not use to modify application source — implementation belongs to `task-execution`.
- Do not use for backend work directly (Spring Boot lives in a separate repo, `BACKEND_NOT_ACCESSIBLE`).

## Required Reading

- `/AGENTS.md` (repository rules and architectural boundary)
- `tasks/TASK_TEMPLATE.md` (canonical template — 15 sections)
- `tasks/README.md` (naming, statuses, used task numbers)
- `docs/agent/project-map.md` (architecture map)
- Only the relevant domain skills (selected via `SKILLS.md`): `skills/frontend/CRUD.md`, `skills/frontend/API.md`, `skills/frontend/AUTH.md`, `skills/frontend/UI.md`, `skills/frontend/TYPES_VALIDATION.md`

## Repository Evidence

- Real structure (VERIFIED 2026-09-17): `app/` is the srcDir; `app/composables/` has 28 files; `app/pages/` has 13 top entries; `app/layouts/` has 5 files (`ai.vue`, `chat.vue`, `default.vue`, `empty.vue`, `feed.vue`); `app/api/useFavoriteMenuApi.ts`; `server/api/mock/*` + `meta.ts`; `server/database/` is migration tooling only.
- The only allowed API client: `app/composables/useApi.ts`; session bootstrap: `app/composables/useAuth.ts` (`fetchMe` → `GET /api/appUser/currentUserData`).
- Guards: `app/middleware/01.auth.global.ts` → `02.check-permit.global.ts`; permissions via `app/composables/useRbac.ts` + `app/plugins/rbac.ts` (`v-rbac`).
- Hand-maintained types in `app/types/` (`common.ts`, `models.ts` — `IdType = bigint | string | null | undefined` at `models.ts:7`); i18n in `i18n/locales/en+th/` (5 namespaces).
- Gates: `pnpm build`, `pnpm typecheck`; CI `.github/workflows/ci.yml` runs `pnpm run lint` + `pnpm run typecheck` (no test runner).

## Workflow

1. Read `AGENTS.md` and `tasks/TASK_TEMPLATE.md`.
2. Check `tasks/` for used numbers (currently only `README.md` — VERIFIED 2026-09-17) and assign the next one (`001`, `002`, …).
3. Analyze the user requirement; separate frontend-only work from backend-contract work.
4. Inspect the existing implementation (pages/components/composables/types/i18n per template §4).
5. Discover skills via `SKILLS.md` + `docs/agent/skills-index.md`; select only the files needed.
6. Verify every referenced skill path exists on disk.
7. Create the task from the template; fill Metadata/Status (start at `TODO`)/Priority/Type.
8. Tailor checklists/checkpoints to the task; remove non-applicable categories.
9. Define testable acceptance criteria and verification methods (`pnpm build`/`pnpm typecheck` + manual steps).
10. For contract work, fill `External Backend Dependencies` (`NOT_AVAILABLE`/`NOT_VERIFIED`, never invent task IDs).
11. Update the task index table in `tasks/README.md`.

## Implementation Rules

- Create files only at `tasks/<id>-<short-name>.md` (e.g. `tasks/001-foo-list.md`). Never create them at the root.
- Task statuses allowed: `TODO | IN_PROGRESS | BLOCKED | REVIEW | DONE | CANCELLED` (see transitions in the template).
- Checkpoints use `CP0–CP4` with `PENDING | IN_PROGRESS | PASSED | FAILED | BLOCKED | NOT_APPLICABLE` — never `PASSED` without evidence.
- Cite source paths with line numbers where available (e.g. `app/composables/useApi.ts:37-258`).
- Backend changes must be written as a **proposed contract**, not as existing behavior.
- Do not modify `app/`/`server/`/`shared/`/`i18n/` during planning unless explicitly requested.

## Anti-Patterns

- Do not invent endpoints/fields/permissions/status codes missing from `app/types/`, call sites, or `docs/API_CONTRACT.md`.
- Do not reference `/backend` source paths (no such directory in this workspace).
- Do not load all 6 skill files every time — select only the relevant ones.
- Do not mark `DONE` prematurely; a new task starts at `TODO` (or `IN_PROGRESS` when work starts immediately).
- Do not create sample/placeholder tasks without a real requirement.

## Verification

- Open the created task file and confirm it has all 15 sections per `tasks/TASK_TEMPLATE.md`.
- Confirm every path in the Required skills table exists (`ls` or `read`).
- Confirm `tasks/README.md` has a row for the new task.
- Check `git status` shows only the intended files (`tasks/<id>-*.md` + `tasks/README.md`).

## Completion Criteria

- The `tasks/<id>-<short-name>.md` file exists with real content (not a placeholder).
- Metadata/Status/Checkpoints/Acceptance/Verification/Backend deps/Handoff are complete.
- The index table in `tasks/README.md` is updated.
- No application source was modified without instruction.
