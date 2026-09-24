# Acuity industry → appointment template system

A normalized, three-file source model plus a build step. Every active brand
category ID resolves to a template set (placeholder + name chips + appointments),
using a three-tier confidence model so nothing is ever unmatched.

## Files

| file | role | edit by hand? |
|---|---|---|
| `industry_ids.json` | mirror of the system's active brand categories, all languages | no (regenerate from source) |
| `service_types.json` | atomic appointment definitions, keyed `svc_*` | yes — change once, applies everywhere |
| `template_sets.json` | 142 sets (123 specific + 18 archetype + 1 generic); each references `svc_*` ids | yes |
| `industry_mapping.json` | every industry ID → one template set slug | yes — one line to re-point an industry |
| `build_runtime.py` | stitches the above into the runtime file | — |
| `runtime_industry_templates.json` | **generated** — fully expanded, ready for the app | no (it's output) |
| `coverage_report.txt` | where every industry landed | — |

## The three tiers

1. **specific** — a tailored set (e.g. `hair_salon`, `massage`, `legal`). 235 industries.
2. **archetype** — a themed set based on *booking pattern*, not industry
   (e.g. `arch_medical_visit`, `arch_home_estimate`, `arch_sports_practice`). 495 industries, 18 themes.
3. **generic** — universal fallback for genuinely un-bookable categories. 344 industries.

Because every active ID is mapped, the search system always resolves to a
usable template — the escape-hatch philosophy, end to end.

## Why normalized (service types as building blocks)

An appointment like "Discovery Call · 30 min · $0" is defined **once** in
`service_types.json` and referenced by every set that uses it. Change the
duration in one place and it updates everywhere. It also lets a set mix-and-match
across families — e.g. a Yoga Retreat set can reference both `svc_*` yoga-practice
appointments and retreat-booking ones.

## How to make common edits

- **Change an appointment's price/duration** → edit it in `service_types.json`.
- **Re-point an industry to a different set** → change its value in `industry_mapping.json`.
- **Adjust a set's chips or appointment lineup** → edit `template_sets.json`
  (appointments are a list of `svc_*` ids).
- **Add a new appointment** → add it to `service_types.json`, then reference its id.

After any edit: `python3 build_runtime.py` to regenerate `runtime_industry_templates.json`.

## Notes / decisions baked in

- Class-heavy businesses (Yoga, Pilates, Dance, Music, Martial Arts, etc.) and the
  `classes_workshops` archetype use a **1:1 booking model** (Private Lesson,
  Small Group Session, Intro/Trial, Assessment) plus a fixed-size Group Session —
  since class features aren't in this experiment yet.
- Cuisine restaurants collapse to `arch_restaurants_experiences` (reservation,
  private dining, chef's table, tasting) rather than per-cuisine sets.
- Individual/team sports collapse to `arch_sports_practice` (coaching/practice model).
- `create_desc_ghost` has been removed everywhere for this phase.
- Deprecated brand categories (106) are excluded; only the 1,074 active ones are mapped.

See `coverage_report.txt` for the full per-set breakdown.
