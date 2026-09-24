// Pure variant-combination resolver. No Vue, no router — takes the manifest
// plus a preset id and a flat overrides map, returns which variant key wins
// for every screen and slot. See stores/variants.js for the reactive layer
// that feeds this from the current route.

/**
 * @typedef {{ kind: string, key: string, requested?: string }} Problem
 * @typedef {{
 *   presetId: string,
 *   screens: Record<string, string>,
 *   slots: Record<string, string>,
 *   overrides: Record<string, string>,
 *   problems: Problem[],
 * }} Resolved
 */

/** @returns {Resolved} */
export function resolveCombination(manifest, presetId, overrides = {}) {
  const problems = [];
  const screens = { ...manifest.base.screens };
  const slots = { ...manifest.base.slots };

  const preset = manifest.presets.find((p) => p.key === presetId);
  if (!preset) {
    problems.push({ kind: 'unknown-preset', key: presetId });
  } else {
    Object.assign(screens, preset.screens);
    Object.assign(slots, preset.slots);
  }

  const screenIds = new Set(manifest.screens.map((s) => s.id));
  const slotIds = new Set(manifest.components.map((c) => c.id));

  for (const [key, value] of Object.entries(overrides)) {
    if (screenIds.has(key)) {
      screens[key] = value;
    } else if (slotIds.has(key)) {
      slots[key] = value;
    } else {
      problems.push({ kind: 'unknown-key', key });
    }
  }

  for (const screen of manifest.screens) {
    const validKeys = new Set(screen.variants.map((v) => v.key));
    if (!validKeys.has(screens[screen.id])) {
      problems.push({ kind: 'unknown-variant', key: screen.id, requested: screens[screen.id] });
      screens[screen.id] = screen.variants[0].key;
    }
  }
  for (const component of manifest.components) {
    const validKeys = new Set(component.variants.map((v) => v.key));
    if (!validKeys.has(slots[component.id])) {
      problems.push({ kind: 'unknown-variant', key: component.id, requested: slots[component.id] });
      slots[component.id] = component.variants[0].key;
    }
  }

  // Applicability pass runs last: a slot variant may declare appliesTo,
  // restricting it to specific already-resolved screen variants.
  for (const component of manifest.components) {
    const chosen = component.variants.find((v) => v.key === slots[component.id]);
    if (chosen?.appliesTo) {
      const ok = Object.entries(chosen.appliesTo).every(
        ([screenId, allowed]) => allowed.includes(screens[screenId]),
      );
      if (!ok) {
        problems.push({ kind: 'not-applicable', key: component.id, requested: chosen.key });
        slots[component.id] = component.variants[0].key;
      }
    }
  }

  return { presetId, screens, slots, overrides, problems };
}

/** Drops override entries that match what the preset already resolves to. */
export function canonicalizeOverrides(manifest, presetId, overrides) {
  const withoutOverrides = resolveCombination(manifest, presetId, {});
  const next = {};
  for (const [key, value] of Object.entries(overrides)) {
    const current = withoutOverrides.screens[key] ?? withoutOverrides.slots[key];
    if (current !== value) next[key] = value;
  }
  return next;
}
