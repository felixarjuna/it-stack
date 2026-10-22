# `.it-stack/run.md`

The control room's memory. Written by `run-it` after every change, read first on every wake-up. It lives in the project (add `.it-stack/` to `.gitignore`) so a new control room can take over if the old thread is lost.

## Format

```markdown
# it-stack run

Control room: 3f2c9a10-0000-4000-8000-000000000000
Repo: someone/bakery-orders (default branch: main)
Limit: 3 open PRs, 1 migration
Started: 2026-11-02
Session selection: <resolved modelSelection as JSON, including options>

## Running

| # | Thread | Branch | PR | Areas | Migration | State |
| --- | --- | --- | --- | --- | --- | --- |
| 12 | 7d1e…c4 | feat/12-order-notes | #40 | app/orders, api/orders | yes | ready to review |
| 15 | 91ab…02 | fix/15-total-rounding | – | lib/money | no | running |

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
