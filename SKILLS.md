# Project skills

Read `AGENTS.md` first, then load only the skill(s) the work needs. Details and example requests:
[the skills index](docs/agent/skills-index.md).

| Canonical skill | File | Use when |
|---|---|---|
| `crud-module` | `.agents/skills/crud-module/SKILL.md` | Adding or changing an entity list + `[crud]/[id]` form screen |
| `nuxt-frontend` | `.agents/skills/nuxt-frontend/SKILL.md` | Any other Nuxt UI work: pages, components, composables, state, styling, i18n, menu |
| `api-integration` | `.agents/skills/api-integration/SKILL.md` | Adding or changing a backend call, DTO, upload/download, or SSE |
| `task-planning` | `.agents/skills/task-planning/SKILL.md` | Writing a new numbered `tasks/<id>-*.md` specification |
| `task-execution` | `.agents/skills/task-execution/SKILL.md` | Implementing or resuming an existing numbered task |

`skills/frontend/*.md` are detailed references (CRUD, API, AUTH, UI, TYPES_VALIDATION) that the
skills above point to; open one only when a skill says so. Current source code always wins over docs.
