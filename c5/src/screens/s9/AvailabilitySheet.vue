<script setup>
import { reactive, watch } from 'vue';
import { useAvailabilityStore } from '../../stores/availability.js';

// Simplified day-toggle + single time-range editor, replacing the original's
// draggable per-day grid with independent ranges per day (see
// stores/availability.js for why).
const props = defineProps({
  open: { type: Boolean, default: false },
  blockKey: { type: String, default: null },
});
const emit = defineEmits(['close']);

const avail = useAvailabilityStore();
const draft = reactive({ days: Array(7).fill(false), start: '09:00', end: '17:00' });

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen || !props.blockKey) return;
    const block = avail.getBlock(props.blockKey);
    draft.days = [...block.days];
    draft.start = block.start;
    draft.end = block.end;
  },
);

function toggleDay(i) {
  draft.days[i] = !draft.days[i];
}

function save() {
  const block = avail.getBlock(props.blockKey);
  block.days = [...draft.days];
  block.start = draft.start;
  block.end = draft.end;
  emit('close');
}
</script>

<template>
  <div class="acuity-dialog-backdrop acuity-dialog-backdrop--bottom" :class="{ 'acuity-dialog-backdrop--visible': open }" @click.self="$emit('close')">
    <div class="acuity-dialog acuity-dialog--md">
      <div class="acuity-dialog__header">
        <h2 class="acuity-dialog__title">Set your hours</h2>
        <button type="button" class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm" aria-label="Close" @click="$emit('close')">
          <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-cross-lg.svg')" />
        </button>
      </div>
      <div class="acuity-dialog__body sheet__body">
        <div class="sheet__days">
          <button
            v-for="(label, i) in avail.DAYS_ABBR"
            :key="i"
            type="button"
            class="acuity-chip acuity-chip--md acuity-chip--interactive"
            :class="{ 'acuity-chip--selected': draft.days[i] }"
            @click="toggleDay(i)"
          >
            {{ label }}
          </button>
        </div>
        <label class="acuity-input acuity-input--md">
          <span class="acuity-input__label">Start time</span>
          <span class="acuity-input__wrapper">
            <input v-model="draft.start" type="time" class="acuity-input__field">
          </span>
        </label>
        <label class="acuity-input acuity-input--md">
          <span class="acuity-input__label">End time</span>
          <span class="acuity-input__wrapper">
            <input v-model="draft.end" type="time" class="acuity-input__field">
          </span>
        </label>
      </div>
      <div class="acuity-dialog__footer">
        <button type="button" class="acuity-button acuity-button--tertiary acuity-button--sm" @click="$emit('close')">Cancel</button>
        <button type="button" class="acuity-button acuity-button--primary acuity-button--sm" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet__body {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-16);
}
.sheet__days {
  display: flex;
  flex-wrap: wrap;
  gap: var(--acuity-spacing-8);
}
</style>
