<script setup>
import { ref } from 'vue';
import { useThemeStore, PALETTE_OPTIONS, FONT_OPTIONS } from '../../stores/theme.js';

// Ported from the style-pickers-row (c3_c1/index.html:2845) — swatch-fan
// pill, font pill, and contrast (dark mode) toggle. Opens two small sheets
// instead of the original's #palette-overlay/#font-overlay.
const theme = useThemeStore();
const paletteOpen = ref(false);
const fontOpen = ref(false);
</script>

<template>
  <div class="style-row">
    <button
      type="button"
      class="acuity-icon-button acuity-icon-button--secondary style-row__pill"
      aria-label="Choose color theme"
      @click="paletteOpen = true"
    >
      <span class="style-row__fan" :data-brand-palette="theme.paletteKey">
        <span class="style-row__swatch" style="background: var(--brand-palette-1)" />
        <span class="style-row__swatch" style="background: var(--brand-palette-2)" />
        <span class="style-row__swatch" style="background: var(--brand-palette-3)" />
        <span class="style-row__swatch" style="background: var(--brand-palette-4)" />
        <span class="style-row__swatch" style="background: var(--brand-palette-5)" />
      </span>
    </button>

    <button
      type="button"
      class="acuity-icon-button acuity-icon-button--secondary style-row__pill style-row__font-pill"
      aria-label="Choose font"
      @click="fontOpen = true"
    >
      <span class="style-row__font-aa" :data-brand-font="theme.fontKey" :style="{ fontFamily: 'var(--brand-font-family)' }">Aa</span>
      <span class="text-caption">{{ FONT_OPTIONS.find((f) => f.key === theme.fontKey)?.label }}</span>
    </button>

    <button
      type="button"
      class="acuity-icon-button style-row__pill"
      :class="theme.dark ? 'acuity-icon-button--primary' : 'acuity-icon-button--secondary'"
      aria-label="Toggle dark mode"
      @click="theme.dark = !theme.dark"
    >
      <span class="acuity-icon acuity-icon--md" style="--icon: url('/ds/icons/icon-contrast.svg')" />
    </button>

    <div class="acuity-dialog-backdrop acuity-dialog-backdrop--bottom" :class="{ 'acuity-dialog-backdrop--visible': paletteOpen }" @click.self="paletteOpen = false">
      <div class="acuity-dialog acuity-dialog--md">
        <div class="acuity-dialog__header">
          <h2 class="acuity-dialog__title">Color theme</h2>
          <button type="button" class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm" aria-label="Close" @click="paletteOpen = false">
            <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-cross-lg.svg')" />
          </button>
        </div>
        <div class="acuity-dialog__body style-row__options">
          <button
            v-for="opt in PALETTE_OPTIONS"
            :key="opt.key"
            type="button"
            class="acuity-card acuity-card--padding-md acuity-card--interactive style-row__option"
            :class="{ 'style-row__option--selected': theme.paletteKey === opt.key }"
            @click="theme.paletteKey = opt.key; paletteOpen = false"
          >
            <span class="style-row__fan" :data-brand-palette="opt.key">
              <span class="style-row__swatch" style="background: var(--brand-palette-1)" />
              <span class="style-row__swatch" style="background: var(--brand-palette-3)" />
              <span class="style-row__swatch" style="background: var(--brand-palette-5)" />
            </span>
            <span class="text-caption">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="acuity-dialog-backdrop acuity-dialog-backdrop--bottom" :class="{ 'acuity-dialog-backdrop--visible': fontOpen }" @click.self="fontOpen = false">
      <div class="acuity-dialog acuity-dialog--md">
        <div class="acuity-dialog__header">
          <h2 class="acuity-dialog__title">Font</h2>
          <button type="button" class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm" aria-label="Close" @click="fontOpen = false">
            <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-cross-lg.svg')" />
          </button>
        </div>
        <div class="acuity-dialog__body style-row__font-list">
          <button
            v-for="opt in FONT_OPTIONS"
            :key="opt.key"
            type="button"
            class="acuity-mini-row style-row__font-option"
            :class="{ 'style-row__option--selected': theme.fontKey === opt.key }"
            @click="theme.fontKey = opt.key; fontOpen = false"
          >
            <span class="style-row__font-aa" :data-brand-font="opt.key" :style="{ fontFamily: 'var(--brand-font-family)' }">Aa</span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.style-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--acuity-spacing-12);
  padding: var(--acuity-spacing-12) var(--acuity-spacing-24) var(--acuity-spacing-16);
}
.style-row__pill {
  height: 44px;
  width: 44px;
}
.style-row__font-pill {
  width: auto;
  gap: var(--acuity-spacing-8);
  padding: 0 var(--acuity-spacing-12);
}
.style-row__fan {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.style-row__swatch {
  width: 16px;
  height: 6px;
  border-radius: 2px;
  border: var(--acuity-border-width-hairline) solid var(--acuity-border-muted);
}
.style-row__font-aa {
  font-size: 16px;
  font-weight: var(--acuity-font-weight-semibold);
}
.style-row__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--acuity-spacing-12);
}
.style-row__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--acuity-spacing-8);
  flex: 1 0 calc(33% - var(--acuity-spacing-8));
  cursor: pointer;
}
.style-row__option--selected {
  border-color: var(--acuity-border-brand);
}
.style-row__font-list {
  display: flex;
  flex-direction: column;
}
.style-row__font-option {
  gap: var(--acuity-spacing-12);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}
</style>
