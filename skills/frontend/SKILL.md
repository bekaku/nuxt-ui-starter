# Frontend reference router

The canonical, discoverable implementation skills are in `.agents/skills/`. Read `AGENTS.md` and select `nuxt-frontend` or `api-integration` first. This directory contains detailed references, not another set of mandatory skills. Open only the file matching the change:

| Change | Reference | Inspect first |
|---|---|---|
| Entity list/form, search, paging, table actions | `CRUD.md` | `useCrudList.ts`, `useCrudForm.ts`, `usePagefecth.ts`, closest production route |
| Spring Boot request, DTO, SSR cookies, stream, upload | `API.md` | `useApi.ts`, caller, `app/types/`, `docs/API_CONTRACT.md` |
| Login, linked accounts, RBAC, route guards | `AUTH.md` | `useAuth.ts`, `app/api/useAuthApi.ts`, middleware and plugins |
| Page/component, theme, locale | `UI.md` | closest production component, `app/app.config.ts`, locale files |
| State, zod form, TypeScript model | `TYPES_VALIDATION.md` | relevant composable, page schema, `app/types/` |

Use `docs/agent/project-map.md` to navigate, then trust current source over dated counts or line numbers in reference documents. The Spring Boot backend is in another repository (`BACKEND_NOT_ACCESSIBLE`); `server/api/` is local Nitro code and `server/database/` is migration tooling. Do not infer backend implementation from frontend calls.

For an existing numbered task, also read `.agents/skills/task-execution/SKILL.md` and update its handoff as work proceeds. A normal implementation request does not require creating a new task file.
