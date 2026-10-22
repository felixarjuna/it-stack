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

## Credits

it-stack builds on other people's work instead of copying it:

- [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (poteto): the PR briefing format and "prove it works in the real artifact".
- [mattpocock/skills](https://github.com/mattpocock/skills) by Matt Pocock: `triage`, `to-tickets`, `wayfinder`, `grilling`.
- [superpowers](https://github.com/obra/superpowers) by Jesse Vincent: `brainstorming`, `systematic-debugging`, `test-driven-development`.

Install mattpocock-skills and superpowers for the full experience; every skill that uses them has a fallback when they're missing.

## License

MIT
