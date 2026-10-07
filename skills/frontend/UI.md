# Frontend UI and i18n reference

Use for production pages, components, layouts, styling, and locale text. Inspect the closest production file first; `app/pages/example/`, `app/pages/test/`, and `app/components/Temp.vue` are demos.

## Structure and components

- Place Nuxt client code under `app/`; use `<script setup lang="ts">` before `<template>` in Vue SFCs. Keep page directories kebab-case and reusable components PascalCase. `app/api/` is auto-imported through `nuxt.config.ts`.
- For entity screens, follow `.agents/skills/crud-module/SKILL.md` (reference modules `app/pages/permission/`, `app-role/`, `app-user/`). Use `BaseTable` and `BaseForm` where their props and slots fit. For other screens, reuse nearby Nuxt UI components and layouts instead of forcing a CRUD shape.
- Declare `definePageMeta({ pageName, requiresPermission })` for protected admin screens using verified permission codes. Check callers and emitted events before changing a shared component.
- Browser-only libraries and globals need a client boundary (`.client.vue`, client plugin, or `import.meta.client`) because SSR is enabled.

## Styling

- Shared Nuxt UI defaults live in `app/app.config.ts`; theme tokens and base CSS live in `app/assets/css/main.css`. Use theme-aware utilities such as `bg-default`, `text-muted`, and `border-default` where appropriate.
- A local `:ui` override is valid for a component-specific layout or slot; the repository uses them in production. Promote an override to `app/app.config.ts` when it should apply across the app. Check light and dark appearance for every new color choice.
- Follow nearby styling and the repo's 2-space/LF formatting. Use an explanatory comment when it helps preserve a non-obvious invariant; do not add comments that only repeat code.

## Displaying user text

- Use `<BaseContentText>` (`app/components/base/BaseContentText.vue`) for any user-supplied or untrusted text (input, posts, comments, third-party content). It escapes then sanitizes (`inputSanitizeHtml`), `urlify` turns URLs into clickable links, and `rows` / `show-more` truncate with a see-more toggle. Do not use `v-html` directly; for HTML sources convert to plain text first (e.g. `hackerHtmlToText` in `app/utils/feedUtil.ts`). Examples: `app/components/example/ExampleFeedItem.vue`, `ExampleCommentThread.vue`.

## i18n

- User-facing text belongs in both `i18n/locales/en/<file>.json` and `i18n/locales/th/<file>.json` (`app`, `base`, `helper`, `model`, or `error`). The files are merged into one message tree — the file name is not a key prefix — so put a key in the file that already holds its top-level family (`nav.*` → `app.json`, `success.*` → `helper.json`, `model.*` → `model.json`). Root `i18n/locales/en.json` / `th.json` are not loaded.
- In script, use `useLang()` / `t()`; in templates, use `$t()`. Confirm both locales render the new label and any validation or empty-state message.
- The default locale is Thai and the routing strategy is `no_prefix` (`nuxt.config.ts`). `useApi()` derives `Accept-Language` from the locale cookie; do not set that header in pages.
