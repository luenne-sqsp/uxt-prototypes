import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import manifest from '../variants.json';
import { resolveCombination, canonicalizeOverrides } from '../resolve.js';
import { encodeOverrides, decodeOverrides } from '../variantUrl.js';

// Eagerly imported: this is a design prototype with a handful of screens, so
// instant variant swaps (no async flicker) matter more than code-splitting.
const screenModules = import.meta.glob('../screens/**/*.vue', { eager: true });
const componentModules = import.meta.glob('../components/**/*.vue', { eager: true });

function loadComponent(modules, relPath) {
  const key = Object.keys(modules).find((k) => k.endsWith(relPath));
  if (!key) throw new Error(`[variants] no module found for "${relPath}"`);
  return modules[key].default;
}

export const useVariantStore = defineStore('variants', () => {
  const route = useRoute();
  const router = useRouter();

  const presetId = computed(() => route.params.presetId ?? manifest.defaultPreset);
  const screenId = computed(() => route.params.screenId ?? manifest.entryScreen);
  const overrides = computed(() => decodeOverrides(route.query.o));

  const resolved = computed(() =>
    resolveCombination(manifest, presetId.value, overrides.value),
  );

  const currentScreen = computed(() =>
    manifest.screens.find((s) => s.id === screenId.value),
  );

  const isModified = computed(() => Object.keys(overrides.value).length > 0);

  function screenComponent(id) {
    const screen = manifest.screens.find((s) => s.id === id);
    const variant = screen.variants.find((v) => v.key === resolved.value.screens[id]);
    return loadComponent(screenModules, variant.component);
  }

  function slotComponent(id) {
    const component = manifest.components.find((c) => c.id === id);
    const variant = component.variants.find((v) => v.key === resolved.value.slots[id]);
    return loadComponent(componentModules, variant.component);
  }

  function navigateTo(nextScreenId, { replace = false } = {}) {
    const query = { ...route.query };
    const method = replace ? 'replace' : 'push';
    router[method]({ path: `/${presetId.value}/${nextScreenId}`, query });
  }

  function applyOverrides(next) {
    const clean = canonicalizeOverrides(manifest, presetId.value, next);
    const query = { ...route.query };
    const encoded = encodeOverrides(manifest, clean);
    if (encoded) query.o = encoded;
    else delete query.o;
    router.replace({ path: route.path, query });
  }

  function setScreenVariant(id, key) {
    applyOverrides({ ...overrides.value, [id]: key });
  }

  function setSlotVariant(id, key) {
    applyOverrides({ ...overrides.value, [id]: key });
  }

  function selectPreset(nextPresetId) {
    router.replace({ path: `/${nextPresetId}/${screenId.value}`, query: {} });
  }

  function clearOverrides() {
    router.replace({ path: route.path, query: {} });
  }

  return {
    manifest,
    presetId,
    screenId,
    overrides,
    resolved,
    currentScreen,
    isModified,
    screenComponent,
    slotComponent,
    navigateTo,
    setScreenVariant,
    setSlotVariant,
    selectPreset,
    clearOverrides,
  };
});
