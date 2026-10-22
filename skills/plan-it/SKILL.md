---
name: plan-it
description: Use when a request or issue is unclear, before building it. Asks the owner what's missing and writes an agent-ready brief into the issue. In batch mode (called by sort-it or run-it) it returns its questions instead of asking them.
---

# plan-it

Nothing gets built on a guess. plan-it finds what's missing, asks, and writes the answers where the builder will read them: the issue.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)). Issues may be public: everything you write into one follows the `private` fact.

## Pick the mode

- **Chat mode** (the owner is talking to you): ask, one question per message.
- **Batch mode** (called by `sort-it` or `run-it`): don't ask. Return the questions for that issue, each with why the answer changes what gets built, most important first. The caller merges every issue's questions into one message.

## What to find out

Read the issue (or request) and the code it touches first; never ask what the code already answers. Then look for:

- who it's for and what they do today
- what "done" looks like, from the user's side
- decisions with more than one reasonable answer, where a wrong guess would mean rework (data model, permissions, what's public, what's deleted)
- what it must not do

Skip anything a sensible builder can settle alone; settle it and say so in the brief.

## Chat mode

- A new idea or feature: use `superpowers:brainstorming`.
- An existing issue with gaps: use `mattpocock-skills:grilling` to work through them.

## Write the brief

Add or update a `## Decisions` section on the issue (`gh issue edit <n> --body-file`, keeping the original text above it):

```markdown
## Decisions

- <decision> (owner, <date>)
- <decision> (builder's call: <why>)

Done when: <what the user can do, observed in the running app>
```

The issue should now be buildable without the conversation. If the work is too big for one PR, hand it to `split-it`.

## If it isn't installed

Without superpowers or mattpocock-skills: read the issue and code, list what's unclear, and ask one question per message, each about a concrete moment ("walk me through the last time…") rather than a menu. After each answer, play back what you understood in a few lines and ask what's wrong or missing. Then write the brief as above. To get the full version, install `superpowers` and `mattpocock-skills`.
