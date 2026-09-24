# Flow Specs — c3_c2

**Scope note (2026-09-17):** as of D-035, this file is also the decision log for **c3_c1** (`../c3_c1/index.html`), a sibling prototype. Every entry from D-001–D-034 is c3_c2-only unless the entry itself says otherwise. From D-035 onward, each entry's **Prototype ref** states which of c3_c1/c3_c2 it governs — the two prototypes are allowed to intentionally diverge (e.g. differing appointment caps), so a decision for one is never assumed to apply to the other unless the entry says so explicitly.

Last updated: 2026-09-21 · Status: Active
Sources reconciled: index.html, Figma (✼ UXT — Onboarding, node 5459:69186), HANDOFF.md (deprecated), MISSING-STATES-SPEC.md (deprecated), AUDIT-c3_c2.md, decisions doc (Sep 1 session); c3_c1/index.html + a c3_c1-vs-c3_c2 parity audit (Sep 17 session)

This file is the semantic source of truth for c3_c2 (and, from D-035 onward, c3_c1): flow/screen structure, interaction logic, layout constraints, system constraints, invariants, engineering-discretion boundaries, edge cases, decisions and their rationale, unresolved questions, and which downstream artifacts are known stale. It is not pixel redlines.

**How to read "Binding scope":**
- **Intended behavior** — past handoff. Figma is authoritative for this decision's visual appearance; the prototype is authoritative for this decision's specific behavior/transition/animation as implemented — but only because this file says so, not because either artifact exists.
- **Prototype-only** — exists to make the demo work (fixed timers, mock data, placeholder URLs, hardcoded values). Non-binding. Do not infer a spec from it.
- **Open** — unresolved. Not yet Intended, not yet confirmed as permanently Prototype-only.

---

## Flow Archetype & Intent

c3_c2 is the desktop pre-account onboarding wizard for the UXT Desktop v1 initiative, implementing **Experiment Variant B (AI/free-text personalization)** of the three-arm ABC design. This is now settled — see D-002: Variant C (taxonomy/guided personalization, with its own dedicated S3.a/S3.b industry-and-specialty screens) is a separate design track and out of scope for this file entirely.

The flow walks a new trialer through: welcome (S1) → free-text business description (S2) → AI/template-driven catalog build (S4, loading) → appointment-type selection-or-creation with a live preview (S5 + the C1–C5 create sub-flow + the styles/customize panel) → availability setup (S9) → a "ready to book" completion screen with a shareable link (S10) → the product dashboard (`s_loading_home` → `s_home`). Primary user goal: reach a bookable scheduling page as fast as possible, with AI/personalization and a persistent preview reducing manual setup effort, in service of faster Trial-to-Subscription conversion and time-to-first-booking.

**Still unresolved (not addressed by this reconciliation pass):** whether `s_loading_home`/`s_home` are themselves in-scope v1 deliverables or an existing/adjacent surface the flow merely lands on — see Open Questions, `Q2`.

---

## Meta / Process Decisions

### D-001 — Maintain a stable Figma file reference going forward
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Product
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** This log's Figma reference (✼ UXT — Onboarding, node `5459:69186`) is the canonical pointer. If design work relocates to a new file again, the file/node reference at the top of this document must be updated in the same change that moves the content — it cannot lag.
**Rationale:** The prior audit discovered that HANDOFF.md/MISSING-STATES-SPEC.md pointed at a Figma file (`JH3hH70rICVAGzyfRwbnF0`, node `6772:416926`) whose entire content had since been deleted — every "Figma shows X" citation in both docs became silently unverifiable with no warning.
**Constraints:** N/A.
**Implementation discretion:** N/A (process decision, not a UI behavior).
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

### D-002 — c3_c2 represents Experiment Variant B only
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Product
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** c3_c2 is the build for Variant B (AI/free-text personalization) of the ABC desktop experiment. Variant C (taxonomy/guided personalization) is a distinct design and is not represented anywhere in c3_c2 — its S3.a/S3.b taxonomy screens, industry/specialty chips, and "of 5" step counter are out of scope for this flow and this file.
**Rationale:** The current Figma file already structurally separates "Desktop v1 — B" (no S3, no chips, "of 3") from "Desktop v1 — C" (S3.a "What industry are you in?", S3.b "What is your specialty?", taxonomy chips, "of 5"). c3_c2's own structure — no `s3` screen, free-text-only input, "Step 1 of 3" — matches B exactly and has no Variant C counterpart anywhere in the code.
**Constraints:** Any future work to build Variant C is a separate flow/file, not an extension of c3_c2.
**Implementation discretion:** N/A.
**Artifacts affected:** [x] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** The design file's own Variant B/C split is still logged elsewhere as in-progress work — unclear whether today's split is the finished version of that effort or partial. Doesn't change this decision, but worth tracking.

### D-003 — Commit prototype code and decision docs to git going forward
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Product
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** `c3_c2/index.html`, this file, and any successor decision docs are committed to git as part of normal working process. No more untracked handoff artifacts, and no more multi-week stretches of uncommitted prototype changes.
**Rationale:** HANDOFF.md and MISSING-STATES-SPEC.md were both untracked, and the prototype carried 3,631 insertions / 1,052 deletions of uncommitted changes relative to its last commit — with no way to tell which of the audit's findings reflected deliberate fixes versus incidental changes.
**Constraints:** N/A.
**Implementation discretion:** Commit cadence/granularity is Engineering's call; the invariant is just that nothing sits uncommitted indefinitely.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

---

## Global System Constraints

- **Desktop breakpoint** — the current `@media (min-width: 1024px)` mobile-first-with-desktop-override architecture is **superseded by D-034**: mobile-first is being removed in favor of desktop-first breakpoints. *Binding scope: Open* (exact desktop-first breakpoint values from "the prior design session" aren't in this file yet — see Follow-up Actions).
- **Step counter** — "Step X of 3" is the spec for this flow (Variant B only, per D-002). *Binding scope: Intended.*
- **Service cap** — 3 selected appointments, enforced identically on the suggestion-add and create-new paths. *Binding scope: Intended* — see D-014.
- **Escape-to-close** — one global key handler closes the topmost overlay (create-overlay, edit card, availability card, palette/font/pricing pickers, exit-confirmation dialog). Full-screen loading states (S4, `s_loading_home`) are correctly not part of this set — they aren't overlays. *Binding scope: Intended.*
- **Navigation history** — `showScreen()` uses `history.replaceState` only; the browser Back button exits the wizard entirely rather than stepping back a screen, from any screen. *Binding scope: Open* — not addressed by this reconciliation pass.
- **Loading timers** — every loading screen (S4: 2000ms; `s_loading_home`: 1800ms) is a fixed timer decoupled from real async completion. *Binding scope: Prototype-only* — see D-013.
- **Token taxonomy** — the booking-page preview (S5/S9/S10/`s_home`) uses zero `--brand-*` tokens anywhere, contradicting CLAUDE.md's own taxonomy. *Binding scope: Prototype-only* — see D-023.
- **Reduced motion** — `prefers-reduced-motion: no-preference` gates nearly all animation consistently; one CSS transition (`.appt-card` border-color) sits outside the guard. *Binding scope: Intended* for the pattern itself; the one unguarded transition is a minor prototype bug, not a decision, and isn't logged as its own entry.
- **Disabled-control pattern** — both the real `disabled` attribute and a CSS-class-plus-`pointer-events:none` pattern (which stays focusable) coexist on conceptually similar controls app-wide. *Binding scope: Open* — not addressed by this reconciliation pass; worth a follow-up standardization decision.
- **Confirmed-aligned, no change needed:** business name is never derived from the S2 free-text description (only ever set manually in the styles panel); the preview/iframe mechanism never references a live Acuity endpoint. Both *Binding scope: Intended* — these are working as agreed and should stay that way.

---

## Autonomy Boundaries (flow-level)

- **Invariants:** must remain true regardless of implementation
- **Design-controlled:** requires design review (affects behavior/hierarchy/interaction model)
- **Engineering discretion:** implementable without design review, invariants preserved
- **Product decisions:** scope/business rules/user promise
- **System decisions:** affects reusable patterns or the design system

---

## Screen: S1 — Welcome

**Figma ref:** "Desktop v1 — B" → `S1` (`5995:14622`) · **Prototype ref:** `index.html#s1`

### D-004 — Exit-confirmation dialog gates Skip/×/close
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Flow
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** Skip, the desktop ×, and mobile close on S1 (and by the same mechanism, other early-exit points — see S2/S9) must show a confirmation dialog ("Are you sure you want to exit?") whenever the user has made any edit in the flow. If nothing has been edited yet, exit proceeds without a prompt.
**Rationale:** Previously, no confirmation existed anywhere and closing silently discarded all in-memory state. A working `role="dialog" aria-modal="true"` implementation (`confirmExitOrProceed()` + `_hasWizardEdits()`) now exists and is treated as the intended pattern going forward, not just a one-off fix.
**Constraints:** Must only interrupt the user when there's something to lose (`_hasWizardEdits()` — selected appointments, S2 text, business name/logo, or other unsaved changes); must not add friction to a truly empty exit.
**Implementation discretion:** Exact dialog copy, button order, and animation are Figma/prototype-authoritative per the binding-scope rule; the edit-detection logic (`_hasWizardEdits()`) internals are Engineering discretion as long as the invariant (prompt iff there are edits) holds.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none for S1 itself — see D-010 for S2's inconsistent application of this same pattern, and D-026 for S9/S10's asymmetric use of the related account-creation loading screen.

---

## Screen: S2 — Tell us what you do

**Figma ref:** "Desktop v1 — B" → `S2` (`5995:15191`) · **Prototype ref:** `index.html#s2`

### D-005 — No chip row for Variant B
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** S2 has no suggestion-chip row at all — not even an empty placeholder. The typed free-text description alone drives classification on submit.
**Rationale:** Matches the decision to limit chip-setting framework work to Variant C; Variant B uses agnostic placeholders, not variant-specific chip logic. Confirmed against the current Figma file: Variant B's S2 frame has zero chip-related layers anywhere in its structure.
**Constraints:** Do not add a chips affordance to S2 without first revisiting D-002 (this would blur the Variant B/C boundary).
**Implementation discretion:** N/A — this is an absence, not a behavior to implement.
**Artifacts affected:** [x] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

### D-006 — Character counter visible by default
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Design
**Date:** 2026-09-01
**Decision:** S2's textarea shows a live "N/150" character counter under the input at all times (not only at the limit).
**Rationale:** Confirmed present in the current Figma S2 frame ("0/150" shown by default) and already implemented identically in the prototype.
**Constraints:** 150 is the client-side cap; the server-side cap (`MAX_TEXT_LENGTH = 1000` in `api/save-s2-input.js`) is intentionally more permissive as a safety ceiling, not a UI target — see Constraints on D-007.
**Implementation discretion:** Figma is authoritative for the counter's exact visual treatment; the 150 number itself is fixed, not discretionary.
**Artifacts affected:** [x] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

### D-007 — Empty "Next" submit behaves like Skip
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** "Next" on S2 is never disabled. Submitting with an empty field is treated identically to using the Skip control: the user proceeds to S4 with classification skipped, and the catalog falls back to the generic template set.
**Correction to audit:** AUDIT-c3_c2.md's finding F4 stated the fallback in this case was the hardcoded `'Beauty'` vertical default. That is inaccurate — the fallback is the **generic template set**, not the Beauty vertical. This entry corrects that record rather than silently replacing it.
**Rationale:** Matches Figma, which has always shown "Next" in its enabled style regardless of field content.
**Constraints:** Must remain consistent with D-005/D-009 — an empty or skipped S2 should never produce a worse or different outcome than a genuinely-unmatched description.
**Implementation discretion:** N/A — behavior is fixed; internals of `_s3OtherSubmit()` are Engineering discretion.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

### D-008 — Fixed 44px input font; three-tier shrink ladder retired
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** S2's business-description input renders at a fixed 44px regardless of text length. The previous 64px → 44px → 32px auto-shrink ladder is retired.
**Rationale:** The ladder was already flattened to `[44, 44, 44]` in the current implementation; this entry formalizes that as the intended behavior rather than leaving it as an unexplained discrepancy between code and code comments.
**Constraints:** None beyond the fixed size; if long-text legibility becomes a problem, that's a new decision, not a reversion to the old ladder.
**Implementation discretion:** N/A.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the informal 64/44/32 ladder previously described only in code comments (never formally logged).
**Open questions:** none.

### D-009 — Unmatched description falls back to the generic catalog silently
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** When `interpretBusinessDescription()` finds no match, the user is silently given the generic template catalog with no visible indication that it's a fallback (no inline note, no "we couldn't match that" affordance).
**Rationale:** Matches the agreed AI-failure-fallback approach: use generic offerings as the fallback, with a kill switch/traffic diversion reserved for systemic outages.
**Constraints:** Whether the user should eventually be *told* it's a generic guess is explicitly not decided by this entry — narrower than the original question, and still open if raised again later.
**Implementation discretion:** The matching/classification algorithm itself is Engineering discretion; the "silent generic fallback, no error state" outcome is fixed.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** Should the user ever be told the catalog is a generic guess rather than personalized? Not resolved here.

### D-010 — S2 Skip: same exit-confirmation + logging pattern as S1? (OPEN)
**Status:** Open
**Binding scope:** Open
**Scope:** Screen
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** Not yet decided. Currently, S2's top-nav Skip bypasses both the D-004 exit-confirmation dialog and `_s2LogSubmission()` — neither an empty Next-submit (D-007) nor a Skip click is ever logged to the S2 research endpoint.
**Rationale:** n/a (unresolved).
**Constraints:** n/a.
**Implementation discretion:** n/a — not an Intended-behavior decision yet.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** Should S2's Skip route through the same exit-confirmation dialog as S1? Should Skip and empty-submit both log to `_s2LogSubmission()` so abandonment is visible in analytics? Needs product/analytics input. See Open Questions table.

---

## Screen: S4 — Catalog loading

**Figma ref:** "Desktop v1 — B" → `S4` (`5995:14616`) · **Prototype ref:** `index.html#s4`

### D-011 — Loading copy: "Generating appointments"
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Design
**Date:** 2026-09-01
**Decision:** S4's loading label reads "Generating appointments."
**Rationale:** Matches Figma exactly; the prototype previously read "Building your catalog…" and has since been corrected to match.
**Constraints:** None.
**Implementation discretion:** N/A.
**Artifacts affected:** [x] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prototype's prior "Building your catalog…" copy.
**Open questions:** none.

### D-012 — Reassurance copy should trigger during genuinely slow loads
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** If a loading state (S4 or `s_loading_home`) takes longer than expected, the label should update with reassurance copy ("Still working…" at 5s, "Almost there…" at 10s) rather than sitting static indefinitely.
**Split note:** this decision was split from a single audit finding (F7) into two entries with different binding scopes — this one (behavioral requirement) and D-013 (the specific current timing, which is prototype-only). See AUDIT-c3_c2.md F7 for the original combined finding.
**Rationale:** The requirement (show reassurance copy on a real slow-load) is a reasonable production behavior independent of what today's fixed timers do.
**Constraints:** Must not fire before the load is actually taking unusually long — the 5s/10s specific thresholds are addressed separately in D-013.
**Implementation discretion:** Engineers may choose the actual timing mechanism (client timer vs. real progress signal) as long as reassurance copy only appears once a load is genuinely slow, not on every load.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** What's the correct threshold once loads are tied to real async work instead of fixed timers? Not resolved here.

### D-013 — Current 2000ms/1800ms auto-advance timers are prototype-only
**Status:** Decided
**Binding scope:** Prototype-only
**Scope:** Screen
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** The fixed 2000ms (S4) and 1800ms (`s_loading_home`) timers are demo stand-ins for real async completion. They are not a production timing spec.
**Split note:** see D-012 — split from the same original finding (F7).
**Rationale:** Because both timers fire well before D-012's 5s/10s reassurance thresholds, the reassurance copy currently can never be seen — a direct consequence of treating the fixed timers as real behavior instead of scaffolding.
**Constraints:** Do not tune, "fix," or optimize these specific millisecond values as if they were a spec — they'll be replaced wholesale once real async completion signals exist.
**Implementation discretion:** N/A (prototype-only, non-binding by definition).
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none beyond D-012's.

---

## Screen: S5 — Add your first appointment

**Figma ref:** "Desktop v1 — B" → `S5 Default - Empty` / `S5 Added` / `S5 Editing - Recommended` (`5995:14710`, `5995:14768`, `5995:15218`) · **Prototype ref:** `index.html#s5`

### D-014 — 3-appointment cap enforced on every add path
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** A user may have at most 3 selected appointments at any time, regardless of whether they were added from suggestions or created from scratch.
**Rationale:** The cap was already agreed (MISSING-STATES-SPEC's logged "Decisions applied: Service cap = 3"); `addCreatedService()` previously bypassed it, which has since been fixed with an explicit length check before pushing.
**Constraints:** The cap applies uniformly across both add paths — no path may be exempt.
**Implementation discretion:** The specific UI treatment for "at cap" (disabled `+`, `aria-label` reasoning) is implementation detail; the number 3 itself is fixed.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the pre-fix `addCreatedService()` behavior.
**Open questions:** none.

---

## Screen: C1–C5 — Create-appointment sub-flow

**Figma ref:** "Desktop v1 — B" → `Dialog`, `Dialog - C01`…`C05` (`5995:15275`, `6420:49764`, `5995:15343`, `5995:15391`, `5995:15462`, `5995:15536`) · **Prototype ref:** `index.html#panel-c1`…`#panel-c5` (implemented as `#panel-c1` + state classes, not five distinct DOM panels — see Constraints on D-015)

### D-015 — C1 requires a non-empty title before advancing
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Design
**Date:** 2026-09-01
**Decision:** "Next" on C1 is disabled until the appointment title field is non-empty (whitespace doesn't count). No other panel in the create sub-flow (C2–C5) gates "Next."
**Rationale:** Matches Figma, which has always shown C1's "Next" in a greyed/disabled state on an empty title. Implementation now uses the real `disabled` attribute, driven by `_c1SyncNextGating()`, re-evaluated on every navigation and keystroke.
**Constraints:** Gating is intentionally scoped to C1 only — do not extend blocking-gate behavior to C2–C5 without a new decision.
**Implementation discretion:** N/A — behavior fixed; validation-function internals are Engineering discretion.
**Artifacts affected:** [x] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior "no panel gates Next, empty title becomes 'New appointment'" behavior.
**Open questions:** none.

### D-016 — Extend title-required gating to the edit-appointment sheet
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** The separate "edit an existing appointment" sheet must apply the same non-empty-title requirement as C1 (D-015). It currently does not — its `'Untitled'` fallback remains fully unguarded.
**Rationale:** There's no reason for the create-flow and edit-flow to disagree on whether a title is required; leaving the edit sheet unguarded after fixing C1 was an oversight, not a deliberate scope decision.
**Constraints:** Same requirement as D-015 — non-empty, whitespace doesn't count.
**Implementation discretion:** Engineers may reuse `_c1SyncNextGating()`'s approach or write an equivalent for the sheet.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none — this is a straightforward extension of D-015, not yet implemented.

### D-017 — Invalid C4 price input clamps to 0
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** Negative or non-numeric entry into the C4 price field is silently clamped to 0 on blur. No error message is shown.
**Rationale:** Already implemented this way; formalized here as intended rather than an unresolved validation gap. No upper bound is set by this decision.
**Constraints:** Silent clamp, not a rejection — the field must always end up holding a valid non-negative number after blur.
**Implementation discretion:** Whether to eventually add visible feedback for a rejected value is not decided here.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** No upper bound is set — is one needed? Not resolved here.

### D-018 — No-vertical pricing shows $0, flat grid, no badge
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** When no vertical/classification is available (generic route), C4 shows `$0`, a flat un-tiered price-chip grid, and no price-tier badge.
**Rationale:** Design and implementation already agree on this independently — Figma's "Dialog - C04 - Fallback/generic" frame shows exactly this, and `suggestPrice()`'s `if (!vertical)` branch already implements it. This entry just formally records the match.
**Constraints:** Applies specifically to the no-vertical case; the badge logic for classified verticals (Market rate / Within typical range / Below market / Premium / Build momentum) is unaffected.
**Implementation discretion:** N/A.
**Artifacts affected:** [x] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

### D-019 — C5 image upload requires client-side validation before processing
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** File type and size must be validated client-side before an uploaded image is processed, with visible rejection copy for both failure modes.
**Rationale:** Previously the 1.5 MB/format copy was decorative only; real validation now exists.
**Constraints:** The *requirement* to validate is fixed. The specific limit values currently in code (1.5 MB; JPEG/GIF/PNG) are **provisional, not confirmed spec** — see Follow-up Actions.
**Implementation discretion:** Exact error-copy wording is Figma/prototype-authoritative once confirmed; validation mechanism (before vs. during `FileReader`) is Engineering discretion.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior copy-only, unenforced state.
**Open questions:** Exact size/format limits — see Follow-up Actions.

### D-020 — C5 and logo upload intentionally have separate limits
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Flow
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** C5 (appointment image) and the styles-panel logo uploader are not required to share a single unified size/format policy — each may be independently tuned for its own context.
**Rationale:** Reverses MISSING-STATES-SPEC's "unify" recommendation; the two surfaces have different practical constraints (a hero-ish appointment photo vs. a small logo mark).
**Constraints:** Both surfaces must still individually satisfy D-019's requirement to validate and show visible rejection copy.
**Implementation discretion:** N/A for the "separate is fine" policy; the specific numbers are pending — see Follow-up Actions.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** MISSING-STATES-SPEC's unify-to-20MB/JPEG-PNG-GIF recommendation.
**Open questions:** Exact confirmed values for both surfaces — see Follow-up Actions.

### D-021 — Typed duration entry is intentionally unclamped
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** The C3 duration field's typed-entry path (as opposed to the +/- stepper) intentionally allows any value ≥ 1 minute, with no 15–360 clamp and no 15-minute grid snap.
**Rationale:** This differs from the stepper by design — typed entry is meant to allow precise/unusual durations a stepper can't reach quickly; the stepper's clamp exists to keep quick adjustments sane, not to cap all entry everywhere.
**Constraints:** 1-minute floor remains on the typed path; no ceiling.
**Implementation discretion:** N/A.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

---

## Screen: Styles / customize panel

**Figma ref:** "Desktop v1 — B" → `Customize Panel` instances (e.g. `6420:34778`, `6420:34828`) · **Prototype ref:** `index.html` `.style-*` classes

### D-022 — Logo uploader accepts PNG/JPEG/GIF up to 20MB and 600×120px
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** The logo uploader accepts PNG, JPEG, or GIF (not PNG-only), capped at 20 MB, with an additional 600×120px maximum dimension requirement.
**Rationale:** Both the widened format list and the dimension cap are already implemented; this entry formally answers MISSING-STATES-SPEC's open question of whether PNG-only was deliberate (it was not).
**Constraints:** The 600×120px cap exists specifically for logo-in-preview legibility — do not generalize it to other uploaders without a separate decision.
**Implementation discretion:** N/A for policy; exact rejection copy wording follows D-019's pattern.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the original PNG-only policy.
**Open questions:** none.

### D-023 — Booking-page preview's hardcoded palette/font is prototype-only
**Status:** Decided
**Binding scope:** Prototype-only
**Scope:** System
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** The current hardcoded JS `PALETTES`/`FONTS` arrays and inline-style-driven preview coloring are demo scaffolding, standing in for real `--brand-*` token integration per CLAUDE.md's token taxonomy. This applies everywhere the preview appears (S5, S9, S10, `s_home`), not just the styles panel.
**Rationale:** No production commitment should be inferred from the current mechanism — it works for the prototype but isn't the intended production architecture.
**Constraints:** Do not extend the hardcoded-array pattern to new preview surfaces; new preview work should be flagged as needing the real token integration rather than copying this approach.
**Implementation discretion:** N/A (prototype-only, non-binding by definition).
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** When/how to wire the preview through `--brand-*` tokens is not yet scheduled.

---

## Screen: S9 — Availability

**Figma ref:** "Desktop v1 — B" → `S9 Default` / `S9 Editing` (`5995:14828`, `5995:14965`) · **Prototype ref:** `index.html#s9`

### D-024 — Timezone is auto-detected, not user-editable
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** Timezone is determined automatically from the user's system and is not exposed as an editable/pickable field in this flow.
**Rationale:** Resolves the previously-open question of whether a timezone picker was needed; no picker is in scope for v1.
**Constraints:** No timezone UI (display or picker) should be (re-)added to S9 without a new decision.
**Implementation discretion:** The specific detection mechanism (browser `Intl` API vs. server-side lookup) is Engineering discretion.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** the previously-designed (and since removed) "(GMT-7:00) PACIFIC TIME" link-styled display.
**Open questions:** No direct evidence was found confirming the current build actually performs auto-detection versus simply omitting timezone entirely — worth a quick engineering confirmation, not logged as a blocking open question.

### D-025 — "Different availabilities per appointment" toggle seeds one card per appointment
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Engineering
**Date:** 2026-09-01
**Decision:** Turning on "Setup different availabilities for different appointments" (visible only once 2+ appointments are selected) splits the single global availability card into one card per selected appointment, each independently editable.
**Rationale:** Already implemented (`toggleAvailDifferentSetups()`); formalized here since it was previously undocumented as a designed behavior.
**Constraints:** The toggle must remain hidden below 2 selected appointments — with only one appointment, per-appointment availability is meaningless.
**Implementation discretion:** N/A.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** none.

---

## Screen: S10 — Ready to book

**Figma ref:** "Desktop v1 — B" → `S10` (`5995:15083`) · **Prototype ref:** `index.html#s10`

### D-026 — Finishing via S10 skips the account-creation loading screen; early exits show it
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Flow
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** Keep the current behavior as implemented: all S10 exits ("Close setup," "×," "Finish setup") go directly to the dashboard with no loading screen. `goHomeViaLoading()` (the "Setting up your account…" screen) is reserved for early exits only — S1/S2 skip/close and S9's desktop ×.
**Rationale:** Explicitly ratifying the current implementation rather than treating the asymmetry as a bug: this decision closes the previously-open question of whether the two "reach the dashboard" paths should behave the same way.
**Constraints:** If account creation later becomes a real, meaningful async operation, this decision must be revisited — "skip the loading screen exactly when the user finishes" would then skip real work, not just a placeholder timer.
**Implementation discretion:** N/A — behavior fixed as-is.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior undocumented/unintentional-reading of this same behavior.
**Open questions:** Revisit once account creation (D-030) becomes real — see Constraints.

### D-027 — "Link copied!" must be backed by a real clipboard write
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** The "Copy" action on S10 must actually write the link to the clipboard (e.g., via the Clipboard API) before showing the "Link copied!" confirmation. Today it shows the confirmation unconditionally with no underlying copy action — this does not meet spec.
**Rationale:** A confirmation the user can't trust is worse than no confirmation; this is a correctness requirement, not a nice-to-have.
**Constraints:** Must handle the failure case (permission denied / insecure context) — see D-013-style scaffolding avoidance; a real failure path is required, not just a real success path.
**Implementation discretion:** Engineers choose the exact API/fallback approach (e.g., `navigator.clipboard.writeText` with a `document.execCommand('copy')` or manual-select fallback).
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** the current no-op-clipboard implementation.
**Open questions:** What should the failure UI say/do? Not resolved here.

### D-028 — Displayed share-link must match the real preview URL
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Technical discovery
**Date:** 2026-09-01
**Decision:** The URL shown/copyable on S10 must be the same URL that "Open scheduling page" actually opens. Today they're unrelated — the displayed text is a hardcoded placeholder while the real action opens a locally-serialized preview URL.
**Rationale:** A user who copies "their link" today gets a non-functional placeholder — a direct, concrete trust/usability problem surfaced by this audit, tied to the still-open question of how closely the custom mock preview needs to track a real, shareable URL long-term.
**Constraints:** Must remain consistent with the "custom mocked preview" architecture decision — this is about internal consistency (displayed link = functional link), not about making the mock a live Acuity URL.
**Implementation discretion:** Engineers decide how the two are unified (e.g., always derive the displayed text from `serializeForSchedulingPage()`'s actual target).
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** the current hardcoded `app.acuityscheduling.com/schedule.php?owner=35753195` display text.
**Open questions:** Long-term ownership of preview/CSP synchronization remains open (carried from AUDIT-c3_c2.md, not resolved here).

### D-029 — Remove the entire "Keep exploring" module
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** The "Keep exploring" module (all 4 cards — "Book a test appointment," "Connect payment processor," "Sync your calendars," "Customize intake forms") is deferred to a future experiment. No version of it, including any relabeled card, ships in this flow.
**Rationale:** "Customize intake forms" specifically conflicts with the explicit decision to defer intake forms to future work; rather than swap that one card, the whole module is cut for this flow.
**Constraints:** None of the four cards may reappear without a new decision, even in stub/tooltip form.
**Implementation discretion:** N/A.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** the entire "Keep exploring" section as currently implemented (all 4 cards, all currently stubs except "Book a test appointment").
**Open questions:** none.

---

## Screen: s_loading_home / s_home — Dashboard

**Figma ref:** "Desktop v1 — B" → `Landing on product dashboard / Onboard complete` (`5995:15584`) · **Prototype ref:** `index.html#s_loading_home`, `index.html#s_home`

### D-030 — Account-creation failure requires a real error/retry state
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Flow
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** `s_loading_home` ("Setting up your account…") must have a real failure path: error copy, a retry affordance, and a defined answer for whether the user's wizard input survives a failure. Today there is none — this is the only irreversible server operation in the flow.
**Rationale:** Flagged as the single highest-risk gap by both HANDOFF.md and MISSING-STATES-SPEC.md and never addressed; it also isn't named as a goal in the current sprint, so it needs to be explicitly tracked rather than assumed to be someone's job already.
**Constraints:** Must cover: error copy, retry (manual or automatic — TBD), and wizard-input survival across a failure.
**Implementation discretion:** Retry mechanism and exact copy are Engineering/Design discretion once the underlying account-creation call is real; the requirement that *some* failure path exists is fixed.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** Manual vs. automatic retry; does wizard input survive a failure; is there a support escape hatch. None of these are resolved here — only the requirement that they be answered before this ships for real.

### D-031 — Dashboard setup checklist must reflect real progress
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** The setup-progress checklist/percentage on `s_home` must update based on actual completed setup steps. Today it's hardcoded at 0% regardless of what the user actually completed.
**Rationale:** A user who completes the entire wizard landing on a dashboard claiming 0% progress directly undercuts the program's own "measurable movement toward open for business" framing.
**Constraints:** Must reflect real state, not a cosmetic increment unrelated to actual completion.
**Implementation discretion:** Which specific tasks count toward the percentage, and how they're weighted, is Product/Engineering discretion.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** the current hardcoded 0% display.
**Open questions:** none beyond the discretion noted above.

---

## Cross-cutting / System

### D-032 — Dark theming architecture (OPEN)
**Status:** Open
**Binding scope:** Open
**Scope:** System
**Triggered by:** Design
**Date:** 2026-09-01
**Decision:** Not yet decided. Do not treat the current inline-JS dark-mode implementation (`toggleDarkMode()`, `_s10DarkMode`) as spec — it bypasses `tokens.dark.css` entirely, which ships unused despite being linked.
**Rationale:** A newer decision to implement 5 color modes (rather than a binary dark/light toggle) makes the current binary mechanism's continued relevance unclear.
**Constraints:** n/a until resolved.
**Implementation discretion:** n/a — not an Intended-behavior decision.
**Artifacts affected:** [x] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** —
**Open questions:** Is a binary dark/light toggle still relevant given the 5-color-mode decision, or does this need a different mechanism entirely? See Open Questions table.

### D-033 — Extend the modal-dialog pattern to C1–C5
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** System
**Triggered by:** Design
**Date:** 2026-09-01
**Decision:** The create-appointment sub-flow (C1–C5) should use the same real modal pattern established by D-004's exit-confirmation dialog — a dark scrim, `role="dialog"`, `aria-modal="true"`, focus trap, background `inert`, and focus restore on close — rather than remaining plain, non-modal divs.
**Rationale:** Figma has always rendered C1–C5 over a dark scrim (i.e., as true modals); the implementation now has a working modal pattern available elsewhere in the same codebase (D-004) that simply hasn't been applied here yet.
**Constraints:** Escape-to-close is already implemented for these panels and should be preserved through the migration, not reset.
**Implementation discretion:** Engineers may reuse the exit-confirmation dialog's exact implementation or build an equivalent shared pattern; the four accessibility properties listed above (scrim, `role="dialog"`/`aria-modal`, focus trap, focus restore) are fixed requirements, not optional.
**Artifacts affected:** [x] MD [x] Figma [ ] Prototype [ ] Ticket
**Supersedes:** the current plain-div `.create-panel` implementation.
**Open questions:** none.

### D-034 — Remove mobile-first CSS scaffolding; move to desktop-first
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** System
**Triggered by:** Product
**Date:** 2026-09-01
**Decision:** c3_c2's CSS architecture moves from mobile-first-with-desktop-override (current `@media (min-width: 1024px)` pattern) to desktop-first, using the breakpoints defined in the prior design session. Mobile-web layout behavior is out of scope for this experiment entirely.
**Rationale:** The experiment's own population definition excludes native mobile and mobile-web users; carrying a full parallel mobile layout (and matching "Appointments (mWeb)" content in Figma) is scaffolding for a population this flow doesn't serve.
**Constraints:** Desktop-only does not mean "ignore small windows" — whatever minimum-supported desktop width the prior design session defined still applies; it means no dedicated mobile/mWeb layout branch.
**Implementation discretion:** Whether to physically delete the mobile CSS or restructure the cascade is Engineering's call, as long as the resulting default (no-media-query) rendering is the desktop experience, not the mobile one.
**Artifacts affected:** [x] MD [x] Figma [ ] Prototype [ ] Ticket
**Supersedes:** the current mobile-first architecture.
**Open questions:** The exact desktop-first breakpoint values "from the prior design session" aren't captured in this file yet — see Follow-up Actions.

---

## c3_c1 parity & new decisions (2026-09-17 session)

A large c3_c1-specific work item landed a big Figma-audit-driven implementation pass (S10 redesign, Customize 5-mode port, appointment inline-edit accessibility/bug-fix pass — see prior session). This section continues that work: a full item-by-item pass across S1/S2/S5/create-flow/availability/S10/dashboard, explicitly run against this file's two-phase (audit → confirm → implement) workflow. Two components (appointment inline-edit side panel, availability inline-edit component) were routed through Phase 1 (audit-only) per standing process and are logged as pending IS-suggestions below, awaiting confirmation before any Phase 2 implementation.

### D-035 — c3_c1 S1 restored as a timed auto-advancing splash
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Product
**Date:** 2026-09-17
**Decision:** c3_c1's S1 is a brief (3000ms) branded loading-style splash with no interactive content — it auto-advances to S2 on its own, with no CTA, no back target, and no manual skip affordance. The prior rich welcome content (heading, 3-step list, asset-fan carousel, "Start building"/"Maybe later" buttons) is retired from c3_c1's S1 entirely, matching a version of this screen this same prototype had earlier in its history before being reverted.
**Rationale:** Explicit product decision this session, confirmed via clarifying question (replace vs. layer-a-timer-on-top; "replace" was chosen). Mirrors the same "timed splash, not a real step" characterization already written into c3_c1's own S2 code comments, which had gone stale relative to the (reverted) rich-content S1 that preceded this decision.
**Constraints:** The 3000ms delay is a prototype stand-in (same status as c3_c2's D-013 2000ms/1800ms timers) — not a production timing spec.
**Implementation discretion:** Exact splash copy ("Setting up your workspace") and the reused `.loading-wrap`/dotlottie-player markup (same pattern as S4) are Engineering discretion pending design confirmation.
**Artifacts affected:** [x] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the rich welcome-content S1 (heading/3-step list/carousel/CTAs) built earlier in this prototype's history.
**Prototype ref:** c3_c1 only. c3_c2's S1 (its own D-004 territory) is unaffected.
**Open questions:** Exact splash copy/timing pending design sign-off.

### D-036 — Acuity logo (top-left) is decorative, not a link, across all c3_c1 screens
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** System
**Triggered by:** Technical discovery
**Date:** 2026-09-17
**Decision:** The `.desktop-nav-logo` element (top-left Acuity mark, present on S1/S2/S5/S9/S10) is a non-interactive `<span>`, not an `<a href="#">`. It shows no pointer cursor and has no click behavior anywhere in the flow.
**Rationale:** The previous `<a href="#">` markup rendered a pointer cursor and link semantics with no actual destination — a broken affordance, not a deliberate one.
**Constraints:** If the logo is ever meant to link somewhere (e.g. marketing site, dashboard), that's a new decision — don't silently re-add `href="#"` as a placeholder.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior `<a class="desktop-nav-logo" href="#">` markup on all 5 screens it appeared on.
**Prototype ref:** c3_c1 only (not audited against c3_c2 in this pass).
**Open questions:** none.

### D-037 — S2 search combobox: click-outside/Escape collapse it; result selection persists across back-navigation
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Technical discovery
**Date:** 2026-09-17
**Decision:** Three related fixes to c3_c1's S2 business-type search: (1) the results dropdown (`#s3-other-describe .s2-search-dropdown`) is now hidden by default and only shown while the input is active (focused), toggled via a `.s2-search-active` class; clicking anywhere outside the component, or pressing Escape while the input is focused, collapses it and blurs the input. (2) Escape more generally blurs whatever input/textarea is currently focused, app-wide, whenever no overlay/dialog/panel is open to close instead (the existing Escape-closes-topmost-overlay priority list is checked first). (3) Selecting a chip result (not just typing) now updates the same `_s2DraftText` draft-persistence variable free-text entry already used, so navigating S2 → forward → back shows the previously selected option, not a blank field.
**Rationale:** All three were confirmed bugs, not design decisions: the dropdown previously had no hide mechanism at all (always visible once rendered); `_s3OtherSelectChip()` set the input's value directly without touching the same `_s2DraftText` variable the draft-restore logic reads from, so a chip pick (as opposed to typed text) was silently lost on re-visit.
**Constraints:** The click-outside handler must not fire when the click target is inside the component itself (e.g. the clear button, a result row) — verified this doesn't create a race with those buttons' own click handlers.
**Implementation discretion:** N/A — behavior fixed; `_s2CollapseSearch()`'s internals are Engineering discretion.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior always-open dropdown with no collapse mechanism.
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-038 — S2 right-column search input aligns to the left column's heading, not the column top
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Local
**Triggered by:** Technical discovery
**Date:** 2026-09-17
**Decision:** On desktop, `#s2 .s2-lookup-right`'s top padding is offset by the same height as the left column's eyebrow + progress-bar block (16px line-height + 12px gap + 2px bar + 24px header gap = 54px, composed via `calc()` from spacing tokens) so the search input's top edge lines up with the `wizard-heading` text's top edge, rather than the column's outer top edge.
**Rationale:** The two-column grid uses `align-items: flex-start`, so without this offset the right column (which has no eyebrow-equivalent element) starts noticeably higher than the left column's heading — the reported "sitting too low"/misalignment complaint was actually the search input sitting too HIGH relative to the heading it's meant to line up with.
**Constraints:** None beyond keeping the offset in sync if the left column's eyebrow/progress-bar/header-gap values ever change.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-039 — Skipping S2 with empty/no input must resolve to the true generic template set
**Status:** Decided
**Binding scope:** Intended behavior
**Scope:** Screen
**Triggered by:** Technical discovery
**Date:** 2026-09-17
**Decision:** Both S2 skip paths (the always-visible top-nav/mobile "Skip" button, and the bottom-nav button when it reads "Skip" because the field is empty) now explicitly reset `window._selectedVertical`/`window._selectedIndustry` to `null` before navigating to S4, so `resolveActiveTemplate()`/`getTemplateFallback()` resolve to the universal `_GENERIC_FALLBACK` catalog (Intro Consultation / Standard Session / Working Session / Follow-Up), not a vertical-specific fallback.
**Rationale:** Confirmed bug, not a design choice: `window._selectedVertical` is hardcoded to `'Beauty'` at page-load time (before any user input) as scaffolding so the create-flow's chips have something to show pre-S2; neither skip path ever cleared this default, so skipping silently routed to Beauty's own vertical-level fallback appointments (reported as "Beauty agnostic": Beauty Concentration / Signature Facials / Spa Day Package / Manicure and Pedicure) instead of the real generic set.
**Constraints:** The page-load `'Beauty'` default itself is intentionally left in place (still needed as a sane pre-S2 default elsewhere) — only the two skip paths were changed to explicitly clear it.
**Implementation discretion:** N/A — behavior fixed.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior skip behavior, which left the page-load `'Beauty'` default in place.
**Prototype ref:** c3_c1 only (c3_c2 not audited for the same bug in this pass — worth a follow-up check).
**Open questions:** Does c3_c2 have the same bug? Not checked in this pass.

### D-040 — S2 → S5 gets a dedicated vertical fade transition; S4 no longer sits between them
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Screen · **Triggered by:** Product · **Date:** 2026-09-17
**Decision:** Both S2 exit paths (submit and skip) now navigate directly to S5 — the S4 "Generating appointments" loading screen no longer sits between them. `showScreen()` special-cases this one transition: S2 exits with a vertical fade+translate (opacity 1→0, translateY 0→40px, 280ms) instead of the generic horizontal slide; S5's container gets no whole-screen enter animation at all (see D-041 for what replaces it).
**Rationale:** Explicit product decision — S4 is reserved for genuine async loading states elsewhere, not used as a transition device for a step that has no real loading work to do.
**Constraints:** S4 itself is not deleted — it remains reachable/reusable for a real future async step. Its own internal 2000ms auto-advance-to-S5 timer is untouched (still fires if something else navigates to S4).
**Implementation discretion:** Exact easing/duration (`cubic-bezier(.2,.8,.2,1)`, 280ms) is Engineering discretion pending design confirmation.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior S2 → S4 (2000ms fixed timer) → S5 hop.
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-041 — S5 entrance is 4 independently-tunable staggered groups (Groups A–D)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Screen · **Triggered by:** Product · **Date:** 2026-09-17
**Decision:** Following the S2→S5 transition (D-040), S5's own content animates in as four groups, each fading in + settling up from a 40px offset on its own schedule: **Group A** = `.s5-preview-controls` (customize + device toggle), **Group B** = `.s5-browser-frame` (preview pane), **Group C** = `.bottom-nav`, **Group D** = `.s5-wizard-body`'s direct children (`wizard-header` / `s5-list-top` / `s5-carousel`), each of which additionally staggers independently within Group D. All timing lives in `#s5`'s `--s5-enter-delay-*`/`--s5-enter-duration`/`--s5-enter-ease` custom properties for easy retuning.
**Rationale:** Explicit product decision — the entrance should read as a choreographed reveal of distinct UI regions, not a single uniform block fade.
**Constraints:** Group/step timing values (a=0ms, b=60ms, c=240ms, d=120ms base + 40ms/child) are placeholder defaults pending design sign-off — the mechanism (per-group `animation-delay` via CSS custom properties) is the fixed part, not the specific numbers.
**Implementation discretion:** Exact per-group order/timing is Engineering discretion until design specifies otherwise — flagged as tunable by design.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** —
**Prototype ref:** c3_c1 only.
**Open questions:** Confirm final per-group timing/order with design.

### D-042 — S5 skeleton flash extended to Your-appointments + the live preview; empty state now actually reachable
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Screen · **Triggered by:** Product/Technical discovery · **Date:** 2026-09-17
**Decision:** The existing "Recommended for you" skeleton flash (`generateAISuggestions()`, previously undocumented custom timing) now also covers the preloaded "Your appointments" card and the live preview iframe, resolving together after `S5_SKELETON_MS` (400ms, tunable). Separately: the live preview's `skeletonOnEmpty` fallback (used when `state.selectedAppts` is empty) is now gated on `!state.s5AutoAddedFirst` — once S5 has resolved once, a later empty selection (user removed everything) renders the real Figma empty state, not a permanently-stuck skeleton.
**Rationale:** Product asked for the three surfaces (Recommended, Your appointments, preview) to flash in lockstep. Separately, a prior audit (IS-S5EMPTY-1) found the empty-state markup already existed and already matched Figma copy exactly, but was unreachable in practice because `skeletonOnEmpty` fired unconditionally on every zero-selection render, including a genuine post-removal empty state.
**Constraints:** The skeleton flash itself is cosmetic/prototype-only (`S5_SKELETON_MS`); the empty-state-reachability fix is a real bug fix, not a timing preference.
**Implementation discretion:** N/A for the reachability fix; flash duration is Engineering/Design discretion, exposed via `S5_SKELETON_MS`.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior unconditional `skeletonOnEmpty` behavior.
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-043 — Appointment-card icon buttons get a larger hover/click target + visible hover state; drag cursor scoped to the handle
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** System · **Triggered by:** Product · **Date:** 2026-09-17
**Decision:** `.appt-icon-btn` (edit/remove on appointment cards) and the equivalent availability-screen icon buttons (`.avail-range-icon-btn`, `.avail-ellipsis-btn`, `.avail-day-circle`) now show a visible hover background, and the appointment-card icons get an enlarged (~32px, via an inset `::before`) hover/click hit target beyond their 16px visual size. Separately, `.appt-card--selected-item`'s `grab` cursor is now scoped to `.appt-drag-handle` only — the rest of the card (where clicking opens edit) keeps the default pointer cursor.
**Rationale:** Explicit product decision. The whole-card `grab` cursor was misleading since only the drag handle is actually draggable — clicking elsewhere on the card opens edit, not drag.
**Constraints:** `.appt-icon-btn--add` (already a bordered-square button with its own larger hit target) opts out of the generic hover-halo treatment to avoid a visually disconnected double-border look; it gets its own direct `:hover` background instead.
**Implementation discretion:** Exact hover tint tokens are Engineering discretion.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior no-hover-state treatment on both screens' icon buttons.
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-044 — Preview-pane toggle order and Styles-panel spacing now match c3_c2
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** System · **Triggered by:** Product · **Date:** 2026-09-17
**Decision:** On both S5 and S9's preview pane, the device (desktop/mobile) segmented toggle now renders BEFORE the Customize trigger in `.s5-preview-controls` (previously the reverse) — matching c3_c2's order. The Customize trigger's own visual treatment (the "Aa" + swatch-fan + divider + "Customize" label version) is unchanged, per explicit instruction not to touch it. Separately, the Styles side-panel's palette grid (now a real 2-column CSS grid, cards 44px not 64px, light-grey not white background), mode-card border color, and body top padding were brought in line with c3_c2's current values.
**Rationale:** Explicit product decision to close cosmetic drift between the two prototypes' shared preview-pane component, while explicitly preserving c3_c1's own (more current) Customize-trigger visual.
**Constraints:** The Customize trigger button itself (`.s5-theme-card`) is explicitly OUT of scope for this parity pass — do not revert it to c3_c2's simpler no-label version.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior toggle order and palette-grid/mode-card styling.
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-045 — Appointment edit-sheet Save/Discard bugs fixed
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Technical discovery · **Date:** 2026-09-17
**Decision:** Two related bugs fixed in the appointment inline-edit sheet: (1) "Save changes" (an already-selected card) is now disabled until the sheet's live values actually differ from the open-time snapshot — "Save and select" (a not-yet-selected/recommended card) stays always-enabled, since adding it is meaningful on its own even with zero edits. (2) The discard-confirmation dialog on Close no longer fires spuriously when nothing was actually changed — root cause was `_editSnapshot`'s duration/price fields storing the raw, un-normalized catalog string (e.g. the generic fallback catalog's `"1 hr"`) while the live-draft comparison always reconstructs a normalized `"N min"`/`"$N"` string, so even an untouched card could read as "changed" purely from a format mismatch. The snapshot now normalizes duration/price through the same formatting the draft comparison uses.
**Rationale:** Both confirmed bugs, not design decisions — verified the mismatch reproduces concretely for the generic fallback catalog's "1 hr" duration entries.
**Constraints:** None.
**Implementation discretion:** N/A — behavior fixed.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior always-enabled Save button and the false-positive discard-confirmation trigger.
**Prototype ref:** c3_c1 only (not checked against c3_c2 in this pass — c3_c2's edit sheet has no discard-confirmation mechanism at all per the pending IS-APPTEDIT-8 audit finding, so this bug wouldn't manifest there the same way).
**Open questions:** none.

### D-046 — Removing an appointment resets its edits; Recommended-for-you cap grows with returned items
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Screen · **Triggered by:** Product · **Date:** 2026-09-17
**Decision:** Two related fixes to `removeAppt()`: (1) removing an appointment from "Your appointments" now discards any edits made to it (`delete state.apptEdits[id]`) — if it's later re-suggested/re-added, it shows its original default state, not the stale edit. (2) The "Recommended for you" list's display cap (`state.s5AvailCap`, starts at 3) now increments by 1 every time an appointment is removed back into that list, so a returned item is never re-capped out of view alongside whatever was already showing (e.g. 3 shown + 1 returned = 4 shown, not capped back to 3).
**Rationale:** Explicit product decision — a removed appointment should behave as if it never left the recommendation pool (fresh state, visible alongside what's already there), not as an edited item competing for a fixed 3 slots.
**Constraints:** The cap only grows, never shrinks, and grows on every removal regardless of whether the removed item had actually been edited.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior fixed cap-of-3 and edit-persists-after-removal behavior.
**Prototype ref:** c3_c1 only.
**Open questions:** Should the cap ever reset (e.g. on business-type change per D-047-area logic)? Not addressed here — flagging for a follow-up if it becomes visibly odd in practice.

### D-047 — Create-appointment flow: hide title chips and AI description-generation
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Screen · **Triggered by:** Design · **Date:** 2026-09-17
**Decision:** C01 (title step) no longer shows a title-suggestion chip row — confirmed against current Figma (`✼ UXT — Onboarding`, page "🟩 C3 — Desktop v1", node `7689:181956`), which has no chip layer at all on this step. C02 (description step) no longer shows the "Generate description" AI trigger/status chip — manual typing only, matching current Figma (node `7689:181996`), which shows a plain ghost textarea with no AI affordance. Both rows are hidden via the `hidden` attribute, not deleted — the step1→step2 data hookup (`selectCreateChip()`'s highlighting, `rebuildCreateChips()`/`applyIndustryData()` population) and the AI-generation JS (`generateDescription()`, history/undo) are left intact and unused, in case the surrounding wiring is needed again later.
**Rationale:** Explicit product decision, confirmed against current Figma via research pass — neither the chip row nor the AI-generation affordance exist in the current design for either step.
**Constraints:** The data hookup between step 1 and step 2 must keep working even with the chip row hidden — verified `selectCreateChip()`/`rebuildCreateChips()` don't depend on the row being visible.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior visible chip row (C01) and AI-generation UI (C02).
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-048 — C04 (price step): flat custom input only, no preset chips
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Design · **Date:** 2026-09-17
**Decision:** C04 shows only the `$` + tap-to-edit numeric ghost input — the flat preset-price chip row (`$0`/`$50`/.../`$500`, added in an earlier pass as a replacement for the retired 3-tier AI pricing system) is removed entirely, along with its click-handler wiring.
**Rationale:** Confirmed against current Figma (node `7689:182468`, "Dialog - C04 - Fallback/generic") — the shipped v1 frame is exactly `$` + numeral, no chip row of any kind.
**Constraints:** None.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the interim flat price-chip grid.
**Prototype ref:** c3_c1 only.
**Open questions:** none.

### D-049 — C05 "image already added" state matches Figma's Asset Card treatment
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Design · **Date:** 2026-09-17
**Decision:** Once an image is added in C05, the decorative photo collage is replaced by an Asset Card (thumbnail, filename, "Image" type label, Replace/Edit/trash actions) in the SAME position — but the Upload dropzone row and its helper caption remain visible below it, just dimmed/disabled (`opacity:0.4; pointer-events:none`), rather than being hidden outright as before.
**Rationale:** Confirmed against current Figma (node `7689:193340`/`7689:193371`) — the "added" state keeps the (disabled) Upload row visible with a 22px gap below the Asset Card, it doesn't remove it.
**Constraints:** The "Edit" action added alongside Replace/trash is currently a stub (opens the same file picker as Replace) — no real image-editing capability (crop, etc.) is implemented or was requested; it exists to match the visual/structural spec, not new functionality.
**Implementation discretion:** Exact dimmed-opacity value is Engineering discretion.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the prior full-hide-of-placeholder-on-upload behavior.
**Prototype ref:** c3_c1 only.
**Open questions:** Should "Edit" eventually do something distinct from "Replace" (e.g. crop/caption)? Not addressed here.

### D-050 — Duration step: fixed a duplicate tap-to-edit registration bug
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Technical discovery · **Date:** 2026-09-17
**Decision:** Removed a second, older, duplicate "duration span tap-to-edit" IIFE that had been left in the file alongside the current one (added in an earlier session pass alongside `_c3ValidateDuration()`). Both attached competing click/blur listeners to the same `.duration-num` span and inserted their own separate `<input>` elements after it — the reported "clicking into the input duplicates the input's view" bug, and very likely also the reported "15 min renders as 5 hour" mislabeling (a stale value from whichever duplicate input's blur handler fired last could silently overwrite the correct one). The duration chips row now also resets its scroll position to fully-left every time the step is (re-)entered, since `#panel-c3` is a persistent DOM node reused across every create-flow visit.
**Rationale:** Confirmed by direct code inspection — found two nearly-identical IIFEs both querying `#panel-c3 .duration-num` and both calling `insertAdjacentElement('afterend', ...)` on it.
**Constraints:** None.
**Implementation discretion:** N/A — bug fix.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the duplicate IIFE (removed).
**Prototype ref:** c3_c1 only.
**Open questions:** Should c3_c2 be checked for the same duplication? Not checked in this pass.

### D-051 — S5 round trips through S2 only regenerate when business type actually changed
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item · **Date:** 2026-09-17
**Decision:** `showScreen()`'s `id === 's5'` hook now compares a `window._selectedVertical + '|' + window._selectedIndustry` signature against the one recorded at the last full S5 regen (`state._s5LastVerticalKey`). If unchanged (S5→S2→S5 with no business-type change), the hook does nothing — `state.catalogOverride` and the existing DOM are left untouched, so the screen reappears exactly as it was left (Your Appointments and Recommended-for-you both, no skeleton replay). If the signature changed (S5→S2→[new business type]→S5), the existing reset-and-regenerate path runs: `state.catalogOverride = null` then `generateAISuggestions()`, which recomputes Recommended-for-you from the new vertical while `state.selectedAppts` (Your Appointments) is never touched by that path and so persists unchanged either way.
**Rationale:** Confirmed by static trace that `state.selectedAppts` has exactly one `= []` assignment in the whole file (initial state declaration) — no navigation path was ever clearing it, so item 40's "Your Appointments persists" half was already satisfied. Item 39's "exactly as left" half was NOT satisfied before this fix: the old hook unconditionally reset `catalogOverride` and replayed the skeleton flash on every single S5 entry, including unchanged round trips, which is a needless visual reflow even though the regenerated content would typically look the same.
**Constraints:** None.
**Implementation discretion:** N/A — direct fix for stated items 39/40.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the previous unconditional `catalogOverride = null; generateAISuggestions();` call on every S5 entry.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-052 — S5 "Continue with selection" CTA gets a trailing chevron
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item · **Date:** 2026-09-17
**Decision:** Added a trailing `.acuity-icon--sm` chevron (`icon-chevron-small-right.svg`) inside `#s5-continue`, plus `gap: var(--acuity-spacing-8)` on the shared `.btn-primary` base rule so icon+label spacing is consistent wherever else that class gains an icon. `.btn-primary` was already `display:flex; align-items:center; justify-content:center`, so this is additive with no layout risk for existing icon-less `.btn-primary` buttons (a `gap` on a single flex child is a no-op).
**Rationale:** Direct task instruction ("match Figma, which includes a chevron icon"); no Figma node was pulled for exact icon/spacing since the ask was narrow — used the same chevron already established elsewhere in c3_c1 (S2 result rows, share-modal action rows) for visual consistency.
**Constraints:** None.
**Implementation discretion:** Icon size (`--sm`, 14px) and gap (`--acuity-spacing-8`) chosen to match the existing chevron usage elsewhere in the file; not verified against a specific Figma frame for this exact button.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-053 — S9 "different setups" toggle copy: confirmed correct, no change needed
**Status:** Decided (confirmed-correct, no fix) · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item · **Date:** 2026-09-17
**Decision:** c3_c1's toggle label already reads "Setup different availabilities for different appointments" (`c3_c1/index.html:6886,6888`), which matches the two dedicated variant-matrix Figma frames (`7689:192612`, `7689:192628`) verbatim. Figma's main-flow instance (`7689:181953`) instead reads "Setup different hours for different appointments" — an internal Figma inconsistency, not a prototype bug. Resolution: keep "availabilities," since the dedicated spec-matrix frames are the more deliberate/authoritative source for this exact control (the main-flow instance is more likely to be stale/unedited). No code change made.
**Rationale:** Direct text comparison against both Figma sources (see the Figma research report delivered earlier this session).
**Constraints:** None.
**Implementation discretion:** Resolving the Figma-internal inconsistency in favor of "availabilities" is a judgment call, not a verified single source of truth — flagging in case the user has separate knowledge of which frame is current.
**Artifacts affected:** [ ] MD [x] Figma [ ] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** Which Figma frame (main-flow vs. spec-matrix) is actually current for this string? Not resolved by the MCP research pass.

### D-054 — S9 availability: trash icon, range validation, chronological sort, and overlap field-level errors
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task items 44–48 · **Date:** 2026-09-17
**Decision:**
- **Item 44 (trash icon):** Replaced `_AVAIL_TRASH_SVG`'s inline hand-drawn path (also duplicated, unused, in `c3_c1/assets/icon-trash-bin.svg`) with the canonical current Rosetta glyph via the standard `.acuity-icon` pattern (`../ds/icons/icon-trash-bin.svg`, `--md`/16px). Per the earlier Figma research, no trash icon exists on the primary day row at all — it's correctly scoped to secondary range rows only, which was already the case; only the glyph artwork itself was outdated.
- **Item 45 (cap ranges, allow editing existing):** Handled reactively rather than by constraining the native time-input pickers — nothing invalid can be *saved* (see below), but every field stays freely editable at all times, including a pre-existing out-of-order/overlapping range, so the user is never locked out of fixing one.
- **Item 46 (min 1-minute gap + midnight edge case):** Added `AVAIL_MIN_RANGE_MINUTES = 1` and a new `_availEndMinutes()` helper: a range ending at "12:00 AM" now resolves to minute 1440 (end of day) rather than 0, so it no longer falsely fails the end-after-start check against any nonzero start.
- **Item 47 (chronological re-sort on save):** New `_availSortDayRanges()` sorts each enabled day's `ranges` array by start time and writes the result back into `block.dayData[dayIdx]` inside `_availValidateBlock()`, unconditionally (whether or not validation ultimately errors). Both the collapsed card summary and the reopened panel read straight from `block.dayData`, so this one write-back point fixes both surfaces.
- **Item 48 (overlap validation with field-level highlighting):** `_availValidateBlock()` now returns `{ message, dayIdx, rangeIdx, role }` instead of a bare string. `saveAvailCard()` re-renders the (now sorted) day bodies, clears any previous `.avail-time-pill--error` state, and — on error — adds that class to the exact offending input (via `[data-range][data-role]` on the day's body) and focuses it, in addition to showing the existing day-level message in `#avail-validation-error`.
**Rationale:** Direct task instructions; the pre-existing `_availValidateBlock()`/`saveAvailCard()` pair (added in an earlier pass, referencing IS-S9-1) already blocked end-before-start and overlap on Save with a generic per-day message — this extends rather than replaces that mechanism, since it was already the right shape (reactive block-on-save) for items 45–48.
**Constraints:** Error state clears only on the next Save attempt (not live as the user retypes) — acceptable minimum per the ask ("a warning/focus state directly on the offending inputs"), not gold-plated with live-clear-on-input.
**Implementation discretion:** Chose reactive (block-on-save) over proactively constraining `<input type="time">` min/max, specifically because proactive constraints risk fighting item 45's "allow editing existing ranges" requirement for already-invalid legacy data.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the previous single-string-return `_availValidateBlock()` and generic-only `saveAvailCard()` error handling.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-055 — S9: removed "different calendars/exceptions" copy (confirmed absent from current Figma)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item 49 · **Date:** 2026-09-17
**Decision:** Removed the `<p class="avail-drawer-note">You'll be able to set different hours for different calendars and add exceptions from your calendar.</p>` line from `_availGridHTML()`, plus its now-dead `.avail-drawer-note` CSS (cascade-stagger entry and standalone rule).
**Rationale:** The Figma research pass earlier this session confirmed this sentence does not exist anywhere in the current design.
**Constraints:** None.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-056 — S10 final screen: CTA labels/icons match Figma; "Keep exploring" now navigates instead of expanding cards
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task items 51, 56, 57, 58 · **Date:** 2026-09-17
**Decision:**
- **Item 51:** Desktop primary CTA relabeled "Share" → **"Share page"**, icon swapped from `icon-external.svg` (external-link glyph) to `icon-link.svg` (plain link glyph), matching the Figma research report's read of node `7878-226959` ("Share page," primary, link-glyph icon). The secondary "Keep exploring Acuity" button already had no icon and was already centered as a pair with Share — matches Figma, no change needed there.
- **Items 57 + 58:** `#s10-keep-exploring-btn`'s `onclick` changed from `toggleKeepExploring()` (which expanded an inline 4-card module) to `showScreen('s_home')` — same destination as "Close setup"/"Done." The `aria-expanded`/`aria-controls` attributes (no longer meaningful) were removed from the button. `toggleKeepExploring()` and the `#s10-keep-exploring` 4-card markup/CSS are left in place, unused, per the explicit instruction that the card module is a candidate for a future separate variant, not something to delete this pass.
- **Item 56:** The Figma research pass found no "Close Setup" button in current Figma at all — instead the top-nav shows a "DONE" (uppercase) text control plus a separate "×" icon button. Relabeled the existing text button "Close setup" → **"Done"** (renders uppercase automatically via `.desktop-nav-text`'s existing `text-transform: uppercase`) and added a second `.desktop-nav-close` × icon-button beside it (same SVG glyph already used for S10's mobile-nav ×), both wrapped in a new `.s10-desktop-nav-actions` flex container so `.desktop-top-nav`'s `justify-content: space-between` doesn't split them to opposite ends. Both controls call `showScreen('s_home')` directly (no `confirmExitOrProceed()` wrapper), matching the existing code comment on S10's mobile × ("final step: no exit-confirm, per product decision") — Figma exposes no distinct destination/behavior for DONE vs. × individually, so giving them the same action was the only defensible choice without inventing behavior.
**Rationale:** Figma research report (delivered earlier this session) read against current node `7878-226959`; items 57/58 are direct, unambiguous bug-fix instructions from the task list independent of the Figma read.
**Constraints:** None.
**Implementation discretion:** The DONE+× pairing is a faithful layout translation of what Figma shows, but Figma's MCP data exposed no prototype-interaction/destination metadata for either control — routing both to Home Dashboard is a judgment call, not a confirmed spec fact. Flagging this explicitly: if DONE and × are meant to diverge (e.g., × discards vs. DONE confirms), that distinction is not visible in the current Figma file via MCP and would need a manual design check.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the single "Close setup" text button (removed as a standalone control, replaced by the DONE+× pair); the `toggleKeepExploring()` click wiring on `#s10-keep-exploring-btn` (function itself kept, unused).
**Prototype ref:** c3_c1 only.
**Open questions:** Should DONE and × on S10 ever diverge in behavior? Not resolvable from Figma via MCP in this pass — flagging for the user rather than guessing further.

### D-057 — S10 "Preview" (item 53) and share-modal QR toast (item 55): confirmed-as-is, with caveats
**Status:** Decided (confirmed-correct with caveats, no fix) · **Binding scope:** Prototype-only · **Scope:** Local · **Triggered by:** Task items 53, 55 · **Date:** 2026-09-17
**Decision:** No code change for either.
- **Item 53:** There is no control literally labeled "Preview" in c3_c1's S10 — the closest match is the entire live scheduling-page iframe area (`#s10-page-preview`, `aria-label="Open your scheduling page in a new tab"`), which already opens `openSchedulingPage()` in a new tab on click. This already satisfies the stated behavior ("Preview" link opens booking page in new tab) even though there's no Figma-named "Preview" control to check it against — Figma's current S10 shows the booking-page preview inline with no separate "open in new tab" affordance at all. Keeping current prototype behavior as-is per the task's own "confirm/keep" framing.
- **Item 55:** No toast/snackbar/notification layer exists anywhere in the current share-modal Figma variants (6 variants checked). The prototype's QR-section toast may be a prototype-only addition with no current Figma backing. Keeping it as-is per the task's "confirm/keep as-is" framing, but flagging explicitly since "confirm" and "no Figma evidence" are in tension — if the user has a different source confirming this toast, no action needed; if not, this may be worth reconsidering during the item 54 share-modal pass.
**Rationale:** Figma research report cross-check against current c3_c1 code.
**Constraints:** None.
**Implementation discretion:** N/A — explicitly a confirm/no-op per the task list, with the Figma-mismatch called out rather than silently resolved either way.
**Artifacts affected:** [ ] MD [x] Figma [ ] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** Is the QR toast (item 55) intentional prototype-only polish, or should it be dropped for design fidelity during the item 54 pass? Flagging for the user's call.

### D-058 — Share modal: item-by-item pass to match Figma's "Share your page" spec
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item 54 · **Date:** 2026-09-17
**Decision:** Checked the existing `#share-dialog-backdrop` module against the Figma research report field-by-field:
- Title "Share your page," link-scope dropdown defaulting to "General Scheduling Page" (with per-appointment options appended) — already matched exactly (`_shareDialogCandidates()`), no change.
- Added a "Page link" label (reusing `.style-misc-label`, wrapped in a `.share-scope-field` for consistent spacing) above the URL/Copy row, which previously had no label of its own — per the report's "a link row (label 'Page link' …)".
- QR: resized the QR graphic from 96px to the spec's 100px, wrapped it in a new 124px white `.share-qr-tile`, and moved the download icon-button from a trailing flex sibling to `position:absolute` in the tile's lower-right corner (`.share-qr-download`) — matches "100px QR in a 124px white tile, download icon at lower-right." The existing helper note text was already correct.
- Hid `.share-more-actions` (Embed in website / Send to phone / Post on social) via `display:none` rather than deleting it — all six Figma share-modal variants checked have this section hidden, so hiding matches current design, but the markup/handlers are left intact since this was flagged as the prototype being "ahead of" (not behind) the current design; easy to re-show if that's not the intent.
**Rationale:** Direct field-by-field comparison against the Figma research report delivered earlier this session (no new Figma calls made this pass — reused the existing findings).
**Constraints:** None.
**Implementation discretion:** Whether to hide vs. keep the 3 "additional channels" rows was a judgment call — chose "hide, don't delete" as the safer middle ground between blindly matching a stripped-down current design and discarding functional prototype work outright. Flagging in case the user wants them restored.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the previous 96px unwrapped QR image + trailing download button; the previously always-visible "additional channels" section.
**Prototype ref:** c3_c1 only.
**Open questions:** Should the "additional channels" rows (Embed/Send to phone/Post on social) be restored as visible, deleted outright, or kept hidden as done here? Flagging for the user's call.

### D-059 — Home Dashboard: added the calendar-sync TIP card; rest already matched current design
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item 59 · **Date:** 2026-09-17
**Decision:** Comparing the desktop dashboard body (`.home-desktop-body`, `c3_c1/index.html`) against Figma's canonical current frame `8054:362620` ("Reorder only"): the "Home" title, SETUP card, "Upcoming appointments" empty-state card (with "Book test appointment" + external-link icon), the 3 placeholder stat cards (Hours Booked / Collected Revenue / Total Expected Revenue), and the 272px grouped left sidebar (Home/Calendar/Availability/Contacts | Scheduling Page/Appointment Types/Packages & Promos/Payments/Emails & Texts | Integrations/Reports, plus a bottom avatar+settings+help row) were **already implemented and already matched** — no changes needed there, apparently from an earlier session pass not captured in this file's decision log. The one missing piece was the calendar-sync **TIP card** ("Prevent booking conflicts" + SYNC CALENDARS/DISMISS actions + a graphic), which didn't exist at all. Added `.home-tip-card` between the Upcoming-appointments card and the stats row, reusing the same two-pane layout language as `.home-setup-card` (left: eyebrow "Tip" + heading + body + SYNC CALENDARS (primary) / DISMISS (secondary) actions; right: an inset panel). "Dismiss" removes the card from the DOM (`this.closest('.home-tip-card').remove()`); "Sync calendars" is a stub (`showProtoTooltip()`), matching the same illustrative-stub pattern already used for other not-yet-real dashboard actions (e.g. the sidebar's non-Home links).
**Rationale:** Direct comparison against the Figma research report's dashboard section, delivered earlier this session.
**Constraints:** None.
**Implementation discretion:** The right-hand graphic is a simplified icon treatment (a calendar glyph with a small refresh badge) rather than a literal phone-mockup illustration, since no such asset exists in this repo and fabricating one felt like overreach for a placeholder/tip card. Flagging as a simplification, not a considered design decision — revisit if a real asset becomes available.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** Is the icon-based graphic an acceptable stand-in for the Figma phone mockup, or should this be revisited with a real asset?

### D-060 — Flagged for later, log only: two future S5 variants (not built this pass)
**Status:** Open (flagged, not decided) · **Binding scope:** Open · **Scope:** Local · **Triggered by:** Task items 37, 38 · **Date:** 2026-09-17
**Decision:** No implementation. Logging two possible future directions the user flagged explicitly as out of scope for this pass:
- **Item 37:** a possible future variant where "Create New Appointment" happens fully inline (no modal), with auto-delete of the draft if left unsaved.
- **Item 38:** a possible future duplicate-icon action alongside the existing edit/delete icons on appointment cards — needs design work first, no spec to implement against yet.
**Rationale:** Direct task instruction: "do not build."
**Constraints:** None.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [ ] Figma [ ] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only (would-be).
**Open questions:** Both need dedicated design/spec work before a future implementation pass.

### D-061 — Appointment inline-edit audit (IS-APPTEDIT-1–12): confirmed and implemented in c3_c1
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User confirmation, one-by-one, of the IS-APPTEDIT-1–12 audit · **Date:** 2026-09-17
**Decision:** User confirmed each IS-APPTEDIT finding individually. Implemented in c3_c1 only (c3_c2 was already correct on all of these):
- **IS-APPTEDIT-1:** added `.appt-card--selected-item .field-input-group { border-color: var(--acuity-border-default); }`.
- **IS-APPTEDIT-2 & 4:** both the "Add an image" and "Add a description" chips' static markup switched from hand-drawn inline SVGs to `.acuity-icon` + `icon-plus-glyph.svg`. (IS-APPTEDIT-4 was flagged as dormant at the time — see D-062, which found the JS runtime was independently overwriting this markup and fixed that too.)
- **IS-APPTEDIT-3:** `.sheet-asset-filename` 16px→14px, `.sheet-asset-replace` 14px→12px.
- **IS-APPTEDIT-5:** the shared `#s5.screen.active, #s9.screen.active { grid-template-columns: 1fr Npx; }` rule (right pane width) changed 480px→420px in **both** c3_c1 and c3_c2 (c3_c2's own comment was stale, still said 480px — fixed there too even though c3_c2's actual value was already 420px).
- **IS-APPTEDIT-6:** confirmed correct as-is (5 vs. 3 cap is intentional, matches D-014) — no fix.
- **IS-APPTEDIT-7 ("Private appointment" toggle):** declined — not ported into c3_c1.
- **IS-APPTEDIT-8 & 9:** confirmed no action — c3_c1's discard-confirm/live-preview-draft system and its Save/Cancel-gated image upload are already ahead of c3_c2; don't regress.
- **IS-APPTEDIT-10:** added the missing `#s5 .appt-card--ai.appt-card--editing` / `#s5 .appt-card--selected-item.appt-card--editing` border-color re-declarations.
- **IS-APPTEDIT-11:** `#s5 .wizard-body` gap 44px→24px; `#s5 .wizard-header` gained `margin-bottom: var(--acuity-spacing-16)`; `#s5 .wizard-subheading` font-size 16px→14px; `.s5-preview-pane` horizontal padding `--acuity-spacing-64`→`--acuity-spacing-120`.
- **IS-APPTEDIT-12:** removed the unconditional `align-items: center` from the base `#s5 .appt-card` rule (c3_c2 never had it — it only sets `align-items: flex-start` on the has-image/has-description variants, leaving the plain row at default `stretch`).
- **Bonus, not in the original 12:** the audit's "third, unrelated trash treatment on S5" (the appointment card's own remove button, `ICON_TRASH`) was also using an outdated stroke-based glyph — swapped to the canonical `.acuity-icon` + `icon-trash-bin.svg` pattern in **both** c3_c1 and c3_c2 (same fix as the availability trash icon, D-054/IS-AVAILEDIT-5).
**Rationale:** Direct user confirmation per-item, via one-by-one AskUserQuestion exchanges.
**Constraints:** None beyond what's noted per item above.
**Implementation discretion:** N/A — each change is a direct port of an already-identified c3_c2 value/pattern, confirmed by the user.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the 12 drift points listed above.
**Prototype ref:** c3_c1 (all items) + c3_c2 (IS-APPTEDIT-5's stale comment and the bonus trash-icon fix only).
**Open questions:** None.

### D-062 — Edit-sheet "Add an image"/"Add a description": interaction pattern confirmed correct; hide-on-add + consistent remove control added
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User correction, following a low-confidence Figma research finding · **Date:** 2026-09-17
**Decision:** A background research pass on Figma (for task item 23's "match the Figma design's actual interaction pattern" ask) came back suggesting the edit-sheet's chips might route through the same full-screen C02/C05 modal dialogs used by the separate "Create New Appointment" wizard — but flagged explicitly that Figma's MCP data exposes no real prototype click-through/connector wiring, so this was inferred from frame adjacency/naming only. The user explicitly rejected this: **"That is not the intended behavior at all. The inline text area reveal and os picker are correct."** The current direct-action interaction (tap "Add an image" → OS file picker via a hidden `<input type="file">`; tap "Add a description" → inline textarea reveal) is confirmed correct and unchanged. The create-flow's C02/C05 modals are NOT to be triggered by inline edit-sheet actions.
What the user DID ask to fix: the visual design of the sheet once content is added — (a) "the buttons should be hidden respectively after the component for either is created," and (b) "the close/remove component needs to be consistent" between image and description.
Implemented in c3_c1:
- `_renderSheetImage()`: `chip.disabled = !!image` → `chip.hidden = !!image` (the "Add an image" chip now fully hides once an image exists, instead of just greying out).
- Description: `#sheet-desc-trigger` now hides (`trigger.hidden = true`) once expanded, instead of relabeling itself to "Remove description" — removing the old double-duty toggle behavior. `toggleDescription()` simplified to an open-only action; a new `removeDescription()` function collapses the section and re-shows the trigger (preserving the pre-existing non-destructive behavior — the textarea's value is NOT cleared on collapse, only on Save, so re-opening restores it).
- Added a dedicated remove control to the description section's meta row (`#sheet-desc-remove`, a compact trash icon-button using the exact same trash glyph/path as `#sheet-asset-trash`), so removing an added image and removing an added description now use the same visual language. `.sheet-desc-meta-row` changed from `justify-content: flex-end` to `space-between` to fit it alongside the character counter.
- Removed the now-fully-dead `ICON_PLUS_SM`/`ICON_MINUS_SM` inline-SVG constants and their runtime `.innerHTML` rewrites — these were the actual reason IS-APPTEDIT-4's static-markup fix (D-061) was "dormant": `openEdit()`/`toggleDescription()` always overwrote the DS-icon markup with these hand-drawn SVGs at runtime. The trigger's label is now permanently the DS-icon "Add a description" markup, since it's hidden (not relabeled) when a description exists.
**Rationale:** Direct user correction on interaction pattern; direct user instruction on the hide/consistency fix.
**Constraints:** This fix was scoped to c3_c1 only (c3_c2 has the identical interaction/hide gap, per the earlier audit, but this specific redesign wasn't part of a confirmed port list — flagging as a candidate for a future c3_c2 pass, not done here).
**Implementation discretion:** Placement of the new remove button (in the meta row, left of the counter) and its 20px compact sizing were my call — not specified by the user beyond "consistent."
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the disabled-not-hidden image chip; the relabel-in-place "Remove description" toggle button.
**Prototype ref:** c3_c1 only.
**Open questions:** Should the same hide + consistent-remove-control treatment be ported to c3_c2's edit sheet, which has the identical gap? Not done this pass — flagging for a future pass.

### D-063 — Availability inline-edit audit (IS-AVAILEDIT-1–11 + misc): confirmed and implemented in c3_c1 and c3_c2
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User confirmation, one-by-one, of the IS-AVAILEDIT-1–11 audit + 3 misc findings · **Date:** 2026-09-17
**Decision:** User confirmed each finding individually.
- **IS-AVAILEDIT-1/2/3 (c3_c1 only, since c3_c2 was already correct):** `.avail-drawer-day-row` padding `--spacing-8 --spacing-12`→`--spacing-8 --spacing-8`, border-bottom 1px→0px; `.avail-time-pill` padding `10px 4px`→`12px 4px`, font-size 13px→12px; `.avail-range-actions` gap `--spacing-16`→`--spacing-8`, min-width 128px→108px.
- **IS-AVAILEDIT-4:** confirmed no action on c3_c1 (c3_c2's raw-hex destructive-popover regression is out of scope for this pass, not copied anywhere).
- **IS-AVAILEDIT-5 (trash icon):** c3_c1 already fixed in D-054; now also fixed in **c3_c2** (`_AVAIL_TRASH_SVG` → `.acuity-icon` + `icon-trash-bin.svg`) — see also D-061's "bonus" fix for the third (S5 appointment-card) trash treatment in both files.
- **IS-AVAILEDIT-6 (range cap):** kept c3_c1 at 10 — no change (user's explicit choice over matching c3_c2's 5).
- **IS-AVAILEDIT-7/8/9 (midnight edge case, chronological sort, overlap validation):** c3_c1's fixes (D-054: `_availEndMinutes`, `_availSortDayRanges`, field-level `_availValidateBlock`) ported into **c3_c2**, which previously had no validation function at all (confirming IS-AVAILEDIT-9's "c3_c2 removed this entirely" finding literally — there was no `_availValidateBlock`/`_availTimeToMinutes` in c3_c2 before this port). Added the `#avail-validation-error` element to c3_c2's `#avail-edit-sheet` markup and the matching `.avail-validation-error`/`.avail-time-pill--error` CSS.
- **IS-AVAILEDIT-10 (dead "different calendars" node):** cleaned up in **c3_c2** — removed the empty `<p class="avail-drawer-note"></p>`, its cascade-stagger CSS entry, and its standalone rule (c3_c1's non-empty version of this same copy was already fully removed in D-055).
- **IS-AVAILEDIT-11 (hover/focus states):** c3_c1 already had these (item 50); ported the same `.avail-range-icon-btn:hover`, `.avail-ellipsis-btn:hover`, `.avail-day-circle:hover`, `.avail-day-circle.is-active:hover` rules into **c3_c2**.
- **Misc fix 1 (`aria-pressed` regression):** restored on c3_c2's day-circle button, both in the initial render template and in `_availRefreshDayRow()`'s dynamic update.
- **Misc fix 2 (3 missing `_updateSelectedHoursLabel()` call sites):** added to c3_c2's `availAddRange()`, `availRemoveRange()`, and `availClearFirstRange()` — confirmed by diffing every call site between the two files; c3_c2 was missing exactly these three, matching the audit's count.
- **Misc fix 3 (discard-confirmation regression in `closeAvailCard()`):** restored in c3_c2, adapted to c3_c2's own (simpler, non-per-card-copy) `exit-confirm-backdrop`/`_exitConfirmProceedFn` dialog mechanism rather than porting c3_c1's `_setExitConfirmCopy()`-based API 1:1, since that dynamic-copy function doesn't exist in c3_c2. c3_c2's dialog shows generic "Are you sure you want to exit?" copy rather than a per-card-worded message — a known, disclosed limitation of reusing c3_c2's simpler dialog as-is.
**Rationale:** Direct user confirmation per-item, via one-by-one AskUserQuestion exchanges.
**Constraints:** See the discard-confirmation copy limitation above.
**Implementation discretion:** Where c3_c2's underlying mechanism differed from c3_c1's (the exit-confirm dialog API), adapted the port to c3_c2's actual function names/API rather than copy-pasting c3_c1's calls verbatim.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the 11 drift points + 3 misc findings listed above.
**Prototype ref:** c3_c1 (IS-AVAILEDIT-1/2/3, IS-AVAILEDIT-5's c3_c1 side already done in D-054) + c3_c2 (IS-AVAILEDIT-5, 7/8/9, 10, 11, and all 3 misc fixes).
**Open questions:** None.

### Phase 1 audits — RESOLVED (see D-061/D-062/D-063 above)

Both audits below have been fully confirmed by the user, item-by-item, and implemented — see D-061 (appointment inline-edit) and D-063 (availability inline-edit) above for the disposition of every numbered finding, and D-062 for the related add-image/add-description interaction-pattern correction. Kept here as the original raw findings for reference.

#### Appointment inline-edit side panel (c3_c1 vs. c3_c2) — IS-APPTEDIT-1 through 12
Full audit delivered 2026-09-17. Summary of findings (see session transcript for full file:line detail on each):
- **IS-APPTEDIT-1** — input border color doesn't switch for an already-added (vs. suggested) card; c3_c1 missing c3_c2's `.appt-card--selected-item .field-input-group` override.
- **IS-APPTEDIT-2** — "Add an image" chip is a hand-drawn inline SVG in c3_c1 vs. the DS `.acuity-icon`/`icon-plus-glyph.svg` pattern in c3_c2 (persistent difference, not just a pre-JS snapshot).
- **IS-APPTEDIT-3** — "Replace" button and filename type-size drift (14px/16px in c3_c1 vs. 12px/14px in c3_c2).
- **IS-APPTEDIT-4** — same inline-SVG-vs-DS-icon drift on the description chip, but effectively dormant (JS always overwrites this markup at runtime in both files).
- **IS-APPTEDIT-5** — desktop panel column is 480px in c3_c1 vs. 420px in c3_c2 (c3_c2's own code comment is stale and still says 480px).
- **IS-APPTEDIT-6** — cap confirmed correct as an intentional exception: c3_c1 = 5, c3_c2 = 3 (matches D-014). No fix needed, log only.
- **IS-APPTEDIT-7** — c3_c2 has a full "Private appointment" toggle row c3_c1 lacks entirely (functional/structural, not just visual).
- **IS-APPTEDIT-8** — reversed-direction finding: c3_c1's discard-confirmation + live-preview-draft system for the edit sheet has **no equivalent in c3_c2 at all**. Flagged explicitly: do not port c3_c2's simpler (regressed) behavior into c3_c1.
- **IS-APPTEDIT-9** — downstream of IS-APPTEDIT-8: c3_c2's image upload/delete commits immediately (bypassing its own Save/Cancel), an internal c3_c2 bug, not something to copy into c3_c1.
- **IS-APPTEDIT-10** — CSS-specificity bug: c3_c1 is missing c3_c2's `#s5`-scoped re-declaration of the editing-state border-color, so it never actually applies on desktop.
- **IS-APPTEDIT-11** — general S5 desktop spacing/typography bundle (wizard-body gap, wizard-header margin, wizard-subheading size, preview-pane padding) all drift from c3_c2.
- **IS-APPTEDIT-12** — minor `align-items` drift on the plain (no image/description) collapsed card row.
- Also noted, not part of the numbered list: a stale c3_c2 code comment (still says "480px"); c3_c2 has regressed to raw hex on danger-state CSS where c3_c1 correctly uses tokens (don't copy into c3_c1 — flag for c3_c2 instead); c3_c2 dropped `role="alert"` on its char-limit error (accessibility regression, don't copy); D-016 (title-required gating on the edit sheet) remains unimplemented in both files.

#### Availability inline-edit component (c3_c1 vs. c3_c2) — IS-AVAILEDIT-1 through 11
Full audit delivered 2026-09-17. Summary of findings:
- **IS-AVAILEDIT-1/2/3** — day-row divider/padding, time-pill sizing/typography, and range-actions cluster spacing all drift between the two files (pure CSS).
- **IS-AVAILEDIT-4** — token regression in c3_c2: destructive popover item uses raw hex where c3_c1 correctly uses `var(--acuity-fg-danger)`. Don't copy into c3_c1.
- **IS-AVAILEDIT-5** — the reported "trash icon looks off" is not c1-vs-c2 drift at all — the same outdated pre-Rosetta glyph is byte-identical in both files, and a *third*, unrelated trash treatment exists on S5. Needs a from-scratch icon-system fix in both files, not a port.
- **IS-AVAILEDIT-6** — range-per-day cap drift: c3_c1 = 10, c3_c2 = 5, no existing decision justifying either number (open question, not yet resolved by this entry).
- **IS-AVAILEDIT-7** — end/start time comparison mishandles midnight in both files (naive minutes-since-midnight comparison, no day-boundary handling) — net-new fix needed in both, not present anywhere yet.
- **IS-AVAILEDIT-8** — chronological re-sorting of ranges (both in the collapsed summary and on panel reopen) doesn't exist in either file — net-new logic needed in both.
- **IS-AVAILEDIT-9** — regression, not upgrade: c3_c2 removed end-before-start/overlap validation entirely (confirmed via `flow-specs.md`'s own line 654, which already logged this as unresolved, not solved). Neither file highlights the specific offending inputs — that part is net-new in both.
- **IS-AVAILEDIT-10** — c3_c2 silently emptied the "different calendars/exceptions" copy paragraph but left the (now pointless) element + its fade-in transition in the DOM — a dead node, not a clean removal.
- **IS-AVAILEDIT-11** — no hover/focus-visible state on any avail icon button in either file (shared gap).
- Also noted: `aria-pressed` on the day-circle toggle was removed in c3_c2 (accessibility regression, don't copy); c3_c2 is missing 3 of c3_c1's `_updateSelectedHoursLabel()` live-preview-refresh call sites (functional regression); c3_c2's `closeAvailCard()` lost its discard-confirmation entirely (same pattern as IS-APPTEDIT-8, repo-wide simplification in c3_c2, not c3_c1-specific).

### D-064 — S1 rebuilt as a choreographed welcome/transitional screen (not a generic loading screen)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item, detailed spec provided · **Date:** 2026-09-18
**Decision:** S1 keeps the same loader visual used elsewhere (the `dotlottie-player`/`.dots` fallback pattern shared with S4/`s_loading_home`) but is no longer a bare "Setting up your workspace" label — it now runs a fully choreographed, non-interactive sequence before auto-advancing to S2:
1. On load, the loader is visible and looping; `.s1-welcome-headline` ("Welcome to Acuity") and `.s1-welcome-subline` ("Let's set up your scheduling page") start at `opacity:0`.
2. Headline fades in: 250ms ease-out, starting at 100ms (`#s1.active .s1-welcome-headline`).
3. Supporting line fades in: 200ms ease-out, starting at 400ms (finishes at 600ms).
4. Hold: both lines stay static, loader keeps looping, for ~2.7s (600ms → 3300ms).
5. `S1_SPLASH_MS` is now `3300` (was a flat `3000`) — the auto-advance timer fires exactly when the hold ends.
6. **S1 → S2 transition:** a new `isS1ToS2` branch in `showScreen()` gives this specific transition its own pure-opacity fade-out (`.screen-exit--s1-s2`, `screenFadeOut` keyframe, 420ms, no translate — distinct from the generic slide used elsewhere) and, like S2 → S5, no whole-container enter animation for S2 (avoids double-fading against the per-group stagger in step 7).
7. **S2 entrance stagger:** new `.s2-group-enter` class (mirrors `.s5-group-enter`'s pattern) staggers 5 independently-tunable groups via `--s2-enter-delay-{a..e}`: top controls (`.desktop-top-nav`, 0ms), prompt (`.wizard-header`, 80ms), input (`.s2-search-input-wrap`, 160ms), expanded suggestions (`.s2-search-dropdown`, 220ms), bottom-right nav button (`.bottom-nav`, 260ms) — each a 16px settle-up + fade, 380ms, shared easing `--s2-enter-ease`.
8. **Suggestions-open-by-default fix:** `_initS3OtherDescribe()` now adds `.s2-search-active` (and `aria-expanded="true"`) unconditionally on every S2 (re)init, instead of only reactively on input `focus`. This corrects a regression introduced by D-037: D-037's own rationale explicitly notes the dropdown was "always visible once rendered" *before* that fix, and D-037 inadvertently changed the default to closed-until-focused while fixing the (legitimate) missing collapse mechanism. This task's spec explicitly requires "the onboarding form (S2) is fully visible with the suggestions panel already open" as the S1→S2 arrival state, which re-surfaced the regression. D-037's actual fix (click-outside/Escape collapse) is preserved — only the default-open state changed back.
**Rationale:** Direct, detailed spec provided by the user (verbatim animation-by-animation breakdown); headline copy resolved via a quick clarifying question (chose "Welcome to Acuity" over "Welcome" or reusing the old loading-label text).
**Constraints:** None.
**Implementation discretion:** Exact millisecond values within the spec's given ranges (headline 250ms of a 200-300ms range; subline 200ms of a 150-250ms range; crossfade 420ms of a 400-450ms range) and the S2 group stagger's specific delay values/16px settle distance were my call, not individually specified — all exposed as tunable CSS custom properties for easy retiming.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** the flat 3000ms unstyled splash (this session's earlier D-035 implementation); D-037's incidental default-closed regression on the S2 suggestions dropdown.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-065 — S1 welcome copy "pushes" the loader up as it opens, instead of fading in place
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User correction to D-064 · **Date:** 2026-09-18
**Decision:** D-064's headline/subline originally reserved their layout space from the start (just `opacity:0`), so the loader never visually moved as they appeared. Per correction: "s1-welcome-headline fades in while it 'pushes' the icon slightly up, and s1-welcome-subline does the same to icon + headline. essentially, the loading wrap hugs its content and it's always centralized." Reworked so each line lives in its own `.s1-welcome-row` — a single-track CSS Grid sized `grid-template-rows: 0fr` by default (zero height, `overflow:hidden`) that animates to `1fr` (its natural content height) in the same keyframe window as the existing opacity fade (`s1RowGrow`, sharing the headline's 250ms/100ms-delay and the subline's 200ms/400ms-delay timing from D-064 exactly). Because `.loading-wrap` already centers its children via `justify-content:center`, growing the copy block's real height from 0 → headline → headline+subline causes the whole (loader + copy) stack to recenter on every frame — which is what reads as the loader (then loader+headline) being pushed upward, with no JS or explicit height values needed.
**Rationale:** Direct user correction — the original fade-in-place didn't match the described motion.
**Constraints:** None.
**Implementation discretion:** Used the CSS Grid `0fr → 1fr` track-size animation technique (each text element also gets `min-height:0` so it can collapse to zero at `0fr`) rather than measuring/hardcoding pixel heights — keeps it accurate to actual rendered content size without JS.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-064's fade-in-place text reveal (same timing values, different mechanism).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-066 — S1's loader plays at 0.5× speed
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item · **Date:** 2026-09-18
**Decision:** Added `speed="0.5"` to S1's `<dotlottie-player>` instance only. S4 and `s_loading_home` reuse the identical base64 lottie source but were left untouched at default (1×) speed — this is scoped to S1's specific element, not a global change to the shared loader asset.
**Rationale:** Direct task instruction.
**Constraints:** None.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-067 — S1's loader starts 500ms late
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item · **Date:** 2026-09-18
**Decision:** Removed `autoplay` from S1's `<dotlottie-player id="s1-lottie-loader">` and added a `setTimeout(() => el.play(), 500)` call instead. Before the 500ms mark, the player shows its first frame at rest (not animating); at 500ms it starts playing (still at the 0.5× speed from D-066) and loops as before. S4 and `s_loading_home`'s players are untouched (still `autoplay`).
**Rationale:** Direct task instruction. While making this change, found and fixed an unrelated pre-existing typo: `S1_SPLASH_MS` was `33300` (an extra digit) instead of the intended `3300` documented in D-064's own comment/math — fixed to `3300`.
**Constraints:** None.
**Implementation discretion:** N/A.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A. (Also fixes the `S1_SPLASH_MS` typo noted above, which was not itself a requested change.)
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-068 — S2 → S5 transition rebuilt: fade → expand+blur ghost panel → fade-in together
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item, detailed spec provided · **Date:** 2026-09-18
**Decision:** The user's "S2 → S3" spec (confirmed to mean this codebase's S2 → S5, since there's no separate S3 screen and the destination — "Pick your first appointments," preview + right-side form — matches S5) replaces D-040/D-041's simpler fade+translate/40px-stagger transition with a richer, more literal implementation of the described motion hierarchy:
1. **New UI on S2:** a `.s2-preview-pane` (desktop only) added to S2's left side — a "ghost" placeholder preview, not populated with real business data (none is known yet), reusing S5's exact `.s5-browser-frame`/`.s5-browser-bar`/`.s5-preview-iframe` classes verbatim (same generic `scheduling-page.html?view=select` src S5 itself shows before any selection) so it's visually identical to what it's foreshadowing. S2's markup restructured: `.wizard-body` and the new pane are now siblings inside a new `.s2-main-row` flex row; `#s2.screen.active` gained `height:100dvh;overflow:hidden` to support it. Hidden by default (`.s2-preview-pane { display:none }` at base scope, like `.s5-preview-pane`) so mobile is unaffected.
2. **Step 1 (central content fades out, ~180ms ease-out):** `#s2.screen-exit--s2-s5 .s2-lookup-grid` (the heading + search — "current step content") fades to 0 opacity. `.screen-exit--s2-s5` itself no longer carries any animation (previously a whole-container `screenExitDown` fade+translateY) — only specific children animate now, so anything NOT explicitly targeted (bottom-nav, in particular) simply stays static/opaque/in-place for the whole sequence, which is what makes it read as a "persistent shell."
3. **Steps 2–3 (ghost panel expands + blurs, 320ms ease-out, 80ms delay):** `#s2.screen-exit--s2-s5 .s2-preview-pane` animates `width: 40% → 78%` and `filter: blur(0) → blur(24px)` together. Because `.wizard-body` is `flex:1` in the same row, it narrows automatically as the pane grows — no separate animation needed for the "right side reserving space for the next-step form" behavior.
4. **Step 4 (S5 content fades in "together," ~180ms, overlapping the tail of the expansion):** S5's existing per-group entrance system (`.s5-group-enter`, D-041) was retuned rather than rebuilt: duration cut from 420ms to 180ms; delays compressed and shifted later (preview-controls 300ms, browser-frame 310ms, wizard-body's 3 children starting at 320ms with a 20ms step — down from 0/60/120+40-step/240ms) so everything appears close together, late in the sequence, instead of spread across the old ~660ms window. **`.bottom-nav` was removed from the animated group entirely** — per the "persistent shell" requirement, S5's bottom-nav should already be fully opaque/settled the instant #s2 is torn down, not still fading in. The shared `s5GroupEnter` keyframe's translateY also shrunk from 40px to 12px, matching "no obvious slide-in... primarily through opacity and maybe a slight slide."
5. **Total duration / cleanup timing:** `showScreen()`'s `exitMs` for the S2→S5 case raised from 320ms to 560ms (covers the full sequence — last S5 element finishes around 540ms — before `#s2` is finally torn down/hidden). Spec's own framing ("begins around 1.2s, settled by ~1.7s, so roughly 500ms total") is a relative/illustrative timeline, not literal since-page-load timestamps in this prototype; the ~500–560ms *duration* is what was matched.
6. **S1→S2 arrival stagger updated too:** since S2 now has a new persistent `.s2-preview-pane`, it was added as a 6th group to the existing D-064 entrance stagger (100ms delay, same 380ms/16px motion as the other groups) — otherwise it would pop in statically while everything around it staggers in, which would read as an oversight once visible.
**Rationale:** Direct, detailed spec provided by the user, confirmed via one clarifying question to map "S2/S3" onto this codebase's actual S2/S5 screen IDs.
**Constraints:** The ghost panel and S5's real preview pane are two separate DOM elements/screens (not a shared/moved singleton) — continuity is achieved via the exit-panel's z-index overlay (already-established `.screen-exit` pattern) plus matching visual language (identical browser-frame classes), not a literal shared element or pixel-perfect position handoff. Acceptable for a prototype; a production build might instead persist one true element across the transition.
**Implementation discretion:** Exact width/blur end-values (78% width, 24px blur), the compressed S5 stagger's specific delay numbers, and the new S2-arrival group's 100ms delay slot were my calls within the spec's descriptive (not numeric) guidance for those specifics.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-040 (S2→S5 vertical fade transition) and D-041 (S5 4-group staggered entrance) — both fully superseded by this entry's mechanism, though the underlying `.s5-group-enter` infrastructure itself (CSS custom properties, per-group selectors) was retuned in place rather than replaced wholesale.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-069 — S2's ghost preview pane: hidden at rest, clean edge, expands only to S5's exact width
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User correction to D-068 · **Date:** 2026-09-18
**Decision:** Three corrections to D-068's `.s2-preview-pane`:
1. **Hidden at rest.** The pane exists only to support the S2 → S5 transition — S2 itself never shows it. Resting CSS changed from `width: 40%` (visible, taking up real layout space) to `width: 0; padding: 0;` (fully collapsed, `.wizard-body` fills the whole row via its existing `flex:1`). Removed from the D-064 S1 → S2 arrival stagger entirely, since a permanently-zero-width element has nothing to "enter" — animating its opacity while it stays at zero width was a no-op.
2. **Clean, unblurred dividing line.** The blur was moved off `.s2-preview-pane` itself and onto its inner `.s5-browser-frame` only (`s2PreviewBlur`, its own keyframe, same 320ms/80ms timing as the width expand). The pane's own solid gray background — not a filter on the pane — is what forms the edge against `.wizard-body`, so that boundary stays crisp; only the frame inside it blurs. (The pane's `overflow:hidden` also has the side benefit of clipping the frame's blur bleed exactly at the pane's edge, reinforcing the clean line.)
3. **Expands only to S5's actual width, not an arbitrary 78%.** `s2PreviewExpand`'s end state changed from `width: 78%` to `width: calc(100% - 420px)` — exactly matching S5's fixed 420px right-panel width (`#s5.screen.active { grid-template-columns: 1fr 420px; }`), so the ghost pane's edge lands flush against where S5's real preview pane's edge already is, instead of an approximated value that could over/undershoot on different viewport widths. Padding (`0 → var(--acuity-spacing-48)`) now animates in the same keyframe as width, so the padding area doesn't render at a nonzero size while width is still 0.
4. **Confirmed (already satisfied by D-068, re-verified against a follow-up note):** "the contents inside the right panel will animate in a staggered fade + slide in" — this is `.s5-wizard-body > *`'s existing 3-child stagger (wizard-header / s5-list-top / s5-carousel, `s5GroupEnter` keyframe: opacity + translateY(12px), 20ms step) from D-068. No additional change made here; noted as explicitly re-confirmed rather than newly built.
**Rationale:** Direct user correction, delivered twice (the first application of this decision was undone locally — via editor undo, not a deliberate request to revert — and had to be reapplied verbatim, per the user's "redo" follow-up).
**Constraints:** None.
**Implementation discretion:** N/A — direct fixes.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-068's visible-at-rest (40% width) pane, its pane-level blur, its 78% expand target, and its addition of `.s2-preview-pane` to the D-064 S1→S2 stagger.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-070 — Fixed: S5's fade-in was playing invisibly behind S2's opaque curtain
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report · **Date:** 2026-09-19
**Decision:** Root cause: `#s2` (and every `.screen`) has an unconditional solid `background` from the base `.screen` rule, independent of its children's opacity — so for as long as `.screen-exit--s2-s5` keeps `#s2` rendered (`display:flex!important`, `z-index:1`, sitting on top of `#s5`), `#s2` is a fully opaque curtain over the whole viewport, regardless of what's fading in/out inside it. D-068's `.s5-group-enter` delays (300/310/320ms) all finished (last one at 320+40+180=540ms) *before* the old `exitMs` of 560ms tore `#s2` down — meaning S5's entire fade+slide-in played out completely hidden behind that curtain, and the user only ever saw S5's final, fully-settled state pop in instantly the moment `#s2` disappeared. Reported symptom: "it just looks like the transition happens and it abruptly ends in the instant appear of s5 final landing state."
Fix: retimed so the visible motion happens *after* the reveal, not before it.
- `showScreen()`'s `exitMs` for `isS2ToS5` lowered from 560ms to **440ms** — tight enough that `#s2` is torn down shortly after its own ghost-pane expand+blur finishes (at 400ms, from D-068/D-069), with a small comfortable buffer.
- `#s5`'s `--s5-enter-delay-{a,b,d}` shifted later, from 300/310/320ms to **400/410/420ms**, and `--s5-enter-delay-d-step` widened from 20ms to **40ms** (more clearly readable per-item stagger: wizard-body's 3 sections now land at 420/460/500ms). Groups A/B start only 30-40ms before the 440ms reveal (negligible, reads as "together" per the original spec rather than hidden); wizard-body's first item starts exactly at the reveal, and the rest visibly stagger in afterward, fully on top of nothing (since `#s2` is already gone) — this is the specific fix for "I need it to feel like things are animating in while the page transitions."
**Rationale:** Direct user bug report describing the exact symptom of animations completing behind an opaque layer.
**Constraints:** None.
**Implementation discretion:** The exact new numbers (440ms reveal, 400/410/420ms starts, 40ms step) were chosen to leave the smallest safe buffer past the ghost-pane's own 400ms finish while still giving each S5 group room to visibly animate after the reveal — not independently specified by the user beyond the qualitative complaint.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-068's `--s5-enter-delay-{a,b,d}`/`-d-step` values and `exitMs: 560`.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-071 — S5's real browser-frame starts fading in earlier, overlapping S2's ghost expand+blur
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item · **Date:** 2026-09-19
**Decision:** Asked to make S5's real `.s5-browser-frame` fade in while S2's ghost pane is still expanding+blurring "behind" it, rather than waiting until after the D-070 reveal like the rest of S5's content. Considered and presented two approaches:
- **True see-through** (backdrop-filter on the ghost's content area, revealing a blurred glimpse of S5's real content compositing underneath) — rejected. It would require every layer between the ghost's content div and `#s5` (the ghost pane's own background, `.s5-browser-frame`'s own background, and `#s2`'s own section-level background — the same unconditional-opaque rule D-070 identified as the root cause of the *previous* bug) to become non-opaque. Since `#s2`'s section background is one shared rule, making it non-opaque risks exposing `#s5`'s real content unpredictably through *other* parts of S2 too (e.g. bleeding through behind the still-fading `.s2-lookup-grid`), not just the intended ghost-pane region.
- **Retime only (chosen):** Group B (`.s5-browser-frame`) split out of the shared A/D animation-duration block into its own rule with an independent `--s5-enter-delay-b: 100ms` (down from D-070's 410ms) and a new `--s5-enter-duration-b: 400ms` (vs. the shared 180ms). It now starts right as the ghost's own expand+blur begins (80ms delay) and runs long enough that it's ~85% faded in by the time `#s2` is torn down at 440ms (unchanged from D-070) — so only its last ~15% plays out visibly right at/after the reveal, reading as a continuous "already animating in" arrival rather than a hard pop, without any cross-screen transparency risk. Groups A (preview-controls) and D (wizard-body) are unchanged from D-070 — still start at/after 400/420ms.
**Rationale:** User chose the safer option after being shown the tradeoff (asked via AskUserQuestion).
**Constraints:** None.
**Implementation discretion:** The specific 100ms/400ms values for Group B were chosen to land it at ~85% opacity by the 440ms reveal — not independently specified beyond "starts earlier, overlaps the blur."
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-070's `--s5-enter-delay-b: 410ms` (Group B previously shared the same post-reveal timing as Groups A/D).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-072 — Ghost preview pane: fixed height mismatch against S5's real pane; smoother easing
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report · **Date:** 2026-09-19
**Decision:** Two fixes:
1. **Height mismatch ("looks broken").** Root cause: the ghost's `.s5-browser-frame` had a D-068-era override (`max-width:480px; max-height:420px; min-height:0`) capping it far smaller than S5's real `.s5-browser-frame` (`max-width:1024px; min-height:480px; height:100%`, no max-height at all) — and separately, the ghost pane's own padding (`var(--acuity-spacing-48)` flat) didn't match S5's real `.s5-preview-pane` padding (`120px 120px 48px`), so even the *available* height to fill differed. Fixed both: removed the ghost's size-override rule entirely (it now inherits the exact same base `.s5-browser-frame` sizing S5 uses, guaranteeing pixel-identical height/width), and changed `s2PreviewExpand`'s padding target to match `.s5-preview-pane`'s real padding exactly instead of a flat value.
2. **Smoother animation.** Switched `s2PreviewExpand`/`s2PreviewBlur` from a generic `ease-out` to the same `cubic-bezier(.2,.8,.2,1)` curve used everywhere else in this transition sequence (S5's own `--s5-enter-ease`), and lengthened duration slightly (320ms → 380ms, delay 80ms → 60ms, so it still finishes exactly at `exitMs`/440ms). Added `will-change: width, padding` / `will-change: filter` hints on the two animated rules, since `width`/`padding` are layout-triggering (not compositor-only) properties and this gives the browser a heads-up to optimize for the resize.
**Rationale:** Direct user bug report (height mismatch, "a lot smoother" animation feel).
**Constraints:** None.
**Implementation discretion:** The specific new duration/delay numbers (380ms/60ms) were chosen to preserve the existing 440ms finish time from D-070/D-071 while extending the perceived motion — not independently specified beyond "a lot smoother."
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-068's ghost-frame size override and flat padding target; D-068's `ease-out`/320ms/80ms timing on `s2PreviewExpand`/`s2PreviewBlur`.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-073 — Fixed: S2's ghost pane sat under a "white bar" because its top-nav consumed flow space S5's doesn't; slowed the whole S2→S5 sequence to ~0.75×
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report + explicit pacing request · **Date:** 2026-09-19
**Decision:**
1. **Root cause of the "white bar"/short-pane look (this was NOT the browser-frame's own size — D-072 misdiagnosed it):** `#s5`/`#s9`'s `.desktop-top-nav` is `position:absolute; inset:0 0 auto 0;` — an overlay that floats over full-height content without consuming layout space, so S5's real `.s5-preview-pane` starts at y=0. `#s2`'s `.desktop-top-nav` had never gotten this treatment — it was a normal flex child consuming its own 80px of vertical flow, pushing `.s2-main-row` (and the ghost pane inside it) down by 80px. The ghost pane's rectangle therefore started 80px lower than where S5's real preview pane already sits, reading as a shorter pane with a blank strip above it. Fixed by giving `#s2 .desktop-top-nav` the identical absolute-overlay treatment (`position:absolute; inset:0 0 auto 0; z-index:var(--acuity-z-sticky); background:transparent; pointer-events:none` + `> * {pointer-events:auto}`), adding `position:relative` to `#s2.screen.active` so the overlay anchors to the right box, and raising `#s2 .wizard-body`'s top padding from 40px to 80px (matching `#s5 .wizard-body`'s own top padding exactly) so the heading text isn't now hidden under the floating nav.
2. **Slowed to ~0.75× speed, per explicit request** ("I'd make it about .75 of the current speed too"), scaling every duration/delay in the S2→S5 sequence by 4/3: `s2CentralFadeOut` 180→240ms; `s2PreviewExpand`/`s2PreviewBlur` 380ms/60ms delay → 510ms/80ms delay (finishes 590ms); `showScreen()`'s `exitMs` for `isS2ToS5` 440→590ms (kept aligned with the expand's new finish time); `#s5`'s shared `--s5-enter-duration` 350→470ms, `--s5-enter-delay-a` 400→530ms, `--s5-enter-delay-b` 100→130ms, `--s5-enter-duration-b` 400→530ms, `--s5-enter-delay-d` 420→560ms, `--s5-enter-delay-d-step` 40→50ms. All relative proportions/overlaps from D-070/D-071/D-072 preserved — this is a uniform slowdown, not a re-design.
**Rationale:** Direct user bug report (correcting D-072's misdiagnosis — the actual issue was the pane's vertical offset, not the browser-frame's cap) plus an explicit, separately-stated pacing request. Also noted: the user couldn't inspect the transition to describe it more precisely because it was too fast at the previous speed — the slowdown itself should make future debugging easier too.
**Constraints:** None.
**Implementation discretion:** Rounded the ×4/3-scaled numbers to the nearest 10ms for readability; exact rounding wasn't specified.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-072's diagnosis of the height issue (was actually the top-nav flow-space bug, not the browser-frame cap — D-072's browser-frame-cap fix was still correct/worth keeping, just wasn't the (whole) cause of what was reported here) and all of D-070/D-071/D-072's specific millisecond values (now uniformly scaled, see list above).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-074 — S2 → S5 transition rebuilt to an exact keyframe-percentage spec
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item, detailed 0-100% keyframe table provided · **Date:** 2026-09-21
**Decision:** Replaced D-068 through D-073's choreography with a new one built directly from a 0%/8-10%/14-15%/20%/25-30%/35%/40-45%/50%/55%/60-65%/70-75%/80-85%/90-95%/100% keyframe table. Total sequence = **1200ms** (chosen as "100%"; not itself specified, see discretion below). Concrete mapping:
1. **0-15% (~175ms):** `.s2-lookup-grid` (old content) fades out, front-loaded (`ease-out`) — unchanged mechanism from D-068, retimed.
2. **~13-42% (150ms delay, 350ms duration):** `.s2-preview-pane` (the ghost) expands to exactly `calc(100% - 420px)`. **Simplified to a plain gray box** — removed its inner `.s5-browser-frame`/`.s5-browser-bar`/`.s5-browser-content`/iframe entirely, and with it the whole D-069/D-072 blur mechanic (`s2PreviewBlur`, `filter`) — the spec is explicit that during expansion there's "no new content yet, just the gray background." Padding still animates to match `.s5-preview-pane`'s real padding (kept from D-072, still relevant for a clean flush edge).
3. **~42-75% (500ms delay, 370ms duration, `--s5-enter-delay-d-step: 30ms` per child):** S5's real wizard-body content (heading/input/cards — "the right-side form") fades in, opacity-led, minimal slide (kept the existing 12px `s5GroupEnter`). `exitMs` for `isS2ToS5` lowered from 590ms to **500ms** — timed to land exactly when the ghost pane finishes expanding AND when this group starts, so nothing animates behind the still-opaque `#s2` curtain (D-070's lesson still applies and still holds).
4. **~60-100% (720ms delay, 480ms duration):** S5's `.s5-preview-controls` AND real `.s5-browser-frame` ("a website-preview card") fade in **together**, much later than the form — this is a reversal of D-071's "start early, overlap the ghost's blur" design, which is now moot since there's no more blur/frame-glimpse mechanic to overlap with. The browser-frame specifically gets a **new, distinctly bigger motion** — a dedicated `s5PreviewCardEnter` keyframe sliding in from `translateY(-40px)` (called out in the spec as visually different from every other group's subtler 12px settle).
5. **`.s5-group-enter` class cleanup timeout** raised from 900ms to **1300ms** (Groups A/B now finish at 720+480=1200ms; the old 900ms would have cut their animation short mid-flight).
**Rationale:** Direct, detailed spec provided by the user (a full percentage-keyframe table), translated into concrete millisecond values and CSS.
**Constraints:** None.
**Implementation discretion:**
- **Total duration (1200ms)** was not specified as an absolute value — inferred as a round number consistent with the ~1130ms pace already established by D-073's 0.75× slowdown, and chosen so round percentages map to round-ish millisecond values.
- **Grouping "preview controls" with the "website preview card":** the spec's ~60-100% description explicitly names only "a website-preview card" (the browser-frame); it doesn't separately address the small controls toolbar that sits above it in the same preview-pane area. Timed them together (same delay/duration, both using the standard 12px `s5GroupEnter` motion — only the browser-frame itself gets the bigger -40px slide) since they occupy the same region and the spec doesn't distinguish them.
- **Intermediate opacity curve shapes are approximate.** The spec's specific intermediate checkpoints (e.g. "~15-25% opacity at 50%," "~65-85% at 60-65%") were used to choose overall delay/duration windows and confirm the clearer milestones (start time, "distinguishable," "fully readable"), but exact percentage-by-percentage opacity values weren't individually curve-fitted — everything uses the app's existing standard `cubic-bezier(.2,.8,.2,1)` easing (or `ease-out` for the initial fade-out) rather than bespoke per-checkpoint curves. Flagging this since it's the part most likely to need a follow-up nudge once actually seen running (now much easier to inspect at this slower speed).
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-068 (original choreography), D-069/D-072 (ghost pane's blurred-frame design — now a plain box, blur mechanic removed entirely), D-070/D-071/D-073's specific millisecond values (all retimed to the new 1200ms total) — though D-070's underlying *lesson* (don't animate things invisibly behind #s2's opaque curtain) remains the governing constraint for `exitMs`'s placement.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-075 — S2 → S5 transition slowed a further ~0.8× (uniform ×1.25 scale)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item · **Date:** 2026-09-21
**Decision:** Scaled every duration/delay in D-074's transition by ×1.25 (i.e. plays at 0.8× the previous speed), preserving all relative proportions/overlaps exactly:
- `s2CentralFadeOut`: 175ms → **220ms**.
- `s2PreviewExpand`: 350ms duration/150ms delay → **435ms/190ms** (finishes at 625ms).
- `showScreen()`'s `exitMs` for `isS2ToS5`: 500 → **625ms** (kept exactly aligned with the ghost pane's new expand-finish time and Group D's new start time, same invariant as D-074).
- `#s5`'s `--s5-enter-delay-d`: 500 → **625ms**; `--s5-enter-duration-d`: 370 → **465ms**; `--s5-enter-delay-d-step`: 30 → **40ms**.
- `#s5`'s `--s5-enter-delay-ab`: 720 → **900ms**; `--s5-enter-duration-ab`: 480 → **600ms** (finishes at 1500ms — the new total sequence length).
- `.s5-group-enter` cleanup `setTimeout`: 1300 → **1600ms** (buffer past the new 1500ms finish).
**Rationale:** Direct task instruction.
**Constraints:** None.
**Implementation discretion:** Rounded each ×1.25-scaled value to the nearest 5ms for clean numbers; exact rounding wasn't specified.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** All of D-074's specific millisecond values (proportions/overlaps unchanged, only the overall pace).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-076 — Fixed: Styles side panel closed itself on mode selection; added hover states to palette/mode/font options
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report + task item · **Date:** 2026-09-21
**Decision:**
1. **Bug fix.** The document-level click-outside handler that closes the Styles side panel (`document.addEventListener('click', e => { if (!e.target.closest('.style-widget') && !e.target.closest('.style-side-panel')) _closeAllStyleWidgets(); })`) was misfiring on every mode-card click. Root cause: `selectColorMode()` → `_syncStyleWidgets()` rebuilds `.style-mode-grid`'s `innerHTML` synchronously (so the mode-preview swatches reflect the just-picked mode/palette) — which detaches the just-clicked `<button class="style-mode-card">` from the document *before* the click event finishes bubbling up to `document`. A detached element's `.closest()` always returns `null` for every selector, including ones it was visually still inside of a moment earlier, so the handler read every mode pick as a click "outside" the panel and closed it. Fixed by adding an early-return guard — `if (!document.contains(e.target)) return;` — before the outside-click check: a detached target was never a meaningful "clicked outside" signal in the first place.
2. **Hover states added**, all "light" per the ask, none conflicting with each element's existing `--selected` styling:
   - `.style-mode-card:hover { background: var(--acuity-bg-inset); }` — safe to combine with `--selected` (different property, border vs. background).
   - `.style-palette-card:hover:not(.style-palette-card--selected) { border-color: var(--acuity-border-default); }` — explicitly excluded from the selected state, since both rules would otherwise target the same property (`border-color`) and hover (higher specificity via the pseudo-class) would visually overwrite the selected indicator while hovering.
   - `.style-font-row:hover { background: var(--acuity-bg-inset); }` — same property as `--selected`'s background, so hovering a selected row does visually swap to the hover shade for as long as the pointer is there; left as-is since this is a common, acceptable pattern (still clearly interactive) and the ask didn't call out this specific edge case.
**Rationale:** Direct user bug report (root-caused via code trace, not guessed) and direct task instruction for the hover states.
**Constraints:** None.
**Implementation discretion:** Chose `var(--acuity-bg-inset)` for the two background-based hovers (matches the existing "light hover" convention used elsewhere in this file, e.g. `.avail-ellipsis-btn:hover`) and a border-color change for the palette card specifically (its resting background is already gray, so a background-based hover wouldn't read clearly against it).
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-077 — Create-appointment dialog shell rebuilt to Figma's 560×560 frame (chrome shared by C01–C05)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Screen · **Triggered by:** Design · **Date:** 2026-09-21
**Decision:** Full visual rebuild of everything the five create steps share, against current Figma (`✼ UXT — Onboarding`, nodes `7689:193383` / `193503` / `193631` / `193797` / `193292`):
1. **Size.** The dialog is a fixed **560 × 560** square in all five frames, not a viewport-proportional modal. The desktop `@media (min-width:1024px)` `.create-sheet` rule now sets `max-width:560px; height:560px; max-height:560px; min-height:0` — replacing `max-width:720px; max-height:90vh; min-height:80vh`. `min-height` is released (rather than also pinned to 560) so a short viewport shrinks the dialog instead of overflowing the overlay's padding. The **base (non-media-query) `.create-sheet` rule was checked and left as-is** on its sizing — it only sets the mobile full-height sheet (`height: calc(100dvh - 32px)`) and never set max-width/max-height, so it needed no change; it did gain the white background below.
2. **Surface.** White end-to-end (`--acuity-bg-base`) — header, body and bottom nav are all Gray/base in Figma, where the prototype inherited `.modal-sheet`'s `--acuity-bg-inset`. Radius `--acuity-border-radius-xl` (16px), shadow `--acuity-shadow-light-500` (an exact match for Figma's Light/Shadow 500).
3. **Header.** There is **no "Create a new appointment" eyebrow** on any of the five frames — Figma's Header has an empty text slot and a single right-aligned 22px close Icon Button. The title node is kept in the DOM but visually hidden (clip-path) so the dialog's `aria-labelledby` still resolves; the 28px layout spacer is deleted and the nav is `justify-content: flex-end`. Close icon resized 16px → 22px.
4. **Body.** Figma's "Wizard slots": `gap: 24px`, `padding: 0 24px 20px` (no top padding — the header band supplies it). Each step's own ad-hoc padding was removed in favour of this.
5. **Bottom nav.** Buttons are Figma "Button Special": `flex:1` but **capped at `max-width:160px`** with `justify-content: space-between`, so Previous sits hard left and Next hard right rather than the two splitting the width 50/50. Geometry `padding:12px 20px`, font-size **14px** (was 16px), line-height 1.5, radius 8px. **Previous is borderless** — Figma shows a plain Dawn/Purple text label, not the bordered ghost the prototype had. Next keeps its Dawn/Purple fill and 50% disabled opacity.
6. **Progress indicator.** Re-tokenised (`--acuity-color-neutral-gray-30` track, `--acuity-color-system-blue-100` fill, replacing hardcoded `#e7e7e7`/`#113267`) and the step ladder changed from an even `[20,40,60,80,100]` to `[5,24,48,73,96]`.
7. **Step header.** C03/C04's one-off 22px `.create-screen-heading` is retired; all five steps now use the shared `.create-panel-header` (Figma's "Title_Sub": 18px Clarkson Serif title, 4px gap, optional 14px muted subtitle, full-width centred, no padding of its own).
**Rationale:** Direct frame-by-frame comparison against the five current Figma C01–C05 dialogs; every item above was a measured divergence, not a judgement call about intent.
**Constraints:** The shared `.create-header-slot` (both C1 and C2 headers occupying one grid cell so the C1→C2 morph doesn't jump) is retained — see D-078's discretion note for the cost.
**Implementation discretion:**
- **Spacing-scale mapping.** Figma is drawn on Rosetta's 11/22/33 spacing ladder, which is off Acuity's `--acuity-spacing-*` scale entirely. Rather than hardcode off-scale px (forbidden by CLAUDE.md) or add three new tokens, Rosetta's ladder is mapped proportionally onto Acuity's: **11→12, 22→24, 33→32**. Applied consistently everywhere in this pass (header padding, body/slot gaps, chip gaps, button gaps). Worst-case drift is 1px.
- **Progress ladder.** Figma's five Progress Indicator instances carry filled widths of 25 / 125 / 250 / 379.6 / 500 against a 520px track — i.e. 4.8% / 24% / 48% / 73% / 96.2%, an irregular hand-set ladder rather than even fifths. Transcribed as `[5,24,48,73,96]` rather than "corrected" to even increments, on the principle that Figma is authoritative for appearance. See Open questions.
- **Modal `min-height`.** Releasing it (vs. pinning 560) is an engineering call to avoid overflow on short viewports; the 560px max is the stated constraint and is honoured.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the 720 × 90vh/80vh create dialog, its inset-gray surface, its centred eyebrow title, its 50/50 bordered-Previous button pair, and the even-fifths progress ladder.
**Prototype ref:** c3_c1 only.
**Open questions:** Is the irregular 5/24/48/73/96 progress ladder deliberate (a designed "tiny nub on step 1, not-quite-full on step 5" feel) or just un-snapped hand-drawn rectangles in Figma? If the latter, an even 20/40/60/80/100 is the better build and this should be reverted. Flagged for design review — **not** resolved in this pass.

### D-078 — C01 (title step): no subtitle, constant 32px, wrap-and-scroll instead of a font-shrink ladder
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Design · **Date:** 2026-09-21
**Decision:** Rebuilt against Figma nodes `7689:193383` (empty), `7689:193423` (typing), `7689:193463` (longer strings):
1. **Subtitle removed.** Figma's C01 header is the title line alone; the prototype's "This helps us tailor your experience and make recommendations" has no counterpart and is deleted.
2. **Type.** Title input is Clarkson Semibold **32px** (was 40px), line-height 1.25, letter-spacing −0.5px, colour **Dawn/Violet 100** (`--acuity-color-dawn-violet-100`, was Dawn/Purple 100), placeholder at **30% opacity** (was 20%).
3. **Overflow — the substantive change.** The old field was `white-space:nowrap; overflow:hidden; text-overflow:ellipsis` at rest, switching to a wrapping 80px-tall box only on `:focus`, with `_fitC1Name()` stepping the font 40px→18px until the text fit. Figma's "longer strings" frame does none of that: the title stays at a constant 32px, **wraps across centred lines**, and **scrolls vertically inside the field** once it outgrows the slot — the dialog never grows and nothing ellipsises. Implemented as `field-sizing:content` + `max-height:100%` + `overflow-y:auto` + `white-space:pre-wrap` on the field, inside a `flex:1`, `max-width:480px`, vertically-centred slot. `field-sizing` (already used elsewhere in this file and by `.acuity-big-input`) is what keeps a *short* title exactly as tall as its text, so it still sits vertically centred rather than top-aligned in a full-height box.
4. **`_fitC1Name()` retired, not deleted.** Reduced to clearing any inline `font-size` so the stylesheet's 32px (C1) / 16px (C2) governs. Kept as a function because ~6 call sites depend on it, and because `_animateC1C2()`'s "clear the inline size going forward, restore it coming back" contract still needs a hook.
5. **Slot gap zeroed.** `.big-input-wrap`'s `gap:16px` was silently contributing ~48px of dead gap in C1 (C2's collapsed-but-present description/status/counter/error zones are all still flex children), pushing the title off true centre. Gap is now 0 and C2 re-adds only the spacing it needs, as explicit margins.
**Rationale:** Frame comparison. Item 3 in particular was an explicit task callout and is confirmed by the Figma frame, which shows a 6-line wrapped title at unchanged size.
**Constraints:** The left-aligned-caret-over-centred-placeholder trick (`_c1UpdateCaretAlign()`, `.big-input--empty`) is preserved — Figma's empty frame still shows the caret immediately before a visually-centred placeholder.
**Implementation discretion:** The shared-height `.create-header-slot` is kept (so the C1→C2 header cross-fade doesn't shift the content below it), which means C1's slot reserves ~25px for C2's taller two-line header and the title input therefore sits marginally below the true vertical centre Figma draws. Treated as the lesser evil versus animating the header height mid-morph; flagged here rather than silently absorbed.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the C01 subtitle, the 40px size, and the 40→18px auto-shrink ladder.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-079 — C02 (description step): "(Optional)" on its own line, 16px title echo, and the limit warning folded into the counter
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Design · **Date:** 2026-09-21
**Decision:** Rebuilt against Figma nodes `7689:193503` (default), `7689:193545` (typing), `7689:193588` (max reached). Layers on top of D-047 (which hid the AI "Generate description" affordance) without disturbing it:
1. **Header.** "(Optional)" moves from an inline muted `<span>` inside the `<h2>` to its **own subtitle line** (14px, `--acuity-fg-muted`, 4px below the title) — matching C05's header, which already did this. The now-unused `.create-panel-title-optional` rule is deleted.
2. **Carried-over title echo** renders at **16px** semibold (was 24px), full opacity, Dawn/Violet 100, 12px above the description.
3. **Description field:** padding dropped from `0 44px` to 0 (the 480px `Input` max-width already does that job), placeholder opacity 20%→30%, colour to Dawn/Violet 100, plus the same `field-sizing:content` + internal-scroll contract as C1.
4. **Counter typography:** 12px, **letter-spacing 1px**, Dawn/Violet 100 at **76% opacity** (was `--acuity-fg-muted` at full strength), bottom-anchored (already correct per the prior pass).
5. **Max-limit message merged.** Figma's max frame shows **one red line reading "512/512 max. character limit reached"** — not a counter plus a separate error paragraph beneath it, which is what the prototype rendered. `_updateC2Counter()` now appends the warning to the counter text and turns it red at full opacity; `#c2-desc-error` is kept in the DOM but permanently hidden.
6. **Vertical centring.** The title-echo + description group is centred in the slot with the counter pinned to its bottom (Figma's "Row is flex:1 and centres its contents, counter is a shrink-0 sibling"), implemented as paired `margin-top:auto` on the echo and the counter so free space splits evenly above each.
**Rationale:** Frame comparison. Item 5 is the only behavioural change and is unambiguous in the max frame.
**Constraints:** D-047's hidden chip row and intact-but-unused `generateDescription()` wiring are untouched.
**Implementation discretion:** The counter's reveal animation transitions `opacity` 0 → **0.76** (rather than 0 → 1 with a separate opacity property) so Figma's 76% resting value and the existing collapse/reveal transition can share one property without a wrapper element. Paired-auto-margin centring lands within ~12px of Figma's exact position — the residual is the dead flex gap around C2's empty status/error nodes; judged not worth restructuring the DOM for.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the inline "(Optional)" suffix, the 24px echo, the muted-grey counter, and the separate `#c2-desc-error` line.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-080 — C03 (duration step): new heading copy, bare stepper buttons, Rosetta chips, and a selection-based "active input" state
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Design · **Date:** 2026-09-21
**Decision:** Rebuilt against Figma nodes `7689:193631` (default), `7689:193686` (active/highlighted), `7689:193741` (longer times):
1. **Copy.** Heading is **"Set the appointment duration"** (was "How long is the session?"), rendered with the shared 18px serif `.create-panel-header` rather than the retired 22px `.create-screen-heading`.
2. **Stepper buttons.** Figma uses a **bare Rosetta Icon Button** — a 22px minus/plus glyph with no ring and no fill. The 44px white bordered `.icon-btn-circle` is replaced by `.duration-step-btn`; C03 was that class's last remaining user in the file, so the rule (and its now-dead transition entry) is removed. Gap between button and numeral 28px → 44px.
3. **Numeral.** 80px Clarkson Semibold, line-height 1.25, letter-spacing −0.5px, Dawn/Violet 100, **full opacity** — Figma's default frame renders its seeded "45" solid, so the 20%-opacity "ghost until set" treatment is dropped for duration (it is retained for C04's price, which Figma *does* ghost). Fixed width 160px → **180px**, matched by the tap-to-edit input so the ±buttons don't shift on swap.
4. **"minutes" label** recoloured from `--acuity-fg-muted` to Dawn/Violet 100, letter-spacing −0.5px.
5. **Chips** restyled to Rosetta "Select set / Chips": padding 16→**12**/16, radius `md`(8px)→**`sm`(4px)**, label 16px at `--acuity-color-neutral-gray-100`, fill `--acuity-bg-glass-light`, row gap 8→12px. The **selected** variant is a darkened stroke only (`--acuity-color-neutral-gray-80`) — replacing the purple tint (border + background + label all recoloured) the prototype used. The row stays left-aligned and deliberately overflows past the right content edge (Figma clips the "2 hours" chip), so it opts out of the desktop `.chips-row { justify-content:center }` rule alongside C1's.
6. **Error placement.** The "must be less than a day" message moves out of the vertically-centred `.duration-control-wrap` and becomes a sibling **below** it, at the bottom of the step slot just above the chips — where Figma puts it. New shared `.create-step-slot` wrapper (Figma's "Business types" frame) introduced for this, and reused by C04/C05.
7. **Invalid state.** Figma leaves the **numeral in normal ink** and only the message red — so `.duration-num--invalid`'s red text is removed. Instead, the **"+" button dims** (`--acuity-fg-disabled`, pointer-events off) once the 1-day ceiling is reached, which is what Figma's "longer times" frame shows.
8. **Active/highlight state.** Figma's `7689:193686` draws the active numeral as a `#bcfdf8` rectangle in `mix-blend-mode: difference` over the value — that is Figma's idiom for **native text selection**, not a designed swatch. Read as "tapping the numeral selects the whole value so typing replaces it" (which the tap-to-edit handler already did via `inp.select()`), and given a matching `::selection` treatment. Also fixed: the tap-to-edit `<input>` carried a hardcoded `opacity:0.2`, so editing a duration rendered it as a near-invisible ghost — now full opacity, Dawn/Violet 100, with C03's line-height/letter-spacing.
**Rationale:** Frame comparison, plus D-050's earlier finding that this step's tap-to-edit had accumulated cruft — item 8's opacity bug is of a piece with that.
**Constraints:** F15 (typed duration is free: 1-min floor, no ceiling, no 15-min snap) is unaffected — the "+" dimming is a stepper-affordance change, and validation still blocks Next rather than clamping.
**Implementation discretion:** `::selection` is styled with `--acuity-color-dawn-violet-100` on `--acuity-color-neutral-gray-base` rather than reproducing Figma's difference-blend result (`≈#430207` on `≈#cdd2b9`), which are artefacts of the blend mode and match no token. Flagged because it is the one place in this pass where the rendered colour deliberately differs from the frame.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the "How long is the session?" copy, `.icon-btn-circle` on this step, the ghosted/red duration numeral, the purple-tint selected chip, and the centred error placement.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-081 — C04 (price step): new heading copy, 11px gutter, and an invisible "$" spacer so the numeral is what reads as centred
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Design · **Date:** 2026-09-21
**Decision:** Rebuilt against Figma nodes `7689:193797` (default), `7689:193838` (filled), `7689:193879` (longer strings). Layers on top of D-048 (no preset chip row) without disturbing it:
1. **Copy.** Heading is **"Set the appointment price"** (was "What's the price?"), via the shared serif header.
2. **Layout.** `$`-to-numeral gap 2px → 12px, alignment `baseline` → `center`.
3. **Ghost "$" spacer.** Figma carries a **second, `opacity:0` "$"** after the numeral. It isn't decoration — it is what makes the *numeral* optically centred in the slot rather than the "$ 0" pair as a whole (verified against the filled frame: the group's centre lands on the dialog's centreline only with the spacer counted). Reproduced as `.price-prefix--ghost`, `aria-hidden`.
4. **Type.** Prefix 32px semibold at **80%** opacity (was 400-weight at 75%), numeral 80px at **30%** ghost opacity (was 20%), both Dawn/Violet 100 with line-height 1.25 and letter-spacing −0.5px.
5. **Overflow.** The numeral's fixed `width:160px` is removed. Figma's "longer strings" frame lets a long price **grow past the dialog and clip at the content edge** — it does not shrink, wrap, or ellipsise. The tap-to-edit `<input>` switches from `width:160px` to `field-sizing:content` + `min-width:1ch` so the span↔input swap stays the same width at every length. Same hardcoded `opacity:0.2` edit-input bug as C03 fixed here too.
**Rationale:** Frame comparison; item 3 was verified arithmetically against the filled frame rather than assumed.
**Constraints:** F11 (negative/non-numeric price clamps silently to 0) is unaffected.
**Implementation discretion:** None material.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the "What's the price?" copy, the baseline-aligned 2px-gap price pair, and the fixed-width numeral.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-082 — C05 (image step): shortened heading, Figma collage geometry, Dawn/Purple upload row, and a top-anchored uploaded state
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Design · **Date:** 2026-09-21
**Decision:** Rebuilt against Figma nodes `7689:193292` (no image) and `7689:193340` (uploaded). Layers on top of D-049 (asset card nested in the placeholder, Upload row dimmed rather than hidden) without reverting it:
1. **Copy.** Heading shortened to **"Add an image"** (was "Add an image to your appointment"); "(Optional)" subtitle unchanged.
2. **Collage geometry** rescaled to Figma's "photos frame": frame 280×230 → **308×190**; cards 98×116/131×106/138×106 → **79×93 / 106×86 / 112×86**, repositioned, radius 12→**9px**, and all three given Figma's single shadow recipe (`0 0 0.75px rgba(0,0,0,.08), 0 3px 12px rgba(0,0,0,.12)`) in place of three different ad-hoc ones. The card ordering, rotations (−7.5° / +15°) and the existing `c5-anim` fly-in are unchanged — only the scale was wrong, a holdover from the 720px dialog.
3. **Upload row** restyled to Figma: **hairline Dawn/Purple stroke** (`--acuity-border-width-hairline` + `--acuity-color-dawn-purple-100`) on a `--acuity-bg-glass-light` fill, with the icon and label inheriting Dawn/Purple — replacing a 1px neutral `--acuity-border-default` stroke on transparent with `--acuity-fg-default` content.
4. **Upload group.** The Upload row and its 12px caption are wrapped in a `.c5-upload-group` (Figma's 12px-gap, full-width group) and the media area's `max-width:360px` cap is removed so both span the full 512px content width, as Figma draws them.
5. **Uploaded state anchoring.** In Figma's "image added" frame the Asset Card sits **hard against the top** of the content area with the slack falling below the (dimmed) Upload row — not centred where the collage was. The media slot is `flex:1` and centred while it holds the collage, and collapses to `flex:0 0 auto` once an image exists (`.has-image`, toggled in `_c5SetImageState()`).
6. **Asset-card actions.** REPLACE and EDIT are grouped hard left with the trash alone on the right. They were three `space-between` siblings, which spread EDIT to the centre; now wrapped in a `.sheet-asset-actions` flex group.
**Rationale:** Frame comparison. Item 5 is the only layout-behaviour change and is clear in the uploaded frame; item 6 is a regression introduced when D-049 added the EDIT button to a two-child `space-between` row.
**Constraints:** D-049's "Upload row stays visible but dimmed" behaviour and the EDIT-is-a-stub caveat both stand unchanged.
**Implementation discretion:** Figma's collage card positions are sub-pixel (e.g. `left:118.16, top:42.25` on a rotated bounding box); these were converted to un-rotated origins and rounded to whole pixels. Drift is <1px per card.
**Artifacts affected:** [ ] MD [x] Figma [x] Prototype [ ] Ticket
**Supersedes:** the long C05 heading, the 720px-era collage scale, the neutral-stroke upload row, the 360px media cap, and the centred uploaded-state card.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-083 — New "inline create" variant replaces the C1-C5 modal on the "Create new appointment" button
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item (this is the variant flagged, log-only, as item 37/D-060 during the original 59-item pass — now actually built) · **Date:** 2026-09-21
**Decision:** `#s5-create-btn`'s `onclick` changed from `openCreate()` (opens the 5-step C1-C5 modal) to a new `createApptInline()`:
1. Pushes a new appointment straight into `state.selectedAppts`: `{ id: 'custom_'+Date.now(), name: '', duration: '45 min', price: '', description: '', image: null, isCustom: true }` — empty title, empty price, a preloaded 45 min duration, per the task's exact spec.
2. Sets `state._inlineCreateSkeletonId` to the new id and `state._s5ForceSkeleton = true`, then calls `renderCatalog()` — the new card renders as a skeleton (`renderCatalog()`'s selected-list map now checks `a.id === state._inlineCreateSkeletonId` and swaps in the existing `.appt-card--skeleton.appt-card--selected-item` markup instead of a real card), and the live scheduling-page preview flashes its existing whole-preview skeleton state (the same `state._s5ForceSkeleton` mechanism `generateAISuggestions()`/`S5_SKELETON_MS` already use) for `INLINE_CREATE_SKELETON_MS` (500ms).
3. After that window, both skeleton flags clear, `renderCatalog()` runs again with the real (still-empty) card, and `openEdit(id)` auto-opens it inline — landing the user directly in the edit sheet with empty title/price and "45" prefilled in the duration field.
4. **Auto-delete of an unsaved draft:** `closeEdit()` gained a new first-check branch — if the appointment being closed (not saved) is `isCustom` and has an empty name both at snapshot-open time and in the sheet's current raw input value, it's removed from `state.selectedAppts` outright (no discard-confirmation dialog; the item was never really "created"), instead of falling through to the normal discard-confirm path. An existing, already-named appointment that the user happens to clear the text of mid-edit does NOT match this check (its persisted `appt.name` is non-empty) and still goes through the normal confirm-to-discard flow.
5. The old modal flow's code (`openCreate()`, `navigateCreate()`, `addCreatedService()`, panels C1-C5, etc.) is left fully in place, just no longer reachable from this button — per the user's explicit choice to replace rather than keep both reachable.
**Rationale:** Direct task instruction, resolving item 37/D-060's previously-deferred "possible future variant" note; two explicit clarifying questions resolved the button-replacement scope and the empty-draft-on-close behavior.
**Constraints:** The live scheduling-page preview's skeleton is a whole-preview flash, not a true single-service skeleton inside that iframe — building real per-service skeleton support in scheduling-page.html was out of scope; reused the existing proven mechanism instead.
**Implementation discretion:** `INLINE_CREATE_SKELETON_MS = 500` (a new constant, not reusing `S5_SKELETON_MS`'s 400ms, since this is a conceptually distinct wait) was not itself specified by the user — chosen to be long enough to read as a deliberate loading beat without feeling sluggish.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** `#s5-create-btn`'s previous `openCreate()` wiring.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-084 — CSP live preview: the just-created appointment stays skeleton until the user's first real edit, in place (not a whole-preview flash)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** Task item, correcting D-083's constraint · **Date:** 2026-09-21
**Decision:** D-083 explicitly scoped out true per-service preview skeletons ("building real per-service skeleton support in scheduling-page.html was out of scope; reused the existing proven [whole-preview] mechanism instead"). This builds that support:
1. **c3_c1/index.html:** added a new `state._inlineCreatePreviewSkeletonId` field, distinct from the existing `state._inlineCreateSkeletonId` (which still controls the LIST card's brief 500ms skeleton flash, unchanged). `createApptInline()` now sets both on creation, but only the list-card one is cleared by the `INLINE_CREATE_SKELETON_MS` timer — the preview one is NOT cleared by any timer. It's cleared exactly once, inside `_syncEditPreview()` (which already fires on every real `input` event in the edit sheet — name/duration/price/description), the first time it fires while `state.editingApptId` matches. Programmatic prefill (e.g. `openEdit()` setting `field-duration.value = '45'` directly) doesn't trigger `input` events, so the skeleton correctly survives the sheet opening and only clears on the user's first actual keystroke/change.
2. **`_buildPreviewPayload()`:** each service in the payload now carries its own `id` (previously omitted entirely — a gap, not a deliberate choice). A new top-level `skeletonServiceId` field carries `state._inlineCreatePreviewSkeletonId`, independent of the existing whole-list `skeleton` boolean (which is unchanged and still serves its original S5-catalog-loading use case).
3. **scheduling-page.html:** `renderSelect()`'s per-service `.map()` now checks `svc.id === st.skeletonServiceId` at the top of each iteration and renders that one card as a skeleton (same `.sched-card--skeleton` markup already used for the whole-list case) — while every other service in the same list renders normally around it. Added `skeletonServiceId: null` to `DEFAULTS` for robustness before any payload arrives.
4. `closeEdit()`'s D-083 auto-delete branch also now clears `state._inlineCreatePreviewSkeletonId` if it matches the deleted id, so no stale reference lingers in state after the item is removed (the preview itself is unaffected either way, since a deleted service simply no longer appears in the payload's `services` array).
**Rationale:** Direct task instruction, closing the gap D-083 had explicitly flagged as out of scope.
**Constraints:** None.
**Implementation discretion:** Chose to key the skeleton on `input` events specifically (already-wired to `_syncEditPreview()`) as the signal for "user started editing," rather than e.g. sheet-open or focus — matches the literal ask ("until the user starts editing it") more precisely than a proxy signal would.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-083's whole-preview `state._s5ForceSkeleton` flash for this specific flow (that mechanism itself is untouched and still used by `generateAISuggestions()`'s unrelated S5-loading case — only `createApptInline()` stopped using it).
**Prototype ref:** c3_c1 only (this entry also touches `scheduling-page.html`, which is shared/loaded by both c3_c1 and c3_c2, but the *decision* — driven by c3_c1's `createApptInline()` — is c3_c1-scoped; c3_c2 has no equivalent inline-create flow to exercise this new payload field).
**Open questions:** None.

### D-085 — Fixed: inline-create's list card flashed empty-then-"45 min" before expanding; now expands immediately, name field focused
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report · **Date:** 2026-09-21
**Decision:** D-083's `createApptInline()` rendered the new appointment as a collapsed skeleton card, waited `INLINE_CREATE_SKELETON_MS` (500ms), then re-rendered it as a collapsed *real* card and only THEN called `openEdit(id)` to expand it. That intermediate real-but-collapsed render was visible for a frame-or-more before the expand animation kicked in — reported as "an empty card appears, then right before it expands you can see 45min flash rapidly," reading as a glitch.
Fixed: removed the entire skeleton/delay stage for the list card. `createApptInline()` now pushes the appointment, calls `renderCatalog()` once (rendering the real, already-correct collapsed card), and calls `openEdit(id)` in the same synchronous tick — no `setTimeout`, no intermediate skeleton render. `state._inlineCreateSkeletonId` (the field, the constant `INLINE_CREATE_SKELETON_MS`, and `renderCatalog()`'s per-item check for it) are removed entirely as dead code, since nothing sets that flag anymore. Also added an explicit `document.getElementById('sheet-service-name')?.focus();` right after `openEdit(id)`, since `openEdit()` itself has never auto-focused the name field for any card (editing an *existing* appointment via its pencil icon still doesn't auto-focus/select text — that wasn't asked for and stays as-is; the new focus call lives in `createApptInline()` specifically, not inside `openEdit()`).
D-084's CSP live-preview skeleton (`state._inlineCreatePreviewSkeletonId`) is untouched — it was never the source of this glitch (it has no timer, just persists until the user's first real edit) and still works exactly as before.
**Rationale:** Direct user bug report describing the exact visual sequence.
**Constraints:** None.
**Implementation discretion:** N/A — direct fix.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-083's 500ms skeleton-then-collapsed-then-expand sequence for the list card specifically (the CSP-preview skeleton from D-084 is unaffected).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-086 — Fixed two remaining collapsed-state flashes: right before expanding, and right before auto-delete-on-close
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report · **Date:** 2026-09-21
**Decision:** D-085 removed the 500ms delay before `openEdit()` fired, but two more single-frame-or-longer flashes of the collapsed card remained, both root-caused and fixed:
1. **Flash right before expanding.** `openEdit()` has always added `.appt-card--editing` inside a `requestAnimationFrame()`, deliberately deferred one frame so an *existing* card's collapse→expand CSS transition has a real painted starting state to animate from. For a *brand-new* card (never painted before), that same deferral means the browser's first paint shows it collapsed, and only on the NEXT frame does the expand transition begin — a visible one-frame (or more) flash. Fixed: `openEdit()` now takes an optional second parameter, `opts.immediate` — when true, it adds `.appt-card--editing` synchronously, in the same tick as `createApptInline()`'s `renderCatalog()` call, so the browser's first-ever paint of the card already shows it expanded (no collapsed frame is ever painted, so there's nothing to transition from — the expand animation doesn't play, the card just appears already in edit mode). `createApptInline()` now calls `openEdit(id, { immediate: true })`. Editing an *existing* card via its pencil icon still uses the deferred/animated path, unchanged.
2. **Flash right before auto-delete-on-close.** `closeEdit()`'s D-083 auto-delete branch was calling `_finishEditClose(true)`, which removes `.appt-card--editing` FIRST (visually collapsing the sheet back into a collapsed card showing the empty name/45-min state) and only calls `renderCatalog()` afterward, on a `setTimeout(EDIT_CLOSE_MS)` (320ms) — so the about-to-be-deleted card was visibly flashing its collapsed state for that whole 320ms window before actually disappearing. Fixed: the auto-delete branch no longer calls `_finishEditClose()` at all — it inlines the same state cleanup (`state.editingApptId`, `_editSnapshot`, `_editImageDraft`, `_liveEditDraft`, moving `#sheet` back to `#edit-overlay` so the shared singleton isn't destroyed by the list's re-render) and calls `renderCatalog()` immediately, synchronously. The card is being deleted outright, not collapsed, so there's nothing to animate back to.
**Rationale:** Direct user bug report describing both remaining flash moments precisely.
**Constraints:** None.
**Implementation discretion:** Skipping the expand *animation* entirely for new cards (rather than, say, keeping a very fast animated expand) was a judgment call — the report's wording ("start to expand... as soon as it's added") was read as "no visible flash of the wrong state," which skipping the pre-paint achieves; if a still-visible-but-immediate expand transition is preferred instead of an instant appearance, that would need a different approach (e.g. forcing a synchronous layout flush between adding the collapsed and expanded classes) and is worth flagging back if the current instant-appearance reads as too abrupt.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-085's still-present rAF-deferred `openEdit()` call from `createApptInline()`; the auto-delete branch's previous use of `_finishEditClose(true)`.
**Prototype ref:** c3_c1 only.
**Open questions:** Is an instant (non-animated) appearance in edit mode acceptable for the new-card case, or should there be a fast-but-visible expand instead? Flagging in case the current result reads as too abrupt once seen.

### D-087 — Collapsed head content hidden by presence of a title, not by animation timing (belt-and-suspenders on top of D-086)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report (flash persisted after D-086) · **Date:** 2026-09-21
**Decision:** D-086's fix (synchronous `.appt-card--editing` add via `openEdit(id, { immediate: true })`) was based on the assumption that skipping the `requestAnimationFrame` defer would prevent the browser from ever painting the collapsed head. The user reported the flash was still visible on open. Rather than continue debugging exact paint/transition timing blind (no visual testing available in this sandbox), switched to a deterministic, content-based fix per the user's direction: `apptCardHTML()` now computes `pendingTitle = !appt.name` and, when true, adds a new `appt-card-head-inner--pending` class to `.appt-card-head-inner` (`visibility: hidden` — chosen over `display:none` so the head-wrap's grid-row height stays consistent with its content still occupying layout space). This hides the collapsed head's name/meta/actions/grip content outright whenever the appointment has no name yet, regardless of *why* or *when* it might otherwise be visible — sidestepping the whole question of whether a given animation/paint-timing edge case still exposes it. Once a real title is saved (`state.apptEdits[id].name` gets set via `saveEdit()`), the next `renderCatalog()` naturally omits the `--pending` class and the collapsed head renders normally.
**Rationale:** Direct user bug report that D-086 didn't fully resolve the issue; the user's own proposed fix (hide by title-presence, not by timing) was implemented as given.
**Constraints:** None.
**Implementation discretion:** Used `visibility: hidden` rather than `display: none` specifically to avoid a layout-height side effect on `.appt-card-head-wrap`'s grid-row transition; not independently specified.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A — additive on top of D-086, which is left in place unchanged.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-088 — Inline-create card bakes .appt-card--editing into its first-ever markup; no toggle, no possible flash window
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User bug report (flash persisted after D-086/D-087) · **Date:** 2026-09-21
**Decision:** D-086 (synchronous class-add) and D-087 (hide collapsed content by title-presence) both tried to *close* the flash window without being fully sure what was still leaking through it — the user confirmed a flash was still visible and reframed the target precisely: "it's as if it skipped the collapsed card state entirely." Rather than keep patching around a `classList.add()` toggle's timing, removed the toggle itself for this one case: `apptCardHTML(appt, isSelected, idx, startEditing)` gained a 4th parameter — when true, `.appt-card--editing` is written directly into the card's class list in the returned template string, so the card is born already-expanded. There is no earlier "collapsed" class state on this element at all, ever, so there is nothing for any CSS transition to fire from and no browser-timing edge case to chase. `renderCatalog()`'s selected-list map now passes `a.id === state._inlineCreateStartEditingId` as that 4th argument; `createApptInline()` sets `state._inlineCreateStartEditingId = id` immediately before its `renderCatalog()` call and clears it right after (one-shot — the class is baked into that one render and needs no further tracking). `openEdit(id, { immediate: true })` still runs afterward for its other setup (populating sheet fields, moving `#sheet` into the slot, snapshot, scroll, focus) — its own `classList.add('appt-card--editing')` is now a harmless no-op since the class is already present.
**Rationale:** Direct user bug report and reframing of the desired end-state, after two prior attempts (D-086, D-087) didn't fully resolve it.
**Constraints:** None.
**Implementation discretion:** Kept D-086 and D-087 in place rather than reverting them — D-087's title-presence-based hiding is still a useful guarantee independent of this fix (e.g. if this card is ever later re-rendered mid-edit for some other reason), and D-086's `immediate` option is still meaningful/used by this same call.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** Relies on D-086's `openEdit(..., { immediate: true })` still running (for non-class-related setup) but that call's own class-toggle is now redundant for this specific path.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-089 — Reversal: bring back the expand animation on create; D-086/D-088's animation-suppressing mechanisms removed, D-087 kept
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction change · **Date:** 2026-09-21
**Decision:** After D-088 fully eliminated the flash (confirmed working), the user asked for the opposite of what D-086/D-088 optimized for: they DO want to see the expand animation on create (the card growing, `.sheet-top`/`.sheet-fields`/`.sheet-footer` staggering in) — just never the wrong (empty-name/45-min) content. D-087's `.appt-card-head-inner--pending` fix (hide the collapsed head's content by title-presence) already guarantees that independently of any animation timing, so it was never actually necessary to suppress the animation to get a clean result — D-086/D-088 over-corrected.
Removed, as dead/superseded code:
- D-088's `apptCardHTML()` 4th parameter (`startEditing`)/`editingCls`, and `renderCatalog()`'s corresponding 4th map argument.
- `state._inlineCreateStartEditingId` (the field and both call sites that set/cleared it in `createApptInline()`).
- D-086's `openEdit(id, opts)` second parameter and its `if (opts.immediate) { ... } else { requestAnimationFrame(...) }` branch — `openEdit()` is back to its original single-parameter form, always using the deferred `requestAnimationFrame()` path (the same one an existing card's pencil-icon edit already used, and still does).
`createApptInline()` now calls plain `openEdit(id)` (no options), so the newly-created card uses the exact same deferred/animated expand as any other card — the class gets toggled a frame later, the transition plays, `.sheet-top`/`.sheet-fields`/`.sheet-footer` cascade in with their existing stagger. D-087 (`pendingTitle`/`.appt-card-head-inner--pending`) is unchanged and is what actually prevents the bad flash during that transition, regardless of it now playing.
Per the user's explicit note, no equivalent close/collapse animation was added for the auto-delete-on-close path (D-086's 2nd fix, the instant removal without a visible collapse-back step) — that stays exactly as it is.
**Rationale:** Direct user direction change, after confirming D-088 worked for its stated goal but wasn't actually what was wanted once seen.
**Constraints:** None.
**Implementation discretion:** N/A — direct revert of the now-unwanted mechanisms, keeping the still-wanted one (D-087).
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-086 and D-088's animation-suppressing mechanisms, fully removed (not just unused) since nothing else in the codebase used them. D-087 and D-085's other fix (instant, no-collapse removal on auto-delete) are both explicitly kept.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-090 — S1 loading icon swapped to `loading-icon-2.json`
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-22
**Decision:** S1's `<dotlottie-player id="s1-lottie-loader">` now points `src` at the new file `assets/loading-icon-2.json` (a relative path, resolved from `c3_c1/index.html`), replacing the old inline base64 `data:application/json;base64,...` payload that was embedded directly in the tag. `speed="0.35"`, the `loop` attribute, and the absence of `autoplay` (per D-067's manual `.play()`-after-500ms mechanism) are all unchanged.
**Rationale:** Direct user request to use the new loader asset the user added to `c3_c1/assets/`.
**Constraints:** None.
**Implementation discretion:** Used a plain relative `src="assets/..."` path rather than re-inlining the new file as base64, matching how other local assets (e.g. `assets/icon-trash-bin.svg`) are already referenced elsewhere in `c3_c1/index.html`, and making future icon swaps a one-line edit instead of a blob replacement.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A — first time this loader has pointed at an external file rather than an inline data-URI.
**Prototype ref:** c3_c1 only. The pre-existing `c3_c1/assets/loading-icon.json` remains unused (unreferenced by any screen); S4 and `s_loading_home`'s lottie players still use their own inline base64 payload and were not touched.
**Open questions:** None.

### D-091 — 8 brand palettes recolored to match Figma; Color Mode role table replaced (resolves F17)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Global (ds + both prototypes) · **Triggered by:** User-provided Figma link (node 7689:192111) + a pasted mode-role table image · **Date:** 2026-09-22
**Decision:** Replaced all 8 presets in `ds/brand-palettes.css` (and the `:root` default, which mirrors `neutral`) with exact hex values read from Figma node 7689:192111 ("Customize Panel" → Colors → Dropdown Dialog, 8× "theme" frames). The 8 Figma frames carry no text labels — names were matched to the existing 8 preset names (neutral/orchid/desert/meadow/sunset/lime/forest/violet) by hue resemblance, confirmed correct by the user. Two frames (desert, lime) had internally scrambled `Swatch 01–05` Figma layer names that didn't match their own visual light→dark order; after the user was shown the concrete broken result of following literal layer-number order (lime's Color 1 would be a bright yellow-green `#eff483`, making "Mode 1" render a non-light background), the user supplied the final hex sequences directly, which resolve to visual lightest→darkest order for both — same convention as the other 6 palettes.
Also replaced `COLOR_MODE_TABLE` (duplicated in `scheduling-page.html`, `c3_c1/index.html`, `c3_c2/index.html` — all three kept in sync per their existing "mirrored, keep in sync" comments) with the role mapping from the user's pasted table (Figma node 7689:192111's mode rule): bodyBackground/schedulerBackground → `bg`, headerText/schedulerText → `fg`, buttonAccent → `buttonBg`. This changed `buttonBg` for modes 1, 2, and 5 (previously 4/3/0, now 3/4/2) versus the pre-existing table; modes 3 and 4 were already correct. The pasted table has no `businessLogo` role (present in the existing table) and no `buttonText` role (also present in the existing table) — per user decision, `businessLogo` now mirrors `fg` (headerText) in every mode; `buttonText` was left as the pre-existing contrast-safe index-0-or-4 pairing (unaddressed by the new table, no reason to change it).
**Final palette hex values (Color 1→5):** neutral `#ffffff #fafafa #dddddd #222222 #000000`; orchid `#fcf0f0 #d1c8f4 #ae9def #9b2929 #531a4a`; desert `#f6f3ec #ece4da #b9a590 #574c3f #36302a`; meadow `#ffffff #f4f3e8 #f5f374 #7f9feb #404d67`; sunset `#fafaf9 #facf9f #ff6123 #191a1a #0d0d0d`; lime `#f4f2ea #eff483 #dfefff #e24a39 #184027`; forest `#ffffff #e1dfd9 #209d50 #026528 #001b0b`; violet `#f9f0fb #cad5ca #8075ff #6321ee #211a1d`.
**Final COLOR_MODE_TABLE (1-indexed swatch, per mode):** Mode 1 bg=1 fg=5 buttonAccent=4 businessLogo=5; Mode 2 bg=2 fg=5 buttonAccent=5 businessLogo=5; Mode 3 bg=3 fg=5 buttonAccent=5 businessLogo=5; Mode 4 bg=4 fg=1 buttonAccent=2 businessLogo=1; Mode 5 bg=5 fg=1 buttonAccent=3 businessLogo=1.
**Rationale:** Direct user request to bring the 8 palettes and the Color Mode role mapping into parity with the current Figma spec; resolves the previously-OPEN **F17** ("dark theming mechanism needs revisiting given 5-color-mode decision — do not treat current implementation as spec") — the 5-mode system is now spec-matched, not a placeholder.
**Constraints:** Figma's 8 palette frames have no name labels, so the name↔swatch-set mapping is confirmed-by-user inference, not a literal read of a Figma label — flagged explicitly in case a future Figma update adds/reorders frames.
**Implementation discretion:** Kept `buttonText`'s existing values unchanged (not addressed by the new table, no signal to change it); applied the identical `COLOR_MODE_TABLE` edit to all three duplicate copies to preserve the existing "keep in sync" invariant rather than deduplicating into a shared module (out of scope, matches F18-style prototype-duplication precedent already accepted elsewhere in this file).
**Artifacts affected:** [ ] MD [x] Figma (read only) [x] Prototype [ ] Ticket
**Supersedes:** The prior placeholder `COLOR_MODE_TABLE` values and all 8 prior placeholder palette hex sets in `ds/brand-palettes.css`. Resolves F17 (see above).
**Prototype ref:** `ds/brand-palettes.css` (shared), `scheduling-page.html`, `c3_c1/index.html`, `c3_c2/index.html` — all four touched identically for the mode table; palette file is single shared source.
**Open questions:** None — all ambiguities (palette name mapping, desert/lime swatch order, mode-table replacement scope, businessLogo handling) were resolved via direct user confirmation this session.

### D-092 — wizard-progress rebuilt as 3 discrete segments with is-complete/is-active modifiers
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-22
**Decision:** `.wizard-progress` (S2/S5/S9's step indicator, previously a single continuous track with a `.wizard-progress__fill` div whose inline `width` (33.34%/66.67%/100%) simulated 1-of-3/2-of-3/3-of-3 progress) is now a flex container of 3 discrete `.wizard-progress__segment` pills (`flex:1`, `4px` gap, no more `overflow:hidden` track). Each segment carries no modifier (upcoming/default — `var(--acuity-border-default)`), `--is-complete`, or `--is-active`; both modifiers currently resolve to the same color (`var(--acuity-color-neutral-gray-100)`, matching the old fill color) but are kept as separate classes per explicit instruction so they can diverge later without another markup pass. Applied per-screen: S2 ("Step 1 of 3") → segment 1 `--is-active`, 2–3 default; S5 ("Step 2 of 3") → segment 1 `--is-complete`, 2 `--is-active`, 3 default; S9 ("Step 3 of 3") → segments 1–2 `--is-complete`, 3 `--is-active`.
**Rationale:** Direct user request to move from a continuous-fill progress bar to discrete per-step segments with explicit complete/active states.
**Constraints:** None.
**Implementation discretion:** Named the third (unmarked) state "default/upcoming" — not addressed by the user's instruction, since only `is-complete` and `is-active` were specified; left it as the segment's own unmodified background rather than inventing an `--is-upcoming` class with no distinct value yet. Used the project's existing `--<modifier>` BEM convention (e.g. `--is-maxed` in `ds/components.css`) for the modifier names rather than bare `.is-complete`/`.is-active` classes, per CLAUDE.md's naming conventions section.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** The single-track `.wizard-progress__fill` + inline `width:N%` pattern, removed entirely (no remaining references).
**Prototype ref:** c3_c1 only — `.wizard-progress` doesn't exist in c3_c2.
**Open questions:** None.

### D-093 — Icon Button formalized as a DS component (strong/default/alt/subtle × xs–lg); .appt-icon-btn and .avail-range-icon-btn unified onto it
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Global (ds + c3_c1) · **Triggered by:** User request to make `.appt-icon-btn`/`.appt-icon-btn--add` share structure, which widened once the user identified both classes as instances of one underlying "Icon Button" component also covering `.avail-range-icon-btn` · **Date:** 2026-09-23
**Decision:** Investigated the actual current CSS for `.appt-icon-btn`/`.appt-icon-btn--add` and found they diverged far beyond color: base used a 32px box with a `::before`-overlay hover halo, while `--add` used `width:auto`/padding/a real border/its own direct-background hover — plus a separate, higher-specificity `#s5`-scoped selector (`#s5 .appt-card--ai .appt-card-actions > .appt-icon-btn:last-child`) that always overrode `--add` to a 32×32 filled gray square in the only place it's actually used, meaning the base classes' own CSS was partly dead code there. Confirmed with the user that the intended fix was broader: formalize a real Icon Button DS component (sizes xs/sm/md/lg/xl, variants default/subtle/alt/strong) and put `.appt-icon-btn` (S5, "md") and `.avail-range-icon-btn` (S9 day-range row, "sm") on it.
Pulled the actual "Icon Button" component from Figma (file `Sa6aYUBfzrl7fX5XkT9iin`, node `313:218`) rather than guess colors — real spec differs from what was initially described: **4 sizes exist, not 5** (X-Small 22px / Small 28px / Default-Medium 36px / Large 44px — no 56px "xl" tier), confirmed by the user to use as-is. The icon glyph itself is a fixed 22×22px in Figma at every size (only padding shrinks) — per user decision, glyph sizes were **left unchanged** (pencil 14px, plus 12px, trash 14px `.acuity-icon--sm`); only the button's own box/hit-target follows the new size scale.
`ds/components.css`'s `.acuity-icon-button` extended (not replaced) with a second variant axis — `--strong`/`--default`/`--alt`/`--subtle`, matching Figma exactly — alongside the pre-existing `--ghost`/`--primary`/`--secondary`/`--destructive` axis (kept untouched, still used by S10's 3 share-dialog buttons). Size modifiers `--xs`/`--sm`/`--md`/`--lg` changed from padding-only to fixed width/height boxes (22/28/36/44px) — this is a shared change across both variant axes since size and variant are independent properties on the same component; verified it doesn't visually break the 3 existing `--ghost` usages (icon-only buttons, box-based sizing is a strict clarification of what padding-based sizing was already approximating). Base `border-radius` changed from `--acuity-border-radius-md` (8px) to `--acuity-border-radius-sm` (4px) to match Figma's literal value.
Found a bug in Figma's own file: "Strong" variant's Disabled state binds background AND icon color to the same `fg/disabled` token, making the icon invisible. Deliberately did not port this — disabled state continues to use the DS's existing generic `opacity: 0.5` fade (unaffected by variant), which sidesteps the bug entirely without needing per-variant disabled colors.
In `c3_c1/index.html`: rewrote `.appt-icon-btn` to a 36px ("md") box using `--acuity-bg-inset` on hover (Subtle-equivalent; edit/remove use no modifier), and `.appt-icon-btn--add` to only differ by background (`--acuity-bg-default` resting → `--acuity-color-neutral-gray-100` neutral-gray-30 on hover — Default-equivalent). The `::before` hover-halo overlay trick is gone entirely — a real 36px box doesn't need a virtual larger hit area the way the old ~16px-visual/32px-box arrangement did. Removed the `#s5`-scoped 16px shrink and the filled-square override for `--add` entirely (per explicit user confirmation earlier in this session) — S5's edit/remove/add buttons now render at the same uniform 36px box as everywhere else `.appt-icon-btn` is used (previously S9's availability-edit pencil, unaffected, was already unscoped). `.avail-range-icon-btn` needed no size/color change (was already a 28px box with `--acuity-bg-inset` hover — already matched Figma's Subtle/Small); only its hardcoded `border-radius: 4px` was swapped for the `--acuity-border-radius-sm` token. Fixed a transition-shorthand collision: a later `.appt-icon-btn { transition: opacity 0.1s ease; }` rule (line ~4185, equal specificity, cascades last) would have silently clobbered the new direct-background hover transition since shorthand resets all sub-properties — updated to `transition: opacity 0.1s ease, background 0.12s ease;`.
**Rationale:** Direct user request, escalating from a 2-class color-only fix to a full DS component once the user identified the real underlying pattern (confirmed via Figma) and the S5-specific override that was silently defeating any base-class-only fix.
**Constraints:** Figma's Icon Button component only defines 4 sizes and has a disabled-state bug on Strong — both explicitly deviated from/flagged rather than blindly ported.
**Implementation discretion:** Left the `--alt`/`--strong` variants implemented (colors ported faithfully from Figma) even though no current button in either prototype uses them yet, since they're part of the same component set and cost nothing extra once the axis exists. Added a preview.html row (4 buttons, `--strong`/`--default`/`--alt`/`--subtle` at `--md`) and a CLAUDE.md component-table update per the project's own checklist for new component primitives.
**Artifacts affected:** [x] MD (CLAUDE.md) [x] Figma (read only) [x] Prototype [ ] Ticket
**Supersedes:** The old `.appt-icon-btn`/`.appt-icon-btn--add` box-model divergence (border/padding/width-auto/::before-halo vs. direct-background hover) and the `#s5`-scoped 16px-shrink + filled-square override, all removed as dead/superseded code.
**Prototype ref:** `ds/components.css`, `ds/preview.html`, `CLAUDE.md`, `c3_c1/index.html`. Not applied to c3_c2 — neither `.appt-icon-btn` nor `.avail-range-icon-btn` exist there.
**Open questions:** None — sizes, icon-glyph scope, component axis (extend vs. replace), and variant colors were all resolved via direct user confirmation, informed by two rounds of live Figma lookups this session.

### D-094 — Style panel's Mode card "Aa" preview now uses the current font
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-23
**Decision:** `_buildModeCardsHTML()`'s per-mode "Aa" preview span had no `font-family` set (always rendered in the page's default font, ignoring whatever font the user had picked). Added `font-family:${_currentFont}` alongside its existing `color:${r.fg}` inline style. No other wiring was needed — `_syncStyleWidgets()` already fully rebuilds `.style-mode-grid`'s innerHTML via `_buildModeCardsHTML()` on every sync (including after font selection), so the Mode cards' "Aa" now updates live to match font picks, same as the summary row's own font preview.
**Rationale:** Direct user request — the Mode picker's "Aa" glyphs should reflect the user's chosen font, not just their chosen palette.
**Constraints:** None.
**Implementation discretion:** None — single-line addition, no ambiguity.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-095 — Palette-swatch card background/radius corrected to match Figma
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User-provided Figma link (node 5995:19733) · **Date:** 2026-09-23
**Decision:** Pulled the actual "theme" (palette-swatch button) frame from Figma node `5995:19733` (one of the 8-palette grid in Customize > Colors). Two real deltas found and fixed in `.style-palette-card`/`.style-swatch-strip`: card background is `#f9f9f9` in Figma (bound to variable `Neutral/Gray/10`) — code's `background: var(--acuity-color-neutral-gray-10, #f2f2f2)` already resolved to `#fafafa` in practice (the var reference itself was correct; only its unreachable `#f2f2f2` hex fallback was misleading/stale), simplified to `var(--acuity-bg-inset)` (`#fafafa`, negligible 1-unit difference from Figma's `#f9f9f9`, already the established semantic token for this exact value elsewhere in the same panel). Card `border-radius` corrected from `--acuity-border-radius-sm` (4px) to `--acuity-border-radius-md` (8px, Figma's actual value). Swatch-strip `border-radius` corrected from `--acuity-border-radius-xs` (2px) to `--acuity-border-radius-sm` (4px) — Figma authors each of the 5 swatches with its own 4px corner radius rather than rounding the strip as one shape, but overlap/z-index stacking in the source file means only the outer edges are ever visually exposed, netting the same ~4px-radius-strip look the CSS approximates as one shape.
Two Figma findings were investigated and deliberately NOT ported: (1) the 5 swatches render at an unequal ~2.15:1:1:1:1 width ratio (leftmost swatch wide, other four narrow) due to a `-90°`-rotation/negative-margin authoring technique in the source file — flagged by inspection as very likely an authoring artifact, not an intentional design (a real product wouldn't make one of 5 equal palette colors read as visually dominant); kept the current equal `flex: 1` per-swatch sizing. (2) No selected/hover border treatment could be found on any of the 8 sibling frames (plain frames, no interactive-state variants) — left the existing black-border-selected / gray-border-hover behavior unchanged since there was nothing in this source to confirm or contradict it against.
Card width was left fluid (unset, grid-driven via the existing `1fr 1fr` two-column grid) rather than hardcoded to Figma's measured 120px — that figure is a byproduct of the specific frame's fixed-width parent in Figma, not a stated constraint that the card itself must always be exactly 120px regardless of container.
**Rationale:** Direct user request to match this specific Figma node.
**Constraints:** None.
**Implementation discretion:** Declined to replicate the unequal swatch-width ratio and the width-120px sizing, both judged more likely artifacts of this specific Figma frame's authoring/instance context than intentional spec; documented the reasoning here so it can be revisited if a designer confirms otherwise.
**Artifacts affected:** [ ] MD [x] Figma (read only) [x] Prototype [ ] Ticket
**Supersedes:** N/A — first Figma-diffed pass on this specific component.
**Prototype ref:** c3_c1 only. Not applied to c3_c2, whose `.style-palette-card` is an older/divergent iteration (44px height, 8px padding) not touched this session.
**Open questions:** Whether the swatch-width ratio and/or hover/selected border treatment should ever be revisited if a cleaner reference frame turns up — not blocking, just unconfirmed either way.

### D-096 — Swatch fan/stack geometry corrected; two more stale hardcoded palette-hex copies found and fixed
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User feedback on D-095 + a cleaner Figma reference (node 8631:53047) · **Date:** 2026-09-23
**Decision:** D-095's swatch-width investigation (on sibling node 5995:19733) had concluded the ~2:1:1:1:1 unequal-width overlap looked like a Figma authoring artifact and kept equal `flex:1` swatches. The user pointed at a cleaner instance of the same "Color Palette" component (node 8631:53047) and confirmed the overlap is **intentional**: 5 swatches, each a full-size square, staggered so each one is offset by 1/6 of the strip's width from the previous (≈51% overlap), with the **first (leftmost) swatch on top of the z-order** and every subsequent swatch showing only its right-hand sliver. Rebuilt `.style-swatch-strip` accordingly: each `<span>` is absolutely positioned at `width:33.334%`, `left` stepping in 16.667% increments (`0/16.667/33.334/50.001/66.668%` — percentages, not Figma's raw 96/32/16px, so the fan scales with the card's actual fluid-grid width per D-095's earlier width decision), `z-index` descending 5→1 so swatch 1 renders on top, each with its own `border-radius: var(--acuity-border-radius-sm)` and `box-shadow: inset 0 0 0 0.5px rgba(0,0,0,0.1)` border (unchanged value, confirmed still correct against the new node).
Also fixed the "actual colors not reflected" complaint — traced to two more copies of the palette hex values that were never updated when D-091 changed `ds/brand-palettes.css`'s 8 presets: (1) the desktop style-widget's `const PALETTES` JS array (c3_c1/index.html ~L11998, feeds `.style-palette-card`'s swatch-strip buttons) was still the pre-D-091 placeholder hex set — updated to match D-091 exactly, plus `_currentPalette`'s default. (2) A third, independent hardcoded copy in the mobile `.palette-row` markup (8 rows, ~L6832–6887) — each row's `onclick="selectPalette(this,[...])"` array AND its 5 sibling `<div class="palette-swatch" style="background:...">` divs were both still pre-D-091 values; both were updated per row. Cross-checked ordering carefully since the mobile rows list palettes in a different order than `ds/brand-palettes.css`/`PALETTES` for the last two entries (mobile: …lime, **violet**, **forest**; CSS/JS array: …lime, **forest**, **violet**) — mapped each row by its OLD color identity, not by position, to avoid mislabeling. `.palette-row`/`.palette-swatch` (the mobile component itself) is a structurally distinct, simpler equal-width flex row, not the fan/stack pattern — left its CSS untouched, only its color values were stale.
**Rationale:** Direct user correction of D-095's swatch-width call (confirmed intentional via a cleaner reference frame) plus a genuine, separate data-staleness bug the user's "colors still not reflected" report surfaced.
**Constraints:** None.
**Implementation discretion:** Used percentage-based geometry (33.334%/16.667% steps) rather than Figma's literal 96/32/16px so the fan remains correct at any card width, consistent with D-095's decision not to hardcode a fixed card width.
**Artifacts affected:** [ ] MD [x] Figma (read only) [x] Prototype [ ] Ticket
**Supersedes:** D-095's "keep equal-width swatches" call (the width/stacking half only — D-095's background/radius token fixes and its width-120px/hover-border decisions stand unchanged). Supersedes the pre-D-091 hex values in `PALETTES` and the mobile `.palette-row` markup.
**Prototype ref:** c3_c1 only. c3_c2 has its own separate, older `PALETTES`/`.palette-row` copies not touched this session (same scoping as D-095).
**Open questions:** None.

### D-097 — .style-row__swatch (top-level Colors row preview) gets the same fan/stack treatment as .style-swatch-strip
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-23
**Decision:** `.style-row__swatch` (the small 5-swatch preview next to the top-level "Colors" row in the Styles panel list, before drilling into the palette grid) had the same pre-D-096 equal-width edge-to-edge pattern (`display:flex; overflow:hidden` container, `flex:1` spans, one shared inset border on the container) that `.style-swatch-strip` had before being fixed. Applied the identical D-096 geometry: container becomes `position:relative` with no clipping; each span is absolutely positioned at `width:33.334%`, stepped in `16.667%` `left` increments, `z-index` 5→1 (first swatch on top), each with its own `border-radius: var(--acuity-border-radius-sm)` and inset `0.5px rgba(0,0,0,0.1)` border (moved from the old shared container-level box-shadow to per-span, matching `.style-swatch-strip`). Container height kept at its own existing `28px` (vs. `.style-swatch-strip`'s `100%`/32px) — the two components have different sizes by design, only the fan geometry needed to match. No JS changes needed — both the initial render (`_buildStylePanelBodyHTML`) and the live sync (`_syncStyleWidgets`'s `[data-role="row-swatch"]` handler) already emit exactly 5 plain `<span>` children per swatch strip, which the new `:nth-child` selectors key off directly.
**Rationale:** Direct user request to bring this second swatch-preview instance in line with D-096's corrected treatment.
**Constraints:** None.
**Implementation discretion:** None — mechanical application of the already-established D-096 pattern.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** `.style-row__swatch`'s pre-D-096-style equal-width flex layout.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-098 — S2 → S5 transition slowed a further ~0.85× (uniform ×1.1765 scale)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-23
**Decision:** Scaled every duration/delay in D-075's transition by ×(1/0.85) ≈ ×1.1765 (i.e. plays at 0.85× the previous speed), same technique as D-075 itself — independent building-block durations scaled and rounded to the nearest 5ms, then dependent/invariant values (exit timing, group-finish alignment, cleanup buffer) recomputed exactly from those rounded parts rather than independently re-scaled, to avoid drift:
- `s2CentralFadeOut`: 220ms → **260ms**.
- `s2PreviewExpand`: 435ms duration/190ms delay → **510ms/225ms** (finishes at 735ms).
- `showScreen()`'s `exitMs` for `isS2ToS5`: 625 → **735ms** (kept exactly aligned with the ghost pane's new expand-finish time and Group D's new start time, same invariant as D-074/D-075).
- `#s5`'s `--s5-enter-delay-d`: 625 → **735ms**; `--s5-enter-duration-d`: 465 → **545ms**; `--s5-enter-delay-d-step`: 40 → **45ms**.
- `#s5`'s `--s5-enter-delay-ab`: 900 → **1060ms**; `--s5-enter-duration-ab`: 600 → **705ms** (finishes at 1765ms — the new total sequence length).
- `.s5-group-enter` cleanup `setTimeout`: 1600 → **1865ms** (same fixed 100ms buffer past the new 1765ms finish that D-075 used past its own 1500ms finish, not an independently-scaled number).
**Rationale:** Direct user instruction.
**Constraints:** None.
**Implementation discretion:** Same as D-075 — rounded each scaled value to the nearest 5ms; kept the cleanup timeout's buffer as a fixed +100ms margin (recomputed from the new finish time) rather than scaling the old buffer number directly, since the buffer's purpose (safety margin, not choreography pacing) doesn't need to grow proportionally.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** All of D-075's specific millisecond values (proportions/overlaps unchanged, only the overall pace).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-099 — CSP live-preview empty state built to spec (icon + heading + body, replacing plain text)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User-provided Figma link (node 7689:191538) · **Date:** 2026-09-23
**Decision:** `scheduling-page.html`'s `renderSelect()` previously rendered the zero-services empty state as a single inline-styled `<div>` reading "No services to display." Replaced with Figma's actual spec: a 55×55px fully-round `#f2f2f2` badge containing a 22×22px calendar icon, 20px gap, then a centered text block (4px gap) with heading **"No appointment types yet"** (14px/500/-0.14px, `var(--scheduler-text)`) and body **"Add a service from the panel and it will show up here."** (12px/-0.12px, `var(--scheduler-text)` at 0.6 opacity — matching this file's existing "muted via opacity, not a separate color token" convention, since it has no `--scheduler-text-muted` variable). New `.sched-empty`/`.sched-empty-icon`/`.sched-empty-text`/`.sched-empty-heading`/`.sched-empty-body` CSS classes added near `.sched-card`.
Per instruction, used the existing DS icon rather than a new/inline SVG: `ds/icons/icon-calendar.svg`, referenced via a plain relative path (`ds/icons/icon-calendar.svg` — this file lives at the repo root, sibling to `ds/`, unlike c3_c1/c3_c2 which are one level down) as a decorative `<img>` per CLAUDE.md's icon guidance (no tinting needed — Figma's icon renders as a fixed solid dark neutral, matching an untainted `currentColor`-normalized SVG viewed in isolation via `<img>`). Badge background used a raw hex (`#f2f2f2`) rather than an `--acuity-*` token, since `scheduling-page.html` is a standalone file that never loads `ds/tokens.css` — it has its own separate `--scheduler-*` variable system (dynamically written by `applyGlobalChrome()`), so CLAUDE.md's "no raw hex" rule (scoped to `components.css`/new prototype rules under the token system) doesn't apply here; this file's own existing convention is plain hex/rgba throughout.
**Rationale:** Direct user request to match this Figma node and use the existing DS icon rather than a bespoke one.
**Constraints:** None.
**Implementation discretion:** Used `var(--scheduler-font)`/`var(--scheduler-text)` (already-existing dynamic CSS custom properties set by `applyGlobalChrome()`) directly in a static CSS rule rather than inline `style="font-family:${st.font}"` per-element interpolation (the pattern used elsewhere in `renderSelect()`) — this static markup doesn't need per-render JS string interpolation since those custom properties already live on `<html>`/`:root` and stay live/reactive across palette or font changes.
**Artifacts affected:** [ ] MD [x] Figma (read only) [x] Prototype [ ] Ticket
**Supersedes:** The plain-text "No services to display." placeholder.
**Prototype ref:** `scheduling-page.html` (shared by c3_c1/c3_c2's live preview iframe).
**Open questions:** Figma exposed the icon badge's background via a variable oddly named `gray/900` that resolves to a light `#f2f2f2` (likely a mismatched/legacy variable binding in the source file, not a true dark value) — used the resolved hex as authoritative; flagging in case design intended an actual gray-900-dark badge and the Figma binding itself needs fixing upstream.

---

### D-100 — Icon-button standardization pass: style-side-panel__close, desktop-nav-close (+ new scroll behavior), s2-search-input-clear/submit, and a file-wide sweep
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Global (c3_c1) · **Triggered by:** User direction, resolved via 4 clarifying questions · **Date:** 2026-09-23
**Decision:** Extended D-093's Icon Button standardization to the three classes the user named, plus (per the user's explicit "sweep the whole file" answer) every other bespoke icon-only button found by a dedicated search pass. Confirmed approach up front: keep each class's own name (no markup/`.acuity-icon-button` class swap — same low-risk pattern as D-093's `.appt-icon-btn`), reusing DS size/variant values as local CSS.
**Named items:**
- `.style-side-panel__back`/`.style-side-panel__close` — had **zero** hover feedback previously. Already matched DS `--xs` (22px) exactly; added Subtle-variant hover (`--acuity-bg-inset`) + `border-radius: --acuity-border-radius-sm`.
- `.desktop-nav-close` — already matched DS `--lg` (44px) and its hover already equaled Subtle's (`--acuity-bg-inset`); its round `border-radius` is a deliberate, explicitly-preserved local override, not a DS token. **New behavior added** (didn't exist in code before, confirmed via search): a scroll listener (`_initDesktopNavCloseScroll`-equivalent inline block, added near `_initStyleWidgets()`) toggles `.desktop-nav-close--scrolled` on the button whenever its screen's `.wizard-body` has `scrollTop > 0`; that modifier switches the fill to the Default variant (`--acuity-bg-default` resting, `--acuity-color-neutral-gray-30` hover). Scoped to `.wizard-body` specifically per the user's own wording — S2/S5/S9 get it; S10 (no `.wizard-body`, uses `.s10-desktop-body` instead) does not, confirmed intentional.
- `.s2-search-input-clear`/`.s2-search-input-submit` — resized 24px → 28px (DS `--sm`, nearest step). Hover intentionally kept as its pre-existing color-only mechanism (muted → default fg, no background) per user decision — no DS variant does a bg-less hover, and it's used nowhere else, so no new variant was added for it.
**File-wide sweep findings (Explore agent + manual triage):**
- **Fixed (added Subtle hover, sized to nearest DS step, all confirmed to have live onclick/addEventListener wiring):** `.sheet-asset-trash` (44px→lg; no danger-red hover added, matching `.appt-icon-btn--remove`'s own plain-Subtle precedent for remove/delete actions), `.create-close` (22px, xs), `.duration-step-btn` (22px, xs — see caveat below), `.subsheet-close` (28px, sm), `.home-hamburger` (28px, sm).
- **Genuine dead code, removed:** `.avail-edit-btn` — defined twice (identical, lines ~2421 and ~3896) plus a transition rule, with **zero** matching elements anywhere in the markup (the real availability-edit pencil button uses `.appt-icon-btn appt-icon-btn--edit` instead). Removed all three blocks outright rather than leaving them disabled, consistent with this file's established "don't leave unused cruft" precedent (D-089).
- **Deliberately left alone — confirmed non-functional by design, not bugs:** `.home-sidebar-icon-btn` (Settings/Help, no onclick at all) and the `.home-calendar-icon-btn`/`.home-calendar-dropdown`/`.home-calendar-today-btn`/`.home-calendar-create-btn` group (the whole dashboard calendar toolbar mockup, no onclick on any of them) both use `cursor: default` — initially flagged by the sweep as a bug, but investigation found NEITHER has any click wiring anywhere (no `onclick`, no `addEventListener`), and the dashboard's very scope is still an open question in this file (see `Q2` in the Open Questions table: "Is the dashboard in-scope for UXT Desktop v1?"). Concluded `cursor:default` here is a deliberate "this is a static mockup, not a wired feature" signal, not an oversight — forcing `cursor:pointer`+hover onto them would misleadingly promise interactivity that doesn't exist. Left untouched.
- **Deliberately left alone — mobile-only, hover is moot:** `.contrast-pill` (dark-mode toggle) and `.swatch-fan-pill` (palette-picker trigger) live in `.s10-body` (S10's mobile-specific booking-preview mockup, a separate structure from `.s10-desktop-body`), matching the plan's stated low-priority-on-mobile stance. Hover states don't fire on touch; left as-is.
- **Deliberately left alone — already correct or a different component type:** `.avail-ellipsis-btn` (already 28px/Subtle-equivalent hover, matches `--sm` exactly, no change needed). `.s5-segment` (already has its own `--active`-modifier + hover-bg system; it's a segmented control, not a plain icon button — different semantics, standardizing it onto Subtle/Default would conflict with its existing selected-state logic).
- **Caveat on `.duration-step-btn`:** already had `cursor:pointer` + `:active` opacity feedback + `[aria-disabled]` handling (unlike the home-sidebar/calendar group), suggesting it's an unfinished real feature rather than a deliberate mockup — but it has **no click handler at all** anywhere in the file. Added the same Subtle hover treatment as every other wired button (safe, style-only), but did **not** implement the actual increment/decrement click behavior — that's a functional feature gap, out of scope for a style-standardization pass, and is called out here as a separate known gap.
- **Verification catch, fixed:** an independent verification pass found that the base rule's new `transition: background 0.12s ease` on `.duration-step-btn` was being silently overridden by a pre-existing, later, equal-specificity entry in the file's consolidated "Interactive transitions" section (`.duration-step-btn { transition: opacity 0.1s ease, color 0.15s ease; }`, inside `@media (prefers-reduced-motion: no-preference)`) — the exact same transition-shorthand-collision pattern D-093 already hit and fixed for `.appt-icon-btn`, just missed for this class initially. Fixed by adding `background 0.12s ease` to that entry's list, same remedy as D-093.
- **Left as a minor variance, not fixed:** `.sheet-desc-remove` (20px, already has its own working color-only hover, same pattern as the search-input clear/submit) — 2px off DS's `--xs` (22px); not worth the risk of a mid-precision resize for a component that's already functioning correctly and consistently with an already-accepted local pattern.
**Rationale:** Direct user request, escalating (per the user's own explicit choice) from 3 named classes to a full-file sweep.
**Constraints:** None.
**Implementation discretion:** Distinguished "no hover state" (a real bug, fixed) from "no onclick wiring + deliberate cursor:default" (a scope signal, not a bug, left alone) by checking each candidate's actual JS wiring before touching its CSS — this distinction wasn't explicitly asked about, but treating every match from the sweep as an automatic fix would have wrongly implied functionality on several dashboard mockup elements whose very existence-in-scope is still an open question in this file.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-093 is extended, not replaced. `.avail-edit-btn`'s dead CSS is removed outright.
**Prototype ref:** c3_c1 only.
**Open questions:** Whether `.duration-step-btn`'s actual +/- click behavior should be implemented as a follow-up (functional gap, not styling); whether the dashboard (`s_home`) and its calendar toolbar are ever meant to become interactive, which would change the `.home-sidebar-icon-btn`/`.home-calendar-*` group's `cursor:default` from correct-as-is to needing the same fix applied here — tracked under the pre-existing `Q2` open question, not newly introduced by this entry.

---

### D-101 — s2-search-input-clear/-submit swapped from hand-drawn inline SVGs to Rosetta/DS icons
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-23
**Decision:** Both buttons previously inlined bespoke hand-drawn `<svg>` markup (a custom "X" cross for Clear, a custom horizontal arrow for Submit) rather than using the Rosetta icon library, unlike the search icon two lines above them in the same input group (already `.acuity-icon acuity-icon--md` + `icon-search.svg`). Replaced both with the `.acuity-icon` utility pattern per CLAUDE.md's icon convention: Clear → `icon-cross-sm.svg` (the pre-Rosetta alias for "Cross Small," `.acuity-icon--xs`, matching the old inline SVG's 12px visual size); Submit → `icon-arrow-right.svg` (`.acuity-icon--sm`, matching the old inline SVG's 14px visual size and its exact horizontal-arrow shape — Rosetta's arrow-right glyph is effectively identical to the hand-drawn path it replaces). Both icons already ship `fill="currentColor"`, so they correctly inherit each button's own `color` (muted at rest, `--acuity-fg-default` on hover) with no extra CSS needed — no `svg`-specific rule existed for either class to clean up.
**Rationale:** Direct user request to use Rosetta/DS icons instead of inline hand-drawn SVGs.
**Constraints:** None.
**Implementation discretion:** Kept the glyph sizes exactly as they were (xs/sm) rather than bumping them to match the group's `--md` search icon — the request was to swap the icon *source*, not to resize them, and resizing wasn't asked for.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** The two inline hand-drawn `<svg>` blocks, removed entirely.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

---

### D-102 — S9 ellipsis-menu popover fixed: was being clipped by .wizard-body's overflow, not actually flipping visibly
**Status:** Decided · **Binding scope:** Bugfix · **Scope:** Local · **Triggered by:** User bug report · **Date:** 2026-09-23
**Decision:** `openAvailDayMenu()` (the S9 day-row "..." menu, `.avail-ellipsis-btn`) already computed a viewport-relative "is there room below" check and correctly branched to flip above the trigger — the flip *math* was never wrong. The actual bug: the popover was appended as a child of `#s9-avail-grid` with `position: absolute`, and `.wizard-body` (its ancestor) has `overflow-y: auto; overflow-x: hidden`. Any part of the popover extending past `.wizard-body`'s own scrolled/clipped box was silently cut off by that overflow — regardless of whether the flip math said there was room in the actual browser viewport, and regardless of the flip direction chosen, since both "below" and "above" placements are still descendants of the same clipping ancestor.
Fixed by converting the popover to a **portal**: appended to `document.body` (not `#s9-avail-grid`) with `position: fixed` (not `absolute`), positioned directly from `triggerEl.getBoundingClientRect()`'s viewport coordinates — no `gridRect`/`topRel`/`leftRel` math needed anymore, since `position:fixed` on a `<body>` child is viewport-relative by definition and immune to any scrollable ancestor's `overflow`. Horizontal clamping switched from `gridRect.width` to `window.innerWidth`; the vertical flip-above branch also gained a `Math.max(8, …)` floor (previously could theoretically position off the top edge with no clamp, mirroring the horizontal clamp's existing floor). `.avail-popover`'s CSS: `position: absolute` → `fixed`; also opportunistically fixed two adjacent drift issues while touching this rule — `background: white` → `var(--acuity-bg-base)` (identical value, `#ffffff`) and `z-index: 200` (raw number) → `var(--acuity-z-popover)` (700), per CLAUDE.md's z-index/no-raw-hex conventions.
**Rationale:** Direct user bug report, confirmed via code tracing (no ancestor `position:relative` issue — `.s9-avail-grid` does have it — but the `overflow-y:auto` clipping ancestor was the real cause).
**Constraints:** None.
**Implementation discretion:** Chose the portal/fixed-positioning pattern (standard fix for "dropdown clipped by scrollable ancestor") over alternatives like temporarily setting `overflow: visible` on `.wizard-body` while the menu is open — the portal approach is more robust (works regardless of how many scrollable ancestors exist) and doesn't risk visually exposing other overflowing content in `.wizard-body` while the menu is open.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** The absolute/grid-relative positioning math in `openAvailDayMenu()`.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

---

### D-103 — Styles side panel: height now JS-driven and transitions smoothly on open and on every in-panel view switch
**Status:** Decided · **Binding scope:** Bugfix · **Scope:** Local · **Triggered by:** User bug report · **Date:** 2026-09-23
**Decision:** `.style-side-panel--open` set `height: fit-content; max-height: 60vh;` directly via the CSS class toggle — not in the panel's `transition:` list (only `width` was). Two consequences: (1) on initial open, height snapped to the list view's fit-content size the instant the class was added, while width animated over 280ms, so height wasn't "persistent"/smooth alongside the width expand; (2) far more visibly, `_styleWidgetShowView()` (drilling into Colors/Font/Misc, or going back to the list) just toggles `hidden` on `.style-view` children — with the parent sized via `fit-content`, switching to a view with a different natural height caused an instant resize pop every single time, since nothing there was ever animated at all.
Fixed by making `.style-side-panel__body`'s height JS-driven (explicit px, via a new `transition: height 280ms cubic-bezier(.2,.8,.2,1)`, matching the panel's own width-transition timing) instead of `fit-content`:
- New helper `_measureStyleViewHeight(body, view)` returns `view.scrollHeight` plus `body`'s own vertical padding (read via `getComputedStyle`, not hardcoded, so it stays correct if the padding token ever changes).
- `_styleWidgetShowView()` gained a 4th `animateHeight = true` parameter. When true (the default — used by in-panel navigation, `_styleWidgetOpenSection`/`_styleWidgetBack`), it freezes `body.style.height` at its current rendered px value *before* swapping which view is visible, then (after a double-`requestAnimationFrame`, so the browser registers the frozen "before" state first) sets it to the new view's measured height — giving the transition a real start and end point to animate between.
- `toggleStyleWidget()` calls `_styleWidgetShowView(panel, 'list', false, false)` for the initial reset — `animateHeight=false` here, since the panel isn't open/visible yet (width still 0) and measuring anything at that point would just capture a zero-width box's artificially-tall wrapped-text height. Instead, `toggleStyleWidget()` itself sets `body.style.height = '0px'` up front, then — inside the same double-rAF that adds `.style-side-panel--open` (kicking off the width transition) — measures and applies the list view's real height (now correctly measured at the panel's true 280px target width, since layout queries reflect the just-applied class synchronously even though the paint interpolates), so width and height expand together from the very start.
The OUTER `.style-side-panel`'s own `height: fit-content` rule was left untouched — since it wraps a header (fixed height) plus the now-explicitly-animated body, it naturally tracks the body's live height every frame during the transition without needing its own explicit height logic.
**Rationale:** Direct user bug report ("height needs to be persistent throughout the transition").
**Constraints:** None.
**Implementation discretion:** Chose JS-measured explicit height (the standard technique for animating between two different non-zero "auto" heights, which plain CSS can't interpolate on its own) over the codebase's more common `grid-template-rows: 0fr↔1fr` trick, since that trick is built for binary collapsed/expanded states, not for smoothly interpolating between several different non-zero content heights (list vs. colors vs. fonts vs. misc).
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** The instant `fit-content`-driven height snap on both open and in-panel view switches.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-104 — Hover-feedback transitions softened (longer duration + ease-out) across the file and ds/components.css
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Global (ds + c3_c1) · **Triggered by:** User direction · **Date:** 2026-09-23
**Decision:** Identified every CSS rule whose `:hover` state changes `background`/`color`/`border-color` (27 hover rules found via direct grep, cross-referenced against their base rule's own `transition:` declaration — not a blind property-name sweep) and softened the corresponding `background`/`color`/`border-color` transition terms: durations bumped one step up a fixed scale (`0.1s/100ms→0.15s/150ms`, `0.12s/120ms→0.18s/180ms`, `0.15s/150ms→0.2s/200ms`, `0.2s/200ms→0.25s/250ms`, `280ms` kept, curve only), and the easing function changed from plain `ease` (or no easing keyword at all, e.g. `background 0.15s, border-color 0.15s`) to `ease-out` uniformly. Applied via a scoped Python regex targeting only `(background|color|border-color) <duration> [ease]` tokens — never touching `opacity`/`transform`/`width`/`grid-template-rows` terms that happen to sit in the same compound `transition:` list (e.g. `.appt-icon-btn`'s `opacity 0.1s ease, background 0.12s ease` → only the `background` term changed, `opacity` untouched, since that opacity is `:active` press-feedback, a different concern from hover).
Applied identically to `ds/components.css` (`.acuity-button`, `.acuity-icon-button`, `.acuity-chip`, `.acuity-radio-card`, etc.) so the shared DS component hovers match the same softened feel as the prototype-local ones.
A few non-`:hover`-triggered background/color/border-color transitions incidentally matched the same regex (`.appt-card`, `.toggle-track`, `.edit-overlay`, `.palette-row`, `.avail-day-circle`) since the scope was "this property+duration signature," not a strict `:hover`-only filter — left as-softened rather than reverted, since softening a same-family quick-chrome-feedback transition a little further is low-risk and consistent with the broader intent, even where the trigger is a class-toggle/selection rather than literal `:hover`.
**Rationale:** Direct user request ("hover animations should be slightly softer across hover most states").
**Constraints:** None.
**Implementation discretion:** Picked `ease-out` (standard "gentle deceleration" curve) and a ~1.4-1.5× duration bump as "slightly softer" — not given exact target numbers, so used a consistent, defensible scale rather than an arbitrary one-off per class.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** All prior hover-transition duration/easing values in both files.
**Prototype ref:** `ds/components.css` (shared) + `c3_c1/index.html`. Not applied to c3_c2's own local styles.
**Open questions:** None.

### D-105 — scheduling-page.html: theme-variable-driven colors now transition instead of snapping
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-23
**Decision:** `applyGlobalChrome(st)` rewrites `--scheduler-bg`/`--scheduler-text`/`--scheduler-accent`/`--scheduler-border`/etc. on `:root` whenever the Customize panel's palette, mode, or other style controls change, but no consuming element had a `transition:` declared, so every pick snapped instantly. Added `transition: background-color 0.2s ease-out, color 0.2s ease-out, border-color 0.2s ease-out;` to the file's existing universal reset rule (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`, now extended rather than a new rule added) — the simplest way to cover every current and future `--scheduler-*` consumer without hand-listing each selector. `font-family` was deliberately excluded: CSS cannot interpolate between two different fonts, so a `transition: font-family` declaration would be syntactically valid but visually inert — noted in a comment so a future reader doesn't wonder why it's missing.
Font/palette changes only visibly transition for **persistent** DOM nodes (page background, header/nav text, business name/logo, buttons) — `renderSelect()` fully replaces the services list via `innerHTML` on every state change, so individual service cards are always freshly-created elements with no "previous" paint to transition from (a `transition` never animates an element's very first computed style). This isn't a visible gap in practice, though, since `.sched-card`'s own background already equals the page's background color — there's no color seam between the "instantly-correct" new cards and the smoothly-transitioning page around them.
**Rationale:** Direct user request that "scheduling page animations should be a transition too when picking font, color, and making general changes."
**Constraints:** None.
**Implementation discretion:** Used a blanket `*` rule rather than hand-listing every `--scheduler-*`-consuming selector (60+ found), since the request was framed broadly ("general changes on the styles panel") and a universal rule is the only way to guarantee that stays true for future style controls too, at negligible risk given this file's simple static-list structure (no component library with node-identity-sensitive animations to conflict with).
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A — first transition added to theme-variable consumers in this file.
**Prototype ref:** `scheduling-page.html` (shared by c3_c1/c3_c2's live preview iframe).
**Open questions:** Whether the service-card list should move from full `innerHTML` replacement to a diffing/keyed-update approach so individual cards can also visibly transition their own colors on a palette change — a real architectural change, out of scope for this pass, flagged here since it's the direct cause of the one case this fix doesn't cover.

---

### D-106 — Style panel follow-ups: initial-open height too tall, height popped on close, and view state not persisted across close/reopen
**Status:** Decided · **Binding scope:** Bugfix · **Scope:** Local · **Triggered by:** User bug report on D-103 · **Date:** 2026-09-23
**Decision:** Three issues reported after D-103 shipped, all fixed:
1. **Initial-open height measured too tall.** `toggleStyleWidget()` measured the list view's `scrollHeight` in the *same* frame it added both `.style-side-panel--open` and `.s5-preview-pane--panel-open` — the latter can itself reflow/resize `.s5-preview-pane` (making room for the now-open panel), and measuring before that reflow settled produced a taller-than-actual reading (extra text-wrapping at a transiently-narrower width). Fixed by wrapping the measurement in one additional `requestAnimationFrame`, so it runs a frame after both classes' layout effects have registered. This explains why "navigating back and forth" already looked correct — `_styleWidgetOpenSection`/`_styleWidgetBack` run this measurement long after the panel and preview pane have both fully settled, never hitting the race.
2. **Height popped taller during the close transition.** `.style-side-panel--open` was the only rule setting `height: fit-content; max-height: 60vh` — removing that class on close reverted the outer panel to the base rule's old `bottom: var(--acuity-spacing-48)` inset (a tall, position:absolute top+bottom stretch), instantly popping it taller for the ~280ms the width transition took to reach 0, i.e. while it was still visibly shrinking. Fixed by moving `height: fit-content; max-height: 60vh` onto the unconditional base `.style-side-panel` rule and deleting `bottom` from it entirely (once `height` is always explicit, `bottom` is over-constrained/ignored per CSS spec anyway, so keeping it around served no purpose). Now the outer box's fit-content sizing — which continuously tracks the JS-driven `.style-side-panel__body` height from D-103 — stays in effect through both open AND close, so there's no instant popped-taller frame on close.
3. **Navigation state not persisted across close/reopen.** `toggleStyleWidget()` always called `_styleWidgetShowView(panel, 'list', …)` on open, regardless of which view was showing when the panel was last closed. Fixed by having `_styleWidgetShowView()` record `panel.dataset.lastView = viewName` on every call (unconditional, regardless of `animateHeight`), and having `toggleStyleWidget()` read `panel.dataset.lastView || 'list'` as the view to restore, using that value everywhere 'list' was previously hardcoded (the reset call, and the measurement's view lookup). Stored on the panel element itself (not a shared/global variable) so S5's and S9's independent panel instances each remember their own last view.
**Rationale:** Direct user bug reports following up on D-103.
**Constraints:** None.
**Implementation discretion:** Deleted `bottom` from the base rule rather than leaving it in place alongside the now-unconditional `height` — CSS would have ignored it as over-constrained either way, but leaving a dead, misleading positioning property around invites a future reader to wonder what it does.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-103's `toggleStyleWidget()` measurement timing (now one frame later) and the `.style-side-panel`/`.style-side-panel--open` height/bottom split (now unconditional on the base rule).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-107 — D-106's "inflated initial height" fix didn't work; real cause was measuring during the width transition itself, not a reflow-settling race
**Status:** Decided · **Binding scope:** Bugfix · **Scope:** Local · **Triggered by:** User follow-up report that D-106 item 1 was still broken · **Date:** 2026-09-23
**Decision:** D-106's fix (wait one more `requestAnimationFrame` before measuring, on the theory that `.s5-preview-pane--panel-open`'s reflow needed a frame to settle) did not fix the bug, which pointed to the theory being wrong. Root-caused properly this time by comparing why the in-panel view-switch path (`_styleWidgetOpenSection`/`_styleWidgetBack`, via `_styleWidgetShowView`) has always measured correctly while the initial-open path (`toggleStyleWidget`) hadn't: the panel's own `width: 0 → 280px` transition is **only actively running during initial open** — during an in-panel switch the panel is already stably at 280px, so there's no competing transition to race. On open, a synchronous `scrollHeight` read taken shortly after adding `.style-side-panel--open` reflects whatever width the transition happens to be mid-flight at (much narrower than 280px for a long stretch of the 280ms transition, causing far more text-wrapping than final), not the eventual settled width — and no small number of extra `requestAnimationFrame` waits fixes this, since the transition itself takes 280ms (~17 frames) to finish, not one.
Fixed by decoupling measurement from the live transition entirely: new `_measureStyleViewHeightAtOpenWidth(panel, body, view)` temporarily sets `panel.style.transition = 'none'`, adds `.style-side-panel--open` (jumping width to 280px **instantly**, no animation), forces a reflow (`void panel.offsetWidth`), takes the measurement via the existing `_measureStyleViewHeight()`, then removes the class, forces another reflow, and restores the real transition — all synchronously, with no `requestAnimationFrame`/`setTimeout` anywhere in the sequence, so nothing ever paints mid-peek and there's no visible flash. `toggleStyleWidget()` now calls this **synchronously, up front**, before the double-rAF that performs the real (visually animated) `--open` class add — storing the correct target height in a local `targetHeight` and applying it inside the double-rAF alongside the real class add, so both properties still start animating together. This removed the extra (ineffective) third-level `requestAnimationFrame` D-106 had added around the measurement.
**Rationale:** Direct user follow-up report that item 1 of D-106 remained broken; re-diagnosed rather than adding another speculative delay.
**Constraints:** None.
**Implementation discretion:** Left `_styleWidgetShowView()`'s own (already-correct) in-panel-switch measurement untouched — it was never subject to this bug, since it only ever runs once the panel is already stably at 280px, so "fixing" it further wasn't needed and risked introducing a regression into a path that already worked.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-106's extra-rAF fix for the initial-open measurement (removed, replaced by the synchronous transition-suppressed peek).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-108 — "Show business name and logo" checkbox added below the uploaded logo
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User-provided Figma link (node 7689:192068) + a clarifying question on uncheck behavior · **Date:** 2026-09-24
**Decision:** Per Figma, the Styles panel's Misc/"Name & Logo" section has a single checkbox — verbatim label **"Show business name and logo"**, checked by default — sitting directly below the uploaded-logo asset card, present only once a logo exists. Figma's own mockup only showed the checked state; the user confirmed unchecking should **show the logo only** (hide just the business name text, keep the logo visible) rather than hiding both.
Implemented as a new prototype-local component `.style-misc-checkbox` (native checkbox input, visually hidden via opacity+1px sizing but still focusable/keyboard-operable, driving a custom 16×16 box + checkmark via the adjacent-sibling `:checked` selector — the standard accessible-checkbox pattern) since this is the first true checkbox (square+tick) needed anywhere in the file — the one prior checkbox input in the codebase (`#avail-setup-toggle-input`) is actually an iOS-style toggle switch, a different visual, so it wasn't reused. Kept local (not promoted to `ds/components.css`) for the same reason `.style-misc-input`/`.style-misc-logo-upload` are local — this is scoped to the Misc section's own one-off fields, matching existing sibling precedent.
Wiring: new `state.showBusinessName` (default `true`), gated visible/hidden alongside the logo asset card in `_syncStyleWidgets()` (same `hasLogo` check), toggled via new `onStyleWidgetShowNameChange(checked)`, included in the preview postMessage payload as `showBusinessName`. In `scheduling-page.html`, `sched-business-name`'s hidden logic gained `hideForLogoOnly = !!st.businessLogo && !st.showBusinessName` alongside the existing `!hasName` check — the logo (`sched-business-logo`) itself is untouched by this flag, always showing whenever `businessLogo` is set, regardless of the checkbox. Reset to `true` both by `resetStyleSection('misc')` and by `_removeStyleLogo()` (so a future re-upload always starts from the default-checked state rather than remembering a stale unchecked value from a previously-removed logo).
**Rationale:** Direct user request to match this Figma component, with the one behavioral gap Figma didn't show (uncheck) resolved via direct question.
**Constraints:** None.
**Implementation discretion:** Checkbox visual tokens approximated from Figma's description (solid dark-filled square + white tick, rounded corner) using existing tokens (`--acuity-color-neutral-gray-100` for the checked fill, `--acuity-fg-on-strong` for the tick, `--acuity-border-radius-xs` for the corner) rather than Figma's raw `#0E0E0E`/unresolved corner-radius values, which the research pass flagged as not cleanly resolvable via the API for the specific `Checkmark` leaf node.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A — new control, no prior behavior.
**Prototype ref:** `c3_c1/index.html` (Styles panel Misc section) + `scheduling-page.html` (name/logo display logic).
**Open questions:** None.

### D-109 — Panel height re-adapts when the D-108 checkbox appears/disappears
**Status:** Decided · **Binding scope:** Bugfix · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-24
**Decision:** D-108's checkbox is toggled visible/hidden from `_syncStyleWidgets()` (via the `hasLogo` check, alongside the logo asset card), not from `_styleWidgetShowView()`'s view-switch path — so uploading/removing a logo while the panel is already open and showing Misc changed the section's content height without ever re-triggering D-103's height animation, leaving dead space (checkbox appearing didn't grow the panel) or clipped content.
Fixed by adding the same freeze/measure/set sequence `_styleWidgetShowView()` already uses on a real view switch, run at the end of `_syncStyleWidgets()`: for every currently-**open** `.style-side-panel` whose `dataset.lastView` (D-106) is `'misc'`, freeze `.style-side-panel__body`'s height at its current rendered value, then (after a double-`requestAnimationFrame`) re-measure the Misc view via the existing `_measureStyleViewHeight()` and set the new target — so the panel smoothly grows/shrinks to hug the checkbox appearing or disappearing, exactly like drilling into a different section does.
This measurement is safe to take synchronously/immediately (no D-107-style transition-suppression trick needed) because it only ever runs on a panel that's already open and stably at its 280px width — never during the initial-open width transition, which was the actual hazard D-107 fixed.
**Rationale:** Direct user request.
**Constraints:** None.
**Implementation discretion:** Scoped the check to `panel.dataset.lastView !== 'misc'` (skip otherwise) rather than adding a dedicated "logo changed" event/flag — `_syncStyleWidgets()` runs frequently (palette/font/mode picks too), but re-measuring Misc's height to the same value it already has is a harmless no-op, so a coarser "only when Misc is the visible view" gate was simpler than threading a more precise "did the logo state actually change" signal through every caller.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A — extends D-103's mechanism to a trigger path it didn't originally cover.
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-110 — .sched-list gets 48px padding and no box-shadow when the service list is empty
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-24
**Decision:** New `.sched-list--empty` modifier (`padding: 48px; box-shadow: none;`) toggled by `renderSelect()`: added when the zero-services empty-state (D-099) renders, removed in both the skeleton branch and the normal (non-empty) render branch, so it never lingers across a state change. `.sched-list`'s base rule (padding 0, card box-shadow) is unchanged for the skeleton/populated states.
**Rationale:** Direct user request.
**Constraints:** None.
**Implementation discretion:** None — straightforward class toggle at each of `renderSelect()`'s three existing branches.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A.
**Prototype ref:** `scheduling-page.html`.
**Open questions:** None.

### D-111 — Per-service CSP skeleton (D-084) actually wired up: skeletonServiceId was sent but never consumed
**Status:** Decided · **Binding scope:** Bugfix · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-24
**Decision:** D-084 designed a per-service live-preview skeleton for just-created inline appointments — `c3_c1`'s preview payload has always correctly included `skeletonServiceId: state._inlineCreatePreviewSkeletonId || null` (set in `createApptInline()`, cleared on the appointment's first real edit in `_syncEditPreview()`, or on auto-delete-on-close) — but `scheduling-page.html`'s `renderSelect()` never actually read `st.skeletonServiceId` anywhere; the whole mechanism was inert on the rendering side since D-084 shipped.
Fixed by adding a per-item check at the top of `renderSelect()`'s `st.services.map(svc => ...)` callback: if `svc.id === st.skeletonServiceId`, that one card renders the same `.sched-card--skeleton`/`.sk-bar` markup the whole-list loading skeleton already uses (skeleton name bar + meta bar + button bar inside `.sched-card-body`), in place among the other normally-rendered cards, instead of its real (still empty-name/45-min-default) values. Every other service in the list is unaffected.
**Rationale:** Direct user request to complete this already-designed-but-never-finished mechanism.
**Constraints:** None.
**Implementation discretion:** Reused the exact whole-list skeleton markup verbatim (same classes) rather than a new pattern, since a single skeleton card slotted into the list should look identical to the loading-state skeleton card that already exists.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** N/A — completes D-084, doesn't change its design.
**Prototype ref:** `scheduling-page.html`. (`c3_c1/index.html`'s side of this mechanism — `state._inlineCreatePreviewSkeletonId`, `createApptInline()`, `_syncEditPreview()` — was already correct and untouched.)
**Open questions:** None.

### D-112 — S10 page preview hugs scheduling-page.html's real content height instead of a fixed px
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-24
**Decision:** `.s10-page-preview` (the zoomed-out embed of `scheduling-page.html` on S10) previously had a hardcoded `height: 520px` with `overflow: hidden` — an arbitrary value unrelated to the actual rendered page, clipping or leaving empty space depending on real content length. Fixed by having the iframe report its own true content height across the frame boundary and having the parent size both the iframe and its container from that reported value, rather than any fixed px or viewport-relative (vh) unit:
- `scheduling-page.html`: new `_reportContentHeight()`, called at the end of `applyState()` (so it fires after every render — initial load, and every `preview-update` from the parent). Early-returns if not embedded (`window.parent === window`, so this is a no-op when the file is opened standalone). Inside a `requestAnimationFrame` (letting the just-applied render settle before measuring), reads `document.documentElement.scrollHeight` and posts `{ type: 'content-height', height: h }` to the parent.
- `c3_c1/index.html`: new top-level `message` listener filters for `type === 'content-height'`, confirms `e.source === iframeEl.contentWindow` for `#s10-preview-iframe` specifically (S5's and S9's own preview iframes embed the same file and would also fire this message — the source check is what scopes this to only the S10 instance, since only S10 asked for this "hug content" treatment; S5/S9 keep their existing fixed preview-pane layouts untouched). Reads `--s10-preview-zoom` via `getComputedStyle` (rather than hardcoding a duplicate `0.8`, staying in sync with the CSS source of truth) and sets the iframe's own height to the raw reported value and the container's height to that value scaled by zoom — so the visually-scaled content exactly fills the container with no clipping and no dead space.
- CSS: `.s10-page-preview`'s `height: 520px` → `min-height: 200px` (a placeholder for the brief window before the first report arrives, not a real constraint). `.s10-page-preview-iframe`'s `height: calc(100% / var(--s10-preview-zoom))` left in place as a same-purpose fallback, superseded by the JS-set inline height the moment a report lands (inline styles always win over stylesheet rules regardless of specificity).
**Rationale:** Direct user request — the preview should reflect the real built page, not a value tied to viewport or an arbitrary constant.
**Constraints:** None.
**Implementation discretion:** Used the existing one-way postMessage channel's established pattern/style (already used for `preview-update`/`scroll-hint`/`preview-ready`) for the new reverse (iframe→parent) direction, rather than direct `iframe.contentDocument` access — same-origin `file://` access to nested iframe documents is inconsistent across browsers, and this codebase never relies on it elsewhere.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** The fixed 520px height and its associated clipping.
**Prototype ref:** `c3_c1/index.html` (S10 preview only) + `scheduling-page.html`.
**Open questions:** None.

### D-113 — S10 page still adapted to viewport height (D-112 follow-up) + Done/× nav merged into one button
**Status:** Decided · **Binding scope:** Bugfix + intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-24
**Decision:** Two changes, requested together:
1. **D-112 follow-up.** The page preview was still compressing/clipping on browser resize rather than letting the page scroll, because the real constraint was several layers up from anything D-112 touched: `html, body { height: var(--app-viewport-height, 100%); overflow: hidden; }` (a deliberate, global, app-wide rule — "the document itself should never be scrollable, only internal `.wizard-body`/`.screen-body` regions scroll," specifically to protect against mobile-keyboard viewport-resize scroll drift) — plus `#s10.screen.active { height: 100dvh; overflow: hidden; }` and `.s10-desktop-body`/`.s10-preview-pane`'s `flex:1; min-height:0;` (+`overflow:hidden` on the body wrapper), all forcing S10 to compress to fit whatever viewport height was available rather than growing to its natural content height.
   Fixed with a scoped exception rather than changing the global rule: `html:has(#s10.screen.active), body:has(#s10.screen.active) { height: auto; min-height: var(--app-viewport-height, 100%); overflow: visible; }` — only S10 opts out of the app-wide "document never scrolls" rule; every other screen keeps the original fixed-viewport/no-scroll/mobile-keyboard-safe behavior untouched. `#s10.screen.active`'s `height:100dvh` → `min-height:100dvh` (floor, not ceiling) with `overflow:hidden` removed. `.s10-desktop-body` and `.s10-preview-pane` both had their `min-height:0` removed (that's what was overriding flex's default "don't shrink below content" protection) and `.s10-desktop-body`'s `overflow:hidden` removed — both now hug their real content height and let it push the page taller when needed, exactly like `scheduling-page.html`'s own content does inside the iframe.
2. **Done/× nav merge.** S10's top-nav previously had two separate controls (`.desktop-nav-text` "Done" + `.desktop-nav-close` "×", wrapped in a `.s10-desktop-nav-actions` flex-group purely to keep them together against `.desktop-top-nav`'s `space-between`) — per D-056, kept separate because Figma showed them that way, even though both always resolved to the same `showScreen('s_home')` action. Merged into a single `.desktop-nav-done` button (label span + trailing `.acuity-icon` using `icon-cross-sm.svg`, matching D-101's precedent of using the Rosetta icon over a hand-drawn inline SVG). The now-unnecessary `.s10-desktop-nav-actions` wrapper (div + CSS rule) was removed entirely — `.desktop-top-nav`'s existing `space-between` correctly places the logo and the single Done button at opposite ends with no wrapper needed. `.desktop-nav-close` itself (the class, still used standalone by S2/S5/S9 as confirmed via grep) was left completely untouched.
**Rationale:** Direct user request for both changes.
**Constraints:** None.
**Implementation discretion:** Used `:has()` for the scoped html/body exception rather than a JS-toggled class — this codebase's earlier D-100 verification pass already confirmed zero existing `:has()` usage anywhere in the file, but it's well-supported in current browsers and avoids adding new JS just to toggle a class on `<html>`/`<body>` per active screen.
A follow-up verification pass flagged that `.app` (the wrapper between `body` and every `.screen`, including `#s10`) also has a base-level `overflow: hidden` that wasn't part of the initial fix. It doesn't currently clip anything — `.app` only ever gets `min-height` (never a fixed `height`) at any breakpoint, so it has no fixed box for S10's grown content to overflow — but it's an unscoped landmine: any future change giving `.app` an explicit `height` while S10 is active would silently reintroduce clipping with no obvious cause. Added the same defensive exception: `.app:has(#s10.screen.active) { overflow: visible; }`.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** D-112 (extends its fix; D-112's own postMessage/height-reporting mechanism is unchanged and still correct — this entry fixes the *outer* layers D-112 didn't reach). D-056 (the "kept as a separate pair" decision, explicitly reversed per this session's direct instruction).
**Prototype ref:** c3_c1 only.
**Open questions:** None.

### D-114 — S9: CSP scroll-hint lands 12px above .sched-block-eyebrow; "different setups" toggle debounces + animates the card expand/collapse
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** User direction · **Date:** 2026-09-24
**Decision:**
1. **Scroll-hint anchor.** `scheduling-page.html`'s `scroll-hint` postMessage handler previously scrolled to a fixed guessed pixel value (`e.data.top`, `140`, sent by `c3_c1`'s `_scrollS9PreviewDown()`). Changed to compute the target live off the DOM instead: `document.querySelector('.sched-view:not([hidden]) .sched-block-eyebrow')`'s `getBoundingClientRect().top + window.scrollY - 12` — landing the scroll exactly 12px above the currently-active view's eyebrow label (S9's preview uses the "datetime" view, whose eyebrow reads "Appointment"), correct regardless of future content/layout changes above it. `e.data.top` is kept as a fallback only if no eyebrow element is found.
2. **"Different setups" toggle debounce + animation.** `toggleAvailDifferentSetups()` previously committed `state.availDifferentSetups` and called `renderAvailCards()` (a full `innerHTML` swap of `#s9-avail-cards`, no transition) synchronously on every checkbox change. Split into a debounced wrapper: the checkbox's own native checked-state still flips instantly (can't delay that without hijacking the click), but the actual state commit + re-render now waits 150ms (`clearTimeout`/`setTimeout`), so a quick back-and-forth flip only commits/animates the value that's still current after the debounce window, not every intermediate state. The commit path (renamed `_commitAvailDifferentSetups()`) now calls a new `_renderAvailCardsAnimated()` instead of the plain `renderAvailCards()` — reusing the same freeze/measure/set height-transition technique already established for the Styles panel (D-103/D-107): freeze `#s9-avail-cards`'s current height, let `renderAvailCards()` do its normal instant innerHTML swap, then (after a double-rAF) measure the new natural height and transition to it, resetting back to auto height on `transitionend` so future renders aren't stuck at a stale fixed px. `.s9-avail-cards` gained `overflow: hidden` (so the animating height genuinely clips not-yet-revealed cards, rather than them all being instantly visible regardless of the container's current animated size) and `transition: height 260ms cubic-bezier(.2,.8,.2,1)`. `renderAvailCards()` itself is untouched and still used as-is by every other caller (initial load, card open/close, etc.) — only this one toggle-triggered path opts into the animated wrapper.
**Rationale:** Direct user request for both changes.
**Constraints:** None.
**Implementation discretion:** Chose 150ms for the debounce ("quick") and reused the exact D-103/D-107 height-transition pattern rather than inventing a new animation technique, for consistency with an already-proven mechanism in this codebase. No transition-suppression trick was needed here (unlike D-107) since nothing else concurrently transitions `#s9-avail-cards`.
**Artifacts affected:** [ ] MD [ ] Figma [x] Prototype [ ] Ticket
**Supersedes:** The fixed-pixel `scroll-hint` target; the instant, unanimated toggle-triggered re-render.
**Prototype ref:** `c3_c1/index.html` + `scheduling-page.html`.
**Open questions:** None.

---

### D-115 — S10 Share modal rebuilt against 5 Figma frames (landing/customizing/updated/changing-destination/direct-link-disabled)
**Status:** Decided · **Binding scope:** Intended behavior · **Scope:** Local · **Triggered by:** 5 user-provided Figma links, resolved via 3 clarifying questions · **Date:** 2026-09-24
**Decision:** Pulled all 5 frames (nodes 8054:362080/361784/362203/361725/362305) and diffed each against the actual built dialog rather than re-speccing from scratch. Confirmed deltas, all implemented:
1. **Scope switcher relocated.** Moved out of the dialog body (was a labeled `<select id="share-scope-select">`) into the header as a plain muted text+chevron trigger (`#share-scope-trigger`), opening a new floating menu (`#share-scope-menu`, built fresh per open by `_buildShareScopeMenuHTML()`) showing "General Scheduling Page" (checkmark if selected) → divider → non-interactive "Appointment types" group label → one row per selected appointment (checkmark if selected). Chevron rotates 180° while open. Outside-click and Escape both close it (Escape closes the menu before the whole dialog if both are "open," via priority ordering in the existing ESC-candidates array).
2. **"Page link" label now scope-aware.** Reads "Page link" for General, "Page link (‹Appointment Name›)" otherwise (Frame 5) — not implemented at all before.
3. **Edit-slug pencil hidden (not just left clickable) for non-general scopes** — only the main page can have a custom slug (Frame 5, previously a confirmed missing feature: `onShareScopeChange()` never touched it).
4. **Full `https://` protocol prefix** now shown in the readonly URL field (Frames 1/3) and written by `saveSlug()` (`https://${value}.as.me`, previously bare `${value}.as.me`).
5. **QR download button disabled while the slug editor is open** (Frame 2), re-enabled on close regardless of Save vs. Cancel.
6. **Slug field starts empty** (per user decision, matching Figma exactly) rather than pre-filled with the current slug — shows the current slug as a `placeholder` instead (computed from `urlDisplay.dataset.baseUrl`, stripping the protocol/`.as.me` suffix, not from `.value` which could carry a stale appointmentType query string) so context isn't fully lost. Gained a new inline clear/✕ button inside the field (shown via an `input` listener once there's text) — per user decision, in *addition* to the existing Cancel button, not instead of it (Figma's frame only showed Save + inline clear, but removing Cancel outright was judged an unwanted affordance loss).
7. **`.share-more-actions` (Embed in website / Send to phone / Post on social) removed entirely** — markup, CSS (`.share-more-actions`, `.share-action-row`, `.share-action-row__chevron`), all deleted. (This was actually already found and `display:none`'d in an earlier pass this session per a pre-existing comment citing "all 6 share-modal variants hide this section" — this decision finishes the job by deleting it outright per explicit user confirmation, rather than leaving it dark-but-present.)
Also removed now-dead `_s10SlugDraft` (no longer needed — since the field always starts empty, Cancel has nothing to "restore," it just closes) and the `share-scope-select` DOM lookups throughout, replaced by a plain `_shareScope` module-level variable.
**Rationale:** Direct user request to match all 5 Figma frames; 3 genuine ambiguities (more-actions block, Cancel button, field prefill) resolved via direct question rather than guessed, since each was a real behavior fork with no clear Figma-only answer.
**Constraints:** None.
**Implementation discretion:** Kept "Copy" (not "Copy link", which Frame 4 alone showed) for the copy button's label, since 3 of the 4 relevant frames used "Copy" — flagged as a minor design-copy inconsistency in the source Figma file itself, not something to resolve unilaterally.
**Artifacts affected:** [ ] MD [ ] Figma (read only) [x] Prototype [ ] Ticket
**Supersedes:** The `<select>`-based scope switcher, the always-visible/never-hidden edit-pencil, the protocol-less URL display, the pre-filled slug editor, and the `.share-more-actions` block (fully deleted, not just hidden).
**Prototype ref:** c3_c1 only.
**Open questions:** Whether "Copy" vs. "Copy link" button copy should be reconciled in the source Figma file itself (not blocking, cosmetic).

---

## Follow-up actions needed (not yet Decided, but not purely Open either)

- **F13/F14 (D-019/D-020):** confirm real file-size/type guardrails for C5 and logo upload with eng/product before locking as spec — current prototype values (1.5 MB / 20 MB / 600×120px / JPEG+GIF+PNG) are placeholders, not confirmed limits.
- **F30 (D-034):** pull the exact desktop-first breakpoint values "from the prior design session" into this file — they're referenced but not yet captured here.
- **F21 (D-024):** confirm with engineering whether timezone is actually being auto-detected in code today, or simply not surfaced at all — current evidence only confirms the UI is absent, not that detection logic exists.

---

## Open questions (unresolved)

| ID | Screen | Question | Raised by |
|----|--------|----------|-----------|
| F29 | S2 | Should S2's Skip route through the same exit-confirmation + logging pattern as S1? | Audit |
| Q2 | Flow-level (`s_loading_home`/`s_home`) | Is the dashboard in-scope for UXT Desktop v1, or an adjacent/pre-existing surface the flow lands on? | Audit (original "Questions for me," not addressed in this reconciliation pass) |
| Q3 | C01–C05 (create dialog) | Is the irregular progress ladder (filled widths 25/125/250/379.6/500 of a 520px track ≈ 5/24/48/73/96%) a deliberate design choice, or un-snapped rectangles in Figma? Built as-drawn per D-077; if incidental, an even 20/40/60/80/100 is the better build. | D-077 (Sep 21 Figma-match pass) |

---

## Resolved Decisions — Input Log (verbatim, highest source-of-truth tier)

The bullets below are reproduced verbatim as given, per instruction, as the authoritative input this file reconciles against AUDIT-c3_c2.md. Where this log's D-XXX entries phrase things differently, the intent is elaboration, not deviation — this block is the record of what was actually decided.

- M1 — Intended: maintain a stable Figma file reference in the decision log going forward.
- M2 — Decided, Intended: c3_c2 represents Variant B only. Variant C (taxonomy chips, S3.a/S3.b) is a separate design, not part of this file.
- M3 — Intended (process): commit prototype code and decision docs to git going forward; no more untracked handoff artifacts.
- F1 — Intended: exit-confirmation dialog ("Are you sure you want to exit?") gates Skip/×/close on S1 whenever the user has made an edit.
- F2 — Intended: S2 has no chip row (not even placeholder) for Variant B — matches "agnostic placeholders, no chip logic" decision.
- F3 — Intended: S2 shows a live "0/150" character counter by default, matching current Figma.
- F4 — Intended: empty Next submit behaves like Skip. CORRECTION to audit: fallback is the generic template set, not the Beauty vertical — audit's finding text was inaccurate on this point.
- F5 — Intended: S2 business-name input uses a fixed 44px font; the three-tier shrink ladder (64/44/32) is retired.
- F6 — Intended: S4 loading copy reads "Generating appointments."
- F7 — SPLIT: (a) Intended — reassurance copy ("Still working…" / "Almost there…") should trigger during genuinely slow loads. (b) Prototype-only — the fixed 2000ms auto-advance timer is a prototype stand-in, not a production value; real production timing is async-completion-driven, not fixed.
- F8 — Intended: 3-appointment cap enforced consistently on both suggestion-add and create-new paths.
- F9 — Intended: C1 disables Next until title is non-empty.
- F10 — Intended: extend the same title-required gating to the edit-appointment sheet (currently only C1 has it).
- F11 — Intended: negative/non-numeric price entry on C4 clamps to 0 silently (no additional error state needed).
- F12 — Intended: no-vertical pricing path shows $0, flat un-tiered grid, no badge — matches Figma's "Fallback/generic" C04 frame.
- F13 — Intended (requirement): client-side file type/size validation must happen before processing on C5 image upload. Exact limits are NOT yet confirmed as spec — see Follow-up actions.
- F14 — Intended: C5 image upload and logo upload intentionally have separate, independently-tuned limits (not unified). Exact values pending F13 follow-up confirmation.
- F15 — Intended: typed duration entry is intentionally free (1-min floor, no ceiling, no 15-min grid snap) — differs from the +/- stepper by design.
- F16 — Intended: logo uploader accepts PNG/JPEG/GIF with a 600×120px dimension cap — both intentional.
- F17 — RESOLVED by D-091 (2026-09-22): the 5-color-mode `COLOR_MODE_TABLE` mechanism (already implemented pre-F17) is now spec-matched against Figma node 7689:192111's mode rule table, not a placeholder. No further architecture change needed — the mechanism itself (5 role-mapped modes over a palette's swatches) was already the right shape; only its concrete role values needed correcting.
- F18 — Prototype-only: hardcoded palette/font arrays in the booking-page preview are a known gap (should use --brand-* tokens per CLAUDE.md eventually) but not being fixed now — do not treat current implementation as spec either way.
- F19 — Intended: extend the modal-dialog pattern (scrim, focus trap, role="dialog", aria-modal) established by the S1 exit-confirmation dialog to the C1–C5 create-appointment sub-flow.
- F21 — Intended: timezone is auto-detected from the user's system, not user-editable, no picker in this flow.
- F22 — Intended: "Setup different availabilities for different appointments" toggle seeds one availability card per selected appointment once 2+ appointments are selected.
- F23 — Intended: finishing setup via S10 does NOT show an account-creation loading screen; that screen only appears on early exits (S1/S2 skip, S9 desktop ×). Keep as currently implemented.
- F24 — Intended: "Link copied!" must be backed by a real Clipboard API call, not decorative. Current prototype implementation (no clipboard call) does not meet spec.
- F25 — Intended: fix the share-link so the displayed/copyable URL matches what "Open scheduling page" actually opens (the real custom preview), not a hardcoded placeholder.
- F26 — Decided, Intended: the entire "Keep exploring" module on S10 is deferred to a future experiment — do not ship any version of it (including "Customize intake forms") in this flow.
- F27 — Intended: account-creation failure needs a real error/retry state designed now — currently the only irreversible server operation in the flow with zero error handling.
- F28 — Intended: dashboard setup-progress checklist must reflect real completion state, not a hardcoded 0%.
- F29 — OPEN: whether S2's Skip should route through the same exit-confirmation + submission-logging pattern as S1 needs product/analytics input before deciding.
- F30 — Decided, Intended: remove mobile-first CSS scaffolding; replace with the desktop-first breakpoints defined in the prior design session. Mobile-web is out of scope for this experiment.
- F31 — Intended: on unmatched business description, silently substitute the generic catalog with no user-facing indication that it's a fallback — matches the agreed AI-failure-fallback decision.

---

## Not yet reconciled — still lives only in the deprecated docs

The 33 findings resolved above (M1–M3, F1–F31) were the subset of AUDIT-c3_c2.md that reached a decision in this session. Checking against the source docs directly: HANDOFF.md contains 28 numbered open items and a full Section 3 (Component Mapping) and Section 4 (Accessibility); MISSING-STATES-SPEC.md contains 55 checklist items (`CL-01`–`CL-55`). Only a subset of each was ever promoted to an F-number, so only that subset is Decided here. **The following has not been migrated, resolved, or discarded — it remains real, tracked debt, not silently superseded:**

- **HANDOFF.md §3, Component Mapping** — the full Figma-component-to-prototype-class table (Button Special, Icon Button, Info Chip, Text Input, Skeleton, Progress Indicator, Toggle, Tabs, Header/Footer, availability Item/Edit, Toast, AI badge, etc.). Only the create-dialog modal pattern (D-033) came from this table; the rest of the "not mapped" list is untouched.
- **HANDOFF.md §4, Accessibility** — most of this was reconfirmed still-accurate by this audit's verification pass (zero `:focus-visible` rules, zero `aria-live`/`role="alert"`, ~9 unconditional `aria-hidden` containers wrapping real buttons, ~29 non-semantic `onclick` div/span targets, several contrast failures, missing `<h1>`/`<main>` on wizard screens) and is noted in one summary line under Global System Constraints, but none of it was turned into individual F-numbers, so none of it has a Decided/Open status here.
- **Open questions from HANDOFF.md not carried into the 33 resolved items**, including: duplicate/unique appointment names; C1 title length cap; AI-regenerate-limit copy; business-name length cap; S9 end-before-start and overlapping-range validation; whether S9's "Finish" should gate on zero availability; whether the browser Back button should step back through the wizard; whether wizard state should survive a page refresh; and whether Code Connect mappings should be established before build.
- **MISSING-STATES-SPEC.md checklist items not tied to one of the 33 resolved findings**, including the Figma-side corrections it logged but deliberately didn't apply (`CL-46`–`CL-55`: stale "of 5" step labels on non-Variant-B frames, the "up to 5 services" copy, missing danger/warning color variables, the "creating account" instance naming mismatch, 372 hidden layers needing an audit, and the non-advancing progress-indicator variants).

None of the above should be assumed resolved, and none should be assumed abandoned — they simply haven't gone through a decision pass yet. A follow-up reconciliation session is needed before HANDOFF.md/MISSING-STATES-SPEC.md can be fully retired.

## Deprecation note

HANDOFF.md and MISSING-STATES-SPEC.md are deprecated as **living working documents** — do not edit them further; new decisions belong in this file. They are **not yet fully superseded**: the content listed immediately above under "Not yet reconciled" still exists only in those two files and has not been migrated, resolved, or discarded. Until a follow-up pass closes that gap, treat HANDOFF.md/MISSING-STATES-SPEC.md as frozen reference material for that remaining content, and treat this file as authoritative for everything it explicitly covers (D-001 through D-034).
