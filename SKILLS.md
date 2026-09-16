# Frontend Skills Router

Routes frontend tasks to focused guidance. Do **not** read every skill file on every
task. Read `/AGENTS.md` and `frontend/AGENTS.md` first.

Always read:

- `/AGENTS.md`
- `frontend/AGENTS.md`
- `skills/frontend/SKILL.md`
- the applicable `frontend/tasks/<number>-*.md`, when the task is a numbered task

Then read only the relevant domain files:

| Task area | Read |
| --- | --- |
| Entity admin screens: list + form, search/paging, `useCrudList` / `useCrudForm` | `skills/frontend/CRUD.md` |
| `useApi()`, endpoints, upload/download, SSE | `skills/frontend/API.md` |
| Login, session, cookies, refresh, route guards, RBAC | `skills/frontend/AUTH.md` |
| Components, pages, Nuxt UI, styling, dark mode, i18n | `skills/frontend/UI.md` |
| `useState`, forms, zod, DTOs, TypeScript discipline | `skills/frontend/TYPES_VALIDATION.md` |
| Project layout, code style/config, verification | `skills/frontend/SKILL.md` |

## Reference documentation

Read only when the task needs that level of detail; the domain skill file above stays
the primary reference.

- `docs/API_CONTRACT.md` — the API contract **as consumed by this frontend**: endpoint
  inventory, envelope/date/null conventions, auth attachment, 401/403, error parsing,
  and the RAG chat SSE event contract.
- `docs/FRONTEND_FOOTGUNS.md` — observed traps. Read when implementing or debugging
  one of them; not a checklist to apply everywhere.
- `docs/FRONTEND_OPEN_QUESTIONS.md` — unresolved technical debt. Context only, and not
  authorization to fix unrelated items during a task.

## Task templates

```text
Frontend only:                 /frontend/TASK_TEMPLATE.md
Backend only or cross-stack:   /TASK_TEMPLATE.md
```

A task that changes a backend contract is cross-stack — use the root template.

## Non-authoritative files — do not use as guidance

- `docs/REVIEW_CODE_BASE_PROMT.md` — the prompt that generated the original frontend
  review. It describes this repository as a standalone starter whose Spring Boot
  backend is inaccessible; the backend is now at `/backend` in this repository. It is
  kept for provenance only. Do not follow its instructions as project rules.
- `docs/SPLIT_MAP.md` — historical map of the original monolithic `SKILLS.md` split.
  Reference only.

## Scope reminder


## Rule

Task-based reading is preferred. Do not load every skill/reference file at the start
of every task, and do not load backend skills for a frontend-only task.
