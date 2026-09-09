# Frontend Authentication & Authorization Skill

Read this file when the task involves login, logout, cookies, session bootstrap, refresh-token behavior, route guards, permissions, or `v-rbac`.

### F3. Auth — cookie JWT, `useState`, global guards

- Tokens `_session_` / `_slid_` are HttpOnly backend cookies. MUST NEVER `useCookie('_session_')` / `useCookie('_slid_')` (zero reads in repo — intentional). The ONLY auth-adjacent cookie read in JS is:

```ts

useCookie(config.public.currentUserKeyName) // '_sid' — app/composables/useAppCookie.ts:4

```

plus `useCookie('locale')` (`useApi.ts:39`, `useLang.ts:22-26` with `{ expires: 365d, path: '/', sameSite: 'lax' }`).

- Login MUST go through `useAuth().signin`: `POST /api/auth/login` with sanitized body `{ emailOrUsername: inputSanitizeHtml(req.emailOrUsername), password, loginFrom: 'WEB', deviceId: await getDeviceId() }` (`useAuth.ts:46-59`). Login page checks `response.authenticationToken` then `window\.location.replace(continue ?? '/')` after 350ms + broadcast reload (`app/pages/auth/login.vue:36-48`).

- Session state MUST live in `useState<AppUser | null>('auth:user')` + `useState<AppNavigationMenuItem[]>('auth:navigations')` (`useAuth.ts:15-16`). `isLoggedIn = computed(() => !!auth.value)`. `fetchMe()` (`useAuth.ts:107-120`) is the ONLY session bootstrap: `api.raw<AppUser>('GET /api/appUser/currentUserData')` + `isAppException` guard before `setAuth`.

- Logout MUST use `signoutProcess()`: `api.raw<ResponseMessage>('POST /api/auth/logout')`, on 200 `clearAuth()` + `sendBroradcastChanelReload()` + `navigateTo('/auth/login', { replace: true })` (`useAuth.ts:87-105`). Confirm dialog via `useConfirmDialog` in `signout()` wrapper.

- 401 handling lives ONLY in `useApi.executeFetch` (`useApi.ts:144-234`): dedupe via `nuxtApp._refreshPromise`, `POST /api/auth/refreshToken` with `{ baseURL: apiBase, credentials: 'include', body: {} }` (empty body — copy exactly), retry original ONCE, else `navigateTo('/auth/login')` (client-only `handleLogout`, `useApi.ts:54-59`). On SSR, `Set-Cookie` is propagated via `event.node.res.setHeader` (`useApi.ts:170-195`). MUST NOT write per-page 401 handlers.

- 403 is NEVER refreshed/retried — wrapper only skips the toast (`useApi.ts:87`). Page-level 403 comes from `02.check-permit.global.ts` → `showError({ statusCode: 403, statusMessage: 'Forbidden' })`.

- Route guards: `00.seo.global` (title only, client-only) → `01.auth.global` → `02.check-permit.global`. `01.auth.global.ts:1-23` strips i18n suffix (`to.name.replace(/___[a-z]{2}$/, '')`), bypasses `AuthNoFilterPage = ['error','all','auth-forgot-password','test','layer-01']` (`app/libs/constants.ts`), redirects authed users off `/auth/login` to `/`, and unauthed users to `/auth/login?continue=<encoded fullPath>`. NOTE: it checks `useState` only, not cookies (comment claims otherwise — trust the code).

- Permission checks: `to.meta.requiresPermission: string[]` + `isHavePermissionLazy` (any-match; empty/undefined = allow) (`useRbac.ts`, `02.check-permit.global.ts`). UI gating via `v-rbac` directive (`app/plugins/rbac.ts` — `mounted: if (!hasPermission(binding.value)) el.remove()`). SSR bootstrap ONLY in `app/plugins/00.auth.server.ts` (`fetchMe` + `initialAppNav`); client plugin `00.auth.client.ts` is an intentional no-op stub.


## Related References

For the API-side auth attachment and observed 401/403 contract, read `../../docs/API_CONTRACT.md` section C3 when needed.
