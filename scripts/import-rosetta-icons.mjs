#!/usr/bin/env node
/*
 * Imports SVGs bulk-exported from the Rosetta Figma library into ds/icons/.
 *
 * Usage:
 *   node scripts/import-rosetta-icons.mjs <export-dir> [<export-dir> ...] [--dry-run]
 *
 * Figma writes one file per component, named after the layer, and turns "/" in
 * layer names into real subdirectories (so "Logo / Facebook" lands at
 * "Logo/Facebook.svg"). Nested paths are flattened back into a single
 * hyphenated name.
 */

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ICONS_DIR = join(REPO_ROOT, "ds", "icons");

/*
 * Existing ds/icons filenames that predate this import, mapped to the Rosetta
 * component whose artwork should fill them. Preserving these names means the
 * prototypes keep working without touching any HTML.
 */
const ALIASES = {
  "icon-calendar": "Calendar",
  "icon-check": "Checkmark",
  "icon-chevron-down": "Chevron Small Down",
  "icon-chevron-left": "Chevron Small Left",
  "icon-chevron-right": "Chevron Small Right",
  "icon-chevron-up": "Chevron Small Up",
  "icon-comment": "Message",
  "icon-contrast": "Contrast",
  "icon-cross-lg": "Cross Large",
  "icon-cross-sm": "Cross Small",
  "icon-download": "Download",
  "icon-duplicate": "Duplicate",
  "icon-edit": "Edit",
  "icon-ellipsis": "Ellipses",
  "icon-external": "External Link",
  "icon-industry-business": "Business",
  "icon-industry-fitness": "Fitness",
  "icon-link": "Link",
  "icon-minus": "Minus",
  "icon-plus": "Plus",
  "icon-share": "Share",
  "icon-sparkles": "Sparkles",
  "icon-trash-bin": "Trash",
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const sourceDirs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--icons" || args[i] === "--glyphs") {
    const dir = args[++i];
    if (!dir) {
      console.error(`${args[i - 1]} needs a directory`);
      process.exit(1);
    }
    sourceDirs.push({ dir, isGlyph: args[i - 1] === "--glyphs" });
  }
}

if (sourceDirs.length === 0) {
  console.error("usage: node scripts/import-rosetta-icons.mjs --icons <dir> [--glyphs <dir>] [--dry-run]");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.toLowerCase().endsWith(".svg")) out.push(full);
  }
  return out;
}

function kebab(str) {
  return str
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/*
 * Figma emits literal hex fills and strokes. Rewriting them to currentColor is
 * what lets a single file serve both the .acuity-icon mask utility and plain
 * <img> use. "none" is the canvas and must survive untouched.
 */
function normalize(svg) {
  return svg
    .replace(/(fill|stroke)="(?!none")[^"]*"/g, '$1="currentColor"')
    .replace(/(fill|stroke):\s*(?!none)[^;"]+/g, "$1: currentColor")
    .replace(/\s+id="[^"]*"/g, "")
    .trimEnd()
    .concat("\n");
}

const byRosettaName = new Map();
const collisions = [];

for (const { dir, isGlyph } of sourceDirs) {
  for (const file of walk(dir)) {
    // "Logo/Facebook.svg" -> "Logo Facebook"; keeps logos distinguishable.
    const rel = relative(dir, file).replace(/\.svg$/i, "");
    let rosettaName = rel.split(sep).join(" ");

    /*
     * Most glyph layers are named "<Icon> Glyph", but 14 of them omit the
     * suffix and would otherwise overwrite the 22x22 icon of the same name
     * with the 16x16 glyph. Enforce the suffix instead of trusting the export.
     */
    if (isGlyph && !/\bglyph$/i.test(rosettaName)) rosettaName += " Glyph";

    const existing = byRosettaName.get(rosettaName);
    if (existing) collisions.push(`${rosettaName}: ${existing.file} vs ${file}`);
    byRosettaName.set(rosettaName, { file, leaf: rel.split(sep).pop() });
  }
}

if (!dryRun) mkdirSync(ICONS_DIR, { recursive: true });

// Rosetta ships icons on a 22x22 frame and the smaller glyphs on 16x16.
const EXPECTED_VIEWBOXES = new Set(["0 0 22 22", "0 0 16 16"]);

const written = [];
const oddSized = [];
const seenTargets = new Map();

for (const [rosettaName, { file }] of byRosettaName) {
  const svg = normalize(readFileSync(file, "utf8"));
  const target = `icon-${kebab(rosettaName)}.svg`;

  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (viewBox && !EXPECTED_VIEWBOXES.has(viewBox)) oddSized.push(`${target} (${viewBox})`);

  const prior = seenTargets.get(target);
  if (prior) collisions.push(`${target}: "${prior}" and "${rosettaName}" collapse to the same filename`);
  seenTargets.set(target, rosettaName);

  if (!dryRun) writeFileSync(join(ICONS_DIR, target), svg);
  written.push(target);
}

const aliased = [];
const unresolved = [];

for (const [aliasName, rosettaName] of Object.entries(ALIASES)) {
  const source = byRosettaName.get(rosettaName);
  if (!source) {
    unresolved.push(`${aliasName}  <-  "${rosettaName}" not found in export`);
    continue;
  }
  if (!dryRun) {
    writeFileSync(join(ICONS_DIR, `${aliasName}.svg`), normalize(readFileSync(source.file, "utf8")));
  }
  aliased.push(`${aliasName}.svg  <-  ${rosettaName}`);
}

/*
 * The catalog is too large to hand-maintain in preview.html, so the browser
 * page is generated alongside the icons. Names are inlined rather than fetched
 * so the page still works when opened over file://.
 */
function buildGallery(names) {
  const items = names
    .slice()
    .sort()
    .map((n) => n.replace(/^icon-|\.svg$/g, ""));

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acuity — Icon Library</title>
  <link rel="stylesheet" href="./font.css">
  <link rel="stylesheet" href="./tokens.css">
  <link rel="stylesheet" href="./tokens.dark.css">
  <link rel="stylesheet" href="./components.css">
  <style>
    body {
      margin: 0;
      padding: var(--acuity-spacing-32);
      background: var(--acuity-bg-inset);
      color: var(--acuity-fg-default);
      font-family: var(--acuity-font-family-sans);
    }
    .toolbar {
      display: flex;
      gap: var(--acuity-spacing-12);
      align-items: center;
      flex-wrap: wrap;
      padding: var(--acuity-spacing-12) var(--acuity-spacing-16);
      background: var(--acuity-bg-base);
      border: var(--acuity-border-width-default) solid var(--acuity-border-default);
      border-radius: var(--acuity-border-radius-md);
      margin-bottom: var(--acuity-spacing-24);
      position: sticky;
      top: var(--acuity-spacing-16);
      z-index: var(--acuity-z-sticky);
    }
    .toolbar input {
      flex: 1;
      min-width: 200px;
      padding: var(--acuity-spacing-8) var(--acuity-spacing-12);
      border: var(--acuity-border-width-default) solid var(--acuity-border-default);
      border-radius: var(--acuity-border-radius-sm);
      font-family: var(--acuity-font-family-sans);
      background: var(--acuity-bg-base);
      color: var(--acuity-fg-default);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--acuity-spacing-8);
    }
    .cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--acuity-spacing-8);
      padding: var(--acuity-spacing-12) var(--acuity-spacing-8);
      background: var(--acuity-bg-base);
      border: var(--acuity-border-width-default) solid var(--acuity-border-default);
      border-radius: var(--acuity-border-radius-md);
      cursor: pointer;
      text-align: center;
      word-break: break-word;
    }
    .cell:hover { background: var(--acuity-bg-default); border-color: var(--acuity-border-strong); }
    .cell code { font-family: var(--acuity-font-family-mono); font-size: var(--acuity-font-size-11); color: var(--acuity-fg-muted); }
    .cell[hidden] { display: none; }
  </style>
</head>
<body>
  <div class="toolbar">
    <input id="q" type="search" placeholder="Filter ${items.length} icons…" autofocus>
    <span class="text-caption" id="count" style="color: var(--acuity-fg-muted);"></span>
    <button class="acuity-button acuity-button--secondary acuity-button--sm" id="theme">Dark</button>
  </div>
  <p class="text-caption" style="color: var(--acuity-fg-muted); margin: 0 0 var(--acuity-spacing-16);">
    Imported from the Rosetta Figma library. Click any icon to copy its <code>.acuity-icon</code> markup.
  </p>
  <div class="grid" id="grid"></div>
  <script>
    const NAMES = ${JSON.stringify(items)};
    const grid = document.getElementById("grid");
    const count = document.getElementById("count");

    grid.innerHTML = NAMES.map((n) =>
      '<div class="cell" data-name="' + n + '">' +
      '<span class="acuity-icon acuity-icon--lg" style="--icon: url(\\'./icons/icon-' + n + '.svg\\')"></span>' +
      '<code>' + n + '</code></div>'
    ).join("");

    const cells = [...grid.children];
    const render = (q) => {
      let shown = 0;
      for (const cell of cells) {
        const hit = cell.dataset.name.includes(q);
        cell.hidden = !hit;
        if (hit) shown++;
      }
      count.textContent = shown + " of " + NAMES.length;
    };
    render("");

    document.getElementById("q").addEventListener("input", (e) =>
      render(e.target.value.trim().toLowerCase().replace(/\\s+/g, "-"))
    );

    grid.addEventListener("click", (e) => {
      const cell = e.target.closest(".cell");
      if (!cell) return;
      const markup = '<span class="acuity-icon acuity-icon--md" style="--icon: url(\\'../ds/icons/icon-' +
        cell.dataset.name + '.svg\\')"></span>';
      navigator.clipboard.writeText(markup);
      const code = cell.querySelector("code");
      const original = code.textContent;
      code.textContent = "copied!";
      setTimeout(() => { code.textContent = original; }, 900);
    });

    document.getElementById("theme").addEventListener("click", (e) => {
      const dark = document.documentElement.dataset.theme === "dark";
      document.documentElement.dataset.theme = dark ? "light" : "dark";
      e.target.textContent = dark ? "Dark" : "Light";
    });
  </script>
</body>
</html>
`;
}

if (!dryRun) {
  const allNames = readdirSync(ICONS_DIR).filter((f) => f.endsWith(".svg"));
  writeFileSync(join(REPO_ROOT, "ds", "icons.html"), buildGallery(allNames));
}

console.log(`${dryRun ? "[dry run] " : ""}Rosetta import`);
  console.log(`  source dirs : ${sourceDirs.map((s) => s.dir).join(", ")}`);
console.log(`  icons written: ${written.length}`);
console.log(`  aliases kept : ${aliased.length}`);

if (collisions.length) console.log(`\nName collisions (${collisions.length}):\n  ` + collisions.join("\n  "));
if (aliased.length) console.log("\nAliases:\n  " + aliased.join("\n  "));
if (unresolved.length) console.log("\nUnresolved aliases (left untouched):\n  " + unresolved.join("\n  "));
if (oddSized.length) console.log(`\nNon-22x22 viewBoxes (${oddSized.length}):\n  ` + oddSized.join("\n  "));
