import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, type TestContext } from "node:test";

const repo = fileURLToPath(new URL("../", import.meta.url));
const script = join(repo, "scripts/install-codex.ts");
const names = readdirSync(join(repo, "skills")).sort();
const run = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
const temporary = (t: TestContext) => {
  const root = mkdtempSync(join(tmpdir(), "it-stack-codex-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
};

test("installs all skills and references from another working directory into a path with spaces", (t) => {
  const root = temporary(t);
  const dest = join(root, "project space", ".agents", "skills");
  const result = run(root, "--dest", dest);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(dest).sort(), names);
  for (const name of names) {
    for (const file of readdirSync(join(repo, "skills", name))) {
      assert.deepEqual(readFileSync(join(dest, name, file)), readFileSync(join(repo, "skills", name, file)));
    }
    const body = readFileSync(join(dest, name, "SKILL.md"), "utf8");
    for (const [, target] of body.matchAll(/\]\(([^)]+\.md)(?:#[^)]*)?\)/g)) {
      assert.ok(existsSync(join(dest, name, target)), `${name}: missing ${target}`);
    }
  }
});

test("checks all conflicts before copying and preserves existing skills", (t) => {
  const root = temporary(t);
  const dest = join(root, "skills");
  const lastName = names.at(-1);
  assert.ok(lastName, "the stack must contain skills");
  const conflict = join(dest, lastName, "SKILL.md");
  mkdirSync(dirname(conflict), { recursive: true });
  writeFileSync(conflict, "my existing skill");
  const result = run(root, "--dest", dest);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /already exists/i);
  assert.equal(readFileSync(conflict, "utf8"), "my existing skill");
  assert.deepEqual(readdirSync(dest), [lastName]);
});

test("keeps unrelated installed skills", (t) => {
  const root = temporary(t);
  const dest = join(root, "skills");
  mkdirSync(join(dest, "other-skill"), { recursive: true });
  writeFileSync(join(dest, "other-skill", "SKILL.md"), "keep me");
  assert.equal(run(root, "--dest", dest).status, 0);
  assert.equal(readFileSync(join(dest, "other-skill", "SKILL.md"), "utf8"), "keep me");
});

test("rejects invalid arguments without creating a destination", (t) => {
  const root = temporary(t);
  const dest = join(root, "skills");
  for (const args of [["--dest"], ["--dest", ""], ["--unknown"], ["--dest", dest, "extra"], ["--dest", dest, "--dest", dest]]) {
    const result = run(root, ...args);
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.match(result.stderr, /usage:/i);
    assert.equal(existsSync(dest), false);
  }
});

test("help documents the default discovery location without installing", (t) => {
  const root = temporary(t);
  const result = run(root, "--help");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\.agents[/\\]skills/);
  assert.deepEqual(readdirSync(root), []);
});

test("defaults to the user skill directory without writing to the working directory", (t) => {
  const root = temporary(t);
  const home = join(root, "test home");
  mkdirSync(home);
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(join(home, ".agents", "skills")).sort(), names);
  assert.deepEqual(readdirSync(root), ["test home"]);
});

test("refuses a second installation and leaves installed resources intact", (t) => {
  const root = temporary(t);
  const dest = join(root, "skills");
  assert.equal(run(root, "--dest", dest).status, 0);
  const resource = join(dest, "ship-it", "project-facts.md");
  writeFileSync(resource, "locally customized facts");
  const result = run(root, "--dest", dest);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /already exists/);
  assert.equal(readFileSync(resource, "utf8"), "locally customized facts");
});
