# Frontend reference router

These files are detailed references, not skills. Start from a canonical skill in `.agents/skills/`
(`crud-module`, `nuxt-frontend`, or `api-integration`) and open a file here only when that skill points to it.

| Change | Reference | Inspect first |
|---|---|---|
| Entity list/form options, search wire format, BaseTable/BaseForm props and slots | `CRUD.md` | `useCrudList.ts`, `useCrudForm.ts`, `usePagefecth.ts`, `app/pages/permission/` |
| `useApi()` internals, SSR cookies, stream, upload | `API.md` | `useApi.ts`, the caller, `app/types/`, `docs/API_CONTRACT.md` |
| Login, linked accounts, RBAC, route guards | `AUTH.md` | `useAuth.ts`, `app/api/useAuthApi.ts`, middleware, plugins |
| Page/component, theme, locale | `UI.md` | closest production component, `app/app.config.ts`, locale files |
| State, zod form, TypeScript model | `TYPES_VALIDATION.md` | relevant composable, page schema, `app/types/` |

Line numbers in these files were recorded in September 2026 and drift; search for the named symbol
instead of trusting a line number. The Spring Boot backend is in another repository
(`BACKEND_NOT_ACCESSIBLE`); do not infer backend implementation from frontend calls.
