<script setup>
// Ported from c3_c1's `.desktop-top-nav` (logo + close), shown only at the
// desktop breakpoint. `variant="overlay"` reproduces S5/S9's absolutely
// positioned, transparent, click-through-except-children treatment
// (index.html:4791-4801) so it can float over the preview pane.
defineProps({
  closeText: { type: String, default: '' },
  variant: { type: String, default: 'default' }, // 'default' | 'overlay'
});
defineEmits(['close']);
</script>

<template>
  <nav class="desktop-top-nav desktop-only" :class="{ 'desktop-top-nav--overlay': variant === 'overlay' }">
    <span class="desktop-nav-logo">
      <svg width="9" height="20" viewBox="0 0 9 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="4.28" cy="4.28" rx="4.28" ry="4.28" fill="currentColor" />
        <ellipse cx="4.28" cy="15.72" rx="4.28" ry="4.28" fill="currentColor" />
      </svg>
    </span>
    <button v-if="closeText" type="button" class="desktop-nav-text" @click="$emit('close')">{{ closeText }}</button>
    <button v-else type="button" class="desktop-nav-close" aria-label="Close" @click="$emit('close')">
      <span class="acuity-icon acuity-icon--md" style="--icon: url('/ds/icons/icon-cross-lg.svg')" />
    </button>
  </nav>
</template>

<style scoped>
@media (min-width: 1024px) {
  .desktop-top-nav--overlay {
    position: absolute;
    inset: 0 0 auto 0;
    z-index: var(--acuity-z-sticky);
    background: transparent;
    pointer-events: none;
  }
  .desktop-top-nav--overlay > * { pointer-events: auto; }
}
</style>
