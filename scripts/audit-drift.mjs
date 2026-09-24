#!/usr/bin/env node
/*
 * Design-system drift ratchet for c5/src/. Counts, per .vue file, how much
 * raw/bespoke styling has crept in versus using ds/ tokens and components —
 * see CLAUDE.md's "Before adding new UI" checklist and the c5 plan's "Why
 * the cleanup will actually happen this time" section.
 *
 * Usage:
 *   node scripts/audit-drift.mjs            compare against the baseline,
 *                                            fail if any file's count rose
 *   node scripts/audit-drift.mjs --report    print the current per-file
 *                                            table; don't compare or write
 *
 * On first run (no baseline yet) this just records one and exits 0. On
 * later runs, a file's count is allowed to *drop* (the baseline ratchets
 * down with it) but never to rise — debt can only shrink. New files get
 * their current counts recorded as their own starting baseline, since
 * there's nothing yet to regress against.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(REPO_ROOT, 'c5', 'src');
const BASELINE_PATH = join(REPO_ROOT, 'c5', '.drift-baseline.json');

// Small recursive walk instead of fs.globSync — that's still experimental
// as of Node 22 and prints a warning on every run.
function findVueFiles(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findVueFiles(abs, base));
    else if (entry.name.endsWith('.vue')) out.push(relative(base, abs));
  }
  return out;
}

const CATEGORIES = ['rawHex', 'rawRgba', 'rawFontSize', 'offScaleSpacing', 'bespokeClasses'];

// Off-scale spacing check compares literal px values against this scale —
// see CLAUDE.md's spacing token reference. Anything else found on a
// spacing-shaped property is drift.
const SPACING_SCALE = new Set([2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 96, 120, 160]);
const SPACING_PROPS = /\b(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|block|inline))?\s*:\s*([^;]+);/g;

// Seeded from the c3_c1 -> ds/components.css substitution table in the c5
// plan (the mechanical-drift-fix list validated against the real prototype).
// A class appearing here in a screen's <template> means a DS primitive
// already exists and wasn't reached for.
const BESPOKE_CLASS_MAP = {
  'appt-card': '.acuity-appointment-card',
  'appt-card--ai': '.acuity-appointment-card--ai',
  'appt-card--selected-item': '.acuity-appointment-card--selected-item',
  chip: '.acuity-chip',
  'industry-card': '.acuity-radio-card',
  'top-nav': '.acuity-top-nav',
  'bottom-nav': '.acuity-bottom-nav (use the real one, not a look-alike)',
  'toggle-switch': '.acuity-toggle-switch',
  'field-input': '.acuity-input',
  'modal-overlay': '.acuity-dialog-backdrop',
  'sheet-overlay': '.acuity-dialog-backdrop--bottom',
  'btn-primary': '.acuity-button--primary',
  'btn-secondary': '.acuity-button--secondary',
  'btn-ghost': '.acuity-button--ghost',
};

function extractBlocks(source, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
  const blocks = [];
  let m;
  while ((m = re.exec(source))) blocks.push(m[1]);
  return blocks;
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function countOffScaleSpacing(styleText) {
  let count = 0;
  let m;
  SPACING_PROPS.lastIndex = 0;
  while ((m = SPACING_PROPS.exec(styleText))) {
    const values = m[1].match(/(\d+(?:\.\d+)?)px/g) || [];
    for (const v of values) {
      const n = parseFloat(v);
      if (!SPACING_SCALE.has(n)) count += 1;
    }
  }
  return count;
}

function countBespokeClasses(templateText) {
  // Exact token match against each class="..." attribute's whitespace-
  // separated class list — a substring/word-boundary regex would also
  // match e.g. "top-nav" inside "desktop-top-nav" or "acuity-top-nav",
  // since '-' counts as a word-boundary character.
  let count = 0;
  const classAttrRe = /class="([^"]*)"/g;
  let m;
  while ((m = classAttrRe.exec(templateText))) {
    const tokens = m[1].split(/\s+/);
    for (const token of tokens) {
      if (BESPOKE_CLASS_MAP[token]) count += 1;
    }
  }
  return count;
}

function auditFile(absPath) {
  const source = readFileSync(absPath, 'utf8');
  const styleText = extractBlocks(source, 'style').join('\n');
  const templateText = extractBlocks(source, 'template').join('\n');

  return {
    rawHex: countMatches(styleText, /#[0-9a-fA-F]{3,8}\b/g),
    rawRgba: countMatches(styleText, /\brgba?\(/g),
    rawFontSize: countMatches(styleText, /font-size:\s*\d+(?:\.\d+)?px/g),
    offScaleSpacing: countOffScaleSpacing(styleText),
    bespokeClasses: countBespokeClasses(templateText),
  };
}

function total(counts) {
  return CATEGORIES.reduce((sum, c) => sum + counts[c], 0);
}

function main() {
  const reportOnly = process.argv.includes('--report');

  const files = findVueFiles(SRC_DIR).sort();
  const current = {};
  for (const f of files) {
    current[f] = auditFile(join(SRC_DIR, f));
  }

  if (reportOnly) {
    console.log('File'.padEnd(50), ...CATEGORIES.map((c) => c.padEnd(16)), 'total');
    for (const f of files) {
      const c = current[f];
      console.log(f.padEnd(50), ...CATEGORIES.map((k) => String(c[k]).padEnd(16)), total(c));
    }
    return;
  }

  if (!existsSync(BASELINE_PATH)) {
    writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2) + '\n');
    console.log(`[audit-drift] no baseline found — wrote one for ${files.length} files at ${relative(REPO_ROOT, BASELINE_PATH)}`);
    return;
  }

  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const regressions = [];
  const next = { ...baseline };

  for (const f of files) {
    const cur = current[f];
    const base = baseline[f];
    if (!base) {
      next[f] = cur; // new file — nothing to regress against yet
      continue;
    }
    for (const cat of CATEGORIES) {
      if (cur[cat] > base[cat]) {
        regressions.push(`  ${f}: ${cat} ${base[cat]} -> ${cur[cat]}`);
      }
    }
    // Ratchet down: record whichever is lower, so debt can't creep back up.
    next[f] = {};
    for (const cat of CATEGORIES) next[f][cat] = Math.min(cur[cat], base[cat]);
  }

  if (regressions.length) {
    console.error('[audit-drift] drift increased in:');
    console.error(regressions.join('\n'));
    console.error('\nRun `node scripts/audit-drift.mjs --report` for the full per-file table.');
    process.exit(1);
  }

  writeFileSync(BASELINE_PATH, JSON.stringify(next, null, 2) + '\n');
  console.log(`[audit-drift] ok — ${files.length} files, no regressions.`);
}

main();
