# it-stack

Felix's agent skill stack for Claude Code and Codex. Every skill is a verb with `-it` on the end.

The idea: you say what you want, answer the agent's questions once, and get back pull requests you can judge in a minute from the PR page, each with a short briefing and phone and desktop screenshots. You say "merge", and the next piece of work starts. Nothing merges without you.

## Install

### Claude Code

```
/plugin marketplace add felixarjuna/it-stack
/plugin install it-stack@it-stack
```

### Codex

With Git and Node.js 22.18+ (22.x) or 24+ installed, run these commands in PowerShell, bash or zsh:

```sh
git clone https://github.com/felixarjuna/it-stack.git
cd it-stack
node scripts/install-codex.ts
```

The installer copies all ten skill folders and their supporting files to `~/.agents/skills`, Codex's [user skill location](https://developers.openai.com/codex/skills/). No Claude Code installation or subscription is needed. Start with `$do-it`, or type `$fix-it`, `$build-it`, or `$run-it`. If the skills don't appear, restart Codex.

For skills available only in one project, pass its skill directory instead:

```sh
node scripts/install-codex.ts --dest "/path/to/project/.agents/skills"
```

On Windows, use a path such as `"C:/projects/my-app/.agents/skills"`. The installer works from any working directory and refuses to overwrite any existing skill path, checking all names before copying. To update, pull this checkout, back up and move the ten previously installed it-stack folders out of the destination, then run the installer again. Keep the ten folders together: workflows use sibling skills and references. Unrelated installed skills are left in place.

Optional skills such as superpowers and mattpocock-skills can be installed separately for either client. The shared workflows use the current client's skill catalog and local skill directories, with inline fallbacks when optional skills are missing.

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

The skills know nothing about your project until it tells them. Add an `## it-stack` section to its `AGENTS.md` (Codex) or `CLAUDE.md` (Claude Code) with five facts: the `check` command, how to take `screenshots`, where `migrations` live, how to `merge`, and what's `private`. The [format, an example and the defaults](skills/ship-it/project-facts.md) are in ship-it. If you use `run-it`, add `.it-stack/` to `.gitignore`.

## The control room

`run-it` turns the thread you start it in into a control room. It sorts the open issues against the code, shows you the plan, asks the open questions one at a time (starting work as soon as an issue's questions are answered), and launches one T3 Code session per issue, each in its own worktree, each ending in a PR. At most 3 PRs are open at a time, picked so they don't touch the same code and only one adds a database migration. You review on the PR page and say "merge" in the control room (or merge on GitHub); the next issue starts by itself. `run-it` needs [T3 Code](https://github.com/pingdotgg/t3code) with its orchestration tools, whether you use Claude or Codex; every other skill works in Claude Code or Codex with the tools its workflow needs (Git, authenticated `gh`, and the project's build and verification tools).

In Codex, `run-it` explicitly selects the current provider and model from T3's live catalog and preserves compatible model options. In Claude Code, it keeps the Claude Opus 5.5 default. Your explicit choice, or a project's optional `sessions` fact, overrides those defaults. It reports unavailable selections instead of switching providers silently.

## Development

```sh
npm ci
npm run typecheck
npm test
npm run validate
```

The TypeScript scripts run directly in Node without a build step or runtime dependencies. Development dependencies provide strict type checking. Installer tests use temporary destinations and do not modify your personal skills. CI runs type checking and the checks on Windows, macOS and Linux with Node 22.18 and 26.

## Credits

it-stack builds on other people's work instead of copying it:

- [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (poteto): the PR briefing format and "prove it works in the real artifact".
- [mattpocock/skills](https://github.com/mattpocock/skills) by Matt Pocock: `triage`, `to-tickets`, `wayfinder`, `grilling`.
- [superpowers](https://github.com/obra/superpowers) by Jesse Vincent: `brainstorming`, `systematic-debugging`, `test-driven-development`.

Install mattpocock-skills and superpowers for the full experience; every skill that uses them has a fallback when they're missing.

## License

MIT
