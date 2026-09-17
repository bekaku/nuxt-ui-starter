---
name: api-integration
description: Maintain Nuxt to external Spring Boot backend integration via useApi (auth, cookies, refresh, SSR, errors, pagination, SSE) — use when work touches the network contract.
---

# API Integration

## Purpose

Keep all external Spring Boot API calls on the single `useApi()` path, correct on both client and SSR (cookies, refresh, errors, envelopes, SSE), without inventing backend implementations.

## When to Use

- Backend calls, `useApi()` changes, CRUD network behavior, upload/download, SSE/streaming.
- Login/session/refresh/401/403 work (also read `skills/frontend/AUTH.md`).
- New endpoints or request/response DTO changes.

## When Not to Use

- Pure UI/state/form work with no network impact — use `nuxt-frontend`.
- Task file creation/execution — use `task-planning`/`task-execution`.

## Required Reading

- `/AGENTS.md` (API Contract Rule + Snowflake rule)
- `docs/agent/backend-integration.md` (integration inventory + limitations)
- `docs/API_CONTRACT.md` (frontend-observed contract: C1–C5)
- `skills/frontend/API.md` (detailed `useApi` rules) and `skills/frontend/AUTH.md` (for auth flows)

## Repository Evidence

- Single client: `app/composables/useApi.ts:37-258` (`$fetch.create({ baseURL: apiBase })`); `api<T>()` returns `_data`, `api.raw<T>()` returns the full `FetchResponse`.
- Headers: `Accept-Apiclient` + `Accept-Language` (`useApi.ts:47-52`); `credentials: 'include'` + SSR `cookie` forwarding (`useRequestHeaders(['cookie'])`); never set `Authorization` manually (`useApi.ts:71-73,216` is commented out).
- 401 flow: dedupe via `nuxtApp._refreshPromise` → `POST /api/auth/refreshToken` (empty body `{}` + cookies, `useApi.ts:160-169`) → single retry → on failure `navigateTo('/auth/login')` (client-only); SSR propagates `Set-Cookie` (`useApi.ts:170-195`); 403 never refreshes (`useApi.ts:87`).
- Auth calls: `POST /api/auth/login` (`useAuth.ts:51`, body `{ emailOrUsername (sanitized), password, loginFrom: 'WEB', deviceId }`), `GET /api/appUser/currentUserData` (`useAuth.ts:109` + `isAppException` guard), `POST /api/auth/logout` (`useAuth.ts:91`).
- Envelopes: `ApiResponse<T> { dataList, totalPages, totalElements, last, currentPage? }` (`app/types/common.ts:164-172`) vs bare arrays (`Permission[]`, `AppRole[]`) — callers must handle both (`usePagefecth.ts:107-140`).
- Upload: `POST api/fileManager/uploadChunkApi` + `mergeChunkApi` (no leading `/` — copy verbatim, `useUpload.ts:138,184`); download: `baseURL: cdnBase` + `responseType: 'stream'` (`useDownload.ts:140`).
- Chat SSE: `POST /api/aiChat/stream` (`responseType: 'stream'`, `Accept: text/event-stream`, `useAiChat.ts:216`); `ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'` (`useAiChat.ts:6`).
- Config: `apiBase` defaults to `'/api'`, override `NUXT_PUBLIC_API_BASE`; `cdnBase` override `NUXT_PUBLIC_CDN_BASE` (`nuxt.config.ts:178-249`, `.env.example`).
- No OpenAPI/generated client in the repo — `app/types/` is the single hand-maintained contract source.

## Workflow

1. Identify the endpoint (method + path) and the calling frontend file (path + line).
2. Open `app/types/` (request/response DTOs) + the `docs/API_CONTRACT.md` inventory and compare with the call site.
3. For new/changed shapes: capture live evidence (devtools response or OpenAPI excerpt) into the task before coding.
4. Implement via `useApi()` (`api` or `api.raw`) inside `try/catch` (never let it throw uncaught); CRUD pages use `useCrudList`/`useCrudForm`/`usePagefecth` instead of hand-rolled fetching.
5. Handle both `ApiResponse<T>` and bare `T[]` for lists; parse errors via `isAppException`/`isServerResponseMessage` (the wrapper already toasts — never toast twice).
6. Fill `External Backend Dependencies` in the task (`NOT_VERIFIED` until evidence exists; a proposed contract is not reality).
7. Verify with `pnpm build`/`pnpm typecheck` + exercise the real route.

## Implementation Rules

- Backend calls go through `useApi()` only; bare `$fetch` is allowed only for the 3 Nitro-local targets (`/api/mock/chat/*`, `/api/meta?url=`); `useFetch` only for `/api/mock/*`; `useAsyncData`+`api` only for the 2 cache-once lookups (`permission-all`, `app-role-all`).
- Paths are always relative `'/api/...'`; `cdnBase` is for downloads only; never hardcode a host.
- Never set `Accept-Apiclient`/`Accept-Language`/`Content-Type` manually; no per-call `timeout` (except `useDownload.ts:140`); no manual retry/backoff (except the chunk-upload loop in `useUpload.ts`).
- Never read token cookies (`_session_`/`_slid_`) in JS; never `useCookie('_session_')`.
- The refresh body must stay an empty `{}` (intentional) — do not "fix" it to send a refreshToken.
- Snowflake IDs: `IdType`, never `Number(id)`; dates are exchanged as ISO `string`.
- Search wire: `?page(0-based)&size&sort&_q&_keyword` (`SearchSeparator=';'`, longest-first operators in `app/libs/constants.ts`) — the backend side is `BACKEND_NOT_ACCESSIBLE`.

## Anti-Patterns

- Citing `backend/.../*.java` paths (not in this workspace — old citations were withdrawn).
- Treating an API call as proof of backend implementation (a call proves only a frontend expectation).
- Adding manual error toasts for `AppException`/`ResponseMessage` (double-toast).
- Writing per-page 401 handlers (double-fires with the wrapper); using `ResponseEntity`/`ServerException` (dead).
- "Fixing" the leading slash of `uploadChunkApi`/`mergeChunkApi` (changes resolution against `baseURL`).

## Verification

- `pnpm build` + `pnpm typecheck` (0 errors) for runtime-affecting work.
- Devtools check: request shape/path/query matches the contract, no duplicate toasts on success+error paths, single retry on 401, cookies forwarded on SSR.
- The task Verification table filled with real evidence (devtools excerpt or `NOT_VERIFIED`).

## Completion Criteria

- Every touched endpoint has a complete inventory entry (method/path/types/auth/error handling/usage).
- Dual-shape lists still handle both shapes; IDs/dates serialize correctly.
- `External Backend Dependencies` is complete; backend-pending integration is recorded as a blocker (never fake `DONE`).
