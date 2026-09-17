# Frontend CRUD Skill

Read this file when the task adds or changes an entity administration screen — a list
page, a create/edit/view form, or the search/paging behaviour behind them.

All frontend file:line references were verified on 2026-09-15; backend-contract
corrections applied 2026-09-17 (see docs/agent/audit-report.md).

> Backend boundary (2026-09-17): the Spring Boot repository is NOT in this workspace.
> Any prior claim that X7 was "read from `/backend` source" is withdrawn — the `;`
> separator and operator rules below are frontend-observed conventions
> (`app/libs/constants.ts`) whose backend side is `BACKEND_NOT_ACCESSIBLE` until live
> evidence (devtools / OpenAPI) confirms it.

Historical note: a prior `tasks/002-fix-crud-scaffold-defects.md` is referenced by older
revisions of this file, but NO numbered task files exist in `tasks/` (VERIFIED
2026-09-17 — only `README.md`). Do not treat that task ID as existing history.
The `_q` separator/operator constants now live in `SearchSeparator` /
`SearchOperationsByLength` (`app/libs/constants.ts`); keep them in sync with live
backend evidence if the contract ever changes.

Related: `API.md` (how `useApi` is called), `UI.md` (component/page conventions),
`TYPES_VALIDATION.md` (zod schema rules), `../../docs/API_CONTRACT.md` (the wire format).

---

## X1. When to use the scaffold

- Every admin entity screen MUST be built on `useCrudList` + `useCrudForm`
  (`app/composables/`). MUST NOT hand-roll list fetching, paging, sorting, search, or
  form submit — `usePagefecth` already does all of it.
- The five reference implementations are `app/pages/app-user/`, `app-role/`,
  `permission/`, `api-client/` and `ai-document-meta/`. `app-user` and `app-role` are the
  best models to copy.
- The file layout is fixed (see `UI.md` F4): `app/pages/<kebab-name>/index.vue` for the
  list and `app/pages/<kebab-name>/[crud]/[id].vue` for the form. `[crud]` and `[id]` are
  the literal route params `PageActionParamiter` and `PageIdParamiter`
  (`app/libs/constants.ts:6-7`).

---

## X2. `crudName` derives four identifiers — get it right or fail silently

`crudName` MUST be PascalCase (`app/pages/app-user/index.vue:34` says so inline). Four
identifiers are derived from it by string transform (`app/utils/appUtil.ts:149-151`),
with **no validation anywhere**:

| Derived | Transform | `"AppUser"` → | Source |
| --- | --- | --- | --- |
| API path | `pascalToCamelCase` | `/api/appUser` (+`/{id}`) | `useCrudList.ts:42-48`, `useCrudForm.ts:42-52` |
| Route path | `pascalToKebab` | `/app-user/edit/123` | `useCrudList.ts:196-226` |
| Table permissions | `pascalToSnake` | `app_user_view` / `_add` / `_edit` / `_delete` | `BaseTable.vue:149,161,173,185` |
| Form permissions | `pascalToSnake` | `app_user_list` / `_edit` / `_add` / `_delete` | `BaseForm.vue:75,87,99,111` |

A wrong casing produces a wrong endpoint, a wrong redirect, **and** silently missing
action buttons. Nothing throws.

**Permission side effects are invisible**, so check them when a button "disappears":

| Missing code | Effect |
| --- | --- |
| `<entity>_add` | Add-new button hidden (`BaseTable.vue:603`); no Copy row action |
| `<entity>_edit` | Row menu shows "View" instead of "Edit" (`BaseTable.vue:235-258`) |
| `<entity>_delete` | No delete action, no bulk delete |
| none of them | The whole actions column disappears (`BaseTable.vue:370`) |
| `<entity>_list` | `BaseForm` hides the back button (`BaseForm.vue:322`) |

`byPassPermission` short-circuits all of it on both components.

`definePageMeta({ requiresPermission })` is **hand-written** and MUST be kept in sync with
the derived codes. The route guard is ANY-of, not ALL-of (`useRbac.ts:11-25`), and an
empty array means allow (`02.check-permit.global.ts:11-24`). Convention:

```ts
// list page
requiresPermission: ["app_user_list"]
// form page
requiresPermission: ["app_user_view", "app_user_add", "app_user_edit"]
```

Permission codes are backend-owned — verify them against live evidence (devtools /
OpenAPI), never against a `/backend` directory (none exists here). Do not invent them.

---

## X3. `apiEndpoint` means two different things

This is the most common way to get a broken URL:

| Composable | Meaning | Source |
| --- | --- | --- |
| `useCrudList` / `usePagefecth` | the **complete** list URL, used verbatim | `usePagefecth.ts:13,65` |
| `useCrudForm` | a **path prefix**, default `/api`, joined with the camelCased `crudName` | `useCrudForm.ts:46-51` |

So `useCrudList` MUST receive **both** `crudName` and `apiEndpoint`. With `crudName`
alone the request URL literally begins with the string `undefined`. `useCrudForm` needs
only `crudName`.

Note also that `useCrudList`'s delete endpoint hardcodes the `/api` prefix and ignores
`options.apiEndpoint` (`useCrudList.ts:42-48`) — pass `endpointDelete` if your entity
does not live under `/api`.

---

## X4. Walkthrough — add a new CRUD feature

Worked example: entity `Foo`, route `/foo`, endpoint `/api/foo`.

### 1. Confirm the contract from frontend evidence (backend is external)

The backend is `BACKEND_NOT_ACCESSIBLE`. Confirm from THIS repo plus live evidence:
the endpoint path (call sites + `docs/API_CONTRACT.md`), the response envelope
(`ApiResponse<T>` vs a bare array — both are accepted, see X7), and the exact
permission code strings (pages + `useMenu.ts`). For anything new, capture a devtools
response or OpenAPI excerpt in the task file and mark it `NOT_VERIFIED` until then.
MUST NOT invent any of them.

### 2. Add the entity type

`app/types/models.ts`, extending `Id` so `id` is a precision-safe `IdType`
(`models.ts:7-10`):

```ts
export interface Foo extends Id {
  name: string
  active: boolean
}
```

### 3. List page — `app/pages/foo/index.vue`

```ts
definePageMeta({
  pageName: "model.foo.table",
  requiresPermission: ["foo_list"]
});

const { t } = useLang();
const {
  dataList, loading, firstLoaded, pages, sorts,
  onPageChange, onPerPageChange, onSort, onReload, onSearch,
  onItemDelete, onNewForm, onItemClick, onItemCopy, crudName, onKeywordSearch
} = useCrudList<Foo>({
  crudName: "Foo",            // PascalCase — see X2
  apiEndpoint: "/api/foo",    // complete URL — see X3
  headers: [],                // see X7 before choosing []
  itemsPerPage: 10,
  defaultSorts: [{ column: "name", mode: "asc" }]
});
```

Columns are TanStack `TableColumn<Foo>[]`; search metadata rides on `meta.options`
(`ICrudFilterOptions`, `common.ts:335-350`):

```ts
const columns = ref<TableColumn<Foo>[]>([
  {
    accessorKey: "name",
    header: t("model.foo.name"),
    cell: ({ row }) => row.getValue("name"),
    meta: {
      options: {
        sortable: true,
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.TEXT,
        searchOperation: ":",
        searchModel: ""
      } as ICrudFilterOptions
    } as any
  }
]);
```

MUST parameterize with the entity's own type. `ai-document-meta/index.vue:39,51` uses
`useCrudList<AppUser>` / `TableColumn<AppUser>` while rendering `AiDocumentMeta` rows —
typecheck does not catch it. Do not copy that.

Template — this 11-event block is byte-identical across all five features:

```vue
<BaseDashboardPanel id="foo-index" :title="$t('model.foo.table')">
  <BaseTable
    icon="lucide:box" :title="$t('model.foo.table')" :crud-name="crudName"
    :list="dataList" :show-checkbox="true" :loading="loading"
    :first-loaded="firstLoaded" :columns="columns"
    v-model:sorts="sorts" v-model:paging="pages"
    @on-item-delete="onItemDelete" @on-page-no-change="onPageChange"
    @on-items-perpage-change="onPerPageChange" @on-new-form="onNewForm"
    @on-item-click="onItemClick" @on-item-copy="onItemCopy" @on-sort="onSort"
    @on-reload="onReload" @on-keyword-search="onKeywordSearch" @on-search="onSearch" />
</BaseDashboardPanel>
```

Cell components MUST be rendered with `h(resolveComponent('UButton'|'UIcon'|…), …)`
(`app-user/index.vue:13-14,93-108`).

### 4. Form page — `app/pages/foo/[crud]/[id].vue`

```ts
definePageMeta({
  pageName: "model.foo.table",
  requiresPermission: ["foo_view", "foo_add", "foo_edit"]
});

const schema = z.object({
  name: z.string().min(1, t("error.validateRequireField")).describe(uiConfig({
    label: t("model.foo.name"),
    icon: "lucide:tag",
    ui: { type: "text", required: true, clearable: true, maxlength: 125 }
  })),
  active: z.boolean().describe(uiConfig({
    label: t("base.enable"),
    ui: { type: "switch" }
  }))
});
type Schema = z.output<typeof schema>;

const state = ref<Partial<Schema>>({ name: "", active: true });
const { crudAction, loading, crudName, isEditMode, onDelete, onBack, onEnableEditForm, onSubmit }
  = useCrudForm<Foo>({ crudName: "Foo" }, state);
```

`state` is the **second positional argument**. `useCrudForm` writes the fetched entity
into it (`useCrudForm.ts:71-96`) and deletes every key on unmount
(`useCrudForm.ts:108-112,269-271`).

```vue
<BaseDashboardPanel id="foo-form" :title="$t('model.foo.table')">
  <BaseForm
    :zod-schema="schema" v-model="state" :edit-mode="isEditMode"
    :crud-action="crudAction" :loading="loading" :crud-name="crudName"
    icon="lucide:box" :title="$t('model.foo.table')"
    orientation="horizontal" class="max-w-[1020px]"
    @on-back="onBack" @on-edit-enable="onEnableEditForm"
    @on-submit="onSubmit" @on-delete="onDelete" />
</BaseDashboardPanel>
```

`v-model` MUST stay wired: `BaseForm` emits `on-submit` with **no payload**
(`BaseForm.vue:292-294`), so the page reads its own `state`.

### 5. i18n — both locales

Add every key to **both** `i18n/locales/en/model.json` and `i18n/locales/th/model.json`.
Prefer the nested style `model.<entity>.<field>` with `.table` as the entity title — it
is the newer convention used by `app-role`, `api-client` and `ai-document-meta`. The flat
style (`model_user`, `model_permission`) is legacy; do not start new entities on it.
`pageName` MUST be the entity title key and MUST match on the list and form pages.

### 6. Register the menu entry — required, easy to forget

The sidebar is a **hardcoded array**, not backend-driven: `appNavs` in
`app/composables/useMenu.ts:9-195`. `initialAppNav()` filters it through
`isPermitted(item.permissions)` and writes `appNavigations`; it runs from
`app/plugins/00.auth.server.ts`. The feature does not appear in the sidebar until you add:

```ts
{
  label: t("model.foo.table"),
  icon: "lucide:box",
  to: "/foo",
  permissions: ['foo_list']
}
```

The `permissions` key MUST be present and MUST match the page's `requiresPermission`.
Omitting it shows the menu item to everyone and then 403s them on click — the bug
currently live for `ai-document-meta` (`useMenu.ts:48-51`).

### 7. Verify

`pnpm build` and `pnpm typecheck` (see `SKILL.md` F11). Then exercise the screen: list,
search, sort, page, create, edit, delete.

---

## X5. `useCrudList` reference

Options — `CrudListApiOptions` (`common.ts:182-206`), forwarded to `usePagefecth`:

| Option | Default | Effect |
| --- | --- | --- |
| `apiEndpoint` | — | The complete list URL, used verbatim (`usePagefecth.ts:13,65`) |
| `crudName` | — | PascalCase; derives delete endpoint and routes (X2) |
| `endpointDelete` | — | Overrides the derived delete base URL |
| `pathNew` / `pathView` / `pathCopy` | — | Route overrides |
| `additionalUri` | — | Raw query fragment appended last, e.g. `active=true` (`usePagefecth.ts:56-61`) |
| `defaultSorts` | — | `ISort[]`; **URL `?sort=` wins entirely over this** (`useSort.ts:45`) |
| `itemsPerPage` | `10` | `usePagefecth.ts:7` |
| `fetchListOnload` | `true` | Auto-load at setup (`useCrudList.ts:231`) |
| `pageable` | `true` | When false, omits `page`/`size` |
| `pageStartZero` | `true` | Sends `current - 1` |
| `sortable` | `true` | — |
| `concatList` | `false` | Append instead of replace (infinite scroll) |
| `reverseList` / `addUnshift` | `false` | List ordering on set/append |
| `preventResetListReload` | `false` | Keep rows visible while `onReload` refetches |
| `headers` | `[]` | `ICrudListHeader[]`; **required for `_q` URL restore** — see X7 |

Returns: `dataList`, `loading`, `firstLoaded`, `pages`, `sorts`, `isInfiniteDisabled`,
`crudName`, `headers`, `apiEndpoint`, `additionalUri`, `endpointDelete`,
`advanceSearchUri`, `keywordSearchText`, `queryParam`, plus `loadData`, `resetData`,
`onPageChange`, `onPerPageChange`, `onNextPage`, `onReload`, `onSort`, `onSortColumn`,
`onSortMode`, `onSearch`, `onKeywordSearch`, `onNewForm`, `onItemClick`, `onItemCopy`,
`onItemDelete`, `getItemById`, `getItemByIndex`, `removeItemById`, `removeItemByIndex`
(`useCrudList.ts:248-283`).

**Dead options — do not document or use:** `enpointList`, `enpointPost`, `enpointPut`,
`enpointGetOne`, `defaultSort` (singular). `manualActionList` is returned but never read.

---

## X6. `useCrudForm` reference

Signature: `useCrudForm<T>(options, entityRef)` — the state ref is positional, not an option.

Options — `CrudFormApiOptions` (`common.ts:208-227`):

| Option | Default | Effect |
| --- | --- | --- |
| `apiEndpoint` | `'/api'` | Path **prefix** (X3) |
| `crudName` | — | PascalCase; derives every endpoint and the back-link |
| `fetchDataLink` | — | Full GET-one URL override (a ref, mutable at runtime) |
| `backLink` / `backToPreviousPath` / `basePath` | — | Back-navigation overrides (`useCrudForm.ts:113-130`) |
| `actionPost` / `actionPut` / `actionDelete` | — | Endpoint overrides |
| `fectchDataOnLoad` | `true` | Note the typo — reproduce it verbatim |
| `preValidate` | `true` | 400s on a bad `[crud]` action or missing id (`:21-37`) |
| `preventRedirectToList` | `false` | Skip `onBack()` after a successful submit |
| `methodPutIncludeId` | `true` | Append `/{entity.id}` to the PUT URL |
| `methodPut` | `'PUT'` | Allows `PATCH` |

**Dead options:** `actionList`, `autoPageTitle`, `entity`, and effectively
`requestEntityName` (its wrapping logic is commented out at `useCrudForm.ts:166-172`).

The `crudAction` lifecycle — `route.params.crud` MUST be one of `new | copy | edit | view`
(`useCrudForm.ts:18`):

| Action | Fetch | Endpoint | Method | `isEditMode` | Delete allowed |
| --- | --- | --- | --- | --- | --- |
| `new` (id `0`) | none | `POST /api/foo` | POST | true | no |
| `copy` | by id, then clears `id` (`:103-105`) | `POST /api/foo` | POST | true | no |
| `edit` | by id | `PUT /api/foo/{entity.id}` | `methodPut` | true | yes |
| `view` | by id | ⚠ collection URL, no id | PUT | false | yes |

⚠ `view` + submit is a live trap: the URL branch keys on `EDIT` only
(`useCrudForm.ts:44`) while the method branch keys on `VIEW || EDIT` (`:138`), so
submitting straight from a view screen issues `PUT /api/foo` with no id. Always call
`onEnableEditForm()` (which flips `crudAction` to `edit`, `:39-41`) first.

Note the PUT URL uses `entity.value.id` while DELETE uses the route's `crudId`
(`:47` vs `:58`) — if the GET response omits `id`, the PUT URL becomes `/api/foo/undefined`.

---

## X7. Search, paging and sort contract

Wire format built by `usePagefecth.ts:23-66`:

```text
GET {apiEndpoint}?page={0-based}&size={n}&sort=col,asc&sort=col2,desc&_q=<filter>&_keyword=<text>&<additionalUri>
```

`_q` is `SearchParamiter`, `_keyword` is `KeywordParamiter` (`constants.ts:4-5`).

A filter term is `column<op>value`, terms joined by `;` (`BaseTable.vue:452-481`), where
`<op>` is one of `SearchOperation` (`constants.ts:9-17`): `:` `>` `>=` `<` `<=` `=` `!=`.

`;` is the frontend search-term separator (`SearchSeparator = ";"`,
`app/libs/constants.ts:10`) and operators are matched longest-first
(`SearchOperationsByLength`, `constants.ts:9`). The backend side of this contract
(field charset, operator set, split behavior) is `BACKEND_NOT_ACCESSIBLE` — no
`backend/.../ConstantData.java` or `ControllerUtil.java` paths exist in this
workspace, and prior citations to them are withdrawn. Treat `BaseTable`'s build path
as the frontend convention; confirm against live backend behavior before calling it
a verified contract.

`ICrudFilterOptions` on `column.meta.options` (`common.ts:335-350`):

| Field | Effect |
| --- | --- |
| `sortable` | Header becomes a sort button; emits `on-sort` (`BaseTable.vue:316-360`). Only `=== true` counts |
| `searchable` | Includes the column in the advanced-search panel (`BaseTable.vue:494-521`) |
| `searchType` | Widget: `TEXT`/`NUMBER`/`BOOLEAN`/`DATE`/`DATETIME`/`OPTIONS` (`common.ts:26-33`, rendered `BaseTable.vue:677-737`) |
| `searchOperation` | Initial operator; forced to `=` for `BOOLEAN` (`BaseTable.vue:508-512`) |
| `searchOperationReadonly` | Disables the operator select |
| `searchModel` | Initial value. Use `""` — a non-empty default silently pre-activates the filter (X8) |
| `searchColunm` / `sortColunm` | Server-side column name; defaults to `accessorKey` |
| `label` | Filter label; defaults to the string `header` |
| `selectOption` | `{ items, multiple }` for `OPTIONS` search |

**Response shapes.** `loadData` accepts either `ApiResponse<T>` or a bare array
(`usePagefecth.ts:101-149`). `isListResponse` requires **all four** of `dataList`, `last`,
`totalElements`, `totalPages` (`appUtil.ts:30-37`); if the backend omits one, the response
matches neither branch and the list is silently left unchanged with no error.

**`headers` and `_q` restore.** `validateQSearch` rebuilds `_q` from the URL at mount.
Column validation runs against the `headers` option, but is **permissive when `headers`
is empty** (`validateColunmExist`) — which is the case for all five existing pages, since
they declare search metadata on `columns` instead. So `headers: []` is fine and filter
deep links work. Populate `headers` only if you want the restore path to reject unknown
column names.

---

## X8. CRUD footguns

Verified defects. Do not "fix" them as a side effect of a feature task; they are recorded
in `../../docs/FRONTEND_FOOTGUNS.md` and `../../docs/FRONTEND_OPEN_QUESTIONS.md`.

> The separator and operator order live in `SearchSeparator` /
> `SearchOperationsByLength` (`app/libs/constants.ts`); keep them in sync with live
> backend evidence if that contract ever changes. (Older revisions credited a
> `tasks/002-*` file for earlier `_q` fixes — no such file exists in `tasks/`
> as of 2026-09-17, so do not cite it as verification.)

1. **A filter value containing a literal `;` cannot be expressed.** The backend splits
   terms on `;` before parsing, so no frontend encoding fixes it — it needs a backend
   contract change.
2. **`onPageChange` / `onPerPageChange` ignore their arguments**
   (`usePagefecth.ts:183-191`); they work only because `v-model:paging` already mutated
   `pages`. Calling them programmatically changes nothing.
3. **`resetPaging` restores the URL page, not page 1** (`usePaging.ts:12-22`), while
   `resetSort` discards URL sorts (`useSort.ts:49-51`). `onReload` uses both, so its
   behaviour is asymmetric. (This is why search resets the page explicitly rather than
   calling `resetPaging`.)
4. **Any sort click collapses multi-column sort** — `onSort` / `onSortColumn` /
   `onSortMode` replace the whole array (`usePagefecth.ts:192-235`), so a multi-entry
   `defaultSorts` is lost on first interaction.
5. **`onReplaceUrl` is `history.pushState`** (`useBase.ts:49-55`) — `route.query` is not
   updated and every page/sort click adds a history entry.
6. **Unmount clears caller-owned state** — `useCrudList` nulls `dataList`/`apiEndpoint`/
   `crudName` (`:234-247`) and `useCrudForm.resetEntity()` deletes every key of your ref
   (`:108-112`). A request resolving after unmount writes into cleared state.
7. **`headers` is a `shallowRef`** (`useCrudList.ts:39`) — replace the array, do not
    mutate entries.
8. **`:edit-mode` and `@on-edit-enable` are dead wiring.** All five form pages pass them,
    but `BaseForm` declares no `editMode` prop and never emits `on-edit-enable` (declared
    `BaseForm.vue:55`, but the only emits are `on-submit`, `on-delete`, `on-back`).
9. **Typos are the public API** — reproduce verbatim: `usePagefecth`, `fectchDataOnLoad`,
    `apiEnpoint`, `SearchParamiter`, `KeywordParamiter`, `searchColunm`, `sortColunm`,
    `GREATER_THAN_EQUA`, `LESS_THAN_EQUA`, `EQUA`, `NOT_EQUA`.

---

## X9. Component contracts

### `BaseTable` (`app/components/base/BaseTable.vue`)

Props (`:17-61`): `crudName`, `title`, `description`, `icon`, `list`, `columns`,
`viewPermission` / `addPermission` / `editPermission` / `deletePermission`,
`byPassPermission`, `pages`, `firstLoaded`, `loading`, `showPaging` (true),
`showActions` (true), `showCheckbox` (true), `showNewBtn` (true), `showSearchBtn` (true),
`showKewordSearch` (**false**), `showFilter` (true), `sticky`, `tableClass`,
`emptyTitle`, `emptyDescription`.

Models (`:78-86`): `v-model:paging`, `v-model:sorts`, `v-model:sorting-columns`.

Emits (`:63-75`): `on-page-no-change`, `on-items-perpage-change`, `on-sort`,
`on-item-copy`, `on-item-click`, `on-item-delete`, `on-new-form`, `on-reload`,
`on-search`, `on-keyword-search`, `on-col-click` (declared, never emitted).

`on-item-delete` may carry an **array** of row indexes from bulk delete
(`BaseTable.vue:400-407`), and the confirm dialog is already shown before it fires
(`:408-429`).

Slot passthrough (`:833-839`) forwards **every** parent slot into `UTable`, so
`#<accessorKey>-cell`, `#<accessorKey>-header`, `#actions-cell` and `#expanded` all work
from the page (`ai-document-meta/index.vue:225-232` overrides `#actions-cell`). Because
the loop iterates all `$slots`, a page slot named `header` also reaches `UTable`.

MUST rely on `:crud-name` for permissions rather than passing explicit `*-permission`
props — `permission/index.vue:161-173` is the lone outlier and its codes duplicate what
`crud-name` already derives.

### `BaseForm` (`app/components/base/BaseForm.vue`)

Props (`:9-50`): `crudName`, the four `*Permission` props, `byPassPermission`, `title`,
`description`, `icon`, `loading`, `showBack` (true), `showDelete`, `showEdit`,
`crudAction`, `showActionText` (true), `editButton` (true), `deleteButton` (true),
`copyButton` (false), `canSubmit` (true), `crudEntity`, `zodSchema`, `orientation`
(default `horizontal`), `variant`. Model: `defineModel<Partial<Schema>>()` (`:63`).

Emits (`:51-57`): `on-back`, `on-submit`, `on-delete`, `on-edit-enable`, `on-item-click`
— only the first three are ever emitted.

Slots, in render order: `#header`, `#heder-start` (sic, `:319`), `#header-end` (`:350`),
`#prepend-fields` (`:362`), `#auto-fields` (`:364` — overriding it replaces automatic
rendering entirely), `#field-<name>` (`:369`, slot prop `field`), the default slot
(`:689`), and `#crud-action` (`:692`) with inner `#crud-action-start` (`:703`) /
`#crud-action-end` (`:732`).

`uiConfig()` is `JSON.stringify` (`app/utils/appUtil.ts:7`); `BaseForm` parses the
`.describe()` string back out (`:171-187`) and falls back to a plain input if it is not
JSON. Top-level keys consumed (`:273-290`): `label`, `description` (→ `UFormField :help`),
`icon`, `trailingIcon`, `avatar`, `color`, `disable`, `required`, `translateLabel`,
`children` (options for select/checkbox-group/radio-group/input-menu), `onHandle`, and the
nested `ui` object.

`ui.type` values (`:196-229`): `text` `email` `number` `search` `date` `date-range`
`password` `textarea` `select` `checkbox` `switch` `checkbox-group` `radio-group`
`input-menu` `number-step` `input-tags` `input-pin` `slider` `file`. With no `ui.type` the
type is inferred from the zod type (`:230-243`): number → number input, boolean →
checkbox, enum → select.

Other `ui.*` keys read: `required` (drives `UFormField :required`, `:374`), `placeholder`,
`variant`, `size`, `class`, `maxlength` (renders a live counter, `:408-418`), `clearable`
(`:419-430`), `readonly`, `rows`, `multiple`, `min`, `max`, `step`, `orientation`,
`tooltip`, `numberOfMonths`, `separatorLength`, `layout`, `acceptFiles`, `separator`
(renders a `USeparator` after the field, `:686`).
