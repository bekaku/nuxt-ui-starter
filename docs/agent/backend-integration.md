# Frontend to Spring Boot Integration (Backend Integration)

> This document reflects **the frontend view only** (reconstructed from call sites), not a Spring Boot specification.
> Backend access: `NOT_AVAILABLE` — no `/backend` in this workspace (VERIFIED 2026-09-17).

## 1. API Client Architecture (VERIFIED from `app/composables/useApi.ts`)

- The only correct path: `const api = useApi()` → `$fetch.create({ baseURL: apiBase })`.
- `api<T>()` returns `_data`; `api.raw<T>()` returns the full `FetchResponse`.
- Wrapper-added headers: `Accept-Apiclient: <apiClient>`, `Accept-Language: <locale|en>` — never set them per call.
- `credentials: 'include'` + SSR forwarding of the `cookie` header (`useRequestHeaders(['cookie'])`).
- Never set `Authorization: Bearer` manually (the old code is commented out at `useApi.ts:71-73,216`).
- No generic timeout/retry — the only retry is 401→refresh→retry once (`nuxtApp._refreshPromise` dedupe).
- Automatic toasts in `onResponse` (except 401/403) — never toast twice at the call site.
- `apiBase` comes from `useConfiguration()` → `useRuntimeConfig().public.apiBase` (default `'/api'`, override `NUXT_PUBLIC_API_BASE`); `cdnBase` is for downloads only.

## 2. Auth Integration (VERIFIED from `useAuth.ts`, `useApi.ts`, middleware, plugins)

| Area | Frontend-observed behavior |
|---|---|
| Login | `POST /api/auth/login` with `{ emailOrUsername (sanitized), password, loginFrom: 'WEB', deviceId }` (`useAuth.ts:51`) → checks `response.authenticationToken`, then `window.location.replace(continue ?? '/')`. |
| Refresh | `POST /api/auth/refreshToken` with `{}` + cookies (`useApi.ts:160-169`) — the empty body is intentional; do not "fix" it to send a refreshToken. |
| Logout | `POST /api/auth/logout` → on 200 `clearAuth()` + broadcast reload + `navigateTo('/auth/login')`. |
| Session | `GET /api/appUser/currentUserData` → `AppUser` + `!isAppException` guard before `setAuth` (`useAuth.ts:107-120`). |
| Linked accounts | `app/api/useAuthApi.ts` wraps list, link, switch, and remove requests; `useAuth.ts` reloads after a successful session change. Empty 200 responses are accepted for switch/remove. |
| Cookies | `_session_` / `_slid_` are HttpOnly (INFERRED — no `useCookie` token reads in the repo); JS may only read `_sid` (`useAppCookie.ts`) + `locale`. |
| SSR bootstrap | `app/plugins/00.auth.server.ts` (`fetchMe` + `initialAppNav`); `00.auth.client.ts` is a no-op. |
| Guards | `01.auth.global` (checks `useState`, not cookies) → `02.check-permit` (`requiresPermission` ANY-match, empty = allow, 403 → `showError`). |
| UI gating | `v-rbac` (`app/plugins/rbac.ts` — `el.remove()` on mount) + `definePageMeta({ requiresPermission })`. |

## 3. Endpoint Inventory (frontend-observed — method + path + type + usage)

| Method + Path | Request | Response type | Auth | Used at (VERIFIED) |
|---|---|---|---|---|
| `POST /api/auth/login` | `{ emailOrUsername, password, loginFrom, deviceId }` | `RefreshTokenResponse` | cookie set (INFERRED) | `useAuth.ts:51` |
| `POST /api/auth/refreshToken` | `{}` + cookies | `RefreshTokenResponse` | cookie | `useApi.ts:160` |
| `POST /api/auth/logout` | — | `ResponseMessage` | cookie | `useAuth.ts:91` |
| `GET /api/appUser/currentUserData` | — | `AppUser` | cookie | `useAuth.ts:109` |
| `POST /api/auth/linkedAccounts` | — | `LinkedAccount[]` (frontend type) | cookie | `app/api/useAuthApi.ts` |
| `POST /api/auth/linkAccount` | `LoginRequest` | `RefreshTokenResponse` (frontend type) | cookie | `app/api/useAuthApi.ts` |
| `POST /api/auth/switchAccount/{targetUserId}` | — | status 200, body may be empty | cookie | `app/api/useAuthApi.ts` |
| `POST /api/auth/removeLinkAccount/{targetUserId}` | — | status 200, empty body expected by caller | cookie | `app/api/useAuthApi.ts` |
| `GET <dynamic pageParam>` (`usePagefecth`) | `?page,size,sort,_q,_keyword` | `ApiResponse<T> \| T[]` (dual!) | cookie | `usePagefecth.ts:70` |
| `GET <fetchDataLink>` / `POST\|PUT <endpoint>` / `DELETE <endpoint>[/id]` | `body: data` | per entity | cookie | `useCrudForm.ts`, `useCrudList.ts` |
| `GET /api/permission/findAllPermission` | — | `Permission[]` (bare array) | cookie | `app-role/[crud]/[id].vue` |
| `GET /api/appRole/findAll` | — | `AppRole[]` (bare array) | cookie | `app-user/[crud]/[id].vue` |
| `POST\|DELETE /api/favoriteMenu` | — | ? (`UNKNOWN`) | cookie | `app/api/useFavoriteMenuApi.ts` |
| `POST /api/appUser/updateProfile`, `POST /api/appUser/selfUpdatePassword` | form data | ? (`UNKNOWN`) | cookie | `settings/*` |
| `POST api/fileManager/uploadChunkApi` + `POST api/fileManager/mergeChunkApi` (no leading `/` — copy verbatim) | `FormData` chunks | `FileUploadChunkResponse \| FileManager \| void` | cookie | `useUpload.ts` |
| `GET <downloadUrl>` (`baseURL: cdnBase`, `responseType: 'stream'`) | `?chunkSize` | stream | cookie | `useDownload.ts:140` |
| `POST /api/aiChat/stream` (`Accept: text/event-stream`, `signal`) | `{ message, conversationId, filterNames }` | `ReadableStream`/SSE | cookie | `useAiChat.ts:216` |

No OpenAPI/generated client was found in this workspace. Types in `app/types/` are hand-maintained frontend expectations, not a verified backend contract.

## 4. Conventions (frontend-observed)

- Case: observed request/response fields are generally camelCase (`createdDate`, `authenticationToken`). Preserve the affected endpoint's wire spelling; do not infer a universal backend convention.
- Pagination: `ApiResponse<T> { dataList, totalPages, totalElements, last, currentPage? }`, but several endpoints return bare arrays — callers must handle both (`usePagefecth.loadData`).
- Current frontend API date types are strings. Verify the affected endpoint's wire format before assuming ISO input or output.
- Nullables are inconsistent — use `isEmpty`/`isEmptyVal` + optional chaining.
- Errors: only `AppException { status: string; message; errors? }` + `ResponseMessage` drive toasts; `ServerException`/`ResponseEntity` are dead (never branch on them).
- IDs: Snowflake — use `IdType`, never `Number(id)`; new IDs via `app/utils/snowflake.ts`.
- Search wire: `GET {endpoint}?page(0-based)&size&sort&_q&_keyword` with `_q` as `term;term` (`SearchSeparator=';'`, longest-first operators) — the backend side is `BACKEND_NOT_ACCESSIBLE`.

## 5. SSR / Cookies / Refresh / Errors / SSE (Summary)

- SSR: forwards the `cookie` header and propagates refresh `Set-Cookie` via `event.node.res.setHeader`.
- Refresh: deduped via `nuxtApp._refreshPromise`, single retry, on failure → `navigateTo('/auth/login')` (client only).
- 401: toasts suppressed; never add per-page handlers (they double-fire).
- 403: never refreshed; route level reports `showError 403`.
- SSE: `POST /api/aiChat/stream` is parsed by `useAiChat.ts`; event names seen in that frontend parser do not verify backend event semantics (`BACKEND_NOT_ACCESSIBLE`).

## 6. Limitations and Items Requiring Verification (`BACKEND_NOT_ACCESSIBLE`)

1. All Spring Boot controllers/services/entities/DB schemas/validation/transaction/authorization rules.
2. Which envelope (`ApiResponse` vs bare array) each endpoint really returns (needs devtools/OpenAPI per endpoint).
3. Whether `RefreshTokenResponse.authenticationToken` is really set via `Set-Cookie`.
4. Backend SSE event contract (`sources`, `thinking`, …).
5. The exact ingestion status values (no frontend type yet).
6. Unread `runtimeConfig.public` keys (`apiDomain`, `timeOut`, …) — remove or wire up.
