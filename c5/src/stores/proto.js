import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Shared prototype state — lives outside every screen component so a variant
// swap (different component, same store) never resets it. Ported from
// `const state` in c3_c1/index.html:8368. Fields are added as the screens
// that use them get ported; `businessDesc` from the original is dropped —
// nothing in c3_c1 sets it either ("no UI sets this anymore").
export const useProtoStore = defineStore('proto', () => {
  const currentIndustry = ref('beauty');
  const currentIndustrySpecific = ref('');
  const catalogOverride = ref(null);
  const selectedAppts = ref([]);
  const apptEdits = ref({});
  const editingApptId = ref(null);
  const selectedHoursLabel = ref('');
  // Ported from the bare `arrivedHomeFromSkip` global (c3_c1/index.html:12133)
  // — drives which s_home state renders. Set true by S1's Skip link, cleared
  // the moment the wizard is actually entered (S2).
  const arrivedHomeFromSkip = ref(false);

  function selectIndustry(key) {
    currentIndustry.value = key;
    currentIndustrySpecific.value = '';
    catalogOverride.value = null;
    selectedAppts.value = [];
    arrivedHomeFromSkip.value = false;
  }

  function selectSpecialty(label) {
    currentIndustrySpecific.value = label;
  }

  // Ported from applyEdits() (c3_c1/index.html:8418).
  function withEdits(appt) {
    const patch = apptEdits.value[appt.id];
    return patch ? { ...appt, ...patch } : appt;
  }

  const effectiveSelectedAppts = computed(() => selectedAppts.value.map(withEdits));

  // Ported from addAppt() (:8788), minus the card-collapse animation —
  // handled here by CSS list-transition on the .appt-list, not JS-driven
  // max-height/opacity choreography per element.
  function addAppt(appt) {
    if (selectedAppts.value.length >= 3) return false;
    if (selectedAppts.value.some((a) => a.id === appt.id)) return false;
    selectedAppts.value.push(appt);
    return true;
  }

  function removeAppt(id) {
    selectedAppts.value = selectedAppts.value.filter((a) => a.id !== id);
  }

  function saveEdit(id, patch) {
    apptEdits.value = { ...apptEdits.value, [id]: patch };
  }

  return {
    currentIndustry,
    currentIndustrySpecific,
    catalogOverride,
    selectedAppts,
    effectiveSelectedAppts,
    apptEdits,
    editingApptId,
    selectedHoursLabel,
    arrivedHomeFromSkip,
    selectIndustry,
    selectSpecialty,
    withEdits,
    addAppt,
    removeAppt,
    saveEdit,
  };
});
