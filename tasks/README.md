# Tasks — Nuxt Admin Console

> Task files are work specifications — the presence of a file does not mean the work is done. Always check Task Status + Checkpoints + `git diff`.

## Naming Convention

```text
tasks/<id>-<short-name>.md   e.g. tasks/001-user-list.md
```

- `<id>` is a 3-digit sequential number (`001`, `002`, `003`, …). Never reuse. Never renumber.
- Create from `tasks/TASK_TEMPLATE.md` only (canonical — do not use any other template).
- History: **no numbered tasks exist yet** (VERIFIED 2026-09-17 — this directory holds only `README.md` + `TASK_TEMPLATE.md`).

## Task Creation Workflow (see `.agents/skills/task-planning/SKILL.md`)

1. Read `AGENTS.md` + `tasks/TASK_TEMPLATE.md` + this file.
2. Check the index table below for the next free number.
3. Inspect the existing implementation + select the required skills (verify paths first).
4. Create the file from the template with all 15 sections filled (status starts at `TODO`).
5. Add a row to the index table below.

## Task Execution Workflow (see `.agents/skills/task-execution/SKILL.md`)

1. Read `AGENTS.md` + the task file + the skills listed in the task.
2. Check status/checkpoints/progress log/handoff and reconcile with `git status`.
3. Continue from the pending checkpoint (never skip CP1/CP3).
4. Update checklist + checkpoint evidence + verification table.
5. Update status + handoff (so a new agent can resume immediately).

## Status Definitions

| Status | Meaning |
|---|---|
| `TODO` | Created, not started |
| `IN_PROGRESS` | Actively being worked on |
| `BLOCKED` | Blocked by a blocker (backend/dependency) — see §12 of the task |
| `REVIEW` | Frontend done, awaiting review/verification |
| `DONE` | All acceptance + verification complete (no pending backend blocker) |
| `CANCELLED` | Cancelled |

Transitions: `TODO → IN_PROGRESS → REVIEW → DONE`; `→ BLOCKED → IN_PROGRESS`; `TODO → CANCELLED`; `REVIEW → IN_PROGRESS`

## Checkpoint Definitions (CP0–CP4)

| Checkpoint | Name | Exit Criteria |
|---|---|---|
| CP0 | Planning | task has all 15 sections |
| CP1 | Impact Analysis | §4–§5 + §11 complete |
| CP2 | Implementation | code matches plan, no out-of-scope files |
| CP3 | Verification | §10 complete (gates actually executed) |
| CP4 | Completion | §9 + §14 + §15 complete |

Checkpoint statuses: `PENDING | IN_PROGRESS | PASSED | FAILED | BLOCKED | NOT_APPLICABLE` (never `PASSED` without evidence).

## Resume Instructions

1. Read `AGENTS.md` → `.agents/skills/task-execution/SKILL.md` → the task file (§13–§14).
2. Check `git status`/`git diff --stat`.
3. Continue from `Next Action` in §14.

## Task Index

| Task ID | Title | Status | Dependencies | File |
|---|---|---|---|---|
| — | — | — | — | — |

*(No tasks yet — add a row when the first task is created.)*
