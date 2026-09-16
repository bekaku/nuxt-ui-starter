# Frontend Core Skill

Use this file for all frontend implementation tasks. It contains project-wide frontend
rules and routes to narrower skills.

All file:line references and counts were re-verified on 2026-09-14.

## Task Routing

- Entity admin screens (list page, `[crud]/[id].vue` form, search/paging) → also read `CRUD.md`.
- API/backend communication, SSE, upload/download → also read `API.md`.
- Login/session/permission/RBAC → also read `AUTH.md`.
- Components/pages/theme/styling/i18n → also read `UI.md`.
- State/forms/zod/types → also read `TYPES_VALIDATION.md`.
- Endpoint or response contract work → also read `../../docs/API_CONTRACT.md`.
- The backend is in this repository at `/backend`; route backend questions through `/backend/SKILLS.md` instead of guessing.

### F1. Project layout (Nuxt 4 `app/` srcDir) — MUST follow

- `app/` is the srcDir. MUST put client code under `app/api/`, `app/assets/`, `app/components/`, `app/composables/`, `app/layouts/`, `app/libs/`, `app/middleware/`, `app/pages/`, `app/plugins/`, `app/types/`, `app/utils/`. MUST NOT create a top-level `components/` or `pages/` outside `app/`.

- `app/app.config.ts` is the ONLY place for Nuxt UI theme/component defaults. MUST NOT scatter `ui:` overrides per page, except `:ui` prop passthroughs like `BaseTable.vue:780-787`.

- `app/layouts/` holds exactly `default.vue`, `ai.vue`, `empty.vue`. Adding a layout is a deliberate change, not a convenience.

- `server/api/` is Nitro mocks + one scraper ONLY (`mock/*`, `meta.ts`). MUST NOT add backend proxy or DB logic there. Verified: 19 files, all static `eventHandler(() => ...)` except `meta.ts` (cheerio scraper). There is NO `server/database/` — the `migrate:mysql:pg` script in `package.json` is dead and will fail.

- `app/stores/` is EMPTY and Pinia is NOT installed. MUST use `useState` (see F6). MUST NOT add `defineStore`.

- `shared/types/index.d.ts` is EMPTY (0 lines). MUST define types in `app/types/` (`common.ts` ~768 lines, `models.ts` ~281, `props.ts`, `chart.ts`, `index.d.ts`). MUST NOT write new shared types until a real client/server sharing need exists.

- `i18n/locales/{en,th}/{app,base,helper,model,error}.json` is the ONLY locale location. `nuxt.config.ts`: `langDir: 'locales'`, `strategy: 'no_prefix'`, `defaultLocale: 'th'`.

- Fonts are self-hosted in `public/fonts/`, registered in `nuxt.config.ts` `fonts.families` (`NotoSansThaiLooped` 300/400/500, `GoogleSans` 400/500/700, `nuxt.config.ts:137-177`). MUST NOT add Google Fonts CDN links.

- `app/pages/test/*`, `app/pages/example/*` and `app/components/Temp.vue` are playground code. MUST NOT import from them into production paths, and MUST NOT treat their patterns as convention.

### F10. Code style / format / config

`pnpm lint` is not a project gate (F11), so these style conventions are NOT enforced
automatically and MUST be followed by hand. Types ARE enforced — `pnpm typecheck` is a
gate.

- `eslint.config.mjs` records the intended house rules (`withNuxt`, files `**/*.ts|tsx|vue`). Treat as **must-follow**: at most 3 attributes on a single-line element (`vue/max-attributes-per-line`), plus `vue/attributes-order`, `vue/html-self-closing`, `vue/require-explicit-emits`, kebab-case custom event names, and no unused vars/imports. Deliberately **not** enforced: `vue/no-multiple-template-root`, `vue/require-default-prop`, `vue/first-attribute-linebreak`, `vue/multi-word-component-names`, `no-console`, `no-useless-escape`, `@typescript-eslint/no-explicit-any` (still forbidden by F9), `@typescript-eslint/explicit-function-return-type`.

- Stylistic (`nuxt.config.ts:118-125`): `commaDangle: 'never'`, `braceStyle: '1tbs'`. EditorConfig: 2-space indent, `lf`, trim trailing whitespace, final newline (`*.md` exempt from trimming). Prettier is installed but has NO config file — MUST match EditorConfig manually; do not introduce a new formatting style.

- `.vscode/settings.json`: `editor.formatOnSave: false`, `source.organizeImports: never`, `source.fixAll.eslint: explicit`. Editor assistance is optional and inconsistent — MUST review diffs by eye.

- Env/config: ALL env via `runtimeConfig` + `NUXT_*` / `NUXT_PUBLIC_*`. `.env.example` ships `NUXT_API_SECRET`, `NUXT_CDN_DIRECTORY`, and `NUXT_PUBLIC_{SITE_URL,TIME_OUT,API_DOMAIN,API_BASE,CDN_BASE,API_CLIENT,APP_VERSION,CODE_VERSION,WEB_URL}`. `pnpm dev` loads `.env` (`--dotenv .env`, port 3003, `package.json:6`). NEVER use `process.env` in `app/`; ALWAYS `useConfiguration()` / `useRuntimeConfig().public`.

- SSR is ON (`ssr: true`); `/api/**` has `routeRules.cors: true`; `experimental.nitroAutoImports: true`; `imports.dirs: ['api']` auto-imports `app/api/`; heavy libs are pre-bundled in `vite.optimizeDeps.include` (`nuxt.config.ts:30-52`) — MUST add new heavy client-only deps there.

- Client-only libs MUST be registered as plugins (`app/plugins/`: `apexchart`, `cropperjs`, `pdfVue`, `plyr`, `toast`, `datefns`, `rbac`, plus `00.auth.server` / `00.auth.client`) — never global-import them in components.

### F11. Before you commit

```bash
pnpm build       # nuxt build     — MUST pass for any runtime-affecting change
pnpm typecheck   # nuxt typecheck — MUST pass (0 errors)
```

- These two are the project's ONLY gates. MUST NOT report either as passing unless it was executed.

- A typecheck error is a real error. MUST fix it; MUST NOT silence it with `@ts-ignore`. (All three historical `@ts-ignore` sites in `useAiChat.ts` turned out to be stale and were removed — do not reintroduce the pattern.)

- `pnpm lint` is NOT a gate. `eslint.config.mjs` still records the intended house style (F10) and MUST be followed by hand, but MUST NOT run `eslint` repo-wide as part of a task, and its exit code is not a verification result.

- There is NO test runner and NO CI workflow (`.github/` does not exist). Nothing checks style for you — MUST review your own diff against these skills.

- `typescript` is pinned to `~5.9.3` and `renovate.json` constrains it to `<6.1.0`, because `vue-tsc` still requires `typescript/lib/tsc`, which TS 7 removed; bumping past the pin breaks `pnpm typecheck`. MUST NOT change the pin, `eslint.config.mjs`, or `nuxt.config.ts` tooling config as a side effect of an unrelated task.

- NEVER run `mvn` / `gradle` / backend commands from `frontend/`. NEVER run `pnpm migrate:mysql:pg` — its target `server/database/migrate/run-engine.ts` does not exist.

- Docker: `Dockerfile` multi-stage `node:24` → `node:24-alpine` + PM2 (`ecosystem.config.cjs`, app name `nuxt-web`, PORT 3000, `TZ=Asia/Bangkok`); `docker-compose.yml` maps `127.0.0.1:3002 → 3000` with NO build context and NO env block — MUST pass env via host `NUXT_*` when composing.
