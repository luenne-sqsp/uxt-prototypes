<script setup>
import { computed } from 'vue';
import { useAvailabilityStore } from '../../stores/availability.js';

// Ported from _availCardGroupHTML()/_availCardHTML() (c3_c1/index.html:8862,
// :8877) — the idle summary card. Tapping it opens AvailabilitySheet.vue
// rather than the original's inline-expand-in-card grid.
const props = defineProps({
  blockKey: { type: String, required: true },
  isPerAppt: { type: Boolean, default: false },
});
defineEmits(['edit']);

const avail = useAvailabilityStore();
const block = computed(() => avail.getBlock(props.blockKey));
const summary = computed(() => avail.summary(block.value));
const label = computed(() => (props.isPerAppt ? avail.apptLabel(props.blockKey) : 'Your availability'));
</script>

<template>
  <div class="avail-card-group">
    <span class="text-caption avail-card-group__label">{{ label }}</span>
    <button type="button" class="acuity-card acuity-card--padding-md acuity-card--interactive avail-card" @click="$emit('edit')">
      <span class="text-body-medium">{{ summary.daysLabel }}</span>
      <span class="text-caption avail-card__time">{{ summary.timeLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.avail-card-group {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-8);
}
.avail-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--acuity-spacing-4);
  width: 100%;
  text-align: left;
}
.avail-card__time {
  color: var(--acuity-fg-muted);
}
</style>
