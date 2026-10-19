---
name: nuxt-frontend
description: Implement or change Nuxt UI code in app/ or i18n/ — pages, components, layouts, composables, shared state, forms, styling, permissions in the UI, and locale strings. Use for any non-CRUD screen or UI change. For a standard entity list/form use crud-module; add api-integration when a backend request or DTO changes.
---

# Nuxt frontend

Nuxt 4 (`app/` is the srcDir), SSR on, Nuxt UI 4 + Tailwind 4, Vue `<script setup lang="ts">`,
Thai default locale. Components, composables, `app/utils/`, and `app/api/` are auto-imported.

## When to use

- New page that is not a standard entity table/form (settings, dashboard widgets, wizards, detail views).
- New or changed component, layout, theme, or style.
- New composable or shared client state.
- Adding/changing user-facing text, menu entries, or permission-gated UI.

Use `crud-module` instead for entity list + `[crud]/[id]` form screens. Add `api-integration` when
you add or change a backend call. Skip this skill for docs-only work.

## Read first

1. `AGENTS.md` (always).
2. The file(s) you will change **and one nearby production example** of the same kind
   (table below). Do not start from `app/pages/example/`, `app/pages/test/`, or `app/components/Temp.vue`
   — they are demos.
3. Only when needed: `skills/frontend/UI.md` (styling, i18n detail), `skills/frontend/TYPES_VALIDATION.md`
   (state, zod, DTO), `skills/frontend/AUTH.md` (session, guards, RBAC).

## Where does the change go?

| You are adding… | Put it in | Copy the pattern from |
|---|---|---|
| A route | `app/pages/<kebab-case>/index.vue` (or `<name>.vue`) | `app/pages/settings/index.vue` (form page), `app/pages/index.vue` |
| A reusable component | `app/components/<domain>/<Domain><Name>.vue` → used as `<DomainName>` | `app/components/base/Base*.vue`, `user/UserCard.vue` |
| A browser-only component | `<Name>.client.vue` (optionally a `<Name>.server.vue` placeholder) | `app/components/chart/ChartArea.client.vue` + `.server.vue` |
| Stateful or reusable logic | `app/composables/use<Name>.ts` exporting `export const use<Name> = () => {…}` | `useLang.ts`, `useAppChat.ts` |
| Shared client state | `useState<T>('<domain>:<key>', () => init)` inside a composable | `useAuth.ts` (`auth:user`), `useAppChat.ts` (`chat:history`) |
| A backend call | `const api = useApi()` directly in the page/composable (default); an `app/api/use<Domain>Api.ts` helper only if the call is shared by several files (see `api-integration`) | `app/pages/settings/index.vue` (direct), `app/api/useFavoriteMenuApi.ts` (helper) |
| A paged / searchable / filterable list (non-CRUD) | `usePagefecth<T>({ apiEndpoint, defaultSorts, … })` in the page (composable: `app/composables/usePagefecth.ts`) | `app/pages/ai-chats/recent.vue`, `app/layouts/ai.vue` |
| A pure helper | `app/utils/<file>.ts` (auto-imported) | `app/utils/appUtil.ts`, `dateUtil.ts` |
| A constant | `app/libs/constants.ts` (import explicitly from `~/libs/constants`) | existing exports there |
| A type | entities → `app/types/models.ts` (extend `Id`); API/infra shapes → `common.ts`; component props → `props.ts` | `import type { AppUser } from '~/types/models'` |
| A browser-only plugin | `app/plugins/<name>.client.ts` | `app/plugins/cropperjs.client.ts` |
| App-wide Nuxt UI defaults / colors | `app/app.config.ts`; CSS tokens in `app/assets/css/main.css` | — |
| A sidebar entry | `appNavs` in `app/composables/useMenu.ts` (hardcoded, filtered by `permissions`) | existing items |
| A user-manual topic or category | `manuals/<slug>.md` + registry entry in `app/libs/manuals.ts` | `manuals/admin-getting-started.md`, `app/pages/manual/` |
| UI text | `i18n/locales/en/<file>.json` **and** `i18n/locales/th/<file>.json` | see i18n below |

Layouts: pages use `default` unless `definePageMeta({ layout: … })` says otherwise (`false` for the
login screens; `ai`, `chat`, `feed`, `empty` exist in `app/layouts/`).

## Recipe: new page

1. Create `app/pages/<kebab>/index.vue`:
   ```vue
   <script setup lang="ts">
   definePageMeta({
     pageName: 'nav.myFeature',              // i18n key, used as <title> by 00.seo middleware
     requiresPermission: ['my_feature_list'] // omit only for pages every signed-in user may open
   })
   const { t } = useLang()
   </script>

   <template>
     <BaseDashboardPanel id="my-feature" :title="$t('nav.myFeature')">
       <!-- content -->
     </BaseDashboardPanel>
   </template>
   ```
2. Add the i18n keys (both locales). Add a menu entry if it belongs in the sidebar, with the same
   permission codes as `requiresPermission`.
3. Data: call the backend with `useApi()` directly (no `app/api/` file needed), or reuse an existing `app/api/` helper. Use
   `await useAsyncData('<unique-key>', () => api<T>('/api/...'))` when the data should load during SSR;
   otherwise load in an action handler and keep `loading` / error state locally.
4. Forms: `<UForm :schema="schema" :state="state" @submit="onSubmit">` with a zod schema; messages
   via `t('error.…')` (see `app/pages/settings/index.vue`). Both `:schema` and `:state` are required.

Every authenticated route is protected by `01.auth.global.ts` automatically. To make a page public,
its route name must be in `AuthNoFilterPage` (`app/libs/constants.ts`) — ask before adding one.

## Recipe: user manual (คู่มือการใช้งาน)

Manual content lives in `manuals/<slug>.md` at the project root; structure (categories, cards,
icons, Thai/English titles) lives in `app/libs/manuals.ts`. The shell pages
`app/pages/manual/index.vue` (cards + search) and `app/pages/manual/[slug].vue` (markdown render)
already exist — adding a topic usually needs no new component.

1. Create `manuals/<slug>.md`: slug is lowercase letters, digits, hyphens (`/^[a-z0-9-]{1,80}$/`,
   enforced by the content endpoint). Start with `# Title`, Thai-first, no backend endpoint/field
   claims without live evidence (`BACKEND_NOT_ACCESSIBLE`).
2. Register it in `manualCategories` (`app/libs/manuals.ts`): pick a category (or add one with
   a `title` map), add `{ slug, icon, title: { th, en }, desc: { th, en } }`. Text maps may carry
   extra locale keys later (e.g. `lo`); read them only via `pickManualText(text, locale)`, which
   falls back to `th`. Every registered slug must have its `.md` file, and vice versa.
3. The detail page fetches `/api/manuals/content?slug=…&locale=…` (local Nitro, `useFetch` —
   not the Spring Boot backend) and renders with
   `<BaseMarkdownPreview :key="content" :content="content" />` (`:key` forces a remount when the
   async content arrives; the component copies props once). The endpoint returns `servedLocale`;
   when it differs from the requested locale, show the `page.manualFallbackNotice` banner.
   Per-locale files are `<slug>.<locale>.md` (e.g. `<slug>.en.md`); plain `<slug>.md` is the Thai
   default, and a `<slug>.th.md` file is never served by the endpoint.
4. If the topic needs a sidebar/menu change, follow the normal menu + i18n steps. Manual pages
   omit `requiresPermission` (open to every signed-in user).
5. Production reads `manuals/` from the server cwd — `Dockerfile` already copies it. Do not remove
   that `COPY` line.

## i18n (how the files actually work)

- The five files per locale (`app`, `base`, `helper`, `model`, `error`) are merged into one message
  tree. **The file name is not part of the key.** Find the file by the key's top-level family:
  `nav.*`, `app.*`, `page.*` → `app.json`; `base.*`, `drive.*`, `theme.*`, `ai.*`, … → `base.json`;
  `success.*`, `helper.*` → `helper.json`; `model.*` and legacy flat `model_*` → `model.json`; `error.*` → `error.json`.
  Locate a family with `grep -n '"nav"' i18n/locales/en/*.json`.
- Add each new key to the same file in **both** `en/` and `th/`. Do not create a new top-level family
  when an existing one fits, and do not add keys to `i18n/locales/en.json` / `th.json` (not loaded).
- Script: `const { t } = useLang()`; template: `$t('…')`. For entity labels prefer nested
  `model.<entityKey>.<field>`; the flat `model_*` keys are legacy.

## Rules

- SFC order: `<script setup lang="ts">` then `<template>`. No Options API. Generic components use `generic="T"`.
- Components: check `app/components/base/Base*.vue` first — if a wrapper fits, use it before any raw `U*` component.
- Lists with paging / search / filter / sort: use `usePagefecth` (`app/composables/usePagefecth.ts`) directly
  when the screen is not an entity CRUD page (`useCrudList` wraps it for those). Do not hand-roll paging/sort state;
  keep its dual-shape handling (`ApiResponse<T>` or bare `T[]`).
- Two-way props via `defineModel`; shared state via namespaced `useState` — no Pinia, no `provide/inject` for app state.
- SSR is on: touch `window`, `document`, `localStorage`, media devices only inside `onMounted`,
  `import.meta.client` guards, `.client.vue` components, or client plugins.
- Backend requests only via `useApi()` (directly, or an existing `app/api/*` helper) — never `$fetch` / `useFetch` to backend paths.
  Creating an `app/api/*` file is optional; do not add one for a single-screen call.
  (Local Nitro mocks under `server/api/mock/` may use `useFetch`.)
- Hide UI by permission with `v-rbac="{ permissions: ['code'], condition: 'any' | 'all' | 'not' }"`
  (removes the element from the DOM) or BaseTable/BaseForm permission props. This is UX only.
- IDs are `IdType` (bigint | string). Never convert to `number`.
- Formatting: 2 spaces, LF, no trailing commas. Quote/semicolon style is mixed across the repo —
  match the file you are editing. No new `any` or `@ts-ignore`.
- Show user-supplied or untrusted text (user input, posts, comments, third-party content) with
  `<BaseContentText :content="…" urlify />` — never `v-html` directly. Use `rows` + `show-more` to
  truncate. For HTML sources, convert to plain text first (`hackerHtmlToText` in `app/utils/feedUtil.ts`).
- Manual topics: slug matches `/^[a-z0-9-]{1,80}$/`; registry entry and `.md` file must exist as a
  pair; render markdown only via `BaseMarkdownPreview` (with `:key`), never raw `v-html`.
- Theme-aware classes (`bg-default`, `text-muted`, `border-default`) over hardcoded colors; check dark mode.
- Keep the change minimal; check every caller before changing a shared component or composable
  (`grep -rn "<ComponentName\|useThing(" app`).

## Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| `window is not defined` / hydration mismatch | Browser API during SSR | Move into `onMounted` / `import.meta.client` / `.client.vue` |
| Raw `U*` component used where a `Base*` wrapper exists | `app/components/base/` not checked first | Check `Base*.vue` and compose with the wrapper |
| List page hand-rolls paging/sort/filter state | `usePagefecth` not known/used | Use `usePagefecth` (non-CRUD) or `useCrudList` + `BaseTable` (entity list) |
| Label shows the raw key (`model.foo.name`) | Key missing in one locale or put in the wrong family file | Add to both locales under the right top-level family |
| Page opens for everyone | `requiresPermission` missing or `[]` (empty = allow) | Set explicit codes |
| Menu shows item, click gives 403 | Menu `permissions` ≠ page `requiresPermission` | Make them match |
| Two toasts on an error | Wrapper already toasts `AppException` / `ResponseMessage` | Remove the manual error toast; keep the error state |
| State leaks between users/tabs on SSR | Module-level `ref` used as global state | Use `useState('<domain>:<key>')` |
| Links in user text are not clickable, or XSS risk from `v-html` | User text rendered with `{{ }}` / raw `v-html` | Render it with `<BaseContentText :content urlify />` |
| Element hidden by `v-rbac` cannot be found later | `v-rbac` removes it from the DOM | Use `v-if` with `useRbac().hasPermission(...)` if you need to toggle |
| Manual detail page is blank though the API returns content | `BaseMarkdownPreview` copies props once, so late-arriving content is ignored | Pass `:key="content"` so it remounts |
| Manual 404 in production only | `manuals/` is missing from the runtime image | Keep the `COPY … /app/manuals` line in `Dockerfile` |

## Done checklist

- [ ] `pnpm typecheck` passes (0 errors); `pnpm build` passes when runtime code changed.
- [ ] Every new string exists in `en` and `th`; no hardcoded user-facing text.
- [ ] Protected pages declare `requiresPermission`; menu entries use the same codes.
- [ ] No browser globals on the SSR path; no new `any` / `@ts-ignore`; IDs not coerced to `number`.
- [ ] Loading, empty, and error states handled for any data the screen fetches.
- [ ] The diff touches only files the task needs. Manual checks not performed are listed in the report.
- [ ] For a numbered task, the task file was updated as described in `task-execution`.
