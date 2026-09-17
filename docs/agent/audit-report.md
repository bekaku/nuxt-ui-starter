# Audit Report

Inspection date (UTC): 2026-09-17. Branch: `main`.
Uncommitted changes at audit time: agent documentation and skills only
(`AGENTS.md`, `SKILLS.md`, root `TASK_TEMPLATE.md`, `skills/frontend/*`,
`tasks/README.md`); application source untouched. A structural alignment pass
against the reference project followed (see `docs/agent/structure-alignment.md`).
No secrets were read (`.env` was listed but never opened; only `.env.example`
was inspected).

## Inspection Coverage

Read fully or in relevant part: `AGENTS.md`, `SKILLS.md`, root and canonical
`TASK_TEMPLATE.md`, all 6 files under `skills/frontend/`, all 4 files under
`.agents/skills/`, `docs/{API_CONTRACT,FRONTEND_FOOTGUNS,FRONTEND_OPEN_QUESTIONS,
SPLIT_MAP}.md`, `README.md`, `package.json`, `nuxt.config.ts`, `tsconfig.json`,
`.env.example`, `eslint.config.mjs`, `renovate.json`, `.github/workflows/ci.yml`,
`app/{composables/useApi,composables/useAuth,middleware,pages,types}`,
`app/api/useFavoriteMenuApi.ts`, `app/libs/constants.ts`, plus directory
listings of `app/`, `server/`, `shared/`, `i18n/`, `.github/`, `tasks/`.

NOT inspected line-by-line: every page/component (covered by representative
traces + the CRUD reference modules `app-user/`, `app-role/`, `permission/`,
`api-client/`). Generated/caches excluded: `node_modules/`, `.nuxt/`.

Classification: findings below are VERIFIED (read in source) unless marked
INFERRED (structure-implied, spot-checked), UNKNOWN, or BACKEND_NOT_ACCESSIBLE.

## Verified Findings

- Nuxt `^4.5.2` SSR + Nuxt UI `^4.11.0` + Tailwind `^4.3.3` + Vue `^3.5.42` +
  TypeScript `^7.0.2` + pnpm `11.9.0` — all confirmed in `package.json` /
  `nuxt.config.ts`.
- `useApi()` single-flight 401→refresh→retry + SSR cookie forward, `useAuth`
  session bootstrap, `00.seo → 01.auth → 02.check-permit` middleware order,
  `v-rbac` directive, `ApiResponse<T>` vs bare `T[]` dual-shape lists,
  `ChatStatus` (`ready | submitted | streaming | error`) — all read in source.
- Snowflake `IdType`, `usePagefecth.ts` typo, `app/stores/` empty (no Pinia),
  `shared/types/` empty, 5 layouts, no test files — confirmed.
- Existing agent config before alignment: root `AGENTS.md` + `SKILLS.md` +
  `skills/frontend/` (6 files) + root `TASK_TEMPLATE.md` + `tasks/` template and
  index. No `CLAUDE.md` / `GEMINI.md` / copilot-instructions / `.cursor` /
  `.claude` / `.codex` / `.opencode` / `.gemini` — confirmed absent via
  directory listing (adapters created during alignment).

## Documentation Conflicts (Resolved During Alignment)

1. Former `AGENTS.md` claimed a `/backend` directory and `/frontend/*` paths
   inside this repo. Both were wrong — this repo IS the Nuxt root and the
   Spring Boot backend is a separate, inaccessible repository. Removed.
2. Former skills claimed "no CI / no `.github`", "3 layouts", "no
   `server/database/`", "TypeScript pinned to 5.x", "`@ts-ignore` fully
   removed". All contradicted the working tree (CI workflow, 5 layouts,
   migration tooling, TS `^7.0.2`, 3 remaining `@ts-ignore` sites). Corrected.
3. Former `CRUD.md` cited `backend/.../*.java` sources and a `tasks/002-*`
   file. Neither exists in this workspace. Citations withdrawn; the separator /
   operator rules stand as frontend-observed conventions only.

## Architectural Risks

- The backend contract is reconstructed from frontend call sites only
  (`docs/API_CONTRACT.md`, `docs/agent/backend-integration.md`). Any endpoint
  assumed to return one envelope may return the other — callers keep the
  dual-shape fallback until live evidence confirms each endpoint.
- `01.auth` guard reads `useState` only — after a hard refresh without SSR
  bootstrap it redirects to login even with valid cookies; `fetchMe` must run
  first (see `docs/FRONTEND_FOOTGUNS.md`).
- `v-rbac` removes elements from the DOM on mount — permission-hidden elements
  are gone, not `v-show` (see `docs/FRONTEND_FOOTGUNS.md`).

## Missing Information

- Live network evidence per endpoint (devtools / OpenAPI) — contract details
  stay `NOT_VERIFIED` until captured.
- Backend SSE event semantics, ingestion status enum, unread
  `runtimeConfig.public` keys — recorded in `docs/FRONTEND_OPEN_QUESTIONS.md`
  and `docs/agent/backend-integration.md`.
- Runtime skill activation on Codex / Claude / Cursor / Copilot / Gemini was
  not tested here — marked accordingly in `docs/agent/compatibility.md`.
