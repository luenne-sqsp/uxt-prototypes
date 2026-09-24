import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Ported from c3_c1/index.html:8130-8363 — the templates-JSON pipeline that
// backs S3's specialty chips and S5's "AI-generated" appointment catalog.
// template_sets.json + service_types.json cover the 6 named verticals;
// runtime_industry_templates.json (1,074 industries) backs the "Other"
// vertical's searchable long-tail. Everything downstream only ever reads
// the resolved `{ s3_chips, fallback_appointments, industries }` shape,
// regardless of which JSON file it came from.

const INDUSTRY_TEMPLATE_KEY = {
  beauty: 'Beauty',
  business: 'Business Services',
  wellness: 'Wellness',
  fitness: 'Fitness',
  arts_education: 'Arts & Education',
  home_services: 'Home Services',
  other: 'Other',
};

const VERTICAL_KEY_MAP = {
  beauty: 'Beauty',
  wellness: 'Wellness',
  fitness: 'Fitness',
  business: 'Business Services',
  home_services: 'Home Services',
  arts_education: 'Arts & Education',
};

const VERTICAL_CHIP_SLUGS = {
  Beauty: {
    Hair: 'hair_salon', Nails: 'nail_services', 'Lash & Brows': 'lash_brows',
    Barber: 'barber', Skincare: 'skincare', Makeup: 'makeup',
  },
  Wellness: {
    Massage: 'massage', Acupuncture: 'acupuncture', 'Day Spa': 'day_spa',
    'Med Spa': 'med_spa', 'Physical Therapy': 'physical_therapy',
    'Mental Health': 'therapy', Nutrition: 'nutrition',
  },
  Fitness: {
    'Personal Training': 'personal_training', Yoga: 'yoga',
    'Sports Coaching': 'sports_practice', Pilates: 'pilates',
    'Dance Lessons': 'dance', Gym: 'gym',
  },
  'Business Services': {
    Consulting: 'consulting', 'Professional Coaching': 'professional_coaching',
    Legal: 'legal', Photography: 'photography', Marketing: 'marketing',
    Finance: 'finance', Nonprofit: 'nonprofit',
  },
  'Home Services': {
    Cleaning: 'cleaning', 'Home Repair': 'home_repair', 'Auto Care': 'auto_care',
    'Plumbing & HVAC': 'plumbing_hvac', Construction: 'construction',
    Landscaping: 'landscaping',
  },
  'Arts & Education': {
    Music: 'music', Tutoring: 'tutoring', Dance: 'dance',
    Theater: 'theater', Ceramics: 'ceramics', 'Visual Arts': 'visual_arts',
  },
};

const VERTICAL_FALLBACK_APPTS = {
  Beauty: [
    { name: 'Beauty Consultation', duration: '30 min', price: '$0' },
    { name: 'Signature Treatment', duration: '1 hr', price: '$85' },
    { name: 'Express Service', duration: '30 min', price: '$40' },
    { name: 'Refresh & Touch-Up', duration: '45 min', price: '$55' },
  ],
  Wellness: [
    { name: 'Wellness Consultation', duration: '1 hr', price: '$90' },
    { name: 'Relaxing Massage', duration: '1 hr', price: '$95' },
    { name: 'Holistic Therapy Session', duration: '1 hr', price: '$100' },
    { name: 'Breathwork & Mindfulness', duration: '1 hr', price: '$75' },
  ],
  Fitness: [
    { name: 'Fitness Consultation', duration: '45 min', price: '$60' },
    { name: '1-on-1 Training Session', duration: '1 hr', price: '$80' },
    { name: 'Group Fitness Class', duration: '1 hr', price: '$25' },
    { name: 'Movement Assessment', duration: '45 min', price: '$60' },
  ],
  'Business Services': [
    { name: 'Intro Consultation', duration: '30 min', price: '$0' },
    { name: 'Strategy Session', duration: '1 hr', price: '$200' },
    { name: 'Project Review', duration: '1 hr', price: '$150' },
    { name: 'Follow-Up Meeting', duration: '45 min', price: '$100' },
  ],
  'Home Services': [
    { name: 'Service Consultation', duration: '30 min', price: '$0' },
    { name: 'On-Site Assessment', duration: '1 hr', price: '$75' },
    { name: 'Repair Appointment', duration: '1 hr', price: '$120' },
    { name: 'Follow-Up Visit', duration: '30 min', price: '$50' },
  ],
  'Arts & Education': [
    { name: 'Intro Consultation', duration: '30 min', price: '$0' },
    { name: '1-on-1 Coaching Session', duration: '1 hr', price: '$100' },
    { name: 'Skills Workshop', duration: '1.5 hrs', price: '$75' },
    { name: 'Progress Check-in', duration: '30 min', price: '$50' },
  ],
  Other: [
    { name: 'Consultation', duration: '30 min', price: '$50' },
    { name: 'Virtual Lesson', duration: '60 min', price: '$50' },
    { name: 'Standard Service', duration: '60 min', price: '$100' },
    { name: 'Follow-up', duration: '45 min', price: '$25' },
    { name: 'Strategy Call', duration: '90 min', price: '$250' },
  ],
};

const GENERIC_FALLBACK = [
  { name: 'Intro Consultation', duration: '30 min', price: '$0' },
  { name: 'Standard Session', duration: '1 hr', price: '$100' },
  { name: 'Working Session', duration: '1 hr', price: '$80' },
  { name: 'Follow-Up', duration: '30 min', price: '$50' },
];

function resolveSetAppointments(set, serviceTypes) {
  return (set.appointments || []).map((svcId) => serviceTypes[svcId] || null).filter(Boolean);
}

async function fetchJson(path) {
  const res = await fetch(path);
  return res.json();
}

export const useCatalogStore = defineStore('catalog', () => {
  const templates = ref({});
  const verticalPrefilterLabels = ref({});
  const verticalOtherTop5 = ref({});
  const selectedVertical = ref(null);
  const selectedIndustry = ref(null);
  const ready = ref(false);

  let readyPromise = null;

  function load() {
    if (!readyPromise) {
      readyPromise = Promise.all([
        fetchJson('/templates/template_sets.json'),
        fetchJson('/templates/service_types.json'),
        fetchJson('/templates/runtime_industry_templates.json'),
        fetchJson('/templates/industry_mapping.json'),
        fetchJson('/templates/vertical_prefilter_v2.json'),
        fetchJson('/templates/vertical_other_top5_v2.json'),
      ]).then(
        ([templateSets, serviceTypes, runtimeIndustries, industryMapping, verticalPrefilter, verticalOtherTop5Data]) => {
          const out = {};

          Object.entries(VERTICAL_CHIP_SLUGS).forEach(([verticalName, chipSlugs]) => {
            const industries = {};
            Object.entries(chipSlugs).forEach(([label, slug]) => {
              const set = templateSets[slug];
              if (!set) return;
              industries[label] = {
                create_name_placeholder: set.create_name_placeholder || '',
                create_name_chips: set.create_name_chips || [],
                appointments: resolveSetAppointments(set, serviceTypes),
              };
            });
            out[verticalName] = {
              s3_chips: Object.keys(chipSlugs).concat('Other'),
              fallback_appointments: VERTICAL_FALLBACK_APPTS[verticalName],
              industries,
            };
          });

          const tierRank = (slug) => (slug === 'generic' ? 2 : slug?.startsWith('arch_') ? 1 : 0);
          const otherIndustries = {};
          Object.entries(runtimeIndustries)
            .map(([industryId, entry]) => ({
              industryId,
              entry,
              tier: tierRank(industryMapping[industryId] || 'generic'),
            }))
            .sort((a, b) => a.tier - b.tier || a.entry.labels['en-US'].localeCompare(b.entry.labels['en-US']))
            .forEach(({ entry }) => {
              const label = entry.labels['en-US'];
              otherIndustries[label] = {
                create_name_placeholder: entry.create_name_placeholder || '',
                create_name_chips: entry.create_name_chips || [],
                appointments: entry.appointments || [],
              };
            });
          out.Other = {
            s3_chips_searchlist: Object.keys(otherIndustries),
            fallback_appointments: VERTICAL_FALLBACK_APPTS.Other,
            industries: otherIndustries,
          };

          templates.value = out;

          const prefilterLabels = {};
          Object.entries(verticalPrefilter).forEach(([vertical, ids]) => {
            prefilterLabels[vertical] = ids
              .map((id) => runtimeIndustries[id]?.labels['en-US'])
              .filter(Boolean);
          });
          verticalPrefilterLabels.value = prefilterLabels;
          verticalOtherTop5.value = verticalOtherTop5Data['specialty-other-top5'] || {};
          ready.value = true;
        },
      );
    }
    return readyPromise;
  }

  const activeTemplate = computed(() => {
    const vertical = selectedVertical.value && templates.value[selectedVertical.value];
    const industry = vertical && selectedIndustry.value && vertical.industries?.[selectedIndustry.value];
    return industry || vertical || null;
  });

  const activeTier = computed(() => {
    if (!selectedVertical.value) return 'generic';
    return selectedIndustry.value ? 'full' : 'vertical';
  });

  function selectVertical(industryKey) {
    selectedVertical.value = VERTICAL_KEY_MAP[industryKey] || INDUSTRY_TEMPLATE_KEY[industryKey] || null;
    selectedIndustry.value = null;
  }

  function selectIndustry(label) {
    selectedIndustry.value = label;
  }

  const chips = computed(() => templates.value[selectedVertical.value]?.s3_chips ?? []);

  function templateFallback() {
    const tpl = activeTemplate.value;
    const src = tpl?.appointments || tpl?.fallback_appointments || GENERIC_FALLBACK;
    return src.slice(0, 6).map((item, i) => ({
      id: `tmpl_${i}`,
      name: item.name || `Service ${i + 1}`,
      duration: item.duration || '60 min',
      price: item.price || '$0',
      description: '',
    }));
  }

  return {
    templates,
    verticalPrefilterLabels,
    verticalOtherTop5,
    selectedVertical,
    selectedIndustry,
    ready,
    chips,
    activeTemplate,
    activeTier,
    load,
    selectVertical,
    selectIndustry,
    templateFallback,
  };
});
