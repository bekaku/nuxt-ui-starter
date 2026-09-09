# Frontend Core Skill

Use this file for all frontend implementation tasks. It contains project-wide frontend rules and routes to narrower skills.

## Task Routing

- API/backend communication → also read `API.md`.
- Login/session/permission/RBAC → also read `AUTH.md`.
- Components/pages/theme/styling/i18n → also read `UI.md`.
- State/forms/zod/types → also read `TYPES_VALIDATION.md`.
- Endpoint or response contract work → also read `../../docs/API_CONTRACT.md`.

### F1. Project layout (Nuxt 4 `app/` srcDir) — MUST follow

- `app/` is the srcDir. MUST put client code under `app/api/`, `app/assets/`, `app/components/`, `app/composables/`, `app/layouts/`, `app/libs/`, `app/middleware/`, `app/pages/`, `app/plugins/`, `app/types/`, `app/utils/`. MUST NOT create top-level `components/` or `pages/` outside `app/`.

- `app/app.config.ts` is the ONLY place for Nuxt UI theme/component defaults. MUST NOT scatter `ui:` overrides per-page except `:` `ui` prop passthroughs like `BaseTable.vue:780-787`.

- `server/api/` is Nitro mocks + one scraper ONLY (`mock/*`, `meta.ts`). MUST NOT add backend proxy/DB logic there. Verified: 19 files, all static `eventHandler(() => ...)` except `meta.ts` cheerio scraper.

- `app/stores/` is EMPTY and Pinia is NOT installed. MUST use `useState` (see F6). MUST NOT add `defineStore`.

- `shared/types/index.d.ts` is EMPTY (0 lines). MUST define types in `app/types/` (`common.ts` \~768 lines, `models.ts`, `props.ts`, `chart.ts`). MUST NOT write new shared types until a real sharing need exists.

- `i18n/locales/{en,th}/{app,base,helper,model,error}.json` is the ONLY locale location. `nuxt.config.ts` `langDir:'locales'`, `strategy:'no_prefix'`, `defaultLocale:'th'`.

- Fonts self-hosted in `public/fonts/`, registered in `nuxt.config.ts` `fonts.families` (`GoogleSans` 400/500/700, `NotoSansThaiLooped` 300/400/500). MUST NOT add Google Fonts CDN links.


### F10. Lint / format / config

- Run `pnpm lint` = `eslint .` (`withNuxt`, files `**/*.ts|tsx|vue`). Enforced/error: `vue/max-attributes-per-line: [error, { singleline: 3 }]` — max 3 attrs per line on single-line elements. Warn-level (fix anyway): `vue/attributes-order`, `vue/html-self-closing`, `vue/require-explicit-emits`, `vue/custom-event-name-casing: kebab-case`, `unused-imports/no-unused-vars`. OFF (but this file overrides where noted): `vue/no-multiple-template-root`, `vue/require-default-prop`, `vue/multi-word-component-names`, `no-console`, `no-explicit-any` (still forbidden by F9), `explicit-function-return-type`.

- Stylistic: `commaDangle: never`, `braceStyle: 1tbs` (`nuxt.config.ts:118-125`). EditorConfig: 2-space, `lf`, trim trailing ws, final newline. Prettier has NO config file — MUST match EditorConfig manually; do not introduce new formatting style.

- `.vscode/settings.json`: `formatOnSave: false`, `organizeImports: never` — MUST NOT rely on save-hooks; run lint explicitly.

- Env/config: ALL env via `runtimeConfig.public` + `NUXT_PUBLIC_*` (`.env.example`: `API_BASE/CDN_BASE/API_DOMAIN/SITE_URL/TIME_OUT/APP_VERSION/CODE_VERSION/WEB_URL/API_CLIENT`; server secret `NUXT_API_SECRET`). Dev loads `.env` via `--dotenv .env` on port 3003 (`package.json:7`). NEVER `process.env` in `app/` (only `server/database/*` uses it); ALWAYS `useConfiguration()`/`useRuntimeConfig().public`.

- SSR is ON (`ssr: true`); `/api/**` `routeRules.cors: true`; `experimental.nitroAutoImports: true`; heavy libs pre-bundled in `vite.optimizeDeps.include` — MUST add new heavy client-only deps there (list in `nuxt.config.ts:30-52`).

- Client-only libs MUST be registered as plugins (`app/plugins/`: `apexchart`, `cropperjs`, `pdfVue`, `plyr`, `toast`, `datefns`, `rbac`) — never global-import in components.


### F11. Before you commit (ONLY scripts that exist in `package.json`)

```bash

pnpm lint        # MUST pass (eslint .)

pnpm typecheck   # MUST pass (nuxt typecheck / vue-tsc)

pnpm build       # MUST pass for any runtime-affecting change (nuxt build)

```

- NEVER run `mvn`/`gradle`/backend commands — no backend repo here. NEVER run `pnpm migrate:mysql:pg` unless explicitly migrating (it dumps MySQL→PG SQL to `NUXT_CDN_DIRECTORY/migrate-sql`).

- CI (`.github/workflows/ci.yml`, Node 22 + pnpm) runs ONLY `lint` → `typecheck` — no tests, no build. A green CI does NOT mean the app builds; run `pnpm build` locally.

- Docker: `Dockerfile` multi-stage node:24 → node:24-alpine + PM2 (`ecosystem.config.cjs`, `nuxt-web`, PORT 3000, `TZ=Asia/Bangkok`); `docker-compose.yml` maps `127.0.0.1:3002:3000` with NO build/env — MUST pass env via host `NUXT_*` when composing.
