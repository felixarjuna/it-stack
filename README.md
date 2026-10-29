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

Run these commands in your terminal:

```sh
codex plugin marketplace add felixarjuna/it-stack
codex plugin add it-stack@it-stack
```

Start a new Codex session after installation. You can also enter `/plugins` in Codex CLI to browse and install from the configured marketplace. These are Codex's [native plugin commands](https://learn.chatgpt.com/docs/cli/reference#codex-plugin); use a current CLI version if your installation doesn't recognize them.

Codex supports the repo's existing Claude-compatible plugin and marketplace manifests, so both clients install the same twelve skills and supporting files. No manual clone, Node.js setup, or installer script is needed for this route. Start with `$do-it`, or select a skill from Codex's skill picker.

### Optional: standalone Codex skills

Use this route for a project-local skills directory or a client that cannot install plugins. Choose either plugin installation or standalone skills to avoid duplicate entries. If you previously used this script, back up and move its twelve installed skill folders out of your skill directory before switching to the plugin.

With Git and Node.js 22.18+ (22.x) or 24+ installed, run these commands in PowerShell, bash or zsh:

```sh
git clone https://github.com/felixarjuna/it-stack.git
cd it-stack
node scripts/install-codex.ts
```

The installer copies all twelve skill folders and their supporting files to `~/.agents/skills`, Codex's [user skill location](https://developers.openai.com/codex/skills/). No Claude Code installation or subscription is needed. Start with `$do-it`, or type `$fix-it`, `$build-it`, or `$run-it`. If the skills don't appear, restart Codex.

For skills available only in one project, pass its skill directory instead:

```sh
node scripts/install-codex.ts --dest "/path/to/project/.agents/skills"
```

On Windows, use a path such as `"C:/projects/my-app/.agents/skills"`. The installer works from any working directory and refuses to overwrite any existing skill path, checking all names before copying. To update, pull this checkout, back up and move the twelve previously installed it-stack folders out of the destination, then run the installer again. Keep the twelve folders together: workflows use sibling skills and references. Unrelated installed skills are left in place.

Except for direct stack-it calls (which discover visual skills and use fallbacks without an installation offer), skills start with an [optional dependency check](skills/ship-it/dependency-setup.md). It recognizes existing plugins and standalone skills, then offers to install missing Superpowers and Matt Pocock skills together. The offer shows their sources and installation scope and waits for your consent. This runs when an agent follows a skill, not when the plugin itself is installed.

Choose **Install listed dependencies**, **Continue with fallbacks** for this task, or **Don't ask again for these dependencies**. The last choice is saved per client, plugin, source, and scope in `~/.it-stack/dependency-preferences.json`; new dependencies still get their own prompt. Ask to reconsider a dependency to revisit the choice. No installation approvals are stored. Declines, installation failures, unsupported clients, and installations requiring a restart use the existing fallbacks so your original task can continue. Delegated and unattended work never prompts or installs.

## Skills

★ marks the ones you type. The rest are mostly called by those.

| Skill | Job |
| --- | --- |
| ★ **`setup-it`** | Configure Git host and Harness independently; offered automatically on first use. |
| ★ **`do-it`** | Start here. Reads any request and picks the right skill below. |
| ★ **`stack-it`** | Establish or reconcile the tech stack, component sources and design system before web development; reuse decisions and verify rendered workflows. |
| ★ **`fix-it`** | Bugs: reproduce, root cause, failing test first, fix, ship. |
| ★ **`build-it`** | One issue start to finish: read the brief, build test-first, prove it, ship a PR that closes it. |
| ★ **`run-it`** | Turns the thread into a control room for the whole backlog: the plan first, then questions one at a time, inline by default or separate T3 sessions when selected, at most 3 PRs open, dependent issues start after merge. |
| **`plan-it`** | Turns an unclear idea or issue into a brief: asks what is missing, writes the answers into the issue. |
| **`sort-it`** | Sorts open issues against the code: ready, needs answers, too big, already done, security. Produces the plan and the questions, most important first. |
| **`split-it`** | Breaks work too big for one PR into small issues with "Blocked by" links. |
| **`prove-it`** | Proves the change in the running app the way a user would, with phone and desktop screenshots it checks before using. |
| **`ship-it`** | Check → commit → push → a PR that explains itself (Why, What changed, Scope, Verification, screenshots). Never merges. |
| **`merge-it`** | On "merge": confirms checks are green, merges, cleans up, says what happens after. Never merges on its own. |

## Set up a project

The skills know nothing about your project until it tells them. Add an `## it-stack` section to its `AGENTS.md` (Codex) or `CLAUDE.md` (Claude Code) with five facts: the `check` command, how to take `screenshots`, where `migrations` live, how to `merge`, and what's `private`. The [format, an example and the defaults](skills/ship-it/project-facts.md) are in ship-it. If you use `run-it`, add `.it-stack/` to `.gitignore`.

## The control room

`run-it` keeps the backlog in the current thread: it sorts issues, asks unresolved questions, and tracks work through review and merge. The default is **inline** execution with Superpowers planning, test-driven development and verification when installed. This is useful for sequential or tightly coupled issues. Each issue still gets a small PR; dependent work waits for its prerequisite PR to merge. Without Superpowers, the same steps have an inline fallback.

Choose **sessions** when you want independent issues built in separate T3 Code worktrees. Only this mode requires T3 orchestration tools. Both modes keep the limit of 3 open PRs and 1 active migration, and never merge without your instruction. Execution mode is recorded for resume; switching to inline lets existing workers finish without launching replacements.

For separate sessions or reviewers, Codex resolves the current provider/model and compatible options from T3's live catalog; Claude Code retains its Claude Opus 5.5 default. Your explicit choice or the project's optional `sessions` fact overrides those defaults. The optional `execution` fact selects inline or sessions. Inline work uses the current conversation's model.

With T3, PR watches can wake the run. Without T3, inline mode resumes on your next message rather than promising background execution.

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

The setup check offers mattpocock-skills and superpowers for the full experience; every skill that uses them has a fallback when they're unavailable.

## License

MIT
