figma.showUI(__html__, { width: 420, height: 540, title: 'Prototype Capture' });

// ── Colour helpers ────────────────────────────────────────────────────────────

function parseRgba(str) {
  if (!str) return null;
  const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
  if (a <= 0) return null;
  return {
    r: parseInt(m[1]) / 255,
    g: parseInt(m[2]) / 255,
    b: parseInt(m[3]) / 255,
    a,
  };
}

// ── Font helpers ──────────────────────────────────────────────────────────────

const FONT_MAP = {
  'Source Sans Pro': 'Source Sans Pro',
  'Poppins': 'Poppins',
  'Playfair Display': 'Playfair Display',
  'Raleway': 'Raleway',
  'Quicksand': 'Quicksand',
  'Oswald': 'Oswald',
  'Helvetica Neue': 'Helvetica Neue',
  'Arial': 'Arial',
};

function toFigmaFamily(fontFamily) {
  const first = (fontFamily || '').replace(/['"]/g, '').split(',')[0].trim();
  return FONT_MAP[first] || 'Inter';
}

function toFigmaStyle(weight) {
  const w = parseInt(weight) || 400;
  if (w <= 300) return 'Light';
  if (w <= 400) return 'Regular';
  if (w <= 500) return 'Medium';
  if (w <= 600) return 'SemiBold';
  if (w <= 700) return 'Bold';
  return 'ExtraBold';
}

const fontCache = new Map();

async function loadFont(family, weight) {
  const figmaFamily = toFigmaFamily(family);
  const figmaStyle  = toFigmaStyle(weight);
  const key = `${figmaFamily}/${figmaStyle}`;
  if (fontCache.has(key)) return fontCache.get(key);

  const candidates = [
    { family: figmaFamily, style: figmaStyle },
    { family: figmaFamily, style: 'Regular' },
    { family: 'Inter',     style: figmaStyle },
    { family: 'Inter',     style: 'Regular' },
  ];

  for (const f of candidates) {
    try {
      await figma.loadFontAsync(f);
      fontCache.set(key, f);
      return f;
    } catch (_) {}
  }
  return null;
}

// ── Node builder ──────────────────────────────────────────────────────────────

async function buildNode(data, parent, offsetX, offsetY) {
  const x = Math.round(data.x - offsetX);
  const y = Math.round(data.y - offsetY);
  const w = Math.max(Math.round(data.w), 1);
  const h = Math.max(Math.round(data.h), 1);

  const bg       = parseRgba(data.bg);
  const textColor = parseRgba(data.color);

  // Text leaf: no element children, has visible text
  if (data.text && data.children.length === 0) {
    const font = await loadFont(data.fontFamily, data.fontWeight);
    if (font) {
      const t = figma.createText();
      t.x = x;
      t.y = y;
      t.fontName = font;
      t.fontSize = Math.max(data.fontSize || 14, 1);
      t.characters = data.text;
      if (textColor) {
        t.fills = [{ type: 'SOLID', color: { r: textColor.r, g: textColor.g, b: textColor.b }, opacity: textColor.a }];
      }
      if (data.opacity < 1) t.opacity = Math.max(0, data.opacity);
      t.name = data.text.slice(0, 40);
      parent.appendChild(t);
      return;
    }
  }

  // Container: create a Frame
  const frame = figma.createFrame();
  frame.x = x;
  frame.y = y;
  frame.resize(w, h);
  frame.name = (data.tag || 'div').toLowerCase();
  frame.clipsContent = data.overflow === 'hidden';
  frame.fills = bg
    ? [{ type: 'SOLID', color: { r: bg.r, g: bg.g, b: bg.b }, opacity: bg.a }]
    : [];

  const br = Math.round(parseFloat(data.borderRadius) || 0);
  if (br > 0) frame.cornerRadius = Math.min(br, Math.floor(Math.min(w, h) / 2));

  if (data.opacity < 1) frame.opacity = Math.max(0, data.opacity);

  if (data.borderWidth > 0) {
    const bc = parseRgba(data.borderColor);
    if (bc) {
      frame.strokes = [{ type: 'SOLID', color: { r: bc.r, g: bc.g, b: bc.b }, opacity: bc.a }];
      frame.strokeWeight = data.borderWidth;
      frame.strokeAlign = 'INSIDE';
    }
  }

  if (data.boxShadow && data.boxShadow !== 'none') {
    const shadowRgba = data.boxShadow.match(/rgba?\([^)]+\)/);
    if (shadowRgba) {
      const sc = parseRgba(shadowRgba[0]);
      if (sc) {
        frame.effects = [{
          type: 'DROP_SHADOW',
          color: { r: sc.r, g: sc.g, b: sc.b, a: sc.a },
          offset: { x: 0, y: 2 },
          radius: 8,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL',
        }];
      }
    }
  }

  parent.appendChild(frame);

  // Leaf text inside a styled container (e.g. a button)
  if (data.text && data.children.length === 0) {
    const font = await loadFont(data.fontFamily, data.fontWeight);
    if (font) {
      const t = figma.createText();
      t.x = 0;
      t.y = 0;
      t.fontName = font;
      t.fontSize = Math.max(data.fontSize || 14, 1);
      t.characters = data.text;
      if (textColor) {
        t.fills = [{ type: 'SOLID', color: { r: textColor.r, g: textColor.g, b: textColor.b }, opacity: textColor.a }];
      }
      t.name = data.text.slice(0, 40);
      frame.appendChild(t);
    }
  }

  for (const child of data.children) {
    await buildNode(child, frame, data.x, data.y);
  }
}

// ── Message handler ───────────────────────────────────────────────────────────

figma.ui.onmessage = async function (msg) {
  if (msg.type === 'capture') {
    const { tree, title } = msg;

    try {
      const root = figma.createFrame();
      root.name = title || 'Prototype Capture';
      root.resize(Math.max(Math.round(tree.w), 1), Math.max(Math.round(tree.h), 1));
      root.x = Math.round(figma.viewport.center.x - tree.w / 2);
      root.y = Math.round(figma.viewport.center.y - tree.h / 2);
      root.fills = [];
      root.clipsContent = false;

      figma.currentPage.appendChild(root);

      for (const child of tree.children) {
        await buildNode(child, root, tree.x, tree.y);
      }

      figma.currentPage.selection = [root];
      figma.viewport.scrollAndZoomIntoView([root]);
      figma.ui.postMessage({ type: 'done' });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e) });
    }
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
