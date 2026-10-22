# Inline execution

The current session implements the backlog one issue at a time. Keep the same issue, PR, dependency and migration discipline as separate sessions; avoid repeated implementer handoffs.

## Start and resume

With T3, keep the current thread as control room and use its available PR linking and watch tools. Without T3, record `Control room: local` and `Run owner: <session identifier>` (or a generated identifier retained by this conversation). A resumed conversation that cannot establish ownership asks whether to take over before writing run state. Never treat an unknown owner as inactive.

For each Running row record `Thread: inline`, its absolute Workspace path, branch, PR, areas, migration flag and state. Record the implementation Plan path in the row too. Existing external workers retain their real thread IDs. On resume, inspect the recorded workspace, plan, Git status and PR before continuing; a row without a PR is not permission to start over.

If a run contains external workers and their T3 state cannot be inspected, leave those rows occupied and do not duplicate or take over their work. Resolve ownership before dispatching overlapping or dependent work.

## Work the next issue

1. Check slot capacity exactly as run-it defines it, counting every open repository PR and every Running row without a PR. Select the oldest ready issue whose dependencies are merged, areas do not overlap existing workers and migration does not overlap an active migration. Implement only one issue at a time in this session. If none qualifies, report the actual blocker and wait for an owner message or PR event.
2. Use an isolated branch/workspace without disturbing existing uncommitted work. Record its actual absolute path; changing directories does not change a T3 thread's workspace binding. Use platform workspace controls where appropriate, and never launch a new conversation merely to isolate inline work.
3. Read the issue and approved design. Reuse an existing implementation plan, or use `superpowers:writing-plans` to create a scoped plan and `superpowers:executing-plans` to execute it here. Honor already-given approvals and execution choices; ask only for unresolved design decisions or required artifact reviews not yet satisfied. If superpowers is unavailable, write a short checkbox plan with files, behavior and verification, then follow it directly.
4. Use build-it's test-first implementation and ship-it's checks, evidence and PR workflow. The current session owns failures and questions; do not send a message to yourself as a control-room handoff. Independent review may use a child agent when warranted or required by the chosen review workflow; do not turn every issue into another implementer session.
5. Update the Running row with the PR and current check state. Use `ready to review` only after checks pass. Link the PR when supported. Continue another eligible independent issue within the limits, or wait if the next issue depends on this PR. Never merge without the owner's instruction.

## Events and handoff

- For an inline PR's failed checks, conflicts or review requests, work in its recorded workspace, update its state to `fixing`, and re-run verification/ship-it. For external rows, send the event to that worker as run-it describes.
- On a merged PR, mark Done and safely update the base checkout. Never pull across dirty work or assume a local-only commit is in the remote base. Reconcile other PRs, then select the next eligible issue.
- On a closed unmerged PR, ask whether to drop or retry; do not silently discard the issue or duplicate its branch.
- With T3 watch support, register the watch and yield; events resume the run. Without it, check once on the next owner message and say continuation requires that message. Do not promise background wake-ups or invent a polling service.
- Changing execution mode affects future work. Let an active external worker finish in place; its PR must merge before dependent inline work starts. Preserve its model selection for remaining review/fix work.

Example: issue 12 is being built by an external session and issue 15 depends on it. The owner switches to inline. Keep 12's worker row, record inline mode, await 12's PR and owner-authorized merge, then implement 15 here. Do not cancel 12, build a duplicate, or start 15 from an unmerged head.
