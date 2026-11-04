# State, forms, and types reference

Use when changing composable state, `UForm` / `BaseForm`, zod schemas, or DTOs. Read the relevant page and `app/types/{common,models,props}.ts` before changing a shared type.

## State

- Shared app state uses namespaced `useState` keys (for example `auth:user` and `auth:navigations` in `useAuth.ts`). Keep local form and loading state in the owning component or composable.
- Use `defineModel` for a component's two-way state. Keep a parent's `v-model` connected to `BaseForm`: it emits `on-submit` without an entity payload, so the parent reads its current model.
- Do not introduce Pinia or a parallel global-state mechanism for routine changes.

## Forms and validation

- Prefer `<BaseForm :zod-schema="schema" v-model="state" @on-submit="onSubmit">` (`app/components/base/BaseForm.vue`) with per-field `.describe(uiConfig(...))` for input forms (both CRUD and non-CRUD screens; pass `:show-back="false"` and `by-pass-permission` when no CRUD route/permission applies). Use `#field-<name>` for a one-off custom control, or add a new `ui.type` to `LabelValue['ui']['type']` (`app/types/common.ts`) and `BaseForm.vue` when a reusable input control is needed. Fall back to raw `<UForm :schema="schema" :state="state">` only when `BaseForm` cannot fit the layout.
- These schemas validate client form state only — they are not backend validation or a shared API contract. Do not infer required backend fields or status codes from them.
- For a field or cross-field rule, follow the nearest production form. Add translated validation messages to both locales. Prefer a specific type or `unknown` over new `z.any()` / TypeScript `any`.

## DTO discipline

- `app/types/common.ts` holds shared frontend API shapes; `app/types/models.ts` holds domain models and `IdType`. `shared/types/` currently has no meaningful shared contract. Preserve wire field names, including existing typos, until the backend contract is verified.
- API dates are represented as strings in current types; parse only where a UI needs a date object. Keep Snowflake IDs as `IdType` or a safe string through routes and requests. Inspect conversions in legacy CRUD code before reusing them; a type annotation does not make a numeric conversion safe.
- Response types are hand-maintained frontend expectations. Confirm a changed DTO from devtools/OpenAPI before editing it, as required by `AGENTS.md`; otherwise leave the implemented type unchanged and record the proposed shape as unverified.
