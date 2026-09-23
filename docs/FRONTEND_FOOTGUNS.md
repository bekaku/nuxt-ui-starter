# Frontend Known Footguns

Read this document when implementing or debugging behavior related to these known traps.

## Known footguns (frontend-side, all observed)

- Auto-toast + manual toast = double toast for wrapper-recognized `AppException` / `ResponseMessage` responses. A caller still needs an appropriate error state, fallback, or propagation when the request fails.

- `BaseForm` discards validated `event.data` (`BaseForm.vue:291-293` emits bare `on-submit`); parents MUST read the `v-model` state, not the event.

- `z.any()` / `ZodType<any,any,any>` holes silently pass validation — audit schemas on touch.

- List callers using `usePagefecth` must keep the `isListResponse` / `isArray` dual branch. Verify each endpoint's real response shape; frontend types alone do not prove it.

- `01.auth` guard reads `useState` only — after hard refresh without SSR bootstrap (`00.auth.server` skipped, e.g. client-only nav), it redirects to login even with valid cookies; `fetchMe` must run first.

- `nuxtApp._refreshPromise` is untyped (no `env.d.ts` declaration) — do not rename; concurrent 401s rely on the exact key.

- `v-rbac` uses `el.remove()` on mount — hidden-behind-permission elements are GONE from DOM, not `v-show`; don't query them later.

- `UTable` empty state requires `#empty` slot (`BaseTable.vue:790`); dynamic columns need `#[slotName]` passthrough (`BaseTable.vue:836-842`) or cells won't render.

- `UForm` needs BOTH `:schema` and `:state`; omitting `:state` breaks validation silently.

- `crudName` MUST be PascalCase or permission keys mismatch (`app-user/index.vue:34`).

- `useCrudForm` currently reads route IDs through `getParam<number>`; inspect precision before using Snowflake IDs from route parameters. Do not copy numeric coercion into new code.

- `uploadChunkApi`/`mergeChunkApi` paths lack a leading slash — adding one changes resolution against `baseURL`; copy verbatim.

- `locale` cookie drives `Accept-Language`; changing language without reloading pending `api` calls sends the old header.

- `Temp.vue`, `pages/test/*`, `pages/example/*` are playground/demo — NEVER import from them into production paths.
