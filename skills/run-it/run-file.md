# Central `.it-stack/run.md` (version 2)

One control room owns scheduling state. Resolve its absolute path in the control-room checkout and pass that path to every worker; ignored files are not shared across worktrees. Workers send messages and do not edit the file. An unreachable central path is not permission to start another run. Put `.it-stack/` in `.gitignore`.

## Header

```markdown
# it-stack run
Version: 2
Run ID: <unique id retained across resumes>
State path: <absolute central path>
Git host: github | gitlab
Hostname: <host>
Project: <full namespace/project>
Project ID: <API identity>
Remote: <selected remote name>
Default branch: <branch>
Harness: t3 | paseo | none
Harness host: <daemon identity, no credentials>
Control room: <full session ID or local>
Run owner: <retained ownership ID>
Execution mode: inline | sessions
Session launches: authorized | pending owner choice | disabled
Model intent: <provider, model, options JSON, or not used>
Session selection: <harness-specific resolved JSON, or not used>
Observation: activity | supported-watch
Limit: 3 open reviews, 1 migration
Started: <date>
```

Record only actual resolved values, not alternatives from this template. Credentials never belong here. Each worker retains its own harness/host/model selection even when future execution changes.

## Tables

Running rows contain full issue URL, reservation ID, harness/host, full session ID (or inline/launching), full workspace ID (if managed), absolute path, plan path, branch, full review URL/number/head, code areas, migration flag and state. Human display may shorten IDs, persisted state may not. States: `launching`, `running`, `question`, `ready to review`, `fixing`; retain an explanation for unknown/uncertain state.

Queue rows contain full issue URL, state (`ready`, `needs answers`, `too big`), code areas, migration flag and full dependency identities. Questions retain answered/skipped/open state and decisions. Done rows retain issue/review URLs, disposition and date; security issues are counted only.

## Reservation and ownership

Persist `launching` with a unique run/issue/branch reservation before any creation. After each result record workspace and session IDs. On lost responses enumerate the recorded harness, including archived/background scopes, and match the reservation, branch and messages before retrying. A missing ID is not proof of no worker. Keep uncertain reservations occupied and report the blocker. Confirm reviews with the Git host before marking Done; duplicate events are harmless reconciliation, not another transition.

A different or unverifiable control room requires explicit owner takeover. After takeover notify all workers with the new control-room identity. No simultaneous controllers may schedule. Unknown previous worker lifecycle blocks conflicting/duplicate work. This is a single-writer protocol, not a claim of a filesystem lock.

## Legacy migration

Before writing, save an exact backup next to the old run file. Infer GitHub/T3 only when old PR URLs/Repo identity and thread identifiers plus environment establish them; ambiguous host or ownership requires clarification. Preserve unknown fields and all Queue, Running, Questions and Done information. Resolve full URLs and actual paths; never invent missing IDs.

Map old `Thread` to Session (literal inline stays inline), old PR references to full review identity, and `Session selection` to the original T3 resolved object plus equivalent model intent. Do not change active selections or restart workers. Record model intent as unresolved until confirmable rather than guessing.

Older files with external threads and no execution mode become sessions with `Session launches: pending owner choice`. Preserve that pending state across resumes until explicitly authorized. Existing authorized/disabled states remain unchanged; older files without external workers default to inline/disabled. An explicit current choice can update future execution, not ownership of existing rows.

Changing Git host or harness while work remains active is not a config-only edit. Finish the run or obtain an explicit migration decision; preserve original per-worker routing until resolved. Missing state, unreachable daemon or changed current defaults must not redirect existing work to another project or spawn replacements.
