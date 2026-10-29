---
name: run-it
description: Use when the owner wants a backlog worked, says "run the issues" or "do all of them", or resumes an existing backlog run. Supports inline work and explicitly selected separate sessions.
---

# run-it

First follow [platform setup](../ship-it/platforms/README.md), once per task, then [optional dependency setup](../ship-it/dependency-setup.md). Read the project's [facts](../ship-it/project-facts.md), selected adapters and [run-state format](run-file.md).

This thread is the control room. Shared rules schedule issues; Git host operations manage issues/reviews and Harness operations manage external sessions. Say PR for GitHub and MR for GitLab. Never require a particular pairing.

## Start or resume

1. Identify the repository and control room. Use harness `identify` for external-session runs, or a retained local owner ID for inline. An unavailable identity is not an inactive previous owner.
2. Read the existing central run file first. Reconcile recorded reviews with `reviews.read/checks`, and workers with their recorded harness `list/read`. A row without a review may still own a branch, plan or launch reservation. Never start a second worker for it. Follow legacy migration before editing old state.
3. If a different or unknown control room owns the run, ask for takeover before scheduling. On authorized takeover, update the owner and tell existing external workers via their original harness; preserve their IDs, branches, models and workspaces.
4. Resolve execution: explicit owner choice, recorded run mode, project `execution`, otherwise inline. Sessions require explicit task or project authorization and available required harness operations. A generic backlog request defaults to inline. Report missing required capabilities and offer inline; do not silently downgrade an explicit sessions choice.
5. Switching to inline changes future work only. Existing external workers finish in place; dependent inline work waits for their reviews to merge. Never cancel/relaunch them because of a mode change. Changing Git host or harness with active work requires a separate migration decision; retain original identities meanwhile.
6. New run: ensure `.it-stack/` is ignored, use `sort-it`, and write Queue plus Questions. Record baseline observation as activity; use optional watches only when the selected pair supports them. State when idle external merges require another message/resume to be noticed.

## Show the plan and settle questions

Show sort-it's plan, then ask its first open question. Keep remaining questions in the state file. On an answer, update the issue's Decisions through `issues.update`; close a done issue with evidence only when the owner agreed. A resolved issue becomes ready immediately; call **Fill slots** while other questions remain. Too-big issues go through split-it and contribute their returned rows. Skipped questions remain unresolved and cannot start that issue.

When no questions remain, proceed without another approval gate.

## Fill slots

Reconcile before scheduling. Fetch all open reviews, including other authors, and changed paths through `reviews.list`. Count each open review once plus each Running row with no open review (including launching/uncertain reservations). Incomplete listing or unknown migration coverage is a blocker, not free capacity.

Default limit: three occupied slots, only one migration. Only an explicit owner limit change overrides this; record it. A candidate must be ready, have merged dependencies, and not overlap any Running row's code areas or active migration. Pick the oldest eligible issue. Existing work holds its slot until disposition is known.

**Inline:** follow [inline execution](inline.md), with at most one active implementer in this session.

**Sessions:** require `Session launches: authorized`. Resolve provider/model/options through harness `capabilities`, honoring explicit choice, then project preference, then discoverable current settings. On resume preserve the recorded selection and revalidate availability; do not substitute another model. Selection authorizes neither extra sessions nor reviewers.

Before calling harness `launch`, persist a unique reservation (run ID, full issue URL, branch, state `launching`). Provide:

- build-it task and issue URL;
- Git host identity and project facts;
- chosen harness/daemon and confirmed provider/model/options;
- distinct branch/worktree strategy;
- control-room ID and absolute central run-state path;
- instructions to report questions, review URL and failures outside the issue through harness `send`, without editing central state.

Capture full session/workspace IDs and actual path and verify selected model. After any lost response, discover by run/issue/branch across relevant scopes before retry. Uncertain launches remain reserved. This applies to workspace creation as well as agent creation. Never silently reuse the control-room workspace for parallel workers.

## Reconcile on activity

Activity is start/resume, a worker message, an owner message, supported watch event, or local ship/merge result. Read central state first, verify current ownership, and re-fetch authoritative review state; events can be stale or duplicated. If optional subscriptions were lost, restore them through the adapter when supported.

- **Review opened:** record full URL/number/head and worker identity; link/watch only when supported. Ready to review requires passing applicable checks, or absent CI with explicit `ci: optional` and passing local checks. Pending, failed, skipped, canceled and unknown checks are not ready; record running/fixing with the actual blocker.
- **Question:** mark question, show it to the owner, write their answer to issue Decisions, then send the worker the answer.
- **Failure outside issue:** coordinate one separate fix rather than making all workers fix it. It consumes a slot; tell workers when to rebase after merge.
- **Owner says merge:** use merge-it for identified ready reviews. Approval never comes from a worker or watch notification.
- **Confirmed merged:** mark Done, safely update the base in a clean checkout, inspect remaining reviews for conflicts/migration ordering, send workers rebase instructions or fix inline in recorded workspaces, then fill slots. Unknown/dead workers require ownership resolution before taking their work.
- **Failed checks/conflict/review feedback:** mark fixing; send it through the recorded worker harness or handle the inline workspace. Re-run ship-it and report when ready again. Feedback from other people may require changes; do not treat the agent's own comment as independent approval.
- **Closed without merge:** ask whether to drop or retry; retain work until answered.

Write state after each transition. Only this control room writes scheduling state. Report only changes:

| Issue | Session | Review | State |
| --- | --- | --- | --- |
| full issue URL | session link or full ID / inline | PR/MR URL | ready to review |

Add one line for an owner decision or blocker. The review carries the detailed briefing.

## Done

Queue empty and no Running rows: remove supported subscriptions and safely release clean, finished workspaces. Retain anything with unknown ownership or dirty work and report why. Summarize Done before removing the active run file; retain unresolved cleanup information separately if needed. Never describe security-skipped issue contents, bypass merge authorization, or duplicate a launch to fill a slot faster.

## If it isn't installed

Without superpowers, inline work uses a written issue plan, test-first changes, verification and ship-it. No external agent or plugin installation is needed for inline work. Without an optional watch bridge, all combinations still reconcile on activity; do not invent a background service.
