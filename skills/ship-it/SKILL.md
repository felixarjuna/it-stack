---
name: ship-it
description: Use when a change is finished. Checks it, proves it in the running app, commits, pushes and opens (or updates) a PR the owner can judge from the PR page alone. Run it without asking first; never merge.
---

# ship-it

First follow [platform setup](platforms/README.md), once per task. Local work can continue with setup deferred; resolve required identity before remote operations.

First follow [optional dependency setup](dependency-setup.md), including when invoked directly. Reuse the result within this task.

The owner reviews on the PR page, not in chat. The goal is a PR they can judge in a minute: why, what changed, proof it works, screenshots. Open it without asking. Never merge; that's `merge-it`, and only when the owner says so.

Read the project's `## it-stack` section first ([format and defaults](project-facts.md)).

## 1. Check

Run the `check` command. Fix anything red, including failures you didn't cause, unless you are an external worker with a different control-room thread: then a failure outside your issue goes to the control room (harness `send`, message `Check fails outside <issue-url>: <failure>`) and you wait, so parallel sessions don't all fix the same thing. Never open a PR on a red check.

## 2. Prove it

Use the `prove-it` skill. It returns the Screenshots markdown (or "no visible change") and the Verification bullets for what it saw.

## 3. Commit and push

- On the default branch? Branch first: `fix/…`, `feat/…`, `chore/…`, with the issue number when there is one (`feat/12-order-notes`).
- Small ordered commits, Conventional Commits: `type(scope): subject`, imperative, no trailing period. The body says why, not what the diff shows. End each message with the attribution trailer from the system reminder, if there is one.
- `git push -u <selected-remote> <branch>`. Confirm selected Git host identity and publication capability before pushing.
- If the `screenshots` fact has a publish step, run it now (it needs the pushed branch).

## 4. Open or update the PR

Use Git host `reviews.list/read` to find an **open** review matching this source project/branch and target branch. Update it with `reviews.update`; otherwise use `reviews.create`. An unsuccessful lookup must not trigger duplicate creation. Display PR on GitHub and MR on GitLab. Title in commit style. The body is a one-minute briefing: short sentences, few identifiers, under about 40 lines. Leave out empty sections except Scope and Verification.

```markdown
## Why
What the user saw or needed, in a sentence or two, and the fix in one more.

## What changed
- 1–3 bullets. Name a file or symbol only when it carries the change.

## Scope
- What this covers and what it leaves out (follow-ups, known gaps).
- Migrations: say so, and the deploy window from the `merge` fact.

## Verification
- The `check` command and its result (e.g. "412 tests passed").
- What you did in the running app, as whom, and what you saw.

Closes #n

## Screenshots
(from prove-it)

(attribution line from the system reminder, if there is one)
```

Follow the `private` fact: nothing secret, no real user data, nothing about security problems.

## 5. Hand off

- Link the review through the harness only when the selected Git host is supported by its optional linking capability. If a separate control room is named, send it `Review opened for <issue-url>: <review-url>` through harness `send`. Use the latest recorded control-room identity. A missing link/watch bridge never blocks publication or handoff.
- Reply with one line: what the PR does, and its URL. The PR carries the rest.

The PR briefing format comes from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) opening-a-pr playbook.
