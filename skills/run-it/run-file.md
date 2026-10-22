# `.it-stack/run.md`

The control room's memory. Written by `run-it` after every change, read first on every wake-up. It lives in the project (add `.it-stack/` to `.gitignore`) so a new control room can take over if the old thread is lost.

## Format

```markdown
# it-stack run

Control room: 3f2c9a10-0000-4000-8000-000000000000
Repo: someone/bakery-orders (default branch: main)
Limit: 3 open PRs, 1 migration
Started: 2026-11-02
Execution mode: sessions
Session launches: authorized
Session selection: <resolved modelSelection as JSON, including options>

## Running

| # | Thread | Workspace | Plan | Branch | PR | Areas | Migration | State |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | 7d1e…c4 | /worktrees/order-notes | docs/plans/order-notes.md | feat/12-order-notes | #40 | app/orders, api/orders | yes | ready to review |
| 15 | 91ab…02 | /worktrees/total-rounding | docs/plans/total-rounding.md | fix/15-total-rounding | – | lib/money | no | running |

## Queue

| # | State | Areas | Migration | Depends on |
| --- | --- | --- | --- | --- |
| 18 | ready | app/menu | no | – |
| 21 | ready | app/orders | yes | 12 |
| 19 | needs answers | app/accounts | yes | – |

## Questions

- [x] #19: Can a customer change an order after the kitchen has seen it? → no (owner, 2026-11-02)
- [ ] #21: Should order notes be visible to the delivery driver?

## Done

- #9 → #37 merged 2026-11-02
- #11 closed: already done (owner agreed 2026-11-02)
- #14 split into #22, #23, #24
- 1 security issue skipped
```

## States

**Running:** `running` (session working, no PR yet), `question` (session asked; waiting for the owner), `ready to review` (PR open, checks green), `fixing` (checks failed or conflicts; session or control room is on it).

**Queue:** the states from `sort-it`: `ready`, `needs answers`, `too big`.

Thread IDs in the file are full IDs; they're shortened above only to fit.

`Session selection` stores the provider instance, model and options resolved by run-it, using the returned T3 `modelSelection` shape. Replace the placeholder with the actual JSON. Reuse it on resume and for replacement sessions; if it becomes unavailable, ask the owner rather than switching models.

## Execution ownership

`Execution mode` is `inline` or `sessions`. It persists across resumes; an explicit owner change updates it. For older files with external Running threads but no mode, record `sessions` with `Session launches: pending owner choice`, preserve workers, and confirm sessions before launching additional ones. Keep the pending flag across resumes; only explicit owner choice changes it to `authorized`. New sessions runs record `authorized` from the owner choice or their project execution preference. Inline runs record `disabled`. Other legacy files default to inline.

Inline Running rows use literal `inline` in Thread and retain their absolute Workspace and Plan path. An external worker keeps its thread ID even after the run changes to inline; do not replace that row until its work finishes. Current mode governs new work, not ownership of existing work.

Without T3, record `Control room: local` and a `Run owner` identifier. Unknown ownership requires takeover confirmation. See [Inline execution](inline.md).

`Session selection` is required before a session or reviewer is launched. Inline work can record `not used` when there are no external workers or review agents. Keep an existing selection while external work remains; it is not a request to change the current inline model.
