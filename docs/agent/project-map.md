# Project Map — Nuxt Admin Console

> `VERIFIED` means confirmed directly from source code in this repo. Structure checked 2026-09-23; inspect current source before relying on old line numbers in linked references.

## 1. Verified Overview

- Type: **internal administration console** for admins and authorized staff only, not an end-user app (`README.md`, `app/middleware/01.auth.global.ts`, `02.check-permit.global.ts`).
- Framework: Nuxt `^4.5.2` (`app/` is the `srcDir`), `ssr: true` (`nuxt.config.ts:29`).
- UI: Nuxt UI `^4.11.0` + Tailwind CSS `^4.3.3`, Vue `^3.5.42`, `<script setup lang="ts">`.
- i18n: `@nuxtjs/i18n ^10.6.0`, `strategy: 'no_prefix'`, `defaultLocale: 'th'`, locales `en` + `th`.
- Tooling: pnpm `11.9.0`, TypeScript `^7.0.2`, `vue-tsc ^3.3.11`, ESLint (`@nuxt/eslint`), CI `.github/workflows/ci.yml`.
- Backend: external (separate Spring Boot repo, `BACKEND_NOT_ACCESSIBLE`) — this workspace has **no** `/backend` and **no** `frontend/` subdirectory.

## 2. Real Directory Layout (VERIFIED)

```text
app/                 main srcDir
  api/               domain API helpers (auto-imported via imports.dirs: ['api']):
                     useAuthApi.ts, useFavoriteMenuApi.ts
  components/        auto-imported components (base/*, chat/*, chart/*, ...)
  composables/       application behavior (useApi, useAuth, useCrud*, usePagefecth, ...)
  layouts/           5 files: ai.vue, chat.vue, default.vue, empty.vue, feed.vue
  middleware/        00.seo.global.ts → 01.auth.global.ts → 02.check-permit.global.ts
  pages/             file-based routes (ai-chats, ai-document-meta, api-client,
                     app-role, app-user, auth, chats, example, my-drive,
                     permission, settings, test + index.vue)
  plugins/           00.auth.server/client, apexchart, cropperjs, datefns,
                     pdfVue, plyr, rbac, toast
  types/             hand-maintained frontend types (common.ts,
                     models.ts, props.ts, chart.ts, index.d.ts)
  utils/ / libs/     helpers (two snowflake variants, constants, appUtil, dateUtil, fileUtil)
server/api/          local Nitro handlers, separate from Spring Boot
  mock/              customers, mails, members, notifications
  meta.ts            cheerio OG scraper
server/database/     exists (mysql/, migrate/run-engine.ts) — one-off tooling for
                     `pnpm migrate:mysql:pg` only, not app runtime
shared/types/        placeholder — frontend types live in app/types/
i18n/locales/        en/ + th/ x (app, base, helper, model, error).json
skills/frontend/     SKILL.md, API.md, AUTH.md, CRUD.md, UI.md, TYPES_VALIDATION.md
tasks/               README.md + TASK_TEMPLATE.md (no numbered tasks yet)
docs/                API_CONTRACT.md, FRONTEND_FOOTGUNS.md, FRONTEND_OPEN_QUESTIONS.md
docs/agent/          this report set (English)
```

## 3. Layers and Data Flow

1. **Entry & config**: `nuxt.config.ts` (modules, runtimeConfig, fonts, routeRules, imports.dirs), `app/app.vue`, `app/app.config.ts`, `app/layouts/*`.
2. **Routing & guards**: `definePageMeta({ pageName, requiresPermission })` → `00.seo` → `01.auth` (checks `useState('auth:user')`, redirects `/auth/login?continue=...`) → `02.check-permit` (checks `requiresPermission` via `isHavePermissionLazy`, 403 → `showError`).
3. **CRUD scaffold**: list pages use `useCrudList` → `usePagefecth`; form pages use `useCrudForm`. Both call `useApi()` and usually render through `BaseTable` / `BaseForm`. Search, paging, and sort state can be reflected in the URL.
4. **API layer**: `useApi()` (`$fetch.create({ baseURL: apiBase })`, headers `Accept-Apiclient` + `Accept-Language`, `credentials: 'include'`, SSR cookie forwarding, auto toast, single 401→refresh→retry). Domain helpers in `app/api/` wrap it; `useAuthApi.ts` covers linked-account requests.
5. **State**: namespaced `useState` keys (`auth:user`, `auth:navigations`, `ai:recent`, …) — no Pinia, no provide/inject.
6. **Validation**: per-page zod (`UForm :schema` / `BaseForm :zod-schema` + `.describe(uiConfig(...))`) — client-side validation only, not a shared backend contract.
7. **i18n**: `useLang()` / `$t()`; every key must exist in both `en` and `th`.

## 4. Implementation Findings

| Area | Finding | Agent action |
|---|---|---|
| Route access | `01.auth.global.ts` uses `auth:user` and `AuthNoFilterPage`; `02.check-permit.global.ts` applies `requiresPermission` only when the metadata is an array. This is client presentation, not backend authorization. | Inspect both guards and the route metadata before adding a protected screen. |
| Standard CRUD | Lists use `useCrudList`/`usePagefecth`; forms use `useCrudForm`. Their `apiEndpoint` options have different meanings. | Read `skills/frontend/CRUD.md` X2–X3 and the relevant composable before wiring URLs or permission codes. |
| ID precision | `IdType` allows bigint/string, while legacy `useCrudForm.ts` reads `crudId` through `getParam<number>`. | Keep new ID handling precision-safe; inspect route parsing if changing form behavior. |
| Network | `useApi()` owns cookie credentials, SSR forwarding, 401 refresh, and common notifications. `app/api/` contains small domain wrappers. | Add endpoint-specific logic to the caller or domain helper; change the wrapper only for cross-cutting behavior. |
| Local server | `server/api/mock/` contains four local mock handlers; `server/api/meta.ts` is an OG scraper. Spring Boot source is absent. | Treat API types and call sites as frontend expectations and verify backend shapes with live evidence. |
| References | `app/pages/example/`, `app/pages/test/`, and `app/components/Temp.vue` are demos. | Prefer `app-user/`, `app-role/`, or another production route as the implementation example. |

## 5. Inspection Limits

- Deep prop/slot details of every component have not been rechecked; inspect the affected component before implementation.
- SSE event details require inspection of `useAiChat.ts` and live backend evidence for integration claims.
- This map is documentation, not a substitute for `pnpm build` / `pnpm typecheck` when app runtime changes.
- All backend behavior is `BACKEND_NOT_ACCESSIBLE` (see `backend-integration.md`).

## 6. Primary References

- `/AGENTS.md`, `/SKILLS.md`, `tasks/TASK_TEMPLATE.md`
- `skills/frontend/*.md` (6 files)
- `docs/API_CONTRACT.md`, `docs/FRONTEND_FOOTGUNS.md`, `docs/FRONTEND_OPEN_QUESTIONS.md`
- `nuxt.config.ts`, `package.json`, `app/composables/useApi.ts`, `app/composables/useAuth.ts`
