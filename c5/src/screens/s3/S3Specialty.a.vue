<script setup>
import { computed, ref, watch } from 'vue';
import VariantSlot from '../../components/VariantSlot.vue';
import DesktopTopNav from '../../components/DesktopTopNav.vue';
import { useProtoStore } from '../../stores/proto.js';
import { useVariantStore } from '../../stores/variants.js';
import { useCatalogStore } from '../../stores/catalog.js';

// Ported from c3_c1/index.html s3 section (:6484) + showS3Chips() (:10020) +
// selectS3SpecChip() (:10087). Chip labels come from the real templates-JSON
// pipeline (catalog.chips) once it's loaded; SPEC_CHIPS is only the
// pre-fetch fallback so the grid isn't empty for the first paint, mirroring
// showS3Chips()'s own "defer until JSON is ready" guard (:10023). Headings
// (SPEC_HEADING) aren't in the JSON in the original either — that's
// hardcoded UI copy there too.
const SPEC_CHIPS = {
  beauty: ['Hair', 'Nails', 'Lash & Brows', 'Barber', 'Skincare', 'Makeup', 'Other'],
  wellness: ['Massage', 'Acupuncture', 'Day Spa', 'Med Spa', 'Physical Therapy', 'Mental Health', 'Nutrition', 'Other'],
  fitness: ['Personal Training', 'Yoga', 'Sports Coaching', 'Pilates', 'Dance Lessons', 'Gym', 'Other'],
  business: ['Consulting', 'Professional Coaching', 'Legal', 'Photography', 'Marketing', 'Finance', 'Nonprofit', 'Other'],
  home_services: ['Cleaning', 'Home Repair', 'Auto Care', 'Plumbing & HVAC', 'Construction', 'Landscaping', 'Other'],
  arts_education: ['Music', 'Tutoring', 'Dance', 'Theater', 'Ceramics', 'Visual Arts', 'Other'],
};
const SPEC_HEADING = {
  beauty: 'What is your beauty specialty?',
  wellness: 'What is your wellness specialty?',
  fitness: 'What is your fitness specialty?',
  business: 'What is your business specialty?',
  home_services: 'What is your home services specialty?',
  arts_education: 'What is your arts & education specialty?',
};

const proto = useProtoStore();
const variants = useVariantStore();
const catalog = useCatalogStore();

const isOther = computed(
  () => proto.currentIndustry === 'other' || proto.currentIndustrySpecific === 'Other',
);
const chips = computed(() => {
  if (catalog.ready && catalog.selectedVertical) return catalog.chips;
  return SPEC_CHIPS[proto.currentIndustry] ?? SPEC_CHIPS.beauty;
});
const heading = computed(() =>
  isOther.value ? 'What best describes what you do?' : (SPEC_HEADING[proto.currentIndustry] ?? 'What do you specialize in?'),
);

const otherText = ref('');
watch(
  () => proto.currentIndustry,
  () => {
    proto.currentIndustrySpecific = '';
    otherText.value = '';
  },
);

function chooseChip(label) {
  if (label === 'Other') {
    proto.selectSpecialty('Other');
    return;
  }
  proto.selectSpecialty(label);
  catalog.selectIndustry(label);
  // Matches selectS3SpecChip()'s 200ms flash-then-advance at c3_c1/index.html:10108.
  setTimeout(() => variants.navigateTo('s4'), 200);
}

function back() {
  if (isOther.value && proto.currentIndustry !== 'other') {
    proto.selectSpecialty('');
    return;
  }
  variants.navigateTo('s2', { replace: false });
}
</script>

<template>
  <div class="s3">
    <DesktopTopNav @close="variants.navigateTo('s_loading_home')" />
    <VariantSlot name="topNav" step-label="Step 2 of 4" class="mobile-only" @back="back" />

    <div class="acuity-wizard-header">
      <span class="text-label desktop-only s3__eyebrow">Step 2 of 4</span>
      <h2 class="acuity-wizard-header__heading">{{ heading }}</h2>
      <p class="acuity-wizard-header__subheading">
        {{ isOther ? 'Tell us your industry or the services you provide' : 'Select the option that best matches your business.' }}
      </p>
    </div>

    <div v-if="!isOther" class="s3__grid">
      <label
        v-for="label in chips"
        :key="label"
        class="acuity-radio-card acuity-radio-card--tile"
      >
        <input
          type="radio"
          name="specialty"
          class="acuity-radio-card__input"
          :checked="proto.currentIndustrySpecific === label"
          @change="chooseChip(label)"
        >
        <span class="acuity-radio-card__card">
          <span class="acuity-radio-card__content">
            <span class="acuity-radio-card__title">{{ label }}</span>
          </span>
        </span>
      </label>
    </div>

    <div v-else class="s3__other">
      <label class="acuity-input acuity-input--md">
        <span class="acuity-input__label">Describe your business</span>
        <span class="acuity-input__wrapper">
          <input
            v-model="otherText"
            type="text"
            class="acuity-input__field"
            placeholder="e.g. Party planning"
            autocomplete="off"
          >
        </span>
      </label>
      <button
        type="button"
        class="acuity-button acuity-button--primary acuity-button--md"
        :disabled="!otherText.trim()"
        @click="proto.selectSpecialty(otherText.trim()); variants.navigateTo('s4')"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.s3__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--acuity-spacing-12);
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}
.s3__grid > .acuity-radio-card {
  flex: 1 0 calc(50% - var(--acuity-spacing-8));
  min-width: 130px;
}
.s3__other {
  display: flex;
  flex-direction: column;
  gap: var(--acuity-spacing-16);
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}

/* Ported from #s3.screen.active (c3_c1/index.html:4627-4764). */
@media (min-width: 1024px) {
  .s3 {
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
  .s3__eyebrow { margin-bottom: var(--acuity-spacing-8); }
  .s3__grid {
    max-width: 848px;
    margin-inline: auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .s3__grid > .acuity-radio-card { flex: none; min-width: 0; }
  .s3__other { max-width: 480px; margin-inline: auto; width: 100%; }
}
</style>
