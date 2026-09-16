# Frontend AGENTS.md

## Scope

Applies to all code under `frontend/`.

Stack (verified against `package.json` / `nuxt.config.ts`):

- Nuxt 4 (`app/` srcDir), SSR enabled (`ssr: true`)
- Vue 3 Composition API, `<script setup lang="ts">`
- TypeScript (`strict`, `noUncheckedIndexedAccess`)
- Nuxt UI v4 + Tailwind CSS v4
- `@nuxtjs/i18n` (`no_prefix`, default `th`)
- pnpm

Read `/AGENTS.md` first.

---

## Routing — what to read next

```text
/AGENTS.md                  repository rules (always)
/frontend/AGENTS.md         this file (always, for frontend work)
/frontend/SKILLS.md         router → load ONLY the skill files it points to
/frontend/TASK_TEMPLATE.md  only when creating a new frontend task
```

Do not load every file under `skills/frontend/` or `docs/` by default. `SKILLS.md`
maps task area → file.

### Non-authoritative files — do not use as guidance

- `docs/REVIEW_CODE_BASE_PROMT.md` is the **prompt** that generated the original
  frontend review, not project guidance. It describes a standalone starter repo and
  states the backend is inaccessible — that is no longer true (the backend lives at
  `/backend` in this repository). Do not follow its instructions as rules.
- `docs/SPLIT_MAP.md` is a historical map of how the original monolithic `SKILLS.md`
  was split. Reference only.

---

## What This Application Is

This frontend is the platform's **internal administration console** for the backend.

- Its audience is administrators and explicitly authorized staff — **not** end users.
  Every route is behind authentication and RBAC; there is no public/anonymous surface.
- Its job is managing backend state: users, roles, permissions, API clients, the AI
  knowledge base, documents, and operational triggers.

Consequences for any task:

- The backend API has at least two consumers (this console and the external client), so
  a contract change is never "frontend-only". Treat contract work as cross-stack and
  use `/TASK_TEMPLATE.md`.
- Do not weaken a backend authorization rule because this console's users are admins.
  Authorization stays server-owned.

## Frontend Responsibilities

The frontend owns:

- user / role / permission / API-client administration (`app/pages/app-user/`, `app-role/`, `permission/`, `api-client/`)
- generic CRUD scaffolding (`useCrudList` / `useCrudForm` / `usePagefecth`)
- typed API clients and the hand-maintained contract types in `app/types/`
- composables and page/component state
- validation for user experience
- loading/empty/error states
- accessibility, responsive behavior and i18n (`en` + `th`)

The frontend does **not** own authoritative authorization or tenant isolation.
Permission gating in the UI (`v-rbac`, `requiresPermission`) is presentation only.

## Nuxt / Vue Rules

Prefer:

- `<script setup lang="ts">` (`generic="T"` for generic components)
- explicit TypeScript types
- `useApi()` — the only sanctioned backend client
- Nuxt UI components over raw HTML
- SSR-safe code (`import.meta.client` / `import.meta.server` guards)
- small focused components; `computed` for derived state; composables for reuse

Avoid:

- `any` (see `skills/frontend/TYPES_VALIDATION.md` — legacy `any` exists; do not add more)
- `@ts-ignore` (5 existing sites, all in `useAiChat.ts` — do not add more)
- duplicating backend business rules
- browser globals in SSR paths without guards
- bare `$fetch` / `useFetch` against backend paths
- silently swallowing API errors, or adding manual toasts the wrapper already raises
- hard-coded backend hosts — always relative `'/api/...'` against `runtimeConfig.public.apiBase`

---

## API Contract Rule

Backend contracts are authoritative, and the backend is **in this repository**
(`/backend`). Unlike the original standalone-starter review, you can and should
verify against real backend source.

Before changing frontend DTOs/types:

1. inspect the existing frontend wrapper/types (`app/composables/useApi.ts`, `app/types/`);
2. inspect the backend controller/DTO under `/backend` (see `/backend/SKILLS.md`);
3. reuse existing response-envelope conventions;
4. do not invent fields, status codes or permissions.

`docs/API_CONTRACT.md` records the contract **as this frontend consumes it**. It is
reconstructed from call sites, not read from the backend — when they disagree, the
backend source wins and `docs/API_CONTRACT.md` must be corrected.

---

## Snowflake ID Rule

Backend IDs are Snowflake IDs and may exceed JavaScript's safe integer range.

- Do not coerce Snowflake IDs to JS `number`.
- Use the existing `IdType = bigint | string | null | undefined` (`app/types/models.ts`).
- Keep ID comparisons and API route construction precision-safe.
- For client-generated IDs use `app/utils/snowflake.ts`; `app/libs/Snowflake.ts` is legacy.

---

## RAG Chat Test Harness

`useAiChat.ts` is the single RAG chat client in this repository, and it is a **test
harness** (see above), not the product chat UI. Its `status` values are:

```text
idle | submitting | streaming | completed | failed
```

Streaming is SSE over `POST /api/aiChat/stream` with `responseType: 'stream'`.
Event types consumed today: `chat_id`, `title`, `thinking`, `token`, `sources`, `done`
(see `docs/API_CONTRACT.md` § C6).

When touching chat:

- preserve partial assistant output on disconnect;
- keep message identity stable (`id` per message);
- guard against duplicate submissions (`abortController`);
- preserve intentional scroll behavior;
- never fabricate citations/sources — render only what the `sources` event carries.

---

## Ingestion UI

Ingestion is asynchronous on the backend. Ingestion *monitoring* is an administrative
concern, so it can legitimately live in this console. When such UI is built, distinguish:

```text
upload accepted
QUEUED/PENDING
PROCESSING
COMPLETED
FAILED
UNCHANGED
```

Do not treat a successful upload as equivalent to RAG-ready.
Use backend-provided status rather than inferring it locally.
Confirm the actual status enum against the backend before coding it — no frontend
status type for this exists yet.

---

## Verification

The project gates are:

```bash
pnpm build       # nuxt build     — MUST pass
pnpm typecheck   # nuxt typecheck — MUST pass (0 errors)
```

Both must pass for any runtime-affecting change, and neither may be reported as passing
unless it was actually executed. A typecheck error is a real error — fix it, never
suppress it with `@ts-ignore`.

`pnpm lint` is **not** a project gate. `eslint.config.mjs` still records the intended
house style (`skills/frontend/SKILL.md` § F10) and you should follow it by hand, but do
not run `eslint` repo-wide as part of a task and do not treat its exit code as a
verification result.

There is no test runner and no CI workflow in this repository, so `pnpm build` plus
`pnpm typecheck` are the only automated checks. Style and convention adherence is on
you — follow `skills/frontend/` and keep changes small enough to review by eye.

`typescript` is pinned to `~5.9.3` in `package.json`, and `renovate.json` constrains it
to `<6.1.0`, because `vue-tsc` (which powers `pnpm typecheck`) still requires
`typescript/lib/tsc`, a subpath TypeScript 7 removed. Bumping past the pin breaks the
typecheck gate. Leave it alone unless a task is explicitly about the toolchain.

Never run backend build commands (`mvn`, `gradle`) from `frontend/`, and never run
`pnpm migrate:mysql:pg` — its target file does not exist.

---

## Tasks

Frontend task specifications live in:

```text
frontend/tasks/<number>-<short-name>.md
```

Use `/frontend/TASK_TEMPLATE.md` to create one. List `frontend/tasks/` first and take
the next free number. A task file's existence does not mean it is implemented — its
`Progress Checklist` and `Resume State` are the implementation-state source of truth
and must be verified against repository state.

For work that changes a backend contract, use the root `/TASK_TEMPLATE.md` instead —
it has the cross-stack contract sections.
