import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from './validate.ts';

const repo = fileURLToPath(new URL('../', import.meta.url));
function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), 'it-stack-platforms-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const entry of ['skills', '.claude-plugin', 'README.md']) cpSync(join(repo, entry), join(root, entry), { recursive: true });
  return root;
}

test('packaged skill resources have resolvable relative references', t => {
  const root = fixture(t);
  const entry = join(root, 'skills', 'ship-it', 'SKILL.md');
  writeFileSync(entry, readFileSync(entry, 'utf8') + '\nSee [missing adapter](platforms/git-hosts/missing.md).\n');
  assert.ok(validate(root).some(problem => problem.includes('missing.md')));
});

test('platform commands in shared workflow are rejected', t => {
  const root = fixture(t);
  const entry = join(root, 'skills', 'plan-it', 'SKILL.md');
  writeFileSync(entry, readFileSync(entry, 'utf8') + '\nRun `glab issue list` then `t3_thread_send`.\n');
  assert.ok(validate(root).some(problem => problem.includes('plan-it') && problem.includes('platform command')));
});

test('all shared entry points participate in platform setup', t => {
  const root = fixture(t);
  const entry = join(root, 'skills', 'fix-it', 'SKILL.md');
  const body = readFileSync(entry, 'utf8');
  writeFileSync(entry, body.replace(/^.*\[platform setup\].*\n/gm, ''));
  assert.ok(validate(root).some(problem => problem.includes('fix-it') && problem.includes('platform setup')));
});
