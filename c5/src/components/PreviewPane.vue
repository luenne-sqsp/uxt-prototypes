<script setup>
import { ref } from 'vue';
import StyleWidget from './StyleWidget.vue';
import { usePreviewBridge } from '../composables/usePreviewBridge.js';

// Ported from c3_c1's `.s5-preview-pane` (index.html:6611-6658, reused
// as-is by S9 at :7334-7378) — browser-chrome mock + the live
// scheduling-page.html iframe + floating style widget + desktop/mobile
// viewport segmented control. `view` is 'select' (S5) or 'datetime' (S9).
const props = defineProps({ view: { type: String, required: true } });

const { iframeRef, scrollHint } = usePreviewBridge(props.view);
const mobilePreview = ref(false);

defineExpose({ scrollHint });
</script>

<template>
  <div class="s5-preview-pane desktop-only" :class="{ 's5-preview-pane--mobile': mobilePreview }">
    <div class="s5-browser-frame">
      <div class="s5-browser-bar">
        <div class="s5-browser-dots">
          <span style="background: #ff5f57" />
          <span style="background: #febc2e" />
          <span style="background: #28c840" />
        </div>
        <div class="s5-browser-url" />
      </div>
      <div class="s5-browser-content">
        <iframe
          ref="iframeRef"
          class="s5-preview-iframe"
          :src="`/scheduling-page.html?view=${view}`"
          title="Scheduling page preview"
          loading="lazy"
        />
      </div>
    </div>

    <div class="s5-preview-controls">
      <StyleWidget />
      <div class="s5-segmented" role="group" aria-label="Preview viewport">
        <button
          type="button"
          class="s5-segment"
          :class="{ 's5-segment--active': !mobilePreview }"
          aria-label="Desktop preview"
          :aria-pressed="!mobilePreview"
          @click="mobilePreview = false"
        >
          <span class="acuity-icon acuity-icon--md" style="--icon: url('/ds/icons/icon-desktop.svg')" />
        </button>
        <button
          type="button"
          class="s5-segment"
          :class="{ 's5-segment--active': mobilePreview }"
          aria-label="Mobile preview"
          :aria-pressed="mobilePreview"
          @click="mobilePreview = true"
        >
          <span class="acuity-icon acuity-icon--md" style="--icon: url('/ds/icons/icon-mobile.svg')" />
        </button>
      </div>
    </div>
  </div>
</template>
