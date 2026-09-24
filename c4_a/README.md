# C04-A — Description to Booking Page

Mobile-web onboarding prototype where a user describes their service business in plain language and a (mocked) AI builds a draft booking page.

## What this concept demonstrates

Instead of stepping through industry → specialization → service-builder forms, the user types one sentence ("I'm a dog groomer offering baths and full grooms…") and the AI extracts services, durations, prices, and follow-up gaps in one shot. Compared with c3_a / c3_b, the contrast is conversational entry + targeted follow-ups vs. catalog-first selection.

## Running

Open `index.html` directly in a browser, or from the repo root navigate to the C04-A link in `index.html`. No build step. Mobile width: 480px max, designed for 390×844 viewport.

## The 5 screens

| id | What it does |
|---|---|
| `s1` | Entry — multi-line description input + Continue. |
| `s2` | Follow-up Q&A — only visited when the parser couldn't find a business name or hours signal. Each question gets a labeled input. |
| `s3` | Parsing — ~1.1s sequenced loader: "Identifying your services…" → ✓ → "Detecting durations and pricing…" → ✓ → "Drafting your booking page…" → ✓ → auto-advance to s4. |
| `s4` | Draft — a live mini-preview of the booking page (header + service rows), tap any service to edit, or open the bottom drawer for Customize / Edit services / Settings. |
| `s5` | Published — success state with a fake `book.acuity.com/<slug>` URL, Copy link, Open booking page (new tab into `scheduling-page.html`), and a stub "Continue customizing in Acuity" link. |

## Mocked AI

All in `index.html` under `<script>`:

- **`ARCHETYPES`** (top of script): hand-authored `groomer`, `hair`, `tutor`, `generic`. Each has `keywords[]`, default `services[]`, `hours`, and `defaultName`. Edit copy here.
- **`parseDescription(text)`**: keyword-matches in order `groomer → hair → tutor → generic`, then heuristically detects a business name (`"called X"`, `"my business is X"`, `"I run X"`, leading capitalized phrase) and hours signal (day-of-week or `am`/`pm`). Returns either `{status:'complete', …}` or `{status:'needs_info', questions:[…], …}`.

## Known limitations of the mock

- No real LLM call. Anything outside the 4 archetype keyword sets falls back to the generic 3-service draft.
- The name/hours heuristics are simple regex. Capitalized common nouns at the start of a sentence may be misread as business names.
- No service images. Real Acuity allows photos per service; the prototype skips that affordance.
- "Continue customizing in Acuity" on s5 is a stub `alert()`.
- Palette and font pickers are reused from the design system but do not persist across reloads.
- Copy-link copies a fake `https://book.acuity.com/<slug>` string to the clipboard — the URL doesn't resolve.

## Files

- `index.html` — the prototype (screens, drawer, state, mock parser).
- `scheduling-page.html` — verbatim copy of `c3_a/scheduling-page.html`. Reads URLSearchParams (`services`, `businessName`, `hours`, `palette`, `font`, `dark`) and renders the customer-facing booking page.
