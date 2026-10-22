---
name: run-it
description: Use when the owner wants a backlog worked, says "run the issues" or "do all of them", or resumes an existing backlog run. Supports inline work and explicitly selected separate T3 sessions.
---

# run-it

First follow [optional dependency setup](../ship-it/dependency-setup.md), including when invoked directly. Reuse the result within this task.

This thread becomes the **control room**: the one place the owner talks to while the backlog moves forward. The owner answers questions once, reviews PRs on the PR page, and says "merge" here (or merges on GitHub). Everything else keeps moving by itself.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## Choose execution mode

Use the owner's explicit choice, then the project's `execution` fact, then **inline**. Inline is the default for sequential or tightly coupled issues. Separate sessions are useful for independent work when the owner selects them. An explicit request to run this skill in separate-session mode authorizes one T3 session per eligible issue; a generic backlog request alone selects inline.

Record `Execution mode: inline` or `Execution mode: sessions` in `.it-stack/run.md`. Reuse it on resume. An older file with Running thread IDs and no mode is a legacy `sessions` run: preserve those workers, record that inferred mode with `Session launches: pending owner choice`, and do not launch additional sessions until the owner has selected sessions for the resumed run. Persist that pending value across every resume; only an explicit choice changes it to `Session launches: authorized`. For new sessions runs, record authorized only from the owner choice or their project execution preference; inline runs use `Session launches: disabled`. Other legacy files default to inline. A new explicit choice overrides the recorded mode.

When switching to inline with workers already running, record inline immediately, let those workers finish and retain their rows. Do not start replacement work or new sessions for their issues. Dependent inline work starts only after their PRs merge. Changing mode never cancels workers or authorizes merging.

**Inline:** read [Inline execution](inline.md). T3 is optional; use the current session with `superpowers:executing-plans` when available. **Sessions:** T3 launch/list/read/send tools are required. If unavailable, report that limitation and offer inline; do not silently change an explicit sessions choice.

Model selection below applies only when launching sessions or review agents, not to ordinary inline work.

## Start or resume

1. With T3, find this thread's id: `t3_thread_list` → `currentThreadId`. Without T3, use `Control room: local` and a `Run owner` session identifier; see [Inline execution](inline.md).
2. `.it-stack/run.md` exists ([format](run-file.md))? **Resume:**
   - If the control room it names is another thread that isn't settled (`t3_thread_list`), ask the owner in one line whether to take over; two control rooms must never act at once.
   - Take over: write this thread's id into the file, and tell every external Running session with `t3_thread_send` (`mode: "queue"`): "Control room thread is now <this id>. Send PR and question messages here, and link your PR to it."
   - For every Running row with a PR, `gh pr view <pr> --json state`: merged or closed → handle it as in **On wake-up**; open → link and watch when T3 tools are available; otherwise recheck on the next owner message.
   - For every external Running row without a PR, read its thread (`t3_thread_read`) for a PR or question you missed. For `inline` rows, inspect their recorded workspace, branch, plan and Git/PR state; do not message or launch a worker.
   - Never launch a second session for an issue that has a thread or a PR.

   Then go to **On wake-up**.
3. No file: make sure `.it-stack/` is in `.gitignore`, then **Sort**.

## Sort

Use `sort-it`. Write its table into the Queue of a new `.it-stack/run.md`.

## Show the plan, then ask one at a time

Send the owner `sort-it`'s **plan**, then the **first question** only. End your turn and wait. Keep the remaining questions in a `## Questions` list in the run file (open / answered), so a resumed control room knows where it was.

On each answer:

1. Write it into its issue's `## Decisions` (as `plan-it` does), or, for a "close as done?" question, close the issue with a comment pointing at the evidence.
2. A question the answer raised goes into the list, right after the current one if it blocks the same issue.
3. When an issue has no open questions left, move it to `ready` (or run `split-it` if it's `too big`: its slices join the Queue with the rows it returns, and the parent leaves the Queue with Done `#<parent> split into #a, #b`), and **Fill the slots** right away, so work starts while you keep asking.
4. Ask the next question, with a one-line note of what just changed ("#48 started").

No questions at all? Send the plan and go straight to **Fill the slots**. "Skip" or "later" on a question: move it to the end and ask the next; an issue with a skipped question doesn't start.

## Fill the slots

In **inline** mode use [Inline execution](inline.md) and start at most one implementer in this session. In **sessions** mode follow the launch procedure below only when `Session launches: authorized`; a pending or disabled value blocks new launches. Both modes obey the same slot, dependency, area-overlap and migration limits.

Repeat while a slot is free and the Queue has a launchable issue:

- **Slots:** fewer than 3 open PRs in the repo plus Running rows without a PR (every open PR counts, whoever opened it).
- **Launchable:** `ready`; everything it depends on is merged; its areas don't overlap a Running row's; and if it has a migration, no Running row or open PR adds one.

Pick the oldest launchable issue and launch it:

Resolve the session model before launching:

On a resumed run, reuse the recorded `Session selection` unless the owner explicitly changes it; validate it against the live catalog again. If an older run file has no selection, resolve one using the steps below before launching more sessions. Taking over the control room never changes models silently or restarts existing sessions.

1. Call `orchestrator_capabilities` for the live provider/model catalog and inherited settings. Search the catalog for a requested model if it isn't in the short list.
2. Use the owner's explicit provider/model/options choice first, then the project's `sessions` fact. Otherwise, **in Codex**, select `inheritedProviderInstanceId` and `inheritedModel` from that response; **in Claude Code**, keep the default Claude Opus 5.5 (`claude-opus-5-5` on `claudeAgent`). Never guess a Codex model ID or require a Claude subscription from Codex.
3. Confirm the exact provider and model are available. If the selection can't be resolved, report it and ask which model to use; don't silently substitute. When using the current provider and model, preserve `inheritedOptions`; explicit options override individual values. For a different provider or model, use its supported options rather than carrying over incompatible ones. Report unsupported requested options.
4. Set the resolved selection explicitly in `modelSelection`, including supported options, and check the returned selection against it. Record the choice in `.it-stack/run.md` so resumes and replacements keep it unless the owner changes it.

For `t3_thread_launch`, fill in the resolved values below. For delegated child agents, use `delegate_task` with `target: { providerInstanceId: "<resolved instance>", model: "<resolved model>", options: <resolved options> }`; use the tool's supported options format. This selection applies to replacement sessions and review agents too; it does not authorize additional agents or top-level threads. The owner-selected `sessions` mode runs one independent T3 session per issue. Inline mode does not authorize per-issue sessions; use child delegation for an independently justified review, respecting the selected model/options.

```
t3_thread_launch {
  title: "#<n> <issue title>",
  modelSelection: { instanceId: "<resolved instance>", model: "<resolved model>", options: <resolved options> },
  workspaceStrategy: { type: "worktree", baseRef: "<default branch>", branch: "<type>/<n>-<slug>", startFromOrigin: true },
  message: "Use the build-it skill for #<n>. Control room thread: <this thread id>. Link your PR to the control room and tell it with t3_thread_send when the PR is open, when you have a question, or when the check fails for a reason outside your issue (don't fix that yourself)."
}
```

Retain the returned thread id and follow preparation with `t3_thread_read` / `t3_thread_wait`. A launch has no retry key: after an error or lost response, inspect `t3_thread_list` before retrying so it doesn't create a duplicate session. Add a Running row with its thread id, state `running`. Then report.

## Report

Only when something changed, and only this:

```markdown
| # | Session | PR | State |
| --- | --- | --- | --- |
| 12 | [#12 Order notes](t3-thread://v1/<threadId>) | #40 | ready to review |
| 15 | [#15 Total rounding](t3-thread://v1/<threadId>) | – | running |
```

Plus one line for anything that needs the owner: "Waiting on you: review #40" or "Question on #19: …".

## On wake-up

A wake-up is a PR event from a watch, a message from a session, or the owner talking. Read `.it-stack/run.md` first and route `inline` rows through [Inline execution](inline.md). With T3, check this thread is still active: if `t3_thread_list` shows it `settled` (a merge can settle a thread), `t3_thread_organize` `unsettle` it and `watch_pull_request` every open PR in Running again. Then handle what woke you:

- **"PR opened for #n: <url>"** from a session: `link_pull_request` and `watch_pull_request` it here; Running row gets the PR, state `ready to review` once checks are green.
- **"Check fails outside #n: …"** from a session: if several sessions report the same failure, fix it once yourself on its own branch and `ship-it` it as a separate PR (it takes a slot); then tell the sessions to rebase once it merges.
- **"Question on #n: …"** from a session: state `question`; forward it to the owner in one line. When they answer, add it to the issue's `## Decisions` and tell the session with `t3_thread_send` to continue.
- **Owner says "merge":** use `merge-it` for the PRs that are `ready to review`.
- **PR merged** (by merge-it or on GitHub): move the row to Done, update the default branch only in a clean checkout (preserve uncommitted work), then check every other open PR from this run: one that now conflicts, or whose migration is now out of order, needs a rebase (and, for migrations, regenerating per the `migrations` fact). Ask its session to do it with `t3_thread_send`; if the session is gone, do it yourself in its worktree. Then **Fill the slots**.
- **Check failed or conflict on a PR:** state `fixing`; send its session the failure with `t3_thread_send` and ask it to fix and re-run `ship-it`.
- **Review comment or "changes requested"** on a PR (from anyone but this agent): state `fixing`; forward the comment to its session with `t3_thread_send`; it addresses it and re-runs `ship-it`. When it's green again, tell the owner it's ready for another look.
- **PR closed without merging:** ask the owner in one line whether to drop the issue or relaunch it.

Write the file, then **Report**.

## Done

Queue empty and nothing Running: `unwatch_pull_request` anything still watched, remove any session worktrees left behind (as `merge-it` does), tell the owner the run is finished with the Done list, and delete `.it-stack/run.md`.

## Rules

- Never merge without the owner saying so.
- Never work, describe or launch `security-skip` issues.
- Never launch two sessions for one issue. Keep to the limits even when the owner asks for "all of them": queue the rest and say so. Only an explicit "raise the limit to N" changes it; record it in the run file's `Limit:` line.
- Keep chat short: the table and what needs the owner. The PRs carry the details.

## If it isn't installed

Without superpowers, use the inline fallback in [Inline execution](inline.md): a written issue plan, test-first changes, verification and ship-it. No external agent or plugin installation is needed just to run inline.
