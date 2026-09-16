# Frontend Task Template

Use this template for **frontend-only** tasks in the admin console.

If the task adds or changes a backend contract, it is cross-stack — use the root
`/TASK_TEMPLATE.md` instead. Remember that a separate external client outside this
repository also consumes the backend API, so a contract change is never frontend-only.

Before writing the task, confirm it belongs here at all: this app is the internal
administration console for administrators and authorized staff. End-user-facing RAG
features belong to the external client, not to this repository.

Save frontend tasks under:

```text
frontend/tasks/<number>-<short-name>.md
```

List `frontend/tasks/` before assigning a number and take the next free one. Do not
reuse a number.

---

# Task: <name>

## Objective

Describe one concrete UI outcome — the implementation, refactor or fix required.

```text
...
```

Keep the objective bounded. Do not include unrelated cleanup, toolchain repairs, or
future roadmap work.

---

## Required Reading

Always read:

```text
/AGENTS.md
/frontend/AGENTS.md
/frontend/skills/frontend/SKILL.md
<this-task>
```

Then only the skills this task actually needs, via `/frontend/SKILLS.md`:

```text
skills/frontend/CRUD.md                entity admin screens: list + form, search/paging
skills/frontend/API.md                 backend calls, upload/download, SSE
skills/frontend/AUTH.md                login, session, guards, RBAC
skills/frontend/UI.md                  components, pages, styling, i18n
skills/frontend/TYPES_VALIDATION.md    state, forms, zod, types
docs/API_CONTRACT.md                   endpoint/response/SSE contract detail
```

Do not load unrelated skill/reference files by default.

---

## Existing Implementation to Inspect

Inspect before editing. Delete blocks this task does not touch.

```text
Pages/routes:
- ...

Components:
- ...

Composables / app/api clients:
- ...

Types (app/types/*):
- ...

i18n keys (en + th):
- ...

State (useState keys):
- ...
```

Prefer modifying the existing path over creating a parallel implementation.
CRUD screens must reuse `useCrudList` / `useCrudForm` / `usePagefecth`.

---

## Scope

Mark only what applies:

- [ ] Page / route
- [ ] Component
- [ ] Composable
- [ ] API client (`app/api/`)
- [ ] Types / DTOs
- [ ] Form / zod validation
- [ ] RAG chat test harness (`app/pages/ai-chats/*` — verification surface, not product UI)
- [ ] SSE / streaming
- [ ] Ingestion monitoring
- [ ] Prediction UI
- [ ] Auth / RBAC gating
- [ ] i18n
- [ ] Styling / theme
- [ ] SSR behavior

### Out of Scope

```text
- ...
```

Do not modify unrelated areas unless required for a narrowly justified fix.
End-user-facing features are out of scope by definition — they belong to the external
client, not this console.

---

## Backend Contract

The backend is authoritative and lives at `/backend` in this repository. Do not invent
fields, status codes, permissions or error shapes.

### Endpoint

```http
<METHOD> /api/...
```

### Request

```json
{}
```

### Success Response

```json
{}
```

### Error Response

Record the `AppException` / `ResponseMessage` shape actually returned.

```json
{}
```

### Streaming / SSE

Include only when applicable — event `type` values and payload per event.

```text
...
```

### Envelope

State which shape this endpoint returns and how you verified it:

```text
ApiResponse<T> envelope | bare T[] | single object
Verified by: <backend source path | devtools capture>
```

### Permissions

```text
requiresPermission: [...]
v-rbac gated controls: ...
```

Verified against the backend's permission constants, not assumed.

---

## Snowflake IDs

IDs must remain precision-safe.

- [ ] No `Number(id)` / `parseInt(id)` on a backend ID
- [ ] `IdType` (`bigint | string | null | undefined`) used for ID fields
- [ ] Route/query construction keeps the ID as a string

---

## UI States

Mark the states this task must handle, and implement each:

- [ ] idle
- [ ] loading
- [ ] empty
- [ ] submitting
- [ ] queued
- [ ] processing
- [ ] streaming
- [ ] completed
- [ ] unchanged
- [ ] failed
- [ ] permission denied (403)
- [ ] session expired (401 — handled by `useApi`, do not re-handle per page)

---

## i18n

Every user-visible string goes through `t()` / `$t()`.

- [ ] Keys added to `i18n/locales/en/<ns>.json`
- [ ] Keys added to `i18n/locales/th/<ns>.json`
- [ ] Namespace is one of `app | base | helper | model | error`

---

## Progress Checklist

This is the **single source of truth** for task completion.

### Inspection

- [ ] Inspect the existing frontend implementation.
- [ ] Confirm the backend contract against `/backend` source.
- [ ] Confirm which response envelope the endpoint returns.
- [ ] Confirm required permissions.

### Implementation

- [ ] Types / DTO changes complete.
- [ ] API client / composable changes complete.
- [ ] Page / component changes complete.
- [ ] Form / zod validation complete.
- [ ] Loading / empty / error / permission states complete.
- [ ] i18n keys added to both locales.

### Verification

- [ ] Request shape matches the backend contract.
- [ ] Success and error responses handled (no duplicate manual toasts).
- [ ] Snowflake IDs precision-safe.
- [ ] SSR-safe (no unguarded browser globals).
- [ ] `pnpm build` run and passing.
- [ ] `pnpm typecheck` run and passing (0 errors).
- [ ] Review `git status`, `git diff`, `git diff --stat`.
- [ ] Confirm no unrelated modifications remain.
- [ ] Update Resume State.

Mark `[x]` only after implementation and repository evidence verify the item.

---

## Verification

```bash
pnpm build       # MUST pass
pnpm typecheck   # MUST pass — 0 errors
```

Both are the project's gates (`frontend/AGENTS.md` § Verification). `pnpm lint` is not a
gate — do not run it repo-wide for this task and do not report its exit code here. There
is no test runner and no CI workflow, so style and convention adherence is on you:
review the diff against `skills/frontend/` before marking the task done.

```text
pnpm build:      <executed / passed / failed>
pnpm typecheck:  <executed / passed / failed>
```

Do not claim success for a command that was not executed, and do not change the
TypeScript pin or tooling config as a side effect of this task.

### Manual verification

Record what was exercised in the running app.

```text
Route(s):
Steps:
Observed:
```

---

## Resume State

**Overall Status:** `NOT_STARTED | IN_PROGRESS | IMPLEMENTATION_COMPLETE | COMPLETED | BLOCKED`

**Current Step:**

```text
...
```

**Last Successful Verification:**

```text
None
```

**Completed Work:**

```text
- None
```

**Partially Completed Work:**

```text
- None
```

**Files Currently Being Modified:**

```text
- None
```

**Known Issues / Blockers:**

```text
- None
```

**Next Recommended Steps:**

```text
1. ...
```

Do not mark the task `BLOCKED` only because of a pre-existing repository issue
unrelated to this task.

---

## Safe Stop / Resume

Before stopping incomplete work:

1. finish the current safe atomic change where practical;
2. update Progress Checklist;
3. update Resume State;
4. inspect `git status`, `git diff`, `git diff --stat`;
5. record the exact next action.

When resuming:

1. read `/AGENTS.md`;
2. read `/frontend/AGENTS.md`;
3. read this task;
4. load only relevant skills via `/frontend/SKILLS.md`;
5. inspect Progress Checklist and Resume State;
6. inspect repository state/diff;
7. continue from Next Recommended Steps.

---

## Completion Report

Report only applicable categories:

```text
Implemented / reused:
Pages / components changed:
Composables / API client changes:
Type / contract changes:
i18n keys added:
Permissions / RBAC changes:
Verification executed:
Verification blocked:
Remaining risks:
Final status:
```

Do not stop at conceptual recommendations. Make the repository changes the task requires.
