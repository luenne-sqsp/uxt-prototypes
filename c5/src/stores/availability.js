import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProtoStore } from './proto.js';

// Ported from c3_c1/index.html's S9 availability model (:10647-11135), with
// one deliberate simplification: the original lets every enabled day carry
// its own independent set of time ranges (e.g. Tue 10-8 but Wed 9-5, or a
// split shift within one day). Here every block has a single shared
// start/end applied to whichever days are enabled — the common case — and
// the day-grid/popover editor collapses to day-toggle chips + two
// `<input type="time">` fields. Multi-range-per-day editing is not ported,
// same "faithful core mechanism, not every assistive extra" cut as S5's
// create/edit sheet.

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sat, Sun — matches _AVAIL_WEEK_ORDER (:10818)

// Ported from HOUR_PRESETS (c3_c1/index.html:8115), with each preset's
// `days` string pre-resolved to a boolean-per-day array instead of parsed
// at runtime (_presetToActiveDays, :10723) — there's no free-text hint
// (_s2AvailHint, fed by S3's "Other" combobox) in this port to merge in.
const HOUR_PRESETS = {
  beauty: { activeDays: [1, 0, 1, 1, 1, 1, 1], start: '10:00', end: '20:00' }, // Tue-Sun
  wellness: { activeDays: [0, 1, 1, 1, 1, 1, 1], start: '09:00', end: '18:00' }, // Mon-Sat
  fitness: { activeDays: [0, 1, 1, 1, 1, 1, 1], start: '06:00', end: '21:00' },
  business: { activeDays: [0, 1, 1, 1, 1, 1, 0], start: '09:00', end: '17:00' }, // Mon-Fri
  home_services: { activeDays: [0, 1, 1, 1, 1, 1, 1], start: '08:00', end: '18:00' },
  arts_education: { activeDays: [0, 1, 1, 1, 1, 1, 0], start: '08:00', end: '19:00' },
  other: { activeDays: [1, 0, 1, 1, 1, 1, 1], start: '10:00', end: '19:00' },
};

function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${period}` : `${h12} ${period}`;
}

// scheduling-page.html's postMessage payload expects "H:MM AM/PM" (its
// _dtNormalizeAvailability legacy-shape fallback, scheduling-page.html:1605
// — `avail.start || '9:00 AM'`) rather than the compact "10 am" used for
// on-screen labels, so this stays a separate export from fmtTime() above.
export function to12HourFull(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// Ported from _fmtRange (:11358): "9 am – 11 am" collapses to "9 – 11 am"
// when both ends share the same am/pm suffix.
function fmtRange(start, end) {
  const s = fmtTime(start);
  const e = fmtTime(end);
  return (s.slice(-2) === e.slice(-2) ? s.slice(0, -3) : s) + ' – ' + e;
}

// Ported from _availGroupedSummary/_availGroupDaysLabel (:10818-10847),
// simplified for a single shared range (no per-group range comparison
// needed — every enabled day already shares one range in this model).
function daysLabel(days) {
  const activeCount = days.filter(Boolean).length;
  if (activeCount === 0) return 'No days selected';
  if (activeCount === 7) return 'Every day';
  const groups = [];
  for (const i of WEEK_ORDER) {
    if (!days[i]) continue;
    const last = groups[groups.length - 1];
    if (last && WEEK_ORDER.indexOf(i) === WEEK_ORDER.indexOf(last[last.length - 1]) + 1) {
      last.push(i);
    } else {
      groups.push([i]);
    }
  }
  return groups
    .map((g) => (g.length === 1 ? DAYS_FULL[g[0]] : `${DAYS_ABBR[g[0]]} - ${DAYS_ABBR[g[g.length - 1]]}`))
    .join(', ');
}

function makeBlock(id, industry) {
  const preset = HOUR_PRESETS[industry] || HOUR_PRESETS.beauty;
  return { id, days: [...preset.activeDays].map(Boolean), start: preset.start, end: preset.end };
}

export const useAvailabilityStore = defineStore('availability', () => {
  const proto = useProtoStore();

  const globalBlock = ref(makeBlock('global', proto.currentIndustry));
  const perApptBlocks = ref({});
  const differentSetups = ref(false);

  function getBlock(key) {
    if (!key || key === 'global') return globalBlock.value;
    if (!perApptBlocks.value[key]) {
      perApptBlocks.value[key] = { ...globalBlock.value, id: key, days: [...globalBlock.value.days] };
    }
    return perApptBlocks.value[key];
  }

  // Cards to render: one shared 'global' card, or one per selected
  // appointment once "different setups" is on and 2+ are selected.
  const keys = computed(() =>
    differentSetups.value && proto.selectedAppts.length > 1
      ? proto.selectedAppts.map((a) => a.id)
      : ['global'],
  );

  function setDifferentSetups(on) {
    differentSetups.value = on;
    if (on) proto.selectedAppts.forEach((a) => getBlock(a.id));
  }

  function summary(block) {
    return { daysLabel: daysLabel(block.days), timeLabel: fmtRange(block.start, block.end) };
  }

  function apptLabel(key) {
    return proto.effectiveSelectedAppts.find((a) => a.id === key)?.name ?? 'Appointment';
  }

  const selectedHoursLabel = computed(() => {
    const block = getBlock(keys.value[0]);
    const { daysLabel: d, timeLabel: t } = summary(block);
    return `${d} · ${t}`;
  });

  return {
    globalBlock,
    perApptBlocks,
    differentSetups,
    keys,
    getBlock,
    setDifferentSetups,
    summary,
    apptLabel,
    selectedHoursLabel,
    DAYS_ABBR,
  };
});
