# SKILLS.md

Canonical skills: `.agents/skills/` (Agent Skills spec). Load only what the task needs.

## Skills

- Task creation (new task files from the canonical template):
  - `.agents/skills/task-planning/SKILL.md`

- Task execution, resume, and status/evidence updates:
  - `.agents/skills/task-execution/SKILL.md`

- Nuxt pages, components, composables, state, UI, types, i18n:
  - `.agents/skills/nuxt-frontend/SKILL.md`

- External Spring Boot API via `useApi()` (auth, cookies, refresh, SSR, SSE):
  - `.agents/skills/api-integration/SKILL.md`

## References

- `AGENTS.md` (canonical rules)
- `docs/agent/skills-index.md` (task-to-skill mapping)
- `docs/agent/project-map.md` (architecture)
- `docs/agent/backend-integration.md` (frontend-observed API contract)
- `docs/FRONTEND_OPEN_QUESTIONS.md`
- `docs/FRONTEND_FOOTGUNS.md`

Read only what the current task needs. Legacy `skills/frontend/` files are
detailed domain references preserved for the canonical skills above.
