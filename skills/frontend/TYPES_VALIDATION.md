# Frontend State, Forms, Validation & TypeScript Skill

Read this file when the task involves shared state, composables, forms, zod validation, DTOs/interfaces, or TypeScript typing.

### F6. State management

- `useState` with namespaced keys ONLY: `'auth:user'`, `'auth:navigations'` (`useAuth.ts`), `'theme:layout'` (`useTheme.ts:7`), `'chat:history'` etc. (`useAppChat.ts:8-15`), `'ai:recent'` (`useAiChat.ts:17-19`). MUST NOT invent un-namespaced keys.

- `useCookie` ONLY for `locale` (+ `cookie-consent` in `layouts/default.vue:37`) and `_sid` via `useAppCookie.ts`. NEVER for tokens.

- The ONLY `useStorage` usage is `useCache.ts:3` (`useStorage('latestSyncActive', 0)`). No other persistence.

- NEVER `provide`/`inject` (zero usage). NEVER Pinia.

- Per-request vs cached: lists via `usePagefecth`/`useCrudList` refetch on page/sort change; `useAsyncData('permission-all'|'app-role-all')` caches reference lists; auth `useState` persists across routes and is re-bootstrapped on SSR only.


### F7. Validation (zod) — client `UForm` only

- zod schemas are PER-PAGE UI validation for `<UForm :schema>` / `<BaseForm :zod-schema>`. There is NO shared contract source, NO server validation, NO `safeParse` on responses (`useCrudForm.ts:200-238` posts `entity.value` directly). MUST NOT assume backend reuses these schemas.

```ts

// CORRECT — canonical page schema + submit

const schema = z.object({ email: z.email(t('error.emailFormat')), password: z.string(t('error.passwordRequired')).min(4, ...) })

type *Schema* = *z*.*output*<typeof schema>

<*UForm* :*schema*="schema" :*state*="state" @*submit*="onSubmit"> // onSubmit(event: FormSubmitEvent<Schema>)

// app/pages/auth/login.vue:18-24,143-148

```

- `BaseForm` auto-render pattern: schema fields carry UI config via `.describe(uiConfig({ label, icon, ui: { type, required, ... } }))` (`app/pages/app-user/[crud]/[id].vue:15-104`, `example/form.vue:10-316`), state via `defineModel<Partial<Schema>>()` (`BaseForm.vue:62`), submit via `<UForm :schema="zodSchema" :state="state" @submit="onSubmit">` (`BaseForm.vue:355-359`). NOTE footgun: `BaseForm:291-293` emits `on-submit` WITHOUT payload — parents re-read mutable `state`, so MUST keep `v-model="state"` wired.

- Cross-field rules that don't fit zod go in `:validate` returning `FormError[]` (only site: `settings/security.vue:73-78` password-confirm). Edit-mode optional-password pattern: `schemaBase.extend({ password: z.string().min(8,...).or(z.literal('')).optional() })` (`app-user/[crud]/[id].vue`).

- NEVER use `z.any()` in new schemas. Existing `z.any()` (`permission/[crud]/[id].vue:31`, `form.vue:32`, `app-user:17` `avatarFile: z.array(z.any()).optional()`) defeats validation — migrate to `z.unknown()`/typed file schema. `ZodType<any,any,any>` in `BaseForm.vue:46` is grandfathered, do not propagate.

- NEVER `toTypedSchema` / vee-validate `useForm` (zero usage).


### F9. TypeScript discipline

- `strict: true` + `noUncheckedIndexedAccess: true` are ON (`.nuxt/tsconfig.app.json`), but `154 × ': any'` + `35 × 'as any'` exist and `@typescript-eslint/no-explicit-any` is OFF (`eslint.config.mjs:12`). Typecheck therefore passes vacuously. MUST NOT add new `any` — use `unknown`, explicit interfaces, or existing `IdType = bigint|string|null|undefined` (`models.ts:7`).

- Hotspots to NOT copy: `common.ts` `entity?: any; searchModel?: any; [key:string]: any`, `utils/appUtil.ts` + `fileUtil.ts` untyped helpers, `useApi.ts:94-142` `response: any / opts: any / as any`.

- API response types live in `app/types/common.ts` (`ApiResponse`, `AppException`, `ResponseMessage`, `LoginRequest`, `RefreshTokenResponse`) + `app/types/models.ts` (domain: `AppUser { email, username, permissions?: string[], favoriteMenus?... }` etc.). Types are MANUAL (no codegen) — MUST update them by hand when the contract changes and MUST copy backend field names EXACTLY, including known typos (`ipAddredd`, `lastestActive`, `fourceLogout`, `enpointList`, `fectchDataOnLoad`, `SearchParamiter`/`PageIdParamiter`). NEVER "fix" the typo in one place only.

- Dates are ALWAYS `string` (even `type Date = string`, `common.ts:35`). NEVER type API dates as `Date`.

- `ResponseEntity<T>` (`common.ts:622-628`) is DEFINED but NEVER used — MUST NOT use it. `ServerException` is dead for toast purposes — see contract section.

- Duplicate Snowflake (`app/libs/Snowflake.ts` class vs `app/utils/snowflake.ts` `generateSnowFlakeId()`): MUST use `app/utils/snowflake.ts` for new code; the `libs/` class is legacy.
