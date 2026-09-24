<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useThemeStore, PALETTE_OPTIONS, FONT_OPTIONS } from '../stores/theme.js';

// Ported from c3_c1's floating style-widget dropdown (_buildStyleDropdownHTML,
// index.html:11817), used on S5/S9/S10 desktop. Colors + Fonts tabs are
// ported; the Misc tab (business name, logo upload, 8-way button-style
// picker) is not — this port has no logo-upload or button-style feature
// anywhere else either, so adding it only here would be new scope, not a
// port. A dark-mode row is added at the bottom of Colors instead of the
// original's per-palette hover-to-preview-dark overlay, whose exact
// interaction (preview vs. commit) wasn't clear enough to reproduce
// faithfully — this keeps the same underlying capability (S10 mobile's
// contrast-pill) reachable from desktop too.
const theme = useThemeStore();
const open = ref(false);
const tab = ref('colors');
const root = ref(null);

function onDocClick(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false;
}
onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<template>
  <div ref="root" class="style-widget desktop-only">
    <button
      type="button"
      class="style-widget-trigger"
      :aria-expanded="open"
      aria-haspopup="true"
      aria-label="Customize colors and fonts"
      @click="open = !open"
    >
      <span class="style-widget__aa" :data-brand-font="theme.fontKey" :style="{ fontFamily: 'var(--brand-font-family)' }">Aa</span>
      <span class="style-widget__fan" :data-brand-palette="theme.paletteKey">
        <span style="background: var(--brand-palette-1)" />
        <span style="background: var(--brand-palette-2)" />
        <span style="background: var(--brand-palette-3)" />
        <span style="background: var(--brand-palette-4)" />
        <span style="background: var(--brand-palette-5)" />
      </span>
    </button>

    <div v-if="open" class="style-dropdown">
      <div class="style-tabs">
        <button type="button" class="style-tab" :class="{ 'style-tab--active': tab === 'colors' }" @click="tab = 'colors'">Color Styles</button>
        <button type="button" class="style-tab" :class="{ 'style-tab--active': tab === 'fonts' }" @click="tab = 'fonts'">Fonts</button>
      </div>

      <div v-if="tab === 'colors'">
        <div class="style-palette-grid">
          <button
            v-for="opt in PALETTE_OPTIONS"
            :key="opt.key"
            type="button"
            class="style-palette-card"
            :class="{ 'style-palette-card--selected': theme.paletteKey === opt.key }"
            :aria-label="opt.label"
            @click="theme.paletteKey = opt.key"
          >
            <span class="style-swatch-strip" :data-brand-palette="opt.key">
              <span style="background: var(--brand-palette-1)" />
              <span style="background: var(--brand-palette-2)" />
              <span style="background: var(--brand-palette-3)" />
              <span style="background: var(--brand-palette-4)" />
              <span style="background: var(--brand-palette-5)" />
            </span>
          </button>
        </div>
        <div class="style-dark-row">
          <span class="text-caption">Dark mode</span>
          <label class="acuity-toggle-switch">
            <input type="checkbox" class="acuity-toggle-switch__input" :checked="theme.dark" @change="theme.dark = $event.target.checked">
            <span class="acuity-toggle-switch__track"><span class="acuity-toggle-switch__thumb" /></span>
          </label>
        </div>
      </div>

      <div v-else class="style-font-list">
        <button
          v-for="opt in FONT_OPTIONS"
          :key="opt.key"
          type="button"
          class="style-font-row"
          :class="{ 'style-font-row--selected': theme.fontKey === opt.key }"
          @click="theme.fontKey = opt.key"
        >
          <span class="style-font-row__aa" :data-brand-font="opt.key" :style="{ fontFamily: 'var(--brand-font-family)' }">Aa</span>
          <span class="text-body-book">{{ opt.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
