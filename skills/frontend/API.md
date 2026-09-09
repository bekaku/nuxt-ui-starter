# Frontend API Skill

Read this file when the task calls the Spring Boot backend, changes `useApi()`, CRUD/network behavior, upload/download behavior, or SSE handling.

### F2. API calls — `useApi()` is MANDATORY for backend

- MUST call backend ONLY via `const api = useApi()` (`app/composables/useApi.ts:37-258`, wraps `$fetch.create({ baseURL: apiBase })`). `api<T>()` returns `_data`; `api.raw<T>()` returns full `FetchResponse`.

```ts

// CORRECT — dominant pattern (20+ sites)

const api = useApi()

const response = await api.raw<*AppUser*>('/api/appUser/currentUserData', { method: 'GET' })

if (response && response?.status == 200 && response._data) { setAuth(response._data) }

// app/composables/useAuth.ts:109-113

```

```ts

// CORRECT — non-raw variant

const response = await api<*RefreshTokenResponse*>('/api/auth/login', { method: 'POST', body: { emailOrUsername, password, loginFrom: 'WEB', deviceId } })

// app/composables/useAuth.ts:51-59

```

- MUST wrap every `api`/`api.raw` call in `try/catch`. NEVER let it throw uncaught (canonical: `usePagefecth.ts:68-80`, `useCrudForm.ts`, `useAuth.ts:68-72`).

- NEVER use bare `$fetch` for backend paths. Bare `$fetch` is ALLOWED ONLY for these 3 Nitro-local targets (only observed exceptions — do not extend):

  - `/api/mock/chat/*` (`app/composables/useAppChat.ts:24`, `app/components/chat/ChatContent.vue:96`)

  - `/api/meta?url=` OG scraper (`app/components/base/BaseOpenGraphItemAlt.vue:29`)

- NEVER use `useFetch` for backend. `useFetch` is ALLOWED ONLY for `/api/mock/*` Nitro mocks, e.g.:

```ts

const { data: members } = await useFetch<*Member*[]>('/api/mock/members', { ... })

// app/pages/settings/members.vue:4; also NotificationsSlideover.vue:7, pages/index.vue:42-63, example/customers.vue:26

```

- `useAsyncData` + `api` is allowed ONLY for the 2 observed cache-once lookups; MUST NOT use it as a general fetch replacement:

```ts

const { data: permissions } = await useAsyncData<*Permission*[]>('permission-all', async () => {

  const r = await api<*Permission*[]>('/api/permission/findAllPermission'); return r || []

})

// app/pages/app-role/[crud]/[id].vue:77-85; second site: app/pages/app-user/[crud]/[id].vue:157-164

```

- NEVER set `Authorization: Bearer` header. It is commented OUT in the wrapper (`useApi.ts:71-73,216`) and zero call sites set it. Auth is cookie-only via `credentials: 'include'` (set inside wrapper `useApi.ts:74`). The ONLY `credentials` override in the repo is the external demo — do not copy it:

```ts

api<*FeedItem*[]>('/news', { baseURL: 'https://api.hackerwebapp.com', credentials: 'omit' })

// app/pages/example/feed/index.vue:256 — EXCEPTION, external API only

```

- NEVER pass `timeout` per-call (only `useDownload.ts:140` does, `timeout: 0`). `runtimeConfig.public.timeOut` exists but is NEVER read — ignore it.

- NEVER implement retry/backoff per call site. The wrapper does exactly ONE retry on 401 (refresh flow). Chunk upload's own loop (`useUpload.ts:135-151`) is the sole exception.

- Base URL: ALWAYS relative path (`'/api/...'`), never hardcode host. Wrapper resolves `apiBase` from `useConfiguration()` → `useRuntimeConfig().public.apiBase` (default `'/api'`, prod override `NUXT_PUBLIC_API_BASE`). `cdnBase` override is for downloads ONLY (`useDownload.ts:140` `baseURL: cdnBaseURL`).

- Headers `Accept-Apiclient` + `Accept-Language` are set by the wrapper (`useApi.ts:47-52`). MUST NOT set them per call. MUST NOT set `Content-Type` manually (ofetch default).

- CRUD pages MUST reuse `useCrudForm` / `useCrudList` / `usePagefecth` (`api.raw<ApiResponse<T>>(pageParam.value, { method: 'GET' })`, `usePagefecth.ts:70`) instead of hand-rolling list/paging logic.

- `drizzle-orm` + `mysql2` are SERVER-ONLY (`server/database/mysql/index.ts`, `schema.ts`, `migrate/run-engine.ts`, script `migrate:mysql:pg`). Verified zero imports in `app/`. MUST NEVER import them in `app/`.


## Related References

When request/response shapes or endpoint behavior matter, also read `../../docs/API_CONTRACT.md`.
When debugging a known network/API trap, consult `../../docs/FRONTEND_FOOTGUNS.md`.
