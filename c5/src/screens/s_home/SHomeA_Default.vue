<script setup>
import { computed, ref } from 'vue';
import { useVariantStore } from '../../stores/variants.js';
import { useProtoStore } from '../../stores/proto.js';
import { useThemeStore } from '../../stores/theme.js';

// Ported from c3_c1/index.html s_home section (:7619) — both states:
// "ready" (:7811, arrived via S10 after completing setup) and "setup"
// (:7893, arrived via S1's Skip link — showHomeState(), :12219). Plan/promo
// cards and every other stub action are inert in the original too
// (showProtoTooltip() — "not available in prototype"); ported here as
// disabled buttons with a title tooltip instead of building that overlay.
//
// The mini scheduling-page thumbnail (_renderHomeMiniPageInto(), :12138)
// hand-computes ~15 inline pixel styles to fake a whole tiny webpage. This
// version reads the real data-brand-palette/data-brand-font attributes
// (the same system StylePickerRow.vue uses) instead of recreating that
// calculation, so it stays accurate if the palette/font changes.
const variants = useVariantStore();
const proto = useProtoStore();
const theme = useThemeStore();

const isSetup = computed(() => proto.arrivedHomeFromSkip);

const GENERIC_PREVIEW_APPTS = [
  { id: 'g1', name: 'Initial Consultation', duration: '30 min', price: 'Free' },
  { id: 'g2', name: 'Standard Session', duration: '1 hour', price: '$50' },
  { id: 'g3', name: 'Extended Session', duration: '2 hours', price: '$90' },
];
const previewAppts = computed(() =>
  isSetup.value ? GENERIC_PREVIEW_APPTS : (proto.effectiveSelectedAppts.length ? proto.effectiveSelectedAppts : [{ id: 'x', name: 'Your service' }]),
);

const copied = ref(false);
function copyLink() {
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1500);
}
</script>

<template>
  <div class="home">
    <h1 class="text-title-lg home__heading">Home</h1>

    <!-- Setup-state checklist card — 0%, first task is real navigation -->
    <div v-if="isSetup" class="acuity-card acuity-card--padding-md home__card">
      <div class="home__checklist-header">
        <span class="text-body-medium">Set up your scheduling page</span>
        <span class="text-caption home__pct home__pct--zero">0%</span>
      </div>
      <button type="button" class="home__task-row" @click="variants.navigateTo('s2')">
        <span class="home__task-circle" />
        <span class="text-caption">Create appointment types</span>
        <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-chevron-small-right.svg')" />
      </button>
      <button type="button" class="home__task-row" disabled title="Not available in prototype">
        <span class="home__task-circle" />
        <span class="text-caption">Set your availability</span>
        <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-chevron-small-right.svg')" />
      </button>
      <button type="button" class="home__task-row" disabled title="Not available in prototype">
        <span class="home__task-circle" />
        <span class="text-caption">Customize design</span>
        <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-chevron-small-right.svg')" />
      </button>
    </div>

    <div class="acuity-card acuity-card--padding-none home__card">
      <div class="home__mini-page" :data-brand-palette="theme.paletteKey" :data-theme="theme.dark ? 'dark' : null">
        <div class="home__mini-header" :style="{ fontFamily: 'var(--brand-font-family)' }">Your Business Name</div>
        <div class="home__mini-body">
          <span v-for="appt in previewAppts" :key="appt.id" class="home__mini-row">{{ appt.name }}</span>
        </div>
      </div>
      <div class="home__card-body">
        <template v-if="isSetup">
          <p class="text-body-medium">Your Scheduling Page</p>
          <p class="text-caption home__url">app.acuityscheduling.com/schedule.php?owner=…</p>
          <button type="button" class="acuity-button acuity-button--secondary acuity-button--sm acuity-button--full-width" disabled title="Not available in prototype">
            Edit
          </button>
        </template>
        <template v-else>
          <p class="text-body-medium">Your scheduling page is ready!</p>
          <p class="text-caption home__url">app.acuityscheduling.com/schedule.php?owner=35753195</p>
          <button type="button" class="acuity-button acuity-button--secondary acuity-button--sm acuity-button--full-width" @click="copyLink">
            <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-duplicate.svg')" />
            {{ copied ? 'Copied!' : 'Copy link' }}
          </button>

          <div class="home__checklist">
            <div class="home__checklist-header">
              <span class="text-caption">Set up your scheduling page</span>
              <span class="text-caption home__pct">100%</span>
            </div>
            <div v-for="label in ['Create appointment types', 'Set your availability', 'Customize design']" :key="label" class="home__check-row">
              <span class="acuity-icon acuity-icon--sm home__check-icon" style="--icon: url('/ds/icons/icon-check.svg')" />
              <span class="text-caption">{{ label }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="acuity-card acuity-card--padding-md home__card">
      <p class="text-body-medium">Appointments this week ({{ 0 }})</p>
      <button type="button" class="acuity-button acuity-button--secondary acuity-button--sm" disabled title="Not available in prototype">
        Book appointment
      </button>
    </div>

    <div class="acuity-card acuity-card--padding-md home__card">
      <span class="text-label">Your plan</span>
      <p class="text-body-medium">Free Trial (Emerging)</p>
      <p class="text-caption">7 days left</p>
      <button type="button" class="acuity-button acuity-button--secondary acuity-button--sm" disabled title="Not available in prototype">
        Choose a plan
      </button>
    </div>

    <div class="acuity-card acuity-card--padding-md home__card">
      <p class="text-body-medium">Get 50% off any plan before the end of the month</p>
      <p class="text-caption">Use code 50OFF at checkout.</p>
      <button type="button" class="acuity-button acuity-button--secondary acuity-button--sm" disabled title="Not available in prototype">
        Choose a plan
      </button>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-16);
  padding: var(--acuity-spacing-24);
}
.home__card {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-8);
  overflow: hidden;
}
.home__card-body {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-8);
  padding: var(--acuity-spacing-16);
}
.home__url {
  color: var(--acuity-fg-muted);
}
.home__mini-page {
  background: var(--brand-palette-1);
  padding: var(--acuity-spacing-16);
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-8);
}
.home__mini-header {
  text-align: center;
  font-size: 12px;
  font-weight: var(--acuity-font-weight-bold);
  color: var(--brand-palette-5);
}
.home__mini-body {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-4);
}
.home__mini-row {
  background: var(--brand-palette-2);
  color: var(--brand-palette-5);
  border-radius: var(--acuity-border-radius-sm);
  padding: var(--acuity-spacing-8);
  font-size: 11px;
}
.home__checklist {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-8);
  margin-top: var(--acuity-spacing-8);
  padding-top: var(--acuity-spacing-8);
  border-top: var(--acuity-border-width-hairline) solid var(--acuity-border-muted);
}
.home__checklist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.home__pct {
  color: var(--acuity-fg-success);
  font-weight: var(--acuity-font-weight-semibold);
}
.home__pct--zero {
  color: var(--acuity-fg-muted);
}
.home__check-row {
  display: flex;
  align-items: center;
  gap: var(--acuity-spacing-8);
}
.home__check-icon {
  color: var(--acuity-fg-success);
}
.home__task-row {
  display: flex;
  align-items: center;
  gap: var(--acuity-spacing-8);
  width: 100%;
  border: none;
  background: none;
  padding: var(--acuity-spacing-8) 0;
  cursor: pointer;
  color: var(--acuity-fg-muted);
}
.home__task-row:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.home__task-row .text-caption {
  flex: 1;
  text-align: left;
  color: var(--acuity-fg-default);
}
.home__task-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: var(--acuity-border-width-default) solid var(--acuity-border-default);
  flex-shrink: 0;
}
</style>
