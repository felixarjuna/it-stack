---
name: setup-it
description: Use when configuring or changing it-stack's Git host and harness, or when first use finds no completed or deferred platform setup. Does not install optional dependencies or select a technology stack.
---

# setup-it

Configure **Git host** (GitHub or GitLab) and **Harness** (where coding sessions run, such as T3 Code or Paseo) independently. The coding agent/model is a separate preference. Inline work needs no external harness.

Read [platform resolution](../ship-it/platforms/README.md) and existing `## it-stack` facts in applicable project instructions. Inspect the selected remote, authenticated host metadata, and current session capabilities. Do not infer a custom GitLab host from its spelling or equate an installed CLI with the current harness.

## First use or explicit setup

For an interactive first use without `setup: complete` or `setup: deferred`, offer one short confirmation with detected suggestions:

> Git host: GitLab (gitlab.example.org/team/app). Harness: Paseo. Save these for this project in AGENTS.md, change them, use Auto, or configure later?

Use the applicable instruction file; name the actual destination. If both instruction files contain conflicting facts, resolve that conflict before saving. Existing explicit settings are already user choices: reuse them, do not ask users to select them again. Ask only about missing settings they need. Completed/deferred setup suppresses onboarding, not operation-specific errors. Explicit `setup-it` revisits settings.

- Save confirmed choices as `git-host: github|gitlab|auto`, `harness: t3|paseo|auto`, `setup: complete` bullets under `## it-stack`. Auto re-detects in each environment. Preserve all other instructions and multiline facts. Never add credentials.
- **Configure later:** save only `setup: deferred` at the agreed scope; continue independent local work. Do not invent a project for remote operations.
- **Outside a project:** offer Auto user defaults in `~/.it-stack/config.json`, or defer until a repository is available. Explain that project settings override defaults. User JSON uses the same keys.
- **Unattended/delegated:** never ask or write setup. Workers inherit the resolved context. Resolve required settings from existing facts/environment; if still unknown, report missing inputs and stop only dependent operations.

Editing these small facts requires no Node runtime. The standalone installer uses the packaged `config.ts` helper for the same format; plugin installation/file copying does not itself execute this skill. Every direct entry point runs the first-use check, once per task. Optional dependency setup remains a separate consent flow.
