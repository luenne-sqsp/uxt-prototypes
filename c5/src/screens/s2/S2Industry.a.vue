<script setup>
import VariantSlot from '../../components/VariantSlot.vue';
import DesktopTopNav from '../../components/DesktopTopNav.vue';
import { useProtoStore } from '../../stores/proto.js';
import { useVariantStore } from '../../stores/variants.js';
import { useCatalogStore } from '../../stores/catalog.js';

// Ported from c3_c1/index.html s2 section (:6381) + selectIndustry()
// (:9387). The create-flow priming that selectIndustry() also does
// (rebuildCreateChips()) belongs to s5's create sub-flow, not yet ported.
const INDUSTRIES = [
  { key: 'beauty', label: 'Beauty', icon: 'icon-industry-beauty' },
  { key: 'wellness', label: 'Wellness', icon: 'icon-industry-wellness' },
  { key: 'fitness', label: 'Fitness', icon: 'icon-industry-fitness' },
  { key: 'business', label: 'Business Services', icon: 'icon-industry-business' },
  { key: 'home_services', label: 'Home Services', icon: 'icon-industry-utility' },
  { key: 'arts_education', label: 'Arts & Education', icon: 'icon-industry-education' },
];

const proto = useProtoStore();
const variants = useVariantStore();
const catalog = useCatalogStore();

function choose(key) {
  proto.selectIndustry(key);
  catalog.selectVertical(key);
  // Matches the 160ms "flash selected, then advance" beat from selectIndustry()
  // at c3_c1/index.html:9414-9416.
  setTimeout(() => variants.navigateTo('s3'), 160);
}
</script>

<template>
  <div class="s2">
    <DesktopTopNav @close="variants.navigateTo('s_loading_home')" />
    <VariantSlot name="topNav" step-label="Step 1 of 4" class="mobile-only" @back="variants.navigateTo('s1', { replace: true })" />

    <div class="acuity-wizard-header">
      <span class="text-label desktop-only s2__eyebrow">Step 1 of 4</span>
      <h2 class="acuity-wizard-header__heading">What industry are you in?</h2>
      <p class="acuity-wizard-header__subheading">
        This will help us tailor and make relevant recommendations for your experience.
      </p>
    </div>

    <div class="s2__grid">
      <label
        v-for="industry in INDUSTRIES"
        :key="industry.key"
        class="acuity-radio-card acuity-radio-card--tile"
      >
        <input
          type="radio"
          name="industry"
          class="acuity-radio-card__input"
          :checked="proto.currentIndustry === industry.key"
          @change="choose(industry.key)"
        >
        <span class="acuity-radio-card__card">
          <span class="acuity-radio-card__icon">
            <span class="acuity-icon acuity-icon--xl" :style="{ '--icon': `url('/ds/icons/${industry.icon}.svg')` }" />
          </span>
          <span class="acuity-radio-card__content">
            <span class="acuity-radio-card__title">{{ industry.label }}</span>
          </span>
        </span>
      </label>

      <label class="acuity-radio-card acuity-radio-card--tile s2__other">
        <input
          type="radio"
          name="industry"
          class="acuity-radio-card__input"
          :checked="proto.currentIndustry === 'other'"
          @change="choose('other')"
        >
        <span class="acuity-radio-card__card">
          <span class="acuity-radio-card__content">
            <span class="acuity-radio-card__title">Other</span>
          </span>
        </span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.s2__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--acuity-spacing-12);
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}
.s2__grid > .acuity-radio-card {
  flex: 1 0 calc(50% - var(--acuity-spacing-8));
  min-width: 130px;
}
.s2__other {
  flex-basis: 100%;
}

/* Ported from #s2.screen.active (c3_c1/index.html:4627-4726). */
@media (min-width: 1024px) {
  .s2 {
    display: flex;
    flex-direction: column;
    background: var(--acuity-bg-base);
    min-height: 100dvh;
  }
  .acuity-wizard-header {
    text-align: center;
    max-width: 640px;
    margin-inline: auto;
  }
  .acuity-wizard-header__heading { font-size: 32px; }
  .acuity-wizard-header__subheading { font-size: 16px; }
  .s2__eyebrow { margin-bottom: var(--acuity-spacing-8); }
  .s2__grid {
    max-width: 848px;
    margin-inline: auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .s2__grid > .acuity-radio-card { flex: none; min-width: 0; }
  .s2__other { grid-column: 1 / -1; }
}
</style>
