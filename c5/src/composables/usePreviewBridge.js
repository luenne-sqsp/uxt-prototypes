import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useProtoStore } from '../stores/proto.js';
import { useThemeStore, resolvePaletteHexes, resolveFontFamily } from '../stores/theme.js';
import { useAvailabilityStore, to12HourFull } from '../stores/availability.js';
import { parseDurationMin } from '../utils/duration.js';

// Ported from c3_c1/index.html's preview-iframe bridge: _buildPreviewPayload()
// (:8658), _syncPreviewIframe() (:8698), the _PREVIEWS map (:8733), and
// _scrollS9PreviewDown() (:8748). The original waits for the iframe's native
// 'load' event before it considers the preview "ready"; scheduling-page.html
// (:1765) actually posts an explicit `{type:'preview-ready'}` back to its
// parent, which is a cleaner handshake, so this bridge listens for that
// instead of 'load'.
export function usePreviewBridge(view) {
  const proto = useProtoStore();
  const theme = useThemeStore();
  const avail = useAvailabilityStore();

  const iframeRef = ref(null);
  const ready = ref(false);

  function buildPayload() {
    const hasSelection = proto.selectedAppts.length > 0;
    const services = proto.effectiveSelectedAppts.map((a) => ({
      name: a.name,
      duration: a.duration,
      price: a.price,
      description: a.description || '',
    }));
    const block = avail.getBlock(avail.keys[0]);
    return {
      view,
      services,
      palette: resolvePaletteHexes(theme.paletteKey),
      font: resolveFontFamily(theme.fontKey),
      dark: theme.dark,
      skeleton: !hasSelection,
      availability: { days: block.days, start: to12HourFull(block.start), end: to12HourFull(block.end) },
      duration: hasSelection ? parseDurationMin(services[0].duration) : 60,
      hours: avail.selectedHoursLabel,
    };
  }

  function post(message) {
    try {
      // Pinia state (e.g. availability's day array) is a reactive Proxy,
      // which postMessage's structured-clone algorithm can't serialize
      // (throws DataCloneError). JSON round-trip strips reactivity down to
      // plain data — safe here since every field is already JSON-shaped.
      iframeRef.value?.contentWindow?.postMessage(JSON.parse(JSON.stringify(message)), '*');
    } catch (_) {
      // cross-origin or not yet attached
    }
  }

  function sync() {
    if (!ready.value) return;
    post({ type: 'preview-update', payload: buildPayload() });
  }

  function scrollHint(top) {
    if (!ready.value) return;
    post({ type: 'scroll-hint', top });
  }

  function onMessage(e) {
    if (e.source !== iframeRef.value?.contentWindow) return;
    if (e.data?.type === 'preview-ready') {
      ready.value = true;
      sync();
    }
  }
  window.addEventListener('message', onMessage);
  onBeforeUnmount(() => window.removeEventListener('message', onMessage));

  // Re-sync whenever anything the payload depends on changes.
  const payloadInputs = computed(() => [
    proto.selectedAppts,
    proto.apptEdits,
    theme.paletteKey,
    theme.fontKey,
    theme.dark,
    avail.globalBlock,
    avail.differentSetups,
  ]);
  watch(payloadInputs, sync, { deep: true });

  return { iframeRef, sync, scrollHint };
}
