<script setup>
import { onMounted, ref } from 'vue';
import { useVariantStore } from '../../stores/variants.js';
import DesktopTopNav from '../../components/DesktopTopNav.vue';

// Ported from c3_c1/index.html s1 section (:6228). The numbered 3-step list
// (.intro-steps) is desktop-only in the source (`display: none` at mobile
// scope, :194) — mobile shows only the card-stack carousel (which desktop
// hides in turn, :4466). The carousel's baked-spring entrance animation
// (_s1PlayEntrance(), :12647 — literal keyframe samples of an underdamped
// spring curve) is replaced with a plain CSS transition; the resting
// position/size/rotation values for each card are kept exactly (:4076-4078).
// The steps' elaborate decorative "asset" mockup illustrations (nested
// color-pill divs) are simplified to a single DS icon per step — same
// "keep the content, simplify the illustration" cut as elsewhere.
const STEPS = [
  { icon: 'icon-edit', title: 'Tell us the basics', desc: "We'll learn about you and provide tailored setup recommendations" },
  { icon: 'icon-plus', title: 'Pick your services', desc: 'Add straight from our suggestions or create your own from scratch' },
  { icon: 'icon-share', title: 'Customize & share', desc: 'Make it yours, share with clients, and start taking bookings.' },
];

const variants = useVariantStore();
const animated = ref(false);
onMounted(() => {
  requestAnimationFrame(() => requestAnimationFrame(() => { animated.value = true; }));
});
</script>

<template>
  <div class="s1">
    <DesktopTopNav @close="variants.navigateTo('s_loading_home')" />

    <div class="s1__header">
      <span class="text-label">Welcome to Acuity Scheduling</span>
      <h1 class="text-display-title s1__heading">Get your booking page ready in minutes</h1>
      <p class="text-body-book s1__subheading">
        Start with the essentials so you're ready to take bookings.<br>
        You can customize everything later.
      </p>
    </div>

    <div class="s1__carousel mobile-only">
      <div class="s1__asset-area" :class="{ 's1__asset-area--in': animated }">
        <div class="s1__card s1__card--behind"><img src="/assets/s1-card-3-back.png" alt=""></div>
        <div class="s1__card s1__card--center"><img src="/assets/s1-card-2-mid.png" alt=""></div>
        <div class="s1__card s1__card--front"><img src="/assets/s1-card-1-front.png" alt=""></div>
      </div>
    </div>

    <ul class="s1__steps desktop-only">
      <li v-for="(step, i) in STEPS" :key="step.title" class="s1__step">
        <span class="text-title-sm s1__step-num">{{ i + 1 }}.</span>
        <span class="acuity-icon acuity-icon--xl s1__step-icon" :style="{ '--icon': `url('/ds/icons/${step.icon}.svg')` }" />
        <span class="s1__step-text">
          <span class="text-subtitle-medium">{{ step.title }}</span>
          <span class="text-body-book s1__step-desc">{{ step.desc }}</span>
        </span>
      </li>
    </ul>

    <div class="acuity-bottom-nav">
      <button type="button" class="acuity-button acuity-button--primary acuity-button--md acuity-button--full-width" @click="variants.navigateTo('s2')">
        Start setup
      </button>
      <button type="button" class="acuity-button acuity-button--tertiary acuity-button--md acuity-button--full-width mobile-only" @click="variants.navigateTo('s_loading_home')">
        Skip
      </button>
    </div>
  </div>
</template>

<style scoped>
.s1 {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.s1__header {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-8);
  padding: var(--acuity-spacing-32) var(--acuity-spacing-24) 0;
}
.s1__heading {
  max-width: 320px;
}
.s1__subheading {
  color: var(--acuity-fg-muted);
  max-width: 320px;
}
.s1__carousel {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.s1__asset-area {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 210px;
  margin: 0 auto;
}
.s1__card {
  position: absolute;
  width: 230px;
  background: var(--acuity-bg-base);
  border-radius: var(--acuity-border-radius-sm);
  overflow: hidden;
  opacity: 0;
  transition: opacity 420ms ease, transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.s1__card img {
  display: block;
  width: 100%;
  height: auto;
}
.s1__card--behind { width: 220px; left: 48px; top: 144px; z-index: 1; box-shadow: var(--acuity-shadow-light-100); transform: translateY(-10px) rotate(3deg); }
.s1__card--center { width: 250px; left: 33px; top: 82px; z-index: 2; box-shadow: var(--acuity-shadow-light-200); transform: translateY(-10px) rotate(-8deg); }
.s1__card--front { width: 280px; left: 20px; top: 20px; z-index: 3; box-shadow: var(--acuity-shadow-light-300); transform: translateY(-10px) rotate(8deg); }
.s1__asset-area--in .s1__card { opacity: 1; }
.s1__asset-area--in .s1__card--behind { transform: translateY(0) rotate(0deg); }
.s1__asset-area--in .s1__card--center { transform: translateY(0) rotate(-3deg); }
.s1__asset-area--in .s1__card--front { transform: translateY(0) rotate(5deg); }

.s1__steps {
  display: none;
  list-style: none;
  flex-direction: column;
  gap: var(--acuity-spacing-24);
  max-width: 900px;
  margin: 0 auto;
  padding: var(--acuity-spacing-32) var(--acuity-spacing-24);
}
.s1__step {
  display: flex;
  align-items: flex-start;
  gap: var(--acuity-spacing-16);
}
.s1__step-num { color: var(--acuity-fg-muted); }
.s1__step-icon { color: var(--acuity-fg-default); margin-top: var(--acuity-spacing-4); }
.s1__step-text {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-4);
}
.s1__step-desc { color: var(--acuity-fg-muted); }

/* Ported from #s1.screen.active (c3_c1/index.html:4457-4520). */
@media (min-width: 1024px) {
  .s1 {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
  .s1__header {
    text-align: center;
    align-items: center;
    max-width: 560px;
    margin: var(--acuity-spacing-48) auto 0;
  }
  .s1__heading,
  .s1__subheading { max-width: none; }
  .s1__steps { display: grid; grid-template-columns: repeat(3, 1fr); }
  .s1__step { flex-direction: column; text-align: center; align-items: center; }
  .acuity-bottom-nav { justify-content: flex-end; }
  .acuity-bottom-nav .acuity-button--primary { flex: none; min-width: 200px; }
}
</style>
