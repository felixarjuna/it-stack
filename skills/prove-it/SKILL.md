---
name: prove-it
description: Use before calling a change done, and from ship-it. Runs the real app the way a user would, captures phone and desktop screenshots with the project's screenshot setup, and checks every image before it's used as proof.
---

# prove-it

"The tests pass" isn't proof that a user gets the right thing. Prove the change in the running app, on the real user path, and show it.

Read the project's `## it-stack` section first ([format and defaults](../ship-it/project-facts.md)).

## Nothing visible changed?

Scripts, CI, docs, server-only fixes with no effect on a screen: skip screenshots. Return "No screenshots: nothing visible changed." and a Verification bullet saying how you checked the behaviour instead (a command you ran and its output).

## Capture

1. Follow the `screenshots` fact exactly. It names the test database, how to sign in, how to seed data and the commands.
2. Show the state the change is about: the fixed section, the new dialog open, the error message showing. Sign in as whoever uses that page. Phone width first (most people use phones), then desktop.
3. Seed only test data. Never point the app at production, and never screenshot real people's data.

## Check every image

Open each image with Read and look at it. Redo the shot when you see:

- a blank page, a sign-in redirect, a loading spinner, or an error page you didn't mean to show
- an empty list where the change needs data
- the change scrolled out of view or covered by something else

If an image shows a bug, the change isn't done: fix the bug, then shoot again.

## Return

- The Screenshots markdown (from the publish step, or "No screenshots: nothing visible changed.").
- 1–2 Verification bullets: what you did, as whom, and what you saw.

When the `screenshots` fact is `none` or missing, open the app (or call the endpoint) yourself, describe what you observed in the Verification bullets, and add "No screenshot setup in this project" to the Screenshots section.

The idea comes from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) principle *prove-it-works*: verify against the real artifact, not a proxy.
