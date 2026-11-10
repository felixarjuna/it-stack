# ci-it: one set of CI conventions for GitHub and GitLab

Status: approved by the owner on 2026-11-10 with the recommended answer to each open question (add `project.requiredChecks`; CI skills task-scoped to the selected host; this repo's own CI rename is a follow-up). Implemented on feat/ci-it.

## Intent

The owner works on both Git hosts. On GitLab he uses GitLab's official [`gitlab-ci-skill`](https://gitlab.com/gitlab-org/ci-cd/gitlab-ci-skill) (MIT, © GitLab Inc.). GitHub has no official equivalent; the closest is [`authoring-github-workflows`](https://skills.sh/dotnet/skills/authoring-github-workflows) from `dotnet/skills` (MIT, Microsoft), which covers workflow YAML validity and a pinned, SHA256-checked `actionlint`.

`ci-it` holds the owner's CI conventions once, identical on both hosts, and routes to those two skills for platform depth. It does not copy their content: they keep evolving, and a copy would go stale. Short quotes with attribution are allowed where a rule needs one.

## Goals

- One naming convention, one pipeline shape and one set of safety rules for GitHub Actions and GitLab CI.
- Renames that never leave a dangling dependant (a `workflow_run` trigger, a required check, a badge, a doc).
- Every CI change is linted before it is shown or shipped.
- Least-privilege, pinned, secret-free pipelines by default.
- Optional use of the two upstream skills under it-stack's existing consent flow, with a working fallback when they are absent.
- A project can override the naming convention with one project fact.

## Non-goals

- Not a CI generator for every stack: the upstream skills own stack detection, recipes, caching and debugging depth.
- No translation between GitHub Actions and GitLab CI (GitLab's separate `github-actions-to-gitlab-ci` skill exists for that).
- No change to CI policy for reviews: `ci: required|optional`, `reviews.checks` and merge-it stay as they are.
- No branch protection or project settings changed without the owner's explicit yes.
- Applying the convention to a real repository. The first real use (below) is a separate PR in that repository.

## Layout

```
skills/ci-it/
  SKILL.md   shared rules, identical on both hosts; entry point
  github.md  mapping onto GitHub Actions; routes to authoring-github-workflows and actionlint
  gitlab.md  mapping onto GitLab CI; routes to gitlab-ci-skill, glci and CI lint
```

`SKILL.md` follows the shape of every entry point: platform setup link, optional dependency setup link, project facts, then the workflow. It reads only the host file for the selected Git host, the same way ship-it loads one adapter. It runs inline and creates no sessions.

`ci-it` touches CI files, not issues or reviews, so it needs no new Git host operations except one read (see Verification on the host below). The repository validator keeps `gh api`/`glab api` calls inside `skills/ship-it/platforms/`; ci-it's host files only name CI syntax and local lint tools (`actionlint`, `glci`, `glab ci lint`), which the validator already allows.

## Shared rules (SKILL.md)

### 1. Names

Taken from the GitLab skill's convention, applied to both hosts:

- **Job names** are short English phrases, verb first, lowercase: `lint code`, `build image`, `test python 3.11`, `deploy demo`. The name says what the job does to what.
- **Variants** get a suffix, never a different verb: `test ruby 1/3`, `test python 3.12`.
- **Pipeline/workflow names** are a short lowercase purpose: `ci`, `deploy`, `sast`, `security`, `terraform`, `schema drift`. Multi-word names use spaces; the file name uses hyphens (`schema-drift.yml`).
- Do not repeat the workflow's name in its jobs (`ci / test client`, not `ci / ci test client`).
- A project with its own convention states it in the `ci-naming` fact; ci-it follows that instead and never renames an established scheme without being asked.

### 2. Shape and structure

- Canonical order: build → test → deploy. A pipeline may omit stages but never reorders them.
- One workflow/pipeline per purpose. Do not merge unrelated purposes into one file to save YAML, or split one purpose across files without a trigger reason.
- Order with `needs:`, not with sleeps, manual retries or file order. A job lists exactly what it consumes.
- Reuse shared steps through the host's mechanism (hidden jobs + `extends:` / components on GitLab; reusable workflows / composite actions on GitHub) once the same block appears twice. Do not copy blocks between files.
- Match the project's existing patterns when adding a job; a new pattern needs a reason.

### 3. Safe renames

A rename is a change to a public identifier. Before renaming a workflow, pipeline or job, find every dependant and change them **in the same commit**:

| Dependant | GitHub | GitLab |
| --- | --- | --- |
| Other pipelines triggered by name | `on: workflow_run: workflows: [<name>]` | `needs:` / `needs:project:job`, `trigger:`, `extends:` on a renamed hidden job |
| Required checks | branch protection / rulesets list check names (the job `name:`) | jobs named in pipeline rules, policies or approval settings |
| Links and badges | workflow badge URL uses the **file** path | job badges and `jobs/artifacts/<ref>/download?job=<name>` use the job name |
| Scripts and docs | `gh workflow run <name>`, README, runbooks, AGENTS.md / CLAUDE.md | API scripts, README, runbooks |

Rules:

- Search the whole repository for the old name (case-insensitive, both the display name and the file name) before and after the change; zero stale hits after.
- Keep identifiers stable where only the display changes: on GitHub, rename the job's `name:` and keep its job id unless the id itself is wrong (ids are what `needs:` uses).
- Required checks and protection rules live outside the repository. ci-it lists the exact old → new names in the PR's Scope section and the order to apply them (a renamed required check otherwise blocks every PR waiting for a check that no longer runs). Changing them is a project-settings change: only with the owner's explicit yes, never by default.
- Live example from the first real use: the batterypass `deploy` workflow triggers on `workflow_run` of the workflow named `CI`. Renaming `CI` → `ci` without updating that trigger silently stops deploys.

### 4. Verify before presenting

No CI change is shown to the owner or shipped until it passes the host's linter (actionlint on GitHub; glci, or `glab ci lint` as fallback, on GitLab). If the linter cannot run, say exactly which tier did not run and why; never call unlinted YAML valid. "It parses as YAML" is not validation. After shipping, the first real run of a changed workflow is the final proof: report whether its jobs started, not just that the PR is green.

### 5. Security defaults

- Least privilege: GitHub workflows declare top-level `permissions:` (start from `contents: read`) and widen per job only where needed; GitLab jobs use the job token with the narrowest scope and protected variables for deploy credentials.
- Pin third-party code: GitHub actions by full commit SHA with the version in a comment; GitLab components and includes by release tag or SHA, never a moving branch.
- No secrets in YAML: reference the host's secret store; never echo secrets; mask GitLab variables.
- Untrusted input (PR titles, branch names, issue text) never goes unquoted into a shell line; pass it through an environment variable.
- Deploys run only from protected refs and only after the jobs they depend on.

### 6. Project fact

A new optional fact in the `## it-stack` section:

```markdown
- **ci-naming:** it-stack (default; verb-first job names, short lowercase workflow names). Or describe the project's own convention, e.g. `kebab-case job ids as names; workflows named after the team`.
```

Missing means `it-stack`. The fact only changes naming; rules 2–5 still apply. Added to `project-facts.md` with its default under "When a key is missing".

## Host mappings

### github.md

- GitHub has no stages: the shape lives in `needs:`, and the convention lives in each job's `name:`. Checks show as `<workflow name> / <job name>`, so `ci / test client`.
- Job id: kebab-case of the name (`test-client`); `name:` carries the readable form. Matrix jobs set `name:` with the variant suffix (`test python ${{ matrix.python }}`) so GitHub doesn't append `(3.11)` on its own.
- Reuse: reusable workflows (`workflow_call`) for whole jobs, composite actions for repeated steps.
- Rename dependants specific to GitHub: `workflow_run.workflows` matches the workflow **name**, badges match the **file**, required checks match the job **name**.
- Verification: route to `authoring-github-workflows` when available (it owns quoting traps and the pinned, checksum-verified actionlint download). Fallback: run an installed `actionlint`, or download a pinned release and verify its published checksum before running; never pipe an unverified binary.
- Required checks are read through a new read-only Git host contract operation (`project.requiredChecks`), implemented in the GitHub and GitLab adapters, so ci-it can list them without platform commands in skill text.

### gitlab.md

- Stages are native: `stages: [build, test, deploy]`, job names follow the convention, `needs:` builds the DAG across stages.
- Reuse: hidden jobs (`.test-base`) + `extends:`, `default:` for shared fields, CI/CD Catalog components pinned to a release.
- Rename dependants specific to GitLab: `needs:` and `dependencies:` reference job names, cross-project `needs:project`, artifact download URLs and job badges.
- Verification: route to `gitlab-ci-skill` when available (its verification ladder: lint, show, simulate, run). Fallback: `glci lint`, else `glab ci lint`, else push to a branch and read the pipeline; say which tier ran.

## Worked example: batterypass

The first real use (a separate PR in that repository, not this one) renames its workflows to:

| File | Workflow `name:` | Job names |
| --- | --- | --- |
| `ci.yml` | `ci` | `test client`, `test server`, `test e2e`, `scan secrets` |
| `sast.yml` | `sast` | `scan code` |
| `security.yml` | `security` | `scan dependencies`, `build sbom` |
| `terraform.yml` | `terraform` | `validate terraform` |
| `schema-drift.yml` | `schema drift` | `check schema drift` |
| `deploy.yml` | `deploy` | `build images`, `check deploy secrets`, `deploy demo` |

Same commit: `deploy.yml`'s `workflow_run.workflows: [CI]` → `[ci]`, badges and docs that name old workflows or jobs. The PR lists the old → new required-check names for the owner to update in branch protection at merge time.

## Dependencies

Add two rows to `dependency-setup.md`, same consent flow as Superpowers and Matt Pocock's skills — never installed without the owner's yes:

| Plugin | Expected skills | Purpose | Upstream source |
| --- | --- | --- | --- |
| `gitlab-ci-skill` | `gitlab-ci-skill` | GitLab CI authoring, validation and debugging | https://gitlab.com/gitlab-org/ci-cd/gitlab-ci-skill |
| `dotnet-skills` | `authoring-github-workflows` | GitHub Actions workflow validity and actionlint | https://github.com/dotnet/skills (`.agents/skills/authoring-github-workflows`) |

Both are standalone skill folders, not plugins: `gitlab-ci-skill` documents copying its folder into a skills path, and `authoring-github-workflows` sits in `dotnet/skills`' own `.agents/skills/`, outside its published plugins. The offer therefore names a standalone installation with exact folder, source ref and destination, as the existing flow already requires for Codex.

Task-scoped: these two are offered only when a task touches CI (ci-it, or another workflow that edits CI files), and only the one for the selected Git host. A GitHub-only owner is never offered the GitLab skill, and a bug fix that never touches CI never shows either. Suppression and "continue with fallbacks" work exactly as today.

`validate.ts`'s "references another plugin needs a fallback" check is extended to these two skill names, so ci-it must carry `## If it isn't installed`.

## Routing and integration

- `do-it`: new row after `fix-it`: "CI/CD pipelines, workflows, `.github/workflows`, `.gitlab-ci.yml`, renaming jobs or checks" → `ci-it`. A failing pipeline is still a bug and goes to fix-it first.
- `fix-it`: when the cause is in CI configuration, follow ci-it's rules for the fix (names, renames, lint).
- `ship-it`: when the diff touches CI files, run ci-it's verify step during Check and put rename instructions for required checks in Scope.
- `README.md`: add `ci-it` to the skill table and Credits (both upstream skills), update "twelve" to "thirteen". `plugin.json` 0.5.2 → 0.6.0.

## How it is verified

- `npm run validate`, `npm test` and `npm run typecheck` stay green; tests cover the extended fallback check and the `ci-naming` example.
- `docs/testing/ci-it.md`: read-only scenarios in the style of `docs/testing/dependency-setup.md`, e.g. rename with a `workflow_run` dependant; required check rename; linter unavailable; GitHub-only owner not offered the GitLab skill; project with its own `ci-naming`; upstream skill missing → fallback still lints.
- This repository's own `ci.yml` is not renamed in this PR (out of scope); noted as a follow-up.
- Not verified here: live runs against batterypass or a GitLab project, and the upstream skills' install routes on each client (resolved at offer time, as the consent flow requires).

## Open questions for the owner

1. **Required checks lookup**: add the read-only `project.requiredChecks` operation to the Git host contract and both adapters (recommended), or leave required checks as a manual "check branch protection" step?
2. **Task-scoped dependencies**: offer the two CI skills only on CI work for the selected host (recommended), or include them in the general one-time offer with the other four?
3. **This repo's own CI**: rename `CI` / `validate` here to `ci` / `check stack` in this PR, or leave it for a follow-up?
