# GitLab adapter

Implements the [Git host contract](../contracts.md) with `glab` and the GitLab v4 API, for GitLab.com and self-managed hosts. Independent of harness. Check installed `glab api --help` and authentication for the selected hostname. All requests use `glab api --hostname H --method METHOD ENDPOINT`; never rely on the working directory's default host.

## Project identity and requests

Resolve `GET projects/<encoded-full-project-path>` first. Encode the complete namespace as one path segment (e.g. `team/sub/app` → `team%2Fsub%2Fapp`), not just the last two components. Retain numeric project `id` as P, `path_with_namespace`, `web_url`, `default_branch`, `merge_method`, `squash_option` and applicable pipeline/discussion rules. Do not confuse issue/MR `iid` (project-local number) with global `id`.

Write request bodies as exact JSON to a temporary file and pass `--input FILE`; never interpolate multiline descriptions in shell commands. Explicit GET prevents fields from changing the method. For list endpoints add `per_page=100` and `--paginate`; process every returned page. Confirm installed flags; older GitLab versions may lack fields/endpoints and must report unknown rather than infer success.

| Operation | Method and endpoint, JSON fields where needed |
| --- | --- |
| `issues.list` | GET `projects/P/issues?state=opened&per_page=100` |
| `issues.read` | GET `projects/P/issues/N`, plus paginated `projects/P/issues/N/notes` |
| `issues.create` | POST `projects/P/issues`, `{title, description}` |
| `issues.update` | PUT `projects/P/issues/N`, `{description}` preserving original content |
| `issues.comment/close` | POST `projects/P/issues/N/notes`, `{body}`; PUT `projects/P/issues/N`, `{state_event:"close"}` |
| `reviews.list` | GET `projects/P/merge_requests?state=opened&per_page=100`; GET paginated `projects/P/merge_requests/N/diffs` for paths |
| `reviews.read` | GET `projects/P/merge_requests/N`; retain `sha`, `source_project_id`, branches, `state`, `draft`, `web_url`, `detailed_merge_status`, `head_pipeline`, `blocking_discussions_resolved` |
| `reviews.create` | POST `projects/P/merge_requests`, `{source_branch,target_branch,title,description}`; for forks supply the documented source/target project mapping explicitly |
| `reviews.update` | PUT `projects/P/merge_requests/N`, `{description}` |
| `reviews.comments` | GET paginated `projects/P/merge_requests/N/discussions` (notes, resolved flags and threads) |
| `reviews.checks` | read MR, GET `projects/P/merge_requests/N/pipelines`, and GET `projects/P/merge_requests/N/approval_state` where supported; inspect the relevant pipeline's jobs as needed |
| `reviews.merge` | PUT `projects/P/merge_requests/N/merge`, `{sha,squash,should_remove_source_branch}` after the checks below |

Find existing open MRs by source project/branch and target before creation. A lost response requires readback before retry. Bodies use `Closes #N` in the same project; retain full URLs across projects and confirm configured closing behavior. Present MR references as `!N`, not issue `#N`.

## CI, approvals, and merge

Use the MR's latest applicable pipeline, not an unrelated green branch pipeline. Establish its relation to the current MR head; merged-result pipelines may have a synthetic SHA, so verify through the MR pipeline relationship rather than equating every pipeline SHA with `sha`. A stale/unknown relationship is unknown. Only successful applicable CI is passed; pending/manual waits, failed/canceled blocks, skipped/absent requires the contract's explicit no-CI policy. Check approvals and unresolved discussions separately. Where approvals API is unavailable, require an authoritative equivalent from server mergeability; a permission error alone proves nothing.

`detailed_merge_status: mergeable` plus satisfied current CI/project rules is eligible. Checking/unchecked, draft, conflicts, blocked status, unknown or unavailable requirements prevent merge. Re-read the head immediately before submitting expected `sha`; a mismatch requires renewed inspection. Do not send auto-merge/merge-when-pipeline-succeeds flags or bypass approvals.

GitLab controls merge topology in project `merge_method`. `project-default` respects it and squash policy. `squash` requests `squash:true` only if allowed; `merge` requires compatible merge-commit policy without mandatory squash. A per-MR `rebase` request is not equivalent to GitHub's rebase merge: report incompatibility and ask for a supported policy. Never change project settings to fulfill a merge request. Legacy GitHub CLI flags must be translated with owner confirmation, not forwarded.

After PUT, GET the MR again. Only `state: merged` is success; conflicts, permission failures or a queued result leave the slot occupied. Confirm requested branch cleanup in the source project; retain branches when deletion is denied or ownership is unclear. Diff limits/overflow prevent concluding that no migration exists; use a full local diff against fetched MR refs or report incomplete inspection.

Sources: [glab API](https://docs.gitlab.com/cli/api/), [issues](https://docs.gitlab.com/api/issues/), [merge requests](https://docs.gitlab.com/api/merge_requests/).
