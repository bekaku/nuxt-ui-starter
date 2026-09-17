# Project Map — Nuxt Admin Console

> Status: `VERIFIED` means confirmed directly from source code in this repo. Audited 2026-09-17.

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
  api/               domain API clients (auto-imported via imports.dirs: ['api'])
                     currently 1 file: useFavoriteMenuApi.ts
  components/        auto-imported components (base/* ~40 files + chat/*, chart/*, ...)
  composables/       real application layer (28 files: useApi, useAuth, useCrud*, usePagefecth, ...)
  layouts/           5 files: ai.vue, chat.vue, default.vue, empty.vue, feed.vue
  middleware/        00.seo.global.ts → 01.auth.global.ts → 02.check-permit.global.ts
  pages/             file-based routes (ai-chats, ai-document-meta, api-client,
                     app-role, app-user, auth, chats, example, my-drive,
                     permission, settings, test + index.vue)
  plugins/           9 files (00.auth.server/client, apexchart, cropperjs, datefns,
                     pdfVue, plyr, rbac, toast)
  types/             hand-maintained contract types (common.ts ~768 lines,
                     models.ts, props.ts, chart.ts, index.d.ts)
  utils/ / libs/     helpers (two snowflake variants, constants, appUtil, dateUtil, fileUtil)
  stores/            empty — do not use Pinia (INFERRED: no pinia dependency)
server/api/          Nitro mocks + scraper (mock/*, meta.ts) + migration tooling
  mock/              dashboard, chart, chat, file, members, mails, notifications
  meta.ts            cheerio OG scraper
server/database/     exists (mysql/, migrate/run-engine.ts) — one-off tooling for
                     `pnpm migrate:mysql:pg` only, not app runtime
shared/types/        empty placeholder — real types live in app/types/
i18n/locales/        en/ + th/ x (app, base, helper, model, error).json
skills/frontend/     SKILL.md, API.md, AUTH.md, CRUD.md, UI.md, TYPES_VALIDATION.md
tasks/               README.md + TASK_TEMPLATE.md (no numbered tasks yet)
docs/                API_CONTRACT.md, FRONTEND_FOOTGUNS.md, FRONTEND_OPEN_QUESTIONS.md
docs/agent/          this report set (English)
```

## 3. Layers and Data Flow

1. **Entry & config**: `nuxt.config.ts` (modules, runtimeConfig, fonts, routeRules, imports.dirs), `app/app.vue`, `app/app.config.ts`, `app/layouts/*`.
2. **Routing & guards**: `definePageMeta({ pageName, requiresPermission })` → `00.seo` → `01.auth` (checks `useState('auth:user')`, redirects `/auth/login?continue=...`) → `02.check-permit` (checks `requiresPermission` via `isHavePermissionLazy`, 403 → `showError`).
3. **CRUD scaffold**: `useCrudList` + `useCrudForm` wrapping `usePagefecth` → `useApi` → backend → `BaseTable` / `BaseForm` render; query string `?page,size,sort,_q,_keyword` synced via URL.
4. **API layer**: `useApi()` only (`$fetch.create({ baseURL: apiBase })`, headers `Accept-Apiclient` + `Accept-Language`, `credentials: 'include'`, SSR cookie forwarding, auto toast, single 401→refresh→retry).
5. **State**: namespaced `useState` keys (`auth:user`, `auth:navigations`, `ai:recent`, …) — no Pinia, no provide/inject.
6. **Validation**: per-page zod (`UForm :schema` / `BaseForm :zod-schema` + `.describe(uiConfig(...))`) — client-side validation only, not a shared backend contract.
7. **i18n**: `useLang()` / `$t()`; every key must exist in both `en` and `th`.

## 4. Inspection Limits

- UI files (~40 `Base*` components) reviewed by sampling, not line by line — deep prop/slot details are `INFERRED`.
- `useAiChat.ts` (450 lines): first 80 lines read + targeted grep — `ChatStatus` and the endpoint are verified; SSE event details follow `docs/API_CONTRACT.md`.
- `pnpm build` / `pnpm typecheck` were not run in this docs-only mission (application source must not be touched) — build verification is `NOT_VERIFIED` for this round.
- All backend behavior is `BACKEND_NOT_ACCESSIBLE` (see `backend-integration.md`).

## 5. Primary References

- `/AGENTS.md`, `/SKILLS.md`, `tasks/TASK_TEMPLATE.md`
- `skills/frontend/*.md` (6 files)
- `docs/API_CONTRACT.md`, `docs/FRONTEND_FOOTGUNS.md`, `docs/FRONTEND_OPEN_QUESTIONS.md`
- `nuxt.config.ts`, `package.json`, `app/composables/useApi.ts`, `app/composables/useAuth.ts`
