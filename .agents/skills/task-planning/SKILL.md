---
name: task-planning
description: Create a numbered task specification from tasks/TASK_TEMPLATE.md when the user asks for a task or implementation plan. Do not invoke for an ordinary implementation request without a task file.
---

# Task planning

Create a resumable specification, not application code. Read `AGENTS.md`, `tasks/TASK_TEMPLATE.md`, and `tasks/README.md`; inspect the affected source before writing the plan.

1. Find the next unused number from the files currently in `tasks/`; do not rely on an old count or renumber history.
2. Select only relevant canonical skills via `docs/agent/skills-index.md`. List existing `.agents/skills/<name>/SKILL.md` paths in the template's Required Skills table; list `skills/frontend/*.md` as supporting references where useful.
3. Fill all 15 template sections with a specific objective, affected files, implementation steps, acceptance criteria, and verification method. Keep nonapplicable sections and mark them with a reason if the template needs them for handoff.
4. Distinguish `VERIFIED` frontend evidence from `UNKNOWN` and `BACKEND_NOT_ACCESSIBLE` backend behavior. For a contract change, describe a proposed contract and the evidence needed to confirm it in `External Backend Dependencies`.
5. Create `tasks/<id>-<short-name>.md`, start at `TODO` unless work begins immediately, and add it to `tasks/README.md`.

Verify the file against the template, check every skill path exists, and inspect the diff. Planning alone does not authorize unrelated `app/`, `server/`, `shared/`, or `i18n/` edits.
