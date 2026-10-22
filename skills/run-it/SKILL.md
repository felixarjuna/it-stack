---
name: run-it
description: Use when the owner wants the whole backlog worked ("run the issues", "do all of them"). Turns this thread into a control room - sorts the issues, shows the plan, asks the open questions one at a time, runs one T3 Code session per issue with at most 3 PRs open, and starts the next issue each time one merges. Requires T3 Code.
---

# run-it

This thread becomes the **control room**: the one place the owner talks to while many sessions build in parallel. The owner answers questions once, reviews PRs on the PR page, and says "merge" here (or merges on GitHub). Everything else keeps moving by itself.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## Requires T3 Code

No `t3_thread_launch` tool available? Say "run-it needs T3 Code; use build-it for one issue at a time here" and stop.

## Start or resume

1. Find this thread's id: `t3_thread_list` → `currentThreadId`.
2. `.it-stack/run.md` exists ([format](run-file.md))? **Resume:**
   - If the control room it names is another thread that isn't settled (`t3_thread_list`), ask the owner in one line whether to take over; two control rooms must never act at once.
   - Take over: write this thread's id into the file, and tell every Running session with `t3_thread_send` (`mode: "queue"`): "Control room thread is now <this id>. Send PR and question messages here, and link your PR to it."
   - For every Running row with a PR, `gh pr view <pr> --json state`: merged or closed → handle it as in **On wake-up**; open → `link_pull_request` (with this `threadId`) and `watch_pull_request`.
   - For every Running row without a PR, read its thread (`t3_thread_read`) for a PR or question you missed.
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

For `t3_thread_launch`, fill in the resolved values below. For delegated child agents, use `delegate_task` with `target: { providerInstanceId: "<resolved instance>", model: "<resolved model>", options: <resolved options> }`; use the tool's supported options format. This selection applies to replacement sessions and review agents too; it does not authorize additional agents or top-level threads. `run-it` explicitly runs one independent T3 session per issue; outside that request, use child delegation for subagents.

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

A wake-up is a PR event from a watch, a message from a session, or the owner talking. Read `.it-stack/run.md` first. Then check this thread is still active: if `t3_thread_list` shows it `settled` (a merge can settle a thread), `t3_thread_organize` `unsettle` it and `watch_pull_request` every open PR in Running again. Then handle what woke you:

- **"PR opened for #n: <url>"** from a session: `link_pull_request` and `watch_pull_request` it here; Running row gets the PR, state `ready to review` once checks are green.
- **"Check fails outside #n: …"** from a session: if several sessions report the same failure, fix it once yourself on its own branch and `ship-it` it as a separate PR (it takes a slot); then tell the sessions to rebase once it merges.
- **"Question on #n: …"** from a session: state `question`; forward it to the owner in one line. When they answer, add it to the issue's `## Decisions` and tell the session with `t3_thread_send` to continue.
- **Owner says "merge":** use `merge-it` for the PRs that are `ready to review`.
- **PR merged** (by merge-it or on GitHub): move the row to Done, `git pull` the default branch, then check every other open PR from this run: one that now conflicts, or whose migration is now out of order, needs a rebase (and, for migrations, regenerating per the `migrations` fact). Ask its session to do it with `t3_thread_send`; if the session is gone, do it yourself in its worktree. Then **Fill the slots**.
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
