# Project facts

it-stack skills know nothing about a project until it tells them. A project tells them in an `## it-stack` section of its `CLAUDE.md` (or `AGENTS.md`). Every skill reads that section before it runs a command.

## Format

Five keys, one bullet each. A value can run over several lines; keep it to what an agent needs to act.

```markdown
## it-stack

- **check:** `npm run check` (lint, types, unit tests). Must pass before any PR.
- **screenshots:** `npm run test:e2e:db`, then write `e2e/shots/current.shots.ts` (sign in with `signInAs(page, "member")`, seed rows with `seed.order()`), run `npm run shots`, and after pushing `npm run shots:publish`, which prints the PR's Screenshots table.
- **migrations:** `db/migrations/`, made with `npm run db:generate`. Only one open PR may add a migration; after rebasing onto a new one, delete yours and regenerate.
- **merge:** `--squash --delete-branch`. After merge, CI applies migrations to production; until then the new release can fail on new columns.
- **private:** screenshots show seed data only, never production. Security problems go to private advisories, never public issues or PRs.
```

## When a key is missing

- **check:** use the first of the `check`, `test`, `lint` scripts in `package.json` (or the language's usual test command), and write in the PR's Verification which command you assumed.
- **screenshots:** treat as `none`. Describe what you saw in the running app instead, and say there's no screenshot setup.
- **migrations:** look for a usual migrations folder (`migrations/`, `db/migrate/`, `prisma/migrations/`, `drizzle/`, `alembic/versions/`) and use it; a new file there means the change adds a migration. Found none: treat as "no migrations". Say which you assumed (in the PR's Verification, or to the owner in one line when no PR is involved).
- **merge:** `--merge --delete-branch`.
- **private:** never put secrets, real user data or security details in a PR, issue or commit; the repo may be public.

When the whole section is missing, use these defaults and suggest adding the section in the PR's Scope.
