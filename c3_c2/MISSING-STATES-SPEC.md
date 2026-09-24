# C3_C0 — Missing-State Build Spec & Checklist

**Companion to:** [`HANDOFF.md`](./HANDOFF.md) (state inventory + open questions)
**Figma file:** [`-P- Playground Growth 2026`](https://www.figma.com/design/JH3hH70rICVAGzyfRwbnF0/-P--Playground-Growth-2026?node-id=6772-416926)
**Source section:** `Desktop v1` — `6772:416926` — **read-only for this pass, do not modify**
**Date:** 2026-08-20

---

## Why this is a spec and not frames

I could not author the frames directly. The Figma MCP server exposes only read tools (`get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`, `get_motion_context`, `get_figjam`) plus the two Code Connect write tools (`add_code_connect_map`, `send_code_connect_mappings`), which attach code mappings to existing nodes. There is no API to create frames, layers, instances, or sections, so every entry below is written as a build recipe a designer executes in Figma.

Each recipe names the **exact node to duplicate** and the **exact changes**, so most entries are a duplicate-and-edit rather than a fresh layout.

### Decisions applied

| Decision | Value | Effect on this spec |
|---|---|---|
| Step counter | **3 steps** (`Step 1/2/3 of 3`) | All new frames use "of 3". The existing `Desktop v1` editor frames say "STEP 4 OF 5" / "STEP 5 OF 5" — **stale, but left untouched per your instruction.** Logged as `CL-46`. |
| Service cap | **3** | At-cap frames show 3 selected. S5 subheading reads "Choose up to 3 services…". The `customize toggle` frame's "up to 5" is stale — logged as `CL-47`. |
| Image upload | **Unify** | See the proposal immediately below — this one needs your sign-off before the four upload frames can be built. |

### Upload policy — proposal needing sign-off

You asked to unify, but the two surfaces currently disagree on both axes, and picking either existing value alone causes a regression:

| Surface | Today's limit | Today's formats |
|---|---|---|
| C5 appointment image | 1.5 MB (copy only, unenforced) | JPEG, GIF, PNG (copy) / `image/*` (actual) |
| Styles logo | 20 MB (enforced) | PNG only (enforced) |

**Recommendation: 20 MB, and JPEG / PNG / GIF on both surfaces** — the union of what is already permitted, so nothing that works today starts failing. Two caveats to check before I finalise the error copy:

1. **PNG-only for the logo may be deliberate** (transparency against arbitrary page backgrounds). If so, the logo keeps a narrower format list and only the *size* limit unifies — say so and I'll split the spec.
2. **20 MB needs backend confirmation.** 1.5 MB is unusably tight for a phone photo, but 20 MB is a real bandwidth cost on mobile. If there's a storage constraint, name the number and I'll propagate it.

Until this is settled, frames `E9`–`E11` and `F1`–`F2` are specced with the limit as a token placeholder `{MAX_SIZE}` / `{FORMATS}`.

---

## 0. New primitives required first

**There is no alert, banner, toast, empty-state, or inline-error component anywhere in the Figma file.** I searched every instance name across all 882 instances: zero matches for alert, banner, toast, error, warning, notice, callout, empty, status, or message.

This is the critical path. Roughly half the missing frames below depend on one of these four primitives, so building them first is what makes the rest a duplicate-and-edit exercise. All four should be built as components in the shared library, not local to this file.

| ID | Primitive | Needed by | Build from | Notes |
|---|---|---|---|---|
| **P1** | **Inline field error** — 12px text, danger fg, optional leading icon, sits under a field | B1, E1, E7, E10, E11, F1, F2, G2, G3 | `Text` + danger token | Already exists in code as `.acuity-char-counter__error` and `.style-misc-logo-error`. Lowest effort, highest reuse. |
| **P2** | **Alert / inline banner** — icon + title + body + optional action, in `danger` / `warning` / `info` variants | B3, B4, C2, D3, E4, I2, K1, K2 | New | The genuinely new one. Needs a designer, not a recipe. |
| **P3** | **Toast** — single-line confirmation, auto-dismiss | H1, H2 | New | Code already has `.copy-toast` at 1500ms; the design has nothing. |
| **P4** | **Empty state** — icon/illustration + title + body + optional CTA | D2, G1, J1 | New | Could reuse the `S1` illustration language (`asset-frame` frames at `6772:416943`+). |

**Token reference for P1/P2.** The code design system and the Figma variables disagree on the danger foreground, and the Figma value is the weaker one:

| Role | Code token (`ds/tokens.css`) | Figma variable | Contrast on white |
|---|---|---|---|
| Danger text | `--acuity-fg-danger` = `#c32d38` | *(not exposed)* | **5.59:1** — pass |
| Danger strong / border | `--acuity-bg-danger-strong` = `#db3642` | `Background/danger.strong` = `#DB3642`, `Red/400` | **4.55:1** — marginal pass |
| Danger surface | `--acuity-bg-danger-default` = `#fef3f2` | *(not exposed)* | — |
| Warning text | `--acuity-fg-warning` = `#925b20` | *(not exposed)* | 5.28:1 — pass |

**Use `#c32d38` for error *text*** and reserve `#db3642` for borders/fills. Three of these four tokens are missing from the Figma variable set entirely — logged as `CL-48`.

---

## 1. Placement

Create **one new section per group** below the existing content, so `Desktop v1` is untouched. `Desktop v1` occupies `x: 72128 → 92812`, `y: 19775 → 28198`.

Suggested origin for the new work: **`x: 72128`, `y: 29200`** (≈1,000px clear below `Desktop v1`), laid out left-to-right in the same order as the happy path.

| Section name | Contents |
|---|---|
| `States — Primitives` | P1–P4 |
| `States — S1 / S2` | A1–A2, B1–B7 |
| `States — S4 / Loading` | C1–C3, I1–I2 |
| `States — S5` | D1–D5 |
| `States — Create dialog` | E1–E11 |
| `States — Styles panel` | F1–F3 |
| `States — S9 Availability` | G1–G7 |
| `States — S10 / Dashboard` | H1–H3, J1–J3 |
| `States — Cross-cutting` | K1–K4 |

---

## 2. Build recipes

Effort key: **S** ≈ under 10 min (duplicate + text swap) · **M** ≈ 10–45 min (duplicate + recompose) · **L** = needs original design work.

### Group A — S1 Welcome

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **A1** | `S1 / with Skip` | `6772:416932` | **The slot already exists.** `top-nav > right` contains a hidden `Button` instance `6772:417014` (94×36) sitting behind the visible `Icon Button`. Unhide it, set label `Skip`, secondary/tertiary variant. Alternatively use the hidden `Button` `6772:417004` (99×54) in `botton-nav > left` if Skip belongs next to the primary CTA — the prototype puts it there (`.btn-ghost`, line 6273). **Pick one placement and note it**, since the two sources disagree. | S |
| **A2** | `S1 / long copy` | `6772:416932` | Boundary check. Replace the three value-prop titles and bodies with ~2× length strings to verify the 268px columns don't clip. Low priority. | S |

`S1` Loading / Empty / Success are genuinely N/A — static content with nothing async.

### Group B — S2 Tell us what you do

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **B1** | `S2 / at char limit` | `6772:418425` | Fill the input with a 150-char string at the 32px type tier (prototype drops to 32px past `S2_MAX_CHARS`). Add **P1** below the input, right-aligned, copy: `150 max. character limit reached`. Colour `#c32d38`. | M |
| **B2** | `S2 / Next disabled` | `6772:418425` | The current frame shows `Next` in its enabled style with an empty field, which contradicts the build. Set the `Button Special` instance `6772:418455` to its disabled variant. Compare with the greyed `Next` already shown in `Dialog` `6772:418609` and match that treatment. | S |
| **B3** | `S2 / save failed` | `6772:418425` | Needs **P2** (danger). The `/api/save-s2-input` endpoint returns 400 and 500; today both are swallowed. Suggested copy: title `We couldn't save that`, body `Your description wasn't recorded, but you can keep going.` Decide whether this blocks `Next` or is dismissible — **open**. | M (blocked on P2) |
| **B4** | `S2 / offline` | `6772:418425` | Needs **P2** (warning). Global pattern — see `K1`; this frame just shows it in context. | M (blocked on P2, K1) |
| **B5** | `S2 / unmatched input` | `6772:418425` | **Needs a product decision.** When classification finds no match the prototype silently falls back to a synthesized generic catalog. Options: (a) say nothing (current), (b) inline note `We'll start you with general suggestions`, (c) prompt to rephrase. See `Q-1` below. | L (blocked) |
| **B6** | `S2 / suggestion chips` | `6772:418425` | The frame contains an empty `chips row` at `6772:418448` (1312×52, zero children). If chips are wanted, populate with `Info Chip` instances. **Needs decision `Q-2`** — the prototype comment at line 6327 says this was deliberately cut. | M (blocked) |
| **B7** | `S2 / long text` | `6772:418425` | Boundary. Show the input at each type tier: 64px (short), 44px (one line full), 32px (at 150). Three variants in one frame, or three small frames. | M |

### Group C — S4 Catalog loading

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **C1** | `S4 / slow` | `6772:416927` | Reuse the `Loading / Icon` instance `6772:416930`. Swap the label to reassurance copy after a threshold. **Needs `Q-3`**: what's the threshold and what does it say? | S (blocked on copy) |
| **C2** | `S4 / load failed` | `6772:416927` | Needs **P2** (danger) + a retry button. This covers the unhandled `Promise.all` rejection on the six template fetches. Suggested: title `We couldn't load suggestions`, body `Check your connection and try again.`, primary `Try again`, tertiary `Skip for now`. | M (blocked on P2) |
| **C3** | `S4 / with cancel` | `6772:416927` | Currently there is no way out of S4. If a cancel affordance is wanted, unhide the `top-nav > right` Button slot as in `A1`. **Needs `Q-4`.** | S (blocked) |

### Group D — S5 Add your first appointment

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **D1** | `S5 / suggestions loading` | `6772:417252` | **No new primitive needed** — the `Skeleton` component already exists (see instances `6772:417282` / `417283` in the preview pane). Replace the three suggestion `Appointment` cards with skeleton cards: card frame + 2 stacked `Skeleton` bars (one ~60% width for the name, one ~35% for the meta line). Prototype renders **4**; the design shows 3 suggestions — reconcile the count. | M |
| **D2** | `S5 / no suggestions` | `6772:417252` | Needs **P4**. Currently unreachable in code only by accident (`getTemplateFallback()` always returns something). Suggested: title `No suggestions yet`, body `Create your first appointment to get started.`, with the existing `Create new appointment` button as the CTA. | M (blocked on P4) |
| **D3** | `S5 / suggestion error` | `6772:417252` | Needs **P2**. Only required if suggestions become a real network call — today they're local. **Confirm with `Q-5`** whether to design this now. | M (blocked) |
| **D4** | `S5 / at cap (3 selected)` | `6772:417408` | Highest-value frame in this group. Show 3 cards under `YOUR APPOINTMENTS (3)`, all remaining suggestion `+` buttons in disabled state, and add an explanatory line — the build disables them silently with no reason given. Suggested copy: `You've added the maximum of 3. Remove one to add another.` Also set the subheading to "Choose up to 3". | M |
| **D5** | `S5 / long names` | `6772:417408` | Boundary. One card with a ~60-char name to show single-line ellipsis, one with a 2-line clamped description. Mirrors `text-overflow: ellipsis` (line 850) and `-webkit-line-clamp: 2` (line 890). | S |

### Group E — Create-appointment dialog

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **E1** | `C1 / duplicate name` | `6772:418609` | Needs **P1**. Nothing prevents two identically-named appointments today. **Needs `Q-6`**: block, warn, or auto-suffix? | S (blocked) |
| **E2** | `C1 / long title` | `6772:418609` | Boundary. There is no `maxlength` on the C1 input. **Needs `Q-7`**: what's the cap? Once set, add a counter matching the C2 pattern. | S (blocked) |
| **E3** | `C1 / no chips` | `6772:418609` | Chips row with zero children. The prototype guarantees this never happens (`rebuildCreateChips()` falls back to appointment names). **Recommend: skip this frame** and instead document the guarantee. | — |
| **E4** | `C2 / generation failed` | `6772:432056` variant 2 | Needs **P1** or **P2**. Slots into the existing 5-variant `generate description` sequence as a 6th. Suggested: inline error under the textarea, `Couldn't generate a description. Try again or write your own.`, with `Generate new` remaining active. | M |
| **E5** | `C2 / regenerate limit` | `6772:432056` variant 5 | The prototype caps regeneration at 3 (`C2_GENERATE_MAX`) and then the button silently stops responding. Add a disabled `Generate new` + helper text. **Needs `Q-8`** for the copy. | S (blocked on copy) |
| **E6** | `C3 / at min` + `C3 / at max` | `6772:418723` | Two frames. Prototype clamps 15–360 min on a 15-min grid. At 15: `−` disabled, value `15`. At 360: `+` disabled, value `360`. Straight duplicate + variant swap. | S |
| **E7** | `C4 / invalid price` | `6772:418794` | Needs **P1**. No validation exists for negative or non-numeric input. **Needs `Q-9`** for the rule. | S (blocked) |
| **E8** | `C4 / $0` | `6772:418794` | Resolve a live contradiction: the design shows `$0` with **no badge**; `_c4PriceStatus()` would label it `Below market`. If `$0` is legitimate (free consultation) it likely wants a neutral badge or none. **Needs `Q-10`.** | S (blocked) |
| **E9** | `C5 / uploading` | `6772:418868` | Needs a progress treatment — `Loading / Icon` in the Upload button, or a determinate bar. No upload progress exists in either source. | M |
| **E10** | `C5 / file too large` | `6772:418868` | Needs **P1**. Copy: `{MAX_SIZE} max.` Mirror the logo uploader's existing wording for consistency. | S (blocked on policy) |
| **E11** | `C5 / wrong file type` | `6772:418868` | Needs **P1**. Copy: `{FORMATS} only.` | S (blocked on policy) |

### Group F — Styles panel

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **F1** | `Styles / logo wrong type` | `6772:434200` (Miscellaneous panel) | Needs **P1**. **This error already ships** — `PNG files only.` at line 11604 — it has simply never been drawn. Place under the logo dropzone. | S |
| **F2** | `Styles / logo too large` | `6772:434200` | Needs **P1**. Also already ships: `20 MB max.` at line 11609. | S |
| **F3** | `Styles / long business name` | `6772:434200` | Boundary. No cap shown or enforced. **Needs `Q-11`** for the cap, then show truncation in both the field and the live preview header. | S (blocked) |

### Group G — S9 Availability

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **G1** | `S9 / no availability` | `6772:417584` | Needs **P4** (or a minimal variant of the summary card). **Already ships** as `No availability set` (line 10516). Replace the `Monday to Friday / 9 AM — 5 PM` summary card with the empty treatment, keeping the edit affordance. | M |
| **G2** | `S9 / end before start` | `6772:417731` | Needs **P1**. Show a row with `5 PM — 9 AM`, both time pills in error border (`#db3642`), error text below. **Needs `Q-12`**: block save, or auto-correct? | M (blocked) |
| **G3** | `S9 / overlapping ranges` | `6772:417731` | Needs **P1**. Show one day with two overlapping ranges flagged. **Needs `Q-13`**: block, warn, or auto-merge? | M (blocked) |
| **G4** | `S9 / loading` | `6772:417584` | Skeleton for the summary card using the existing `Skeleton` component. Low priority — the panel renders synchronously today. | S |
| **G5** | `S9 / timezone picker` | `6772:417584` | The timezone renders as an underlined link implying interactivity, but no picker is designed. **Needs `Q-14`**: is it editable here, and is it a `Dropdown` (component exists) or a modal? | L (blocked) |
| **G6** | `S9 / with Skip` | `6772:417584` | Same slot trick as `A1`: hidden `Button` `6772:417729` in `top-nav > right`, or `6772:417718` in `botton-nav > left`. The prototype's Skip is in the top nav (line 7215). | S |
| **G7** | `S9 / Finish disabled` | `6772:417584` | Only if zero availability should block. Set `Button Special` `6772:417722` to disabled. **Needs `Q-15`.** | S (blocked) |

### Group H — S10 Ready to book

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **H1** | `S10 / link copied` | `6772:417953` | Needs **P3**. Already ships as a 1500ms toast (line 11876). Position and duration need designing. | M (blocked on P3) |
| **H2** | `S10 / copy failed` | `6772:417953` | Needs **P3** (danger variant). `navigator.clipboard` can reject on permission or insecure context. Suggested fallback: select the URL text and prompt manual copy. | M (blocked on P3) |
| **H3** | `S10 / long URL` | `6772:417953` | Boundary. The slug is hardcoded `cedargroup.as.me`. Show a long business slug to verify field truncation and that `Copy` / `Customize link` don't wrap. | S |

### Group I — Account creation

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **I1** | `Creating account / loading` | `6772:416927` | **Trivial and overdue.** Duplicate S4, swap the label to `Setting up your account…`. Note the existing S4 inner instance is *named* `creating account` (`6772:416931`) but renders "Generating appointments" — that stale name is why this screen looks like it exists when it doesn't. | S |
| **I2** | `Creating account / failed` | `6772:416927` | **The single highest-risk frame in this spec.** The only irreversible server operation in the flow, with no failure path in either source. Needs **P2** plus a full-screen treatment. Must answer: does the user's wizard input survive? Is retry automatic or manual? Is there a support escape hatch? See `Q-16`. | L (blocked) |

### Group J — Dashboard

| ID | Frame | Duplicate from | Recipe | Effort |
|---|---|---|---|---|
| **J1** | `Home / empty` | `6772:431778` | Needs **P4**. Zero appointments and zero bookings. Lower priority — arriving here always follows setup, so it's near-unreachable in this flow. | M |
| **J2** | `Home / loading` | `6772:431778` | Dashboard data is fully mocked. The code already has `.home-stat-placeholder` empty bars, which is a reasonable starting point. | M |
| **J3** | `Home / error` | `6772:431778` | Needs **P2**. Out of scope for onboarding proper — flag to whoever owns the dashboard. | M |

### Group K — Cross-cutting

| ID | Frame | Recipe | Effort |
|---|---|---|---|
| **K1** | `Global / offline` | Needs **P2** (warning), designed as a persistent top banner that can appear over any screen. No `navigator.onLine` handling exists anywhere. Define whether the wizard is usable offline or hard-blocks. | L (blocked) |
| **K2** | `Global / session expired` | Needs **P2** (danger) + a re-auth path. No 401/403 handling exists. Likely owned by platform rather than this flow — **confirm ownership**. | L (blocked) |
| **K3** | `Global / discard changes` | A confirmation dialog for the `×` on every screen, which currently discards all in-memory state silently. Build from the existing `Dialog` frame `6772:418609` shell. **Needs `Q-17`.** | M (blocked) |
| **K4** | `Pattern / retry` | Not a frame — a documented convention for how retry behaves (inline vs. full-screen, auto-retry count, backoff) so C2, B3, and I2 stay consistent. | L (blocked) |

---

## 3. Checklist

Copy into your tracker. **Blocked** items need an answer from §4 before they can start.

### Primitives — do these first

- [ ] `CL-01` **P1** Inline field error component — *unblocks 9 frames*
- [ ] `CL-02` **P2** Alert / banner component (danger / warning / info) — *unblocks 8 frames*
- [ ] `CL-03` **P3** Toast component — *unblocks 2 frames*
- [ ] `CL-04` **P4** Empty-state component — *unblocks 3 frames*

### Ready to build now — no decisions needed

- [ ] `CL-05` `A1` S1 with Skip (unhide `6772:417014` or `6772:417004`)
- [ ] `CL-06` `A2` S1 long-copy boundary
- [ ] `CL-07` `B2` S2 Next disabled
- [ ] `CL-08` `B7` S2 long-text type tiers
- [ ] `CL-09` `D1` S5 suggestions skeleton
- [ ] `CL-10` `D4` S5 at cap (3 selected) — **highest value in this group**
- [ ] `CL-11` `D5` S5 long names / truncation
- [ ] `CL-12` `E6` C3 duration at min (15) and max (360)
- [ ] `CL-13` `G4` S9 summary skeleton
- [ ] `CL-14` `G6` S9 with Skip (unhide `6772:417729`)
- [ ] `CL-15` `H3` S10 long URL
- [ ] `CL-16` `I1` "Setting up your account…" loading — **trivial, do today**

### Build once P1 exists

- [ ] `CL-17` `B1` S2 at character limit
- [ ] `CL-18` `F1` Styles — logo wrong type (*copy already ships*)
- [ ] `CL-19` `F2` Styles — logo too large (*copy already ships*)
- [ ] `CL-20` `E4` C2 AI generation failed

### Build once P2 exists

- [ ] `CL-21` `B3` S2 save failed
- [ ] `CL-22` `C2` S4 template load failed + retry
- [ ] `CL-23` `D3` S5 suggestion error *(only if suggestions go networked)*
- [ ] `CL-24` `J3` Dashboard error

### Build once P3 exists

- [ ] `CL-25` `H1` S10 "Link copied!" toast (*already ships*)
- [ ] `CL-26` `H2` S10 copy failed

### Build once P4 exists

- [ ] `CL-27` `D2` S5 no suggestions
- [ ] `CL-28` `G1` S9 no availability set (*already ships*)
- [ ] `CL-29` `J1` Dashboard empty

### Blocked on a decision — see §4

- [ ] `CL-30` `B5` S2 unmatched input → `Q-1`
- [ ] `CL-31` `B6` S2 suggestion chips → `Q-2`
- [ ] `CL-32` `C1` S4 slow / reassurance copy → `Q-3`
- [ ] `CL-33` `C3` S4 cancel affordance → `Q-4`
- [ ] `CL-34` `E1` C1 duplicate name → `Q-6`
- [ ] `CL-35` `E2` C1 title length cap → `Q-7`
- [ ] `CL-36` `E5` C2 regenerate limit copy → `Q-8`
- [ ] `CL-37` `E7` C4 invalid price → `Q-9`
- [ ] `CL-38` `E8` C4 $0 badge → `Q-10`
- [ ] `CL-39` `E9`/`E10`/`E11` C5 upload progress + errors → upload policy sign-off
- [ ] `CL-40` `F3` Long business name cap → `Q-11`
- [ ] `CL-41` `G2` S9 end-before-start → `Q-12`
- [ ] `CL-42` `G3` S9 overlapping ranges → `Q-13`
- [ ] `CL-43` `G5` S9 timezone picker → `Q-14`
- [ ] `CL-44` `G7` S9 Finish gating → `Q-15`
- [ ] `CL-45` `I2` **Account creation failed** → `Q-16` — *highest risk*
- [ ] `CL-49` `K1` Offline banner → `Q-18`
- [ ] `CL-50` `K2` Session expired → confirm ownership
- [ ] `CL-51` `K3` Discard-changes dialog → `Q-17`
- [ ] `CL-52` `K4` Retry convention → `Q-19`

### Corrections to existing `Desktop v1` frames — deliberately NOT done in this pass

Per your instruction I left `Desktop v1` untouched. These are stale and will mislead engineering if left:

- [ ] `CL-46` Editor frames say "STEP 4 OF 5" / "STEP 5 OF 5"; decision is **3 steps**. Affects `6772:417252`, `417408`, `417584`, `417731`, `418456`.
- [ ] `CL-47` `customize toggle` frame `6772:434200` says "Choose up to 5 services"; decision is **3**.
- [ ] `CL-48` Add `--acuity-fg-danger` (`#c32d38`), `--acuity-bg-danger-default` (`#fef3f2`), and `--acuity-fg-warning` (`#925b20`) to the Figma variable set — currently only `Background/danger.strong` is exposed.
- [ ] `CL-53` `S4` inner instance `6772:416931` is named `creating account` but renders "Generating appointments". Rename to match, or it will keep causing this confusion.
- [ ] `CL-54` 372 layers across the file are `hidden="true"`, including 12 `Tabs` instances. Audit and delete the dead ones so engineering can tell intentional alternates from abandoned work.
- [ ] `CL-55` The five `Progress Indicator` instances in the create dialog are identical (`520×2`, same fill) — the bar never advances. Apply per-step variants.

---

## 4. Open questions blocking the remaining frames

Numbered for reference from the checklist. These are the ones where I'd be inventing business logic.

1. **`Q-1` Unmatched business description.** When classification finds no match, the build silently substitutes a generic catalog. Say nothing, show an inline note, or ask the user to rephrase?
2. **`Q-2` S2 suggestion chips.** The empty `chips row` frame exists; the code comment says chips were deliberately cut. Populate, or delete the frame?
3. **`Q-3` S4 slow threshold and copy.** After how long does the label change, and to what?
4. **`Q-4` S4 cancel.** Should there be any way out of the loading screen?
5. **`Q-5` S5 suggestion errors.** Are suggestions staying local, or becoming a real service call? Determines whether `D3` is needed at all.
6. **`Q-6` Duplicate appointment names.** Block, warn, or auto-suffix?
7. **`Q-7` Appointment title length cap.** C2's description is capped at 512; C1's title is uncapped.
8. **`Q-8` Regenerate limit copy.** What does the user see at 3 of 3?
9. **`Q-9` Price validation.** Negative values, non-numeric input, and an upper bound.
10. **`Q-10` `$0` price badge.** Design shows no badge; code would say "Below market". Is free a legitimate, neutrally-labelled choice?
11. **`Q-11` Business name length cap.**
12. **`Q-12` End time before start time.** Block save, or auto-correct?
13. **`Q-13` Overlapping ranges.** Block, warn, or auto-merge?
14. **`Q-14` Timezone.** Editable on S9? If so, `Dropdown` or modal?
15. **`Q-15` Finish gating on S9.** Can a user finish with zero availability?
16. **`Q-16` Account creation failure.** *Most important.* Does wizard input survive? Manual or automatic retry? Support escape hatch? What does the user actually see?
17. **`Q-17` Discard-changes guard.** Confirmation on `×`, or silent discard as today?
18. **`Q-18` Offline behaviour.** Is the wizard usable offline with queued writes, or does it hard-block?
19. **`Q-19` Retry convention.** Inline vs. full-screen, auto-retry count, backoff — so all error surfaces behave consistently.

Plus the **upload policy sign-off** in the preamble (limit, format list, and whether PNG-only for logos is deliberate).

---

## 5. Summary

| Bucket | Count |
|---|---|
| New primitives required | 4 |
| Frames buildable immediately | 12 |
| Frames unblocked by a primitive | 13 |
| Frames blocked on a decision | 20 |
| Corrections to `Desktop v1` (not done) | 6 |
| **Total tracked items** | **55** |

**Suggested order.** Build `P1` (inline error) first — it is nearly free, it already exists in code, and it unblocks nine frames including two errors that ship today with no design (`F1`, `F2`). Then `I1`, which is a five-minute duplicate of an existing loading screen. Then answer `Q-16`, because account-creation failure is the only unrecoverable path in the flow and it has no design at all.
