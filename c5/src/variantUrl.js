// Encodes/decodes the ?o= override query param. Deliberately not
// URLSearchParams (its form-urlencoded serializer would percent-escape ':'
// and ',', turning a short readable link into noise) — vue-router's own
// query stringifier leaves both characters alone.

export function encodeOverrides(manifest, overrides) {
  const order = [...manifest.screens.map((s) => s.id), ...manifest.components.map((c) => c.id)];
  const entries = Object.entries(overrides).sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );
  if (!entries.length) return undefined;
  return entries.map(([k, v]) => `${k}:${v}`).join(',');
}

export function decodeOverrides(raw) {
  if (!raw || typeof raw !== 'string') return {};
  const out = {};
  for (const pair of raw.split(',')) {
    const [key, value] = pair.split(':');
    if (key && value) out[key] = value;
  }
  return out;
}
