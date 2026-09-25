---
name: api-integration
description: Add, change, or debug a call from this Nuxt console to the external Spring Boot API through useApi — endpoints, request/response DTOs, list envelopes, auth/session requests, uploads, downloads, and SSE streaming. Use whenever a backend path, payload, or response type is touched. Pair with nuxt-frontend or crud-module for the UI side.
---

# API integration

All backend traffic goes through `useApi()` (`app/composables/useApi.ts`). The Spring Boot backend
is in another repository and is **not** available here (`BACKEND_NOT_ACCESSIBLE`): you can see what
the frontend sends and expects, never what the backend really does.

## When to use

- Add a new backend call, or change a method, path, query, body, or response type.
- Add a domain helper in `app/api/` (only when one is actually needed — see below).
- Debug 401/403, missing toasts, double toasts, empty lists, SSR cookie problems, upload/download/stream issues.

Not needed for UI-only changes that reuse an existing call unchanged. Standard entity CRUD
endpoints are already handled by the scaffold (`crud-module`).

## Read first

1. `AGENTS.md` §8 (evidence rules).
2. `app/composables/useApi.ts` and the call site you will change, plus its types in `app/types/`.
3. `docs/API_CONTRACT.md` — the endpoint inventory as consumed by this frontend (not backend proof).
4. Only when needed: `skills/frontend/API.md` (wrapper details), `skills/frontend/AUTH.md` (session, linked accounts, guards).

## What `useApi()` already does (do not repeat it)

- `baseURL = runtimeConfig.public.apiBase`; sets `Accept-Apiclient` and `Accept-Language` (from the `locale` cookie).
- `credentials: 'include'`; during SSR forwards the incoming `cookie` header.
- On **401**: one shared refresh (`POST /api/auth/refreshToken`, empty body, `nuxtApp._refreshPromise`),
  then retries the request once; if refresh fails, navigates to `/auth/login`.
- On any non-401/403 response whose body is an `AppException` or `ResponseMessage`, shows a toast automatically.
- Does **not** refresh on 403 and does not toast 401/403.

## Choose the call style

| Need | Use |
|---|---|
| Just the parsed body | `await api<T>('/api/foo', { method: 'GET' })` |
| Status code, or success can have an empty body | `const res = await api.raw<T>(...)`; check `res.status`, read `res._data` |
| Data for SSR render | `await useAsyncData('<unique-key>', () => api<T>('/api/...'))` |
| Paged / searchable list | `usePagefecth<T>({ apiEndpoint: '/api/foo', ... })` (or `useCrudList` for CRUD screens) |
| Chunked file upload | `useUpload().onUploadChunk(file, opts)` → `FileManager \| null` |
| File download with progress | `useDownload().downloadFile(config)` (uses `cdnBase`, not `apiBase`) |
| SSE stream | `api<ReadableStream>(path, { method: 'POST', responseType: 'stream', headers: { Accept: 'text/event-stream' }, signal })` — see `useAiChat.ts` |

## Where the call lives

**Default: call `useApi()` directly** in the page, component, or composable that needs it
(`const api = useApi()`). Creating a file in `app/api/` is **optional, not required**.

- One or a few calls used by one screen → call `useApi()` directly. Do not create an `app/api/` file.
- A helper for that endpoint already exists in `app/api/` → reuse it instead of duplicating the call.
- Create `app/api/use<Domain>Api.ts` only when it clearly helps: the same endpoint(s) are called from
  several files, or the call carries shared logic (payload building, status interpretation) that
  would otherwise be copied. Helpers are auto-imported:
  ```ts
  import type { Foo } from '~/types/models'

  export const useFooApi = () => {
    const api = useApi()

    const findAll = async (): Promise<Foo[] | null> => {
      return api<Foo[]>('/api/foo/findAll', { method: 'GET' })
    }

    return { findAll }
  }
  ```
- Behavior for **every** request (headers, refresh, notifications) → `useApi.ts` only. This is rare; say why in the report.

## Recipe: add or change a call

1. **Record the contract** you are about to depend on: method, path, query/body, response type,
   success status, error shape. Look for the same endpoint first:
   `grep -rn "/api/foo" app docs/API_CONTRACT.md`.
2. **Evidence**: if the endpoint or shape is new or changed, you need a devtools capture or OpenAPI excerpt.
   Without it: keep the existing type unchanged, write the proposed shape in the task file's
   `External Backend Dependencies` (or the report) labelled `NOT_VERIFIED` / `BACKEND_NOT_ACCESSIBLE`.
3. **Types**: add or update the interface in `app/types/models.ts` (entity) or `common.ts` (envelope/infra).
   Keep wire field names exactly as sent, including typos (`ipAddredd`). IDs are `IdType`.
4. **Call it** from the right place (above) and handle the outcome at the caller:
   ```ts
   const loading = ref(false)
   const onSave = async () => {
     loading.value = true
     try {
       const res = await api.raw<Foo>('/api/foo', { method: 'POST', body: state.value })
       if (res.status === 200 || res.status === 201) {
         // update local state / navigate; add a success toast only if the body is not a ResponseMessage
       }
     } catch (error) {
       console.error('onSave', error) // the wrapper already toasted AppException; keep the UI consistent
     } finally {
       loading.value = false
     }
   }
   ```
5. **Update `docs/API_CONTRACT.md`** C1 inventory when you add an endpoint the frontend now depends on.

## Rules

- MUST call backend paths via `useApi()` — directly, or through an existing `app/api/*` helper. Never bare `$fetch` / `useFetch` to `/api/...` of the backend.
- An `app/api/*` helper is optional; do not create one just to wrap a single call.
- MUST use paths relative to `apiBase` (`/api/<camelCaseEntity>...`). Keep the existing upload paths
  `api/fileManager/uploadChunkApi` and `mergeChunkApi` **without** a leading slash.
- MUST keep both list branches: `ApiResponse<T>` (`dataList`, `totalPages`, `totalElements`, `last`) **and** bare `T[]`.
- MUST NOT read, write, or log `_session_` / `_slid_` cookies or set an `Authorization` header.
- MUST NOT add page-level 401 handling, refresh logic, or login redirects.
- MUST NOT add a second toast for an `AppException` / `ResponseMessage` the wrapper already showed —
  but still set an error state or return a fallback so the UI does not hang.
- MUST NOT invent endpoints, fields, status codes, or permission codes; unverified items are labelled.
- MUST NOT import `server/database/*`, `drizzle-orm`, or `mysql2` into `app/`. `server/api/mock/*` and
  `server/api/meta.ts` are local Nitro handlers, not the Spring Boot API.
- SSE: keep partial output on disconnect, abort with `AbortController`, render citations only from the `sources` event.

## Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| Works in browser, 401 during SSR | Used `$fetch`, so cookies were not forwarded | Use `useApi()` |
| Two error toasts | Manual `toast.add` in `catch` for a wrapper-handled error | Remove the manual one |
| No toast for a backend error | Body is not an `AppException` / `ResponseMessage` shape (e.g. numeric `status` + `path`) | Handle at caller; flag the contract drift |
| Account switch "fails" but actually worked | Success returns 200 with empty body; code checked `_data` | Use `api.raw` and check `status` (see `useAuthApi.ts`) |
| List silently empty | Envelope missing one of the four `ApiResponse` fields | Capture the real response; keep both branches |
| ID changed after round-trip (`…001` → `…000`) | Snowflake ID converted to `number` | Keep `IdType` / string |
| `useAsyncData` returns another page's data | Duplicate key | Use a unique key per data set |

## Done checklist

- [ ] `pnpm typecheck` passes; `pnpm build` passes for runtime changes.
- [ ] Every backend call goes through `useApi()` (directly or via an existing helper); paths are relative to `apiBase`.
- [ ] No new `app/api/*` file unless the call is shared by several files or carries reusable logic.
- [ ] No cookie/token access in JS; no page-level refresh; no duplicate toasts; failures leave the UI in a defined state.
- [ ] New/changed endpoints recorded in `docs/API_CONTRACT.md`; shapes without live evidence labelled `NOT_VERIFIED`.
- [ ] If a live backend was available, the request, response, cookies, and error path were inspected;
      otherwise the report names each integration check left unverified.
- [ ] For a numbered task, `External Backend Dependencies` and `Verification Results` are filled.
