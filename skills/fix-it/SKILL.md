---
name: fix-it
description: Use when something is broken, wrong or failing. Reproduces it, finds the root cause, writes a failing test first, fixes it, and ships a PR with ship-it. Starts right away unless the PR limit is reached.
---

# fix-it

First follow [platform setup](../ship-it/platforms/README.md), once per task. Local work can continue with setup deferred; resolve required identity before remote operations.

First follow [optional dependency setup](../ship-it/dependency-setup.md), including when invoked directly. Reuse the result within this task.

Fix the cause, not the symptom, and prove it stays fixed.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## 1. Slot check

Run the [slot check](../build-it/SKILL.md#slot-check). Over the limit: say so in one line and ask before starting.

## 2. Find the cause

Use `superpowers:systematic-debugging`. Reproduce the problem first, the way the user hit it. Read the code and the history (`git log -S`, `git blame`) before forming a theory. The fix goes where the cause is, even if the symptom shows up elsewhere.

## 3. Test first

For a visible fix, consult [stack-it](../stack-it/SKILL.md) and reuse the existing design contract; amend only affected decisions. Do not turn a bugfix into a redesign. Backend-only fixes skip visual setup.

Use `superpowers:test-driven-development`: write a test that fails because of the bug, run it, and see it fail for that reason. Then fix, run it green, and run the whole `check`.

## 4. Ship

Use `ship-it`. In the PR, Why says what the user saw; What changed names the cause.

## If it isn't installed

Without superpowers: reproduce, then read the code path end to end and write down the cause in one sentence before changing anything. If two fixes in a row fail, the theory is wrong: go back to reproducing. Write the failing test, watch it fail, fix, watch it pass, run `check`. Use this fallback when dependency setup leaves the optional skills unavailable.
