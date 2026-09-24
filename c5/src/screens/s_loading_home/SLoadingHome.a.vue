<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useProtoStore } from '../../stores/proto.js';
import { useVariantStore } from '../../stores/variants.js';

// Ported from c3_c1/index.html s_loading_home section (:7607) +
// goHomeViaLoading() (:12228). Same .acuity-spinner substitution as
// S4Loading.a.vue, and the same onUnmounted timer cleanup.
const proto = useProtoStore();
const variants = useVariantStore();
let timer;

onMounted(() => {
  proto.arrivedHomeFromSkip = true;
  timer = setTimeout(() => variants.navigateTo('s_home'), 1800);
});
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div class="s-loading-home">
    <div class="acuity-spinner acuity-spinner--lg s-loading-home__spinner" />
    <span class="text-body-book s-loading-home__label">Setting up your account…</span>
  </div>
</template>

<style scoped>
.s-loading-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--acuity-spacing-16);
  min-height: 100vh;
  color: var(--acuity-fg-muted);
}
.s-loading-home__spinner {
  color: var(--acuity-fg-default);
}
</style>
