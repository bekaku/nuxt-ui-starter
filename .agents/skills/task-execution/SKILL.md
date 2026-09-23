---
name: task-execution
description: Implement, resume, or verify an existing numbered tasks/<id>-*.md specification while maintaining its checkpoints, evidence, and handoff. Use only when a task file already exists.
---

# Task execution

Read `AGENTS.md`, the full task file, and its selected canonical skills. Use `tasks/TASK_TEMPLATE.md` for status and checkpoint meanings. Supporting `skills/frontend/*.md` references are read only for the affected domain.

## Resume from evidence

1. Compare the task's Status, CP0–CP4, Progress Log, and Handoff with `git status`, the diff, and current source. A checked box or prior claim is not proof that code is present.
2. Before editing code, mark the task `IN_PROGRESS`, update its date, active checkpoint, progress log, and next action as directed by `AGENTS.md` §13.
3. Implement within scope. After each plan step or changed file, update its checklist, checkpoint evidence, Files Changed, Remaining Work, and Next Action. Record blockers as they arise.
4. Run `pnpm typecheck` and, for runtime changes, `pnpm build`. Fill Verification Results with commands and real outcomes. Record manual or backend checks as unverified when unavailable.
5. Reconcile acceptance criteria and CP3–CP4, set the final status, and leave a handoff a new agent can act on without chat history. `DONE` requires no outstanding blocker; `REVIEW` or `BLOCKED` must name the remaining work.

The task may predate current code or skill files. Recheck paths and contracts instead of copying stale assumptions. Do not invent backend evidence or mark a gate passed unless it ran. End by reviewing the changed-file list against scope.
