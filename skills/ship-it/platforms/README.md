# Resolve platforms once per task

Git host and Harness are independent. Git host owns issues/reviews; Harness owns coding sessions. Neither selects the coding agent or model.

Before remote operations, read project facts and `~/.it-stack/config.json` if present. For an interactive first use without completed/deferred setup, use [setup-it](../../setup-it/SKILL.md). Reuse explicit existing settings; do not ask about settled choices. Delegated workers inherit the control room's context and never prompt or write configuration. Local work can continue with setup deferred; unattended remote work with unresolved identity must report what is missing.

For new work resolve each setting: explicit task choice → project facts → unambiguous environment detection → user defaults. Auto means detect, not a particular platform. A conflict with the selected remote/current harness is surfaced before dependent work. Preserve the resolved settings in [run state](../../run-it/run-file.md); on resume use recorded identity, not a newly detected default. Unknown ownership requires takeover, not a new run.

Select a remote explicitly when ambiguous; record its URL, Git host kind, hostname, full project path and default branch. Detect public hosts from known URLs; identify custom hosts through explicit configuration or authenticated tool metadata. Do not print credential-bearing remote URLs. Check authentication and operations using the selected adapter. Missing/denied responses are not empty lists or successful checks.

Read [contracts](contracts.md), then only the selected [GitHub](git-hosts/github.md) or [GitLab](git-hosts/gitlab.md) adapter and, for external sessions, [T3](harnesses/t3.md) or [Paseo](harnesses/paseo.md). [Inline](harnesses/inline.md) execution needs no external harness. If required capabilities are missing, report them and offer an alternative; never silently change explicit execution choices.

All combinations share reconciliation on activity. Optional linking/watching requires compatible capabilities from both sides; a missing watch does not block shipping or sessions. See [compatibility and extension](compatibility.md).
