# 🛠️ Project Skills & Technology Stack

This document outlines the core technologies, architectural patterns, and coding conventions used in this repository.
**Note for AI Assistants (Copilot, Claude, Codex):** Please strictly adhere to these technologies and conventions when generating code, refactoring, or suggesting improvements.

## 1. Core Technologies
* **Framework:** Nuxt 4 (`^4.5.1`) with SSR enabled, auto-imports, and file-based routing
* **UI/Component Library:** Vue 3 + Nuxt UI v4 (Tailwind CSS v4 under the hood)
* **Language:** TypeScript (strict typing preferred)
* **Package Manager:** pnpm (`pnpm@11.x`)
* **Key Modules:** `@nuxtjs/i18n` (en/th, no_prefix strategy), `@nuxt/icon`, `@nuxt/image`, `@nuxt/eslint`, `@vueuse/nuxt`, `@nuxtjs/device`
* **Notable Libraries:** zod, date-fns, ApexCharts + Unovis (charts), CropperJS, plyr (video), vue-pdf/pdf-lib, jszip, browser-image-compression, isomorphic-dompurify

## 2. Project Structure
```
app/            # Client application (Nuxt srcDir)
├── api/        # API client composables (auto-imported)
├── components/ # Auto-imported components grouped by feature (base/, chart/, chat/, ...)
├── composables/# Shared composables (useApi, useAuth, useCrudForm, ...)
├── layouts/    # default.vue, ai.vue, empty.vue, feed.vue
├── libs/       # Constants (libs/constants.ts), Snowflake ID generator
├── middleware/ # Numbered global route guards: 00.seo → 01.auth → 02.check-permit
├── pages/      # File-based routing; feature folders use [crud] dynamic segments
├── plugins/    # Client/server auth init + client-only lib registrations
├── stores/     # (reserved) Pinia/state stores
├── types/      # App-level TypeScript types
└── utils/      # dateUtil, fileUtil, appUtil helpers
server/api/     # Nitro backend routes (meta.ts + mock/ data endpoints)
shared/types/   # Types shared between client and server
i18n/locales/   # en/ and th/ split into namespaces: app, base, helper, model, error
public/fonts/   # Self-hosted GoogleSans + NotoSansThaiLooped fonts
```

## 3. Architecture & Patterns
* **Component Paradigm:** Vue 3 Composition API exclusively.
* **State:** `useState` / composables; auth session stored in cookies configured via `runtimeConfig.public.jwtKeyName` etc.
* **API Integration:** Centralized HTTP layer via the custom `useApi()` composable (wraps `ofetch`). It forwards cookies during SSR, attaches `Accept-Apiclient` / `Accept-Language` headers, and handles JWT refresh/logout.
* **Auth Flow:** Cookie-based JWT with refresh token; global middlewares enforce authentication (`01.auth.global.ts`) and permissions (`02.check-permit.global.ts`).
* **CRUD Pattern:** Generic CRUD pages use a single `[crud].vue` dynamic route per feature, driven by the `useCrudForm` / `useCrudList` / `usePaging` / `useSort` composables.
* **Configuration:** All environment-specific values live in `runtimeConfig.public` (nuxt.config.ts) and are overridden by `.env` files (`NUXT_PUBLIC_*`).
* **i18n:** `@nuxtjs/i18n` with `no_prefix` strategy, Thai (`th`) as default locale, locale detected via cookie. Messages split into namespace JSON files per language.

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
  <div class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
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

## 5. Commands
```bash
pnpm dev          # Dev server on port 3003 (loads .env.dev)
pnpm build        # Production build (Nitro output in .output/)
pnpm preview      # Preview production build
pnpm lint         # ESLint (@nuxt/eslint with stylistic rules: no comma dangle, 1tbs)
pnpm typecheck    # nuxt typecheck
```

## 6. Infrastructure & DevOps
* **Containerization:** Multi-stage Dockerfile (node:24 build → node:24-alpine runtime), runs Nitro via PM2 cluster mode using `ecosystem.config.cjs`.
* **Local orchestration:** `docker-compose.yml`; build helper scripts `build-app.sh` (bash) and `build-app.ps1` (PowerShell).
* **Environments:** `.env.example` documents all supported variables (`NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_SITE_URL`, timeouts, version info); `.env.dev` used by the dev script.
* **CI:** GitHub Actions workflow at `.github/workflows/ci.yml`.
* **Dependencies:** Renovate bot enabled (`renovate.json`).
* **Timezone:** Containers run in `Asia/Bangkok`.
