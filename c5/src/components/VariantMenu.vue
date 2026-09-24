<script setup>
import { computed, ref } from 'vue';
import { useVariantStore } from '../stores/variants.js';

const store = useVariantStore();
const open = ref(false);

const presets = computed(() => store.manifest.presets);
const screenVariants = computed(() => store.currentScreen?.variants ?? []);
const slotGroups = computed(() =>
  (store.currentScreen?.slots ?? []).map((slotId) => {
    const component = store.manifest.components.find((c) => c.id === slotId);
    return { id: slotId, label: component.label, variants: component.variants };
  }),
);

function copyLink() {
  navigator.clipboard?.writeText(window.location.href);
}
</script>

<template>
  <div class="variant-menu">
    <button
      type="button"
      class="acuity-icon-button acuity-icon-button--secondary acuity-icon-button--lg variant-menu__toggle"
      :aria-label="`Variants: ${store.presetId} · ${store.screenId}${store.isModified ? ' · Modified' : ''}`"
      @click="open = !open"
    >
      <span class="acuity-icon acuity-icon--md" style="--icon: url('/ds/icons/icon-adjust.svg')" />
      <span v-if="store.isModified" class="variant-menu__dot" />
    </button>

    <div class="acuity-dialog-backdrop acuity-dialog-backdrop--bottom" :class="{ 'acuity-dialog-backdrop--visible': open }" @click.self="open = false">
      <div class="acuity-dialog acuity-dialog--md">
        <div class="acuity-dialog__header">
          <div>
            <h2 class="acuity-dialog__title">Variants</h2>
            <p class="acuity-dialog__description">{{ store.presetId }} · {{ store.screenId }}<span v-if="store.isModified"> · Modified</span></p>
          </div>
          <button type="button" class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm" aria-label="Close" @click="open = false">
            <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-cross-lg.svg')" />
          </button>
        </div>
        <div class="acuity-dialog__body">
          <section class="variant-menu__tier">
            <h3 class="text-label">Concept variant</h3>
            <div class="variant-menu__options">
              <button
                v-for="preset in presets"
                :key="preset.key"
                type="button"
                class="acuity-chip acuity-chip--md acuity-chip--interactive"
                :class="{ 'acuity-chip--selected': preset.key === store.presetId }"
                @click="store.selectPreset(preset.key)"
              >
                {{ preset.label }}
              </button>
              <button
                v-if="store.isModified"
                type="button"
                class="acuity-button acuity-button--tertiary acuity-button--sm"
                @click="store.clearOverrides()"
              >
                Reset to preset
              </button>
            </div>
          </section>

          <section class="variant-menu__tier">
            <h3 class="text-label">Screen variant — {{ store.currentScreen?.label }}</h3>
            <p v-if="screenVariants.length <= 1" class="text-caption variant-menu__empty">Only one variant</p>
            <div v-else class="variant-menu__options">
              <button
                v-for="variant in screenVariants"
                :key="variant.key"
                type="button"
                class="acuity-chip acuity-chip--md acuity-chip--interactive"
                :class="{ 'acuity-chip--selected': variant.key === store.resolved.screens[store.screenId] }"
                @click="store.setScreenVariant(store.screenId, variant.key)"
              >
                {{ variant.label }}
              </button>
            </div>
          </section>

          <section class="variant-menu__tier">
            <h3 class="text-label">Component variants</h3>
            <p v-if="!slotGroups.length" class="text-caption variant-menu__empty">No component variants on this screen</p>
            <div v-for="group in slotGroups" :key="group.id" class="variant-menu__slot-group">
              <p class="text-caption variant-menu__slot-label">{{ group.label }}</p>
              <div class="variant-menu__options">
                <button
                  v-for="variant in group.variants"
                  :key="variant.key"
                  type="button"
                  class="acuity-chip acuity-chip--md acuity-chip--interactive"
                  :class="{ 'acuity-chip--selected': variant.key === store.resolved.slots[group.id] }"
                  @click="store.setSlotVariant(group.id, variant.key)"
                >
                  {{ variant.label }}
                </button>
              </div>
            </div>
          </section>
        </div>
        <div class="acuity-dialog__footer">
          <button type="button" class="acuity-button acuity-button--secondary acuity-button--sm" @click="copyLink">Copy link</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.variant-menu__toggle {
  /* Fixed to the middle-right edge, clear of both .acuity-top-nav (full-width
     row: back/title/action) and .acuity-bottom-nav (full-width CTA) — a
     top or bottom corner collides with one of those on some screen. */
  position: fixed;
  top: 50%;
  right: var(--acuity-spacing-16);
  transform: translateY(-50%);
  z-index: var(--acuity-z-sheet);
  box-shadow: var(--acuity-shadow-light-200);
}
.variant-menu__dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--acuity-fg-brand);
  border: var(--acuity-border-width-default) solid var(--acuity-bg-base);
}
.variant-menu__tier + .variant-menu__tier {
  margin-top: var(--acuity-spacing-24);
}
.variant-menu__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--acuity-spacing-8);
  margin-top: var(--acuity-spacing-8);
}
.variant-menu__empty {
  margin-top: var(--acuity-spacing-8);
}
.variant-menu__slot-group + .variant-menu__slot-group {
  margin-top: var(--acuity-spacing-16);
}
.variant-menu__slot-label {
  margin-top: var(--acuity-spacing-8);
}
</style>
