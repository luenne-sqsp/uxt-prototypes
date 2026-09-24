<script setup>
import { computed, ref, watch } from 'vue';
import VariantSlot from '../../components/VariantSlot.vue';
import DesktopTopNav from '../../components/DesktopTopNav.vue';
import { useProtoStore } from '../../stores/proto.js';
import { useVariantStore } from '../../stores/variants.js';
import { useCatalogStore } from '../../stores/catalog.js';

// Ported from explorations/s2-s3-industry-specialty/v1-explicit-next.html —
// the "Explicit Next / Inline Expand" treatment: no auto-advance, and
// "Something else" morphs the grid into an inline textarea instead of
// opening a separate combobox screen. Chip labels come from the real
// templates-JSON pipeline (catalog.chips) once loaded, same as S3Specialty.a;
// SPECIALTIES is only the pre-fetch fallback.
const SPECIALTIES = {
  beauty: ['Hair', 'Nails', 'Lash & Brows', 'Barber', 'Skincare', 'Makeup'],
  wellness: ['Massage', 'Acupuncture', 'Day Spa', 'Med Spa', 'Physical Therapy', 'Mental Health'],
  fitness: ['Personal Training', 'Yoga', 'Sports Coaching', 'Pilates', 'Dance Lessons', 'Gym'],
  business: ['Consulting', 'Professional Coaching', 'Legal', 'Photography', 'Marketing', 'Finance'],
  home_services: ['Cleaning', 'Home Repair', 'Auto Care', 'Plumbing & HVAC', 'Construction', 'Landscaping'],
  arts_education: ['Music', 'Tutoring', 'Dance', 'Theater', 'Ceramics', 'Visual Arts'],
};

const proto = useProtoStore();
const variants = useVariantStore();
const catalog = useCatalogStore();

const specialties = computed(() => {
  if (catalog.ready && catalog.selectedVertical) {
    return catalog.chips.filter((label) => label !== 'Other');
  }
  return SPECIALTIES[proto.currentIndustry] ?? SPECIALTIES.beauty;
});
const somethingElseText = ref('');
const somethingElseOpen = ref(false);

watch(
  () => proto.currentIndustry,
  () => {
    proto.currentIndustrySpecific = '';
    somethingElseText.value = '';
    somethingElseOpen.value = false;
  },
);

function chooseChip(label) {
  somethingElseOpen.value = false;
  somethingElseText.value = '';
  proto.selectSpecialty(label);
  catalog.selectIndustry(label);
}

function expandSomethingElse() {
  somethingElseOpen.value = true;
  proto.currentIndustrySpecific = '';
}

const canAdvance = computed(() =>
  somethingElseOpen.value ? somethingElseText.value.trim().length > 0 : !!proto.currentIndustrySpecific,
);

function next() {
  if (somethingElseOpen.value) proto.selectSpecialty(somethingElseText.value.trim());
  variants.navigateTo('s4');
}
</script>

<template>
  <div class="s3b">
    <DesktopTopNav @close="variants.navigateTo('s_loading_home')" />
    <VariantSlot name="topNav" step-label="Step 2 of 4" class="mobile-only" @back="variants.navigateTo('s2')" />

    <div class="acuity-wizard-header">
      <span class="text-label desktop-only s3b__eyebrow">Step 2 of 4</span>
      <h2 class="acuity-wizard-header__heading">What is your specialty?</h2>
      <p class="acuity-wizard-header__subheading">Select the option that best matches your business.</p>
    </div>

    <div class="s3b__grid">
      <label
        v-for="label in specialties"
        :key="label"
        class="acuity-radio-card acuity-radio-card--tile"
      >
        <input
          type="radio"
          name="specialty-b"
          class="acuity-radio-card__input"
          :checked="!somethingElseOpen && proto.currentIndustrySpecific === label"
          @change="chooseChip(label)"
        >
        <span class="acuity-radio-card__card">
          <span class="acuity-radio-card__content">
            <span class="acuity-radio-card__title">{{ label }}</span>
          </span>
        </span>
      </label>
    </div>

    <button
      v-if="!somethingElseOpen"
      type="button"
      class="acuity-chip acuity-chip--md acuity-chip--interactive s3b__something-else"
      @click="expandSomethingElse"
    >
      Something else
    </button>

    <div v-else class="s3b__something-else-expanded">
      <label class="acuity-input acuity-input--md">
        <span class="acuity-input__label">Something else</span>
        <span class="acuity-input__wrapper">
          <textarea
            v-model="somethingElseText"
            class="acuity-input__field acuity-textarea"
            rows="3"
            placeholder="I'm a dog groomer offering baths ($50, 30 min) and full grooms ($100, 60min). We're open Tuesdays…"
          />
        </span>
      </label>
    </div>

    <div class="acuity-bottom-nav">
      <button
        type="button"
        class="acuity-button acuity-button--primary acuity-button--md acuity-button--full-width"
        :disabled="!canAdvance"
        @click="next"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.s3b__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--acuity-spacing-12);
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}
.s3b__grid > .acuity-radio-card {
  flex: 1 0 calc(50% - var(--acuity-spacing-8));
  min-width: 130px;
}
.s3b__something-else {
  margin: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}
.s3b__something-else-expanded {
  padding: 0 var(--acuity-spacing-24) var(--acuity-spacing-24);
}

@media (min-width: 1024px) {
  .s3b {
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
  .s3b__eyebrow { margin-bottom: var(--acuity-spacing-8); }
  .s3b__grid {
    max-width: 848px;
    margin-inline: auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .s3b__grid > .acuity-radio-card { flex: none; min-width: 0; }
  .s3b__something-else,
  .s3b__something-else-expanded { max-width: 480px; margin-inline: auto; width: 100%; }
}
</style>
