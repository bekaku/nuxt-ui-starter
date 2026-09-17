# Task: <TASK_TITLE>

## 1. Task Metadata

| Field | Value |
|---|---|
| Task ID | <TASK_ID> |
| Status | TODO |
| Priority | MEDIUM |
| Task Type | FEATURE / BUGFIX / REFACTOR / DOCS |
| Created | <YYYY-MM-DD> |
| Updated | <YYYY-MM-DD> |
| Dependencies | None |
| Blocked By | None |

### Status Definitions

- TODO: Task created, implementation not started.
- IN_PROGRESS: Implementation or verification in progress.
- BLOCKED: Cannot proceed due to a documented blocker.
- REVIEW: Implementation and required checks completed; awaiting required review.
- DONE: All required checkpoints and acceptance criteria passed.
- CANCELLED: Task cancelled with a documented reason.

Rules:

- Use only the status values defined above.
- Do not mark DONE if required work remains (including unresolved backend blockers — see section 11).
- Document blockers explicitly.
- Update the status and Updated date when status changes.
- Record every status transition in the progress log.

---

## 2. Objective

<Describe exactly what this task must accomplish.>

### Problem Statement

<Describe the existing problem or requested feature.>

### Expected Outcome

<Describe the expected behavior after implementation.>

### Out of Scope

- <Explicitly excluded functionality.>

This work targets the internal admin console (administrators and authorized
staff only) — end-user RAG features belong to the external client, not this
repository.

---

## 3. Required Reading

Read the following before implementation.

### Global Instructions

- [ ] `/AGENTS.md`

### Architecture Documentation

- [ ] `docs/agent/project-map.md` — relevant sections
- [ ] `docs/agent/skills-index.md` — to select skills
- [ ] `docs/agent/backend-integration.md` — when the task touches the API contract

### Required Skills

List only skills relevant to this task.

Each skill must exist in the repository.

| Skill | Path | Purpose | Read |
|---|---|---|---|
| <skill-name> | .agents/skills/<name>/SKILL.md | <why needed> | [ ] |

Rules:

1. Do not invent skill names or paths.
2. Verify that each required skill exists.
3. Read required skills before implementation.
4. Read supporting references only when relevant.
5. Do not load unrelated skills.
6. If a required skill is missing, document the gap.

---

## 4. Existing Implementation to Inspect

Identify the actual source files.

### Frontend

- Pages:
- Components:
- Composables / `app/api` clients:
- State management:
- Types (`app/types/`):
- Middleware / plugins:
- i18n keys (`en` + `th`):

### API Contract (Frontend-Observed)

- Endpoints:
- Request/response DTOs:
- Auth/permission gating:

> This repository has no test framework (no `*.test.*`, no vitest/jest/playwright).
> Do not add one without an explicit task. Verification is `pnpm typecheck`,
> `pnpm build`, and targeted manual checks.

Instructions:

- Remove irrelevant categories.
- Reference actual repository files.
- Do not invent files.
- Identify existing patterns before implementing changes.
- CRUD screens must reuse `useCrudList` / `useCrudForm` / `usePagefecth`
  (note the `usePagefecth` spelling is intentional).

---

## 5. Scope and Impact

### Affected Areas

- [ ] Frontend
- [ ] API Contract (frontend-observed)
- [ ] Authentication / Authorization (presentation layer)
- [ ] SSR behavior
- [ ] i18n (`en` + `th`)
- [ ] Documentation

### Dependencies

<Identify related tasks, modules, or external dependencies.>

### Compatibility Requirements

<Identify existing behavior that must remain unchanged
(API shapes, permission codes, i18n keys).>

### Security Considerations

<Identify relevant authentication, authorization,
validation, and data-access requirements. Authorization stays server-owned;
client gating is presentation only.>

### External API Impact

- Contract change required: YES / NO / UNKNOWN
- DTO/type change required: YES / NO / UNKNOWN

Do not invent backend behavior. Record proposals in section 11.

Do not silently introduce dependencies, frameworks, or architectural patterns.

---

## 6. Implementation Plan

Create an ordered implementation plan.

- [ ] Step 1: <Action>
- [ ] Step 2: <Action>
- [ ] Step 3: <Action>
- [ ] Step 4: <Action>

Rules:

- Each step must have a clear expected outcome.
- Respect dependencies between steps.
- Modify only relevant files.
- Follow existing project conventions.
- Update checkboxes only after actual completion.

---

## 7. Implementation Checklist

### Frontend (if applicable)

- [ ] Follow existing component conventions.
- [ ] Reuse existing UI components (`BaseTable` / `BaseForm` for CRUD).
- [ ] Implement loading, empty, and error states.
- [ ] Handle SSR and hydration correctly.
- [ ] Keep Snowflake IDs precision-safe (`IdType`, never `Number(id)`).
- [ ] Verify relevant API types.
- [ ] Add i18n keys to both `en` and `th`.

### API Integration (if applicable)

- [ ] Call the backend only via `useApi()`.
- [ ] Preserve the existing request/response contract (or document the change).
- [ ] Handle both `ApiResponse<T>` and bare `T[]` for lists.
- [ ] Handle errors without duplicate manual toasts.

### Authentication (if applicable)

- [ ] Apply required `requiresPermission` / `v-rbac` gating.
- [ ] Do not add per-page 401 handling (the wrapper owns it).

### Documentation

- [ ] Update relevant documentation if behavior changes.

Also complete the layer-specific checklist in each loaded `SKILL.md`
(Verification / Completion Criteria sections) instead of duplicating
project rules here.

Remove non-applicable checklist items before execution.

---

## 8. Checkpoints

Checkpoint states:

- PENDING
- IN_PROGRESS
- PASSED
- FAILED
- BLOCKED
- NOT_APPLICABLE

A checkpoint can be marked PASSED only when its
exit criteria are satisfied and evidence is recorded.

### CP0 — Planning

Status: PENDING

Checklist:

- [ ] Requirements analyzed.
- [ ] Objective defined.
- [ ] Scope defined.
- [ ] Acceptance criteria defined.
- [ ] Dependencies identified.
- [ ] Required skills identified.

Exit Criteria:

Task scope and expected outcomes are clear.

Evidence:
- <Record findings or references.>

---

### CP1 — Impact Analysis

Status: PENDING

Checklist:

- [ ] Global instructions read.
- [ ] Required skills read.
- [ ] Existing implementation inspected.
- [ ] Affected files identified.
- [ ] API impact evaluated.
- [ ] Security impact evaluated.
- [ ] Implementation approach confirmed.

Exit Criteria:

Implementation approach is supported by actual source code.

Evidence:
- <Record source files and findings.>

---

### CP2 — Implementation

Status: PENDING

Checklist:

- [ ] Required changes implemented.
- [ ] Existing conventions followed.
- [ ] Relevant implementation checklist completed.
- [ ] Unrelated files left unchanged.
- [ ] Code reviewed for obvious issues.

Exit Criteria:

All required implementation steps are complete.

Evidence:
- <Record modified files and implementation notes.>

---

### CP3 — Verification

Status: PENDING

Checklist:

- [ ] Relevant typecheck completed.
- [ ] Relevant build check completed.
- [ ] Acceptance criteria verified.
- [ ] Changes inspected for regressions.

Exit Criteria:

All mandatory verification checks passed.

If a check cannot run, record:

- Reason
- Impact
- Alternative verification
- Remaining risk

Do not claim a check passed if it was not executed.

Evidence:
- <Record exact commands and outcomes.>

---

### CP4 — Completion

Status: PENDING

Checklist:

- [ ] Required checkpoints resolved.
- [ ] Acceptance criteria satisfied.
- [ ] Remaining issues documented.
- [ ] Progress log updated.
- [ ] Final task status updated.
- [ ] Final summary prepared.

Exit Criteria:

The task is ready for delivery or required review.

Evidence:
- <Record final review and handoff details.>

---

## 9. Acceptance Criteria

Use observable and testable requirements.

- [ ] AC1: <Expected behavior>
- [ ] AC2: <Expected behavior>
- [ ] AC3: <Expected behavior>

Each acceptance criterion must be verifiable.

Do not mark DONE while mandatory criteria remain unmet.

---

## 10. Verification Results

| Check | Command / Method | Result | Evidence |
|---|---|---|---|
| Typecheck | `pnpm typecheck` | NOT_RUN | |
| Build | `pnpm build` | NOT_RUN | |
| Manual check | <method> | NOT_RUN | |

Allowed results:

- NOT_RUN
- PASSED
- FAILED
- BLOCKED
- NOT_APPLICABLE

Never invent test commands or results.

CI (`.github/workflows/ci.yml`) additionally runs `pnpm run lint` on push —
follow `eslint.config.mjs` house style by hand; do not run `eslint` repo-wide
as task verification. No test runner exists in this repository; record unit-test
rows as `NOT_APPLICABLE` with that reason.

If a check is not applicable, explain why.

---

## 11. External Backend Dependencies

Target-specific section (no reference equivalent — the Spring Boot backend is
external and `BACKEND_NOT_ACCESSIBLE`).

```text
Backend Repository: Separate Spring Boot repository
(companion starter linked from README.md).
Backend Access: NOT_AVAILABLE (no /backend directory in this workspace).
Backend Changes Required: YES / NO / UNKNOWN
Required Backend API Changes: <proposed contract or NONE —
method + path + request/response as proposed, not as existing behavior>
Backend Verification: NOT_VERIFIED (mark VERIFIED only with devtools
or OpenAPI evidence recorded in this task)
Backend Task Reference: <real reference or NONE — do not invent IDs>
Integration Blockers: <details or NONE>
```

Rules:

- Do not create files in the backend repository from this workspace.
- Do not claim integration is verified without actual evidence.
- Do not mark the task DONE while required backend dependencies remain
  unresolved — record completed frontend work and remaining integration work.

---

## 12. Blockers

| Blocker | Impact | Resolution | Status |
|---|---|---|---|
| None | | | |

If blocked:

1. Set Task Status to BLOCKED.
2. Record the blocker and its impact.
3. Record the last successful checkpoint.
4. Document the next possible action.
5. Resume only when the blocker is resolved.

---

## 13. Progress Log

Append an entry for meaningful progress and
every status transition.

### <YYYY-MM-DD HH:mm> — Task Created

Status: TODO

Completed:
- Task initialized from `tasks/TASK_TEMPLATE.md`.

Next:
- Begin CP0.

Blockers:
- None.

---

## 14. Handoff / Resume Context

Update this section before ending a session
if the task is not complete.

### Current State

<What is the actual current state?>

### Last Completed Checkpoint

<CP number or NONE>

### Completed Work

- <Summary of completed changes.>

### Remaining Work

- <What still needs to be done?>

### Files Changed

- <Actual file path and purpose.>

### Verification State

<What has and has not been verified?>

### Known Issues

- <Issues, assumptions, and blockers.>

### Next Action

<The exact next action for the next agent.>

A new agent must be able to resume using this
task file without relying on previous chat history.

---

## 15. Final Summary

Complete only when the task is finished.

### Delivered

- <Implemented functionality.>

### Modified Files

- <Actual modified file paths.>

### Verification

- <Checks and results.>

### Backend Dependencies Not Yet Verified

- <Remaining cross-repository items or NONE.>

### Remaining Risks

- <Any remaining limitations.>

### Final Status

<TODO / IN_PROGRESS / BLOCKED / REVIEW / DONE / CANCELLED>
