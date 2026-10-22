# it-stack

Felix's agent skill stack for Claude Code. Every skill is a verb with `-it` on the end: say what you want, answer the questions once, and get back pull requests you can judge in a minute from the PR page.

## Install

```
/plugin marketplace add felixarjuna/it-stack
/plugin install it-stack@it-stack
```

## Skills

★ marks the ones you type. The rest are mostly called by those.

| Skill | Job |
| --- | --- |
| **`prove-it`** | Proves the change in the running app the way a user would, with phone and desktop screenshots it checks before using. |
| **`ship-it`** | Check → commit → push → a PR that explains itself (Why, What changed, Scope, Verification, screenshots). Never merges. |
| **`plan-it`** | Turns an unclear idea or issue into a brief: asks what is missing, writes the answers into the issue. |
| ★ **`fix-it`** | Bugs: reproduce, root cause, failing test first, fix, ship. |
| ★ **`build-it`** | One issue start to finish: read the brief, build test-first, prove it, ship a PR that closes it. |
| **`sort-it`** | Sorts open issues against the code: ready, needs answers, too big, already done, security. One batched question message. |
| **`split-it`** | Breaks work too big for one PR into small issues with "Blocked by" links. |

## Credits

it-stack builds on other people's work instead of copying it:

- [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (poteto): the PR briefing format and "prove it works in the real artifact".
- [mattpocock/skills](https://github.com/mattpocock/skills) by Matt Pocock: `triage`, `to-tickets`, `wayfinder`, `grilling`.
- [superpowers](https://github.com/obra/superpowers) by Jesse Vincent: `brainstorming`, `systematic-debugging`, `test-driven-development`.

Install mattpocock-skills and superpowers for the full experience; every skill that uses them has a fallback when they're missing.

## License

MIT
