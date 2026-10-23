# Stack and design preparation validation

Scope: stack-it and its build-it, fix-it, plan-it, prove-it and project-facts integration. No browser, installation or provisioning actions were performed by pressure-test reviewers.

## Baseline

Read-only agent simulations against 0.3.0 found:

- New web app under deadline: no required stack/design contract before code (fail).
- Existing Next app with stale shadcn configuration and explicit component libraries: no reconciliation or registry compatibility gate (fail).
- Backend-only fix: no unnecessary visual work (pass).
- Approved inline backlog: no explicit design artifact reuse (partial).
- Missing visual skills: no direct visual fallback or coverage reporting (fail).

## With stack-it

A fresh read-only reviewer simulated the same five scenarios and five paired short wording probes. Each scenario selected the intended behavior: contract before code, inspected configuration and major-version compatibility, backend exemption, contract/authorization reuse, and honest no-install fallback. These are qualitative scenario simulations, not five independent randomized trials or actual execution proof.

The reviewer found inconsistent optional-dependency wording, ambiguous planning approval inheritance, unnecessarily literal preimplementation commit wording and stale screenshot fallback text. The final documents now explicitly exempt direct stack-it and visual skills from installation offers, preserve caller requirements and owner opt-outs, require saving the contract before code but allow committing it with implementation, and require rendered evidence for visual acceptance.

## Mechanical checks

`npm run typecheck`, `npm test` (20 tests), and `npm run validate` pass. The installer dynamically discovers all eleven skill folders. Existing conflict-preservation and unrelated-skill tests pass. No runtime installer changes were needed.
