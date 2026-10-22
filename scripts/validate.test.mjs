import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { validate } from "./validate.mjs";

const skill = (name, description = `Use when ${name} is needed.`, body = "") =>
  `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n${body}`;

/** Writes a minimal valid stack, then applies `overrides` (path → content). */
const stack = (overrides = {}) => {
  const root = mkdtempSync(join(tmpdir(), "it-stack-"));
  const files = {
    ".claude-plugin/plugin.json": JSON.stringify({ name: "it-stack" }),
    ".claude-plugin/marketplace.json": JSON.stringify({
      name: "it-stack",
      plugins: [{ name: "it-stack", source: "./" }],
    }),
    "README.md": "| Skill | Job |\n| --- | --- |\n| **`ship-it`** | Opens a PR. |\n",
    "skills/ship-it/SKILL.md": skill("ship-it"),
    ...overrides,
  };
  for (const [path, content] of Object.entries(files)) {
    if (content === null) continue;
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
};

test("valid stack passes", () => {
  assert.deepEqual(validate(stack()), []);
});

test("skill name must match folder and pattern", () => {
  const problems = validate(
    stack({ "skills/ship-it/SKILL.md": skill("shipit") })
  );
  assert.ok(problems.some((p) => p.includes("ship-it")), problems.join("\n"));
});

test("folder name must be <verb>-it", () => {
  const problems = validate(
    stack({
      "skills/shipping/SKILL.md": skill("shipping"),
      "README.md": "| **`ship-it`** | x |\n| **`shipping`** | x |\n",
    })
  );
  assert.ok(problems.some((p) => p.includes("shipping")), problems.join("\n"));
});

test("description required and at most 1024 chars", () => {
  assert.ok(
    validate(stack({ "skills/ship-it/SKILL.md": "---\nname: ship-it\n---\n" }))
      .length > 0
  );
  assert.ok(
    validate(
      stack({ "skills/ship-it/SKILL.md": skill("ship-it", "x".repeat(1025)) })
    ).length > 0
  );
});

test("README lists every skill", () => {
  const problems = validate(
    stack({ "skills/fix-it/SKILL.md": skill("fix-it") })
  );
  assert.ok(problems.some((p) => p.includes("fix-it")), problems.join("\n"));
});

test("skills that reference another plugin carry a fallback", () => {
  const body = "Invoke `superpowers:systematic-debugging`.\n";
  const without = validate(
    stack({ "skills/ship-it/SKILL.md": skill("ship-it", undefined, body) })
  );
  assert.ok(without.some((p) => p.includes("fallback")), without.join("\n"));
  const withFallback = validate(
    stack({
      "skills/ship-it/SKILL.md": skill(
        "ship-it",
        undefined,
        `${body}\n## If it isn't installed\n\nDo it by hand.\n`
      ),
    })
  );
  assert.deepEqual(withFallback, []);
});

test("rejects project-specific or private text", () => {
  for (const text of ["PERKI members", "in Aachen", "mail me at someone@gmail.com"]) {
    const problems = validate(
      stack({ "skills/ship-it/SKILL.md": skill("ship-it", undefined, text) })
    );
    assert.ok(problems.length > 0, `not rejected: ${text}`);
  }
  assert.deepEqual(
    validate(
      stack({
        "skills/ship-it/SKILL.md": skill(
          "ship-it",
          undefined,
          "Co-Authored-By: Claude <noreply@anthropic.com>"
        ),
      })
    ),
    []
  );
});

test("marketplace and plugin names agree", () => {
  const problems = validate(
    stack({
      ".claude-plugin/marketplace.json": JSON.stringify({
        name: "it-stack",
        plugins: [{ name: "other", source: "./" }],
      }),
    })
  );
  assert.ok(problems.length > 0);
});

test("project facts example parses", () => {
  const doc = readFileSync(
    new URL("../skills/ship-it/project-facts.md", import.meta.url),
    "utf8"
  );
  const example = /```markdown\n(?<body>## it-stack[\s\S]*?)```/.exec(doc)
    ?.groups?.body;
  assert.ok(example, "project-facts.md needs a ```markdown example");
  for (const key of ["check", "screenshots", "migrations", "merge", "private"]) {
    assert.match(example, new RegExp(`^- \*\*${key}:\*\* \S`, "m"), key);
  }
});
