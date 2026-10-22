---
name: build-it
description: Use to build one issue or clear feature from start to finish - read the brief, build it test-first, prove it, and ship a PR that closes the issue. What every run-it session runs. Starts right away unless the PR limit is reached.
---

# build-it

One issue in, one PR out.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## 1. Read the brief

`gh issue view <n> --comments`. The issue body and its `## Decisions` section are the spec.

Something unclear that changes what gets built?

- **Talking to the owner:** use `plan-it` (chat mode), then continue.
- **Launched by run-it** (your instructions say `Control room thread: <id>`): comment the question on the issue, end your turn with the question as your last message (the control room reads it there), and stop. Don't guess.

## 2. Slot check

Skip it when launched by run-it: the control room already reserved your slot. Otherwise run the slot check below; over the limit, say so in one line and ask before starting.

## 3. Branch

If a PR for this issue already exists (`gh pr list --search "<n> in:body" --state open`), check out its branch and continue there. Otherwise branch from the default branch: `<type>/<n>-<short-slug>` (e.g. `feat/48-delete-account`).

## 4. Build

Test first: use `superpowers:test-driven-development` for each behaviour. Keep the change to what the issue asks; note follow-ups for the PR's Scope instead of building them. If the change adds a migration, follow the `migrations` fact.

## 5. Ship

Use `ship-it`, with `Closes #<n>` in the body.

## Slot check

Other skills link here. Before starting work that will become a PR:

1. `gh pr list --state open --json number,title,files --limit 100`.
2. **Open PRs:** 3 or more open means the limit is reached. Every open PR counts, whoever opened it.
3. **Migrations:** a PR adds a migration when one of its files is under the path in the `migrations` fact. If one open PR already adds a migration and this work will too, the limit is reached.

Limit reached and you weren't launched by run-it: tell the owner in one line which PRs are waiting for them and ask whether to start anyway.

## If it isn't installed

Without superpowers: for each behaviour, write the test, run it and see it fail for the right reason, write the code, run it green. Run the whole `check` before `ship-it`. To get the full version, install `superpowers`.
