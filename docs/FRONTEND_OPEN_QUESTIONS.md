# Frontend Open Questions

These are unresolved repository questions/technical-debt items. They are not mandatory context for every task.

## Open questions for the team

- `runtimeConfig.public` keys `apiDomain`, `timeOut`, `appVersion`, `codeVersion`, `webUrl` are defined but never read — delete or wire up?

- `RefreshTokenResponse.authenticationToken` is checked in `useAuth.signin` / `login.vue` but never persisted to JS (HttpOnly cookie assumed) — confirm backend sets `_session_`/`_slid_` via `Set-Cookie` on `/api/auth/login`.

- `usePagefecth.ts` handles both `ApiResponse` envelope AND bare `T[]` — which one does the Spring Boot backend actually return per endpoint? Needs OpenAPI spec or devtools capture.

- `server/database/*` (drizzle + mysql) is only used by `pnpm migrate:mysql:pg` one-off script — should it move to `devDependencies` or a separate tool?

- `pnpm lint` currently FAILS on clean checkout: `typescript-eslint does not support TS 7.0` (`@typescript-eslint/parser\@8.68.0` vs `typescript\@7.0.2`, verified 2026-09-09). Pin TS <7 or upgrade typescript-eslint before trusting CI lint results.

- No Prettier config file despite `prettier` + `eslint-plugin-prettier` installed — adopt a `.prettierrc` or remove the deps?

- Baked-in typos (`enpointList`, `fectchDataOnLoad`, `ipAddredd`, `fourceLogout`, `SearchParamiter`) are part of the type surface — rename now or freeze?
