# it-stack: design

Date: 2026-10-22
Owner: Felix Arjuna (felixarjuna)
Status: draft for approval

## Intent

Felix wants to spend his time deciding, not supervising. Today an agent finishes a change and then asks "should I open a PR?", Felix reads results in chat, and a backlog of issues waits for him to start each one by hand. it-stack is his personal, public stack of agent skills (in the spirit of Lauren Tan's pstack) that turns that into:

- He says what he wants, or points at the backlog.
- Agents ask him every unclear question in one batch, then work.
- Work arrives as PRs he can judge in a minute from the PR page: a short briefing and screenshots.
- He says "merge" (or merges on GitHub) and the next piece of work starts.

Every skill is named `<verb>-it`, after `ship-it`, the first one, which already lives in PERKIWeb (`.claude/skills/ship-it/SKILL.md`).

## Goals

1. One installable Claude Code plugin, `it-stack`, in a public GitHub repo `felixarjuna/it-stack`, usable in any of Felix's projects.
2. A backlog runner (`run-it`) that sorts open issues, batches questions, launches one T3 Code session per issue in its own worktree, and keeps at most 3 PRs open at once without overlapping code or migrations.
3. Every finished change becomes a self-explaining PR (`ship-it`), opened without asking.
4. Reuse proven skills from other stacks by reference, not by copying.
5. Project-specific facts (check command, screenshot command, migration rules) live in each project, not in the stack.

## Non-goals

- Supporting other people's workflows. It's public so others can read and install it, but it's tuned to Felix.
- Replacing the skills it builds on (superpowers, mattpocock-skills, pstack ideas).
- Cursor or Codex support in the first version. Skills use the plain SKILL.md format so this stays possible later.
- Auto-merging. Nothing merges without Felix saying so.

## Anti-goals (failure even if it "works")

- Felix gets more to review, not less: PR floods, long chat reports, PRs without screenshots for visible changes.
- Agents guess instead of asking, or drip-feed questions from many sessions.
- Parallel PRs that conflict, or two migrations racing so drizzle silently skips one in production.
- Anything private leaks into the public repo or public PRs: secrets, member data, real screenshots, security issues (those stay in private advisories).
- A skill that only works in PERKIWeb.

## Constraints

- Claude Code plugin format: `.claude-plugin/plugin.json` plus `.claude-plugin/marketplace.json` so it installs with `/plugin marketplace add felixarjuna/it-stack` and `/plugin install it-stack@it-stack`.
- License MIT. Skills it builds on are MIT (superpowers by Jesse Vincent, mattpocock-skills); credit them in the README.
- Several referenced skills (Matt's `triage`, `to-tickets`, `wayfinder`, `to-questionnaire`) have `disable-model-invocation: true`, so the agent can't invoke them through the Skill tool. it-stack skills that need them locate the installed SKILL.md and follow it as written (see "Referencing other skills").
- The orchestration runs in T3 Code: `t3_thread_launch` with a `worktree` workspace strategy for one session per issue, `link_pull_request` and `watch_pull_request` for PR tracking. Outside T3 Code, `run-it` says it needs T3 Code and stops; it doesn't fake orchestration with subagents in the first version.
- Felix's PR review preferences, already proven in PERKIWeb PR #51: body sections Why / What changed / Scope / Verification, `Closes #n`, a Screenshots table at the end (phone 390px + desktop), chat gets only the link.

## The skills

Entry points Felix types are marked ★. The rest are mostly called by other skills, but can be typed too.

| Skill | Job | Builds on |
|---|---|---|
| ★ `do-it` | Router. Reads any request and hands it to the right skill below; for an unclear request, `plan-it`. | pstack's `poteto-mode` idea |
| `plan-it` | Turns an idea into an agent-ready issue: asks Felix what's unclear (one question at a time in chat, or batched when called by `run-it`), writes the brief into the issue. | superpowers `brainstorming`, Matt's `grilling` |
| `sort-it` | Reads every open issue, checks each against the code and sorts it: ready / needs Felix's answers / too big / already done (with evidence). Produces the single batched question message. | Matt's `triage`, `to-questionnaire` |
| `split-it` | Breaks work too big for one PR into small issues with "blocked by" links. | Matt's `to-tickets`, `wayfinder` |
| ★ `fix-it` | Bugs: reproduce, find the root cause, failing test first, fix, then `ship-it`. | superpowers `systematic-debugging`, `test-driven-development` |
| ★ `build-it` | One issue start to finish: branch, build with tests, `prove-it`, `ship-it`. What each `run-it` session runs. | yours |
| ★ `run-it` | Backlog runner (below). | yours |
| `prove-it` | Proves the change in the real running app as a user would, captures screenshots with the project's screenshot command, looks at every image before it's used. | pstack `prove-it-works` |
| `ship-it` | Check → commit → push → PR with briefing body and screenshots → link to thread → chat gets the URL. | generalised from PERKIWeb's |
| `merge-it` | On "merge": confirm CI green, merge, delete branch, update main, flag a pending migration deploy; tells `run-it` a slot is free. | yours |

### run-it in detail

1. **Sort.** Run `sort-it` over open issues (skip ones labelled or titled as security; those never go public).
2. **Ask once.** Send Felix one message with every question across all issues, most important first. Write his answers into the issues as a "Decisions" section so a session can work from the issue alone.
3. **Split.** Issues marked too big go through `split-it` after their questions are answered; the new small issues join the queue.
4. **Schedule.** Pick up to 3 ready issues such that no two are expected to touch the same area and at most one adds a database migration. The expected areas come from `sort-it`'s read of the code; record them in a status file.
5. **Launch.** For each, `t3_thread_launch` with a new worktree from `main` and the message "run build-it for #n". Each session ends in `ship-it` and posts its PR.
6. **Unexpected questions.** A session that hits a question nobody foresaw comments it on its issue, tells the parent, and pauses that issue; the parent forwards it to Felix in one line.
7. **Keep going.** See "The control room" below.
8. **Report.** In chat, only a short table: issue → session → PR → state (needs you / running / ready to review / merged).

### The control room

The thread where Felix ran `run-it` stays the control room for the whole run (decided by Felix):

- Every PR a `run-it` session opens is linked to the control-room thread (`link_pull_request` with that `threadId`; the launch message passes it to the session). The control room calls `watch_pull_request` on each, so T3 Code shows them beside it and wakes it on merges, failing checks and conflicts.
- Felix says "merge" in the control room (or merges on GitHub). `merge-it` runs there; a merge noticed on GitHub wakes the control room the same way.
- On every wake-up it: frees the slot, starts the next ready issue from an updated `main`, rebases open PRs that now conflict (or that carry a migration now out of order) before Felix reviews them, and reports changes with the short table.
- A session's question (step 6) reaches the control room through `t3_thread_read`/`t3_thread_wait` on the session thread; the control room forwards it to Felix.
- When the queue is empty and every PR is merged, it calls `unwatch_pull_request` on anything left and says the run is done.

State lives in `.it-stack/run.md` in the project (gitignored): queue, open slots, area and migration per running issue, thread IDs. If the control room is lost, a new `run-it` call rebuilds from it and `gh`, and becomes the new control room.

The builder must check two T3 Code behaviours early and adjust if they differ: whether a PR can be linked to the control room and the session thread at once, and whether a watch from the control room survives the session thread settling.

## Per-project setup

Each project provides an `## it-stack` section in its CLAUDE.md (or AGENTS.md) that the skills read:

- `check`: the command that must pass before a PR (`pnpm check`).
- `screenshots`: how to capture and publish screenshots, or "none" (PERKIWeb: write `e2e/screenshots/current.shots.ts`, `pnpm screenshots`, `pnpm screenshots:publish`).
- `migrations`: how migrations are made and the parallel rule (PERKIWeb: drizzle, one migration-adding PR in flight at a time).
- `merge`: merge method (`--merge`) and post-merge notes (e.g. `deploy:migrate`).
- `private`: what must never go public (seed data only in screenshots; security in advisories).

Without that section, skills fall back to sensible detection (package.json scripts, `gh` defaults) and say what they assumed in the PR's Verification.

PERKIWeb's own `ship-it` skill is replaced by the stack's, and its CLAUDE.md gets the `## it-stack` section. The screenshot tooling (`playwright.screenshots.config.ts`, `scripts/pr-screenshots.ts`) stays in PERKIWeb.

## Referencing other skills

it-stack doesn't vendor other stacks. A skill that builds on another says so and how to load it:

- Model-invocable skills (superpowers' `brainstorming`, `systematic-debugging`, `test-driven-development`; Matt's `grilling`, `tdd`): invoke through the Skill tool.
- User-only skills (Matt's `triage`, `to-tickets`, `wayfinder`, `to-questionnaire`): find the file under `~/.claude/plugins/cache/*/mattpocock-skills/*/skills/**/<name>/SKILL.md` (newest version) and follow it.
- If the referenced skill isn't installed, the it-stack skill carries a short inline fallback of the essential steps and tells Felix which plugin to install.
- pstack ideas (`prove-it-works`, the opening-a-pr briefing format) are restated in Felix's words with a credit link, since pstack isn't installed.

The README lists the recommended plugins: superpowers, mattpocock-skills.

## Repo layout

```
it-stack/
  .claude-plugin/plugin.json
  .claude-plugin/marketplace.json
  skills/<name>/SKILL.md      one folder per skill, extra files beside it when needed
  docs/specs/                 this document
  README.md                   what it is, install, the skill table, credits
  LICENSE                     MIT
```

## Decided by Felix

- Name `it-stack`, skills named `<verb>-it`.
- Public repo.
- PRs open without asking; Felix reviews on the PR page; never auto-merge.
- At most 3 PRs open at once, chosen to avoid overlapping code and racing migrations; the next issue starts when one merges.
- Questions come in one batch, not drip-fed. (Changed 2026-10-22 after the first run: the owner sees the plan first, then gets the questions one at a time, most important first; an issue starts as soon as its own questions are answered.)
- `run-it` runs as a control room: its thread watches every PR, Felix says "merge" there or on GitHub, and it starts the next issue itself.
- `run-it` is T3 Code only for now (Felix works mostly in T3 Code). A fallback with Claude Code background agents and a timer-based check can come later. Every other skill works in any Claude Code client and only links PRs to a thread when T3 Code is there.
- Build on Matt Pocock's and pstack's ideas rather than adopting either wholesale.

## Calls made by the designer (Claude), open to change

- Skill list and names beyond `ship-it`, `fix-it`, `run-it`.
- Plugin + marketplace in one repo; MIT.
- Reference other skills instead of copying; inline fallback when missing.
- Per-project `## it-stack` section in CLAUDE.md for project facts.
- Run state in a gitignored `.it-stack/run.md`.
- Security-related issues are skipped by `run-it`.
- The 3-PR limit and the one-migration rule count **every** open PR in the repo, including ones Felix or a `do-it`/`fix-it` session opened, because what they protect is Felix's review load and the migration order.
- `do-it`/`fix-it`/`build-it` on a single request start right away in the same session (like PERKIWeb #51). If 3 PRs are already open, or another open PR adds a migration and this one would too, they say so and ask before starting.
- Issues `sort-it` finds already done are listed in the batched question message as "closing these unless you object", with the evidence, and closed with a comment after Felix replies.

## Left to the builder

- Exact wording of each SKILL.md (keep them short; follow `mattpocock-skills:writing-for-agents`).
- How `sort-it` estimates an issue's code areas and whether it needs a migration.
- The format of `.it-stack/run.md`.
- README wording.

## Done when

- `felixarjuna/it-stack` exists, public, installable via the marketplace commands above.
- PERKIWeb uses the stack's `ship-it` and has its `## it-stack` section; its local `ship-it` skill is removed.
- One real `run-it` pass on PERKIWeb's backlog: issues sorted, one batched question message, at least one session launched and its PR opened with screenshots.
