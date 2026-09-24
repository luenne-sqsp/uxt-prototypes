<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useVariantStore } from '../../stores/variants.js';

// Ported from c3_c1/index.html s4 section (:6582) + the s4 branch of
// showScreen() (:9345), which had no clearTimeout — navigating away from s4
// within 2s still landed you on s5 anyway. Fixed here with onUnmounted.
//
// The original renders a Lottie animation (a rotating brand mark) with a
// dot-pulse CSS fallback if the dotlottie-player custom element fails to
// upgrade within 3s. That machinery — an unpinned @latest CDN script, or an
// npm package whose dependency tree carries known-vulnerable transitive
// deps (sharp/libvips CVEs via @dotlottie/dotlottie-js) — isn't worth
// carrying for a two-second decorative spinner; .acuity-spinner does the job
// with no dependency at all.
const variants = useVariantStore();
let timer;

onMounted(() => {
  timer = setTimeout(() => variants.navigateTo('s5'), 2000);
});
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div class="s4">
    <div class="acuity-spinner acuity-spinner--lg s4__spinner" />
    <span class="text-body-book s4__label">Generating appointments</span>
  </div>
</template>

<style scoped>
.s4 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--acuity-spacing-16);
  min-height: 100vh;
  color: var(--acuity-fg-muted);
}
.s4__spinner {
  color: var(--acuity-fg-default);
}
</style>
