# Project skills index

Read `AGENTS.md` first. Canonical skills are `.agents/skills/<name>/SKILL.md`; `skills/frontend/*.md` are detailed references opened only for the affected domain. Inspect current source before implementing because reference counts and line numbers can age.

| Request | Canonical skill | Additional reference |
|---|---|---|
| Implement or change `app/` UI, state, form, route, styling, or i18n | `nuxt-frontend` | `skills/frontend/CRUD.md`, `UI.md`, or `TYPES_VALIDATION.md` as relevant |
| Change/debug external API calls, DTOs, auth request flow, upload/download, or SSE | `api-integration` | `skills/frontend/API.md`; `AUTH.md` for session/RBAC work |
| Create a numbered `tasks/<id>-*.md` specification | `task-planning` | `tasks/TASK_TEMPLATE.md` |
| Execute, resume, or update an existing numbered task | `task-execution` plus the affected domain skill | References listed by that task |
| Change both UI and its network contract | `nuxt-frontend` and `api-integration` | Only the affected references |

A normal implementation request does not require creating a task file. `task-execution` applies when a numbered task already exists. A docs or agent-config edit need not load a frontend implementation skill unless it changes app behavior.

## Route to source

- Standard admin CRUD: `app/pages/app-user/`, `app/pages/app-role/`, `app/composables/useCrudList.ts`, `useCrudForm.ts`, `usePagefecth.ts` (spelling is intentional).
- API boundary: `app/composables/useApi.ts`; domain helpers in `app/api/useAuthApi.ts` and `useFavoriteMenuApi.ts`; frontend contract record in `docs/API_CONTRACT.md`.
- Auth/RBAC: `app/composables/useAuth.ts`, `useRbac.ts`, `app/middleware/00.seo.global.ts`, `01.auth.global.ts`, `02.check-permit.global.ts`, `app/plugins/rbac.ts`.
- UI/i18n: `app/components/`, `app/layouts/`, `app/app.config.ts`, `app/assets/css/main.css`, and paired `i18n/locales/{en,th}/` files.

The Spring Boot backend is in another repository (`BACKEND_NOT_ACCESSIBLE`). `server/api/` here contains local Nitro handlers, and `server/database/` contains migration tooling. Do not choose a backend implementation skill from this project or claim backend verification from a frontend call site.
