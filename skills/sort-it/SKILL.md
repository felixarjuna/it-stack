---
name: sort-it
description: Use to go through a repo's open issues - check each against the code and sort it into ready, needs answers, too big, already done or security, with its code areas and whether it needs a migration. Produces one batched question message for the owner. Called by run-it; can be typed alone.
---

# sort-it

The owner should answer questions once, for the whole backlog, and only questions the code can't answer.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## 1. Load triage

Find Matt Pocock's triage skill, which can't be invoked directly: the newest `~/.claude/plugins/cache/*/mattpocock-skills/*/skills/*/triage/SKILL.md`. Read it and use its **"Triage a specific issue"** steps 1 (gather context, redundancy check) and 3 (verify the claim) for every issue, plus the `AGENT-BRIEF.md` beside it when writing briefs. Do **not** apply its labels, post triage comments, or close anything: sort-it only reports.

## 2. Sort every open issue

`gh issue list --state open --limit 100 --json number,title,labels,body,comments`. For each:

| State | When |
| --- | --- |
| `security-skip` | It's about a vulnerability, leaked secret or attack (title, labels or body). Don't discuss its content anywhere public; list it by number only. |
| `done` | The code already does what it asks. Note the evidence: file and line, or what you saw in the running app. |
| `too big` | More than one PR's worth, or more than one session can hold. Goes to `split-it` after its questions are answered. |
| `needs answers` | Something that changes what gets built is unclear. Get its questions from `plan-it` in batch mode. |
| `ready` | Buildable from the issue alone (with its `## Decisions`, if any). |

Also record for each: **areas** (the top-level folders or routes it will touch), **migration** (yes/no, per the `migrations` fact), and **depends on** (issues that must merge first, e.g. two that rework the same screen).

## 3. Output

A table, then the one message for the owner.

```markdown
| # | State | Areas | Migration | Depends on |
| --- | --- | --- | --- | --- |
| 19 | needs answers | app/accounts, api/accounts | yes | – |
```

The owner's message, most important first:

1. Questions, grouped by issue, numbered so they can answer "3: yes". Each says in a few words why the answer matters.
2. "Closing these unless you object:" each `done` issue with its evidence.
3. "Too big, I'll split these after your answers:" each `too big` issue.

Security issues are only counted ("1 security issue skipped"), never described.

## If it isn't installed

Without mattpocock-skills: for each issue, read it fully, search the code for an existing implementation by concept (not only by the issue's words) and say where you looked, and for a bug, reproduce it before believing it. Then sort as above. To get the full version, install `mattpocock-skills`.
