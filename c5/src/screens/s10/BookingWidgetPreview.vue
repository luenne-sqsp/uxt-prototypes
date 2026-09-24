<script setup>
import { computed } from 'vue';
import { useProtoStore } from '../../stores/proto.js';
import { formatDuration } from '../../utils/duration.js';

// Ported from _renderBookingWidgetInto() (c3_c1/index.html:11467) — mobile
// instance only (the desktop instance shares the same function but isn't
// built in this pass). Kept deliberately un-themed, matching the original:
// _currentPalette/_currentFont are read by the swatch/font pickers and by
// openSchedulingPage()'s payload, but were never actually applied to this
// mini widget's own colors either — only the (desktop-only, not-ported)
// live iframe preview reflects them.
defineProps({ large: { type: Boolean, default: false } });

const proto = useProtoStore();

const days = computed(() => (proto.selectedHoursLabel || 'Monday to Friday · 9 am – 5 pm').split('·')[0].trim());
const hours = computed(() => (proto.selectedHoursLabel || '').split('·')[1]?.trim() ?? '');
const appts = computed(() => proto.effectiveSelectedAppts);
</script>

<template>
  <div class="booking-widget" :class="{ 'booking-widget--large': large }">
    <div class="booking-widget__date">
      <span class="booking-widget__days">{{ days }}</span>
      <span v-if="hours" class="booking-widget__hours">&nbsp;{{ hours }}</span>
    </div>

    <div v-if="appts.length > 1" class="booking-widget__multi">
      <div v-for="appt in appts" :key="appt.id" class="booking-widget__multi-row">
        <div class="booking-widget__info">
          <span class="booking-widget__name">{{ appt.name }}</span>
          <span class="booking-widget__meta">{{ formatDuration(appt.duration) }} · {{ appt.price }}</span>
        </div>
        <button type="button" class="booking-widget__book">BOOK</button>
      </div>
    </div>
    <div v-else class="booking-widget__content">
      <div class="booking-widget__info booking-widget__info--centered">
        <span class="booking-widget__name">{{ appts[0]?.name || 'Your service' }}</span>
        <span class="booking-widget__meta">{{ formatDuration(appts[0]?.duration || '60 min') }} @ {{ appts[0]?.price || '$0' }}</span>
      </div>
      <button type="button" class="booking-widget__book">BOOK</button>
    </div>
  </div>
</template>

<style scoped>
.booking-widget {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  border-radius: var(--acuity-border-radius-md);
  overflow: hidden;
  box-shadow: var(--acuity-shadow-light-300);
}
.booking-widget__date {
  background: var(--acuity-bg-inset);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--acuity-spacing-12) var(--acuity-spacing-16);
  font-weight: var(--acuity-font-weight-semibold);
  font-size: 12px;
  color: var(--acuity-fg-default);
  white-space: nowrap;
  overflow: hidden;
}
.booking-widget__hours {
  color: var(--acuity-fg-muted);
  font-weight: var(--acuity-font-weight-book);
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}
.booking-widget__content {
  background: var(--acuity-bg-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--acuity-spacing-12);
  padding: var(--acuity-spacing-24);
}
.booking-widget__multi {
  background: var(--acuity-bg-base);
}
.booking-widget__multi-row {
  display: flex;
  align-items: center;
  gap: var(--acuity-spacing-8);
  padding: var(--acuity-spacing-12) var(--acuity-spacing-16);
  border-bottom: var(--acuity-border-width-hairline) solid var(--acuity-border-muted);
}
.booking-widget__multi-row:last-child { border-bottom: none; }
.booking-widget__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.booking-widget__info--centered {
  align-items: center;
  text-align: center;
}
.booking-widget__name {
  font-size: 12px;
  font-weight: var(--acuity-font-weight-bold);
  color: var(--acuity-fg-default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.booking-widget__meta {
  font-size: 12px;
  color: var(--acuity-fg-muted);
}
.booking-widget__book {
  flex-shrink: 0;
  background: var(--acuity-fg-default);
  color: var(--acuity-fg-on-strong);
  border: none;
  border-radius: var(--acuity-border-radius-sm);
  padding: var(--acuity-spacing-8) var(--acuity-spacing-16);
  font-size: 12px;
  font-weight: var(--acuity-font-weight-semibold);
  cursor: pointer;
}

/* Ported from .s10-desktop-widget (c3_c1/index.html:5589-5641) — used on
   S10 desktop, where the widget fills its column instead of sitting at a
   fixed mobile-card width. */
.booking-widget--large { max-width: 420px; }
.booking-widget--large .booking-widget__date { font-size: 14px; padding: var(--acuity-spacing-16) var(--acuity-spacing-20); }
.booking-widget--large .booking-widget__content { padding: var(--acuity-spacing-32); }
.booking-widget--large .booking-widget__multi-row { padding: var(--acuity-spacing-24); gap: var(--acuity-spacing-16); }
.booking-widget--large .booking-widget__name,
.booking-widget--large .booking-widget__meta { font-size: 16px; }
</style>
