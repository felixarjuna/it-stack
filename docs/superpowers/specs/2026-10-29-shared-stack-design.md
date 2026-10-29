# Composable it-stack across Git hosts and harnesses

Status: approved by the owner; implemented on feat/composable-platforms. See the implementation plan and docs/testing/platforms.md for verification and limits.

## Intent and decisions

Maintain one open-source skill stack whose users can independently choose their Git host and harness. The owner chose shared skills with adapters over separately maintained stacks and explicitly rejected personal Home/Work categories. GitHub with T3 Code and GitLab with Paseo are motivating examples, not privileged pairings. The owner's Paseo agents currently run directly in WSL with GitLab access; sandbox integration is outside this change.

Retain the existing skill entry points and workflow: plan issues, implement, verify, publish reviewable changes, and continue a backlog. Only an explicit owner instruction authorizes merging. Git host, harness, and underlying coding agent are separate choices.

## Approaches

Separate stacks for particular platform combinations would duplicate workflow rules and fixes. The chosen approach shares those rules and moves platform operations into independently composable adapters. No personal presets or hard-coded platform pairings. Initially cover GitHub and GitLab with either T3 Code, Paseo, or inline execution. This is a refactoring of a Markdown skill package, not a new orchestration service.

New Git hosts or harnesses should require a new adapter implementing the documented contract, capability declaration, and conformance scenarios, without changing shared workflow rules or existing adapters. This extensibility does not imply unimplemented platforms already work. Publish support and live validation by capability and combination.

## Configuration

Extend the existing `## it-stack` project facts in AGENTS.md or CLAUDE.md:

```markdown
- **git-host:** gitlab
- **harness:** paseo
- **execution:** sessions
```

`git-host` selects repository operations and `harness` selects external session operations. Either choice may be changed independently for a new run. Retain check, screenshots, migrations, private, design-system, and session model preferences. Execution remains independently configurable and defaults to inline; selecting a harness alone does not authorize worker launches. Inline execution does not require a harness selection.

Resolve each choice from explicit task instructions, then explicit project facts, then unambiguous environment detection. An active run retains its recorded settings on resume unless the owner changes them. Report conflicts rather than redirecting existing work. Infer the git host from the selected Git remote and available authenticated tooling, and the harness from the current environment when unambiguous. Preserve existing GitHub/T3 behavior. Ambiguous remotes or unavailable requested capabilities require clarification; do not silently substitute platforms. Detect custom hosts through explicit configuration or authenticated tool metadata, not hostname guesses alone.

Record the full git host hostname, project path, selected remote, and default branch. Support self-managed GitLab and nested namespaces. Keep tokens in the tools' existing authentication mechanisms. Configuration contains no credentials.

## Guided setup

Use the user-facing labels **Git host** and **Harness**, with configuration keys `git-host` and `harness`. Explain Harness as “where your coding sessions run,” with T3 Code and Paseo as examples; execution in the current session remains available independently. The underlying coding agent and model remain separate settings.

Provide a `setup-it` entry point, plus a shared first-use check used by every directly invoked workflow. When an interactive standalone installer can run the same setup, offer it after installation; otherwise display the setup entry point. Do not assume native plugin installation or file copying can execute an interactive skill. First-use setup is the portable guarantee, not an unverified post-install hook.

Inspect existing project facts, selected remote, authenticated tool metadata, and current harness before asking. Show detected suggestions, then let the user confirm or change Git host and Harness in one short setup interaction. Allow Auto and configuring later; do not force a harness for inline work. Ask for a custom GitLab hostname only when needed and not already known. Never request credentials in chat.

Keep configuration project-scoped by default: write or update only the it-stack keys in the applicable project instruction file, preserving unrelated content. If installation occurs outside a project, offer user defaults in `~/.it-stack/config.json`, initially Auto for both choices, or defer setup until first use in a repository. State the destination before saving. Global preferences are fallbacks, not a restriction on every project or every client using the installed skills.

For new work, resolve explicit task choices, project facts, unambiguous environment detection, then user defaults. A default conflicting with the detected repository or current harness is not applied silently. Existing run-state compatibility rules still govern resumed work. Record completed or deferred setup at the selected scope; do not repeat onboarding on every command. Explicit `setup-it` invocation can revisit it. A newly detected conflict or a required capability missing for the requested operation can still require clarification.

Noninteractive installers accept explicit settings or skip setup without hanging. Delegated workers inherit the resolved configuration from their control room and never prompt or rewrite setup. An unattended task with unresolved required settings reports the missing configuration and does not guess or perform dependent remote actions. Skipping setup never blocks independent local work.

Add installer and first-use scenarios for detected settings, manual overrides, no repository, custom GitLab hosts, global/project conflicts, repeated invocation, direct skill invocation, noninteractive use, and delegated execution. Update installation packaging and skill counts for the new setup entry point. Do not change or duplicate optional dependency installation consent: platform setup and dependency setup are distinct.

## Package structure and boundaries

Keep entry-point skills under `skills/<verb>-it/`. Put shared contracts and adapters under `skills/ship-it/platforms/`, beside the existing shared project facts, so current installations that copy complete skill directories retain all references. Document the shared role of this directory. Proposed files:

- `README.md`: resolution and capability checks.
- `contracts.md`: git host, harness, and run-state operations.
- `compatibility.md`: capability matrix, configuration examples, and adapter contribution guide.
- `git-hosts/github.md`, `git-hosts/gitlab.md`.
- `harnesses/t3.md`, `harnesses/paseo.md`, `harnesses/inline.md`.

Load only the selected adapters. Shared skills describe workflow intent and outcomes; executable `gh`, `glab`, T3, and Paseo instructions live in adapters. References and illustrative configuration may name platforms elsewhere. Refactor all affected skills, including planning, sorting, splitting, building, shipping, merging, and backlog execution; do not limit the work to run-it.

Markdown contracts are sufficient initially. Add small TypeScript helpers only where repeatable normalization or state handling warrants executable code. Do not create a daemon, general plugin framework, or parallel copies of the skills.

## Git host contract

Cover project identity/default branch, paginated issue listing and issue read/create/update/comment/close, review lookup/create/update, review comments, CI status, conflicts, merge eligibility, merge, and confirmed remote branch cleanup. Use gh for GitHub and glab plus the GitLab API where needed. Verify actual commands and response fields during implementation.

Normalize review identity as git host + host + project + number + URL + source branch + head commit. Present GitHub objects as PRs and GitLab objects as MRs. Preserve the existing briefing and verification content, using the host's issue-closing syntax and configured screenshot publication method.

Keep CI state, review approval requirements, and mergeability distinct. Pending, failed, absent, inaccessible, and unknown checks must not collapse into green. An absent pipeline follows an explicit project policy; an unknown status blocks merge. Recheck the current head and platform merge requirements immediately before merging, using expected-head protection when supported. Behavior changes after approval require renewed owner approval under the existing merge-it rules.

Replace CLI-specific merge flags in new configuration with semantic method and branch-cleanup choices. Preserve legacy GitHub merge flags for GitHub. Do not pass them to GitLab or silently reinterpret unsupported options. Respect project-enforced merge strategies and report incompatible requests.

## Harness contract

Cover identify-current-session, discover capabilities, resolve model/provider/options, create isolated workspace, launch, list/inspect/read, message, and release workspace. Keep platform IDs opaque and qualify them with harness and host/daemon identity. Preserve current T3 semantics in its adapter.

Paseo uses its supported CLI or MCP operations after checking installed capabilities. Explicitly create/place each worker in its own worktree: Paseo's default child-agent placement can reuse the parent workspace. Persist full agent/workspace IDs and actual paths. A lost launch response requires discovery before retrying. Never launch a replacement just because a response was missing.

Keep model selection independent of the harness. Preserve explicit model choices, otherwise use the existing selection policy where resolvable. Never guess model identifiers, substitute providers, or transfer T3 option shapes directly to Paseo. Record normalized model intent alongside harness-specific resolved values. Capability discovery is not authorization to spawn workers.

Inline remains supported without an external harness. Cleanup requires a released worker, clean workspace, and supported platform cleanup operation; preserve work when ownership or status is unknown.

## Events and continuation

Separate git host observations from harness notifications. Every combination has the same baseline: reconcile git host state when the control room starts, resumes, receives a worker message, or receives an owner message. Optional integrations, such as T3's existing GitHub watches, are enabled only when the selected git host and harness advertise compatible capabilities. Unsupported optional watches must not prevent the baseline workflow for GitLab/T3 or GitHub/Paseo. State explicitly when automatic external-merge wake-ups are unavailable.

Do not promise unattended continuation while an idle control room has no event source. A verified runtime watch capability can be used, but building a webhook service or installing a background polling job is outside this first change. Active, bounded waits may observe pending checks. All event delivery is reconciled against current git host state before action; duplicate notifications cannot duplicate launches or merges.

## Durable run state and compatibility

Version `.it-stack/run.md`. Retain readable Queue, Running, Questions, and Done sections and the existing three-review/one-migration defaults. Add resolved git host host/project/remote, harness identity, control-room owner, execution authorization, and observation mode. Worker rows retain harness ID, workspace ID/path, branch, issue identity, review identity, plan, and status. Prefer full URLs over ambiguous bare numbers.

The control room alone writes scheduling state; workers report through their harness. Workers receive the absolute run-state location because separate worktrees do not share ignored files. Unknown or conflicting ownership requires explicit takeover before scheduling. If the state location is unavailable, do not invent fresh state and launch duplicate work.

Read legacy state as GitHub/T3 only where its identifiers establish that mapping; preserve existing workers, model choices, and pending launch authorization. Back up before migration and preserve unknown fields. Do not switch the git host or harness of active work on a configuration change. Require the run to finish, or an explicit migration decision. Existing inline rows stay inline.

## Scope and validation

Deliver updated skills, adapters, project-fact examples, migration documentation, installation packaging, and validation coverage. No sandbox transport, additional Git hosts, new model defaults, automatic merges, public artifact hosting, or background infrastructure.

Validate package references and installation from a clean destination. Run existing typecheck, tests, and skill validation. Cover all six initial combinations: GitHub and GitLab, each with T3, Paseo, and inline execution. Include self-managed GitLab with nested groups, wrong/unavailable adapters, pending/failed/missing CI, merge permission failures, duplicate launch recovery, legacy resume, active-run configuration changes, and clean/dirty workspace cleanup. Verify missing optional watches preserve baseline operation across combinations. Check that shared workflows no longer embed platform commands and that both installations include adapters. Adapter conformance scenarios should be reusable for future contributions.

Use mocked/read-only scenarios first. Report live acceptance separately for each combination; passing fixtures is not evidence of tested authentication, notifications, review creation, or merging in a user's environment. Do not publish test issues, reviews, or merges without task authorization. Implementation may choose exact internal field names and helper boundaries while preserving these contracts.

## Evidence

- Existing project configuration: skills/ship-it/project-facts.md.
- Existing integration points: ship-it, merge-it, run-it, run-it/run-file.md, and scripts/install-codex.ts.
- Paseo CLI documentation: https://paseo.sh/docs/cli (explicit workspace placement, launch/list/read/message operations).

## Proposed calls for owner review

The owner requested guided setup and the terms Git host and Harness. These remaining choices are design recommendations, not prior owner requirements: keep inline as the default execution mode; preserve the current installation layout; use reconciliation on activity as the universal baseline with capability-based optional watches; defer sandbox transport and background watcher infrastructure. The owner explicitly requires independent platform choices for a general-purpose open-source project.
