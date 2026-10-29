# Composable Platforms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make Git hosts and harnesses independently selectable, with guided setup and portable existing workflows.

**Architecture:** Shared Markdown skills invoke operation contracts implemented by GitHub/GitLab and T3/Paseo adapters. A small packaged setup helper handles configuration safely for the standalone installer; all installation routes share first-use setup instructions.

**Tech Stack:** Markdown skills, TypeScript on Node 22.18+/24+, node:test, existing plugin packaging.

**Spec:** docs/superpowers/specs/2026-10-29-shared-stack-design.md

## Global Constraints

- User-facing settings: Git host (`git-host`) and Harness (`harness`). No fixed pairings or personal presets.
- Cover GitHub/GitLab × T3/Paseo/inline. Inline is the default and requires no external harness.
- Preserve existing project facts, user authorization, and active workers; never merge automatically.
- No credentials in configuration, no new daemon, no sandbox transport.
- Package all runtime resources beneath skills so plugin and standalone installations agree.

## Review Focus

- Setup outside a repository or without a TTY must not hang or mutate an unrelated project (Task 1).
- Existing instruction files, deferred setup, and conflicting defaults must survive reconfiguration (Task 1).
- Nested GitLab projects, pagination, absent CI, and head changes must not select/merge the wrong change (Tasks 2–3).
- Launch response loss and resumed ownership must not duplicate workers or destroy workspaces (Task 3).
- A missing optional watch must preserve cross-combination baseline operation (Tasks 2–3).

### Task 1: Guided setup and packaging

**Files:** create skills/setup-it/SKILL.md and skills/setup-it/config.ts; modify scripts/install-codex.ts, scripts/install-codex.test.ts; create scripts/setup.test.ts; update README skill inventory.

**Interfaces:** config.ts exports parseSettings(args), updateProjectFacts(text, settings), resolveSettings(layers), saveSettings(path, settings, scope). Settings use `git-host: auto|github|gitlab`, `harness: auto|t3|paseo`, `setup: complete|deferred`. Existing execution policy stays separate. CLI accepts --git-host, --harness, --setup-scope user|project, --project-file, --skip-setup. Only explicit setup options write settings; interactive installer offers setup after copying. First-use skill resolves missing context and saves with normal agent editing tools without requiring Node.

- [x] Write tests for resolution, preserving multiline facts/CRLF/unrelated content, malformed config, installer explicit settings and noninteractive defaults; run to see expected failures.
- [x] Implement helper and installer behavior, add concise setup skill based on baseline scenarios.
- [x] Verify recursive installation fidelity and config tests; commit.

### Task 2: Platform contracts and adapters

**Files:** create skills/ship-it/platforms/{README,contracts,compatibility}.md; git-hosts/{github,gitlab}.md; harnesses/{t3,paseo,inline}.md; scripts/platforms.test.ts; extend scripts/validate.ts and scripts/validate.test.ts for local resource integrity.

**Interfaces:** named Git host operations `project`, `issues.list/read/create/update/comment/close`, `reviews.list/read/create/update/comments/checks/merge`; harness operations `identify/capabilities/launch/list/read/send/release` with optional `link/watch/unwatch`. Capability failure is distinct from task state. Documentation defines record fields, selection precedence and baseline refresh.

- [x] Add failing resource-integrity/packaging tests and six-combination scenario fixtures.
- [x] Implement concrete, sourced adapters and capabilities, self-managed host identity, safe merge checks, model resolution, explicit Paseo workspaces, and extension guide.
- [x] Run structural tests and evaluate behavioral scenarios; commit.

### Task 3: Route workflows and migrate state

**Files:** update all directly invoked SKILL.md entry points; rewrite run-it/{SKILL,inline,run-file}.md; update ship-it/project-facts.md, README.md, plugin metadata, docs/testing/platforms.md.

**Interfaces:** workflows resolve setup once per task then invoke contract operations. State v2 persists full project/harness identity, central state path, launch authorization, model intent/resolution, worker/review identity and observation mode; legacy state has documented migration. Shared skills carry no executable platform commands.

- [x] Add failing checks for forbidden embedded commands and missing setup entry points; preserve visual-only/local work and dependency setup behavior.
- [x] Route issue and review operations through Git host adapters; external session lifecycle through harness adapters. Implement restart-safe scheduling and state migration instructions.
- [x] Document setup, all supported combinations, downgrade behavior, migration and live-test limits; run full tests/typecheck/validate.
- [x] Evaluate realistic scenarios with a fresh agent and perform independent whole-branch review; fix substantive issues and commit.

## Execution record

The user approved the design and explicitly requested committing and proceeding. Execute inline without a second planning approval. The isolated checkout is /tmp/it-stack-shared-design on feat/composable-platforms. Do not push or merge as part of this request.
