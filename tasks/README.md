# Frontend Tasks

This directory contains concrete implementation tasks for the frontend.

This app is the platform's **internal administration console** (administrators and
authorized staff only).

Task files are implementation specifications. Their presence here does **not** mean
the work has been implemented or verified — each task's `Progress Checklist` and
`Resume State` are the implementation-state source of truth, and must be confirmed
against actual repository state.

## Naming Convention

```text
<number>-<short-task-name>.md
```

Numbers are sequential and must be unique. List this directory and take the next free
number before creating a task.

Use:

```text
/frontend/TASK_TEMPLATE.md
```

when creating a new frontend-only task. If the task adds or changes a backend
contract it is cross-stack — use `/TASK_TEMPLATE.md` instead and save it in the
repository location appropriate to the feature.

---

## Starting a Task

Read, in order:

```text
/AGENTS.md
/frontend/AGENTS.md
/frontend/skills/frontend/SKILL.md
frontend/tasks/<this-task>.md
```

Then use `/frontend/SKILLS.md` to load only the skill files the task actually needs.

Inspect the existing implementation and the backend contract at `/backend` before
editing. Do not invent API fields, status codes or permissions.

---

## Current Tasks

| Task | Status | Summary |
| --- | --- | --- |


`pnpm build` and `pnpm typecheck` are the gates for every frontend task. `pnpm lint` is
not a gate. There is no test runner and no CI workflow, so review your diff against
`skills/frontend/` rather than relying on tooling for style.
