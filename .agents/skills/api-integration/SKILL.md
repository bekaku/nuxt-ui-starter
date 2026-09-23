---
name: api-integration
description: Change or debug the Nuxt to external Spring Boot network boundary through useApi, including auth, DTOs, pagination, uploads, downloads, and SSE. Pair with nuxt-frontend for UI changes.
---

# API integration

Read `AGENTS.md`, `app/composables/useApi.ts`, the affected call site, and its types before editing. `docs/API_CONTRACT.md` describes frontend expectations reconstructed from code; it is not proof of backend behavior. Read `skills/frontend/API.md` for request mechanics and `skills/frontend/AUTH.md` for auth work.

## Trace the contract

1. Record the actual caller, HTTP method, path, body/query, response type, and error handling. Check `app/api/` as well as `app/composables/` and pages; `app/api/useAuthApi.ts` and `useFavoriteMenuApi.ts` both wrap `useApi()`.
2. Before changing a frontend DTO or endpoint contract, capture a live response or OpenAPI evidence as required by `AGENTS.md` §8. If unavailable, leave the implemented shape unchanged and document the proposed shape as `UNKNOWN` / `BACKEND_NOT_ACCESSIBLE` in the numbered task when one exists. Do not invent backend code or permissions.
3. Check whether the affected list handles `ApiResponse<T>` and bare arrays; preserve the dual-shape convention documented in `docs/API_CONTRACT.md` C2. Keep Snowflake IDs precision-safe.
4. Change the wrapper only for cross-cutting behavior. Keep request-specific logic at the call site or domain API helper. Handle failures at the responsible UI/composable boundary; do not add a second toast for an error or message the wrapper already reports.

## Boundaries that matter

- External backend requests go through `useApi()` (regular or `.raw`). Local Nitro handlers under `server/api/` can use Nuxt local-fetch patterns. `useAsyncData` can wrap `useApi()` when SSR data loading or caching is appropriate; the two existing reference lookups are examples, not a hard limit.
- `useApi()` sets `Accept-Apiclient`, `Accept-Language`, cookie credentials, SSR cookie forwarding, and one refresh/retry after a 401. Keep token cookies out of JavaScript and preserve the empty refresh body. Do not add page-level refresh logic or duplicate wrapper notifications.
- The backend repository is unavailable. `server/api/mock/*` and `server/api/meta.ts` are local Nitro handlers, not Spring Boot implementations. `server/database/` is migration tooling, not app runtime.
- Preserve endpoint spelling already consumed by this frontend, including the upload path without a leading slash, until verified contract evidence supports changing it.

## Verify

Run `pnpm typecheck` and `pnpm build` for runtime changes. When a live backend is available, inspect the request, response, cookies, and error path for the affected endpoint. Otherwise state exactly which integration check remains unverified. For a numbered task, update its `External Backend Dependencies` and verification evidence.
