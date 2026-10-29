---
name: build-it
description: Use to build one issue or clear feature from start to finish - read the brief, build it test-first, prove it, and ship a PR that closes the issue. What every run-it session runs. Starts right away unless the PR limit is reached.
---

# build-it

First follow [platform setup](../ship-it/platforms/README.md), once per task. Local work can continue with setup deferred; resolve required identity before remote operations.

First follow [optional dependency setup](../ship-it/dependency-setup.md), including when invoked directly. Reuse the result within this task.

One issue in, one PR out.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## 1. Read the brief

Use Git host `issues.read` for the selected project and issue, including comments. The issue body and its `## Decisions` section are the spec.

Something unclear that changes what gets built?

- **Talking to the owner:** use `plan-it` (chat mode), then continue.
- **Launched by run-it** (your instructions name a separate control room): use `issues.comment`, then harness `send` to that control room with `Question on <issue-url>: <question>`, and stop. Don't guess.

## 2. Slot check

Skip the duplicate slot check when run-it already reserved this issue, whether in an external session or inline. Do not count your own reserved row as a new competing slot. Inline questions stay in the current conversation; external workers send questions to their separate control room. Otherwise run the slot check below; over the limit, say so in one line and ask before starting.

## 3. Branch

Run-it already recorded a workspace and branch for this issue (external or inline)? Use that workspace and branch; do not start a duplicate checkout. Otherwise, if an open PR for this issue exists (its branch is `*/<n>-*` or its body says `Closes #<n>`), check out its branch and continue there. Otherwise branch from the default branch: `<type>/<n>-<short-slug>` (e.g. `feat/12-order-notes`).

## 4. Build

Before feature code for a web app or visible interface change, follow [stack-it](../stack-it/SKILL.md). Reuse the existing design contract when current; reconcile stale component configuration and affected decisions first. Backend-only work skips visual setup. This adds no approval gate and preserves standing owner decisions.

Test first: use `superpowers:test-driven-development` for each behaviour. Keep the change to what the issue asks; note follow-ups for the PR's Scope instead of building them. If the change adds a migration, follow the `migrations` fact.

## 5. Ship

Use `ship-it`, with `Closes #<n>` in the body.

## Slot check

Other skills link here. Before starting work that will become a PR:

1. Use Git host `reviews.list`, following every page and inspecting changed paths. Failed or incomplete enumeration is unknown capacity, not zero open reviews. If `.it-stack/run.md` exists, also read its Running rows: a run-it session without a PR yet still holds a slot.
2. **Open PRs:** open PRs plus Running rows without a PR, 3 or more, means the limit is reached. Every open PR counts, whoever opened it.
3. **Migrations:** a PR adds a migration when one of its files is under the path in the `migrations` fact; a Running row says so in its Migration column. If one already adds a migration and this work will too, the limit is reached.

Limit reached and you weren't launched by run-it: tell the owner in one line which PRs are waiting for them and ask whether to start anyway.

## If it isn't installed

Without superpowers: for each behaviour, write the test, run it and see it fail for the right reason, write the code, run it green. Run the whole `check` before `ship-it`. Use this fallback when dependency setup leaves the optional skills unavailable.
