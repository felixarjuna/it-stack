---
name: prove-it
description: Use before calling a change done, and from ship-it. Runs the real app the way a user would, captures phone and desktop screenshots with the project's screenshot setup, and checks every image before it's used as proof.
---

# prove-it

First follow [optional dependency setup](../ship-it/dependency-setup.md), including when invoked directly. Reuse the result within this task.

"The tests pass" isn't proof that a user gets the right thing. Prove the change in the running app, on the real user path, and show it.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## Nothing visible changed?

Scripts, CI, docs, server-only fixes with no effect on a screen: skip screenshots. Return "No screenshots: nothing visible changed." and a Verification bullet saying how you checked the behaviour instead (a command you ran and its output).

## Capture

For visible changes, read the design contract from stack-it and review the changed interface using `better-interface` and `webapp-testing` when available. Apply stack-it's direct fallback when unavailable; no installation prompt is required. Check keyboard/focus, responsive layout and relevant empty/error/loading states as well as the happy path. Report inspected routes, widths and remaining unverified areas.

1. Follow the `screenshots` fact exactly. It names the test database, how to sign in, how to seed data and the commands.
2. Show the state the change is about: the fixed section, the new dialog open, the error message showing. Sign in as whoever uses that page. Phone width first (most people use phones), then desktop.
3. Seed only test data. Never point the app at production, and never screenshot real people's data.

## Check every image

Open each image with the client's image viewer (`view_image` in Codex, `Read` in Claude Code) and look at it. Redo the shot when you see:

- a blank page, a sign-in redirect, a loading spinner, or an error page you didn't mean to show
- an empty list where the change needs data
- the change scrolled out of view or covered by something else

If an image shows a bug, the change isn't done: fix the bug, then shoot again.

## Return

- The Screenshots markdown (from the publish step, or "No screenshots: nothing visible changed.").
- 1–2 Verification bullets: what you did, as whom, and what you saw.

When the `screenshots` fact is `none` or missing, open the running app yourself and capture/inspect screenshots with the available browser where possible. Describe what you observed and the capture method. An endpoint call alone cannot prove a visible change. If rendered verification is unavailable, state that limitation; do not claim visual acceptance. For nonvisual changes, endpoint or command evidence is sufficient.

The idea comes from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) principle *prove-it-works*: verify against the real artifact, not a proxy.
