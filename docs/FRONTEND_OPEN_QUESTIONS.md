# Frontend Open Questions

These are unresolved repository questions/technical-debt items. They are not mandatory context for every task.

## Open questions for the team

- `runtimeConfig.public` keys `apiDomain`, `timeOut`, `appVersion`, `codeVersion`, `webUrl` are defined but never read — delete or wire up?

- `RefreshTokenResponse.authenticationToken` is checked in `useAuth.signin` / `login.vue` but never persisted to JS (HttpOnly cookie assumed) — confirm backend sets `_session_`/`_slid_` via `Set-Cookie` on `/api/auth/login`.

- `usePagefecth.ts` handles both `ApiResponse` envelope AND bare `T[]` — which one does the Spring Boot backend actually return per endpoint? Needs OpenAPI spec or devtools capture.

- `server/database/*` (drizzle + mysql) is only used by `pnpm migrate:mysql:pg` one-off script — should it move to `devDependencies` or a separate tool?

- RESOLVED (toolchain) 2026-09-25: `pnpm lint` failed with `typescript-eslint does not support TS 7.0`. No TS 7–compatible typescript-eslint exists yet (latest `8.70.1` and canary both peer `typescript >=4.8.4 <6.1.0`), so `typescript` is pinned to `~6.0.3` (devDependency); the installed `@typescript-eslint/parser\@8.68.0` now resolves against `typescript\@6.0.3`. Lint itself was NOT run — agents never run `pnpm lint` in this project (AGENTS.md §10); the first CI run is the real verification. Keep the `~6.0.x` pin until typescript-eslint widens its TS peer range.

- RESOLVED 2026-09-25: `pnpm typecheck` crashed because `vue-tsc\@3.3.11` (still the latest) requires `typescript/lib/tsc`, which TS 7 no longer exports. Fixed by pinning `typescript ~6.0.3`; that surfaced 39 pre-existing errors, all fixed the same day: `import type` in 10 `server/api/mock/*` files (TS1484), mock `FileManager` `id` → string and `fileSize` → bytes `2097152` in `file/imageItemsData.ts` / `pdfItemsData.ts` (TS2322), and `dateString`/`ios` → `date`/`iso` in `app/components/base/BaseVideoPlayerDetail.vue` (TS2353 — previously passed `undefined` as the date at runtime). `pnpm typecheck` now exits 0 with 0 errors and `pnpm build` passes (VERIFIED).

- No Prettier config file despite `prettier` + `eslint-plugin-prettier` installed — adopt a `.prettierrc` or remove the deps?

- Baked-in typos (`enpointList`, `fectchDataOnLoad`, `ipAddredd`, `fourceLogout`, `SearchParamiter`) are part of the type surface — rename now or freeze?
