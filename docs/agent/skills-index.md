# Skills Index

Canonical skills live in `.agents/skills/` (Agent Skills spec: each skill is a
directory with `SKILL.md` containing `name` + `description` frontmatter).
Skill `name` always matches its directory. Load only the skills a task needs.

| Skill | Purpose | Activation |
|---|---|---|
| `task-planning` | New task files from `tasks/TASK_TEMPLATE.md` | Creating a task |
| `task-execution` | Task execution, resume, status/evidence updates | Working a `tasks/<id>-*.md` file |
| `nuxt-frontend` | Nuxt 4 pages, components, composables, state, UI, types, i18n | Task touches `app/` or `i18n/` |
| `api-integration` | External Spring Boot API via `useApi()` (auth, cookies, refresh, SSR, SSE) | Task touches the network contract |

Related skills: `task-planning` feeds `task-execution`; `nuxt-frontend` pairs
with `api-integration` when a screen changes its endpoint; both pair with the
detailed references under `skills/frontend/` (CRUD, API, AUTH, UI,
TYPES_VALIDATION), which are preserved — not canonical skills, but required
reading selected per task.

## Example Task → Skill Mapping

- "Fix user list sorting" → `nuxt-frontend` (+ `api-integration` if the endpoint changes).
- "Add avatar to profile page" → `nuxt-frontend` (+ `api-integration` if the endpoint changes).
- "New `project` CRUD module" → `task-planning`, then `nuxt-frontend` + `api-integration`.
- "Login fails after expiry" → `api-integration` (+ `nuxt-frontend` if the login page changes).
- "Add `deadline` column to a list" → `nuxt-frontend` (type + columns + i18n).
- "Typecheck fails in BaseTable usage" → `nuxt-frontend`.
- "Slow user search" → `api-integration` + `nuxt-frontend`.

## Loading Rules

1. Always read `/AGENTS.md` first, then skim this index.
2. Load additional domain files (`skills/frontend/*`) **only** for the task at hand.
3. Never load backend skills — none exist in this repo, and Spring Boot/JPA/Hibernate skills must not be created here.
4. Frontmatter: the legacy `skills/frontend/` files have no frontmatter (plain Markdown) — treat as `NOT_APPLICABLE`, not an error.

## Deliberately Not Created

- Standalone `nuxt-ssr` → covered by `nuxt-frontend` + SSR guards.
- Standalone `frontend-authentication` → covered by `skills/frontend/AUTH.md` + `api-integration`.
- `testing-debugging` → no test runner; verification lives in each skill plus `docs/FRONTEND_FOOTGUNS.md`.
- `fullstack-feature` / `nitro-backend` / `drizzle-database` → backend is `BACKEND_NOT_ACCESSIBLE`; cross-repo work uses template section 11 instead.
