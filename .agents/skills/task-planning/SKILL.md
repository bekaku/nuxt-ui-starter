---
name: task-planning
description: Write a new numbered task specification tasks/<id>-<short-name>.md from tasks/TASK_TEMPLATE.md when the user asks for a task, spec, or implementation plan to be written down. Produces documentation only — no application code. Do not use for an ordinary "implement X" request that has no task file.
---

# Task planning

Output: one new file `tasks/<id>-<short-name>.md` plus one new row in `tasks/README.md`.
Nothing under `app/`, `server/`, `shared/`, or `i18n/` changes during planning.

## When to use

- "Create a task / spec / plan for …", "write this up so another agent can implement it".
- Splitting a large change into resumable work.

Not for: implementing directly (use the domain skill), or continuing an existing task (use `task-execution`).

## Read first

1. `AGENTS.md`.
2. `tasks/TASK_TEMPLATE.md` (the only allowed template — 15 sections) and `tasks/README.md` (index + status rules).
3. The source files the task will touch — the plan must name real paths.
4. `docs/agent/skills-index.md` to choose domain skills.

## Steps

1. **Pick the ID**: `ls tasks/` → take the next unused 3-digit number (`001`, `002`, …). Never reuse or renumber.
   Name: `tasks/<id>-<kebab-short-name>.md` (e.g. `tasks/001-foo-crud.md`).
2. **Copy the template** in full, then fill it. Keep all 15 section headings; write
   `NOT_APPLICABLE — <reason>` in a section that does not apply instead of deleting it.
3. **Fill the sections that matter most for the implementer**:
   | Section | Write |
   |---|---|
   | §1 Metadata | ID, `Status: TODO`, Task Type, today's date in Created/Updated |
   | §2 Objective | One-paragraph goal, expected outcome, explicit Out of Scope |
   | §3 Required Reading | Required Skills table with real paths only: `.agents/skills/<name>/SKILL.md` (`nuxt-frontend`, `crud-module`, `api-integration`); supporting `skills/frontend/*.md` only if needed |
   | §4 Existing Implementation | Real files to inspect: pages, components, composables, `app/api/`, types, middleware, i18n files, endpoints |
   | §5 Scope and Impact | Tick affected areas; list what must stay compatible (API shapes, permission codes, i18n keys) |
   | §6 Implementation Plan | Ordered steps, each = one file or one verifiable change, with its expected outcome |
   | §9 Acceptance Criteria | Observable behaviors (`AC1: /foo lists rows from GET /api/foo with paging`) |
   | §10 Verification | Leave results `NOT_RUN`; list `pnpm typecheck`, `pnpm build`, and specific manual checks |
   | §11 Backend Dependencies | Proposed contract (method, path, request, response, permission codes) labelled `NOT_VERIFIED`, or `NONE` |
   | §13 Progress Log | One "Task Created" entry |
   | §14 Handoff | `Next Action` = the first concrete edit of step 1 |
4. **Label evidence**: facts read from this repo are `VERIFIED`; anything about backend behavior is
   `UNKNOWN` / `BACKEND_NOT_ACCESSIBLE` unless a devtools/OpenAPI capture is quoted.
5. **Index it**: add a row to the Task Index table in `tasks/README.md`
   (`| 001 | Foo CRUD screen | TODO | None | tasks/001-foo-crud.md |`) and remove the "no tasks yet" note if present.

## Rules

- Do not invent skills, file paths, endpoints, permission codes, or backend task IDs.
- Keep the plan inside the requested scope; list extras under Out of Scope.
- Do not start implementation. If the user also asked to implement, finish the task file first,
  then switch to `task-execution`.

## Done checklist

- [ ] File name matches `tasks/<3-digit-id>-<kebab-name>.md` and the ID is unused.
- [ ] All 15 sections present; non-applicable ones say why.
- [ ] Every skill path in §3 exists (`ls .agents/skills/`).
- [ ] Every file path in §4/§6 exists, or is explicitly marked "new file".
- [ ] Backend assumptions are in §11 and labelled `NOT_VERIFIED`.
- [ ] `tasks/README.md` index row added; `git diff --stat` shows only `tasks/` changes.
