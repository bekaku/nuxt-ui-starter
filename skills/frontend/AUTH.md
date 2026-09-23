# Frontend auth and RBAC reference

Use for login/logout, linked accounts, session refresh, route guards, and permission UI. Read `app/composables/useAuth.ts`, `app/api/useAuthApi.ts`, `app/composables/useApi.ts`, and the affected route before editing. Backend authorization and cookie issuance are `BACKEND_NOT_ACCESSIBLE` in this repository.

## Session flow

- `app/plugins/00.auth.server.ts` calls `fetchMe()` and `initialAppNav()` during SSR; the client auth plugin is a stub. `useAuth()` stores the current user and navigation in namespaced `useState` keys.
- `signin()` posts `/api/auth/login`. `fetchMe()` reads `/api/appUser/currentUserData`. `signoutProcess()` posts `/api/auth/logout`, clears state, broadcasts reload, and navigates to login after success.
- `app/api/useAuthApi.ts` wraps linked-account calls. `useAuth()` lazily loads linked accounts on the client and reloads the page after a successful account switch or link so SSR can rebuild session state from cookies. Check the current success condition at each call site; some successful responses have an empty body.
- Keep `_session_` and `_slid_` token cookies out of JavaScript. `useApi()` owns cookie forwarding and the deduplicated 401 refresh/retry. Do not duplicate it in pages or change the empty refresh body without verified contract evidence.

## Route and UI permissions

- Global middleware runs `00.seo` → `01.auth` → `02.check-permit`. The auth guard checks `auth:user` state, consults `AuthNoFilterPage`, and redirects unauthenticated protected routes. Inspect that list before changing route exemptions.
- `requiresPermission` on a page is checked by `useRbac().isHavePermissionLazy()`: any listed code is enough; missing or empty metadata allows the route through. Set explicit metadata for protected admin routes and use backend-confirmed permission codes.
- `v-rbac`, `BaseTable`, `BaseForm`, and menu `permissions` control presentation. They do not authorize API requests. Check that menu visibility and route metadata agree for a new screen.
- A backend 403 does not trigger refresh. The route guard renders a 403 for a failed `requiresPermission` check. Keep these paths distinct while debugging.

For endpoint shapes or status behavior, also consult `docs/API_CONTRACT.md` and `skills/frontend/API.md`. Do not infer a backend rule from a frontend-only guard.
