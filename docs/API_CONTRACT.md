# API Contract — As Consumed by This Frontend

This is reference documentation, not a global coding skill. Read it only when endpoint, request, response, authentication attachment, error parsing, or contract re-verification is relevant.

## PART 2 — API Contract (as consumed by this frontend)

> NOTE: reconstructed SOLELY from how this frontend calls/consumes the API. NOT confirmed backend behavior. If a SKILLS.md or equivalent exists in the backend (Spring Boot) repo, a human MUST reconcile that file with this section in a session where both repos are accessible. When the backend contract changes, re-verify this section against live network responses (browser devtools) or an OpenAPI spec — NEVER assume it is still accurate.

### C1. The single correct call pattern

- Backend (Spring Boot at `apiBase`, prod e.g. `http://localhost:8080`) MUST be called ONLY via `useApi()` (`app/composables/useApi.ts`). Ad-hoc `$fetch`/`useFetch`/`useAsyncData`-without-`api` to backend paths is FORBIDDEN (see F2 for the only Nitro-mock exceptions).

- Wrapper behavior (do not reimplement): `baseURL: apiBase`; headers `Accept-Apiclient: <apiClient>`, `Accept-Language: <locale|en>`; `credentials: 'include'` + SSR `cookie` forwarding (`useRequestHeaders(['cookie'])`); NO timeout; NO generic retry; auto success/error toasts (see C4); single 401→refresh→retry.

- Representative endpoint inventory OBSERVED from call sites (method + path + payload shape as sent):

  - `POST /api/auth/login` `{ emailOrUsername (sanitized), password, loginFrom: 'WEB', deviceId }` → `RefreshTokenResponse` (`useAuth.ts:51`)

  - `POST /api/auth/refreshToken` `body: {}` + cookies → `RefreshTokenResponse` (`useApi.ts:160-169`)

  - `POST /api/auth/logout` no body → `ResponseMessage` (`useAuth.ts:91`)

  - `GET /api/appUser/currentUserData` → `AppUser` (`useAuth.ts:109`)

  - `GET <dynamic pageParam>` (`usePagefecth.ts:70`, `useCrudList.ts`) with query `?page,size,sort,search…` built from `SearchOperation` constants → `ApiResponse<T> | T[]` (dual-shape!)

  - `GET <fetchDataLink>` / `POST|PUT <endpoint>` with `body: data` / `DELETE <endpoint>[/id]` (`useCrudForm.ts:77,176,231`, `useCrudList.ts:186`)

  - `GET /api/permission/findAllPermission` → `Permission[]` bare array (`app-role/[crud]/[id].vue:80`)

  - `GET /api/appRole/findAll` → `AppRole[]` bare array (`app-user/[crud]/[id].vue:160`)

  - `POST|DELETE /api/favoriteMenu` (`app/api/useFavoriteMenuApi.ts:7,13`)

  - `POST /api/appUser/updateProfile`, `POST /api/appUser/selfUpdatePassword` (`settings/index.vue:70`, `settings/security.vue:40`)

  - `POST api/fileManager/uploadChunkApi` (multipart `FormData` chunks, own retry loop) → `POST api/fileManager/mergeChunkApi`; note MISSING leading slash — copy as-is (`useUpload.ts:138,184`)

  - `GET <downloadUrl>` with `{ baseURL: cdnBase, responseType: 'stream', query: { chunkSize } }` (`useDownload.ts:140`)

  - `POST /api/aiChat/stream` `{ message, conversationId, filterNames }` with `{ responseType: 'stream', headers: { Accept: 'text/event-stream' }, signal }` (`useAiChat.ts:216`)

  - `POST /api/auth/refreshToken` via `api.raw` in `pages/test/index.vue:13` is a DEBUG page — MUST NOT copy into production code.

- NO OpenAPI/Swagger/postman/`.http`/generated client exists in repo (glob verified empty). Manual types in `app/types/` are the ONLY contract source — keep them in sync by hand.

### C2. Request/response shape conventions (observed)

- Field case: camelCase EVERYWHERE (`createdDate`, `avatarFileId`, `selectedRoles`, `authenticationToken`). SOLE snake_case exception is the EXTERNAL HackerNews passthrough `FeedItem { time_ago, comments_count }` (`app/types/index.d.ts:69-70`, `example/feed/index.vue:256`) — NEVER apply snake_case to backend DTOs. `snakeToCamel` helpers exist (`appUtil.ts:148-151`) but are NEVER applied to responses.

- Pagination envelope (standard): `ApiResponse<T> { dataList: T[]; totalPages: number; totalElements: number; last: boolean; currentPage?: number }` (`common.ts:164-172`). BUT several list endpoints return BARE ARRAYS (`Permission[]`, `AppRole[]`, `FeedItem[]`). Callers MUST handle both, copying `usePagefecth.loadData` (`usePagefecth.ts:107-140`): `if (isListResponse(data)) { ...data.dataList... } else if (isArray(data)) { ... }`. When adding a list, VERIFY via devtools which shape the endpoint returns — do not assume.

- Dates: ALWAYS `string`, mixed formats (`'2026-04-20 15:45:12'` in chat mocks vs `new Date().toISOString()` in `useAiChat.ts:317`). `dateUtil.ts` formatters accept both (`removeTime` splits on `/[T ]/`). Send ISO strings; parse defensively.

- Nullables are INCONSISTENT (`field?: X | null` vs `field?: X` vs required): e.g. `AppUser.avatar?: ImageDto | null`. MUST guard with `isEmpty`/`isEmptyVal` (`appUtil.ts:124-141`) and optional chaining, not with type assumptions.

- DEVIATIONS to special-case: (1) chunk-upload + merge endpoints use `FormData` + `api.raw` and return union `FileUploadChunkResponse | FileManager | void`; (2) `/api/aiChat/stream` returns `ReadableStream`/SSE, not JSON; (3) `api-client/[crud]/[id].vue:98` expects `api.raw<string>`; (4) `useDownload` streams with `cdnBase`, not `apiBase`.

### C3. Auth attachment + 401/403 (observed)

- Attachment: cookies sent automatically (`credentials: 'include'`); wrapper forwards `cookie` header on SSR. NEVER set `Authorization`. NEVER read token cookies in JS. Refresh request itself sends cookies with EMPTY body (`useApi.ts:160-169` — commented-out `refreshToken` body is intentional, do not restore).

- 401: wrapper dedupes concurrent refreshes via `nuxtApp._refreshPromise`, propagates refreshed cookies on SSR, retries original ONCE, else `navigateTo('/auth/login')` (client only). Toast is SUPPRESSED for 401/403 responses. MUST NOT add page-level 401 redirects — they double-fire with the wrapper.

- 403: no refresh; route-level `showError 403` (permit middleware) or silent reject. Permission-gated pages MUST declare `definePageMeta({ requiresPermission: [...] })` and gate buttons with `v-rbac`.

### C4. Error parsing (observed — single standard)

- The ONLY honored shapes are `AppException { status: string; message: string; errors?: string[]; timestamp? }` and `ResponseMessage { status; message?; timestamp }`, detected by `isAppException` / `isServerResponseMessage` (`app/utils/appUtil.ts:11-29`) and toasted automatically in `onResponse` (`useApi.ts:83-102`): `AppException` → red `octagon-alert` toast with message + `errors[]` list; `ResponseMessage` → success/error toast by `status < 400`.

- `ServerException` and `ResponseEntity<T>` are DEAD (defined, never matched) — MUST NOT branch on them.

- Consequence: MUST NOT add manual error toasts for `AppException`/`ResponseMessage` (double-toast footgun). `catch` blocks MUST only `console.error` + return `null`/fallback (canonical: `useAuth.signin:68-72`, `usePagefecth.loadDataProcess:77-80`). `fetchMe` MUST keep its `!isAppException(response._data)` guard before `setAuth` (`useAuth.ts:112`).

- Contract-drift flag: error `status` is `string` in `AppException` but `number|string` in `ServerException` — if a new endpoint returns numeric `status` with `error`+`path` keys, it will NOT toast; normalize it to `AppException` handling and flag to the backend team.

### C5. Re-verification rule

- If ANY endpoint changes shape, or a new endpoint is added: (1) capture a real response in devtools, (2) update the corresponding interface in `app/types/` by hand, (3) update this section's inventory, (4) keep the dual-shape (`ApiResponse|T[]`) fallback until the backend confirms one envelope. NEVER generate types from assumptions.
