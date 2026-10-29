# Paseo harness

Implements [harness operations](../contracts.md) for either Git host. Use the installed CLI/MCP schema, not assumptions about a newer release. `paseo --help`, `paseo run --help` and provider diagnostics establish capabilities. Record daemon identity/host without connection credentials; pass the same `--host` on operations when targeting a remote daemon. Paths belong to that daemon's filesystem.

| Operation | Mapping |
| --- | --- |
| `identify/list` | use `PASEO_AGENT_ID` when available; verify via `paseo ls -a -g --json` and workspace metadata; include background workspaces via supported listing options |
| `capabilities` | inspect installed CLI/MCP schema, current agent/provider metadata and `paseo provider diagnostic <provider> --json`; confirm model/options against live catalog |
| `read` | `paseo logs ID --tail N` for messages, listing for lifecycle; increase history when needed; `paseo wait ID --timeout 60` only for bounded active waits |
| `send` | `paseo send ID --no-wait --behavior steer MESSAGE`; use safe argv/text handling |
| `release` | confirm idle/stopped and released ownership, then clean workspace; `paseo workspace archive ID` only when supported and safe; archival does not prove physical deletion |

## Launch an isolated worker

Read the [run-state reservation protocol](../../../run-it/run-file.md) first. Allocate a unique branch and persist the reservation before launching. Confirm the selected provider/model and options; use supported `--provider`, `--model` and option flags from the installed help. If the current model cannot be discovered, ask rather than invent one.

Use `paseo workspace create --isolation worktree --path REPO --mode branch-off --new-branch BRANCH --base BASE --json`. Capture full workspace ID/path. Then `paseo run --workspace WORKSPACE_ID --no-wait --title TITLE <resolved model flags> TASK`; read back the agent identity and model. Use machine-readable output supported by installed help. The task includes run ID, issue URL, central state path, control-room ID, resolved Git host and model intent. Persist returned IDs before other scheduling.

**Placement is explicit:** launching from a Paseo agent otherwise inherits its workspace. Fetch/update BASE in a safe checkout first; a local base name is not proof of current origin state. Reuse a workspace/agent discovered after a lost response; enumerate all scopes and match reservation identity before retrying either creation or launch.

Steering can fall back to interrupting on some providers. Do not treat it as T3's guaranteed queued delivery: batch notifications, inspect receiver state, and use supported queued delivery when available. If safe delivery cannot be established, retain the message in the reporting session and surface it on reconciliation; do not silently replace an active task. Current-turn completion is not necessarily permanent worker shutdown; coordinate release before cleanup.

## Optional features

Baseline review observation is activity-driven reconciliation through the selected Git host. No GitHub-only PR UI is required for GitLab. Link/watch only if installed capabilities explicitly support the chosen host; otherwise include the review URL in messages and state. Do not install schedules, plugins or webhooks implicitly.

Source: [Paseo CLI](https://paseo.sh/docs/cli).
