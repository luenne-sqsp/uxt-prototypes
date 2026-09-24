<script setup>
defineProps({
  stepLabel: { type: String, default: '' },
  backLabel: { type: String, default: 'Back' },
  actionLabel: { type: String, default: '' },
});
defineEmits(['back', 'action']);
</script>

<template>
  <nav class="acuity-top-nav">
    <button
      v-if="backLabel"
      type="button"
      class="acuity-icon-button acuity-icon-button--ghost acuity-icon-button--md acuity-top-nav__back"
      aria-label="Back"
      @click="$emit('back')"
    >
      <span class="acuity-icon acuity-icon--md" style="--icon: url('/ds/icons/icon-chevron-small-left.svg')" />
    </button>
    <span class="acuity-top-nav__title acuity-top-nav__step-label">{{ stepLabel }}</span>
    <button
      v-if="actionLabel"
      type="button"
      class="acuity-button acuity-button--tertiary acuity-button--sm acuity-top-nav__action"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </nav>
</template>
