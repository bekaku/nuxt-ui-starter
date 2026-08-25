# Nuxt UI Dashboard Starter

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt&labelColor=020420)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![CI](https://github.com/bekaku/nuxt-ui-starter/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

A production-ready full-stack admin dashboard starter built with **Nuxt 4** and **Nuxt UI v4** (Tailwind CSS v4). Ships with cookie-based JWT authentication, RBAC, generic CRUD scaffolding, i18n (Thai/English), and a Nitro mock API layer — designed to pair with a [Java Spring Boot backend starter](https://github.com/bekaku/java-spring-boot-starter).

## Features

- **SSR-first architecture** with SSR-safe API layer, auth token refresh, and cookie forwarding
- **Nuxt UI v4** component system with light/dark mode, collapsible sidebar, command palette, and keyboard shortcuts
- **Generic CRUD pattern** — single `[crud].vue` dynamic route per feature, driven by reusable `useCrudList` / `useCrudForm` composables
- **Authentication & authorization** — global route guards (`auth`, `check-permit`), JWT access/refresh cookies, permission-aware UI via `useRbac`
- **Internationalization** — `en` / `th` locales with namespaced message files and browser-language detection
- **Rich media support** — charts (ApexCharts, Unovis), image cropping (CropperJS), video playback (Plyr), PDF viewing/manipulation, file upload with compression
- **Self-hosted fonts** (Google Sans, Noto Sans Thai Looped) served locally via `@nuxt/fonts`
- **Mock API layer** — Nitro server routes under `server/api/mock/` for dashboard, chart, chat, and file endpoints

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Nuxt 4, Vue 3 (Composition API) |
| UI | Nuxt UI v4, Tailwind CSS v4, @nuxt/icon |
| Backend | Nitro server routes (`server/api`) |
| i18n | @nuxtjs/i18n (`no_prefix` strategy, `th` default) |
| Utilities | VueUse, zod, date-fns, jszip, isomorphic-dompurify |
| Tooling | pnpm, ESLint (@nuxt/eslint), vue-tsc, Renovate |

## Project Structure

```
├── app/
│   ├── api/            # API client composables (auto-imported)
│   ├── components/     # Auto-imported components grouped by feature
│   ├── composables/    # Core logic: useApi, useAuth, useCrud*, useRbac, ...
│   ├── layouts/        # default, ai, empty, feed
│   ├── middleware/     # Global guards: seo → auth → permissions
│   ├── pages/          # File-based routes; features use [crud] segments
│   ├── plugins/        # Client/server auth init + client-only libs
│   └── utils/          # date, file, and app helpers
├── server/api/         # Nitro endpoints (meta + mock data)
├── shared/types/       # Client/server shared types
├── i18n/locales/       # en/ & th/ namespaces: app, base, helper, model, error
└── public/fonts/       # Self-hosted font assets
```

## Architecture Overview

This is a Nuxt 4 (Vue 3) admin/dashboard starter built on `@nuxt/ui` v4, designed as an internal app framework with CRUD scaffolding, RBAC, i18n (Thai/English), and AI chat features. It's SSR-enabled and talks to an external backend (Spring Boot-style, per naming conventions) — the repo's own `/server/api` only contains mocks.

### Layers

1. **Entry & config**
   - `nuxt.config.ts` — modules (`@nuxt/ui`, `@nuxtjs/i18n`, `@vueuse`, device, image, icon), runtimeConfig (JWT cookie names, upload limits, API base), fonts, route rules. Auto-imports extended to `app/api`.
   - `app/app.vue`, `app.config.ts`, layouts in `app/layouts/` (`default`, `ai`, `empty`, `feed`).

2. **Routing & pages** (`app/pages/`)
   - Feature folders: `ai-chats/`, `api-client/`, `app-user/`, `app-role/`, `permission/`, `my-drive/`, `settings/`, `example/`.
   - A strong convention: each entity has `index.vue` (list) plus `[crud]/[id].vue` (view/add/edit/delete form driven by `crudAction` param).

3. **Global middleware pipeline** (numbered execution order)
   - `00.seo.global.ts` — SEO meta from page meta.
   - `01.auth.global.ts` — cookie-based auth guard; whitelist via `AuthNoFilterPage`; redirects to `/auth/login?continue=...`.
   - `02.check-permit.global.ts` — permission check against `requiresPermission` declared in `definePageMeta`.

4. **Composables — the real application layer** (`app/composables/`)
   - `useApi.ts` — central fetch wrapper (auth headers, error handling, stream support).
   - `useAuth` / `useRbac` / `useAppCookie` — session + permission state.
   - **CRUD framework**: `usePagefecth` (paging/sorting/data fetching) → `useCrudList` (list pages; builds `q=col:val,col=val` advanced-search query strings from table header meta) → `useCrudForm` (form pages). Combined with `BaseTable`/`BaseForm` components, a new entity list+form page is mostly declarative: define zod schema with `uiConfig()` describe hints and column metadata.
   - Domain helpers: `useAiChat` (SSE streaming chat client), `useMenu`, `useUpload`, `useDownload`, `useDateFns`, `useLoader`, `useConfirmDialog`, broadcast-channel/cache/theme utilities.

5. **Components** (`app/components/base/`, `chat/`)
   - ~45 `Base*` primitives (Table, Form, Modal, FileUpload, PdfView, ImageCropper, CameraCapture, InfiniteScroll, etc.) wrapping Nuxt UI. Pages compose these rather than raw UI lib components.
   - Plugins in `app/plugins/` register client-only libs (apexcharts, plyr, cropperjs, pdf) as lazy components and provide `$datefns`.

6. **Backend contract**
   - Real API is external: endpoints derived by convention `/api/{camelCaseEntity}` (+ `/generate/{id}` style actions), JWT in cookies (`_session_`/`_slid_`).
   - `server/api/mock/*` — local mock data (dashboard charts, chat history, files) so the starter runs standalone; `shared/types` holds shared DTOs.

7. **i18n** — `@nuxtjs/i18n` with `no_prefix` strategy, default `th`, split namespace files per locale (`app/base/helper/model/error.json`) in `i18n/locales/{en,th}/`.

### Data flow example (CRUD list)

Route middleware checks auth/permission → page calls `useCrudList({ crudName, apiEndpoint, headers })` → `usePagefecth` builds paging/sort/search params → `useApi` calls backend → `BaseTable` renders columns/slots → search/sort events rebuild the query string and sync it to the URL.

In short: a convention-driven CRUD scaffold where entities are declared via composables + zod schema + column meta, with cross-cutting concerns (auth, RBAC, i18n, loading, toasts) handled globally by middleware and composables.

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables and adjust as needed
cp .env.example .env.dev

# Start the development server on http://localhost:3003
pnpm dev
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Development server on port `3003` (loads `.env.dev`) |
| `pnpm build` | Production build (Nitro output in `.output/`) |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Lint with ESLint |
| `pnpm typecheck` | Run `nuxt typecheck` |

## Environment Variables

All runtime configuration lives in `runtimeConfig.public` (see `nuxt.config.ts`) and is overridable via `NUXT_*` environment variables. See [.env.example](.env.example) for the full list:

| Variable | Description |
| --- | --- |
| `NUXT_PUBLIC_API_BASE` | Base URL of the REST API |
| `NUXT_PUBLIC_CDN_BASE` | CDN base URL for static/media assets |
| `NUXT_PUBLIC_SITE_URL` | Public site URL (used for OG metadata) |
| `NUXT_PUBLIC_TIME_OUT` | Request timeout in ms (`0` disables) |
| `NUXT_PUBLIC_JWT_KEY_NAME` | Session cookie name |

## Deployment

### Docker (recommended)

The multi-stage `Dockerfile` builds the app and runs it in production via PM2 cluster mode:

```bash
docker compose up -d --build
```

Or build manually:

```bash
./build-app.sh          # bash
.\build-app.ps1         # PowerShell
```

The container runs as a non-root user with timezone set to `Asia/Bangkok` and includes a built-in health check.

### Manual

```bash
pnpm build
node .output/server/index.mjs
```

See the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for other targets.

## Companion Backend

This frontend is designed to integrate with a Java Spring Boot REST API starter:
[java-spring-boot-starter](https://github.com/bekaku/java-spring-boot-starter)

## Dependency Updates

[Renovate](https://github.com/apps/renovate) is preconfigured via `renovate.json` — install the [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository to enable automated dependency PRs.

## License

Distributed under the terms of the [LICENSE](LICENSE).
