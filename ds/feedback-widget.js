/*
 * Feedback widget — drop this single <script src="…/ds/feedback-widget.js">
 * tag into any prototype to get a click-to-comment overlay backed by
 * api/feedback-comments.js (Vercel Blob storage, one JSON file per
 * prototype). No other markup or CSS include is required — this file
 * injects ds/feedback-widget.css and all of its own DOM.
 *
 * Prototype identity: reads data-prototype-id off this <script> tag, else
 * falls back to the first path segment (e.g. "c3_a" for /c3_a/index.html).
 *
 * Pin anchoring: positions are stored as percentages of the nearest
 * `.screen.active` element (the wizard-step container used by c3_a/c3_b),
 * falling back to <body>. That's simple and resize-safe, but is a
 * per-screen click position, not a specific DOM element — good enough for
 * "roughly here" peer feedback without needing brittle CSS-selector
 * anchoring. See CLAUDE.md's iframe-wrapper plan for a more robust
 * successor once this is validated.
 *
 * Visibility: this is a one-way suggestion box, not a shared thread.
 * Anyone with the link can drop a pin (POST is open), but reading existing
 * comments (GET) and resolving them (PATCH) requires an admin token that
 * api/feedback-comments.js checks against FEEDBACK_ADMIN_TOKEN. Visit once
 * with ?feedbackAdmin=<token> in the URL to unlock admin view on this
 * device — it's cached in localStorage from then on and stripped from the
 * URL bar so it doesn't end up in a shared link by accident.
 */
(function () {
  if (window.__feedbackWidgetLoaded) return;
  window.__feedbackWidgetLoaded = true;

  var CURRENT_SCRIPT = document.currentScript;
  var DS_BASE = CURRENT_SCRIPT
    ? CURRENT_SCRIPT.src.replace(/feedback-widget\.js.*$/, '')
    : '../ds/';
  var PROTOTYPE_ID =
    (CURRENT_SCRIPT && CURRENT_SCRIPT.getAttribute('data-prototype-id')) ||
    location.pathname.split('/').filter(Boolean)[0] ||
    'root';
  var API_URL = '/api/feedback-comments?prototypeId=' + encodeURIComponent(PROTOTYPE_ID);
  var AUTHOR_KEY = 'feedbackWidget:authorName';
  var ADMIN_TOKEN_KEY = 'feedbackWidget:adminToken';

  var urlParams = new URLSearchParams(location.search);
  var tokenFromUrl = urlParams.get('feedbackAdmin');
  if (tokenFromUrl) {
    localStorage.setItem(ADMIN_TOKEN_KEY, tokenFromUrl);
    urlParams.delete('feedbackAdmin');
    var cleanedSearch = urlParams.toString();
    var cleanedUrl = location.pathname + (cleanedSearch ? '?' + cleanedSearch : '') + location.hash;
    history.replaceState(null, '', cleanedUrl);
  }
  var ADMIN_TOKEN = localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  var IS_ADMIN = !!ADMIN_TOKEN;

  function adminUrl() {
    return API_URL + '&token=' + encodeURIComponent(ADMIN_TOKEN);
  }

  var state = {
    active: false,
    panelOpen: false,
    showResolved: false,
    loaded: false,
    comments: [],
    draft: null, // { xPct, yPct, screenId, targetLabel, clientX, clientY }
  };

  function injectStylesheet() {
    if (document.querySelector('link[data-feedback-widget-css]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = DS_BASE + 'feedback-widget.css';
    link.setAttribute('data-feedback-widget-css', '');
    document.head.appendChild(link);
  }

  function getAnchorEl() {
    return document.querySelector('.screen.active') || document.body;
  }

  function getScreenId() {
    var el = document.querySelector('.screen.active');
    return el && el.id ? el.id : null;
  }

  function iconSpan(name, size) {
    var span = document.createElement('span');
    span.className = 'acuity-icon acuity-icon--' + (size || 'md');
    span.style.setProperty('--icon', "url('" + DS_BASE + 'icons/' + name + ".svg')");
    return span;
  }

  function fmtTime(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  }

  function csvCell(value) {
    var str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
  }

  // state.comments holds every screen's comments for this prototype (the
  // panel only ever shows the current screen's slice via visibleComments()),
  // so exporting the raw array covers the whole prototype in one file.
  function exportCsv() {
    var header = ['screenId', 'status', 'author', 'text', 'createdAt', 'targetLabel', 'xPct', 'yPct'];
    var rows = state.comments.map(function (c) {
      return [c.screenId, c.status, c.author, c.text, c.createdAt, c.targetLabel, c.xPct, c.yPct];
    });
    var csv = [header].concat(rows).map(function (row) {
      return row.map(csvCell).join(',');
    }).join('\r\n');

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'feedback-' + PROTOTYPE_ID + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---- data layer ----------------------------------------------------

  function loadComments() {
    if (state.loaded) return Promise.resolve();
    if (!IS_ADMIN) { state.loaded = true; return Promise.resolve(); }
    return fetch(adminUrl())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.comments = Array.isArray(data.comments) ? data.comments : [];
        state.loaded = true;
      })
      .catch(function (err) { console.error('feedback widget: failed to load comments', err); });
  }

  function postComment(payload) {
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (r) {
      if (!r.ok) throw new Error('save failed');
      return r.json();
    });
  }

  function patchComment(id, status) {
    return fetch(adminUrl(), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, status: status }),
    }).then(function (r) {
      if (!r.ok) throw new Error('update failed');
      return r.json();
    });
  }

  // ---- DOM scaffold ----------------------------------------------------

  var root = document.createElement('div');
  root.className = 'feedback-widget-root';

  var pinsLayer = document.createElement('div');
  pinsLayer.style.position = 'fixed';
  pinsLayer.style.inset = '0';
  pinsLayer.style.pointerEvents = 'none';
  pinsLayer.style.zIndex = 'var(--acuity-z-popover)';
  root.appendChild(pinsLayer);

  var toggleWrap = document.createElement('div');
  toggleWrap.className = 'feedback-toggle';

  var listBtn = document.createElement('button');
  listBtn.type = 'button';
  listBtn.className = 'acuity-icon-button acuity-icon-button--secondary acuity-icon-button--md';
  listBtn.setAttribute('aria-label', 'Show feedback list');
  listBtn.style.background = 'var(--acuity-bg-base)';
  listBtn.style.boxShadow = 'var(--acuity-shadow-light-200)';
  listBtn.style.marginBottom = 'var(--acuity-spacing-8)';
  listBtn.style.display = 'block';
  listBtn.appendChild(iconSpan('icon-comment', 'md'));
  var countBadge = document.createElement('span');
  countBadge.className = 'feedback-toggle__count';
  countBadge.style.display = 'none';
  listBtn.style.position = 'relative';
  listBtn.appendChild(countBadge);

  var toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'acuity-icon-button acuity-icon-button--secondary acuity-icon-button--md';
  toggleBtn.setAttribute('aria-label', 'Toggle comment mode');
  toggleBtn.setAttribute('aria-pressed', 'false');
  toggleBtn.style.background = 'var(--acuity-bg-base)';
  toggleBtn.style.boxShadow = 'var(--acuity-shadow-light-200)';
  toggleBtn.appendChild(iconSpan('icon-plus', 'md'));

  // Non-admins only get the compose FAB — no list button, no pins, no
  // count badge, since they have no read access to what's been submitted.
  if (IS_ADMIN) toggleWrap.appendChild(listBtn);
  toggleWrap.appendChild(toggleBtn);
  root.appendChild(toggleWrap);

  // A deferred script's readyState is already "interactive" by the time it
  // runs (defer executes after parsing, before DOMContentLoaded fires) — so
  // guard against also firing on the later DOMContentLoaded event, which
  // would double-register every listener below.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  function mount() {
    injectStylesheet();
    document.body.appendChild(root);
    toggleBtn.addEventListener('click', onToggleMode);
    listBtn.addEventListener('click', onToggleList);
    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('resize', renderPins);
    setInterval(function () { if (state.active || state.panelOpen) renderPins(); }, 500);
    // Load eagerly (not just on first toggle) so the open-comment count
    // badge is meaningful the moment a reviewer lands on the page.
    loadComments().then(updateCountBadge);
  }

  function onToggleMode() {
    state.active = !state.active;
    toggleBtn.setAttribute('aria-pressed', String(state.active));
    toggleBtn.classList.toggle('acuity-icon-button--primary', state.active);
    toggleBtn.classList.toggle('acuity-icon-button--secondary', !state.active);
    document.body.classList.toggle('feedback-mode-active', state.active);
    closeDraft();
    if (state.active) {
      loadComments().then(function () { renderPins(); renderPanel(); });
    } else {
      renderPins();
    }
  }

  function onToggleList() {
    state.panelOpen = !state.panelOpen;
    loadComments().then(renderPanel);
  }

  function onDocumentClick(e) {
    if (!state.active) return;
    if (root.contains(e.target)) return; // widget's own chrome behaves normally
    e.preventDefault();
    e.stopPropagation();

    var anchor = getAnchorEl();
    var rect = anchor.getBoundingClientRect();
    var xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    var yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    var labelEl = e.target.closest('[id]') || e.target;
    var label = (labelEl.id ? '#' + labelEl.id : labelEl.tagName.toLowerCase());

    state.draft = {
      xPct: xPct, yPct: yPct, screenId: getScreenId(),
      targetLabel: label, clientX: e.clientX, clientY: e.clientY,
    };
    renderPins();
    renderComposePopover();
  }

  // ---- rendering ----------------------------------------------------

  function visibleComments() {
    var screenId = getScreenId();
    return state.comments.filter(function (c) {
      return c.screenId === screenId || (!c.screenId && !screenId);
    });
  }

  function renderPins() {
    pinsLayer.innerHTML = '';
    if (!state.active && !state.panelOpen) return;

    var anchor = getAnchorEl();
    var rect = anchor.getBoundingClientRect();

    visibleComments().forEach(function (comment, i) {
      if (comment.status === 'resolved' && !state.showResolved) return;
      var pin = document.createElement('div');
      pin.className = 'feedback-pin' + (comment.status === 'resolved' ? ' feedback-pin--resolved' : '');
      pin.style.left = (rect.left + (comment.xPct / 100) * rect.width) + 'px';
      pin.style.top = (rect.top + (comment.yPct / 100) * rect.height) + 'px';
      pin.style.pointerEvents = 'auto';
      pin.textContent = String(i + 1);
      pin.title = comment.text;
      pin.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        renderViewPopover(comment, pin);
      });
      pinsLayer.appendChild(pin);
    });

    if (state.draft) {
      var draftPin = document.createElement('div');
      draftPin.className = 'feedback-pin feedback-pin--draft';
      draftPin.style.left = (rect.left + (state.draft.xPct / 100) * rect.width) + 'px';
      draftPin.style.top = (rect.top + (state.draft.yPct / 100) * rect.height) + 'px';
      draftPin.textContent = '+';
      pinsLayer.appendChild(draftPin);
    }
  }

  function closeDraft() {
    state.draft = null;
    var existing = root.querySelector('.feedback-popover');
    if (existing) existing.remove();
    renderPins();
  }

  function showToast(message) {
    var existing = root.querySelector('.feedback-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'feedback-toast';
    toast.textContent = message;
    root.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2500);
  }

  function positionPopover(el, clientX, clientY) {
    var pad = 12;
    var maxLeft = window.innerWidth - el.offsetWidth - pad;
    var maxTop = window.innerHeight - el.offsetHeight - pad;
    el.style.left = Math.max(pad, Math.min(clientX, maxLeft)) + 'px';
    el.style.top = Math.max(pad, Math.min(clientY, maxTop)) + 'px';
  }

  function renderComposePopover() {
    var existing = root.querySelector('.feedback-popover');
    if (existing) existing.remove();
    if (!state.draft) return;

    var pop = document.createElement('div');
    pop.className = 'feedback-popover';

    var meta = document.createElement('div');
    meta.className = 'text-caption feedback-popover__meta';
    meta.textContent = 'Commenting on ' + state.draft.targetLabel;
    pop.appendChild(meta);

    var nameField = document.createElement('input');
    nameField.className = 'acuity-input__field';
    nameField.placeholder = 'Your name (optional)';
    nameField.value = localStorage.getItem(AUTHOR_KEY) || '';
    pop.appendChild(nameField);

    var textarea = document.createElement('textarea');
    textarea.className = 'acuity-input__field acuity-textarea';
    textarea.placeholder = 'Add feedback…';
    pop.appendChild(textarea);

    var actions = document.createElement('div');
    actions.className = 'feedback-popover__actions';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'acuity-button acuity-button--tertiary acuity-button--sm';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeDraft);

    var postBtn = document.createElement('button');
    postBtn.type = 'button';
    postBtn.className = 'acuity-button acuity-button--primary acuity-button--sm';
    postBtn.textContent = 'Post';
    postBtn.addEventListener('click', function () {
      var text = textarea.value.trim();
      if (!text) { textarea.focus(); return; }
      var author = nameField.value.trim();
      if (author) localStorage.setItem(AUTHOR_KEY, author);

      postBtn.disabled = true;
      postComment({
        text: text,
        author: author || null,
        screenId: state.draft.screenId,
        xPct: state.draft.xPct,
        yPct: state.draft.yPct,
        targetLabel: state.draft.targetLabel,
      }).then(function (data) {
        closeDraft();
        if (IS_ADMIN) {
          // Admin sees their own pin immediately, same as any other comment.
          state.comments.push(data.comment);
          renderPins();
          renderPanel();
        } else {
          // Non-admins have no read access, so there's nothing to render
          // back — just confirm the submission landed.
          showToast('Feedback sent — thanks!');
        }
      }).catch(function (err) {
        console.error('feedback widget: failed to post comment', err);
        postBtn.disabled = false;
      });
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(postBtn);
    pop.appendChild(actions);

    root.appendChild(pop);
    positionPopover(pop, state.draft.clientX, state.draft.clientY);
    textarea.focus();
  }

  function renderViewPopover(comment, anchorEl) {
    var existing = root.querySelector('.feedback-popover');
    if (existing) existing.remove();

    var pop = document.createElement('div');
    pop.className = 'feedback-popover';

    var meta = document.createElement('div');
    meta.className = 'text-caption feedback-popover__meta';
    meta.textContent = (comment.author || 'Anonymous') + ' · ' + fmtTime(comment.createdAt);
    pop.appendChild(meta);

    var text = document.createElement('div');
    text.className = 'text-body-book';
    text.textContent = comment.text;
    pop.appendChild(text);

    var actions = document.createElement('div');
    actions.className = 'feedback-popover__actions';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'acuity-button acuity-button--tertiary acuity-button--sm';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', function () { pop.remove(); });

    var resolveBtn = document.createElement('button');
    resolveBtn.type = 'button';
    resolveBtn.className = 'acuity-button acuity-button--secondary acuity-button--sm';
    resolveBtn.textContent = comment.status === 'resolved' ? 'Reopen' : 'Resolve';
    resolveBtn.addEventListener('click', function () {
      var next = comment.status === 'resolved' ? 'open' : 'resolved';
      resolveBtn.disabled = true;
      patchComment(comment.id, next).then(function (data) {
        comment.status = data.comment.status;
        pop.remove();
        renderPins();
        renderPanel();
      }).catch(function (err) {
        console.error('feedback widget: failed to update comment', err);
        resolveBtn.disabled = false;
      });
    });

    actions.appendChild(closeBtn);
    actions.appendChild(resolveBtn);
    pop.appendChild(actions);

    root.appendChild(pop);
    var pinRect = anchorEl.getBoundingClientRect();
    positionPopover(pop, pinRect.left, pinRect.bottom + 6);
  }

  function renderPanel() {
    var existing = root.querySelector('.feedback-panel');
    if (existing) existing.remove();
    if (!state.panelOpen) { updateCountBadge(); return; }

    var panel = document.createElement('div');
    panel.className = 'feedback-panel';

    var header = document.createElement('div');
    header.className = 'feedback-panel__header';
    var title = document.createElement('div');
    title.className = 'text-subtitle-semibold';
    title.textContent = 'Feedback on this screen';

    var headerActions = document.createElement('div');
    headerActions.style.cssText = 'display:flex;align-items:center;gap:var(--acuity-spacing-4);';

    var downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm';
    downloadBtn.setAttribute('aria-label', 'Download all screens\' feedback as CSV');
    downloadBtn.title = 'Download all screens as CSV';
    downloadBtn.appendChild(iconSpan('icon-download', 'sm'));
    downloadBtn.addEventListener('click', exportCsv);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'acuity-icon-button acuity-icon-button--ghost acuity-icon-button--sm';
    closeBtn.setAttribute('aria-label', 'Close feedback list');
    closeBtn.appendChild(iconSpan('icon-cross-sm', 'sm'));
    closeBtn.addEventListener('click', function () { state.panelOpen = false; renderPanel(); renderPins(); });

    headerActions.appendChild(downloadBtn);
    headerActions.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(headerActions);
    panel.appendChild(header);

    var resolvedToggleRow = document.createElement('label');
    resolvedToggleRow.className = 'text-caption';
    resolvedToggleRow.style.cssText = 'display:flex;align-items:center;gap:var(--acuity-spacing-8);padding:var(--acuity-spacing-8) var(--acuity-spacing-16);color:var(--acuity-fg-muted);';
    var resolvedCheckbox = document.createElement('input');
    resolvedCheckbox.type = 'checkbox';
    resolvedCheckbox.checked = state.showResolved;
    resolvedCheckbox.addEventListener('change', function () {
      state.showResolved = resolvedCheckbox.checked;
      renderPanel();
      renderPins();
    });
    resolvedToggleRow.appendChild(resolvedCheckbox);
    resolvedToggleRow.appendChild(document.createTextNode('Show resolved'));
    panel.appendChild(resolvedToggleRow);

    var list = document.createElement('div');
    list.className = 'feedback-panel__list';
    var items = visibleComments().filter(function (c) {
      return state.showResolved || c.status !== 'resolved';
    });

    if (!items.length) {
      var empty = document.createElement('div');
      empty.className = 'text-body-book feedback-panel__empty';
      empty.textContent = state.active
        ? 'No feedback yet — click anywhere on the screen to add a pin.'
        : 'No feedback yet on this screen.';
      list.appendChild(empty);
    }

    items.forEach(function (comment, i) {
      var item = document.createElement('div');
      item.className = 'feedback-panel__item' + (comment.status === 'resolved' ? ' feedback-panel__item--resolved' : '');

      var top = document.createElement('div');
      top.className = 'feedback-panel__item-top';
      var num = document.createElement('span');
      num.className = 'text-label';
      num.textContent = '#' + (i + 1) + ' · ' + (comment.author || 'Anonymous');
      var statusChip = document.createElement('button');
      statusChip.type = 'button';
      statusChip.className = 'acuity-chip acuity-chip--sm acuity-chip--interactive ' +
        (comment.status === 'resolved' ? 'acuity-chip--neutral' : 'acuity-chip--brand');
      statusChip.textContent = comment.status === 'resolved' ? 'Resolved' : 'Open';
      statusChip.addEventListener('click', function () {
        var next = comment.status === 'resolved' ? 'open' : 'resolved';
        patchComment(comment.id, next).then(function (data) {
          comment.status = data.comment.status;
          renderPanel();
          renderPins();
        }).catch(function (err) { console.error('feedback widget: failed to update comment', err); });
      });
      top.appendChild(num);
      top.appendChild(statusChip);

      var text = document.createElement('div');
      text.className = 'text-body-book';
      text.textContent = comment.text;

      var time = document.createElement('div');
      time.className = 'text-caption';
      time.style.color = 'var(--acuity-fg-muted)';
      time.textContent = fmtTime(comment.createdAt);

      item.appendChild(top);
      item.appendChild(text);
      item.appendChild(time);
      list.appendChild(item);
    });

    panel.appendChild(list);
    root.appendChild(panel);
    updateCountBadge();
  }

  function updateCountBadge() {
    var openCount = visibleComments().filter(function (c) { return c.status !== 'resolved'; }).length;
    if (openCount > 0) {
      countBadge.textContent = String(openCount);
      countBadge.style.display = 'block';
    } else {
      countBadge.style.display = 'none';
    }
  }
})();
