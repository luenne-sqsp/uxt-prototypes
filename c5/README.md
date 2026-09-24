# c5 — Variant-aware prototype

Vue 3 + Vite port of `c3_c1`, built to support branching screen and
component variants without duplicating the whole prototype. See
`.claude/plans/lazy-wibbling-taco.md` at the repo root for the full
architecture writeup.

```
npm install
npm run dev
```

`npm run dev`/`npm run build` first sync the subset of `../ds/` this app
needs into `public/ds/` (see `scripts/copy-ds.mjs`) — edit the design
system at the repo root, not the copy here.

The hierarchy — screens, their variants, component slots, and named
concept-variant presets — is declared in `src/variants.json`. Adding a
new screen variant means adding a `.vue` file under `src/screens/` and
one entry in that manifest; nothing else needs to change.

## Design-system drift ratchet

```
npm run audit:drift          # from the repo root — fails if drift increased
npm run audit:drift:report   # prints the current per-file count table
```

Counts raw hex/`rgba()`/off-scale spacing in `<style>` blocks and bespoke
classes with a known `ds/components.css` equivalent, per `.vue` file, and
compares against `c5/.drift-baseline.json`. A file's count can drop (the
baseline ratchets down with it) but never rise — see `scripts/audit-drift.mjs`.
Not wired into CI or installed as an active git hook; `.githooks/pre-commit`
runs it and is ready to opt into with `git config core.hooksPath .githooks`
if you want it enforced locally.
