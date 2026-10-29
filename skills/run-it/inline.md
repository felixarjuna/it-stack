# Inline execution

The current session implements one issue at a time with the same review, dependency and migration limits as external workers. Use [inline harness behavior](../ship-it/platforms/harnesses/inline.md) and [central state](run-file.md).

On resume inspect each recorded workspace, plan, branch and review through the selected Git host. A row without a review still holds work. Keep existing external workers and their original harness IDs; if they cannot be inspected, retain their occupied slots and resolve ownership before overlapping or dependent work.

1. After full review/migration enumeration, pick the oldest ready issue with merged dependencies and no area/migration conflict. If none qualifies, report the blocker.
2. Use a separate branch/workspace safely; record the actual absolute path. Do not disturb dirty work or launch another session merely to isolate inline work. A directory change need not alter the harness's workspace binding.
3. Read the issue and approved design. Reuse its existing implementation plan, or use `superpowers:writing-plans` and `superpowers:executing-plans` here. Honor standing approvals and execution choices. Without those optional skills, write a short checkbox plan with files, behavior and verification and execute it directly.
4. Follow build-it and ship-it. This session owns questions/failures; do not message yourself. Independently justified review delegation does not authorize one implementer session per issue.
5. Record the full review URL/head and actual check state. Continue another independent issue within the limits, or wait for dependencies to merge. Never merge without the owner's instruction.

Handle feedback in the recorded workspace; preserve changes and verify again. On confirmed merge update Done and safely synchronize a clean base checkout. On closed unmerged review ask whether to drop or retry. Activity-driven reconciliation is the default; optional compatible watches may wake the control room, but an idle conversation must not claim background polling.

Switching from sessions to inline leaves existing workers running. If issue B depends on external issue A, await A's confirmed merge before building B. Do not cancel A or start a duplicate.
