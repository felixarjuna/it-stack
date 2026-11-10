# ci-it on GitHub Actions

How the [shared rules](SKILL.md) map onto `.github/workflows/`. For YAML validity and quoting traps, use the [`authoring-github-workflows`](https://skills.sh/dotnet/skills/authoring-github-workflows) skill from [dotnet/skills](https://github.com/dotnet/skills) (MIT, Microsoft) when available; it owns those details, and this file doesn't repeat them.

## Names and shape

- GitHub has no stages. The build → test → deploy shape lives in `needs:`; the naming convention lives in each job's `name:`. Checks show as `<workflow name> / <job name>`, e.g. `ci / test:client`.
- Workflow `name:` is the short purpose (`ci`, `schema drift`); the file uses hyphens (`schema-drift.yml`).
- Quote every job `name:`: `name: "test:client"`. Unquoted `test:client` is a valid plain YAML scalar (the colon isn't followed by a space), but quoting keeps it safe and readable.
- Job **ids** are invisible on the PR; they matter only to `needs:` and outputs. When renaming, keep the existing id and change only `name:`: changing ids only adds risk. A **new** job gets the kebab-case form of its name with the colon replaced by a hyphen: `test:client` → id `test-client`, `check:schema-drift` → `check-schema-drift`.
- Matrix jobs set `name:` with the variant suffix after one space, e.g. `name: "test:python ${{ matrix.python }}"` → `test:python 3.12`, so GitHub doesn't append `(3.12)` on its own.
- Reuse: reusable workflows (`on: workflow_call`, `uses: ./.github/workflows/<file>.yml`) for whole jobs, composite actions (`.github/actions/<name>/action.yml`) for repeated steps.

## Rename dependants

| Changing | Breaks |
| --- | --- |
| workflow `name:` | `on: workflow_run: workflows: [<name>]` in other workflows; `gh workflow run <name>` in scripts and docs |
| workflow file name | badges (`actions/workflows/<file>/badge.svg`), `uses: ./.github/workflows/<file>`, `gh workflow run <file>` |
| job `name:` | required status checks (rulesets and classic protection match the check name), docs that name the check |
| job id | `needs:`, `needs.<id>.outputs`, reusable-workflow outputs |

Prefer renaming `name:` and keeping ids. Treat `workflow_run` names as an exact match and confirm the trigger fired after the first run.

## Security

- Top-level `permissions: contents: read` (or `{}`); widen per job, e.g. `pull-requests: write` only on the job that comments.
- Pin third-party actions to a full commit SHA with the version as a comment: `uses: actions/checkout@<40-char sha> # v4.2.2`. First-party `./` actions need no pin.
- Secrets via `${{ secrets.NAME }}` into `env:`, never inline in `run:`; no `pull_request_target` checkout of untrusted code with secrets.
- Untrusted `${{ github.event.* }}` text goes into `env:` and is quoted in the shell, never interpolated into `run:`.
- Deploy jobs use a protected `environment:` and run only on the default branch or tags.

## Verify

1. With `authoring-github-workflows` available: follow its workflow (quoting review, then its pinned, checksum-verified actionlint).
2. Otherwise run an installed `actionlint` on the changed files: `actionlint -shellcheck= -pyflakes= .github/workflows/<file>.yml`.
3. No actionlint installed: download a pinned release from [rhysd/actionlint](https://github.com/rhysd/actionlint/releases), verify it against the release's published checksums file, then run it. Never run an unverified binary or pipe a download into a shell.
4. Nothing runnable: say actionlint did not run and why. The review's first run is then the only validation; report whether its jobs started.

After any rename, list required checks through Git host `project.requiredChecks` and compare them with the new job names.
