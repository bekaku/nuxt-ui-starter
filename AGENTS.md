# AGENTS.md

## 1. Project Identity

Nuxt 4 admin console (`nuxt-ui-starter`): SSR web app for administrators and
explicitly authorized staff — not end users. Every route sits behind
authentication and RBAC; there is no public/anonymous surface. Package manager
is pnpm. No Pinia. No test framework.

The Spring Boot backend lives in a separate repository and is NOT available in
this workspace (`BACKEND_NOT_ACCESSIBLE`). There is NO `/backend` directory here
(verified 2026-09-17). Never invent backend implementations or database
structures. Backend-related assumptions must be explicitly documented as
unverified.

Evidence labels:

- `VERIFIED` — confirmed directly from accessible source code in this repo.
- `INFERRED` — supported by source code, but not directly verified.
- `UNKNOWN` — cannot be determined from accessible evidence.
- `BACKEND_NOT_ACCESSIBLE` — requires inspection of the separate Spring Boot repository.

## 2. Verified Technology Stack

| Layer | Technology (verified in `package.json`, `nuxt.config.ts`) |
|---|---|
| Framework | Nuxt `^4.5.2` (`app/` srcDir), SSR enabled (`ssr: true`) |
| UI | Nuxt UI `^4.11.0` + Tailwind CSS `^4.3.3` |
| Language | Vue `^3.5.42` Composition API, `<script setup lang="ts">`, TypeScript `^7.0.2` |
| API | External Spring Boot REST API via `useApi()` (`app/composables/useApi.ts`); `server/api/` holds Nitro mocks + one scraper only |
| Validation | Zod `^4.5.4` (per-page client `UForm` validation only) |
| Auth | Cookie JWT (`_session_` / `_slid_`, HttpOnly), `useAuth` + global route guards + `v-rbac` (presentation only) |
| i18n | `@nuxtjs/i18n ^10.6.0`, locales `th` (default) / `en`, `no_prefix` strategy |
| Realtime | SSE over `POST /api/aiChat/stream` (`useAiChat.ts`, RAG test harness — not product UI) |
| Tooling | pnpm `11.9.0` (`pnpm-workspace.yaml`, `pnpm-lock.yaml`), `vue-tsc ^3.3.11` |

## 3. Architecture Overview

- `app/` — Nuxt client: `pages/`, `components/`, `composables/` (28 files), `api/useFavoriteMenuApi.ts` (auto-imported), `middleware/00|01|02.*.global.ts`, `layouts/` (5 files: `ai`, `chat`, `default`, `empty`, `feed`), `plugins/`, `types/`, `utils/` + `libs/`.
- `server/api/` — Nitro mocks (`mock/*`) + OG scraper (`meta.ts`); `server/database/` is a one-off `migrate:mysql:pg` tool, not app runtime — never import `drizzle-orm` / `mysql2` in `app/`.
- `shared/types/` — effectively empty; canonical types live in `app/types/` (`common.ts`, `models.ts`, `props.ts`, `chart.ts`, `index.d.ts`).
- `i18n/locales/{en,th}/` — UI strings (`app`, `base`, `helper`, `model`, `error` namespaces).
- Auth boundary: authorization is server-owned. Client `v-rbac` / route middleware / `requiresPermission` is UX only. Do not weaken a backend authorization rule because this console's users are admins.
- The backend API has at least two consumers (this console and the external client), so a contract change is never "frontend-only". The presence of an API call (e.g. `GET /api/appUser/currentUserData`) proves a frontend expectation only — `docs/API_CONTRACT.md` records the contract as consumed by this frontend, reconstructed from call sites; live network evidence wins on conflict.

## 4. Required Reading

1. Read this file (`AGENTS.md`) first.
2. Identify the task type and load only the matching skill(s) from `.agents/skills/`
   (see `docs/agent/skills-index.md`). Read supporting references only when needed.
3. Inspect the affected source files before modifying them.

## 5. Repository Navigation

- Pages: `app/pages/<kebab-case>/index.vue` (list) + `app/pages/<kebab-case>/[crud]/[id].vue` (form); reference modules: `app-user/`, `app-role/`, `permission/`, `api-client/`.
- Client API helper: `app/api/useFavoriteMenuApi.ts` (via `useApi()`); core wrapper: `app/composables/useApi.ts`.
- CRUD scaffolding: `app/composables/useCrudList.ts` / `useCrudForm.ts` / `usePagefecth.ts` (note the `usePagefecth` spelling is intentional, do not "fix" it).
- AuthN/Z helpers: `app/composables/useAuth.ts`, `app/composables/useRbac.ts`, `app/plugins/rbac.ts` (`v-rbac`), `app/middleware/01.auth.global.ts`, `02.check-permit.global.ts`.
- Types: `app/types/{common,models,props}.ts`. ID type: `IdType = bigint | string | null | undefined` (`models.ts:7`).
- RAG chat harness: `app/composables/useAiChat.ts` (`ChatStatus`: `ready | submitted | streaming | error`).
- Agent skills: `.agents/skills/` (canonical); `skills/frontend/` (detailed domain references, preserved).
- Task specs: `tasks/<id>-<short-name>.md` (canonical template: `tasks/TASK_TEMPLATE.md`).
- Open questions: `docs/FRONTEND_OPEN_QUESTIONS.md`. Known traps: `docs/FRONTEND_FOOTGUNS.md`.
- Agent architecture docs: `docs/agent/`.
- Provenance only (not rules): `docs/REVIEW_CODE_BASE_PROMT.md`, `docs/SPLIT_MAP.md`.

## 6. Coding Conventions

- Inspect existing code first; follow the conventions of the files you touch.
- Reuse existing utilities, components, and composables; do not reinvent them.
- Make the smallest change that satisfies the task; modify only relevant files.
- Preserve backward compatibility (API shapes, permission codes, i18n keys) unless asked.
- Naming: components PascalCase domain-grouped (`base/Base*.vue`); composables
  `use*.ts` (keep the `usePagefecth.ts` typo as-is); page dirs kebab-case;
  permission codes `<snake_entity>_<action>` with action in
  `list|view|add|edit|delete`; API paths `/api/<camelCaseEntity>`;
  cookies `_session_` / `_slid_` / `_sid` (from runtime config, never hardcode).
- Snowflake IDs may exceed the JS safe-integer range: never coerce them to
  `number`; keep comparisons and route construction precision-safe
  (`app/utils/snowflake.ts` for client-generated IDs; `app/libs/Snowflake.ts` is legacy).
- Style: 2-space indent, LF, `commaDangle: never`, 1tbs braces, max 3 attributes
  per single-line element, kebab-case custom events. No new `any`
  (legacy `any` exists — do not add more), no new `@ts-ignore`
  (3 existing sites, all in `useAiChat.ts`).

## 7. Frontend Rules

- `<script setup lang="ts">` first, `<template>` second; never Options API
  (`generic="T"` for generic components).
- Shared client state via namespaced `useState` (never Pinia, never
  `provide`/`inject` for app state). Two-way binding via `defineModel`.
- Protected requests go through `useApi()` (silent refresh, SSR cookie forward);
  never bare `$fetch` / `useFetch` against backend paths; always relative
  `'/api/...'` resolved against `runtimeConfig.public.apiBase`.
- Gate UI with `v-rbac` / `BaseTable` permission props (UX only, never security).
- Pages declare `definePageMeta({ pageName, requiresPermission })`;
  keep middleware order `00.seo → 01.auth → 02.check-permit`.
- Every user-facing string goes to both `i18n/locales/en/*.json` and `th/*.json`
  via `useLang()`/`t()` in script and `$t()` in template.
- SSR-safe code (`import.meta.client` / `import.meta.server` guards); no browser
  globals in SSR paths.
- Never silently swallow API errors, and never add manual toasts the wrapper
  already raises.
- RAG chat (`useAiChat.ts`) is a test harness: preserve partial output on
  disconnect, stable message identity, `abortController` guards, intentional
  scroll behavior; never fabricate citations — render only the `sources` event.
- Ingestion is async on the backend: never treat an accepted upload as RAG-ready;
  the backend status enum is `BACKEND_NOT_ACCESSIBLE` — propose it in the task
  file and mark `NOT_VERIFIED` until live evidence exists.

## 8. API Integration Rules (External Backend)

- The backend is authoritative but NOT in this repository. Before changing
  frontend DTOs/types: (1) inspect `app/composables/useApi.ts` + `app/types/`;
  (2) capture live evidence (devtools response or OpenAPI spec); (3) reuse the
  `ApiResponse<T>` vs bare `T[]` dual-shape convention (callers must handle both,
  see `docs/API_CONTRACT.md` C2); (4) never invent fields, status codes, or
  permissions; (5) label the rest `UNKNOWN` / `BACKEND_NOT_ACCESSIBLE`.
- For cross-repository work, fill the task template's `External Backend
  Dependencies` section — a proposed contract, never a claim of verified backend
  behavior. Do not mark integration verified without actual evidence.

## 9. Security Rules

- Client-side RBAC is never a security boundary; authorization stays server-owned.
- Never expose credentials, tokens, or secrets in code, logs, or responses.
- Never read token cookies (`_session_` / `_slid_`) in JS.
- Do not duplicate backend business rules in the frontend.

## 10. Testing and Verification

- No test framework exists; do not add one without an explicit task.
- Canonical gates: `pnpm typecheck` (0 errors) plus `pnpm build` for
  runtime-affecting changes. Neither may be reported as passing unless executed.
  A typecheck error is real — fix it, never suppress with `@ts-ignore`.
- CI (`.github/workflows/ci.yml`): on `push`, `pnpm install` → `pnpm run lint` →
  `pnpm run typecheck` (Node 22). Follow `eslint.config.mjs` house style by hand
  so CI stays green, but do not run `eslint` repo-wide as part of a task.
- Verify affected code and report any checks that could not be executed.

## 11. Forbidden Operations

- No backend search/clone/modification (separate repository, not accessible).
- No fabricated controllers, services, entities, schemas, or validation rules.
- No application source changes for docs/agent-config tasks.
- No `.env` modifications; no credential exposure.
- No database operations, deployments, or destructive cleanup.
- No silent dependencies, frameworks, or architectural patterns.
- No weakening auth/RBAC/error-handling behavior documented as intentional
  (see `docs/FRONTEND_FOOTGUNS.md`).

## 12. Standard Agent Workflow

1. Read `AGENTS.md` and discover skills (section 14).
2. Load only the relevant `SKILL.md` file(s); read references on demand.
3. Inspect affected source files; plan the minimal change.
4. Implement, reusing existing utilities/components and preserving conventions.
5. Verify (`pnpm typecheck`, plus `pnpm build` when runtime-affected).
6. Review the diff; confirm only relevant files changed and no secrets leaked.
7. Stop when success criteria pass; report unverifiable checks and residual risks.

## 13. Task Management Rules

Task specifications live in `tasks/<id>-<short-name>.md`, created from the
canonical `tasks/TASK_TEMPLATE.md` (take the next free number: `001`, `002`,
…). A task file's existence does not mean it is implemented — its checklists,
checkpoints, and handoff state are the source of truth and must be verified
against repository state. Never delete task history, reset checkpoints, or
renumber IDs. Do not duplicate the full template inside `AGENTS.md`.

When creating a new task:

1. Read `tasks/TASK_TEMPLATE.md`.
2. Follow `.agents/skills/task-planning/SKILL.md`.
3. Discover relevant domain skills (via `SKILLS.md` + `docs/agent/skills-index.md`).
4. Generate the task from the template.
5. Verify the generated task (all sections, valid skill paths, index updated in `tasks/README.md`).

When executing a task:

1. Read the task file.
2. Follow `.agents/skills/task-execution/SKILL.md`.
3. Read required domain skills.
4. Follow checkpoints (CP0–CP4).
5. Update task status and evidence.
6. Maintain handoff context.

## 14. Skill Discovery and Selection

1. Read `AGENTS.md`.
2. Skim skill descriptions in `docs/agent/skills-index.md`
   (or the `description` frontmatter of each `.agents/skills/*/SKILL.md`).
3. Load only the `SKILL.md` files relevant to the task.
4. Read supporting `skills/frontend/` and `docs/agent/` files only when necessary.
5. Inspect affected source files.
6. Plan and implement the requested changes.
7. Verify the result per the skill's Verification section.

If the agent does not support automatic skill discovery, read the relevant
`SKILL.md` files directly by path. Do not load every skill by default.
