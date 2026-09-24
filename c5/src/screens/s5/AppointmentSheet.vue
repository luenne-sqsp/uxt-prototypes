<script setup>
import { ref, watch } from 'vue';

// A single form for both flows this phase ports from the original's two
// separate 129-line inline-expand sheets (openEdit()/closeEdit(),
// c3_c1/index.html:8844) and 239-line 5-panel create wizard
// (openCreate()/#create-overlay, :7077). Both ultimately write to the same
// {name, duration, price, description} shape (proto.apptEdits' own comment
// names exactly those three fields). Deliberately not ported: AI name-chip
// suggestions, the c2 "regenerate name" history, pricing-tier chips, and
// image upload — this form covers defining/editing an appointment, not
// those assistive extras.
const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  appt: { type: Object, default: null },
});
const emit = defineEmits(['close', 'save']);

const name = ref('');
const duration = ref(60);
const price = ref(0);
const description = ref('');

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    name.value = props.appt?.name ?? '';
    duration.value = props.appt ? parseDurationMin(props.appt.duration) : 60;
    price.value = props.appt ? Number(String(props.appt.price).replace('$', '')) || 0 : 0;
    description.value = props.appt?.description ?? '';
  },
);

function parseDurationMin(s) {
  const str = String(s || '');
  const hr = str.match(/(\d+(?:\.\d+)?)\s*hr/i);
  const min = str.match(/(\d+)\s*min/i);
  let mins = 0;
  if (hr) mins += parseFloat(hr[1]) * 60;
  if (min) mins += parseInt(min[1], 10);
  return mins > 0 ? mins : 60;
}

function save() {
  emit('save', {
    name: name.value.trim() || 'Untitled service',
    duration: `${duration.value} min`,
    price: `$${price.value}`,
    description: description.value.trim(),
  });
}
</script>

<template>
  <div class="acuity-dialog-backdrop acuity-dialog-backdrop--bottom" :class="{ 'acuity-dialog-backdrop--visible': open }" @click.self="$emit('close')">
    <div class="acuity-dialog acuity-dialog--md">
      <div class="acuity-dialog__header">
        <h2 class="acuity-dialog__title">{{ mode === 'edit' ? 'Edit appointment' : 'Create new appointment' }}</h2>
        <button type="button" class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm" aria-label="Close" @click="$emit('close')">
          <span class="acuity-icon acuity-icon--sm" style="--icon: url('/ds/icons/icon-cross-lg.svg')" />
        </button>
      </div>
      <div class="acuity-dialog__body sheet__body">
        <label class="acuity-input acuity-input--md">
          <span class="acuity-input__label">Name</span>
          <span class="acuity-input__wrapper">
            <input v-model="name" type="text" class="acuity-input__field" placeholder="e.g. Haircut">
          </span>
        </label>
        <label class="acuity-input acuity-input--md">
          <span class="acuity-input__label">Duration (minutes)</span>
          <span class="acuity-input__wrapper">
            <input v-model.number="duration" type="number" min="5" step="5" class="acuity-input__field">
          </span>
        </label>
        <label class="acuity-input acuity-input--md">
          <span class="acuity-input__label">Price</span>
          <span class="acuity-input__wrapper">
            <input v-model.number="price" type="number" min="0" step="1" class="acuity-input__field">
          </span>
        </label>
        <label class="acuity-input acuity-input--md">
          <span class="acuity-input__label">Description (optional)</span>
          <span class="acuity-input__wrapper">
            <textarea v-model="description" class="acuity-input__field acuity-textarea" rows="2" />
          </span>
        </label>
      </div>
      <div class="acuity-dialog__footer">
        <button type="button" class="acuity-button acuity-button--tertiary acuity-button--sm" @click="$emit('close')">Cancel</button>
        <button type="button" class="acuity-button acuity-button--primary acuity-button--sm" @click="save">
          {{ mode === 'edit' ? 'Save changes' : 'Save and select' }}
        </button>
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
</style>
