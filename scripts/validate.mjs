#!/usr/bin/env node
/**
 * Checks the stack before it ships: skill frontmatter, manifests, README
 * table, fallbacks for referenced plugins, and no private or project text.
 *
 *   node scripts/validate.mjs [root]
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = /^[a-z]+-it$/;
const MAX_DESCRIPTION = 1024;
const FRONTMATTER = /^---\r?\n(?<body>[\s\S]*?)\r?\n---/;
const REFERENCES_PLUGIN = /mattpocock-skills|superpowers:/;
const FALLBACK_HEADING = /^## If it isn't installed/m;
const PRIVATE_TEXT = [
  { label: "project name", pattern: /perki/i },
  { label: "project city", pattern: /aachen/i },
  {
    label: "email address",
    pattern: /(?<![\w.+-])(?!noreply@)[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,
  },
  { label: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}/ },
  { label: "API key", pattern: /\bsk-[A-Za-z0-9-]{16,}/ },
  {
    label: "database URL with a password",
    pattern: /\w+:\/\/[^\s:/@]+:[^\s@/]+@/,
  },
];
/** Folders the private-text check skips: design history and the checker itself. */
const UNCHECKED = new Set([
  ".git",
  ".superpowers",
  "docs",
  "node_modules",
  "scripts",
]);

const read = (path) => readFileSync(path, "utf8");

/** Top-level keys of the frontmatter; `>` and `|` blocks join their indented lines. */
const frontmatter = (text) => {
  const body = FRONTMATTER.exec(text)?.groups?.body;
  if (!body) return null;
  const meta = {};
  let blockKey = null;
  for (const line of body.split(/\r?\n/)) {
    const field = /^(?<key>[\w-]+):\s*(?<value>.*)$/.exec(line)?.groups;
    if (field) {
      const isBlock = /^[>|][+-]?$/.test(field.value.trim());
      blockKey = isBlock ? field.key : null;
      meta[field.key] = isBlock ? "" : field.value.trim();
    } else if (blockKey && /^\s/.test(line)) {
      meta[blockKey] = `${meta[blockKey]} ${line.trim()}`.trim();
    }
  }
  return meta;
};

const filesUnder = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });

const checkManifests = (root) => {
  const pluginPath = join(root, ".claude-plugin/plugin.json");
  const marketPath = join(root, ".claude-plugin/marketplace.json");
  if (!(existsSync(pluginPath) && existsSync(marketPath))) {
    return [".claude-plugin/plugin.json and marketplace.json are required"];
  }
  const plugin = JSON.parse(read(pluginPath));
  const market = JSON.parse(read(marketPath));
  const listed = market.plugins?.map((entry) => entry.name) ?? [];
  return listed.includes(plugin.name)
    ? []
    : [`marketplace.json doesn't list plugin "${plugin.name}"`];
};

const checkSkill = (root, folder, readme) => {
  const path = join(root, "skills", folder, "SKILL.md");
  if (!existsSync(path)) return [`skills/${folder} has no SKILL.md`];
  const text = read(path);
  const meta = frontmatter(text);
  const problems = [];
  if (!SKILL_NAME.test(folder)) {
    problems.push(`skills/${folder}: folder name must be <verb>-it`);
  }
  if (meta?.name !== folder) {
    problems.push(`skills/${folder}: frontmatter name must be "${folder}"`);
  }
  if (!meta?.description) {
    problems.push(`skills/${folder}: description is required`);
  } else if (meta.description.length > MAX_DESCRIPTION) {
    problems.push(`skills/${folder}: description over ${MAX_DESCRIPTION} chars`);
  }
  if (REFERENCES_PLUGIN.test(text) && !FALLBACK_HEADING.test(text)) {
    problems.push(
      `skills/${folder}: references another plugin without a fallback ("## If it isn't installed")`
    );
  }
  if (!readme.includes(`\`${folder}\``)) {
    problems.push(`README.md doesn't list ${folder}`);
  }
  return problems;
};

const checkPrivateText = (root) =>
  readdirSync(root)
    .filter((entry) => !UNCHECKED.has(entry))
    .flatMap((entry) => {
      const path = join(root, entry);
      return statSync(path).isDirectory() ? filesUnder(path) : [path];
    })
    .flatMap((path) => {
      const text = read(path);
      return PRIVATE_TEXT.filter(({ pattern }) => pattern.test(text)).map(
        ({ label }) => `${relative(root, path)}: contains a ${label}`
      );
    });

/** Every problem in the stack at `root`; empty when it's fine to ship. */
export const validate = (root) => {
  const readme = existsSync(join(root, "README.md"))
    ? read(join(root, "README.md"))
    : "";
  const skillsDir = join(root, "skills");
  const folders = existsSync(skillsDir)
    ? readdirSync(skillsDir).filter((entry) =>
        statSync(join(skillsDir, entry)).isDirectory()
      )
    : [];
  return [
    ...checkManifests(root),
    ...(readme ? [] : ["README.md is required"]),
    ...folders.flatMap((folder) => checkSkill(root, folder, readme)),
    ...checkPrivateText(root),
  ];
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = validate(process.argv[2] ?? process.cwd());
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) process.exit(1);
  console.log("it-stack: all checks passed");
}
