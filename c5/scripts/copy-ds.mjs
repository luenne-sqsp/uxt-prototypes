// Copies the subset of the shared ds/ design system that c5 needs into
// public/ds/, so index.html can link plain absolute paths (/ds/tokens.css
// etc.) that resolve identically in dev and in the built output — the css
// url()s inside font.css/components.css otherwise only resolve against the
// stylesheet's own served location, which import.meta-based resolution
// doesn't give us for free across the ../ds boundary.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const dsSrc = path.resolve(here, '../../ds');
const dsDest = path.resolve(here, '../public/ds');

const FILES = [
  'font.css',
  'tokens.css',
  'tokens.dark.css',
  'brand-fonts.css',
  'brand-palettes.css',
  'components.css',
];
const DIRS = ['fonts', 'icons'];

rmSync(dsDest, { recursive: true, force: true });
mkdirSync(dsDest, { recursive: true });

for (const file of FILES) {
  cpSync(path.join(dsSrc, file), path.join(dsDest, file));
}
for (const dir of DIRS) {
  cpSync(path.join(dsSrc, dir), path.join(dsDest, dir), { recursive: true });
}

console.log(`[copy-ds] synced ${FILES.length} files + ${DIRS.join(', ')} into public/ds/`);
