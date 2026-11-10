# ci-it verification

Run these as read-only agent simulations against `skills/ci-it/` and the files it links. Simulated repositories, linters and installer results must not change the tester's real installation or any remote project. Passing simulations is not evidence of live runs on GitHub or GitLab.

## Scenarios and expected outcomes

1. **Rename `CI` → `ci` on GitHub; another workflow has `workflow_run: workflows: [CI]`.** The same commit updates the trigger. A case-insensitive search for the old name finds no stale hits afterwards. The PR names the trigger change.
2. **Rename job `test` → `test client`; `test` is a required check.** Git host `project.requiredChecks` lists it. The PR's Scope gives old → new and the order to apply them. Protection is not changed without the owner's explicit yes; "merge" alone is not that yes.
3. **`project.requiredChecks` returns 403 on classic protection.** Reported as unknown, never as "no required checks".
4. **GitHub job id vs name.** The rename changes `name:` and keeps the id, so `needs:` keeps working; an id change updates every `needs:` and output reference.
5. **actionlint not installed, no network.** The agent says actionlint did not run and why, does not call the YAML valid, and reports whether the first run's jobs started after shipping.
6. **GitHub-only owner, CI task, both CI skills missing.** The dependency offer lists only `authoring-github-workflows` (with source folder, ref and destination), never `gitlab-ci-skill`.
7. **Bug fix with no CI change.** No CI skill appears in the dependency offer.
8. **Project sets `ci-naming: kebab-case job names`.** New jobs follow kebab-case; security, rename and lint rules still apply; existing names are not "corrected".
9. **GitLab, `glci` missing, `glab` present.** Falls back to `glab ci lint` and says which tier ran.
10. **Adding a third-party action.** Pinned to a full commit SHA with the version as a comment; top-level `permissions:` stays read-only.
11. **Pull request title used in a `run:` step.** Moved into `env:` and quoted, never interpolated into the script.
12. **Repository with both `.github/workflows` and `.gitlab-ci.yml`.** Both host files are read and both linters run.

## Automated coverage

`npm test` checks that a skill naming either upstream CI skill carries an `## If it isn't installed` fallback and that `project-facts.md` documents `ci-naming` with a default. `npm run validate` checks ci-it's frontmatter, README entry, links and that no `gh api`/`glab api` calls appear outside the Git host adapters.
