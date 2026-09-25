# Skill Structure

Overview of the Agent Skills system in this repository
(`nuxt-ui-starter`, Nuxt 4 admin console).

Canonical source of truth: `AGENTS.md`.
Skill router: `SKILLS.md`.
Skill catalogue: `docs/agent/skills-index.md`.

```text
.
├── AGENTS.md                        # Global agent instructions (§§1–14)
├── SKILLS.md                        # Canonical skill pointer list
├── CLAUDE.md                        # Claude adapter (pointer, not source of truth)
├── GEMINI.md                        # Gemini adapter (pointer, not source of truth)
├── .github/
│   └── copilot-instructions.md      # GitHub Copilot adapter (pointer)
├── .agents/
│   └── skills/                      # CANONICAL skills (Agent Skills spec)
│       ├── task-planning/
│       │   └── SKILL.md             # Create task files from tasks/TASK_TEMPLATE.md
│       ├── task-execution/
│       │   └── SKILL.md             # Execute/resume tasks per CP0–CP4
│       ├── crud-module/
│       │   └── SKILL.md             # Entity list + [crud]/[id] form screens
│       ├── nuxt-frontend/
│       │   └── SKILL.md             # Other app/ work: pages, components, SSR, UI, i18n
│       └── api-integration/
│           └── SKILL.md             # External Spring Boot API via useApi()
├── skills/
│   └── frontend/                    # DETAILED domain references (preserved)
│       ├── SKILL.md                 # Router to the reference files below
│       ├── CRUD.md                  # Entity admin screens, search/paging
│       ├── API.md                   # useApi() rules, upload/download, SSE
│       ├── AUTH.md                  # Login, session, guards, RBAC
│       ├── UI.md                    # Components, pages, styling, i18n
│       └── TYPES_VALIDATION.md      # useState, forms, zod, DTOs, TypeScript
├── tasks/
│   ├── TASK_TEMPLATE.md             # Canonical task template (15 sections)
│   └── README.md                    # Task index + creation/execution workflows
└── docs/
    └── agent/
        ├── project-map.md           # Verified architecture map
        ├── audit-report.md          # Repository audit findings
        ├── backend-integration.md   # Frontend-observed API contract
        ├── skills-index.md          # Task-to-skill mapping + examples
        ├── compatibility.md         # Cross-agent adapter policy
        └── structure-alignment.md   # Reference-project alignment record
```

## Skill Layers

| Layer | Location | Format | Role |
|---|---|---|---|
| Router | `SKILLS.md` | Pointer list | Maps task areas to canonical skills |
| Canonical | `.agents/skills/*/SKILL.md` | YAML frontmatter (`name` = directory) + fixed sections (below) | Task workflows (`task-planning`, `task-execution`) and technical domains (`crud-module`, `nuxt-frontend`, `api-integration`) |
| Domain detail | `skills/frontend/*.md` | Plain Markdown (no frontmatter) | In-depth references loaded on demand by the canonical skills |
| Adapters | `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` | 10-line pointers | Point vendor agents to `AGENTS.md` + `.agents/skills/`; duplicate no rules |

## Canonical Skill Format

Every `.agents/skills/*/SKILL.md` follows the same order so an agent can scan it quickly:

1. Frontmatter `description` — what the skill covers, when to use it, and when not to.
2. One-paragraph purpose.
3. `When to use` (including when to pick another skill).
4. `Read first` — the minimum files, in order.
5. A decision table (`Where does the change go?`, `Choose the call style`, name-derivation table) and/or step-by-step `Recipe`.
6. `Rules` — MUST / MUST NOT bullets.
7. `Common mistakes` — symptom → cause → fix table (skipped for task workflow skills).
8. `Done checklist` — checkboxes that double as the Verification / Completion criteria.

Use real repository paths and symbol names; avoid line numbers in canonical skills (they drift).

## Loading Order

1. `AGENTS.md` (always first)
2. `SKILLS.md` or `docs/agent/skills-index.md` (select skills)
3. Relevant `.agents/skills/*/SKILL.md` (only what the task needs)
4. `skills/frontend/*.md` domain files (only when the canonical skill points to them)
5. `tasks/<id>-<short-name>.md` (when working a numbered task)

## Deliberately Absent

- `nitro-backend` / `drizzle-database` / `fullstack-feature` — the Spring Boot
  backend lives in a separate repository (`BACKEND_NOT_ACCESSIBLE`); cross-repo
  work uses section 11 of `tasks/TASK_TEMPLATE.md` instead.
- Standalone `nuxt-ssr`, `frontend-authentication`, `testing-debugging` — covered
  by `nuxt-frontend`, `skills/frontend/AUTH.md`, and each skill's Done checklist
  (no test runner exists in this repo).
- Skill copies under vendor directories — adapters reference the canonical
  `.agents/skills/` by path (no symlinks, nothing to drift).
