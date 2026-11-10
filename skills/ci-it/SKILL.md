---
name: ci-it
description: Use when creating, changing, renaming or reviewing CI/CD pipelines - GitHub Actions workflows (.github/workflows) or GitLab CI (.gitlab-ci.yml). Holds one naming convention, pipeline shape, safe-rename and security rules for both hosts, lints before presenting, and routes to the upstream GitHub or GitLab CI skill for platform depth.
---

# ci-it

First follow [platform setup](../ship-it/platforms/README.md), once per task. Local work can continue with setup deferred; resolve required identity before remote operations.

First follow [optional dependency setup](../ship-it/dependency-setup.md), including when invoked directly. Reuse the result within this task. The two CI skills there are offered only for CI work and only for the selected Git host.

One set of CI conventions for both Git hosts. The rules below are identical everywhere; how they map onto each host lives in [github.md](github.md) or [gitlab.md](gitlab.md). Read only the one for the selected Git host (a repository with both CI systems reads both). This runs inline and creates no sessions.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)). A `ci-naming` fact other than `it-stack` replaces rule 1 for this project; rules 2–5 still apply.

## 0. Inventory first

Before changing anything, list the existing workflows/pipelines, their names, jobs, triggers, reused blocks and what depends on them. Match the project's existing patterns when adding a job; a new pattern needs a reason. Never rename an established scheme unless the owner asked for it.

## 1. Names

- **Job names** are short English phrases, verb first, lowercase: `lint code`, `build image`, `test python 3.11`, `deploy demo`. The name says what the job does to what.
- **Variants** get a suffix, never a different verb: `test ruby 1/3`, `test python 3.12`.
- **Workflow/pipeline names** are a short lowercase purpose: `ci`, `deploy`, `sast`, `security`, `terraform`, `schema drift`. Multi-word names use spaces; the file name uses hyphens (`schema-drift.yml`).
- Don't repeat the workflow's name in its jobs: `ci / test client`, not `ci / ci test client`.

This convention follows GitLab's [`gitlab-ci-skill`](https://gitlab.com/gitlab-org/ci-cd/gitlab-ci-skill).

## 2. Shape and structure

- Canonical order is build → test → deploy. A pipeline may leave a stage out but never reorders them.
- One workflow/pipeline per purpose. Don't merge unrelated purposes into one file, or split one purpose across files without a trigger reason.
- Order with `needs:`, never with sleeps, retries or file order. A job lists exactly what it consumes.
- Once the same block appears twice, reuse it through the host's mechanism (see the host file). Never copy blocks between files.

## 3. Safe renames

A workflow, pipeline or job name is a public identifier. Before renaming one, find every dependant and change them **in the same commit**:

- other pipelines that trigger on it or need it by name;
- required checks and protection rules (Git host `project.requiredChecks`, see [contracts](../ship-it/platforms/contracts.md));
- badges, artifact links and scripts that name it;
- README, runbooks, `AGENTS.md`/`CLAUDE.md`.

Search the whole repository for the old name, case-insensitive, both the display name and the file name, before and after. After the change there are zero stale hits. Keep identifiers stable where only the display changes (the host file says which is which).

Required checks live outside the repository. Put the exact old → new names in the PR's Scope, with the order to apply them: a renamed required check otherwise blocks every review while it waits for a check that no longer runs. Changing protection or project settings needs the owner's explicit yes, every time; a "merge" is not that yes. An `unknown` result from `project.requiredChecks` is reported as unknown, never as "none".

## 4. Verify before presenting

No CI change is shown to the owner or shipped until the host's linter passes (host file, section Verify). If a linter or tier cannot run, say which one, why, and how to unblock it. Never call unlinted YAML valid: "it parses as YAML" is not validation. After shipping, the first real run of a changed workflow is the final proof: report whether its jobs actually started, not only that the review is green.

## 5. Security defaults

- **Least privilege:** declare the narrowest token permissions at the top and widen them per job only where needed.
- **Pin third-party code** to an immutable reference (commit SHA or release tag, per host file), never a moving branch.
- **No secrets in YAML.** Reference the host's secret store; never echo or log secrets.
- **Untrusted input** (titles, branch names, issue text, commit messages) never goes straight into a shell line; pass it through an environment variable and quote it.
- **Deploys** run only from protected refs and only after the jobs they depend on.

## 6. Ship

Use [ship-it](../ship-it/SKILL.md). Its Verification names the linter and its result; its Scope lists renamed names and any required-check changes for the owner.

## Worked example

Renaming a project's GitHub workflows to the convention:

| File | Workflow `name:` | Job names |
| --- | --- | --- |
| `ci.yml` | `ci` | `test client`, `test server`, `test e2e`, `scan secrets` |
| `sast.yml` | `sast` | `scan code` |
| `security.yml` | `security` | `scan dependencies`, `build sbom` |
| `terraform.yml` | `terraform` | `validate terraform` |
| `schema-drift.yml` | `schema drift` | `check schema drift` |
| `deploy.yml` | `deploy` | `build images`, `check deploy secrets`, `deploy demo` |

`deploy.yml` triggers on `workflow_run` of the workflow named `CI`. The same commit changes that trigger to `ci`; otherwise deploys silently stop. Badges and docs that name the old workflows change too, and the PR lists old → new required-check names for the owner.

## If it isn't installed

The upstream skills are optional: `authoring-github-workflows` (dotnet/skills) on GitHub and `gitlab-ci-skill` (GitLab) on GitLab. When dependency setup leaves them unavailable, apply the rules above yourself and use the fallback linter in the host file. Say which linter tier ran. Never skip the lint because the skill is missing.
