# Frontend API reference

Use with `.agents/skills/api-integration/SKILL.md` for requests to the external Spring Boot API. The source of truth for frontend behavior is `app/composables/useApi.ts` and the affected caller; `docs/API_CONTRACT.md` records observed expectations, not a verified backend specification.

## Request path

- Use `const api = useApi()` for backend calls. `api<T>(path, options)` returns parsed data; `api.raw<T>(path, options)` returns the response, including `status` and `_data`.
- Calling `useApi()` directly in a page or composable is the default. Domain helpers in `app/api/` (`useAuthApi.ts`, `useFavoriteMenuApi.ts`) are optional; reuse one if it already covers the endpoint, and create a new one only when several files share the call.
- Use backend paths relative to `runtimeConfig.public.apiBase`, normally `/api/<camelCaseEntity>`. Preserve an existing exceptional path, such as the upload calls without a leading slash, until the contract is verified.
- Local Nitro routes under `server/api/mock/` and `server/api/meta.ts` are separate from the external backend; `useFetch` or `$fetch` can be appropriate there. `useAsyncData` can call `useApi()` for SSR data loading; the existing permission and role lookups are examples, not a limit.

```ts
const api = useApi()
const response = await api.raw<AppUser>('/api/appUser/currentUserData', {
  method: 'GET'
})
if (response.status === 200 && response._data && !isAppException(response._data)) {
  setAuth(response._data)
}
```

Handle rejected requests at the responsible composable or UI boundary. The wrapper already shows `AppException` and `ResponseMessage` notifications for eligible responses; check it before adding another toast. Do not assume its notification replaces an error state or recovery path in the caller.

## Shared behavior in `useApi()`

- Sets `Accept-Apiclient`, `Accept-Language`, and `credentials: 'include'`; forwards request cookies on SSR.
- On 401, deduplicates refresh with `nuxtApp._refreshPromise`, posts an empty body to `/api/auth/refreshToken`, propagates `Set-Cookie` during SSR, and retries once. Do not add page-level refresh or read `_session_` / `_slid_` from JavaScript.
- Does not refresh on 403. Preserve server-owned authorization; client route and button gates are only presentation.
- Uses `apiBase` from runtime configuration. `useDownload.ts` overrides `baseURL` with `cdnBase` for downloads. `useAiChat.ts` uses a streaming response for SSE. Inspect these specialized callers before changing shared request behavior.

## Contract checks

Record the method, path, query/body, response shape, and error path from the call site. `usePagefecth.ts` accepts both `ApiResponse<T>` and bare arrays; preserve that behavior for affected lists. Do not coerce Snowflake IDs to `number`, normalize backend field spellings unilaterally, or treat a TypeScript type as proof of a live response. Before changing a DTO, obtain devtools/OpenAPI evidence as required by `AGENTS.md` §8; otherwise leave the implemented shape unchanged and document the proposal as unverified.
