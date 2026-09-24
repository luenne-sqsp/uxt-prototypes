<script setup>
import { computed, watch } from 'vue';
import { useVariantStore } from '../stores/variants.js';

const props = defineProps({ presetId: String, screenId: String });

const store = useVariantStore();
const component = computed(() => store.screenComponent(props.screenId));

// c3_c1's showScreen() reset scroll on every navigation (index.html:9334).
watch(
  () => props.screenId,
  () => {
    document.querySelector('.screen-body')?.scrollTo(0, 0);
  },
);
</script>

<template>
  <Transition name="screen" mode="out-in">
    <!-- S5/S9 carry a live preview iframe (postMessage-driven, desktop-only)
         that must not reload every time you navigate away and back — see
         usePreviewBridge.js. KeepAlive is scoped to just those two by name
         so every other screen keeps its normal fresh-mount behavior (no
         stale local UI state on variant swaps, per the plan's KeepAlive
         caveat). -->
    <KeepAlive include="S5CatalogA,S9AvailabilityA">
      <component :is="component" :key="screenId" class="screen-body" />
    </KeepAlive>
  </Transition>
</template>

<style scoped>
.screen-body {
  min-height: 100vh;
  background: var(--acuity-bg-base);
}

.screen-enter-active,
.screen-leave-active {
  transition: opacity 160ms ease;
}
.screen-enter-from,
.screen-leave-to {
  opacity: 0;
}
</style>
