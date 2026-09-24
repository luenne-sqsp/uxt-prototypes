# AUDIT — c3_c2 (Design-Handoff Diagnosis)

**Audit date:** 2026-09-01
**Scope:** Diagnosis only. No prototype code modified, no reconciled decision log produced, no conflicts resolved.
**Prototype under audit:** `c3_c2/index.html`, current on-disk state — **12,668 lines**, with **3,631 insertions / 1,052 deletions uncommitted** on top of the last git commit (`f7b3b1f`, Aug 11). `c3_c2/HANDOFF.md` and `c3_c2/MISSING-STATES-SPEC.md` (both dated 2026-08-20) are themselves **untracked in git** — no version of either file, nor of the prototype changes made since Aug 11, has ever been committed.

**Coverage note:** the Figma MCP tools available (`get_metadata`, `get_screenshot`, `get_design_context`) expose layer structure, text-layer content, and rendered screenshots, but **no comment- or annotation-reading endpoint exists** — this was independently confirmed by MISSING-STATES-SPEC's own author ("the Figma MCP server exposes only read tools... there is no API to create frames") and by the current tool inventory. Structural/textual claims below are drawn from `get_metadata` XML dumps and targeted screenshots of the highest-value frames; not every frame HANDOFF.md cites was re-screenshotted, so absence of a specific re-check should not be read as confirmation either way.

---

## Flow Archetype & Intent

c3_c2 is the desktop pre-account onboarding wizard for the **UXT Desktop v1** initiative: it walks a brand-new (pre-subscription) Acuity trialer from a welcome screen (`s1`) through free-text business classification (`s2`), an AI/template-driven catalog build (`s4`, loading), appointment-type selection-or-creation with a live preview (`s5` + the `c1`–`c5` create-appointment sub-flow + the styles/customize panel), availability setup (`s9`), and a "ready to book" completion screen with a shareable link (`s10`) — before landing on the product dashboard (`s_loading_home` → `s_home`). This matches the attached UXT Desktop v1 brief's documented v1 scope almost exactly: "welcome, business input, appointment-type creation, availability, preview, and completion." The primary user goal is to reach a bookable scheduling page as fast as possible, with AI/personalization and a persistent preview reducing manual setup effort and building toward faster Trial-to-Subscription conversion.

**Flagged ambiguity — variant identity.** The Figma file now named as this audit's design source ("✼ UXT — Onboarding") explicitly splits the flow into two sections, **"Desktop v1 — B"** and **"Desktop v1 — C"** — see Finding M2. c3_c2's structure (no `s3` screen, free-text-only business input, "Step 1 of 3" labeling) matches "Desktop v1 — B" (AI/free-text personalization) and has no counterpart anywhere to Variant C's taxonomy/chip screens. **Nothing in HANDOFF.md, MISSING-STATES-SPEC.md, or the prototype's own code states which experiment variant(s) c3_c2 is meant to represent** — see Question 1. This ambiguity conditions how most S2-related findings below should be read.

**Flagged ambiguity — dashboard scope.** The documented v1 scope list ends at "preview" and "completion." Whether `s_loading_home`/`s_home` count as in-scope v1 deliverable or an existing/adjacent surface the flow merely lands on is not stated anywhere — see Question 2.

---

## Findings

Each finding lists: **Screen**, classification, sources involved, and evidence for each side. No resolutions are proposed.

### Meta — source integrity (flow-level, affects all screens)

**M1 — The Figma file HANDOFF.md/MISSING-STATES-SPEC.md cite no longer contains the audited content.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md / MISSING-STATES-SPEC.md (cite file `JH3hH70rICVAGzyfRwbnF0`, "-P- Playground Growth 2026," node `6772:416926`); Figma (queried live)
- **Evidence:** Querying `6772:416932` (the old S1 node) now returns "node ID was not found... may have been deleted." Listing the file's top-level pages returns exactly one: "☂︎ Cover." The entire `Desktop v1` section both docs were built against is gone from that file. The task's given source is a different file entirely (`okhVkzSEB2CLfob8eUABcm`, "✼ UXT — Onboarding," node `5459:69186`). Every "Figma shows/doesn't show X" claim in both docs is unverifiable against its cited source and must be re-derived from the new file — this audit re-derived a sample (below); the rest is unverified either way.

**M2 — The current Figma file splits the flow into explicit "Desktop v1 — B" and "Desktop v1 — C" sections; c3_c2's relationship to that split is undocumented.**
- **Classification:** UNDOCUMENTED DECISION
- **Sources:** Figma (new file); attached decisions doc ("Limit chip-setting framework work to Variant C. Variant B will use agnostic placeholders rather than variant-specific chip logic"); UXT summary's own to-do list ("Luenne: Separate Variant B and Variant C workflows in the design file — **Open**")
- **Evidence:** Canvas "🟧 C3 — Desktop v0" contains section `5995:14614` "Desktop v1 — B" (S1, S2, S4, S5, S9, S10, Dialog C01–C05, dashboard — **no S3**) and section `5995:45717` "Desktop v1 — C" (S1, S4, **S3.a "What industry are you in?"**, **S3.b (alt) "What is your specialty?"** with taxonomy chips Barber/Hair/Lash & Brows/Makeup/Nails/Skincare/Other, and "STEP 1 of 5"/"STEP 2 of 5" text layers). This directly explains two contradictions HANDOFF/MISSING-STATES-SPEC flagged as open (see the S2 finding below) — but the design file's own B/C split is itself still logged as "open" work in the attached decisions doc, so it's unclear whether the split shown in Figma today is the finished version of that to-do or a partial/in-progress one.

**M3 — No durable record exists of what changed between the Aug 20 audit and today, or why.**
- **Classification:** TECHNICAL DISCOVERY
- **Sources:** git history; HANDOFF.md / MISSING-STATES-SPEC.md
- **Evidence:** `git log --follow` returns zero commits for HANDOFF.md, MISSING-STATES-SPEC.md, or `c3_c2/templates/` — both docs are untracked (`git status`: `??`). `index.html`'s last commit (Aug 11) was 10,089 lines; HANDOFF.md (Aug 20) describes a 12,321-line file — meaning the version HANDOFF.md itself audited was already uncommitted. The current working file (12,668 lines) differs from that Aug-11 commit by 3,631 insertions / 1,052 deletions. None of this is diffable in git, so this audit cannot distinguish "the team deliberately resolved open question X" from "the file changed for unrelated reasons and happened to touch the same code." Findings below that read as resolutions are reported as such based on code comments and structure, not on any changelog.

### S1 — Welcome

**F1 — A real exit-confirmation dialog now gates Skip/×/close; the docs say no confirmation exists anywhere.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md (§S1→S2 interaction: "neither Skip nor × has a confirmation, and neither explains what 'closing' onboarding means"); MISSING-STATES-SPEC (`K3`/`Q-17`, listed as new/blocked work); current `index.html`
- **Evidence:** `confirmExitOrProceed()` + `_hasWizardEdits()` (new since the Aug-11 commit, per diff) now gate S1's Skip, desktop ×, and mobile close, showing a genuine `role="dialog" aria-modal="true"` "Are you sure you want to exit?" confirmation whenever the user has made any edit; it proceeds silently only when nothing has changed yet.

### S2 — Tell us what you do

**F2 — The empty "chips row" and the "of 3 vs. of 5" step-count contradiction are both explained by the Variant B/C split (M2), which neither doc had visibility into.**
- **Classification:** UNDOCUMENTED DECISION
- **Sources:** HANDOFF.md (Open Q2 "Which step count is correct," Open Q3 "Should S2 have suggestion chips?"); MISSING-STATES-SPEC (`Q-2`, `CL-46`); Figma (new file, both variants); attached decisions doc
- **Evidence:** Variant C's S3.a/S3.b are the taxonomy-chip screens and carry "STEP 1/2 of 5"; Variant B has no S3 and — confirmed by both metadata scan (zero "chip" matches in ~3,300 lines) and a direct screenshot of its S2 frame (`5995:15191`) — no chips row at all, not even an empty placeholder. c3_c2 (free-text only, "Step 1 of 3," a code comment noting its bottom-nav ID was "kept from the flow this screen replaced") structurally matches Variant B. The attached decision ("Variant B will use agnostic placeholders rather than variant-specific chip logic") supports reading this as resolved-by-variant rather than a live contradiction — but that reading depends on Question 1 being answered.

**F3 — Figma's current S2 frame shows a live "0/150" character counter; HANDOFF says no such counter exists in Figma at all.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md ("Error — validation... No such counter or error exists in the Figma frame at all"); Figma (new file, node `5995:15191`, screenshotted)
- **Evidence:** The screenshot shows "0/150" rendered under the textarea by default, not only at the limit. HANDOFF's claim was made against the now-deleted old file (M1).

**F4 — S2's "Next" gating was removed entirely; an empty submit is now silently treated as Skip.**
- **Classification:** UNDOCUMENTED DECISION
- **Sources:** HANDOFF.md ("`Next` is disabled unless input.value.trim() is non-empty... Figma shows Next in its enabled style with an empty field. The prototype disables it."); current `index.html` (uncommitted diff)
- **Evidence:** Both the on-entry and on-input `nextBtn.disabled` assignments were deleted (confirmed via diff against the last commit). New comments (lines ~10282–10284, ~10482–10485) state the intent directly: "Next stays enabled even on an empty field... treat an empty submit like Skip." No record exists anywhere of who decided this or why. Side effect: it extends the already-flagged "Skip silently defaults to the Beauty vertical" gap (HANDOFF Open Q11) to a plain empty Next-click too, and (F29) it isn't logged.

**F5 — The documented S2 auto-shrink font ladder no longer functions; the code's own comments still describe it as if it does.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md ("font auto-shrinks via `_s2FitInputFont()` across a 64/44/32px ladder"); current `index.html`
- **Evidence:** `S2_FONT_TIERS` is now `[44, 44, 44]` (was `[64, 44, 32]` per diff against the last commit), so `_s2FitInputFont()` always resolves to 44px regardless of text length, while the surrounding comments still narrate a three-tier shrink.

**F29 — S2's Skip control is exempt from the new exit-confirmation dialog, and neither Skip nor an empty-submit-as-skip is ever logged.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** current `index.html` only (self-inconsistent against the pattern established elsewhere in the same uncommitted change-set); attached decisions doc ("Eventing... still incomplete")
- **Evidence:** S1's Skip/×/close all route through `confirmExitOrProceed()`; S2's top-nav Skip still calls `showScreen('s4')` directly — bypassing both the confirmation dialog and `interpretBusinessDescription()`. `_s2LogSubmission()` only fires on the non-empty-text submit path, so S2's Skip and the new empty-submit path (F4) are both invisible to the one endpoint recording what users typed.

### S4 — Catalog loading

**F6 — S4's loading copy now matches Figma ("Generating appointments"); the divergence HANDOFF flagged has been fixed.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md (Appendix, "Notable copy divergences": Figma "Generating appointments" vs. prototype "Building your catalog…")
- **Evidence:** Current static markup and JS-set copy both read "Generating appointments"; "Building your catalog…" no longer exists anywhere in the file (confirmed via diff as a direct string replacement).

**F7 — A "slow-load reassurance" mechanism exists in code but can never fire, silently pre-answering an open question with something that doesn't work.**
- **Classification:** TECHNICAL DISCOVERY
- **Sources:** MISSING-STATES-SPEC (`C1`/`Q-3`: "S4 slow — what's the threshold and what does it say?"); current `index.html`
- **Evidence:** `_startLoadingReassurance()` swaps the loading label to "Still working…" at 5s and "Almost there…" at 10s, but S4 auto-advances at a fixed 2000ms and `s_loading_home` at 1800ms — both fire well before 5s. The threshold and copy `Q-3` asked for already exist in code; the surrounding timers make them unreachable as shipped.

### S5 — Add your first appointment

**F8 — The documented cap-bypass bug in `addCreatedService()` has been fixed.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md ("`addCreatedService()` pushes to `state.selectedAppts` with no cap check — the create sub-flow can exceed 3"); MISSING-STATES-SPEC ("Decisions applied: Service cap = 3")
- **Evidence:** `addCreatedService()` now opens with `if (state.selectedAppts.length >= 3) return;`, with a comment noting this used to be the one path that could exceed the cap.

### Create-appointment sub-flow (C1–C5)

**F9 — C1's most-cited gap — "no panel gates Next, empty title silently becomes 'New appointment'" — is fixed, but only for C1.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md ("the prototype does not gate C1 at all"); MISSING-STATES-SPEC (`Q-5`, listed as blocked-on-decision)
- **Evidence:** `_c1SyncNextGating()` now disables `#create-btn-next` (real `disabled` attribute) whenever the title is empty/whitespace, re-run on every panel navigation and keystroke. A comment states "C1 requires a non-empty title before advancing… no other step is gated" — confirming the fix is deliberate and intentionally scoped to C1 only.

**F10 — The separate "edit existing appointment" sheet's `'Untitled'` fallback remains completely unguarded even after F9.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** HANDOFF.md (notes the `'Untitled'` edit-sheet fallback alongside the C1 one); current `index.html`
- **Evidence:** `sheet-service-name` still has no required/length check; the `'Untitled'` fallback is unchanged and reachable, even though its sibling create-flow path (F9) is now gated.

**F11 — C4's price field now silently clamps negative/non-numeric entry to 0.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** MISSING-STATES-SPEC (`E7`/`Q-9`: "No validation exists for negative or non-numeric input... needs the rule")
- **Evidence:** The blur handler now does `(isNaN(val) || val < 0) ? '0' : val`. This answers "what happens on invalid entry" but adds no upper bound and gives no visible feedback that the entry was changed — `Q-9` is partially, silently answered rather than resolved with a designed state.

**F12 — A previously-undocumented "Dialog - C04 - Fallback/generic" Figma frame matches the code's no-vertical pricing path exactly.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md/MISSING-STATES-SPEC (`Q-10`: "Figma's default C4 frame shows $0 with no badge; prototype would label it Below market — divergent"); Figma (new file, node `5995:15462`, screenshotted); current `index.html`
- **Evidence:** The screenshot shows `$0`, a flat un-tiered price-chip grid, and no badge — exactly matching `suggestPrice()`'s `if (!vertical)` branch, which hides the tier row and shows the same flat generic grid with `_c4Tiers = null`. Design and code already agree on this state; neither doc knows it.

**F13 — C5 image upload now has real client-side validation; the "copy-only, unenforced" gap no longer exists.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md ("The 1.5 MB limit is copy only; no `.size` check exists"); MISSING-STATES-SPEC (`E10`/`E11`, blocked on upload-policy sign-off)
- **Evidence:** `#create-image-input` now uses `accept="image/png,image/jpeg,image/gif"` (was `image/*`); `C5_IMAGE_MAX_BYTES`/`C5_IMAGE_ACCEPTED_TYPES` reject oversized/wrong-type files with visible copy before `FileReader` runs.

**F14 — MISSING-STATES-SPEC's "unify the two upload policies" proposal was answered by giving each surface its own independent (and still different) policy, without the requested sign-off ever being recorded.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** MISSING-STATES-SPEC ("Recommendation: 20 MB, and JPEG/PNG/GIF on both surfaces... two caveats to check before I finalise the error copy... needs your sign-off")
- **Evidence:** C5 now enforces 1.5 MB / JPEG+GIF+PNG; the logo uploader enforces 20 MB / JPEG+GIF+PNG (format widened from PNG-only) **plus** a new 600×120px dimension cap that appears nowhere in either doc. Size limits were never unified (1.5 MB vs. 20 MB still disagree), and the specific sign-off question ("is PNG-only for the logo deliberate?") has no recorded answer even though the format half of it shipped.

**F15 — Duration's typed-entry path bypasses the documented 15–360/15-minute-grid clamp entirely.**
- **Classification:** TECHNICAL DISCOVERY
- **Sources:** HANDOFF.md ("Prototype clamps to 15–360 min and snaps to a 15-min grid")
- **Evidence:** The +/- stepper enforces the clamp, but a separate tap-to-edit typed-input path has its own comment stating "Typed values are taken as-is — no snapping to a 15-min grid," enforcing only a 1-minute floor and no ceiling.

### Styles / customize panel

**F16 — The logo uploader's format policy changed from PNG-only to PNG/JPEG/GIF, and gained a new, nowhere-documented 600×120px dimension requirement.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** HANDOFF.md ("PNG-only and 20 MB... no Figma frame shows either error"); MISSING-STATES-SPEC (flags "PNG-only for the logo may be deliberate (transparency against arbitrary page backgrounds)... say so and I'll split the spec" as an open sign-off item)
- **Evidence:** `LOGO_ACCEPTED_TYPES` now includes PNG/JPEG/GIF; error copy changed from "PNG files only." to "JPEG, GIF, or PNG only." The dimension check (600×120px max) has no antecedent in either doc and no corresponding Figma frame found. The exact question MISSING-STATES-SPEC posed appears to have been answered (no, PNG-only wasn't deliberate) without being recorded as a decision, and a second, never-discussed constraint (dimensions) was added on top.

### S9 — Availability

**F21 — The documented timezone display no longer exists anywhere in the flow.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md (state inventory + Open Q19: "Is the timezone on S9 user-editable? ... no picker is designed")
- **Evidence:** Case-insensitive search for "GMT"/"Pacific"/"timezone"/"tz" across the whole file returns nothing in S9 (only an unrelated "MST" dashboard-calendar label elsewhere). `Q-19` is now moot, but because the feature was removed, not because anyone answered it.

**F22 — The "Setup different availabilities for different appointments" toggle now has a fully implemented effect.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md ("no designed 'on' state and no prototype destination")
- **Evidence:** `toggleAvailDifferentSetups(checked)` now seeds a per-appointment availability block and switches the card list from one global card to one per selected appointment, appearing once 2+ appointments are selected.

### S10 — Ready to book

**F23 — The two "finish → dashboard" paths HANDOFF documented no longer exist in that form; the replacement inverts which action shows the account-creation loading screen.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** HANDOFF.md ("two different paths to s_home, one with an account-creation loading screen and one without... if account creation is real, path A skips it," Open Q18)
- **Evidence:** All three S10 exits ("Close setup," "×," and now also "Finish setup," which previously called `goHomeViaLoading()`) route through `confirmExitOrProceed(() => showScreen('s_home'))` with **no** loading screen. `goHomeViaLoading()` (still 1800ms, still framed as account creation) now fires only on *early* exits — S1/S2 skip/close and S9's desktop ×. The screen framed as "creating your account" is now reached by leaving the flow early, and is skipped by the one action (finishing) that would most plausibly need it.

**F24 — "Link copied!" is confirmed fully decorative — no Clipboard API call exists at all, a stronger gap than documented.**
- **Classification:** DOCUMENTATION DRIFT
- **Sources:** HANDOFF.md ("`navigator.clipboard` rejection unhandled" — implies the API is called)
- **Evidence:** Case-insensitive search for "clipboard" across the whole file returns zero matches; `showCopyToast()` shows the confirmation unconditionally, with no copy action underneath it to fail.

**F25 — The share-link text shown on S10 doesn't match the URL "Open scheduling page" actually opens.**
- **Classification:** TECHNICAL DISCOVERY
- **Sources:** not previously documented; connects to HANDOFF's "preview fidelity and maintenance" framing and the attached decisions doc's open question ("How closely must the custom mock track the live CSP, and who owns future synchronization?")
- **Evidence:** `#s10-share-url` always displays the hardcoded `app.acuityscheduling.com/schedule.php?owner=35753195`; `openSchedulingPage()` instead opens a local `scheduling-page.html` built from `serializeForSchedulingPage()` reflecting the user's actual selections. A user who copies "their link" gets a non-functional placeholder — a concrete, previously-untraced consequence of the custom-mock-preview architecture.

**F26 — S10's fourth "Keep exploring" card now promotes "Customize intake forms," a feature the attached decisions defer to future work.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** attached decisions doc ("Defer advanced experiences: ...intake forms... are deferred to future work"); HANDOFF.md (expected 4th card was "Download the app")
- **Evidence:** The 4th card is now "Customize intake forms" → `showProtoTooltip()` (a stub), replacing "Download the app." It's non-functional today, but naming it as a next step is in tension with the explicit deferral — unclear whether "Keep exploring" teasers are meant to be exempt.

### s_loading_home / s_home — Dashboard

**F27 — Account-creation failure remains completely unaddressed.**
- **Classification:** OPEN QUESTION
- **Sources:** HANDOFF.md (Open Q1: "the only irreversible server operation in the flow"); MISSING-STATES-SPEC (`I2`/`Q-16`: "the single highest-risk frame in this spec"); attached decisions doc (no mention of account-creation failure anywhere in the Sep 3–16 sprint goals or to-do list)
- **Evidence:** No retry, no error branch, no error UI exists for `s_loading_home`. It also isn't named as a goal in the current sprint per the attached decisions doc — still fully unresolved from every angle checked.

**F28 — The dashboard's setup-progress checklist is permanently stuck at 0%.**
- **Classification:** TECHNICAL DISCOVERY
- **Sources:** not previously documented; connects to the attached decisions doc's program-level framing ("measurable movement toward 'open for business'")
- **Evidence:** `home-setup-pct` is hardcoded "0%"; the three task-circle indicators are never toggled by any JS. A user who completes the entire wizard still lands on a dashboard claiming 0% setup progress.

### Cross-cutting

**F17 — Dark theming is reimplemented in inline JS instead of the documented token mechanism.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** CLAUDE.md ("Set `data-theme=\"dark\"` on `<html>` to apply the dark overrides from `tokens.dark.css`")
- **Evidence:** `tokens.dark.css` is linked but `data-theme` never appears in the file (0 occurrences). A parallel mechanism (`toggleDarkMode()`, `_s10DarkMode`, `_applyWidgetTheme()`) recolors specific widget elements via inline JS styles instead, so `tokens.dark.css` ships dead.

**F18 — The booking-page preview still uses zero `--brand-*` tokens, contradicting the repo's own token taxonomy — and the gap has widened slightly, not narrowed, since the last audit.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** CLAUDE.md (brand tokens are for "the user's own website we're previewing inside Acuity"); HANDOFF.md (Open Q22, already flagged this)
- **Evidence:** `var(--brand-*)` = 0 occurrences; `data-brand-palette`/`data-brand-font` = 0 occurrences. Palette/font is still a hardcoded JS `PALETTES` array plus 23 literal `'Source Sans Pro'` strings (up from 18), shipped to the preview iframe as a JSON query param.

**F19 — A working modal-dialog pattern now exists (F1's exit-confirmation dialog) but wasn't extended to the create-appointment sub-flow, which HANDOFF flagged as needing exactly this.**
- **Classification:** IMPLEMENTATION DRIFT
- **Sources:** HANDOFF.md (Accessibility, §Dialogs: "renders as `.create-panel` divs... no `role=dialog`, no `aria-modal`... zero occurrences of either"; Open Q17)
- **Evidence:** The file now has exactly one `role="dialog" aria-modal="true"` element (the exit-confirmation dialog), proving the pattern is available. C1–C5, which Figma still renders over a dark scrim, remain plain divs with no focus trap, no `inert`, no focus restore.

**F30 — The prototype is built mobile-first throughout, and new desktop-only features have no mobile equivalent, while the governing decision says mobile-web is out of scope for this experiment entirely.**
- **Classification:** TECHNICAL DISCOVERY
- **Sources:** attached decisions doc ("Desktop-only, new-trialer population. Existing users, native mobile, and mobile-web layout behavior are out of scope."); current `index.html`; Figma (new file)
- **Evidence:** `index.html`'s `<style>` block defines mobile layout as the default, with the desktop two-column grid gated behind `@media (min-width: 1024px)` — architecturally mobile-first. S10's desktop body has the share-URL field and Keep-exploring cards; the separate mobile `.s10-body` layout has neither. Figma still carries "Appointments (mWeb)" instances alongside "Appointments (Deskop)" [sic]. Not necessarily wrong, but worth confirming against the explicit scope decision (Question 4).

**F31 — The "unmatched business description → generic catalog, no explanation" behavior HANDOFF posed as an open product question is very likely already the agreed v1 answer.**
- **Classification:** UNDOCUMENTED DECISION
- **Sources:** attached decisions doc ("Use generic offerings as the initial AI failure fallback. A kill switch or traffic diversion will handle systemic outages; robust secondary fallback behavior may follow later."); HANDOFF.md/MISSING-STATES-SPEC (`Q-1`/`B5`: "Options: (a) say nothing (current), (b) inline note, (c) prompt to rephrase... needs a product decision")
- **Evidence:** `interpretBusinessDescription()`'s no-match branch and `getTemplateFallback()` both silently substitute a generic catalog with no user-facing indication — exactly option (a). The attached decision doesn't address whether the user should be *told* it's a generic guess, so that narrower slice of `Q-1`/`B5` may still be open, but the core "what do we show" question reads as answered.

---

## Global constraints observed

- **Desktop breakpoint:** `@media (min-width: 1024px)` is the single cutover point app-wide; below it, mobile layout applies on every screen (see F30).
- **Step counter:** Variant B uses "Step X of 3"; Variant C (Figma) uses "Step X of 5" — per-variant, not contradictory (see F2/M2).
- **Service cap:** 3 selected appointments, per MISSING-STATES-SPEC's logged decision — now enforced consistently on both the suggestion-add and create-new paths (F8).
- **Escape-to-close:** one global `keydown` handler closes the topmost of several overlays (create-overlay, edit card, availability card, palette/font/pricing pickers, and now the exit-confirmation dialog) — but S4 and `s_loading_home` are full screens, not overlays, and have no escape/cancel affordance at all.
- **Navigation history:** `showScreen()` uses `history.replaceState` everywhere, never `pushState` — the browser Back button exits the wizard entirely from any screen, not just some.
- **Loading timers:** every "loading" screen in the flow (S4: 2000ms; `s_loading_home`: 1800ms) is a fixed timer decoupled from real async completion — this is consistent app-wide, not screen-specific.
- **Token taxonomy:** the `--acuity-*`/`--brand-*` split from CLAUDE.md is not followed by the booking-page preview anywhere it appears (S5, S9, S10, `s_home`) — one gap, repeated identically at every preview surface (F18).
- **Reduced motion:** `prefers-reduced-motion: no-preference` gates nearly all animation consistently file-wide; the one confirmed exception (`.appt-card` border-color transition, line 746) is outside the guard everywhere it's used.
- **Disabled-control pattern:** both the real `disabled` attribute and a CSS-class-plus-`pointer-events:none` pattern (which stays focusable) coexist throughout the app on conceptually similar controls (e.g., S2's Next vs. S5's Continue-with-selection) — not isolated to one screen.
- **Confirmed-aligned (no drift):** business name is only ever set manually via the Styles panel — never derived from the S2 free-text description anywhere — matching the attached "do not extract business names from free text" decision. The preview/iframe mechanism has no live-Acuity-endpoint reference anywhere in the file, matching the attached "custom mocked preview, not the live CSP" decision.
- **Unchanged since the last audit (still accurate):** zero `:focus-visible` rules, zero `aria-live`/`role="alert"`/`role="status"` regions, the same ~9 unconditional `aria-hidden` containers wrapping real `<button>`s, and the same ~29 non-semantic `onclick` div/span click targets (font/palette pickers) that HANDOFF.md catalogued — confirmed still present at current line numbers.

---

## Questions for me

1. **Which ABC experiment variant(s) is c3_c2 meant to represent** — Variant B only, a pre-split merge of B and C, or something else? No source states this explicitly, and it conditions how F2, F30, and the flow's overall scope should be read.
Variant B only. Variant C is currently c3_c1

2. **Is `s_loading_home`/`s_home` in-scope for UXT Desktop v1**, or an existing/adjacent surface the flow simply lands on? The documented scope list stops at "completion."
existing/adjacent surface the flow lands on

3. **Should HANDOFF.md/MISSING-STATES-SPEC.md be treated as living documents to correct going forward, or a superseded one-time snapshot?** Because neither file nor the recent prototype changes are in git (M3), there's no way to tell from evidence whether fixes like F1/F8/F9/F13 were deliberate responses to the docs' open questions or unrelated work that happened to overlap.
we'll deprecate both of those files, they were intended to be used for audit only and we'll create the correct file to move forward

4. **Should the mobile-first CSS/layout scaffolding in c3_c2 (and the Figma "Appointments (mWeb)" content) be removed, or preserved for a later mobile experiment?** The "mobile-web out of scope" decision doesn't say (F30). 
it should be replaced by the mobile breakpoints we defined in the last session

---

## Classification counts

- DOCUMENTATION DRIFT: 13 (M1, F1, F3, F5, F6, F8, F9, F11, F12, F13, F21, F22, F24)
- IMPLEMENTATION DRIFT: 9 (F10, F14, F16, F17, F18, F19, F23, F26, F29)
- UNDOCUMENTED DECISION: 4 (M2, F2, F4, F31)
- TECHNICAL DISCOVERY: 6 (M3, F7, F15, F25, F28, F30)
- OPEN QUESTION: 1 (F27)
- DESIGN DRIFT: 0
