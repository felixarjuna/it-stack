#!/usr/bin/env node
/** Copy the shared skills, including sibling references, into Codex's skill directory. */
import { cpSync, lstatSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const usage = `Usage: node scripts/install-codex.mjs [--dest <skills-directory>]

Default: ~/.agents/skills (available to Codex in every project).
For one project: --dest <project>/.agents/skills
Copies all it-stack skills and resources; never overwrites existing skill paths.
`;

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage);
  } else {
    if (args.length && !(args.length === 2 && args[0] === "--dest" && args[1].trim() && !args[1].startsWith("--"))) {
      throw new Error(usage);
    }
    const destination = args.length ? resolve(args[1]) : join(homedir(), ".agents", "skills");
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
        if (error.code === "ENOENT") continue;
        throw error;
      }
      throw new Error(`${target} already exists. Back it up or choose another --dest; no skills were copied.`);
    }

    mkdirSync(destination, { recursive: true });
    for (const name of names) {
      cpSync(join(source, name), join(destination, name), { recursive: true, force: false, errorOnExist: true });
    }
    console.log(`Installed ${names.length} it-stack skills in ${destination}.\nIn Codex, use $do-it to start. Restart Codex if the skills do not appear.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
