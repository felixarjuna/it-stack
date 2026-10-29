/** Configuration helpers for the standalone installer; skills can edit the same facts directly. */
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export type Settings = {
  'git-host'?: 'auto' | 'github' | 'gitlab';
  harness?: 'auto' | 't3' | 'paseo';
  setup?: 'complete' | 'deferred';
};
export type Scope = 'user' | 'project';
const choices = {
  'git-host': ['auto', 'github', 'gitlab'],
  harness: ['auto', 't3', 'paseo'],
  setup: ['complete', 'deferred'],
};

export function parseSettings(args: string[]) {
  const settings: Settings = {};
  let destination: string | undefined;
  let scope: Scope | undefined;
  let projectFile: string | undefined;
  let skip = false;
  let help = false;
  const seen = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
    seen.add(flag);
    if (flag === '--help') { help = true; continue; }
    if (flag === '--skip-setup') { skip = true; continue; }
    if (!['--dest', '--git-host', '--harness', '--setup-scope', '--project-file'].includes(flag)) {
      throw new Error(`Unknown option: ${flag}`);
    }
    const value = args[++i];
    if (!value?.trim() || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag === '--dest') destination = value;
    else if (flag === '--project-file') projectFile = value;
    else if (flag === '--setup-scope') {
      if (value !== 'user' && value !== 'project') throw new Error('Setup scope must be user or project');
      scope = value;
    } else {
      const key = flag.slice(2) as 'git-host' | 'harness';
      if (!(choices[key] as readonly string[]).includes(value)) throw new Error(`Invalid ${key}: ${value}`);
      Object.assign(settings, { [key]: value });
    }
  }
  if (help && args.length !== 1) throw new Error('--help must be used alone');
  if (skip && (Object.keys(settings).length || scope || projectFile)) throw new Error('--skip-setup cannot accompany setup options');
  if (projectFile && scope === 'user') throw new Error('--project-file requires project scope');
  return { settings, destination, scope, projectFile, skip, help };
}

export function resolveSettings(layers: {
  explicit?: Settings; project?: Settings; detected?: Settings; defaults?: Settings;
}) {
  const settings: Settings = {};
  const conflicts: string[] = [];
  for (const key of ['git-host', 'harness'] as const) {
    const preference = layers.explicit?.[key] ?? layers.project?.[key];
    const values = [preference, layers.detected?.[key], layers.defaults?.[key]];
    const value = values.find(v => v && v !== 'auto') ?? 'auto';
    Object.assign(settings, { [key]: value });
    const detected = layers.detected?.[key];
    const preferred = preference && preference !== 'auto' ? preference : (!preference ? layers.defaults?.[key] : undefined);
    if (detected && detected !== 'auto' && preferred && preferred !== 'auto' && preferred !== detected) conflicts.push(key);
  }
  return { settings, conflicts };
}

export function readSettings(path: string, scope: Scope): Settings {
  if (!existsSync(path)) return {};
  const text = readFileSync(path, 'utf8');
  let data: Record<string, unknown>;
  if (scope === 'user') {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Configuration must be a JSON object');
    data = parsed as Record<string, unknown>;
  } else {
    const sections = [...text.matchAll(/^## it-stack\s*$/gm)];
    if (sections.length > 1) throw new Error('Multiple it-stack sections; reconcile before setup');
    if (!sections.length) return {};
    const section = text.slice(sections[0].index! + sections[0][0].length).split(/^#{1,2} /m)[0];
    data = {};
    for (const [, key, value] of section.matchAll(/^- \*\*(git-host|harness|setup):\*\*\s*([^\r\n]*)/gm)) {
      if (key in data) throw new Error(`Duplicate ${key} facts`);
      data[key] = value.trim().split(/[\s(]/)[0];
    }
  }
  const result: Settings = {};
  for (const key of Object.keys(choices) as (keyof Settings)[]) {
    if (!(key in data)) continue;
    if (!(choices[key] as readonly unknown[]).includes(data[key])) throw new Error(`Invalid stored ${key}`);
    Object.assign(result, { [key]: data[key] });
  }
  return result;
}

export function updateProjectFacts(text: string, settings: Settings): string {
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const sections = lines.flatMap((line, i) => /^## it-stack\s*$/.test(line) ? [i] : []);
  if (sections.length > 1) throw new Error('Multiple it-stack sections; reconcile them before setup');
  if (!sections.length) {
    return `${text.trimEnd()}${text.trim() ? newline + newline : ''}## it-stack${newline}${newline}` +
      Object.entries(settings).map(([key, value]) => `- **${key}:** ${value}${newline}`).join('');
  }
  const start = sections[0] + 1;
  let end = lines.findIndex((line, i) => i >= start && /^#{1,2} /.test(line));
  if (end === -1) end = lines.length;
  const section = lines.slice(start, end);
  for (const [key, value] of Object.entries(settings)) {
    const pattern = new RegExp(`^- \\*\\*${key}:\\*\\*`);
    const indices = section.flatMap((line, i) => pattern.test(line) ? [i] : []);
    if (indices.length > 1) throw new Error(`Duplicate ${key} facts; reconcile before setup`);
    const line = `- **${key}:** ${value}`;
    if (indices.length) {
      const i = indices[0];
      let count = 1;
      while (i + count < section.length && /^\s+\S/.test(section[i + count])) count++;
      section.splice(i, count, line);
    } else {
      let position = section.length;
      while (position > 0 && !section[position - 1].trim()) position--;
      section.splice(position, 0, line);
    }
  }
  return [...lines.slice(0, start), ...section, ...lines.slice(end)].join(newline);
}

export function saveSettings(path: string, settings: Settings, scope: Scope): void {
  // Preserve existing instructions/config; never replace malformed data or follow a file symlink.
  try { if (lstatSync(path).isSymbolicLink()) throw new Error(`Refusing symlink: ${path}`); }
  catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error; }
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
  let output: string;
  if (scope === 'project') output = updateProjectFacts(existing, settings);
  else {
    const data: unknown = existing ? JSON.parse(existing) : {};
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Configuration must be a JSON object');
    output = JSON.stringify({ ...data, ...settings }, null, 2) + '\n';
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, output, 'utf8');
}
