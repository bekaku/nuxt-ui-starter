# 🛠️ Project Skills & Technology Stack

This document outlines the core technologies, architectural patterns, and coding conventions used in this repository.
**Note for AI Assistants (Copilot, Claude, Codex):** Please strictly adhere to these technologies and conventions when generating code, refactoring, or suggesting improvements.

## 1. Core Technologies
* **Framework:** Nuxt 4 (`^4.5.1`) with SSR enabled (`ssr: true`), auto-imports, and file-based routing
* **UI/Component Library:** Vue 3 + Nuxt UI v4 (`@nuxt/ui ^4.10.0`, Tailwind CSS v4 under the hood)
* **Language:** TypeScript (`typescript ^7.0.2`, checked by `vue-tsc`)
* **Package Manager:** pnpm (`pnpm@11.9.0`, pinned via `packageManager`)
* **Key Modules (registered in `nuxt.config.ts`):** `@nuxt/eslint`, `@nuxt/ui`, `@vueuse/nuxt`, `@nuxtjs/i18n` (en/th, `no_prefix` strategy), `@nuxt/icon`, `@nuxtjs/device`, `@nuxt/image`; fonts served locally via the built-in `fonts` config (@nuxt/fonts)
* **Notable Libraries:** zod, date-fns (+ `@internationalized/date`), ApexCharts + Unovis (charts), CropperJS (v2 web-components), plyr (video), `@tato30/vue-pdf` / pdf-lib, jszip, browser-image-compression, isomorphic-dompurify, md-editor-v3 (markdown editor/viewer), vue-draggable-plus (drag & drop), `@tanstack/table-core` (table logic), `@capacitor/device`, `@mediapipe/tasks-vision` (vision/AI tasks), cheerio, tailwind-merge, clsx
* **Lint/Format:** ESLint 10 via `@nuxt/eslint` (stylistic rules) + Prettier (`eslint-config-prettier` / `eslint-plugin-prettier`)

## 2. Project Structure
```
app/            # Client application (Nuxt srcDir)
├── api/        # API client composables (auto-imported via imports.dirs)
├── app.config.ts # App config: Nuxt UI theme colors (primary: teal, neutral: stone, info: sky), component defaults
├── app.vue     # Root component wrapping <UApp>
├── error.vue   # Global error page (<UError>)
├── assets/     # Global CSS entry: assets/css/main.css
├── components/ # Auto-imported components grouped by feature (base/, chart/, chat/, ...)
├── composables/# Shared composables (useApi, useAuth, useCrudForm, useRbac, ...)
├── layouts/    # default.vue, ai.vue, empty.vue, feed.vue
├── libs/       # Constants (libs/constants.ts), Snowflake ID generator (Snowflake.ts)
├── middleware/ # Numbered global route guards: 00.seo → 01.auth → 02.check-permit
├── pages/      # File-based routing; feature folders use [crud] dynamic segments
├── plugins/    # Auth init (client + server) and client-only lib registrations (apexchart, cropperjs, pdfVue, plyr, toast, datefns, rbac)
├── stores/     # (reserved) Pinia/state stores — currently empty
├── types/      # App-level TypeScript types (chart.ts, common.ts, models.ts, props.ts)
└── utils/      # dateUtil, fileUtil, appUtil, snowflake helpers (auto-imported)
server/api/     # Nitro backend routes (meta.ts + mock/ data endpoints: chart, chat, dashboard, file, customers, mails, members, notifications)
shared/types/   # Types shared between client and server (index.d.ts)
i18n/locales/   # en/ and th/ split into namespaces: app, base, helper, model, error (+ root-level en.json / th.json)
public/fonts/   # Self-hosted GoogleSans + NotoSansThaiLooped fonts (registered in nuxt.config.ts `fonts.families`)
```

## 3. Architecture & Patterns
* **Component Paradigm:** Vue 3 Composition API exclusively.
* **State:** `useState` / composables; auth session stored in cookies configured via `runtimeConfig.public` — `jwtKeyName: '_session_'`, `refreshJwtKeyName: '_slid_'`, `currentUserKeyName: '_sid'`, JWT ages (`jwtAges`, `jwtAgesSecond`).
* **API Integration:** Centralized HTTP layer via the custom `useApi()` composable (wraps `ofetch`). It forwards cookies during SSR, attaches `Accept-Apiclient` / `Accept-Language` headers, and handles JWT refresh/logout.
* **Auth Flow:** Cookie-based JWT with refresh token; global middlewares enforce authentication (`01.auth.global.ts`) and permissions (`02.check-permit.global.ts`). Permission-aware UI via the `useRbac()` composable + `rbac` plugin.
* **CRUD Pattern:** Generic CRUD pages use a single `[crud].vue` dynamic route per feature, driven by the `useCrudForm` / `useCrudList` / `usePaging` / `useSort` composables.
* **Configuration:** All environment-specific values live in `runtimeConfig.public` (nuxt.config.ts: `apiDomain`, `apiBase`, `cdnBase`, `apiClient`, `timeOut`, `appVersion`, `codeVersion`, `webUrl`, upload limits, page-size defaults, `acceptFiles`) and are overridden by `.env` files (`NUXT_PUBLIC_*`; server-only secret via `NUXT_API_SECRET`).
* **Theming:** Nuxt UI theme colors and component defaults (button/card/badge/link/avatar variants) are centralized in `app/app.config.ts`. Icon default size is set there too (`icon.size: '18px'`).
* **i18n:** `@nuxtjs/i18n` with `no_prefix` strategy, Thai (`th`) as default locale, locale detected via cookie (`locale`, fallback `th`). Messages split into namespace JSON files per language (`app.json`, `base.json`, `helper.json`, `model.json`, `error.json`).
* **Nitro/Vite specifics:** `/api/**` route rules enable CORS; `experimental.nitroAutoImports` is on; heavy client libs are pre-bundled via `vite.optimizeDeps.include`; CropperJS v2 custom elements (`cropper-canvas`, etc.) are registered as Vue custom elements in `vue.compilerOptions`.
* **Images:** `@nuxt/image` with an `avatar` preset (jpg, 50x50).

## 4. 🤖 AI Code Generation Guidelines
When assisting with code generation in this project, AI agents must follow these rules:

1. **Composition API:** Always use `<script setup lang="ts">`. Do not use Options API.
2. **Nuxt UI Components:** Prefer native Nuxt UI components (e.g., `<UButton>`, `<UCard>`, `<UInput>`) over raw HTML when building UIs.
3. **TypeScript:** Define proper interfaces/types for props, emits, and API responses. Avoid `any`.
4. **Auto-imports:** Rely on Nuxt's auto-imports for Vue APIs, Nuxt UI components, and custom composables from `app/composables/` and `app/api/`.
5. **API Fetching Pattern:** Do NOT use native `$fetch` or `useFetch` directly for backend API calls. Always use the `api` instance from `useApi()`, wrapped in a `try-catch` block:

```typescript
const { api } = useApi();
try {
  const data = await api<ApiResponse<Permission>>('/api/permission', {
    method: 'GET',
  })
} catch (error) {
  console.error('Failed to fetch data', error)
}
```

6. **Props Declaration:** Use reactive destructuring with default values for `defineProps`. Do NOT use the `withDefaults` compiler macro.

```typescript
const { count = 0, message = 'hello' } = defineProps<{
  count?: number
  message?: string
}>()
```

7. **Emits Declaration:** Use type-based declaration with tuple syntax. Do NOT use runtime array/object syntax.

```typescript
const emit = defineEmits<{
  'on-close': []
  change: [id: number]
  update: [value: string]
}>()
```

8. **SFC Block Order:** Strictly order Vue Single-File Component blocks:
   a. `<script setup lang="ts">`
   b. `<template>`
   c. `<style scoped>` (if necessary)

9. **Styling & Dark Mode:** Prefer Tailwind utility classes with `dark:` variants. Custom styles use plain scoped CSS (no SCSS). Consider dark mode in all styling decisions.

```html
<!-- Preferred: Tailwind Utility Classes -->
<template>
  <div class="bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white">
    <!-- Content -->
  </div>
</template>
```

10. **i18n:** Never hardcode user-facing strings. Add keys to the appropriate namespace file under both `i18n/locales/en/` and `i18n/locales/th/`.

11. **New CRUD Feature Checklist:** When adding a new feature domain:
    - Create page folder under `app/pages/<feature>/` with `index.vue` (list) and `[crud].vue` (create/edit/detail)
    - Reuse `useCrudList` / `useCrudForm` composables
    - Define types in `app/types/` (or `shared/types/` if shared with server)
    - Add i18n keys to both locales

12. **Comments:** Do not add comments unless explicitly required.

13. **ESLint conventions (enforced/warned):** max 3 attributes per line on single-line elements; custom events in `kebab-case`; respect `vue/attributes-order`; explicit emits required; multi-word component names rule is off. `@typescript-eslint/no-explicit-any` is disabled by lint, but still avoid `any` per rule 3.

## 5. Commands
```bash
pnpm dev          # Dev server on 0.0.0.0:3003 (loads .env.dev via --dotenv)
pnpm build        # Production build (Nitro output in .output/)
pnpm preview      # Preview production build
pnpm lint         # ESLint (@nuxt/eslint with stylistic rules: no comma dangle, 1tbs) + Prettier integration
pnpm typecheck    # nuxt typecheck (vue-tsc)
pnpm postinstall  # nuxt prepare (runs automatically on install)
```

## 6. Infrastructure & DevOps
* **Containerization:** Multi-stage Dockerfile (node:24 build → node:24-alpine runtime, non-root `node` user, `dumb-init`, HEALTHCHECK on port 3000). Runs Nitro via PM2 (`pm2-runtime ecosystem.config.cjs`) in cluster mode; PM2 serves `server/index.mjs` as process `nuxt-web` on PORT 3000.
* **Local orchestration:** `docker-compose.yml` (service `nuxtui-web`, maps host port 3002 → container 3000); build helper scripts `build-app.sh` (bash) and `build-app.ps1` (PowerShell).
* **Environments:** `.env.example` documents all supported variables (`NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_API_DOMAIN`, `NUXT_PUBLIC_CDN_BASE`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_TIME_OUT`, `NUXT_PUBLIC_APP_VERSION`, `NUXT_PUBLIC_CODE_VERSION`, `NUXT_PUBLIC_WEB_URL`, `NUXT_PUBLIC_API_CLIENT`, server-only `NUXT_API_SECRET`); `.env.dev` used by the dev script.
* **CI:** GitHub Actions workflow at `.github/workflows/ci.yml` — runs on push with Node 22 + pnpm; executes `pnpm lint` then `pnpm typecheck`.
* **Dependencies:** Renovate bot enabled (`renovate.json`).
* **Timezone:** Containers run in `Asia/Bangkok` (`TZ` env + tzdata).
