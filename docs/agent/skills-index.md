# Project skills index

Read `AGENTS.md` first. Canonical skills live in `.agents/skills/<name>/SKILL.md`; each has the same
shape (When to use → Read first → decision table / recipe → Rules → Common mistakes → Done checklist).
`skills/frontend/*.md` are detailed references opened only when a skill points to them.

## Pick skills by request

| Example request | Load | Optional reference |
|---|---|---|
| "Add a Foo management page", "add a column/filter to the user list", "Delete button missing on roles" | `crud-module` | `skills/frontend/CRUD.md` (X5–X9) |
| "Add a settings page", "new dashboard widget", "change this component", "add a menu item", "translate this label" | `nuxt-frontend` | `skills/frontend/UI.md`, `TYPES_VALIDATION.md` |
| "Hide this button for users without X", "page should require permission Y" | `nuxt-frontend` | `skills/frontend/AUTH.md` |
| "Call the new /api/foo endpoint", "response shape changed", "upload fails", "stream stops" | `api-integration` | `skills/frontend/API.md`, `docs/API_CONTRACT.md` |
| "Login / linked account / refresh token problem" | `api-integration` | `skills/frontend/AUTH.md` |
| "New entity screen on a new endpoint" | `crud-module` + `api-integration` | — |
| "Write a task/spec for …" | `task-planning` | `tasks/TASK_TEMPLATE.md` |
| "Implement / resume task 003" | `task-execution` + the skills listed in the task | references listed by the task |
| Docs or agent-config edits only | none required | — |

A normal implementation request does not need a task file. `task-execution` applies only when a
numbered task already exists.

## Route to source

- CRUD scaffold: `app/composables/useCrudList.ts`, `useCrudForm.ts`, `usePagefecth.ts` (spelling intentional),
  `app/components/base/BaseTable.vue`, `BaseForm.vue`; reference modules `app/pages/permission/`, `app-role/`, `app-user/`.
- API boundary: `app/composables/useApi.ts`; domain helpers `app/api/useAuthApi.ts`, `useFavoriteMenuApi.ts`;
  specialised callers `useUpload.ts`, `useDownload.ts`, `useAiChat.ts`; contract record `docs/API_CONTRACT.md`.
- Auth/RBAC: `app/composables/useAuth.ts`, `useRbac.ts`, `app/middleware/00.seo.global.ts` → `01.auth.global.ts` →
  `02.check-permit.global.ts`, `app/plugins/rbac.ts` (`v-rbac`), `app/plugins/00.auth.server.ts`, `AuthNoFilterPage` in `app/libs/constants.ts`.
- UI/i18n: `app/components/`, `app/layouts/`, `app/app.config.ts`, `app/assets/css/main.css`,
  `app/composables/useMenu.ts`, paired `i18n/locales/{en,th}/{app,base,helper,model,error}.json`.

The Spring Boot backend is in another repository (`BACKEND_NOT_ACCESSIBLE`). `server/api/` holds local
Nitro mocks and an OG scraper; `server/database/` is migration tooling. There is no backend skill in
this project, and a frontend call site is never proof of backend behavior.
