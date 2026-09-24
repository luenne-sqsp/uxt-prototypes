// Ported from c3_c1/index.html:8630 (_parseDurationMin) and :12439 (formatDuration).

export function parseDurationMin(s) {
  const str = String(s || '');
  let mins = 0;
  const hr = str.match(/(\d+(?:\.\d+)?)\s*hr/i);
  const min = str.match(/(\d+)\s*min/i);
  if (hr) mins += parseFloat(hr[1]) * 60;
  if (min) mins += parseInt(min[1], 10);
  return mins > 0 ? Math.round(mins) : 60;
}

export function formatDuration(d) {
  const mins = parseDurationMin(d);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hourStr = h + (h === 1 ? ' hour' : ' hours');
  return m ? `${hourStr} and ${m} ${m === 1 ? 'minute' : 'minutes'}` : hourStr;
}

// Ported from c3_c1/index.html:8420 (_isFreePrice).
export function isFreePrice(p) {
  return !p || /^\$?0(\.0+)?$/.test(String(p).trim());
}
