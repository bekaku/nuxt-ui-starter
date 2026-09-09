# Frontend UI Skill

Read this file for component/page work, Nuxt UI usage, styling, theme/dark mode, and i18n.

### F4. Components, pages, naming

- SFC block order MUST be `<script setup lang="ts">` → `<template>` → `<style scoped>`. Verified across all sampled files; only `Temp.vue:97-108` has a style block. NEVER `<template>`-first.

- ALWAYS `<script setup lang="ts">` (add `generic="T"` for generic components: `BaseForm.vue:1`, `BaseTable.vue:1`). NEVER Options API.

- Script ordering: `imports` → `definePageMeta` → `props` → `emits` → `defineModel` → composables (`useLang`/`useRbac`/...) → `ref/computed` → functions → lifecycle. (e.g. `BaseForm.vue:1-64`, `BaseTable.vue:1-88`).

- Props: MUST use reactive destructure with defaults. `withDefaults` in `BaseModal.vue:4-27`, `BaseDashboardPanel.vue:3-24`, `BaseItem.vue:3-28` is LEGACY — migrate to destructure on touch:

```ts

// CORRECT (preferred)

const { item, isHistoryItem = true } = defineProps<{ item: *GroupChat*, isHistoryItem?: *boolean* }>()

// app/components/chat/ChatHistoryItem.vue:4

```

- Emits: MUST use type-tuple syntax. Runtime array syntax in `InboxMail.vue:9` (`defineEmits(['close'])`) is the SOLE exception — migrate it:

```ts

// CORRECT

const emit = defineEmits<{ 'on-close': [], change: [id: *number*], update: [value: *string*] }>()

```

- Component files MUST be `PascalCase` with domain prefix (`Base*.vue`, `Chat*.vue`, `Chart*.vue`, `Example*.vue`, `*Modal.vue`). NEVER kebab-case filenames.

- Composables MUST be `useX.ts` in `app/composables/` (28 files) or domain clients in `app/api/` (auto-imported via `imports.dirs: ['api']`). Rely on auto-imports — no manual `import { useApi } from ...`.

- Pages: kebab folders + `index.vue` (list) + `[crud]/[id].vue` (create/edit/detail). `route.params.crud` MUST be one of `copy|edit|new|view` (`useCrudForm.ts:18`); `crudName` option MUST be `PascalCase` (`app/pages/app-user/index.vue:34` comment `//PascalCase only eg: User, AppRole`).

- `definePageMeta({ pageName, requiresPermission })` on CRUD pages (e.g. `app-user/[crud]/[id].vue:1-14`).

- Nuxt UI: ALWAYS prefer `UButton/UCard/UInput/UModal/UForm/UFormField/UTable/UAvatar/UBadge/USelect/UTextarea/UCheckbox/USwitch/UDropdownMenu/UTooltip/USeparator/UEmpty/USkeleton/UDashboard*` over raw HTML. Tables MUST use `h(resolveComponent('UButton'|'UAvatar'|...), ...)` render pattern (`example/customers.vue:8-12`, `app-user/index.vue:13-14`).

- Slots: `UCard/UModal #header/#body/#footer` (`BaseForm.vue:313,355`, `BaseModal.vue:45-62`); input adornments `#leading/#trailing` (`BaseItem.vue:66,114`); `UTable #empty` (`BaseTable.vue:790`); domain slots `#prepend-fields/#auto-fields/#field-<name>/#crud-action` on `BaseForm` (`BaseForm.vue:361-368,691`); dynamic passthrough `#[slotName]` (`BaseTable.vue:836-842`). `UForm` pattern is ALWAYS `<UForm :schema :state @submit>` (see F7).

- Icons: default size `18px` from `app.config.ts:2-4`. Use `lucide:` / `i-lucide-*` names (`octagon-alert`, `circle-check` in `useApi.ts:115,124`).

- NEVER add comments unless required (repo convention; existing code is comment-sparse outside commented-out token code).


### F5. Styling / theme / dark mode

- Tailwind utilities inline + `dark:` variant on EVERY color decision. NEVER light-only styling:

```html

<div *class*="bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white">

```

- MUST use theme tokens `bg-default/bg-elevated/bg-inverted text-muted/text-highlighted/text-dimmed/text-inverted ring-default border-default` over hardcoded grays (pervasive; e.g. `BaseTable.vue:780-787` `UTable :ui`).

- Design tokens live in `app/assets/css/main.css` `@theme static` (`--color-success/error/warning-*`, `--font-sans: "GoogleSans"`) + `:root { --ui-radius: 0.375rem }` + `@layer base { body { @apply bg-neutral-50 dark:bg-neutral-950 } }`. Component defaults live in `app/app.config.ts` (`colors: primary blue / neutral stone / info sky`, `button.defaultVariants { variant subtle, color neutral, size md }`, `card.slots.root 'overflow-visible'`). MUST NOT hardcode variant/color per button — inherit defaults.

- Custom CSS: plain scoped CSS ONLY, no SCSS. Only 2 custom-CSS locations exist (`main.css:100-117`, `Temp.vue:97-108`) — keep it that way.

- Images: use `@nuxt/image` with `avatar` preset (`jpg 50x50`, `nuxt.config.ts:126-136`).

- CropperJS v2 tags (`cropper-canvas`, `cropper-image`, …) are registered custom elements (`nuxt.config.ts:56-59`). MUST NOT wrap them in Vue component imports.


### F8. i18n — NEVER hardcode user strings

- Script: `const { t } = useLang()` (wraps `nuxtApp.$i18n`), e.g. `t('chats.unsend')`, `t('model_user_email')` in column defs, `t('error.validateRequireField')` in zod messages. Template: `$t('base.save')`, `:label="$t('base.search')"` (`BaseForm.vue:713`, `layouts/default.vue:156`).

- Every new key MUST be added to BOTH `i18n/locales/en/<ns>.json` AND `i18n/locales/th/<ns>.json` under the correct namespace (`app|base|helper|model|error`). Files are namespaced objects (e.g. `en/base.json` → `"base": {...}`).

- Default locale `th`, `detectBrowserLanguage { useCookie: true, cookieKey: 'locale', fallbackLocale: 'th' }`. `Accept-Language` header follows the `locale` cookie (`useApi.ts:39-51`).
