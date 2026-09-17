---
name: nuxt-frontend
description: Implement and maintain the Nuxt admin console (pages, components, composables, SSR, state, UI, i18n) — use when work touches app/ directly.
---

# Nuxt Frontend

## Purpose

Primary guidance for `app/` work — create/edit pages, components, composables, plugins, middleware, state, styling, and i18n following conventions verified from real sources.

## When to Use

- Entity admin screens (list + `[crud]/[id].vue` form, search/paging) — also read `skills/frontend/CRUD.md`.
- Components/pages/Nuxt UI/styling/dark mode/i18n — also read `skills/frontend/UI.md`.
- State/forms/zod/DTOs/TypeScript — also read `skills/frontend/TYPES_VALIDATION.md`.
- SSR/hydration/middleware/plugins work.

## When Not to Use

- Network-contract/auth-flow-only work — use `api-integration` (plus `skills/frontend/API.md`/`AUTH.md`) as the lead.
- Task file creation/execution — use `task-planning`/`task-execution`.

## Required Reading

- `/AGENTS.md` (Nuxt/Vue rules, Snowflake rule, verification gates)
- `docs/agent/project-map.md` (architecture map)
- At least one domain skill per task: `skills/frontend/CRUD.md`, `skills/frontend/UI.md`, `skills/frontend/TYPES_VALIDATION.md`
- `docs/FRONTEND_FOOTGUNS.md` (when implementing/debugging a known trap)

## Repository Evidence

- Stack (VERIFIED): Nuxt `^4.5.2` (`app/` srcDir, `ssr: true`), Vue `^3.5.42`, TypeScript `^7.0.2`, Nuxt UI `^4.11.0` + Tailwind `^4.3.3`, `@nuxtjs/i18n ^10.6.0` (`no_prefix`, default `th`).
- 5 layouts: `app/layouts/ai.vue`, `chat.vue`, `default.vue`, `empty.vue`, `feed.vue`.
- Middleware: `app/middleware/00.seo.global.ts` → `01.auth.global.ts` → `02.check-permit.global.ts`.
- CRUD scaffold: `app/composables/useCrudList.ts` + `useCrudForm.ts` wrapping `usePagefecth.ts`; components `app/components/base/BaseTable.vue` + `BaseForm.vue`; reference pages `app/pages/app-user/`, `app-role/`, `permission/`, `api-client/`.
- State: namespaced `useState` (`auth:user`, `auth:navigations`, `ai:recent`, …); `app/stores/` is empty (no Pinia); no provide/inject.
- Types: `app/types/common.ts` (~768 lines), `models.ts` (`IdType` at `models.ts:7`), `props.ts`, `chart.ts`, `index.d.ts`; `shared/types/` is empty (do not create until a real sharing need exists).
- i18n: `i18n/locales/{en,th}/{app,base,helper,model,error}.json`; scripts use `useLang()`/`t()`, templates use `$t()`.
- Config: `nuxt.config.ts` (`runtimeConfig.public`, `imports.dirs: ['api']`, self-hosted fonts in `public/fonts/`).

## Workflow

1. Identify the scope (page/route, component, composable, types, form/zod, i18n, SSR) per template §5.
2. Open the existing implementation before editing (pages/routes, components, composables, types, i18n keys, `useState` keys).
3. Pick the existing pattern: CRUD via `useCrudList`/`useCrudForm`; tables via `BaseTable`; forms via `BaseForm` + zod `.describe(uiConfig(...))`.
4. Write code in SFC order (`<script setup lang="ts">` → `<template>` → `<style scoped>`), reactive-destructure props, type-tuple emits, `PascalCase` component files.
5. Add loading/empty/error/permission states and i18n in both `en`+`th`.
6. Check SSR safety (`import.meta.client`/`import.meta.server` guards) and Snowflake safety (`IdType`, never `Number(id)`).
7. Review the diff by eye against `skills/frontend/` (no test runner).

## Implementation Rules

- Always `<script setup lang="ts">` (add `generic="T"` for generic components); never Options API.
- Call the backend only via `useApi()` (network details live in `api-integration`).
- Never add new `any` (legacy `any` exists — do not grow it); never add `@ts-ignore` (3 legacy sites in `useAiChat.ts`).
- Never hardcode the backend host — use relative `'/api/...'` resolved against `runtimeConfig.public.apiBase`.
- Never scatter `ui:` overrides — theme defaults live only in `app/app.config.ts`.
- Never import from `app/pages/test/*`, `app/pages/example/*`, or `app/components/Temp.vue` (playground).
- Never import `drizzle-orm`/`mysql2` in `app/` (server-only); never run the migration in a frontend task.
- Every color decision needs a `dark:` variant; use theme tokens (`bg-default`, `text-muted`, …) instead of hardcoded grays.

## Anti-Patterns

- Hand-rolling list/paging/sort/search instead of `useCrudList`/`usePagefecth`.
- Wrong `crudName` casing (must be `PascalCase` — wrong casing silently breaks endpoint/routes/permissions).
- Using `useFetch`/`$fetch` for backend paths; using `useAsyncData`+`api` outside the 2 observed cache-once lookups.
- `z.any()` in new schemas; `toTypedSchema`/vee-validate (unused in this repo).
- Typing API dates as `Date` (must be `string`); fixing a contract typo (`ipAddredd`, `SearchParamiter`, …) on one side only.

## Verification

- `pnpm build` — must pass for runtime-affecting changes.
- `pnpm typecheck` — must pass with 0 errors (every error is real, never suppress).
- `pnpm lint` is enforced in CI (`.github/workflows/ci.yml`) — follow `eslint.config.mjs` by hand, but do not run repo-wide inside a task.
- Manual: open the changed routes; exercise list/search/sort/page/create/edit/delete; check loading/empty/error/403 states.

## Completion Criteria

- Changed files match the scope; no out-of-scope files.
- Types/validation/i18n (2 locales)/states complete.
- `pnpm build` + `pnpm typecheck` actually executed and passing (or docs-only records `NOT_APPLICABLE` with a reason).
- Handoff in the task file updated.
