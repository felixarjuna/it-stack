# Project facts

it-stack skills know nothing about a project until it tells them. A project tells them in an `## it-stack` section of its agent instructions: `AGENTS.md` for Codex, `CLAUDE.md` for Claude Code. Follow the applicable instructions for the current directory; if the section lives in the other file, read that section too. Every skill reads it before running a project command.

## Using skills across clients

The same skill folders work in Codex and Claude Code. In Codex, the owner can type `$do-it`, `$fix-it`, `$build-it`, or `$run-it`; in Claude Code, use the installed slash commands. When a workflow says to use another it-stack skill, read the sibling `../<name>/SKILL.md` and follow it in the current session. This does not require a separate agent.

For optional skills such as `superpowers:test-driven-development` or `mattpocock-skills:grilling`, use the client's available skill catalog and invocation mechanism. In Codex, read the listed `SKILL.md` for the matching skill (names may omit the plugin prefix); do not assume a Claude `Skill` tool exists. For skills not in the catalog, check project `.agents/skills`, user `~/.agents/skills`, and `~/.codex/skills`. In Claude Code, also check the installed plugin cache, such as `~/.claude/plugins/cache/*/mattpocock-skills/*/skills/**/<name>/SKILL.md`, choosing the newest installed version by numeric version order. Resolve supporting references beside the selected skill. If it isn't installed, use the calling skill's inline fallback; don't require Claude Code or auto-install plugins to continue.

## Format

Five keys, one bullet each. A value can run over several lines; keep it to what an agent needs to act.

```markdown
## it-stack

- **check:** `npm run check` (lint, types, unit tests). Must pass before any PR.
- **screenshots:** `npm run test:e2e:db`, then write `e2e/shots/current.shots.ts` (sign in with `signInAs(page, "member")`, seed rows with `seed.order()`), run `npm run shots`, and after pushing `npm run shots:publish`, which prints the PR's Screenshots table.
- **migrations:** `db/migrations/`, made with `npm run db:generate`. Only one open PR may add a migration; after rebasing onto a new one, delete yours and regenerate.
- **merge:** `--squash --delete-branch`. After merge, CI applies migrations to production; until then the new release can fail on new columns.
- **private:** screenshots show seed data only, never production. Security problems go to private advisories, never public issues or PRs.
- **sessions:** current provider and model (optional; or name a specific provider instance, model and supported options for run-it).
```

## When a key is missing

- **check:** use the first of the `check`, `test`, `lint` scripts in `package.json` (or the language's usual test command), and write in the PR's Verification which command you assumed.
- **screenshots:** treat as `none`. Describe what you saw in the running app instead, and say there's no screenshot setup.
- **migrations:** look for a usual migrations folder (`migrations/`, `db/migrate/`, `prisma/migrations/`, `drizzle/`, `alembic/versions/`) and use it; a new file there means the change adds a migration. Found none: treat as "no migrations". Say which you assumed (in the PR's Verification, or to the owner in one line when no PR is involved).
- **merge:** `--merge --delete-branch`.
- **private:** never put secrets, real user data or security details in a PR, issue or commit; the repo may be public.
- **sessions:** in Codex, the current provider instance and model, confirmed through `orchestrator_capabilities`; in Claude Code, Claude Opus 5.5 (`claude-opus-5-5` on `claudeAgent`). See run-it's model selection steps. Explicit owner choices take priority over this fact.

When the whole section is missing, use these defaults and suggest adding the section in the PR's Scope.
