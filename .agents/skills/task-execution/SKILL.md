---
name: task-execution
description: Implement, resume, or verify work described in an existing numbered task file tasks/<id>-*.md, keeping its status, checkpoints (CP0–CP4), progress log, and handoff up to date as you go. Use only when that task file already exists; load the domain skills the task lists alongside this one.
---

# Task execution

The task file is the shared memory between agents. Update it **while** working, not at the end,
so another agent can resume from the file alone.

## When to use

- "Implement / continue / resume / verify task 00X".
- Any code change that a numbered task file describes.

Not for creating a task (use `task-planning`) or for ad-hoc requests without a task file.

## Read first

1. `AGENTS.md`.
2. The whole task file — especially §1 Status, §8 Checkpoints, §13 Progress Log, §14 Handoff.
3. Every skill listed in the task's §3 Required Skills (e.g. `crud-module`, `nuxt-frontend`, `api-integration`).
4. `tasks/README.md` only for status/checkpoint meanings.

## Step 1 — Reconcile before touching code

Run `git status` and `git diff --stat`, then compare with §7 checkboxes and §14 Files Changed.
A ticked box or a "done" log entry is a claim, not proof — confirm the code is actually there.
Paths or contracts in an old task may be stale; recheck them against current source.

## Step 2 — Start (edit the task file first)

- §1: `Status: IN_PROGRESS`, `Updated: <today>`.
- §8: set the current checkpoint (usually CP1 or CP2) to `IN_PROGRESS`.
- §13: append an entry:
  ```md
  ### 2026-09-25 14:00 — Implementation started
  Status: IN_PROGRESS
  Completed:
  - Reconciled task with git status (no prior code changes).
  Next:
  - Step 1: add Foo type to app/types/models.ts
  Blockers:
  - None.
  ```
- §14 `Next Action`: the first edit you are about to make.

## Step 3 — Implement one plan step at a time

After each §6 step or each changed file:
- tick its box in §6/§7;
- add the path to §14 `Files Changed` (with a few words on why);
- update §14 `Completed Work`, `Remaining Work`, `Next Action`;
- if something blocks you: `Status: BLOCKED`, add a row in §12, log it in §13, stop and report.

Stay inside the task's scope. Record unrelated problems in §14 `Known Issues` (or
`docs/FRONTEND_FOOTGUNS.md`) instead of fixing them.

## Step 4 — Verify

Run the gates and write real results in §10 (never `PASSED` for something you did not run):

| Check | Command | When |
|---|---|---|
| Typecheck | `pnpm typecheck` | always |
| Build | `pnpm build` | any runtime change (pages, components, composables, config) |
| Manual | exercise the route in a running app | when an app/backend is available; otherwise `NOT_RUN` + reason |

Unit tests: `NOT_APPLICABLE` (no test framework exists). Never run `pnpm lint` / `eslint` (project-wide rule, AGENTS.md §10); record lint as `NOT_RUN`.
Also tick the Done checklist of each domain skill you used.

## Step 5 — Finish

- §9: tick only acceptance criteria you observed or verified.
- §8: CP3 (verification) and CP4 (completion) → `PASSED` with evidence, or `FAILED` / `BLOCKED` with reason.
- §1 final status:
  - `DONE` — all acceptance criteria met, gates passed, no open backend dependency in §11.
  - `REVIEW` — frontend work complete but needs review, manual checks, or backend confirmation.
  - `BLOCKED` — cannot proceed; §12 says what is needed.
- §14 and §15: final state, files, verification, backend items still `NOT_VERIFIED`, next action.
- Update the status column in `tasks/README.md`.
- Compare `git diff --stat` with §14 `Files Changed`; nothing out of scope.

## Rules

- Never delete task history, reset checkpoints, or renumber tasks.
- Never mark a checkpoint `PASSED` or a gate passing without evidence recorded in the file.
- Never claim backend behavior as verified from frontend code; use §11 for proposals.
- A typecheck error is real — fix it; do not add `@ts-ignore`.

## Done checklist

- [ ] Task file updated at start, after each step, and at the end (not only at the end).
- [ ] §10 shows the commands actually run and their real results.
- [ ] Final status is consistent with §9, §11, §12.
- [ ] §14 lets a new agent continue without this conversation.
- [ ] `tasks/README.md` status matches §1.
