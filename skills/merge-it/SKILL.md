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
- **Failed:** don't merge. Say which check failed and why in one line. Fix it (for an inline PR, in its recorded workspace; for an external worker, through its session: run-it's `fixing` path), then report the fix in one line and wait for the owner to say "merge" again: they approved the diff they saw, not your fix.
- **Conflicts with the base:** rebase onto the default branch, re-run `check`, push, wait for green. A rebase that only regenerates a migration or resolves an import clash can merge on the same "merge"; anything that changes behaviour waits for the owner again, as above.

## 3. Merge

Merge PRs one at a time, oldest first, using the `merge` fact's method. Supply explicit `--repo <owner/repo>` so the merge and remote branch deletion do not trigger local checkout/worktree cleanup (default `gh pr merge <n> --repo <owner/repo> --merge --delete-branch`). Keep local synchronization and cleanup in the guarded steps below. A later PR that conflicts after an earlier merge goes back to step 2.

Then update the default branch in a clean checkout using a fast-forward-only pull. Preserve any dirty checkout and local-only commits; do not switch, reset or pull across them. If no safe checkout is available, leave local synchronization pending and report it. Delete merged local branches only after their worktrees are safely released.

**Worktrees:** find the merged PR's recorded workspace by branch. Remove it only when its owner has released it and `git -C <path> status --porcelain` is empty. For external workers, confirm their T3 thread has stopped; if its status is unavailable, retain the worktree. For inline work, finish using the workspace and switch to a safe checkout before removal; do not remove the current workspace. T3-managed workspaces require the platform's supported cleanup; unmanaged ones can use `git worktree remove <path>`. Otherwise leave the workspace and report why. Never force removal of dirty work.

## 4. Report

One line per PR: merged, plus anything the `merge` fact says still happens after merge (a migration deploy, a release). Don't repeat what the PR already says.

## In a run-it control room

When this conversation owns the run (`.it-stack/run.md` names its T3 thread, or its matching local Run owner), continue with run-it's **On wake-up** steps after merging: free the slots and start the next issues.
