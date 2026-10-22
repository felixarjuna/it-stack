# it-stack

Felix's agent skill stack for Claude Code. Every skill is a verb with `-it` on the end.

The idea: you say what you want, answer the agent's questions once, and get back pull requests you can judge in a minute from the PR page, each with a short briefing and phone and desktop screenshots. You say "merge", and the next piece of work starts. Nothing merges without you.

## Install

```
/plugin marketplace add felixarjuna/it-stack
/plugin install it-stack@it-stack
```

## Skills

★ marks the ones you type. The rest are mostly called by those.

| Skill | Job |
| --- | --- |
| ★ **`do-it`** | Start here. Reads any request and picks the right skill below. |
| ★ **`fix-it`** | Bugs: reproduce, root cause, failing test first, fix, ship. |
| ★ **`build-it`** | One issue start to finish: read the brief, build test-first, prove it, ship a PR that closes it. |
| ★ **`run-it`** | Turns the thread into a control room for the whole backlog: the plan first, then questions one at a time, one T3 Code session per issue, at most 3 PRs open, next issue starts when one merges. |
| **`plan-it`** | Turns an unclear idea or issue into a brief: asks what is missing, writes the answers into the issue. |
| **`sort-it`** | Sorts open issues against the code: ready, needs answers, too big, already done, security. Produces the plan and the questions, most important first. |
| **`split-it`** | Breaks work too big for one PR into small issues with "Blocked by" links. |
| **`prove-it`** | Proves the change in the running app the way a user would, with phone and desktop screenshots it checks before using. |
| **`ship-it`** | Check → commit → push → a PR that explains itself (Why, What changed, Scope, Verification, screenshots). Never merges. |
| **`merge-it`** | On "merge": confirms checks are green, merges, cleans up, says what happens after. Never merges on its own. |

## Set up a project

The skills know nothing about your project until it tells them. Add an `## it-stack` section to its `CLAUDE.md` (or `AGENTS.md`) with five facts: the `check` command, how to take `screenshots`, where `migrations` live, how to `merge`, and what's `private`. The [format, an example and the defaults](skills/ship-it/project-facts.md) are in ship-it. If you use `run-it`, add `.it-stack/` to `.gitignore`.

## The control room

`run-it` turns the thread you start it in into a control room. It sorts the open issues against the code, shows you the plan, asks the open questions one at a time (starting work as soon as an issue's questions are answered), and launches one T3 Code session per issue, each in its own worktree, each ending in a PR. At most 3 PRs are open at a time, picked so they don't touch the same code and only one adds a database migration. You review on the PR page and say "merge" in the control room (or merge on GitHub); the next issue starts by itself. `run-it` needs [T3 Code](https://github.com/pingdotgg/t3code); every other skill works in any Claude Code client.

## Credits

it-stack builds on other people's work instead of copying it:

- [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (poteto): the PR briefing format and "prove it works in the real artifact".
- [mattpocock/skills](https://github.com/mattpocock/skills) by Matt Pocock: `triage`, `to-tickets`, `wayfinder`, `grilling`.
- [superpowers](https://github.com/obra/superpowers) by Jesse Vincent: `brainstorming`, `systematic-debugging`, `test-driven-development`.

Install mattpocock-skills and superpowers for the full experience; every skill that uses them has a fallback when they're missing.

## License

MIT
