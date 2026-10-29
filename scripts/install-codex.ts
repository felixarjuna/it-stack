#!/usr/bin/env node
/** Copy the shared skills, including sibling references, into Codex's skill directory. */
import { cpSync, lstatSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { existsSync } from "node:fs";
import { parseSettings, saveSettings, type Settings } from "../skills/setup-it/config.ts";

const usage = `Usage: node scripts/install-codex.ts [--dest <skills-directory>] [setup options]

Default: ~/.agents/skills (available to Codex in every project).
For one project: --dest <project>/.agents/skills
Copies all it-stack skills and resources; never overwrites existing skill paths.
Setup: --git-host auto|github|gitlab --harness auto|t3|paseo
       --setup-scope user|project --project-file <AGENTS.md or CLAUDE.md>
       --skip-setup (no prompts or settings writes)
Without a terminal, setup is deferred unless explicit settings are supplied.
`;

function projectFile(): string | undefined {
  let root: string;
  try { root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return undefined; }
  const agents = join(root, 'AGENTS.md');
  const claude = join(root, 'CLAUDE.md');
  if (existsSync(agents) && existsSync(claude)) throw new Error('Both instruction files exist; choose --project-file or use setup-it');
  return existsSync(claude) ? claude : agents;
}

async function setup(options: ReturnType<typeof parseSettings>): Promise<void> {
  if (options.skip) return;
  const explicit = Object.keys(options.settings).length > 0 || options.scope || options.projectFile;
  if (!explicit && !(process.stdin.isTTY && process.stdout.isTTY)) return;
  let scope = options.scope ?? (options.projectFile ? 'project' : undefined);
  let path = options.projectFile ? resolve(options.projectFile) : undefined;
  if (scope !== 'user' && !path) path = projectFile();
  scope ??= path ? 'project' : 'user';
  if (scope === 'project' && !path) throw new Error('Project setup needs a repository or --project-file');
  path = scope === 'user' ? join(homedir(), '.it-stack', 'config.json') : path!;
  const settings: Settings = { ...options.settings };
  if (!explicit) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
      const answer = await rl.question(`Configure Git host and Harness in ${path}? [y/N] `);
      if (answer.trim().toLowerCase() !== 'y') return;
      const host = (await rl.question('Git host [auto/github/gitlab] (auto): ')).trim() || 'auto';
      const harness = (await rl.question('Harness — where sessions run [auto/t3/paseo] (auto): ')).trim() || 'auto';
      Object.assign(settings, parseSettings(['--git-host', host, '--harness', harness]).settings);
    } finally { rl.close(); }
  }
  settings.setup = 'complete';
  saveSettings(path, settings, scope);
  console.log(`Saved Git host and Harness settings to ${path}.`);
}

try {
  const options = parseSettings(process.argv.slice(2));
  if (options.help) {
    console.log(usage);
  } else {
    const destination = options.destination ? resolve(options.destination) : join(homedir(), ".agents", "skills");
    const source = fileURLToPath(new URL("../skills/", import.meta.url));
    const names = readdirSync(source, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    // Preflight every name before creating anything, including dangling symlinks.
    for (const name of names) {
      const target = join(destination, name);
      try {
        lstatSync(target);
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
        throw error;
      }
      throw new Error(`${target} already exists. Back it up or choose another --dest; no skills were copied.`);
    }

    mkdirSync(destination, { recursive: true });
    for (const name of names) {
      cpSync(join(source, name), join(destination, name), { recursive: true, force: false, errorOnExist: true });
    }
    console.log(`Installed ${names.length} it-stack skills in ${destination}.\nIn Codex, use $do-it to start. Restart Codex if the skills do not appear.`);
    console.log('Use setup-it to configure Git host and Harness; otherwise first use offers setup.');
    await setup(options);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage);
  process.exitCode = 1;
}
