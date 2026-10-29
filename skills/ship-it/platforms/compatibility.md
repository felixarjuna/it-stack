# Compatibility and contributing adapters

Git host and Harness are independent. These combinations share the same workflow contract:

| Git host | Harness/execution | Baseline observation |
| --- | --- | --- |
| GitHub | T3 Code | activity refresh; optional T3 GitHub watch |
| GitHub | Paseo | activity refresh |
| GitHub | inline | activity refresh |
| GitLab (including self-managed) | T3 Code | activity refresh |
| GitLab (including self-managed) | Paseo | activity refresh |
| GitLab (including self-managed) | inline | activity refresh |

Activity means start/resume, worker reports, owner messages, and local merge/ship results. Installed capabilities may add notifications. Runtime discovery must verify support; a compatibility row is not a claim of live testing on every installation. See `docs/testing/platforms.md` in the source repository for recorded validation evidence.

The Git host CLI handles authentication and API operations. The harness handles session/workspace management. The underlying coding agent and model must be supported by the chosen harness; this package cannot make an unavailable model run. Inline execution requires neither T3 nor Paseo.

To contribute a new adapter: implement the [operation contract](contracts.md), declare required and optional capabilities, document installed-version checks and exact identity rules, add configuration choices to setup/helper validation, and add conformance scenarios paired with every existing adapter on the other axis. Keep shared workflow rules unchanged. Do not create a new workflow per combination. Document missing capabilities and live-test evidence; never label an unimplemented backend supported.
