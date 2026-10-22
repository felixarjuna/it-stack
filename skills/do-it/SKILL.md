---
name: do-it
description: Use for any request when you're not sure which it-stack skill fits, or when the owner types $do-it or /do-it. Reads the request, picks the right -it skill, says which in one line and follows it.
---

# do-it

The owner shouldn't have to remember skill names. Read the request, pick one skill, say "Using <skill>." and follow it.

For Codex and Claude Code invocation and optional skill lookup, follow [Using skills across clients](../ship-it/project-facts.md#using-skills-across-clients). Read the selected sibling `../<name>/SKILL.md` in this session.

| The request is… | Use |
| --- | --- |
| something broken, wrong, failing or a bug report | `fix-it` |
| an issue number, or a feature clear enough to build | `build-it` |
| an idea, a vague feature, or an issue with open decisions | `plan-it`, then `build-it` once the brief is written |
| the backlog: "all the issues", "run the issues", "what's next" | `run-it` |
| "sort the issues", "what's open", "triage" | `sort-it` |
| too big for one PR, "split this", "break it down" | `split-it` |
| "merge", "merge them", "ship it in" | `merge-it` |
| "open a PR", "ship this", a finished change in the working tree | `ship-it` |
| "show me it works", "screenshot it" | `prove-it` |

Two fit? Take the earlier row: a bug inside a feature request is still a bug. Nothing fits (a question, an explanation, a one-off command)? Just do it directly; not everything needs a skill.
