# Optional dependency setup

Run this check at the start of every it-stack entry point, before its workflow. This is an agent-guided consent flow, not an install-time hook. Check once per top-level task; sibling skills reuse the result. A direct call to any skill must run it too.

## 1. Discover what is available

Use the current client's skill catalog and [local skill lookup](project-facts.md#using-skills-across-clients). Check the skills below, not just a plugin folder or cached download. Equivalent standalone installations count. Do not upgrade, replace, or enable an existing disabled plugin as part of discovery.

| Plugin | Expected skills | Purpose | Upstream source |
| --- | --- | --- | --- |
| `superpowers` | `brainstorming`, `systematic-debugging`, `test-driven-development` | Planning, debugging, and test-first implementation | https://github.com/obra/superpowers |
| `mattpocock-skills` | `grilling`, `triage`, `to-tickets`, `wayfinder` | Clarifying requirements, triaging issues, and splitting work | https://github.com/mattpocock/skills |

Check both optional plugins together so setup asks once. If only some skills are present, report the missing skills and offer a repair only after identifying a supported route that preserves existing skills. An unavailable repair route uses the fallback. A disabled plugin needs an explicit enable choice; it is not a missing installation.

Delegated workers, batch calls, and unattended runs never prompt or install: reuse the caller's result, or use fallbacks and report missing dependencies to the caller in the task result. Only the interactive parent offers setup. Pass this result to child work to avoid duplicate prompts or concurrent installations.

## 2. Resolve the installation offer

Prefer the current client's native plugin installer. Inspect its available tools, CLI help, or official installation instructions to identify the exact plugin ID, marketplace/repository, version/ref when available, and scope. Verify that the offered distribution corresponds to the upstream source above. Do not guess commands, silently add a marketplace, or use a different source than the one shown to the owner.

For Codex without a native route, a supported skill installer may install the named skills and their supporting resources from the upstream repository. Present that as a standalone-skills installation, with the exact destination and folders; do not claim it installs a plugin. For Claude Code, use its native plugin route when available. Never require the other client to be installed. If no supported route is available, explain once and continue with fallbacks.

Default scope is the current client's user account. Show the actual scope/destination in the offer. Include any marketplace addition, enabling, repair, or replacement the operation would require. Existing files must not be overwritten without separately disclosed approval.

Read `~/.it-stack/dependency-preferences.json` (where `~` is the user's home directory, not the project). Missing file means no saved preferences. Its only authority is to suppress prompts, never to grant installation permission. For example:

```json
{
  "version": 1,
  "suppressed": [
    {
      "client": "codex",
      "plugin": "mattpocock-skills",
      "source": "https://github.com/mattpocock/skills",
      "scope": "user"
    }
  ]
}
```

Match all four fields exactly; use the offered source and actual scope (absolute destination for standalone skills). Suppress only those entries, not all future plugins. Malformed or unsupported preference files are not consent: leave them intact, explain once, and use session-only choices. If the owner explicitly asks to reconsider a plugin, ignore its suppression for this task.

## 3. Ask once, then act on the answer

If everything is available or suppressed, continue immediately. Otherwise show one combined offer listing only actionable, unsuppressed missing items: exact names, missing skills, purpose, verified installation source/ID, and scope/destination. Mention already available plugins briefly. For example, after resolving the actual install route:

> Superpowers is available. `mattpocock-skills` is missing; it adds guided requirements, issue triage, and task splitting. Install [exact plugin ID or skill folders] from [verified marketplace/repository and ref] for [scope/destination]?
>
> **Install listed dependencies** · **Continue with fallbacks** · **Don't ask again for these dependencies**

Use the client's user-question interface if available, otherwise ask in chat. Accept a narrowed answer such as "install Matt only" or "don't ask again for Matt"; apply it only to those items and use fallbacks for the other items for this task, without another prompt. Wait for an explicit answer before any installation, marketplace addition, download for installation, enablement, or repair. A request to fix/build, a selected default, silence, or an unattended run is not consent. Explicit prior approval in this task for the same listed operations is sufficient; do not ask twice. The offer never grants blanket permission for new plugins, new sources, or expanded scope.

- **Install listed dependencies:** execute only the approved operations. Verify each result using the installer state and skill lookup; a successful exit alone does not prove skills are usable. Resume the original task with usable skills. If restart is needed, say which installation succeeded but is not active, and use fallbacks for this task. Do not restart or end the user's task automatically. A failed install is reported once and falls back; no repeated attempts or alternate source/scope without fresh consent. Partial success keeps the successfully installed items.
- **Continue with fallbacks:** install nothing and remember the choice for this top-level task, including sibling calls and child work. A later task may offer setup again.
- **Don't ask again for these dependencies:** install nothing. Merge suppression entries for the selected displayed items into the preference file, preserving unrelated entries. Create its parent directory if necessary. Write valid JSON to a temporary sibling file and atomically replace the destination using the platform's supported filesystem operation; never truncate the existing file first. Persist no credentials and no install approvals. If safe replacement is unavailable or writing fails, preserve the existing file, report that the choice is session-only, and continue. A newly introduced dependency still gets its own offer.

To reset a saved choice, the owner can ask to reconsider a named dependency or remove its matching suppression entry. Remove only the requested entries when asked. Optional setup never blocks the original task after a decline, unsupported route, or failed install; use the calling skill's inline fallback. Do not repeat installation recommendations in sibling fallback sections after this check.
