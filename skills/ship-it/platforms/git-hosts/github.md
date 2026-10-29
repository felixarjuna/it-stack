# GitHub adapter

Implements the [Git host contract](../contracts.md) using `gh`. Independent of harness. Check `gh --version` and `gh auth status --hostname <host>`; use `--repo <host>/<owner>/<repo>` (abbreviated R below) for repository commands and `--hostname <host>` for API commands. Do not print tokens.

## Read and write operations

| Operation | Mapping |
| --- | --- |
| `project` | `gh repo view R --json nameWithOwner,url,defaultBranchRef`; use `gh api --hostname H repos/OWNER/REPO` for merge-method support |
| `issues.list` | `gh api --hostname H --paginate 'repos/OWNER/REPO/issues?state=open&per_page=100'`; exclude objects with `pull_request` |
| `issues.read` | `gh issue view N --repo R --json number,title,body,labels,url`; paginate `repos/OWNER/REPO/issues/N/comments` |
| `issues.create` | `gh issue create --repo R --title TITLE --body-file BODY` |
| `issues.update/comment/close` | `gh issue edit N --repo R --body-file BODY`; `gh issue comment N --repo R --body-file BODY`; `gh issue close N --repo R` |
| `reviews.list` | `gh api --hostname H --paginate 'repos/OWNER/REPO/pulls?state=open&per_page=100'`; paginate `repos/OWNER/REPO/pulls/N/files` for paths |
| `reviews.read` | `gh pr view N --repo R --json number,url,state,headRefOid,headRefName,baseRefName,isDraft,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup` |
| `reviews.create/update` | `gh pr create --repo R --head BRANCH --base BASE --title TITLE --body-file BODY`; `gh pr edit N --repo R --body-file BODY` |
| `reviews.comments` | paginate `repos/OWNER/REPO/issues/N/comments`, `repos/OWNER/REPO/pulls/N/reviews`, and `repos/OWNER/REPO/pulls/N/comments`; retain thread context |
| `reviews.checks` | `gh pr checks N --repo R`; inspect required checks and read review state; pending exit is not failure and absent checks are not green |

Paginated API output may contain multiple JSON documents; parse each page rather than assuming a single array. Match an existing review on source project/branch and target branch, including forks; a branch name alone is not identity. `Closes #N` closes an issue in the same project; use a full issue URL across projects. Preserve screenshot publication instructions from project facts.

## Merge

Read the current head, CI and mergeability. Required approvals/discussions and rules must be satisfied. Unknown/blocked state is not permission to try a bypass. For absent checks use the contract's explicit CI policy. For a configured merge queue, report queued state until a later read confirms merged; do not claim immediate success or launch dependent work.

Map squash → `--squash`, merge → `--merge`, rebase → `--rebase`. For project-default inspect enabled strategies; if more than one is possible and no preference exists, ask instead of accepting an interactive CLI guess. Legacy `--merge/--squash/--rebase --delete-branch` facts remain supported only here; reject unrecognized flags.

`gh pr merge N --repo R --match-head-commit SHA <method>`; append `--delete-branch` only when requested. Explicit `--repo` separates server merge from guarded local cleanup. Never add `--admin` or `--auto`. Read back `state` and head/merge details; only `MERGED` frees a slot. Branch deletion failure does not undo a merge: report cleanup pending. Local worktree cleanup belongs to the harness and shared merge workflow.

Sources: [GitHub CLI](https://cli.github.com/manual/), [merge flags](https://cli.github.com/manual/gh_pr_merge).
