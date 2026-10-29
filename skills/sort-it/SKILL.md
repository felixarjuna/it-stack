---
name: sort-it
description: Use to go through a repo's open issues - check each against the code and sort it into ready, needs answers, too big, already done or security, with its code areas and whether it needs a migration. Produces the plan for the backlog and an ordered list of questions for the owner, asked one at a time. Called by run-it; can be typed alone.
---

# sort-it

First follow [platform setup](../ship-it/platforms/README.md), once per task. Local work can continue with setup deferred; resolve required identity before remote operations.

First follow [optional dependency setup](../ship-it/dependency-setup.md), including when invoked directly. Reuse the result within this task.

The owner should see the plan first, then answer only questions the code can't answer, one at a time.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## 1. Load triage

Find Matt Pocock's `triage` skill using [the current client's skill lookup](../ship-it/project-facts.md#using-skills-across-clients). Read its `SKILL.md` and use its **"Triage a specific issue"** steps 1 (gather context, redundancy check) and 3 (verify the claim) for every issue, plus the `AGENT-BRIEF.md` beside it when writing briefs. Do **not** apply its labels, post triage comments, or close anything: sort-it only reports. If it isn't installed, use the fallback below.

## 2. Sort every open issue

Use Git host `issues.list` through every page; use `issues.read` for body, labels and comments. An unavailable project or failed listing is not an empty backlog. For each:

| State | When |
| --- | --- |
| `security-skip` | It's about a vulnerability, leaked secret or attack (title, labels or body). Don't discuss its content anywhere public; list it by number only. |
| `done` | The code already does what it asks. Note the evidence: file and line, or what you saw in the running app. |
| `too big` | More than one PR's worth, or more than one session can hold. Goes to `split-it` after its questions are answered. |
| `needs answers` | Something that changes what gets built is unclear. Get its questions from `plan-it` in batch mode. |
| `ready` | Buildable from the issue alone (with its `## Decisions`, if any). |

Also record for each: **areas** (the top-level folders or routes it will touch), **migration** (yes/no, per the `migrations` fact), and **depends on** (issues that must merge first, e.g. two that rework the same screen).

## 3. Output

Three things, in this order.

**The table** (it goes into run-it's Queue):

```markdown
| # | State | Areas | Migration | Depends on |
| --- | --- | --- | --- | --- |
| 19 | needs answers | app/accounts, api/accounts | yes | – |
```

**The plan**, shown to the owner first: one line per issue saying what will happen to it and when, in plain words. Group the lines:

- **Start first** (in parallel): the issues that can run together within the limits, and why they don't collide.
- **After that:** the issues that wait for another one to merge, and what they wait for.
- **Split first:** the `too big` issues, and roughly into what.
- **Close as done:** each `done` issue with its evidence (closed only after the owner agrees).
- Security issues are only counted ("1 security issue skipped"), never described.

Mark the issues that still need an answer before they can start ("after 2 questions").

**The questions**, an ordered list, most important first: the one whose answer unblocks the most work, or changes the plan most, comes first. Find Matt Pocock's `to-questionnaire` with the same client-aware lookup and follow it when available, adapted for chat: one idea per question, naming its issue, with a short *why this matters* only where it could be misread. Offer 2–3 concrete options when there's an obvious set, with your recommendation first. The caller asks them **one at a time**; never send the list to the owner as a block.

## If it isn't installed

Without mattpocock-skills: for each issue, read it fully, search the code for an existing implementation by concept (not only by the issue's words) and say where you looked, and for a bug, reproduce it before believing it. Then sort as above. Use this fallback when dependency setup leaves the optional skills unavailable.
