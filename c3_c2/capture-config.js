/**
 * Capture mode — shared registry + URL parsing for code-to-design export.
 *
 * Loaded by index.html (to drive the rendering) and by capture.html (to build
 * the URL index). Must be a synchronous <head> script in index.html: the
 * data-capture attribute has to land on <html> before first paint, otherwise
 * S1's entrance choreography plays for a frame before the freeze applies.
 *
 * URL params read from index.html:
 *   capture=1        render a single screen, deterministically
 *   capture=all      lay every screen out as a filmstrip in one document
 *   screen=<id>      which screen to show when capture=1 (default: s1)
 *   panel=c1..c5     open the create sheet at that step (implies screen=s5)
 *   w, h             filmstrip cell size in px (default: 390x844)
 */
(function () {
  'use strict';

  // [id, human label]. Order drives both the filmstrip and the URL index.
  var SCREENS = [
    ['s1',             'Intro'],
    ['s2',             'Describe your business'],
    ['s4',             'AI loading'],
    ['s5',             'Suggested appointments'],
    ['s9',             'Availability'],
    ['s10',            'Scheduling page'],
    ['s_loading_home', 'Loading home'],
    ['s_home',         'Home'],
  ];

  // Steps of the create sheet, which lives inside S5 rather than being a
  // screen of its own. Captured as separate frames because each step is a
  // distinct design.
  var PANELS = [
    ['c1', 'Create — name'],
    ['c2', 'Create — description'],
    ['c3', 'Create — duration'],
    ['c4', 'Create — price'],
    ['c5', 'Create — image'],
  ];

  var DEFAULT_WIDTH  = 390;
  var DEFAULT_HEIGHT = 844;

  function parse(search) {
    var p = new URLSearchParams(search);
    var mode = p.get('capture');
    if (!mode) return null;

    var w = parseInt(p.get('w'), 10);
    var h = parseInt(p.get('h'), 10);

    return {
      mode:   mode === 'all' ? 'all' : 'one',
      screen: p.get('screen') || 's1',
      panel:  p.get('panel'),
      width:  w > 0 ? w : DEFAULT_WIDTH,
      height: h > 0 ? h : DEFAULT_HEIGHT,
      // Only force the app height when h was asked for explicitly — otherwise
      // a single-screen capture should size to the importer's own viewport.
      hasExplicitHeight: h > 0,
    };
  }

  window.CAPTURE_SCREENS       = SCREENS;
  window.CAPTURE_PANELS        = PANELS;
  window.CAPTURE_DEFAULT_SIZE  = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  window.parseCaptureParams    = parse;

  var cfg = parse(location.search);
  window.__CAPTURE = cfg;

  if (cfg && document.documentElement) {
    document.documentElement.dataset.capture = cfg.mode;
  }
})();
