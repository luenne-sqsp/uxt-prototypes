import { defineStore } from 'pinia';
import { ref } from 'vue';

// The "customize your booking page" state from S10's style widget
// (_currentPalette/_currentFont/_s10DarkMode, c3_c1/index.html:11395-11397).
// Rather than porting a parallel PALETTES/FONTS JS table, this reads the
// real presets already shipped in ds/brand-palettes.css / ds/brand-fonts.css
// via `data-brand-palette`/`data-brand-font` — one source of truth, and new
// presets added to those files show up here for free.
export const PALETTE_OPTIONS = [
  { key: 'neutral', label: 'Neutral' },
  { key: 'orchid', label: 'Orchid' },
  { key: 'desert', label: 'Desert' },
  { key: 'meadow', label: 'Meadow' },
  { key: 'sunset', label: 'Sunset' },
  { key: 'lime', label: 'Lime' },
  { key: 'forest', label: 'Forest' },
  { key: 'violet', label: 'Violet' },
];

export const FONT_OPTIONS = [
  { key: 'source-sans-pro', label: 'Source Sans Pro' },
  { key: 'poppins', label: 'Poppins' },
  { key: 'raleway', label: 'Raleway' },
  { key: 'quicksand', label: 'Quicksand' },
  { key: 'oswald', label: 'Oswald' },
  { key: 'playfair-display', label: 'Playfair Display' },
  { key: 'concert-one', label: 'Concert One' },
  { key: 'ibm-plex-mono', label: 'IBM Plex Mono' },
];

// Reads the 5 --brand-palette-* custom properties for a given preset key
// straight from ds/brand-palettes.css, via a throwaway element — avoids
// hand-copying hex values into JS that would drift from the CSS source.
export function resolvePaletteHexes(key) {
  const el = document.createElement('div');
  el.setAttribute('data-brand-palette', key);
  el.style.display = 'none';
  document.body.appendChild(el);
  const cs = getComputedStyle(el);
  const hexes = [1, 2, 3, 4, 5].map((n) => cs.getPropertyValue(`--brand-palette-${n}`).trim());
  document.body.removeChild(el);
  return hexes;
}

// Same technique as resolvePaletteHexes(), for ds/brand-fonts.css.
export function resolveFontFamily(key) {
  const el = document.createElement('div');
  el.setAttribute('data-brand-font', key);
  el.style.display = 'none';
  document.body.appendChild(el);
  const family = getComputedStyle(el).getPropertyValue('--brand-font-family').trim();
  document.body.removeChild(el);
  return family;
}

export const useThemeStore = defineStore('theme', () => {
  const paletteKey = ref('neutral');
  const fontKey = ref('source-sans-pro');
  const dark = ref(false);

  return { paletteKey, fontKey, dark, PALETTE_OPTIONS, FONT_OPTIONS };
});
