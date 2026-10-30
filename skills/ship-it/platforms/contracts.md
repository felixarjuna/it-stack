# Platform operations

These are instruction contracts, not names of executable tools. Resolve an operation through the selected adapter. Use installed help/schema to check version-specific arguments. A failed, forbidden, truncated, or unavailable response is an error, never an empty successful result.

## Git host

| Operation | Input → required result |
| --- | --- |
| `project` | selected remote → kind, hostname, full project path, API ID, default branch, authentication/capabilities |
| `issues.list` | project → all open issues, paginated; read comments separately when needed |
| `issues.read` | project + issue number → body, labels, comments, URL |
| `issues.create/update/comment/close` | project + identity + exact text → confirmed issue state/URL; preserve existing body on update |
| `reviews.list` | project → all open PRs/MRs, source project/branch and changed paths (fetch separately where necessary) |
| `reviews.read` | project + number → state, URL, head SHA, source/target identity, draft, CI, approvals and mergeability |
| `reviews.create/update` | project + branch + base + title/body → confirmed URL and number; find existing open review before creation |
| `reviews.comments` | review → discussion/review feedback, paginated |
| `reviews.checks` | review + current head → CI `passed/pending/failed/absent/unknown`, approval requirements, conflicts and mergeability separately |
| `reviews.merge` | review + owner authorization + expected head + semantic method/cleanup policy → confirmed merged state, never merely queued |

Review identity is `{gitHost, hostname, project, number, url, sourceProject, sourceBranch, targetBranch, headSha}`. Use PR/# on GitHub, MR/! on GitLab; issues remain #. Use full URLs between projects. Approval to merge one review is not approval for another.

`passed` means the applicable checks actually succeeded for the reviewed revision. Pending waits; failed or unknown blocks. Absent CI requires explicit `ci: optional` and passing local `check`; default `ci: required`. Even with optional CI, failures block. Server approval, unresolved discussion, draft and protected-branch rules still apply. A skipped or canceled pipeline is not success. Re-read state/head immediately before merge; use expected-head protection. Never use administrative bypass or enable auto-merge merely to work around a block.

Merge configuration is semantic: `merge: squash|merge|rebase|project-default`, `delete-branch: true|false`. Keep deployment notes after the method. The Git host adapter maps only supported methods; unsupported requests need a decision. Legacy GitHub flag strings remain GitHub-only. Default is project-default and delete-branch true; legacy projects retain their documented GitHub default when migrating.

Use argument arrays or proper shell quoting, not interpolated issue bodies. Write JSON/body files through file tools or serializers for API writes. A lost response to create/merge requires readback/discovery before retry. Explicitly select repository/hostname on every remote operation. Git push uses the resolved remote, which need not be origin.

## Harness

| Operation | Input → required result |
| --- | --- |
| `identify/capabilities` | current environment → harness, daemon/host, full session ID; supported operations/models/options |
| `launch` | run ID + issue URL + model intent + unique branch + workspace strategy + task → full session/workspace IDs, actual path and resolved model selection |
| `list/read` | recorded host/session identity → current lifecycle and messages; enumerate all relevant scopes before retry |
| `send` | recipient + message → supported delivery, preferably noninterrupting; report weaker delivery semantics |
| `release` | stopped/released session + clean workspace → supported cleanup, or retained with reason |
| `link/watch/unwatch` (optional) | review URL + session → supported subscription/link, or unavailable |

Record model intent `{provider, model, options}` and adapter-specific resolved selection separately. Explicit task choice wins, then project session preferences, then the **model roles** below, then actual current-session defaults when discoverable. Never inherit the control room's model for a worker just because the control room runs on it. Confirm the exact choice against installed capabilities before launch. No silent model substitutions.

**Model roles (default).** Workers do the building; the strongest model is kept for coordination and final calls, and only used when it matters.

| Role | Claude | GPT (Codex) |
| --- | --- | --- |
| Sessions, implementers, reviewers, helpers | Opus (`claude-opus-5-5`) | Sol (`gpt-6.1-sol`) |
| Control room and final decider | Fable (`claude-fable-5-1`) | Astra (`gpt-6-astra`) |

- **Sessions** always launch on the worker model of their provider, whatever model the control room runs on.
- **Control room:** the run-it thread should run on the control-room model. A skill cannot switch its own model: if it runs on another one, say so in one line and continue.
- **Final decider:** spawn a one-off Fable/Astra agent only when a decision is important and hard to undo or genuinely disputed (two reviews disagree, a risky merge, a security or data-loss call, a non-additive migration). Routine checks, reviews and merges of green PRs stay on the worker model.
- Use the provider of the control room unless the owner names another. Match IDs against `capabilities` at launch time; when a named model is missing, pick no substitute and ask.

Before a launch, persist a `launching` reservation keyed by run/issue/branch. Supply this identity in task text and session title. After a lost response, discover by this identity before retrying; uncertain results keep the slot reserved. Do not guess a new ID. A child receives the resolved context and absolute central run-state path, but only the control room writes that state.

Optional watch bridges are capability-specific. Baseline for every combination is reconcile on start/resume, worker messages and owner messages. Say when idle external merges will be noticed only on the next activity. No hidden service or scheduler installation.
