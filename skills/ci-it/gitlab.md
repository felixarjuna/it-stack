# ci-it on GitLab CI

How the [shared rules](SKILL.md) map onto `.gitlab-ci.yml`. For stack recipes, the verification ladder, debugging and optimization, use GitLab's [`gitlab-ci-skill`](https://gitlab.com/gitlab-org/ci-cd/gitlab-ci-skill) (MIT, © GitLab Inc.) when available; it owns those details, and this file doesn't repeat them.

## Names and shape

- Stages are native: `stages: [build, test, deploy]`. Job names follow the convention (`build image`, `test ruby 1/3`); `needs:` builds the DAG across stages.
- Job names must not collide with reserved keywords (`image`, `services`, `stages`, `variables`, …).
- `parallel:` jobs get GitLab's own `1/3` suffix, which matches the variant rule; `parallel:matrix` variants show their values.
- Reuse: hidden jobs (`.test-base`) with `extends:`, `default:` for shared fields, `include:` for shared files, and CI/CD Catalog components.
- Pipeline purpose: a project usually has one `.gitlab-ci.yml`; separate purposes go into included files or child pipelines named for the purpose (`security`, `deploy`), gated with `workflow:rules:`/`rules:`.

## Rename dependants

| Changing | Breaks |
| --- | --- |
| job name | `needs:` and `dependencies:` in the same pipeline; `needs:project:job` and `needs:pipeline:job` elsewhere; artifact URLs (`jobs/artifacts/<ref>/download?job=<name>`); job badges; scripts that look jobs up by name |
| hidden job name | every `extends:` that names it |
| included file or component path | every `include:` that references it |
| child or downstream pipeline | the `trigger:` that starts it |

GitLab requires the whole pipeline rather than named jobs, so a rename rarely affects merge rules; still read Git host `project.requiredChecks` for project settings and external status checks.

## Security

- Use `CI_JOB_TOKEN` with the project's job-token allowlist kept narrow; deploy credentials are protected, masked CI/CD variables (or the external secrets integration), available only on protected refs.
- Pin `include:` and components to a release tag or SHA (`component: …/name@1.2.3`), never a moving branch or `~latest`.
- Never declare secret values under `variables:` in YAML.
- Untrusted values (`$CI_COMMIT_MESSAGE`, `$CI_MERGE_REQUEST_TITLE`, branch names) are quoted in scripts and never evaluated.
- Deploy jobs use `environment:` and `rules:` limited to protected branches or tags.

## Verify

1. With `gitlab-ci-skill` available: follow its verification ladder and report each tier as it says.
2. Otherwise run `glci lint` ([glci](https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci)), then `glci show` to check the graph matches the intended `needs:`.
3. No glci: `glab ci lint` for the changed file.
4. Nothing runnable: push the branch and read the pipeline through the Git host; say that no local lint ran.
