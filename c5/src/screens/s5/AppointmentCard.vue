<script setup>
import { computed } from 'vue';
import { formatDuration, isFreePrice } from '../../utils/duration.js';

// Ported from apptCardHTML() (c3_c1/index.html:8421), onto the
// .acuity-appointment-card DS primitive (--ai / --selected-item variants
// already match this card's two modes 1:1). Drag-to-reorder and the
// inline-expand-in-card edit animation aren't ported — edits open
// AppointmentSheet.vue as a plain dialog instead.
const props = defineProps({
  appt: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  atCap: { type: Boolean, default: false },
});
const emit = defineEmits(['add', 'edit', 'remove']);

const meta = computed(() =>
  isFreePrice(props.appt.price)
    ? formatDuration(props.appt.duration)
    : `${formatDuration(props.appt.duration)} @ ${props.appt.price}`,
);
</script>

<template>
  <div
    class="acuity-appointment-card"
    :class="selected ? 'acuity-appointment-card--selected-item' : 'acuity-appointment-card--ai'"
    @click="$emit('edit')"
  >
    <div class="acuity-appointment-card__body">
      <span class="acuity-appointment-card__name">{{ appt.name }}</span>
      <span class="acuity-appointment-card__meta">{{ meta }}</span>
      <span v-if="selected && appt.description" class="acuity-appointment-card__description">{{ appt.description }}</span>
    </div>
    <div class="acuity-appointment-card__actions">
      <button
        type="button"
        class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm"
        :disabled="!selected && atCap"
        :aria-label="!selected && atCap ? 'Edit (limit of 3 reached)' : 'Edit'"
        @click.stop="$emit('edit')"
      >
        <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-edit.svg')" />
      </button>
      <button
        v-if="selected"
        type="button"
        class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm"
        aria-label="Remove"
        @click.stop="$emit('remove')"
      >
        <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-trash-bin.svg')" />
      </button>
      <button
        v-else
        type="button"
        class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm"
        :disabled="atCap"
        :aria-label="atCap ? 'Add (limit of 3 reached)' : 'Add'"
        @click.stop="$emit('add')"
      >
        <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-plus.svg')" />
      </button>
    </div>
  </div>
</template>
