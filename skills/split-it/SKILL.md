---
name: split-it
description: Use when an issue or plan is too big for one PR or one session. Breaks it into small issues, each a complete vertical slice with "Blocked by" links, and links them from the parent issue.
---

# split-it

A PR the owner can judge in a minute needs work small enough to fit in one. split-it makes the pieces.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)). Issues may be public: everything you write into one follows the `private` fact.

## 1. Load the splitting method

Matt Pocock's skills for this can't be invoked directly. They live under `skills/*/<name>/SKILL.md` inside the newest installed version of the plugin (the last line of `ls -d ~/.claude/plugins/cache/*/mattpocock-skills/*/ | sort -V`; versions compare as numbers, so 1.10 is newer than 1.9). Find the one you need and follow it:

- **Fits a few sessions:** `to-tickets`. Tracer-bullet vertical slices, each with its blocking edges.
- **More than a few sessions can hold, or full of open decisions:** `wayfinder`. A map of decision tickets resolved one at a time; each resolved decision becomes buildable issues.

Where they talk about "the configured tracker" or label vocabulary, use GitHub issues through `gh` and no labels.

## 2. Make the issues

For each slice: `gh issue create` with

```markdown
Part of #<parent>.

## What
<the slice, from the user's side>

## Decisions
<what the parent's Decisions say that applies here>

Done when: <what the user can do, observed in the running app>

Areas: <top-level folders or routes it touches>
Migration: <yes/no, per the `migrations` fact>

Blocked by #<n>, #<m>
```

Leave out `Blocked by` when it can start now. Order matters for migrations: when several slices add migrations, chain them with `Blocked by` so they land one at a time.

## 3. Link them

Add a checklist to the parent issue (`- [ ] #<n> <title>` per slice) and a line saying it's tracked by its slices. Don't close the parent; it closes with its last slice's PR (`Closes #<parent>` there).

Called by run-it? Also return one Queue row per slice (`#n | ready | areas | migration | depends on`, with its `Blocked by` issues as depends on) so the control room can schedule them.

## If it isn't installed

Without mattpocock-skills: cut the work into slices that each go through every layer it needs (data, server, UI, tests) and can be demonstrated alone; put shared groundwork (a new table, a renamed module) in its own first slice; give each slice the slices it needs first. Then make and link the issues as above. To get the full version, install `mattpocock-skills`.
