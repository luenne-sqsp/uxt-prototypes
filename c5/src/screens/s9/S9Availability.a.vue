<script setup>
defineOptions({ name: 'S9AvailabilityA' }); // matches ScreenHost.vue's KeepAlive include
import { onMounted, onUnmounted, ref } from 'vue';
import VariantSlot from '../../components/VariantSlot.vue';
import DesktopTopNav from '../../components/DesktopTopNav.vue';
import PreviewPane from '../../components/PreviewPane.vue';
import AvailabilityCard from './AvailabilityCard.vue';
import AvailabilitySheet from './AvailabilitySheet.vue';
import { useProtoStore } from '../../stores/proto.js';
import { useVariantStore } from '../../stores/variants.js';
import { useAvailabilityStore } from '../../stores/availability.js';

// Ported from c3_c1/index.html s9 section (:7317).
const proto = useProtoStore();
const variants = useVariantStore();
const avail = useAvailabilityStore();

const openKey = ref(null);
const previewPane = ref(null);

function finish() {
  proto.selectedHoursLabel = avail.selectedHoursLabel;
  variants.navigateTo('s10');
}

// Ported from _scrollS9PreviewDown() (c3_c1/index.html:8748) — nudges the
// datetime preview to scroll past the appointment summary once landed.
let scrollTimer;
onMounted(() => {
  scrollTimer = setTimeout(() => previewPane.value?.scrollHint(140), 450);
});
onUnmounted(() => clearTimeout(scrollTimer));
</script>

<template>
  <div class="s9">
    <DesktopTopNav variant="overlay" @close="variants.navigateTo('s_home')" />
    <PreviewPane ref="previewPane" view="datetime" />

    <VariantSlot name="topNav" step-label="Step 4 of 4" action-label="Skip" @back="variants.navigateTo('s5', { replace: true })" @action="finish" />

    <div class="s9__body">
      <div class="acuity-wizard-header">
        <span class="text-label desktop-only s9__eyebrow">Step 4 of 4</span>
        <h2 class="acuity-wizard-header__heading">When can clients book you?</h2>
        <p class="acuity-wizard-header__subheading">This sets when your appointments will appear as available. You'll be able to customize this further.</p>
      </div>

      <div class="s9__cards">
        <AvailabilityCard
          v-for="key in avail.keys"
          :key="key"
          :block-key="key"
          :is-per-appt="key !== 'global'"
          @edit="openKey = key"
        />

        <div v-if="proto.selectedAppts.length > 1" class="s9__toggle-row">
          <span class="text-body-book">Setup different availabilities for different appointments</span>
          <label class="acuity-toggle-switch">
            <input
              type="checkbox"
              class="acuity-toggle-switch__input"
              :checked="avail.differentSetups"
              @change="avail.setDifferentSetups($event.target.checked)"
            >
            <span class="acuity-toggle-switch__track"><span class="acuity-toggle-switch__thumb" /></span>
          </label>
        </div>
      </div>
    </div>

    <div class="acuity-bottom-nav">
      <button type="button" class="acuity-button acuity-button--primary acuity-button--md acuity-button--full-width" @click="finish">
        Finish
      </button>
    </div>

    <AvailabilitySheet :open="openKey !== null" :block-key="openKey" @close="openKey = null" />
  </div>
</template>

<style scoped>
.s9__cards {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-16);
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}
.s9__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--acuity-spacing-16);
  padding: var(--acuity-spacing-12) 0;
}

/* Ported from #s9.screen.active — shares S5's grid shell (c3_c1/index.html
   :4775-4809) plus S9-specific right-pane spacing (:5415-5430). */
@media (min-width: 1024px) {
  .s9 {
    display: grid;
    grid-template-columns: 1fr 480px;
    grid-template-rows: 1fr auto;
    grid-template-areas: "preview list" "bottombar bottombar";
    height: 100dvh;
    overflow: hidden;
    position: relative;
  }
  .s9 :deep(.acuity-top-nav) { display: none; }
  .s9__body {
    grid-area: list;
    display: flex;
    flex-direction: column;
    gap: var(--acuity-spacing-24);
    padding: var(--acuity-spacing-64) var(--acuity-spacing-32);
    overflow-y: auto;
  }
  .s9__body .acuity-wizard-header {
    align-items: flex-start;
    text-align: left;
    padding: 0;
  }
  .acuity-bottom-nav { grid-area: bottombar; }
}
</style>
