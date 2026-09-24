<script setup>
defineOptions({ name: 'S5CatalogA' }); // matches ScreenHost.vue's KeepAlive include
import { computed, onMounted, ref } from 'vue';
import VariantSlot from '../../components/VariantSlot.vue';
import DesktopTopNav from '../../components/DesktopTopNav.vue';
import PreviewPane from '../../components/PreviewPane.vue';
import AppointmentCard from './AppointmentCard.vue';
import AppointmentSheet from './AppointmentSheet.vue';
import { useProtoStore } from '../../stores/proto.js';
import { useVariantStore } from '../../stores/variants.js';
import { useCatalogStore } from '../../stores/catalog.js';

// Ported from c3_c1/index.html s5 section (:6594). Desktop-only markup (the
// browser-frame live preview + style widget + segmented viewport control,
// all wrapped in `aria-hidden="true"` in the source) is out of scope for
// this mobile-only pass — see the plan's "Desktop breakpoint" note.
const proto = useProtoStore();
const variants = useVariantStore();
const catalog = useCatalogStore();

// Matches generateAISuggestions() (:12448) minus the skeleton-flash delay,
// which was purely a 400ms animation beat.
onMounted(() => {
  proto.catalogOverride = catalog.templateFallback();
});

const available = computed(() => {
  const all = proto.catalogOverride || [];
  const selectedIds = new Set(proto.selectedAppts.map((a) => a.id));
  return all.filter((a) => !selectedIds.has(a.id)).slice(0, 3).map(proto.withEdits);
});
const atCap = computed(() => proto.selectedAppts.length >= 3);

const sheetOpen = ref(false);
const sheetMode = ref('create');
const sheetAppt = ref(null);

function openCreate() {
  sheetMode.value = 'create';
  sheetAppt.value = null;
  sheetOpen.value = true;
}

function openEdit(appt) {
  sheetMode.value = 'edit';
  sheetAppt.value = appt;
  sheetOpen.value = true;
}

// Ported from saveEdit() (:8926): editing a not-yet-selected suggestion
// auto-adds it to the selection.
function onSave(patch) {
  if (sheetMode.value === 'create') {
    proto.addAppt({ id: `custom_${Date.now()}`, ...patch });
  } else {
    const id = sheetAppt.value.id;
    if (!proto.selectedAppts.some((a) => a.id === id)) {
      proto.addAppt({ id, name: sheetAppt.value.name, duration: sheetAppt.value.duration, price: sheetAppt.value.price });
    }
    proto.saveEdit(id, patch);
  }
  sheetOpen.value = false;
}
</script>

<template>
  <div class="s5">
    <DesktopTopNav variant="overlay" @close="variants.navigateTo('s_home')" />
    <PreviewPane view="select" />

    <VariantSlot name="topNav" step-label="Step 3 of 4" @back="variants.navigateTo('s3', { replace: true })" />

    <div class="s5__body">
      <div class="acuity-wizard-header">
        <span class="text-label desktop-only s5__eyebrow">Step 3 of 4</span>
        <h2 class="acuity-wizard-header__heading">Add your first appointment</h2>
        <p class="acuity-wizard-header__subheading">Choose up to 3 services to start with, or create your own. You can edit it anytime.</p>
      </div>

      <div class="s5__list-top">
        <span class="text-label">Your services ({{ proto.selectedAppts.length }})</span>

        <div v-if="proto.selectedAppts.length" class="s5__appt-list">
          <AppointmentCard
            v-for="appt in proto.effectiveSelectedAppts"
            :key="appt.id"
            :appt="appt"
            selected
            @edit="openEdit(appt)"
            @remove="proto.removeAppt(appt.id)"
          />
        </div>

        <button
          type="button"
          class="acuity-button acuity-button--secondary acuity-button--md acuity-button--full-width"
          :disabled="atCap"
          :aria-label="atCap ? 'Create new appointment (limit of 3 reached)' : 'Create new appointment'"
          @click="openCreate"
        >
          <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-plus.svg')" />
          Create new appointment
        </button>
      </div>

      <div class="s5__carousel">
        <span class="acuity-ai-badge">
          <span class="acuity-ai-badge__icon"><span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-sparkles.svg')" /></span>
          Suggestions for you
        </span>
        <div class="s5__appt-list">
          <AppointmentCard
            v-for="appt in available"
            :key="appt.id"
            :appt="appt"
            :at-cap="atCap"
            @add="proto.addAppt(appt)"
            @edit="openEdit(appt)"
          />
        </div>
      </div>
    </div>

    <div class="acuity-bottom-nav">
      <button
        type="button"
        class="acuity-button acuity-button--primary acuity-button--md acuity-button--full-width"
        :disabled="!proto.selectedAppts.length"
        @click="variants.navigateTo('s9')"
      >
        Continue with selection
      </button>
    </div>

    <AppointmentSheet
      :open="sheetOpen"
      :mode="sheetMode"
      :appt="sheetAppt"
      @close="sheetOpen = false"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.s5__list-top {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-12);
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-16);
}
.s5__carousel {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-16);
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}
.s5__appt-list {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-8);
}

/* Ported from #s5.screen.active (c3_c1/index.html:4775-4809): preview pane
   left, appointment list right, full-width bottom bar. Right pane 480px
   fixed per Figma 6280-59261. */
@media (min-width: 1024px) {
  .s5 {
    display: grid;
    grid-template-columns: 1fr 480px;
    grid-template-rows: 1fr auto;
    grid-template-areas: "preview list" "bottombar bottombar";
    height: 100dvh;
    overflow: hidden;
    position: relative;
  }
  .s5 :deep(.acuity-top-nav) { display: none; }
  .s5__body {
    grid-area: list;
    display: flex;
    flex-direction: column;
    gap: var(--acuity-spacing-32);
    padding: var(--acuity-spacing-64) var(--acuity-spacing-32);
    overflow-y: auto;
  }
  .s5__body .acuity-wizard-header {
    align-items: flex-start;
    text-align: left;
    padding: 0;
  }
  .acuity-bottom-nav { grid-area: bottombar; }
}
</style>
