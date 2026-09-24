# Acuity Prototypes — Design System

This repo holds two static-HTML concept prototypes (`c3_a/`, `c3_b/`) for Acuity scheduling. All design tokens, brand-personality tokens, and component primitives live in [ds/](ds/) at the repo root and are shared by both prototypes.

## Project structure

```
ds/
  tokens.css            Acuity-native design tokens (color, type, space, radius, shadow, border, z-index)
  tokens.dark.css       Dark-theme overrides (apply by setting data-theme="dark" on <html>)
  font.css              @font-face for Clarkson and Clarkson Serif
  components.css        Component primitives (.acuity-*) + text-style utility classes (.text-*)
  brand-palettes.css    User-pickable 5-swatch palettes (--brand-palette-1..5)
  brand-fonts.css       User-pickable brand fonts (--brand-font-family)
  preview.html          Showcase of every component in every theme/palette/font
  fonts/                Clarkson and Clarkson Serif woff/woff2
  icons/                Shared SVG icons
c3_a/index.html         "Immerse" prototype
c3_b/index.html         "Compact" prototype
```

## Token taxonomy

Two namespaces. They are NOT interchangeable.

| Namespace | Use for | Examples |
|---|---|---|
| `--acuity-*` | Acuity *chrome* — nav, sheets, controls, forms, modals, anything Acuity-branded that must stay consistent regardless of the user's chosen palette | `--acuity-bg-base`, `--acuity-fg-default`, `--acuity-border-default`, `--acuity-spacing-16`, `--acuity-z-modal` |
| `--brand-*` | The *user's content* — booking page preview, widget previews, palette/font picker outputs. Changes with whatever palette / font the user picks. | `--brand-palette-1` through `--brand-palette-5`, `--brand-font-family` |

**Rule of thumb:** If the value styles "Acuity-the-product," use `--acuity-*`. If it styles "the user's own website we're previewing inside Acuity," use `--brand-*`.

## Acuity token reference

### Color

- **Semantic foreground:** `--acuity-fg-default` (primary text), `--acuity-fg-muted`, `--acuity-fg-disabled`, `--acuity-fg-on-strong`, `--acuity-fg-danger`, `--acuity-fg-success`, `--acuity-fg-warning`, `--acuity-fg-info`, `--acuity-fg-accent`, `--acuity-fg-brand`
- **Semantic background:** `--acuity-bg-base`, `--acuity-bg-inset`, `--acuity-bg-default`, `--acuity-bg-strong`, plus `*-default`/`*-strong` pairs for each semantic role (danger/success/warning/info/accent), and `--acuity-bg-brand-{subtle,default,strong,on-strong}`
- **Semantic border:** `--acuity-border-{default,muted,strong,danger,success,warning,info,accent,brand}`
- **Overlays (new):** `--acuity-bg-overlay-scrim` (rgba(0,0,0,0.5)), `--acuity-bg-overlay-strong`, `--acuity-bg-glass-light`
- **Neutral ramp:** `--acuity-color-neutral-gray-{10,20,30,40,50,60,70,80,90,100,1000,base}` — `-1000` is `#000000` (new); `-base` is `#ffffff`
- **System palettes:** `--acuity-color-system-{red,green,yellow,blue}-{10..100}`
- **Themed palettes** (mostly unused today; available when needed): `morning-{desert-sky,pink,coral,orange}`, `mid-day-{sky-blue,yellow,fog,blue}`, `dawn-{lavender-sky,purple,violet,light-pink}`, `evening-{green-flash,green,dark-blue,navy}`, each with `-10..-100` ramps

### Typography

- **Family:** `--acuity-font-family-sans` (Clarkson), `--acuity-font-family-display` (Clarkson Serif), `--acuity-font-family-mono` (SF Mono)
- **Weight:** `--acuity-font-weight-{book:400, medium:500, semibold:600, bold:700}`
- **Font size:** `--acuity-font-size-11: 11px` is the only standalone size token. For everything else use the **text-style utility classes** below.
- **Text-style utility classes** (preferred over hand-rolling): `.text-label`, `.text-caption`, `.text-action`, `.text-body-{book,medium,semibold,mono}`, `.text-subtitle-{book,medium,semibold}`, `.text-section-title-{sm,lg}`, `.text-title-{sm,lg}`, `.text-display-title`, `.text-hero-figure`. Mobile variants: `.text-mobile-*`.

### Spacing

`--acuity-spacing-{2,4,8,12,16,20,24,32,40,48,56,64,96,120,160}` (all px). The scale is the menu — don't use values off-scale.

### Border radius

`--acuity-border-radius-{none:0, xs:2, sm:4, md:8, lg:12, xl:16, 2xl:24, 3xl:40, round:9999}`, plus the alias `--acuity-border-radius-sheet` (= `2xl`) for bottom-sheet top corners.

### Border width

`--acuity-border-width-{hairline:0.5px, default:1px, thick:1.5px, heavy:2px}`.

### Shadow

`--acuity-shadow-light-{100..500}` and `--acuity-shadow-dark-{100..500}` for the standard light/dark recipes. `--acuity-shadow-light-inverted-{200,300}` for bottom-anchored sticky bars (negative-Y offset).

### Z-index

Use the named scale, never raw numbers.

| Token | Value | Use for |
|---|---|---|
| `--acuity-z-base` | 1 | Local stacking inside a component |
| `--acuity-z-sticky` | 100 | Sticky headers/footers |
| `--acuity-z-dropdown` | 200 | Dropdown menus |
| `--acuity-z-sheet` | 300 | Bottom sheets |
| `--acuity-z-modal` | 400 | Centered modal dialogs |
| `--acuity-z-toast` | 500 | Toast notifications |
| `--acuity-z-tooltip` | 600 | Tooltips |
| `--acuity-z-popover` | 700 | Popovers / coachmarks |
| `--acuity-z-emergency` | 9999 | Last resort |

## Brand token reference

### Palettes

5 swatches per palette, set via the `data-brand-palette` attribute on `<html>` (or any ancestor of the content you want themed):

```html
<html data-brand-palette="sunset">
```

Variables: `--brand-palette-1` through `--brand-palette-5`. The picker UI maps 1:1 to these.

Shipped presets (in `ds/brand-palettes.css`): `neutral` (default), `orchid`, `desert`, `meadow`, `sunset`, `lime`, `forest`, `violet`. Add new palettes by adding a `[data-brand-palette="<name>"]` block to `brand-palettes.css`.

### Fonts

```html
<html data-brand-font="poppins">
```

Variable: `--brand-font-family`. Default: Source Sans Pro (set under `[data-brand-font="source-sans-pro"]` and on `:root`).

Shipped fonts: `source-sans-pro` (default), `poppins`, `raleway`, `quicksand`, `oswald`, `playfair-display`, `concert-one`, `ibm-plex-mono`. Add new fonts by extending the `@import url(...)` in `brand-fonts.css` and adding a `[data-brand-font="<name>"]` rule.

## Component primitives

All component classes are in `ds/components.css`. Naming convention: `.acuity-<component>` with `--<variant>` modifier suffix and `__<part>` element suffix (BEM-lite).

Every component below has a live example in `ds/preview.html`.

| Component | Variants | Sizes | Notes |
|---|---|---|---|
| `.acuity-button` | `--primary`, `--secondary`, `--tertiary`, `--destructive`, `--ghost` | `--sm`, `--md`, `--lg` | Modifiers: `--icon-only`, `--loading`, `--full-width`. Use `<button class="acuity-button acuity-button--primary acuity-button--md">…</button>` |
| `.acuity-icon-button` | `--ghost`, `--primary`, `--secondary`, `--destructive`, `--strong`, `--default`, `--alt`, `--subtle` | `--xs` (22px), `--sm` (28px), `--md` (36px), `--lg` (44px) | Always set `aria-label`. Sizes are fixed boxes, not padding-derived. Two independent variant axes exist (ghost/primary/secondary/destructive vs. strong/default/alt/subtle, the latter matching Figma's Icon Button component 1:1) — don't mix a variant from one axis with the size-only assumption of the other; use whichever axis fits the surrounding component's existing convention. |
| `.acuity-card` | `--padding-{none,sm,md,lg}`, `--shadow-{sm,md,lg}`, `--interactive`, `--borderless` | — | Pure container |
| `.acuity-chip` | `--neutral`, `--brand`, `--success`, `--danger`, `--warning`, `--info`, `--interactive`, `--selected` | `--sm`, `--md` | Add a `.acuity-chip__remove` button for removable chips |
| `.acuity-input` | `--has-leading-icon`, `--has-trailing-icon`, `--error`, `--disabled` | `--sm`, `--md` | Composite: `__label`, `__wrapper`, `__field`, `__icon-leading`, `__icon-trailing`, `__helper`, `__error`. Add `.acuity-textarea` to the field for multi-line. |
| `.acuity-radio-card` | — | — | Wraps a hidden `<input type="radio">` with parts `__input`, `__card`, `__icon`, `__content`, `__title`, `__description`, `__media` |
| `.acuity-toggle-switch` | — | — | iOS-style on/off. Wraps a hidden `<input type="checkbox">` with `__track` + `__thumb` |
| `.acuity-dialog-backdrop` + `.acuity-dialog` | `--sm`, `--md`, `--lg` on the dialog; `--bottom` on the backdrop for sheet | — | Parts: `__header`, `__title`, `__description`, `__body`, `__footer`. Show with `.acuity-dialog-backdrop--visible`. |
| `.acuity-spinner` | — | `--xs`, `--sm`, `--md`, `--lg` | Inherits color from parent |
| `.acuity-stepper` | — | — | Add `.acuity-stepper__step` children; modifiers `--current`, `--complete` |
| `.acuity-appointment-card` | `--ai`, `--selected-item`, `--with-image` | — | Parts: `__thumb`, `__body`, `__name`, `__meta`, `__description`, `__actions` |
| `.acuity-top-nav` | — | — | Parts: `__back`, `__title`, `__action`, `__step-label` |
| `.acuity-bottom-nav` | — | — | Sticky footer; respects `safe-area-inset-bottom` |
| `.acuity-wizard-header` | — | — | Parts: `__heading`, `__subheading` |
| `.acuity-mini-row` | — | — | Parts: `__label`, `__meta`. Drops border on `:last-child` automatically. |
| `.acuity-big-input` | — | — | Ghost-styled wizard title input; uses `field-sizing: content` |
| `.acuity-char-counter` | `--is-maxed` | — | Parts: `__count`, `__error` |
| `.acuity-ai-badge` | — | — | Animated conic-gradient border via `@property --acuity-ai-badge-angle` |

## Naming conventions

- **Component classes:** `.acuity-<component>` (lowercase, kebab-case for compound names like `icon-button`)
- **Variants:** double-dash suffix → `.acuity-button--primary`, `.acuity-card--shadow-md`
- **Parts:** double-underscore suffix → `.acuity-dialog__header`
- **Runtime state:** prefer `data-*` attributes on the element (`data-theme="dark"`, `data-brand-palette="sunset"`) or `aria-*` attributes (`aria-disabled="true"`). Avoid `is-*` state classes except where the existing component conventions use them (`--is-maxed`).
- **Tokens:** `--acuity-<category>-<role>[-<step>]` for Acuity-native; `--brand-<thing>[-<N>]` for brand. Never mix the two prefixes inside one rule.

## Before adding new UI — checklist

1. **Is there an existing token for the value you need?** Search `ds/tokens.css` first. Use it.
2. **Is there an existing `.acuity-*` component for the pattern?** Check `ds/components.css` and `ds/preview.html`. Use it.
3. **If you need a new value or component**, propose adding it to `ds/tokens.css` / `ds/components.css`. Don't write a one-off inline rule. Even prototype code is a future migration cost.
4. **Distinguish Acuity-chrome from user-content.** If the styling is for the user's site preview, reach for `--brand-*`, not `--acuity-*`. (Most new work belongs to `--acuity-*`.)
5. **No raw hex/rgba/font-size/spacing values** in `components.css` or in new prototype rules. The system exists to prevent drift.
6. **Add a `preview.html` entry** for any new component primitive so the visual catalog stays complete.

## Migration policy

The existing inline styles inside [c3_a/index.html](c3_a/index.html) (~9k lines) and [c3_b/index.html](c3_b/index.html) (~7k lines) are *not* refactored as part of this Phase 2 system creation. A follow-up pass will migrate them incrementally. When working in the prototype HTML:

- **New** additions should use the `.acuity-*` and `.text-*` classes from `components.css` whenever possible.
- **Mechanical** drift fixes (replacing `#ffffff` → `var(--acuity-bg-base)`, `#e7e7e7` → `var(--acuity-border-default)`, etc.) are encouraged opportunistically but not required.
- **Source Sans Pro** inline rules can be converted to `font-family: var(--brand-font-family)` to make the font-picker mechanism work.
- The audit at [.claude/plans/audit-this-codebase-s-ui-sequential-sifakis.md](.claude/plans/audit-this-codebase-s-ui-sequential-sifakis.md) lists every drift offender by frequency — use it as the migration checklist.

## Icons

All canonical icons live in [ds/icons/](ds/icons/) as individual SVG files. Every icon is normalized to use `fill="currentColor"` so it inherits color from its parent — no two-tone or hardcoded fills.

### How to render an icon

**Tintable (preferred)** — use the `.acuity-icon` utility class. The icon inherits its parent's `color`, so a delete button with `color: var(--acuity-fg-danger)` automatically gets a red trash icon.

```html
<span class="acuity-icon acuity-icon--md" style="--icon: url('../ds/icons/icon-trash-bin.svg')"></span>
```

Sizes: `--xs` (12px), `--sm` (14px), `--md` (16px, default), `--lg` (20px), `--xl` (24px).

**Decorative `<img>`** — if you don't need tinting (e.g. a static page illustration), a plain `<img>` works:

```html
<img src="../ds/icons/icon-calendar.svg" alt="" width="22" height="22">
```

Note: `<img>` renders the SVG in isolation, so `currentColor` resolves to the SVG's default (black). For tintable icons, prefer the `.acuity-icon` utility above.

### Icon inventory

`ds/icons/` holds the full **Rosetta** library imported from the Squarespace Figma source — 475 icons on a 22×22 frame and 483 glyphs (the smaller 16×16 cuts) — plus a handful of local icons with no Rosetta equivalent.

Naming follows Rosetta's own component names, kebab-cased: `Chevron Small Down` → `icon-chevron-small-down.svg`, `Notification Bell` → `icon-notification-bell.svg`. Glyphs keep a `-glyph` suffix (`icon-accordion-glyph.svg`). Brand logos are namespaced `icon-logo-*` (`icon-logo-instagram.svg`).

**Don't browse the folder to find an icon** — open [ds/icons.html](ds/icons.html), which renders and filters all of them and copies the markup on click.

A set of pre-Rosetta filenames are kept as aliases so existing prototype markup keeps resolving. They hold current Rosetta artwork under the older name: `icon-check` (Checkmark), `icon-cross-{sm,lg}` (Cross Small/Large), `icon-ellipsis` (Ellipses), `icon-external` (External Link), `icon-trash-bin` (Trash), `icon-comment` (Message), `icon-chevron-{left,right,up,down}` (Chevron Small *), and `icon-industry-{business,fitness}`. Prefer the canonical Rosetta name in new code.

Local icons with no Rosetta counterpart, left as-is: `icon-image-plus`, `icon-plus-filled`, and `icon-industry-{beauty,education,utility,wellness}`.

### Adding or refreshing icons

Icons are not hand-added. To re-import after a Rosetta release:

1. In Figma Desktop, open the Rosetta library and select all on the **Icons** page (`Cmd+A`), then Export as **SVG** to a folder. Repeat for the **Glyphs** page.
2. Run the importer, which normalizes fills to `currentColor`, flattens Figma's `Logo/` subfolders, enforces the `-glyph` suffix, refreshes the aliases above, and regenerates `ds/icons.html`:

```bash
node scripts/import-rosetta-icons.mjs --icons <icons-dir> --glyphs <glyphs-dir> --dry-run
```

Review the dry-run output — it reports filename collisions, unresolved aliases, and unexpected viewBoxes — then re-run without `--dry-run`.

For a genuinely bespoke icon that isn't in Rosetta, save it to `ds/icons/icon-<kebab-name>.svg` with `fill="currentColor"` and add it to the `ALIASES`-adjacent local set so a future re-import doesn't clobber it.

### Where the prototypes still reference local copies

The prototype HTML files in [c3_a/](c3_a/index.html) and [c3_b/](c3_b/index.html) still load icons from their own `assets/` folders (e.g. `<img src="assets/icon-trash-bin.svg">`). That's left in place — migrating those references to `../ds/icons/` is part of the prototype-migration pass, not the system build.

## Dark theme

Set `data-theme="dark"` on `<html>` to apply the dark overrides from `tokens.dark.css`. The override only retargets the semantic `--acuity-fg-*`, `--acuity-bg-*`, and `--acuity-border-*` tokens — raw palette tokens are unchanged.
