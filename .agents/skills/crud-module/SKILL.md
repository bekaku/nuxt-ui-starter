---
name: crud-module
description: Add or change a standard admin entity screen (list page + create/edit/view/copy form) built on useCrudList, useCrudForm, usePagefecth, BaseTable, and BaseForm. Use for "add a <Entity> management page", new columns/fields/filters on an existing entity screen, or a broken CRUD URL, redirect, or missing action button. Not for non-entity pages (use nuxt-frontend).
---

# CRUD module

Every admin entity in this console is two files wired to the same scaffold. The fastest correct
path is to copy a reference module and rename it; most CRUD bugs come from one wrong
`crudName` or `apiEndpoint`.

## When to use

- Add a new entity screen (e.g. `Foo` → `/foo`, `/foo/edit/123`).
- Add or change columns, search filters, sort, form fields, or validation on `app-user`,
  `app-role`, `permission`, `api-client`, or `ai-document-meta`.
- Debug: wrong endpoint, wrong redirect after save, Add/Edit/Delete button missing, list stays empty.

Not for dashboards, settings pages, chat, or any screen that is not "table of entities + form"
(use `nuxt-frontend`). If the endpoint shape itself changes, also load `api-integration`.

## Read first

1. `AGENTS.md` (always).
2. The reference module you will copy: `app/pages/permission/` (simplest form) or
   `app/pages/app-role/` (form that loads lookup options with `useAsyncData`).
3. Only if you need an option or behavior not shown in the reference: `skills/frontend/CRUD.md`
   (X5 `useCrudList` options, X6 `useCrudForm` options, X7 search wire format, X9 component props/slots).

## The five names derived from one entity

Pick the PascalCase `crudName` first. Everything else is derived from it by string transform
(`app/utils/appUtil.ts`), with no validation — a typo fails silently.

| What | Rule | `Foo` / `ApiClient` | Used by |
|---|---|---|---|
| `crudName` | PascalCase | `Foo` / `ApiClient` | both composables, `:crud-name` on BaseTable/BaseForm |
| API path | `/api/` + camelCase | `/api/foo` / `/api/apiClient` | `useCrudForm` (auto), `useCrudList` delete (auto) |
| Page dir / route | kebab-case | `app/pages/foo/` / `app/pages/api-client/` | `onNewForm`, `onItemClick`, `onBack` |
| Permission codes | snake_case + `_list\|_view\|_add\|_edit\|_delete` | `foo_list` / `api_client_edit` | BaseTable/BaseForm buttons, `requiresPermission`, menu |
| i18n family | `model.<entityKey>.*` in `model.json` | `model.foo.table`, `model.foo.name` | `pageName`, column headers, field labels |

Permission codes are owned by the backend. Use codes that already appear in this repo or in live
evidence (devtools / OpenAPI); for a new entity, write the expected codes into the task file and
mark them `NOT_VERIFIED`. Never invent a different naming scheme.

## Recipe: add a new entity `Foo`

Copy, then rename every occurrence using the table above.

1. **Type** — add to `app/types/models.ts`:
   ```ts
   export interface Foo extends Id {   // Id gives id?: IdType (bigint | string) — never number
     name: string
     active?: boolean | null
   }
   ```
   Use only fields confirmed by the reference endpoint or live evidence.
2. **List page** — copy `app/pages/permission/index.vue` (or `app-role/index.vue`) to
   `app/pages/foo/index.vue`, then set:
   - `definePageMeta({ pageName: 'model.foo.table', requiresPermission: ['foo_list'] })`
   - `useCrudList<Foo>({ crudName: 'Foo', apiEndpoint: '/api/foo', headers: [], itemsPerPage: 10, defaultSorts: [...] })`
     — **both** `crudName` and `apiEndpoint` are required; `apiEndpoint` is the complete list URL.
   - `columns` as `TableColumn<Foo>[]`; searchable/sortable columns carry
     `meta.options` (`ICrudFilterOptions`) with `searchModel: ''`.
   - Keep the `<BaseDashboardPanel>` + `<BaseTable>` block and all its `@on-*` handlers unchanged.
3. **Form page** — copy `app/pages/permission/[crud]/[id].vue` to `app/pages/foo/[crud]/[id].vue`, then set:
   - `definePageMeta({ pageName: 'model.foo.table', requiresPermission: ['foo_view', 'foo_add', 'foo_edit'] })`
   - a zod `schema`; each field uses `.describe(uiConfig({ label: t('model.foo.name'), ui: { type: 'text', ... } }))`
   - `const state = ref<Partial<Schema>>({ ...defaults })`
   - `useCrudForm<Foo>({ crudName: 'Foo' }, state)` — `state` is the **second positional argument**;
     `apiEndpoint` here is only a prefix (default `/api`), so normally omit it.
   - Keep `v-model="state"` on `<BaseForm>`; it emits `on-submit` with no payload.
4. **i18n** — add `model.foo.table` and every field label to **both**
   `i18n/locales/en/model.json` and `i18n/locales/th/model.json` (inside the existing `"model"` object).
5. **Menu** (only if the screen belongs in the sidebar) — add an item to `appNavs` in
   `app/composables/useMenu.ts`:
   `{ label: t('model.foo.table'), icon: 'lucide:box', to: '/foo', permissions: ['foo_list'] }`.
   `permissions` must equal the list page's `requiresPermission`.
6. **Verify** — see the checklist below.

Routes produced by the scaffold: list `/foo`, new `/foo/new/0`, edit `/foo/edit/<id>`,
view `/foo/view/<id>`, copy `/foo/copy/<id>`. `[crud]` must be one of `new | copy | edit | view`,
otherwise `useCrudForm` throws 400.

## Recipe: change an existing entity screen

- **Add a column**: append to `columns`; use `h(resolveComponent('UButton'), …)` in `cell` for components.
  Add `meta.options` only if the backend can filter/sort that column (`searchColunm`/`sortColunm`
  override the server column name — note the spelling).
- **Add a form field**: add it to `schema`, to `state` defaults, and to both locale files. For a
  custom control, use the `#field-<name>` slot on `BaseForm` (see `app-role/[crud]/[id].vue`).
- **Dropdown options from the backend**: load them with
  `await useAsyncData('<unique-key>', () => api<T[]>('/api/...'))` (see `app-role` form) and pass
  them as `uiConfig({ children: [...] })` or render them in a `#field-<name>` slot.
- **Extra list filter that is always on**: `additionalUri` is a raw query fragment appended last
  (only existing use: `additionalUri: '_q=active=true'` in `api-client/[crud]/[id].vue`). Combined with a
  user filter it sends a second `_q`; how the backend treats that is `BACKEND_NOT_ACCESSIBLE`.

## Rules

- MUST reuse `useCrudList` / `useCrudForm` / `usePagefecth` + `BaseTable` / `BaseForm`; do not hand-roll
  paging, delete confirmation, or redirects.
- MUST keep `crudName` PascalCase and identical on the list and form pages.
- MUST keep `pageName` identical on list and form pages (it is the browser title key).
- MUST keep IDs as `IdType` / string end to end. Never `Number(id)`, `+id`, `parseInt`, or `getParamNumber` on an ID.
- MUST NOT pass explicit `*-permission` props when `:crud-name` already derives them.
- MUST NOT rename the scaffold's misspelled public names: `usePagefecth`, `fectchDataOnLoad`,
  `searchColunm`, `sortColunm`, `SearchParamiter`, `#heder-start`.
- The list response may be `ApiResponse<T>` (`dataList`, `last`, `totalElements`, `totalPages` — all four)
  **or** a bare `T[]`; `usePagefecth` handles both. Do not remove either branch.
- Client permission checks are presentation only; the backend still authorizes every request.

## Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| Request URL starts with `undefined` | `useCrudList` got `crudName` but no `apiEndpoint` | Pass the full list URL as `apiEndpoint` |
| Save/GET goes to `/api/foo/foo/...` | Passed the full URL as `useCrudForm` `apiEndpoint` | Omit it (it is a prefix, default `/api`) |
| Add / Edit / Delete buttons missing, or whole actions column gone | `crudName` casing wrong, or user lacks `<entity>_add/_edit/_delete` | Fix casing; check `auth.value.permissions` |
| Menu item visible but click shows 403 | Menu item has no `permissions`, or its codes differ from `requiresPermission` | Make them match |
| List stays empty with no error | Response is an envelope missing one of the four fields, so neither branch matches | Capture the real response; see `CRUD.md` X7 |
| Form fields empty after navigating away and back | `useCrudForm` deletes every key of `state` on unmount | Re-create defaults in the page, do not share `state` across pages |
| Fields are read-only / no Save button | Screen is in `view` mode (`BaseForm` gets `:edit-mode="isEditMode"` and disables the form) | Intentional. Users with `<entity>_edit` see an Edit button that switches to edit mode |
| `PUT /api/foo/undefined` | GET-one response has no `id`, and the PUT URL uses `entity.id` | Confirm the response includes `id` |

Keep `:edit-mode="isEditMode"` and `@on-edit-enable="onEnableEditForm"` on `<BaseForm>` (as the
reference pages do): in `view` mode they make the form read-only and show an Edit button.

Intentional deviation: `ai-document-meta/[crud]/[id].vue` is an upload-only form (only the `new`
route is reachable; the list's row action is delete-only), so it requires just `ai_document_meta_add`.
Do not copy that for a normal entity.

## Done checklist

- [ ] `pnpm typecheck` passes (0 errors); `pnpm build` passes for new or changed pages.
- [ ] `crudName`, API path, route dir, permission codes, and i18n keys all follow the table above.
- [ ] List `requiresPermission` = menu `permissions`; form `requiresPermission` = `[view, add, edit]` codes.
- [ ] Every new label exists in `en/model.json` and `th/model.json`.
- [ ] No `number` conversion of IDs; no new `any` beyond the existing `meta: {...} as any` column pattern.
- [ ] If a live backend was available: list, search, sort, page, new, edit, copy, delete were exercised.
      Otherwise the report says which of these were not exercised.
- [ ] Endpoints or permission codes not seen in live evidence are labelled `NOT_VERIFIED` in the task/report.
