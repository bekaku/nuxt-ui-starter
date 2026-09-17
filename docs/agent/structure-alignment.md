# Structure Alignment (Reference → Target)

Reference project (READ ONLY): `/Users/bekaku/code/github/nuxt-fullstack`
(Nuxt fullstack + Nitro + PostgreSQL + Drizzle).
Target project (this repo): Nuxt frontend + external Spring Boot backend
(`BACKEND_NOT_ACCESSIBLE`). Alignment date: 2026-09-17.

Conventions follow the reference layout. Target-specific content is preserved;
database/Nitro implementation rules were NOT copied (different architecture).

## Comparison Map

| Reference Path | Target Current Path (Before) | Target Desired Path (After) | Action | Reason |
|---|---|---|---|---|
| `AGENTS.md` (numbered §§1–14) | `AGENTS.md` (custom sections) | `AGENTS.md` | UPDATE | Same required location; adopt reference numbering, keep target rules |
| `SKILLS.md` (canonical pointer list) | `SKILLS.md` (task-area router table) | `SKILLS.md` | UPDATE | Same location; adopt pointer format, keep legacy-dir note |
| `CLAUDE.md` (10-line pointer) | — (absent) | `CLAUDE.md` | CREATE | Reference adapter convention |
| `GEMINI.md` (10-line pointer) | — (absent) | `GEMINI.md` | CREATE | Reference adapter convention |
| `.github/copilot-instructions.md` (pointer) | — (absent) | `.github/copilot-instructions.md` | CREATE | Reference adapter convention; `.github/` already exists |
| `.agents/skills/nuxt-frontend/SKILL.md` | `.agents/skills/nuxt-frontend/SKILL.md` | `.agents/skills/nuxt-frontend/SKILL.md` | KEEP | Name and format already match the reference convention |
| `.agents/skills/<backend skills>` (nitro/drizzle/fullstack) | — (absent) | — | INTENTIONAL_DIFFERENCE | No server DB in target; covered by `api-integration` + template §11 |
| `.agents/skills/task-planning`, `task-execution`, `api-integration` | `.agents/skills/<same>` | `.agents/skills/<same>` | KEEP | No reference equivalent; required by target task system |
| `skills/nuxt-fullstack/*` (legacy pointers) | `skills/frontend/*` (full guides) | `skills/frontend/*` | KEEP | INTENTIONAL_DIFFERENCE: target keeps full domain detail instead of pointers |
| `tasks/TASK_TEMPLATE.md` (14 sections) | `tasks/TASK_TEMPLATE.md` (15 sections) | `tasks/TASK_TEMPLATE.md` | UPDATE | Adopt reference format (table metadata, CP layout); keep target §11 backend deps |
| — (no `tasks/README.md`) | `tasks/README.md` (task index) | `tasks/README.md` | KEEP | INTENTIONAL_DIFFERENCE: index required by `task-planning`; reference has no equivalent |
| Root `TASK_TEMPLATE.md` (absent in reference) | `TASK_TEMPLATE.md` (full duplicate) | `TASK_TEMPLATE.md` | DEPRECATE | Convert to pointer; canonical is `tasks/TASK_TEMPLATE.md` |
| `docs/agent/project-map.md` | `docs/agent/project-map.md` | `docs/agent/project-map.md` | KEEP | Same location and purpose |
| `docs/agent/audit-report.md` | `docs/agent/repository-audit.md` | `docs/agent/audit-report.md` | RENAME | Match reference filename; content rewritten to reference report format |
| `docs/agent/skills-index.md` (table + mapping) | `docs/agent/skills-index.md` (catalogue) | `docs/agent/skills-index.md` | UPDATE | Adopt reference table + task→skill mapping format |
| `docs/agent/compatibility.md` | — (absent) | `docs/agent/compatibility.md` | CREATE | Reference adapter-policy convention, target-verified statuses |
| — (no backend-integration doc) | `docs/agent/backend-integration.md` | `docs/agent/backend-integration.md` | KEEP | INTENTIONAL_DIFFERENCE: external-backend inventory has no reference equivalent |
| `docs/{FOOTGUNS,OPEN_QUESTIONS}.md` | `docs/FRONTEND_{FOOTGUNS,OPEN_QUESTIONS}.md` | unchanged | KEEP | INTENTIONAL_DIFFERENCE: rename would break existing references |
| Nested `AGENTS.md` | — | — | NOT_APPLICABLE | Reference has none; no target module needs one |

## File Migration Table

| Old Path | New Path | Action | Result |
|---|---|---|---|
| `AGENTS.md` | `AGENTS.md` | UPDATE (rewrite to §§1–14) | Done, all target rules preserved |
| `SKILLS.md` | `SKILLS.md` | UPDATE (pointer list) | Done |
| `TASK_TEMPLATE.md` | `TASK_TEMPLATE.md` | DEPRECATE (pointer file) | Done, history preserved |
| `tasks/TASK_TEMPLATE.md` | `tasks/TASK_TEMPLATE.md` | UPDATE (reference layout + §11) | Done, 15 sections |
| `docs/agent/repository-audit.md` | `docs/agent/audit-report.md` | RENAME + rewrite (report format) | Done (`mv`, untracked dir) |
| `docs/agent/skills-index.md` | `docs/agent/skills-index.md` | UPDATE (table + mapping) | Done |
| — | `CLAUDE.md` | CREATE (pointer) | Done |
| — | `GEMINI.md` | CREATE (pointer) | Done |
| — | `.github/copilot-instructions.md` | CREATE (pointer) | Done |
| — | `docs/agent/compatibility.md` | CREATE | Done |
| — | `docs/agent/structure-alignment.md` | CREATE (this file) | Done |

No application source files were moved or modified. The reference repository
was not modified (read-only audit: `ls`/`read` only, no writes, no scripts).
