---
name: nuxt-frontend
description: Implement or change Nuxt pages, components, composables, state, forms, styling, and i18n in app/ or i18n/. Pair with api-integration when the backend contract changes.
---

# Nuxt frontend

Use this skill for application UI work. Read `AGENTS.md` first, then inspect the affected files and the closest production example. `docs/agent/project-map.md` is a navigation aid; source code wins if it differs.

## Find the right pattern

| Work | Start with | Read when needed |
|---|---|---|
| Entity list or form | `app/pages/app-user/`, `app/pages/app-role/`, `app/composables/useCrudList.ts`, `useCrudForm.ts`, `usePagefecth.ts` | `skills/frontend/CRUD.md` |
| Components, layout, theme, locale | A nearby production component, `app/app.config.ts`, `app/assets/css/main.css`, matching `i18n/locales/{en,th}/` files | `skills/frontend/UI.md` |
| Shared state, form, types | Relevant composable, `app/types/`, the form using its model | `skills/frontend/TYPES_VALIDATION.md` |
| Auth UI or permissions | `app/composables/useAuth.ts`, `useRbac.ts`, `app/middleware/`, `app/plugins/rbac.ts` | `skills/frontend/AUTH.md`; add `api-integration` for network changes |
| API request, DTO, upload, streaming | `app/composables/useApi.ts` and the call site | `api-integration` and its selected references |

`app/pages/example/`, `app/pages/test/`, and `app/components/Temp.vue` are demos. Prefer production modules as implementation examples. `server/api/` contains local Nitro handlers; the external Spring Boot backend is not in this workspace.

## Implement

1. Trace the route or component through its composable, API call, type, permission code, and locale keys. Check callers before changing a shared component or composable.
2. Reuse `BaseTable`, `BaseForm`, and CRUD composables where their contracts fit. In a CRUD list, `apiEndpoint` is the complete list URL; in `useCrudForm`, it is a prefix joined with `crudName`. Preserve existing API and permission naming.
3. Keep Vue SFCs in `<script setup lang="ts">` then `<template>` order. Use namespaced `useState` for shared app state, `defineModel` for two-way component state, and guard browser APIs during SSR.
4. Add user-facing keys to both English and Thai locale files. Check loading, empty, error, and permission behavior relevant to the changed screen.
5. Keep Snowflake IDs precision-safe with `IdType`; do not convert them to `number`. Avoid new `any` and `@ts-ignore`.

For backend paths use `useApi()`; the wrapper owns cookies, refresh, and common notifications. Client permission controls are presentation only; the backend owns authorization.

## Verify

- Inspect the diff and run `pnpm typecheck`; run `pnpm build` for runtime changes, as required by `AGENTS.md`.
- Exercise the changed route or component when a running app is available. Record manual checks that could not be performed.
- For an existing numbered task, also follow `task-execution` and update its checkpoints during the work.
