---
name: merge-it
description: Use when the owner explicitly asks to merge one or more pull requests or merge requests.
---

# merge-it

First follow [platform setup](../ship-it/platforms/README.md), once per task. Resolve the full review identity before any remote operation.
Follow [optional dependency setup](../ship-it/dependency-setup.md) and the project's [facts](../ship-it/project-facts.md).

Merge only on the owner's word. Interpret PR/MR names through the selected Git host.

## 1. Resolve the requested reviews

"Merge" applies to the review(s) under discussion, not every open review. If ambiguous, show candidates and ask. Read each through Git host `reviews.read`; record the reviewed head and authorization. Process oldest first, one at a time.

## 2. Check the current change

Use `reviews.checks`: evaluate CI, approvals, discussions, draft status, conflicts and platform mergeability separately, following the [contract](../ship-it/platforms/contracts.md).

- Pending: wait in bounded intervals or report pending; an idle conversation is not a background watcher.
- Failed or unknown: do not merge. Show the failure. For an inline change fix it in its recorded workspace; for an external worker send the details via its recorded harness. Verify and report the fix, then wait for the owner to approve the changed diff.
- Absent CI: only explicit `ci: optional` plus passing local check permits proceeding, and server merge rules still apply.
- Conflicts: rebase in the recorded workspace, verify, push and recheck. A rebase that only regenerates a migration or resolves an import clash can retain the same approval; behavior changes need renewed approval. Never discard uncommitted work.

## 3. Merge and confirm

Re-read head and eligibility immediately before Git host `reviews.merge`, supplying expected head and configured semantic merge/branch policy. Never bypass protections or silently switch merge strategy. A changed head needs inspection; an unrelated user's new changes are not covered by the old approval.

Read back remote state. Only confirmed merged state frees the slot; queued/auto-merge-enabled is not merged. Permission failures and stale-head errors retain the row. A later review that conflicts after an earlier merge returns to step 2.

Update the default branch only in a clean checkout using a fast-forward-only pull from the selected remote. Preserve dirty checkouts and local-only commits. If no safe checkout exists, report synchronization pending.

For cleanup, find the recorded workspace by project/branch. Confirm worker ownership is released and lifecycle is known; then require `git -C <path> status --porcelain` to be empty. Use harness `release` for managed workspaces. For unmanaged worktrees use `git worktree remove <path>` only after switching away. Never force cleanup or remove the current workspace. Delete merged local branches only after safe release. A denied remote deletion is pending cleanup, not a failed merge.

## 4. Continue and report

Report review URL and any remaining deploy/cleanup step from project facts. When this conversation owns a run, follow run-it's reconciliation: mark Done, refresh other reviews, then fill newly eligible slots. Never take ownership merely because a state file exists.
