<script setup>
import { computed, ref } from 'vue';
import VariantSlot from '../../components/VariantSlot.vue';
import DesktopTopNav from '../../components/DesktopTopNav.vue';
import StyleWidget from '../../components/StyleWidget.vue';
import BookingWidgetPreview from './BookingWidgetPreview.vue';
import StylePickerRow from './StylePickerRow.vue';
import { useProtoStore } from '../../stores/proto.js';
import { useVariantStore } from '../../stores/variants.js';
import { useThemeStore, resolvePaletteHexes } from '../../stores/theme.js';

// Ported from c3_c1/index.html s10 section (:7434) — both mobile body
// (:7541) and desktop body (:7452-7503, share-row + bigger widget + the
// floating StyleWidget instead of mobile's bottom-sheet pickers).
const proto = useProtoStore();
const variants = useVariantStore();
const theme = useThemeStore();

const subheading = computed(() =>
  proto.selectedAppts.length > 1
    ? 'Share your page and let clients book with you.'
    : 'Share this appointment and let clients book with you.',
);

const copied = ref(false);
function copyLink() {
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1500);
}

// Ported from serializeForSchedulingPage() (:12282). Palette is resolved to
// real hex values from ds/brand-palettes.css at click time (see
// stores/theme.js) rather than duplicating them in JS.
function openSchedulingPage() {
  const params = new URLSearchParams();
  params.set('services', JSON.stringify(proto.effectiveSelectedAppts.map((a) => ({
    name: a.name,
    duration: a.duration,
    price: a.price,
    description: a.description || '',
  }))));
  params.set('hours', proto.selectedHoursLabel || '');
  params.set('palette', JSON.stringify(resolvePaletteHexes(theme.paletteKey)));
  params.set('font', theme.fontKey);
  params.set('dark', theme.dark ? '1' : '0');
  window.open(`/scheduling-page.html?${params.toString()}`, '_blank');
}
</script>

<template>
  <div class="s10">
    <DesktopTopNav close-text="Close setup" @close="variants.navigateTo('s_home')" />

    <!-- Mobile body -->
    <div class="mobile-only">
      <VariantSlot
        name="topNav"
        action-label="Close"
        @back="variants.navigateTo('s9', { replace: true })"
        @action="variants.navigateTo('s_home')"
      />

      <div class="s10__header">
        <h2 class="acuity-wizard-header__heading">You are ready for your first booking!</h2>
        <p class="acuity-wizard-header__subheading">{{ subheading }}</p>
      </div>

      <div class="s10__preview">
        <BookingWidgetPreview />
        <StylePickerRow />
      </div>

      <div class="acuity-bottom-nav">
        <button type="button" class="acuity-button acuity-button--primary acuity-button--md acuity-button--full-width" @click="openSchedulingPage">
          <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-external.svg')" />
          Open scheduling page
        </button>
        <button type="button" class="acuity-button acuity-button--tertiary acuity-button--md acuity-button--full-width" @click="variants.navigateTo('s_home')">
          Finish setup
        </button>
      </div>
    </div>

    <!-- Desktop body -->
    <div class="s10__desktop desktop-only">
      <div class="s10__desktop-header">
        <h2 class="text-display-title">You are ready for your first booking!</h2>
        <p class="text-body-book s10__desktop-subheading">{{ subheading }}</p>
      </div>

      <div class="s10__share-row">
        <label class="acuity-input acuity-input--md s10__share-input">
          <span class="acuity-input__wrapper">
            <input type="text" class="acuity-input__field" readonly value="app.acuityscheduling.com/schedule.php?owner=35753195" aria-label="Your scheduling page link">
          </span>
        </label>
        <button type="button" class="acuity-button acuity-button--primary acuity-button--md" @click="copyLink">
          <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-duplicate.svg')" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button type="button" class="acuity-button acuity-button--secondary acuity-button--md" @click="openSchedulingPage">
          Open scheduling page
        </button>
      </div>

      <BookingWidgetPreview large />

      <div class="s10__desktop-controls">
        <StyleWidget />
      </div>

      <button type="button" class="acuity-button acuity-button--tertiary acuity-button--md" @click="variants.navigateTo('s_home')">
        Finish setup
      </button>
    </div>
  </div>
</template>

<style scoped>
.s10__header {
  padding: var(--acuity-spacing-24) var(--acuity-spacing-24) var(--acuity-spacing-16);
}
.s10__preview {
  display: flex;
  flex-direction: column;
  background: var(--acuity-bg-inset);
  padding: var(--acuity-spacing-24) 0;
}

/* Ported from #s10.screen.active (c3_c1/index.html:5484-5652). */
@media (min-width: 1024px) {
  .s10 {
    display: flex;
    flex-direction: column;
    background: var(--acuity-bg-inset);
    height: 100dvh;
    overflow: hidden;
  }
  .s10__desktop {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--acuity-spacing-32);
    padding: var(--acuity-spacing-32);
    width: 100%;
  }
  .s10__desktop-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--acuity-spacing-8);
    text-align: center;
  }
  .s10__desktop-subheading { color: var(--acuity-fg-muted); }
  .s10__share-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--acuity-spacing-12);
    width: 100%;
    max-width: 640px;
  }
  .s10__share-input { flex: 1; min-width: 0; }
  .s10__share-input :deep(.acuity-input__field) { color: var(--acuity-fg-muted); }
  .s10__desktop-controls {
    display: flex;
    justify-content: center;
  }
}
</style>
