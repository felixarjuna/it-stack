# Platform validation

## Automated checks

`npm test` exercises setup resolution, independent Git host/harness choices, project-fact preservation (including CRLF), malformed user configuration, complete/deferred settings, installer setup flags, noninteractive behavior, recursive resource copying, and conflict-safe installation. The validator checks packaged Markdown links, direct setup entry points and separation of platform commands from shared workflows.

These are package/configuration checks. The adapters are instructions, not an API client implementation; passing these tests does not establish live API compatibility.

## Behavioral scenarios

Use a fresh agent with the relevant installed skills and the following supplied facts, without access to design documents. Permit only read-only simulation unless a separate test repository is explicitly authorized. Record actual selected operations, prompts and blockers.

| Scenario | Required observable behavior |
| --- | --- |
| GitHub + T3 sessions | GitHub issue/review operations, T3 isolated workers; watch only if available |
| GitHub + Paseo sessions | GitHub operations, explicit Paseo workspaces; no T3 requirement |
| GitLab + T3 sessions | Full GitLab identity and GitLab operations; T3 workers without GitHub PR bridge |
| GitLab + Paseo sessions | GitLab operations and Paseo workers; no GitHub authentication requirement |
| GitHub + inline | Current session, no external launch or model catalog |
| GitLab + inline | Current session and GitLab operations, no external harness requirement |
| Self-managed host with nested project | Preserve hostname and encode full namespace; use project IID rather than global MR ID |
| Interactive first fix-it | Detect suggestions, offer project setup once, preserve existing choices |
| Direct unattended sort-it without a remote | No onboarding prompt or guess; report missing identity before API calls |
| Legacy pending authorization, changed harness settings, missing launch response | Preserve original workers and reservation; no automatic duplicate/replacement |
| Absent/failed CI and merge denied | No false green/merge claim; optional absent-CI policy is explicit |
| Stale reviewed head and dirty workspace | Inspect changed diff; retain dirty workspace and unresolved ownership |
| Incomplete review/diff pagination | Do not infer free slots or absence of migrations |
| Duplicate merged notification | Reconcile authoritative state; do not launch a second worker |

## Baseline (before refactor)

An independent read-only simulation found GitLab shipping directed to `gh`, Paseo sessions blocked by T3-required tools, missing platform onboarding, and unattended triage without a resolvable project. These concrete failures motivated the adapters and setup entry point.

## Limits

Live GitHub/T3, GitHub/Paseo, GitLab/T3, GitLab/Paseo and inline remote acceptance have not been executed in this environment. No test issues, reviews, merges, credentials, harness sessions or watchers were created. Installed platform versions must pass their documented capability checks. Activity-driven refresh is the universal baseline; automatic idle wake-ups are not promised.
