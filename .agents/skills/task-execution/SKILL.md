---
name: task-execution
description: Execute, resume, and update existing tasks per checkpoints — use when a task number or task file is already given.
---

# Task Execution

## Purpose

Continue a task from where it stopped (`Progress Log` + `Handoff`) through checkpoints CP0–CP4, updating checklists/evidence/status without claiming completion prematurely.

## When to Use

- When the user orders execution of a numbered task (`tasks/<id>-*.md`) or a resume of pending work.
- When implementing/fixing/verifying per the plan in the task file.
- When updating task status, checkpoint evidence, or handoff context.

## When Not to Use

- Do not use to create a new task (use `task-planning`).
- Do not use for work that requires editing Spring Boot directly (frontend side only + record remaining integration).

## Required Reading

- `/AGENTS.md` (boundary + verification gates)
- The full task file (`tasks/<id>-<short-name>.md`) — including Task Status, Checkpoints, Progress Log, Handoff
- `tasks/TASK_TEMPLATE.md` (section/checkpoint/status definitions)
- The skills listed in the task's Required skills table (verify paths before reading) — usually from `skills/frontend/*.md`
- `docs/agent/project-map.md` and `docs/API_CONTRACT.md` (when touching endpoints/contracts)

## Repository Evidence

- Current tasks: `tasks/` holds only `README.md` (VERIFIED 2026-09-17) — the first real task will be `001`.
- Allowed task statuses: `TODO | IN_PROGRESS | BLOCKED | REVIEW | DONE | CANCELLED`
- Allowed checkpoints: `CP0 Planning | CP1 Impact Analysis | CP2 Implementation | CP3 Verification | CP4 Completion` with `PENDING | IN_PROGRESS | PASSED | FAILED | BLOCKED | NOT_APPLICABLE`.
- Real gates: `pnpm build` + `pnpm typecheck` (local); CI `.github/workflows/ci.yml` runs `lint` + `typecheck`; no test runner — the template Verification table therefore uses `NOT_APPLICABLE` for Unit Test.
- Never touch application source outside the task scope (`git diff --name-only` must stay within scope).

## Workflow

1. Read `AGENTS.md` + the task file + the skills the task requires.
2. Check Task Status, passed checkpoints (`PASSED` requires evidence), `Progress Log`, `Handoff`.
3. Inspect current sources (`git status`, files cited by the task) and reconcile actual vs documented progress — trust the working tree and fix the task record on mismatch.
4. Continue from the pending checkpoint (never skip CP1/CP3): implement step by step per `Implementation Plan`.
5. Update `Implementation Checklist` (check only items with evidence).
6. Record per-checkpoint evidence (changed files, command output, manual steps).
7. Run the verification required by the template (`pnpm build`, `pnpm typecheck` for runtime work; docs-only work records `NOT_APPLICABLE` with a reason) — never report a pass without running.
8. Update Task Status per transitions (e.g. `IN_PROGRESS` → `REVIEW` → `DONE`; backend-blocked → `BLOCKED` with `Blockers`).
9. Update `Handoff / Resume Context` so a new agent can continue without chat history.
10. Check `git status`/`git diff --stat` before finishing.

## Implementation Rules

- Stay within the task scope; do not touch unrelated areas (end-user RAG features are outside this console).
- CRUD screens must reuse `useCrudList`/`useCrudForm`/`usePagefecth` (exact spelling, do not "fix" the typo).
- Call the backend only via `useApi()`; no bare `$fetch`/`useFetch` for backend paths; never set `Authorization` manually; no duplicate toasts (the wrapper already toasts).
- Snowflake IDs: use `IdType`, never `Number(id)`; new IDs via `app/utils/snowflake.ts`.
- i18n: every string through `t()`/`$t()` with keys added to both `en` and `th`.
- SSR-safe: no browser globals in SSR paths without guards.
- Backend-blocked work must not be marked `DONE` — record completed frontend work + remaining integration and keep `BLOCKED` (or `REVIEW` when the frontend is done and awaiting verification).

## Anti-Patterns

- Do not mark a checkpoint `PASSED` without evidence; do not mark `DONE` while `Verification Results` still shows `NOT_RUN`.
- Do not invent fields/permission contracts just to make the build pass.
- Do not suppress typecheck errors with `@ts-ignore` (3 legacy sites in `useAiChat.ts` — do not add more).
- Do not run repo-wide `eslint` as task verification; do not run the migration (`pnpm migrate:mysql:pg`) in a frontend task.
- Do not claim backend integration is verified without devtools/OpenAPI evidence.

## Verification

- The task's `Verification Results` table must be filled with real values (`PASSED`/`FAILED`/`BLOCKED`/`NOT_APPLICABLE` with command + evidence) — never leave the whole table as `NOT_RUN` on completion.
- `pnpm build` + `pnpm typecheck` must actually run for runtime-affecting work (never report them as passing without execution).
- `git diff --stat` must match the scope; no out-of-scope files.

## Completion Criteria

- Every acceptance criterion passes (or records an exception + reason).
- Every relevant checkpoint is `PASSED` (or `NOT_APPLICABLE` with a reason), each with evidence.
- The final Task Status is correct (`DONE` only with no pending backend blocker; otherwise `BLOCKED`).
- `Handoff` is updated — a new agent can resume immediately.
