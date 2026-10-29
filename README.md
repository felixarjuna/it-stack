# it-stack

Felix's agent skill stack for Claude Code and Codex. Every skill is a verb with `-it` on the end.

The idea: you say what you want, answer the agent's questions once, and get back pull requests or merge requests you can judge in a minute from their review page, each with a short briefing and phone and desktop screenshots. You say "merge", and the next piece of work starts. Nothing merges without you.

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
| ★ **`build-it`** | One issue start to finish: read the brief, build test-first, prove it, ship a PR/MR that closes it. |
| ★ **`run-it`** | Turns the thread into a control room for the whole backlog: the plan first, then questions one at a time, inline by default or separate sessions through T3 Code or Paseo when selected, at most 3 open reviews, dependent issues start after merge. |
| **`plan-it`** | Turns an unclear idea or issue into a brief: asks what is missing, writes the answers into the issue. |
| **`sort-it`** | Sorts open issues against the code: ready, needs answers, too big, already done, security. Produces the plan and the questions, most important first. |
| **`split-it`** | Breaks work too big for one PR into small issues with "Blocked by" links. |
| **`prove-it`** | Proves the change in the running app the way a user would, with phone and desktop screenshots it checks before using. |
| **`ship-it`** | Check → commit → push → a PR/MR that explains itself (Why, What changed, Scope, Verification, screenshots). Never merges. |
| **`merge-it`** | On "merge": confirms checks are green, merges, cleans up, says what happens after. Never merges on its own. |

## Git host and Harness setup

Choose these independently. **Git host** is GitHub or GitLab (including self-managed instances); **Harness** is where coding sessions run, such as T3 Code or Paseo. The coding agent/model is a separate choice. Every Git host supports either harness or inline execution.

On first use, the skills inspect your repository and session, then offer to confirm or change Git host and Harness. Existing settings are reused. `setup-it` revisits configuration; choose Auto to detect each time, or configure later to continue local work. Native plugin installation/file copying cannot itself guarantee an interactive prompt, so first use is the common setup path. The standalone installer offers setup in an interactive terminal.

Project settings live in the applicable `AGENTS.md` or `CLAUDE.md`:

```markdown
## it-stack

- **git-host:** gitlab
- **harness:** paseo
- **setup:** complete
- **execution:** inline
- **check:** npm test
- **merge:** project-default
- **ci:** required
```

This is an example combination, not a preset. GitHub/Paseo and GitLab/T3 use the same workflow. Inline execution needs no external harness; choosing one does not authorize session launches. See the [compatibility matrix and adapter guide](skills/ship-it/platforms/compatibility.md).

Explicit task choices override project facts. Unambiguous environment detection precedes optional user defaults in `~/.it-stack/config.json`; conflicting identity is surfaced before remote work. Configure custom GitLab identity from its full remote/hostname, including nested namespaces. Authentication stays with the Git host tools; never put tokens in skill configuration.

For scripted installation:

```sh
node scripts/install-codex.ts --dest /path/to/project/.agents/skills --git-host gitlab --harness paseo --project-file /path/to/project/AGENTS.md
```

`--setup-scope user` saves user defaults instead. `--skip-setup` installs without prompting or writing preferences. Noninteractive installation without explicit setup options also defers setup. Delegated workers inherit their control room's settings and never prompt. Run `node scripts/install-codex.ts --help` for options. If setup fails after the skill copy, the installation remains available: fix settings through `setup-it`, rather than overwriting installed folders.

Add project facts for screenshots, migrations, merge/deployment behavior, and private data as appropriate. See [format and defaults](skills/ship-it/project-facts.md). Optional dependency installation is a separate consent flow; platform setup does not authorize installing other plugins. If you use `run-it`, add `.it-stack/` to `.gitignore`.

## The control room

`run-it` sorts issues, asks unresolved questions, and tracks work through review and merge. **Inline** is the default: the current session implements one issue at a time. Choose **sessions** explicitly or through project configuration to launch independent workers in separate T3 Code or Paseo workspaces. Both modes retain the default limits of three open reviews and one active migration, and never merge without your instruction.

The selected harness resolves provider/model/options from its actual capabilities. Explicit choices and recorded selections are preserved; unavailable models are reported rather than substituted. Inline work uses the current conversation's model.

Every combination refreshes remote state on start/resume, worker reports and your messages. Compatible installed integrations can add automatic notifications, such as T3's GitHub watches. Without one, an external merge is noticed on the next activity; an idle conversation is not a background poller. Missing optional watches do not prevent GitLab/T3 or GitHub/Paseo work.

Run state records the full project, harness, workers, model choices and workspace paths. Switching to inline preserves existing workers. Legacy state is backed up and migrated without relaunching workers; changing the Git host or harness during active work requires an explicit migration decision. See [run-state migration](skills/run-it/run-file.md).

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
