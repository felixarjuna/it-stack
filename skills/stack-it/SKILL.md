---
name: stack-it
description: Use before developing a web app or changing its visible interface when the technology stack, component sources, design tokens or interaction patterns are missing, stale or inconsistent. Also use when the owner asks to configure a stack or design system.
---

# stack-it

Direct stack-it calls are exempt from the generic optional dependency installation flow: discover available skills and use the fallback below, without installation prompts. Calls from another workflow reuse its dependency result. The visual skills are not added to that workflow's installation offer.

Establish the implementation contract before feature code. Read the project's [facts](../ship-it/project-facts.md), brief, existing design decisions and relevant code first. This runs inline and creates no sessions.

## Scope and reuse

For backend-only, documentation or infrastructure work with no visible effect, skip the visual steps. Do not redesign an app to fix a server bug.

Use the `design-system` fact when present; otherwise look for `docs/design-system.md` and existing equivalent documentation. Reuse a current contract across issues and resumed runs. Update only decisions affected by this task. An existing file is evidence to inspect, not proof that the implementation still matches it.

Owner decisions and standing authorization carry forward. Settle ordinary implementation choices yourself; do not add a plan or design approval gate. Ask only for missing information that materially changes scope and cannot be recovered from the project. In batch mode, return such questions to the caller without asking or implementing dependent work. Never install a plugin, provision paid resources or replace an established stack merely to satisfy this workflow.

## Inspect before choosing

1. Identify users, primary tasks, information density, mobile needs, deployment target and data constraints. Inspect the current rendered app when one exists; note what works and what obstructs the task.
2. Inspect package manager, exact dependency versions, framework/runtime, component configuration, aliases, global CSS, tokens and existing components. For shadcn, inspect `components.json`, Tailwind version/config, style/base, registry namespaces and generated imports. Resolve stale configuration before adding components. Avoid broad global CSS that overrides component states or accessibility.
3. Honor requested libraries. Verify supported versions and source registries using official documentation and the installed CLI. Check compatibility before copying examples; registry code may target a different major version. Record any adaptation, source and license. Do not silently substitute an unrelated similarly named project. Preserve customized components rather than blanket-overwriting them.
4. Prefer the smallest compatible change to the established stack. Record runtime, framework, styling, primitives, icons, table/form strategy, deployment constraints and dependency policy. Verify current recommendations against official sources; record reasons, not just library names.

## shadcn projects

When the project has `components.json`, or the owner requests shadcn components or a preset, discover and read the installed **shadcn** skill before changing configuration, tokens or components. Follow its project inspection, CLI, component documentation, composition and preset-update workflow; use the project package runner. Keep the established primitive base and local component behavior when merging, and reconcile stale configuration before adding components.

For a preset change, reuse the owner's selected update mode (overwrite, partial, merge or skip). Ask for that choice only when it is missing; do not repeat an answered approval question. Use the shadcn CLI to inspect preset codes and preview component changes, rather than decoding codes or copying registry source manually. Record the preset and any deliberate adaptations in the design contract.

If the shadcn skill is unavailable, say so briefly and use the official shadcn CLI and documentation for these steps. Preserve the package manager, primitive base and customized components; inspect changes before applying them. Do not install a skill or plugin without authorization or block on an optional installation. Non-shadcn projects keep their existing component workflow.

## Write the contract

Use `frontend-design` when available to choose a concrete direction tied to the primary task. Save a concise contract in a tracked project path (default `docs/design-system.md`) before implementation and include it in the change's commit. A separate preliminary commit is not required. Include:

- users, primary workflow, scope and explicit exclusions;
- stack and component sources, compatible versions, adaptations and rationale;
- semantic colors and contrast requirements, typography, spacing, density, radii and icon rules;
- shell/navigation, table, filtering, form and responsive patterns;
- keyboard/focus, accessible names, empty/loading/error/success states and destructive-action recovery;
- representative desktop and phone routes/states, test fixtures and acceptance evidence.

Link the contract from the implementation plan or issue. A small existing-app change can add a short scoped amendment; do not produce a new system for every button. This step defines choices; building proceeds through build-it or the caller's existing workflow.

## Build and verify against it

Use the documented components and tokens. Before ship-it, use `better-interface` to review accessibility, writing, layout, typography, colors and UI polish, then `webapp-testing` and [prove-it](../prove-it/SKILL.md) to exercise the real changed workflows. Respect each skill's browser prerequisites and the project's test-data rules.

Inspect rendered desktop and phone views with representative content, including narrow layouts, long text, keyboard navigation/focus, overlays and relevant failure states. Open and inspect every screenshot used as evidence. API success and passing unit tests alone do not establish visual quality. Fix material findings, rerun affected verification and report actual coverage; never label untested screen-reader, contrast or browser behavior as passed.

## If it isn't installed

These visual skills are optional. Use available skills without installation prompts; honor an existing no-install preference. If any is missing, perform its applicable steps directly: choose and document a task-specific visual direction, review the six interface areas above, and use the available browser/test runner for real flows and inspected screenshots. Report missing tools and unverified areas honestly. Do not block implementation for optional plugins, and do not claim rendered proof if the browser cannot run.

## Common mistakes

| Temptation | Required response |
| --- | --- |
| “The registry is current, so its code will work.” | Compare its peer APIs with installed versions before copying. |
| “The tests passed; the UI is done.” | Inspect rendered workflows, including phone layout and focus. |
| “There is a design file, so skip inspection.” | Check the affected code and configuration still match it. |
| “No visual plugin; stop or install one.” | Use the direct fallback and report coverage. |
| “Every issue needs a fresh design approval.” | Reuse decisions and standing authorization. |

Example: an existing inventory app requests a sidebar and table library. Keep its framework and deployment, inspect aliases/Tailwind/component configuration, reconcile stale settings, verify the requested table's API against the installed major version, and document the compatible composition. Establish compact table, filtering, editing and mobile patterns in the existing contract; build the slice, inspect populated desktop/phone views and keyboard flows, then ship with honest evidence.
