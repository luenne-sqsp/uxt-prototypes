# C3_C0 — Engineering Handoff / Design-vs-Prototype Audit

**Flow:** Acuity pre-account onboarding wizard (desktop v1)
**Figma source:** [`Desktop v1` — node `6772:416926`](https://www.figma.com/design/JH3hH70rICVAGzyfRwbnF0/-P--Playground-Growth-2026?node-id=6772-416926)
**Prototype source:** `c3_c2/index.html` (single file, 12,321 lines), backed by `api/save-s2-input.js` and `c3_c2/templates/*.json`
**Audit date:** 2026-08-20
**Scope:** Documentation only. No Figma frames created, no prototype code modified.

---

## Flow at a glance

Both sources implement the same happy path, ordered left-to-right on the Figma canvas and by `showScreen()` in the prototype:

| # | Prototype id | Figma frame | Purpose |
|---|---|---|---|
| 1 | `s1` | `S1` (`6772:416932`) | Welcome / value prop → "Start setup" |
| 2 | `s2` | `S2` (`6772:418425`) | "Tell us what you do" — free-text business description |
| 3 | `s4` | `S4` (`6772:416927`) | Loading while the appointment catalog is derived |
| 4 | `s5` | `Pre-account editor` (`6772:417252`, `417408`, `418456`) | "Add your first appointment" — suggestion list + selection + live preview |
| 4a | `#panel-c1`…`#panel-c5` | `Dialog` (`6772:418609`), `Dialog - C02`…`C05` | Create-appointment sub-flow: title → description → duration → price → image |
| 4b | `.style-side-panel` | `customize toggle` section (`6772:434200`) | Styles panel: colors, fonts, business name, logo |
| 5 | `s9` | `Pre-account editor` (`6772:417584`, `417731`) | "When can clients book you?" — availability |
| 6 | `s10` | `Pre-account editor` (`6772:417953`, `418031`) | "You are ready for your first booking!" — share link |
| 7 | `s_loading_home` | *(none)* | Loading "Setting up your account…" |
| 8 | `s_home` | `Landing on product dashboard` section (`6772:431778`) | Product dashboard (terminal) |

Supporting Figma detail sets that are **not** standalone screens: `generate description` (`6772:432056`), `smarter pricing` (`6772:431779`), `Availability summary card variants` (`6772:420276`).

---

## 1. STATE INVENTORY

Legend: **Y** = present, **N** = absent, **Partial** = exists but incomplete or only for a sub-case.

| Screen | State | Design exists? | Prototype exists? | Notes |
|---|---|---|---|---|
| **S1 — Welcome** | Default | Partial | Y | Three illustrated value props + "Start setup". The prototype also has a **`Skip` ghost button** (line 6273) → `goHomeViaLoading()`; the Figma `S1` bottom-nav has only the single primary button. **Skip is undesigned.** |
| | Loading | N | N/A | Nothing async; not needed. |
| | Empty | N/A | N/A | Static content. |
| | Error | N | N | If the Lottie/`dotlottie-player` CDN script fails, `s1` is unaffected, but see S4. |
| | Boundary | N | Partial | Prototype has a `.lottie-fallback` dots element; localization/long-copy behaviour untested. |
| | Success | N/A | N/A | — |
| **S2 — Tell us what you do** | Default | Y | Y | Figma shows a rotating giant placeholder; prototype implements it as `#s3-other-placeholder-overlay`. |
| | Loading | N | N | Submit is synchronous (local classification), so no spinner. If classification ever moves server-side, this state is undefined. |
| | Empty | Y (implicit) | Y | Empty input = `Next` disabled (`nextBtn.disabled = !hasText`, line 10112). Figma shows the empty/placeholder frame but does **not** show a disabled `Next`. |
| | Error — validation | **N** | Partial | Prototype has a char-counter error (`150 max. character limit reached`, line 10091) driven by `S2_MAX_CHARS`. **No such counter or error exists in the Figma frame at all.** |
| | Error — network | **N** | **N** | `_s2LogSubmission()` (line 10288) swallows all failures with `.catch(() => {})`. The API can return **400** and **500** (`api/save-s2-input.js` lines 22, 55) and the user is never told. |
| | Error — permission | **N** | **N** | Not modelled anywhere. |
| | Boundary — long text | Partial | Y | `maxlength="150"` (line 6342) hard-caps input; font auto-shrinks via `_s2FitInputFont()` across a 64/44/32px ladder. Figma shows only one text length. **Server cap is 1000 chars (`MAX_TEXT_LENGTH`) — the two limits disagree.** |
| | Boundary — offline | N | N | No `navigator.onLine` handling anywhere in the file. |
| | Boundary — unrecognized input | **N** | Y | Prototype falls back to `Other` + a synthesized catalog (`_s3OtherGenerateTemplate`, line 10279). Design shows no "we couldn't match that" affordance. |
| | Suggestion chips | **Empty frame** | **N** | Figma has a `chips row` frame (`6772:418448`, 1312×52) with **zero children**. Prototype comment at line 6327 explicitly says "No live feedback (no chips, nothing clickable)". Intent unclear — see Open Question 3. |
| **S4 — Catalog loading** | Default/loading | Y | Y | Figma copy: **"Generating appointments"**. Prototype copy: **"Building your catalog…"** (line 6377). Divergent. |
| | Timeout / slow | **N** | **N** | Fixed `setTimeout(… , 2000)` (line 9126). No timeout ceiling, no "still working" copy. |
| | Error | **N** | **N** | The six template `fetch()` calls (lines 8035–8040) are wrapped in `Promise.all(...).then(...)` with **no `.catch()`**. A 404/offline produces an unhandled rejection and the screen advances to a partially-initialised S5 anyway. |
| | Cancel / back | **N** | **N** | No way out of S4; the auto-advance is unconditional. |
| **S5 — Add your first appointment** | Default | Y | Y | Three suggestion cards + "Create new appointment". |
| | Loading | **N** | Y | Prototype renders 4 `.appt-card--skeleton` cards for ~400ms (`generateAISuggestions()`, line 11923). **No skeleton state for this list exists in Figma** — the two `Skeleton` instances in the file (`6772:417282/417283`) belong to the *booking-page preview*, not the suggestion list. |
| | Empty — 0 selected | Y | Y | Figma `6772:417252` shows `YOUR APPOINTMENTS (0)` with a greyed `Continue with selection`. Prototype matches (`btn-primary--disabled`, line 8381). |
| | Empty — 0 suggestions | **N** | **N** | No branch renders "no suggestions". `getTemplateFallback()` always returns something, so this is currently unreachable — but only by accident. |
| | Error — suggestion generation | **N** | **N** | Suggestions are local, not networked. If they ever become a real AI call, this state is undefined. |
| | Boundary — max items | Y | **Partial — bug** | Cap of **3** enforced on the *suggestion* path (lines 8203, 8574, 8641) but **`addCreatedService()` (line 9526) pushes to `state.selectedAppts` with no cap check** — the create sub-flow can exceed 3. Figma `6772:417252` says "Choose up to **3** services"; the `customize toggle` frame (`6772:434200`) says "Choose up to **5** services". **Design contradicts itself, and the implementation is bypassable.** |
| | Boundary — at-cap feedback | Partial | Partial | `atCap` disables the `+` button on unselected cards, but nothing explains *why*. No tooltip, no message. |
| | Boundary — long appointment name | **N** | Y | CSS truncation only (`text-overflow: ellipsis`, line 850; `-webkit-line-clamp: 2`, line 890). No design for the truncated case. |
| | Success | N/A | N/A | Progression is the confirmation. |
| **S5a — Create appointment (C1 title)** | Default | Y | Y | Figma `6772:418609`. Chips row "POPULAR WITH SIMILAR BUSINESSES". |
| | Empty / gating | Y | **N — divergence** | Figma `6772:418609` shows `Next` visibly greyed on an empty title. **The prototype does not gate C1 at all** — `Next` always advances, and an empty name silently becomes `'New appointment'` (line 9528). The edit sheet has the same pattern, defaulting to `'Untitled'` (line 8757). |
| | Error — duplicate name | **N** | **N** | Nothing prevents creating two appointments with the same title. |
| | Boundary — long title | **N** | **N** | No `maxlength` on the C1 name input. |
| | Boundary — 0 chips | **N** | Y | `rebuildCreateChips()` (line 9170) falls back to appointment names so the row "should never render empty". Design assumes chips always exist. |
| **S5a — C2 description** | Default | Y | Y | Marked `(Optional)` in both. |
| | Loading (AI generate) | **Y** | Y | Figma `generate description` section (`6772:432056`) shows the full sequence: idle → "Generating description" + `Loading / Icon` → result with `Generated` badge → "Generate new" → "Undo / Generate new". Prototype disables the input while generating (`descInput.disabled = isGenerating`, line 9349). Good coverage — the best-specified state in the flow. |
| | Error — AI generation fails | **N** | **N** | No failed/retry frame in the 5-variant sequence. |
| | Boundary — regenerate limit | **N** | Y | `C2_GENERATE_MAX = 3` (line 9286); the "Generate new" button stops working after 3 attempts (lines 9363, 9415). **The design's regenerate sequence shows no limit and no at-limit treatment.** |
| | Boundary — long text | Y | Y | `maxlength="512"` (lines 6608, 6942) + `.c2-char-counter`. |
| **S5a — C3 duration** | Default | Y | Y | Stepper + preset chips. |
| | Boundary — min/max | **N** | Y | Prototype clamps to **15–360 min** and snaps to a 15-min grid (line 9580). Figma presets stop at "2 hours" (row is clipped) and **no frame states the floor or ceiling**, so the clamp is undocumented in design. |
| | Error | N | N | — |
| **S5a — C4 price** | Default | Y | Y | Figma `6772:418794` shows `$0`. |
| | Price-tier feedback | Y | Y | `smarter pricing` section (`6772:431779`) defines 4 badges: `Market rate`, `Within typical range`, `Below market`, `Premium`. Prototype implements all 5 labels incl. `Build momentum` in `_c4PriceStatus()` (line 11967). |
| | Boundary — $0 | Partial | Y | Figma's default frame shows `$0` with **no badge**; the prototype would label it `Below market`. Divergent. |
| | Boundary — very large price | Y | Y | Figma shows `$2000 → Premium`. Prototype has no upper bound or digit cap. |
| | Error — invalid price | **N** | **N** | No validation for negative or non-numeric entry. |
| **S5a — C5 image** | Default | Y | Y | Figma `6772:418868`: collage + "Upload" + "1.5 MB max. JPEG, GIF, and PNG formats supported." Prototype copy matches (line 7076). |
| | Uploading / progress | **N** | **N** | No upload progress state in either source. |
| | Error — file too large | **N** | **N** | The 1.5 MB limit is **copy only**; no `.size` check exists in the prototype. |
| | Error — wrong file type | **N** | **N** | Input is `accept="image/*"` (lines 6568, 7067-area), which contradicts the JPEG/GIF/PNG copy — SVG/WEBP/HEIC are all accepted. |
| | Success | Y | Y | Uploaded asset card with Replace / Remove. |
| **S5b — Styles panel** | Default | Y | Y | `customize toggle` section: Colors / Fonts / Miscellaneous. |
| | Logo upload error | **N** | **Y** | The logo uploader **is** validated: PNG-only and 20 MB, with inline error copy `PNG files only.` / `20 MB max.` rendered into `.style-misc-logo-error` (lines 11603–11612). **No Figma frame shows either error.** Note the contrast with C5, which validates nothing — and the design copy says "20 MB max" for the logo vs "1.5 MB" for an appointment image. |
| | Boundary — long business name | **N** | **N** | Free-text field, no cap shown or enforced. |
| **S9 — Availability** | Default | Y | Y | Summary card "Monday to Friday, 9 AM — 5 PM". |
| | Loading | **N** | Partial | Preview iframe has a `skeletonOnEmpty` path (line 8464) but the availability panel itself renders synchronously. |
| | Empty — no availability | **N** | Y | Prototype renders `No availability set` (line 10516) via `.avail-card-summary-empty`. **Not in Figma.** |
| | Per-day unavailable | Y | Y | Figma `6772:417731` shows `Su`/`Sa` as "Unavailable"; prototype matches (`_availUnavailableRowHTML`, line 10735). |
| | Error — end before start | **N** | **N** | Nothing prevents `5 PM — 9 AM`. |
| | Error — overlapping ranges | **N** | **N** | The `+` per row adds ranges with no conflict check. |
| | Boundary — complex schedules | **Y** | Partial | `Availability summary card variants` (`6772:420276`) covers 9 cases incl. 3 ranges/day, per-day variance, "Open 24 hours". Excellent design coverage; prototype's summary-collapsing logic should be verified against all 9. |
| | Boundary — timezone | Partial | Partial | Figma hardcodes `(GMT-7:00) PACIFIC TIME` as an underlined (interactive-looking) link. No picker state designed. |
| | Gating | **N** | **N** | `Finish` appears always enabled. Undefined whether zero availability should block. The prototype also exposes a **`Skip` nav action** (line 7215) → `_advanceFromS9()`, which is **absent from the Figma S9 frames**. |
| **S10 — Ready to book** | Default / success | Y | Y | This *is* the success state. Hero + share URL + "Keep exploring" cards. |
| | Copy-link confirmation | **N** | Y | Prototype shows a `Link copied!` toast for 1500ms (lines 7834, 11876). **Not in Figma.** |
| | Error — copy fails | **N** | **N** | `navigator.clipboard` rejection unhandled. |
| | Boundary — long URL | **N** | **N** | Slug is hardcoded `cedargroup.as.me` in the design. |
| | "Keep exploring" cards | Y | Partial | Figma `6772:417953` shows 4 cards (Book a test appointment, Connect payments, Sync your calendar, Download the app). Verify all 4 exist and are wired in the prototype. |
| **s_loading_home** | Loading | **N** | Y | Copy "Setting up your account…", 1800ms (line 11872). The Figma `S4` frame's inner instance is *named* `creating account` (`6772:416931`) but *renders* "Generating appointments" — so this second loading screen is effectively unrepresented. |
| | Error | **N** | **N** | Account creation cannot fail in either source. This is the single highest-risk gap for real implementation. |
| **s_home — Dashboard** | Default (setup) | Y | Y | Setup-guide checklist state. |
| | Default (ready) | Y | Y | `showHomeState(arrivedHomeFromSkip)` (line 9151) branches on arrival path. |
| | Loading | N | N | Dashboard data is mocked. |
| | Empty | N | N | Zero appointments / zero bookings not designed. |
| | Error | N | N | — |

### Cross-cutting states missing from **both** sources

1. **Any network/server error surface.** Zero retry affordances and zero error banners for anything asynchronous. The only error messaging that exists anywhere in the flow is client-side and local: the S2/description character counters and the logo uploader's `PNG files only.` / `20 MB max.`. None of it is announced — there are zero `role="alert"` and zero `aria-live` regions in the file.
2. **Offline.** No `navigator.onLine` check, no offline copy, no queued-write behaviour.
3. **Session/permission errors.** No 401/403 handling, no re-auth path.
4. **Unsaved-changes guard.** Every screen has an `×` close that jumps straight to `s_home`. No confirmation dialog is designed or implemented.
5. **Browser back-button behaviour.** `showScreen()` uses `history.replaceState` (line 9112), so the browser Back button leaves the flow entirely instead of stepping back a screen.

---

## 2. INTERACTION & TRANSITION LOGIC

### S1 → S2
- **Trigger:** "Start setup" — `onclick="showScreen('s2')"` (line 6272).
- **Gating:** none.
- **Also present:** a `Skip` ghost button (line 6273) and the desktop `×`, both → `goHomeViaLoading()` → `s_loading_home` → `s_home`, setting `arrivedHomeFromSkip = true` so the dashboard renders its 0% setup-checklist state.
- **Divergence:** the `Skip` button is not in the Figma `S1` frame.
- **Ambiguous:** neither `Skip` nor `×` has a confirmation, and neither explains what "closing" onboarding means for the account.

### S2 → S4
- **Trigger (primary):** `Next` — `onclick="_s3OtherSubmit()"` (line 6364). Enter also submits (line 10118).
- **Trigger (secondary):** `Skip` in the top nav — `onclick="showScreen('s4')"` (line 6315), bypassing all validation.
- **Gating:** `Next` is `disabled` unless `input.value.trim()` is non-empty (line 10112). Hard cap 150 chars.
- **Side effect:** `_s2LogSubmission()` fires and is fully fire-and-forget.
- **Divergence:** Figma shows `Next` in its **enabled** style with an empty field. The prototype disables it. The design does not document the disabled treatment.
- **Divergence:** the `Skip` action is present in the prototype's top nav but **absent from the Figma `S2` frame** (`6772:418425` has only the logo and a close icon-button). Skipping bypasses `interpretBusinessDescription()` entirely, so `window._selectedVertical` stays at its bootstrap default of **`Beauty`** (line 12293) — a user who skips silently receives a beauty-industry catalog regardless of their actual business, with no indication why.

### S4 → S5
- **Trigger:** unconditional `setTimeout(() => showScreen('s5'), 2000)` (line 9126).
- **Gating:** none. Not tied to actual work completing — the template `fetch`es may still be in flight.
- **Divergence:** the design implies "Generating appointments" is real work; the prototype is a fixed 2s timer. Real implementation needs a completion signal and a slow-path story.

### S5 → S9
- **Trigger:** `#s5-continue` — handler attached only when `state.selectedAppts.length > 0` (line 8379).
- **Gating:** ≥1 and ≤3 selected. Enforced by swapping `btn-primary--disabled` and nulling `onclick` (lines 8377–8382).
- **Note:** this uses a **CSS class + `pointer-events: none`**, not the `disabled` attribute — unlike S2's `Next`, which uses the real attribute. Inconsistent, and the class approach leaves the control focusable and announced as enabled.
- **Cap bug:** the ≤3 limit is enforced only on the suggestion path. `addCreatedService()` (line 9526) appends unconditionally, so repeatedly using "Create new appointment" pushes past 3.
- **Create sub-flow:** `panel-c1` → `c2` → `c3` → `c4` → `c5`, with `Previous`/`Next` and a `Progress Indicator`. **No panel gates `Next`** — a user can click straight through and land a service named `'New appointment'` at `$0`. Figma shows C1's `Next` greyed out, so the design implies gating that was never built. In Figma all five `Progress Indicator` instances are identical (`520×2`, same fill) — **the progress bar does not visibly advance across the designed panels.** Either a variant wasn't applied or the component is static.

### S9 → S10
- **Trigger:** `Finish` → `showScreen('s10')` (line 11699).
- **Gating:** none detected. Undefined whether an empty schedule should block.
- **Undefined:** the "Setup different availabilities for different appointments" toggle (Figma `6772:417715`) has no designed "on" state and no prototype destination.

### S10 → s_home
- **Trigger (A):** "See dashboard" / `Close setup` / `×` → `showScreen('s_home')` directly (lines 7273, 7298, 7321).
- **Trigger (B):** `Finish setup` and `goHomeViaLoading()` → `s_loading_home` → 1800ms → `s_home` (lines 11871–11872).
- **Divergence:** two different paths to the same destination, one with an account-creation loading screen and one without. Figma's `DONE` button (`6772:417953`) doesn't disambiguate which is intended. If account creation is real, path A skips it.

### Backward navigation
`s2→s1`, `s5→s2`, `s9→s5`, `s10→s9` all wired with `showScreen(id,'back')`. **There is no back path out of `s4` or `s_loading_home`**, and no back path from `s_home` into the wizard except the `home-task-row` shortcut → `s2` (line 7707), which restarts at step 1 rather than resuming.

### State persistence
`_s2DraftText` is restored on re-entry to S2 (line 10097) — good. `state.selectedAppts`, availability, and style choices survive in-memory only; a page refresh loses everything. No `sessionStorage` for wizard state (only `localStorage` for `acuityServiceImages`, line 11887).

---

## 3. COMPONENT MAPPING

### Code Connect status

`get_code_connect_map` for node `6772:416926` returns **`{}`** — **there are zero Code Connect mappings for any node in this flow.** Every component listed below would need mapping before a design-to-code workflow produces useful output.

### Design-system adoption in the prototype

`c3_c2/index.html` **does** link all six shared stylesheets (lines 13–18: `font.css`, `tokens.css`, `tokens.dark.css`, `brand-fonts.css`, `brand-palettes.css`, `components.css`), but uses almost none of the primitives. Total `.acuity-*` component-class usages in 12,321 lines:

| Class | Occurrences |
|---|---|
| `.acuity-icon` (+ `--md`, `--sm`) | 16 |
| `.acuity-char-counter` | 2 |
| `.acuity-spinner` (+ `--sm`) | 2 |

That is **3 of the ~18 available primitives**, in a file whose `<style>` block runs from line 20 to line 6117 — roughly **6,100 lines of inline CSS, about half the file**.

Acuity tokens fare better: `var(--acuity-*)` is used widely for chrome. But there are still **276 raw hex literals**, led by `#0e0e0e` (34), `#e7e7e7` (22), `#ffffff` (16), `#c0c0c0` (8), `#424242` (8), plus ~46 raw `rgba()` values and ~100 off-scale `font-size` declarations.

**The brand-token layer is entirely unused.** `brand-palettes.css` and `brand-fonts.css` are linked, but there are **zero `var(--brand-*)` references and zero `data-brand-palette` / `data-brand-font` attributes** in the file. The booking-page preview instead hardcodes `'Source Sans Pro'` in **18 separate `font-family` declarations** (e.g. line 2315) and drives colour through JS palette arrays applied as inline `style=`. Per the repo's own token taxonomy this preview *is* "the user's own website we're previewing inside Acuity" — it is exactly what `--brand-*` exists for. Any production build should wire the preview through the brand-token mechanism rather than re-implementing it in JavaScript.

### Element-by-element mapping

| UI element | Figma component | Prototype implementation | Verdict |
|---|---|---|---|
| Primary CTA ("Start setup", "Next", "Finish") | `Button Special` (31 instances) | `.btn-primary` (one-off) | **Not mapped.** DS has `.acuity-button--primary`. |
| Secondary / Back | `Button` (27) | `.s5-back-btn`, `.btn-ghost` (one-off) | **Not mapped.** DS has `.acuity-button--secondary`/`--tertiary`. |
| Icon-only buttons (close, edit, trash, ±) | `Icon Button` (35) | `.nav-back`, `.appt-icon-btn`, `.icon-btn-circle`, `.sheet-asset-trash` (four separate one-offs) | **Not mapped.** DS has `.acuity-icon-button`. |
| Icons | `Icon` (38) + named glyphs | Mix: 16 uses of `.acuity-icon`, but most icons are **inline `<svg>` literals** pasted into markup | **Partially mapped.** Inline SVGs bypass `ds/icons/` entirely. |
| Suggestion/appointment card | `Appointment` (8), `Card` (4) | `.appt-card`, `.appt-card--ai`, `.appt-card--selected-item`, `.appt-card--skeleton` | **Not mapped.** DS has `.acuity-appointment-card` with the exact `--ai` / `--selected-item` variants. Near-duplicate. |
| Chips (industry, name, duration, price presets) | `Info Chip` (23) | `.chip--plain--default`, `.chip--plain--small` | **Not mapped.** DS has `.acuity-chip`. |
| Text inputs | `Text Input` (5), `Text Input in a Cell` (6) | `.s3-other-textarea`, `.c2-desc-input`, `.big-input`, `.duration-num` | **Not mapped.** DS has `.acuity-input` / `.acuity-big-input`. |
| Character counter | *(absent from S2 design)* | `.acuity-char-counter` | **Mapped** — the one clean case. |
| Spinner / loading | `Loading / Icon` (2) | `<dotlottie-player>` with a base64-inlined Lottie + `.dots` fallback | **Not mapped.** DS has `.acuity-spinner`. The Lottie JSON is inlined twice as a ~6 KB base64 data URI (lines 6375, 7411) — duplicated, unmaintainable. |
| Skeleton | `Skeleton` (2, in preview only) | `.appt-card--skeleton` | **Not mapped**, and the two don't refer to the same thing. |
| Create-appointment modal | `Dialog` frames | `.create-panel` divs inside `#s5` | **Not mapped**, and structurally divergent — see Accessibility. DS has `.acuity-dialog`. |
| Progress indicator | `Progress Indicator` (5, all identical) | `.create-progress` | **Not mapped**; design instances appear static. |
| Toggle | `Toggle` (1) | one-off | **Not mapped.** DS has `.acuity-toggle-switch`. |
| Stepper / step label | `Tabs` (12, **all `hidden="true"`**) | `.step-label`, `.wizard-eyebrow` | **Not mapped.** DS has `.acuity-stepper`. The Figma `Tabs` instances are all hidden — dead layers. |
| Top nav | `Header` (12), `Acuity Logo` (9) | `.top-nav`, `.desktop-top-nav` | **Not mapped.** DS has `.acuity-top-nav`. |
| Bottom nav | `Footer` (9) | `.bottom-nav` | **Not mapped.** DS has `.acuity-bottom-nav`. |
| Wizard header | — (raw frames) | `.wizard-header` / `.wizard-heading` / `.wizard-subheading` | **Not mapped.** DS has `.acuity-wizard-header`. |
| Availability summary row | `Item` (14), `Edit` (9) | `.avail-summary-*` | **Not mapped.** Closest DS primitive is `.acuity-mini-row`. |
| Toast | *(absent from design)* | `.copy-toast` | **One-off**, no DS equivalent exists. |
| "Generated" / AI badge | `Sparkles Glyph` (1) | one-off | DS has `.acuity-ai-badge`. **Not mapped.** |

### Detached / non-component layers in Figma

Across the six wizard screens the file contains **806 raw `<frame>` layers vs. only 330 `<instance>`s** — roughly 71% of the structure is not componentised. Specific concerns:

- **S1's entire illustration set** (`about you`, `add`, `custom`, `asset-frame`, and ~20 `Placeholder text` / `Card` frames, nodes `6772:416943`–`416997`) is built from raw frames. These are the most visually prominent elements on the first screen and have no component backing.
- **`Tabs` ×12, `Button` ×several, and other instances are `hidden="true"`** — 372 hidden layers across the file. Engineering can't tell which are intentional alternates and which are abandoned.
- **S2's `chips row`** (`6772:418448`) is an empty frame with no children.
- **`Progress Indicator`** instances are identical across all five dialog panels, suggesting no variant was applied.

---

## 4. ACCESSIBILITY NOTES

### Critical — `aria-hidden` on visible, focusable content

Nine container elements are marked `aria-hidden="true"` unconditionally while containing real focusable `<button>`s:

```
6133, 6294, 6387, 7129, 7266  <nav class="desktop-top-nav" aria-hidden="true">
6402, 7144                    <div class="s5-preview-pane" aria-hidden="true">
7281                          <div class="s10-desktop-body" aria-hidden="true">
7425                          <div class="home-desktop-body" aria-hidden="true">
```

This appears to be a "hide the desktop layout from AT because the mobile layout is also in the DOM" pattern, but it is applied without a media query. On a desktop viewport this means:

- The visible UI is **entirely invisible to screen readers** on S10 and `s_home`.
- Controls including `Close setup`, `Open scheduling page`, and `See dashboard` are **focusable but hidden** — a direct WCAG 4.1.2 (Name, Role, Value) failure.

### Focus states

- **Zero `:focus-visible` rules exist in the file.**
- Nine `outline: none` / `outline: 0` declarations (lines 548, 1210, 1305, 1654, 1801, 2834, 2959, 4970, plus two injected via JS at 9638 and 9688) remove the default focus ring. Two of them (2834, 2959) substitute a `border-color` change; the rest substitute nothing.
- No programmatic focus management on screen transitions. `showScreen()` (line 9088) moves visual context but never moves focus, so keyboard and screen-reader users stay on the old screen's control.
- The only `.focus()` call is `setTimeout(() => input.focus(), 60)` on S2 re-entry (line 10106).

### Dialogs

The create-appointment sub-flow renders as `.create-panel` divs inside `#s5`, not as dialogs:

- No `role="dialog"`, no `aria-modal="true"` — **zero occurrences of either in the file.**
- No focus trap, no `inert` on background content, no focus restore on close.
- **Escape *is* handled.** A global `keydown` listener (lines 11753–11769) closes the topmost of eight overlays in z-order, including `#create-overlay`, the edit card, the availability card, and the palette/font/pricing pickers. The availability popover has its own Escape handler (line 10935). This is done well and is the strongest keyboard behaviour in the file.
- Figma renders these over a dark scrim (`Dialog`, `6772:418609`), i.e. the design *is* modal while the implementation is not.

### Live regions

- **Zero `aria-live` regions and zero `role="alert"`/`role="status"`.**
- The `Link copied!` toast (line 7834) is purely visual — never announced.
- The `150 max. character limit reached` message (line 10091) is never announced.
- The S5 skeleton→content swap is silent.

### Form semantics

- No `aria-invalid` anywhere, so the char-limit error has no programmatic association with the input.
- S2's textarea has `aria-label="Describe your business"` (line 6343) — acceptable, though a visible `<label>` would be better.
- Disabled states are inconsistent: S2's `Next` uses the real `disabled` attribute; S5's `Continue with selection` uses `.btn-primary--disabled` (`opacity: 0.5; pointer-events: none`, lines 135–138), which leaves it focusable and announced as enabled.
- `pointer-events: none` also prevents any hover/tooltip explaining *why* the control is unavailable.

### Semantic HTML

142 real `<button>` elements do most of the work, which is good. But **29 click targets are `<div>`/`<span>` with an `onclick`** and are therefore not focusable, not keyboard-operable, and not announced as controls:

| Pattern | Count | Lines |
|---|---|---|
| Font picker rows | 14 | 6787–6839 |
| Palette picker rows | 8 | 6708–6757 |
| Overlay backdrop dismiss | 6 | 6695, 6774, 6854, 6886, 7840 |
| Appointment card body (`openEdit`) | per card (JS) | 8218 |
| Availability card head | per card (JS) | 10529 |

The palette and font pickers are the most serious: choosing a brand colour or typeface is impossible by keyboard. Both map cleanly onto the existing `.acuity-radio-card` primitive. The `.toggle-info-icon` (line 6640) is also a non-focusable `<span>` whose tooltip is hover-only, so its content is unreachable by keyboard.

### ARIA that is present

For balance — the file is not devoid of ARIA. `aria-label` is applied consistently to icon-only buttons, `aria-pressed` tracks the desktop/mobile preview segments (line 6447, updated at 8561), `aria-expanded` + `aria-haspopup` are on the style-widget trigger (line 6455, toggled at 11538/11555), and the availability day popover uses `role="menu"` / `role="menuitem"` (lines 10906–10908). All `<img>` elements have an `alt` attribute, with decorative images correctly set to `alt=""`.

What's missing is state and status: no `aria-selected` on appointment cards, no `aria-checked` on the toggle switches, no `aria-current` on the step indicator, and no live regions at all.

### Motion

`@media (prefers-reduced-motion: no-preference)` at line 3934 correctly gates the shimmer, screen transitions, AI-badge spin, and toast fade — this is the right direction (opt-in rather than opt-out) and is one of the stronger parts of the implementation. It is not exhaustive, though: the `.appt-card` `transition: border-color 200ms` at line 746 sits outside the guard.

### Headings and landmarks

Real heading elements are used throughout — headings are not faked with styled divs. Three `<h1>`s exist (line 6162 on S1, and 7469 / 7615 for the desktop and mobile dashboard), with `<h2>` for screen and panel titles (e.g. 6322, 6908, 7284) and `<h3>`/`<h4>` on the dashboard.

Two structural gaps remain:

- **The wizard screens (`s2`, `s5`, `s9`, `s10`) have no `<h1>`** — their hierarchy starts at `<h2>`, so on those screens there is no top-level heading. All three `<h1>`s live in the DOM simultaneously, which is harmless while only one screen is visible but will confuse a document-outline tool.
- `<main>` appears **once**, on the desktop dashboard (line 7467). No wizard screen has a `<main>` landmark. `<nav>` landmarks exist but several are `aria-hidden` (see above). No `<header>` or `<footer>`.
- The "Step 1 of 3" indicator is a plain `<span>` (lines 6314, 6320) with no `aria-current` and no association with the heading.

### Contrast

Computed against the surfaces they actually sit on:

| Element | Colors | Ratio | Verdict |
|---|---|---|---|
| Body text | `#0e0e0e` on `#ffffff` | 18.9:1 | Pass |
| Muted text (`--acuity-fg-muted`) | `#666666` on `#ffffff` | 5.74:1 | Pass |
| **Input placeholder** | `--acuity-color-dawn-purple-100` (`#2e2950`) at `opacity: 0.2` → ≈`#d5d4dc` on white (lines 1685–1688, 1813–1816) | **1.47:1** | **Fail.** Critical on S2, where the giant rotating placeholder *is* the primary instruction. |
| **Pricing-tips helper text** | `#aaa` on `#ffffff` (inline, line 6873) | **2.32:1** | **Fail** (needs 4.5:1). |
| **Task circles / chevrons** | `#c0c0c0` on `#ffffff` (lines 3274, 7702, 7710–7720) | **1.82:1** | **Fail** (needs 3:1 as a state-bearing UI component). |
| **Disabled primary button label** | white on `#2e2950` at `opacity: 0.5` → ≈`#9694a8` | **2.96:1** | Fail. Normally exempt, but because S5 uses a class rather than the `disabled` attribute the exemption doesn't apply. |
| Brand swatch `#9e9e9e` | on `#ffffff` | 2.68:1 | Acceptable — it's a user-selectable palette swatch, not text. |

The Figma variables confirm the source of two of these: `Foreground/disabled` is `#B7B7B7` (2.01:1 on white) and `Dawn/purple/100` is `#2e2950`, used at 20% opacity for placeholders in the design as well — the light placeholder is visible in `S2` and in `Dialog - C02`/`C03`/`C04`.

---

## 5. OPEN QUESTIONS

Ordered roughly by how much they block implementation.

1. **What happens when account creation fails?** `s_loading_home` ("Setting up your account…") is a 1800ms timer with no failure path, and it has no Figma frame at all. This is the only irreversible server operation in the flow. Need: error copy, retry affordance, and a decision on whether the user's wizard input survives a failure.

2. **Which step count is correct — "of 3" or "of 5"?** Figma's `S2` says "STEP 1 of 3" while the editor frames say "STEP 4 OF 5" and "STEP 5 OF 5". The prototype is consistently "Step 1/2/3 of 3". If it's 5, steps 2 and 3 have no designs. If it's 3, the editor frames need relabelling.

3. **Should S2 have suggestion chips?** The Figma frame contains an empty `chips row` (`6772:418448`), and the prototype has a comment explicitly stating there is no live feedback. Is the chips row (a) cut, (b) not yet designed, or (c) expected to populate as the user types?

4. **Is the service cap 3 or 5, and what happens at the cap?** Figma says both ("Choose up to 3" in `6772:417252`, "Choose up to 5" in `6772:434200`). Beyond the copy conflict there is an implementation gap: the cap is enforced when adding from suggestions but **not** in `addCreatedService()` (line 9526), so the create flow can exceed it. Need the correct number, and a designed at-cap treatment — today the `+` buttons silently disable with no explanation.

5. **Should the create-appointment panels validate anything?** Figma shows C1's `Next` greyed out on an empty title, but no panel gates `Next` in the prototype: clicking straight through produces a service literally named `'New appointment'` priced at `$0`. Need to know which fields are required, and whether a partially-filled appointment should be discarded or saved as a draft.

6. **What are the real image constraints, and what does a rejected upload look like?** The two uploaders disagree and behave differently. The **logo** uploader enforces PNG-only + 20 MB with inline error copy (lines 11603–11612) that has **no Figma frame**. The **C5 appointment image** advertises "1.5 MB max. JPEG, GIF, and PNG" but enforces nothing and accepts `image/*`. Need one policy per surface, plus designed error states — and confirmation of whether PNG-only is really intended for logos.

7. **How many times can a user regenerate an AI description?** The prototype caps it at 3 (`C2_GENERATE_MAX`, line 9286); after that "Generate new" silently stops working. The design's regenerate sequence shows no limit and no at-limit treatment.

8. **Does the AI description generator have a failure state?** The `generate description` sequence designs idle → loading → result → regenerate → undo, but not "generation failed". Need error copy and whether the user can retry or must type manually.

9. **What gates "Finish" on S9?** Can a user finish with zero availability set? The prototype allows it and then shows "No availability set" — an empty state that exists in code but not in the design. Also undefined: end-time-before-start-time and overlapping-range validation.

10. **What does the "Setup different availabilities for different appointments" toggle do?** The toggle exists in Figma (`6772:417715`) with no "on" state designed and no prototype destination.

11. **Are the three Skip actions intended, and where should each land?** The prototype has Skip on **S1** (→ dashboard, 0% checklist), **S2** (→ S4, silently defaulting the catalog to `Beauty`), and **S9** (→ S10). **None of the three appears in the corresponding Figma frame.** If they stay, each needs designed copy and, for S2, some signal that the resulting catalog is a generic guess.

12. **What is the character limit on the business description?** The UI caps at 150; the server caps at 1000. Which is authoritative, and should the counter be visible before the limit is hit (the design shows no counter at all)?

13. **Does closing the wizard need a confirmation?** Every screen's `×` jumps straight to the dashboard with no guard and no designed dialog, discarding all in-memory state.

14. **Should the browser Back button step back through the wizard?** `showScreen()` uses `history.replaceState`, so Back currently exits the flow entirely.

15. **What is the intended slow/timeout behaviour on S4?** It is currently a fixed 2s timer decoupled from the actual template loads, which have no error handling (`Promise.all` with no `.catch()`). Need a real completion signal, a slow-path message, and a failure path.

16. **Which price gets which badge at the boundaries?** Figma's default C4 frame shows `$0` with no badge; the prototype's `_c4PriceStatus()` would label `$0` as "Below market". Also: is `$0` (free consultation) a legitimate value that should be labelled neutrally?

17. **Should the create-appointment panels be true modals?** Figma renders them over a scrim; the prototype renders them inline. Escape-to-close is already implemented, so the open items are specifically focus trapping, focus restore, background `inert`, and `role="dialog"`.

18. **Should the two paths to `s_home` behave differently?** "See dashboard" / `×` go straight there; "Finish setup" routes through the account-creation loading screen. If account creation is real, the direct paths skip it.

19. **Is the timezone on S9 user-editable?** It renders as an underlined link (`(GMT-7:00) PACIFIC TIME`) implying interactivity, but no picker is designed.

20. **Can two appointments share a title?** No uniqueness check exists in either source, and empty titles silently become `'New appointment'` / `'Untitled'`.

21. **Should wizard state survive a refresh?** Currently everything except the S2 draft text and service images is in-memory only.

22. **Should the booking-page preview be driven by `--brand-*` tokens?** Today it uses zero brand tokens: colour comes from JS palette arrays applied inline, and `'Source Sans Pro'` is hardcoded in 18 places. The design system already has the palette/font mechanism this preview is re-implementing.

23. **Can Code Connect mappings be established before build?** There are currently zero mappings for this flow, and the prototype re-implements ~15 existing DS primitives as one-offs. Agreeing the Figma-component → `.acuity-*` mapping up front would prevent the same drift in production code.

---

## Appendix — Notable copy divergences

| Location | Figma | Prototype |
|---|---|---|
| S4 loading label | "Generating appointments" | "Building your catalog…" (line 6377) |
| C3 title | "Set the appointment duration" | "Set an appointment duration" (line 6978) |
| C4 title | "Set the appointment price" | "Set a price for the appointment" (line 7012) |
| C5 title | "Add an image to your appointment" | "Add an image to your service" (line 7054) |
| C5 subtitle | "(Optional)" | "This is optional. You can skip this step" (line 7055) |
| S5 subheading | "Choose up to 3 services…" / "Choose up to 5 services…" | "Choose up to 3 services…" (line 6485) |

Note the "appointment" vs. "service" terminology is used interchangeably in both sources — worth settling before build.
