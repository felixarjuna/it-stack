---
name: merge-it
description: Use when the owner says "merge" (one PR, several, or "them"). Confirms every check is green, merges with the project's method, deletes the branch, updates the local default branch and reports anything that still has to happen after the merge.
---

# merge-it

Merge only on the owner's word, and only green PRs.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## 1. Which PRs

"Merge" means the PRs under discussion: the one just shipped, or every PR the owner was shown. If that's ambiguous, list the candidates in one line and ask.

## 2. Check each

`gh pr checks <n>`.

- **Still running:** wait for them (`gh pr checks <n> --watch`), then go on.
- **Failed:** don't merge. Say which check failed and why in one line. Fix it (in a control room, through the PR's session: run-it's `fixing` path), then report the fix in one line and wait for the owner to say "merge" again: they approved the diff they saw, not your fix.
- **Conflicts with the base:** rebase onto the default branch, re-run `check`, push, wait for green. A rebase that only regenerates a migration or resolves an import clash can merge on the same "merge"; anything that changes behaviour waits for the owner again, as above.

## 3. Merge

Merge PRs one at a time, oldest first, each with the `merge` fact's method and branch deletion (default `gh pr merge <n> --merge --delete-branch`). A later PR that conflicts after an earlier merge goes back to step 2.

Then `git switch <default branch> && git pull`, and delete local branches whose PRs merged (a branch still checked out in a session's worktree stays until that worktree is removed).

## 4. Report

One line per PR: merged, plus anything the `merge` fact says still happens after merge (a migration deploy, a release). Don't repeat what the PR already says.

## In a run-it control room

When this thread is a run-it control room (`.it-stack/run.md` names this thread's id, from `t3_thread_list` → `currentThreadId`), continue with run-it's **On wake-up** steps after merging: free the slots and start the next issues.
