# Project facts

it-stack skills know nothing about a project until it tells them. A project tells them in an `## it-stack` section of its agent instructions: `AGENTS.md` for Codex, `CLAUDE.md` for Claude Code. Follow the applicable instructions for the current directory; if the section lives in the other file, read that section too. Every skill reads it before running a project command.

## Using skills across clients

The same skill folders work in Codex and Claude Code. In Codex, the owner can type `$do-it`, `$fix-it`, `$build-it`, or `$run-it`; in Claude Code, use the installed slash commands. When a workflow says to use another it-stack skill, read the sibling `../<name>/SKILL.md` and follow it in the current session. This does not require a separate agent.

For optional skills such as `superpowers:test-driven-development` or `mattpocock-skills:grilling`, use the client's available skill catalog and invocation mechanism. In Codex, read the listed `SKILL.md` for the matching skill (names may omit the plugin prefix); do not assume a Claude `Skill` tool exists. For skills not in the catalog, check project `.agents/skills`, user `~/.agents/skills`, and `~/.codex/skills`. In Claude Code, also check the installed plugin cache, such as `~/.claude/plugins/cache/*/mattpocock-skills/*/skills/**/<name>/SKILL.md`, choosing the newest installed version by numeric version order. Resolve supporting references beside the selected skill. If an optional skill is unavailable, follow [optional dependency setup](dependency-setup.md) once per task to offer installation with explicit consent. Use the calling skill's inline fallback after a decline, unsupported installation route, or failed installation; never require another client or install without consent.

## Format

For visual skills requested by stack-it or prove-it, use their direct fallbacks without installation prompts. Direct stack-it calls are exempt from generic dependency setup; other workflows reuse their existing setup result. See stack-it's fallback for coverage reporting.

Project workflow facts plus independent Git host and Harness settings, one bullet each. A value can run over several lines; keep it to what an agent needs to act.

```markdown
## it-stack

- **git-host:** auto (or github/gitlab; custom host identity comes from the selected remote).
- **harness:** auto (or t3/paseo; independent of Git host).
- **setup:** complete (or deferred; first-use onboarding only).
- **check:** `npm run check` (lint, types, unit tests). Must pass before any PR.
- **screenshots:** `npm run test:e2e:db`, then write `e2e/shots/current.shots.ts` (sign in with `signInAs(page, "member")`, seed rows with `seed.order()`), run `npm run shots`, and after pushing `npm run shots:publish`, which prints the PR's Screenshots table.
- **migrations:** `db/migrations/`, made with `npm run db:generate`. Only one open PR may add a migration; after rebasing onto a new one, delete yours and regenerate.
- **merge:** squash. After merge, CI applies migrations to production; until then the new release can fail on new columns.
- **delete-branch:** true.
- **ci:** required (optional permits absent CI only when local checks pass).
- **private:** screenshots show seed data only, never production. Security problems go to private advisories, never public issues or PRs.
- **execution:** inline (optional; use `sessions` to request separate sessions through the selected harness).
- **design-system:** `docs/design-system.md` (optional; stack, component sources, tokens, interaction patterns and visual acceptance).
- **sessions:** current provider and model (optional; or name a specific provider instance, model and supported options for run-it).
```

## When a key is missing

- **check:** use the first of the `check`, `test`, `lint` scripts in `package.json` (or the language's usual test command), and write in the PR's Verification which command you assumed.
- **screenshots:** treat as no configured capture command. For visible changes, use an available browser to capture and inspect the running app, describing the method. If unavailable, explicitly report rendered verification as unverified; endpoint success is not visual proof. Follow prove-it.
- **migrations:** look for a usual migrations folder (`migrations/`, `db/migrate/`, `prisma/migrations/`, `drizzle/`, `alembic/versions/`) and use it; a new file there means the change adds a migration. Found none: treat as "no migrations". Say which you assumed (in the PR's Verification, or to the owner in one line when no PR is involved).
- **merge:** project-default; see [operation contracts](platforms/contracts.md). Existing GitHub projects with no explicit method retain the legacy merge method when compatible.
- **delete-branch:** true.
- **ci:** required; absent or unknown CI is not success.
- **git-host / harness:** follow [platform setup](platforms/README.md); Auto detects independently. No harness is required for inline work.
- **private:** never put secrets, real user data or security details in a PR, issue or commit; the repo may be public.
- **execution:** inline. Preserve a recorded run mode on resume; an explicit owner choice overrides it.
- **design-system:** reuse an existing equivalent contract, otherwise `docs/design-system.md`. Follow stack-it for new or affected web interfaces; backend-only work does not need a visual contract.
- **sessions:** resolve current provider/model/options through the selected harness adapter. Preserve explicit choices and recorded run selections; unavailable choices require a decision, never silent substitution. See [model contract](platforms/contracts.md).

When the whole section is missing, use setup-it for first-use platform choices and these workflow defaults for independent local work. Do not guess remote identity. Existing GitHub merge flag strings remain accepted by the GitHub adapter only.
