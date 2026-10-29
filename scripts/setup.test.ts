import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseSettings, resolveSettings, saveSettings, updateProjectFacts } from '../skills/setup-it/config.ts';

test('independent selections cover both hosts and harnesses without changing execution', () => {
  for (const host of ['github', 'gitlab']) for (const harness of ['t3', 'paseo', 'auto']) {
    const { settings } = parseSettings(['--git-host', host, '--harness', harness]);
    assert.deepEqual(settings, { 'git-host': host, harness });
    assert.equal('execution' in settings, false);
  }
  for (const args of [['--git-host', 'other'], ['--harness'], ['--git-host', 'github', '--git-host', 'gitlab'], ['--wat']]) {
    assert.throws(() => parseSettings(args));
  }
});

test('explicit/project selections win; auto detects; conflicting user defaults are reported', () => {
  assert.deepEqual(resolveSettings({ project: { 'git-host': 'gitlab' }, detected: { harness: 'paseo' } }).settings,
    { 'git-host': 'gitlab', harness: 'paseo' });
  assert.equal(resolveSettings({ explicit: { harness: 't3' }, project: { harness: 'paseo' } }).settings.harness, 't3');
  assert.equal(resolveSettings({ project: { harness: 'auto' }, detected: { harness: 'paseo' } }).settings.harness, 'paseo');
  const conflict = resolveSettings({ detected: { 'git-host': 'gitlab' }, defaults: { 'git-host': 'github' } });
  assert.equal(conflict.settings['git-host'], 'gitlab');
  assert.deepEqual(conflict.conflicts, ['git-host']);
  assert.deepEqual(resolveSettings({}).settings, { 'git-host': 'auto', harness: 'auto' });
});

test('editing project facts preserves multiline facts, following headings, and CRLF', () => {
  const original = '# Instructions\r\n\r\n## it-stack\r\n\r\n- **check:** npm test\r\n  then lint\r\n- **git-host:** github\r\n- **private:** seed only\r\n\r\n## Other\r\nkeep me\r\n';
  const updated = updateProjectFacts(original, { 'git-host': 'gitlab', harness: 'paseo', setup: 'complete' });
  assert.ok(updated.includes('- **check:** npm test\r\n  then lint'));
  assert.ok(updated.includes('## Other\r\nkeep me'));
  assert.ok(updated.includes('- **git-host:** gitlab'));
  assert.equal((updated.match(/\*\*git-host:/g) ?? []).length, 1);
  assert.equal(updateProjectFacts(updated, { 'git-host': 'gitlab', harness: 'paseo', setup: 'complete' }), updated);
  assert.throws(() => updateProjectFacts('## it-stack\n\n## it-stack\n', { setup: 'complete' }), /multiple/i);
});

test('saving defaults preserves unrelated fields and refuses malformed configuration', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'it-stack-setup-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, 'config.json');
  writeFileSync(path, JSON.stringify({ other: { keep: true }, harness: 't3' }));
  saveSettings(path, { 'git-host': 'gitlab', setup: 'complete' }, 'user');
  assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), { other: { keep: true }, harness: 't3', 'git-host': 'gitlab', setup: 'complete' });
  for (const invalid of ['{oops', '[]', 'null']) {
    writeFileSync(path, invalid);
    assert.throws(() => saveSettings(path, { harness: 'paseo' }, 'user'));
    assert.equal(readFileSync(path, 'utf8'), invalid);
  }
});
