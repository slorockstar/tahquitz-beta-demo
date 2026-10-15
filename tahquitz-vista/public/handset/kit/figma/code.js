/* =========================================================
   MERIDIAN HANDSET → FIGMA BUILDER (plugin)
   Generates a fully editable Figma file:
     • Variables  (Meridian Tokens: Economy / Premium / Business modes)
     • Text styles (Meridian/…)
     • Components (Glass Key set: Shape × Cabin, Volume Liquid, Status Bar, Airline Logo, Call Pill, OSD)
     • One page per cabin class with every screen state
   Layer order in every screen (top → bottom):
     🔩 Hardware · 💬 Overlays · 🏷 Airline Logo · 🔘 Glass Keys · 💧 Volume Liquid · 📺 Display · 🎨 Background
   MERIDIAN_CONFIG is injected by Developer mode at download time.
   ========================================================= */

var CFG = (typeof MERIDIAN_CONFIG !== 'undefined') ? MERIDIAN_CONFIG : {
  origin: 'https://kovachbeta3.com',
  theme: { primary: '#38bdf8', secondary: '#f59e0b', followArt: true, logoUrl: null, airline: 'Tahquitz', font: 'Inter' },
  library: {
    Movies: [{ kind: 'Movies', title: 'Last Light', sub: 'Sci-Fi · 2h 18m · PG-13', art: '/handset/last_light.jpg', hue: 28, duration: 8280, chapters: ['Launch', 'Drift', 'Ice Ridge', 'Signal', 'Sunrise'] }],
    TV: [{ kind: 'TV', title: 'Deep Blue', sub: 'S1 · E3', art: '/handset/deep_blue_tv.jpg', hue: 205, duration: 3120, chapters: ['Cold Open', 'Migration', 'The Breach'] }],
    Music: [
      { kind: 'Music', title: 'Velvet Horizon', sub: 'Amara Sol', art: '/handset/velvet_horizon.jpg', hue: 28, duration: 236, chapters: ['Verse', 'Chorus', 'Bridge'] },
      { kind: 'Music', title: 'Neon Meridian', sub: 'Kōdo Drift', art: '/handset/neon_meridian.jpg', hue: 300, duration: 284, chapters: ['Intro', 'Build', 'Drop', 'Outro'] }
    ]
  }
};

var TIERS = [
  { id: 'economy', name: 'Economy', tag: 'Max legibility · zero graphics · low power' },
  { id: 'premium', name: 'Premium Economy', tag: 'Artwork · tint · animated feedback' },
  { id: 'business', name: 'Business', tag: 'Living gradients on every surface' }
];
var STATES = ['Now Playing', 'Menu', 'Volume', 'Crew Call', 'Dimmed', 'Sleep'];
var W = 200, H = 500;

/* ---------------- colour helpers ---------------- */
function hexRgb(h) { h = (h || '#000000').replace('#', ''); return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; }
function hexHue(hex) {
  var c = hexRgb(hex), mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b), d = mx - mn;
  if (!d) return 0;
  var h = mx === c.r ? ((c.g - c.b) / d) % 6 : mx === c.g ? (c.b - c.r) / d + 2 : (c.r - c.g) / d + 4;
  return Math.round(h * 60 + 360) % 360;
}
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
  var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
  return { r: f(0), g: f(8), b: f(4) };
}
var WHITE = { r: 1, g: 1, b: 1 }, BLACK = { r: 0, g: 0, b: 0 };
function solid(c, o) { return { type: 'SOLID', color: c, opacity: o === undefined ? 1 : o }; }
// angle: 'up' (bottom→top), 'right', 'down'
function grad(stops, dir) {
  var t = dir === 'up' ? [[0, -1, 1], [1, 0, 0]] : dir === 'down' ? [[0, 1, 0], [-1, 0, 1]] : [[1, 0, 0], [0, 1, 0]];
  return { type: 'GRADIENT_LINEAR', gradientTransform: t, gradientStops: stops.map(function (s, i) { return { position: s[2] !== undefined ? s[2] : i / (stops.length - 1), color: { r: s[0].r, g: s[0].g, b: s[0].b, a: s[1] } }; }) };
}
var PRIMARY_HUE = hexHue(CFG.theme.primary);
function tierHue(item) { return CFG.theme.followArt && item ? item.hue : PRIMARY_HUE; }

/* ---------------- node helpers ---------------- */
var FONT = { r: { family: 'Inter', style: 'Regular' }, m: { family: 'Inter', style: 'Medium' }, s: { family: 'Inter', style: 'Semi Bold' }, b: { family: 'Inter', style: 'Bold' } };
var STYLES = {};
function frame(parent, name, x, y, w, h, fills, radius) {
  var f = figma.createFrame(); f.name = name; f.x = x; f.y = y; f.resize(w, h);
  f.fills = fills || []; if (radius) f.cornerRadius = radius; f.clipsContent = false;
  if (parent) parent.appendChild(f); return f;
}
function rect(parent, name, x, y, w, h, fills, radius) {
  var r = figma.createRectangle(); r.name = name; r.x = x; r.y = y; r.resize(Math.max(0.01, w), Math.max(0.01, h));
  r.fills = fills || []; if (radius) r.cornerRadius = radius; parent.appendChild(r); return r;
}
function ellipse(parent, name, x, y, w, h, fills) {
  var e = figma.createEllipse(); e.name = name; e.x = x; e.y = y; e.resize(w, h); e.fills = fills || []; parent.appendChild(e); return e;
}
async function text(parent, name, str, size, weight, color, opacity, x, y, opts) {
  var t = figma.createText(); t.name = name; t.fontName = FONT[weight || 'r']; t.characters = String(str); t.fontSize = size;
  t.fills = [solid(color || WHITE, opacity === undefined ? 1 : opacity)];
  t.x = x; t.y = y;
  if (opts && opts.width) { t.textAutoResize = 'HEIGHT'; t.resize(opts.width, t.height); }
  if (opts && opts.align) t.textAlignHorizontal = opts.align;
  if (opts && opts.upper) { t.textCase = 'UPPER'; t.letterSpacing = { unit: 'PERCENT', value: 15 }; }
  if (opts && opts.style && STYLES[opts.style]) { try { await t.setTextStyleIdAsync(STYLES[opts.style].id); t.fills = [solid(color || WHITE, opacity === undefined ? 1 : opacity)]; } catch (e) { /* older API */ } }
  parent.appendChild(t); return t;
}
function bind(paint, variable) { try { return figma.variables.setBoundVariableForPaint(paint, 'color', variable); } catch (e) { return paint; } }

/* ---------------- images ---------------- */
var IMG = {};
async function image(src) {
  if (!src) return null;
  if (IMG[src]) return IMG[src];
  try {
    var img;
    if (src.indexOf('data:') === 0) img = figma.createImage(figma.base64Decode(src.split(',')[1]));
    else img = await figma.createImageAsync(src.indexOf('http') === 0 ? src : CFG.origin + src);
    IMG[src] = img; return img;
  } catch (e) { return null; }
}
async function imageFill(src, fallbackHue, opacity) {
  var img = await image(src);
  if (img) return [{ type: 'IMAGE', imageHash: img.hash, scaleMode: 'FILL', opacity: opacity === undefined ? 1 : opacity }];
  return [grad([[hsl(fallbackHue, 50, 30), 1], [hsl(fallbackHue, 40, 6), 1]], 'down')];
}

/* =========================================================
   1. VARIABLES — change a hex here and the whole file updates
   ========================================================= */
var V = {}, COLL = null, MODES = {};
function buildVariables() {
  try {
    COLL = figma.variables.createVariableCollection('Meridian Tokens');
    MODES.economy = COLL.modes[0].modeId; COLL.renameMode(MODES.economy, 'Economy');
    MODES.premium = COLL.addMode('Premium Economy');
    MODES.business = COLL.addMode('Business');
    var defs = {
      'brand/primary': [hexRgb(CFG.theme.primary), hexRgb(CFG.theme.primary), hexRgb(CFG.theme.primary)],
      'brand/secondary': [hexRgb(CFG.theme.secondary), hexRgb(CFG.theme.secondary), hexRgb(CFG.theme.secondary)],
      'accent': [WHITE, hsl(PRIMARY_HUE, 65, 72), hsl(PRIMARY_HUE, 65, 72)],
      'gradient/a': [WHITE, hsl(PRIMARY_HUE, 60, 50), hsl(PRIMARY_HUE, 85, 60)],
      'gradient/b': [WHITE, hsl(PRIMARY_HUE, 65, 68), hsl(PRIMARY_HUE + 60, 85, 65)],
      'gradient/c': [WHITE, hsl(PRIMARY_HUE, 65, 68), hsl(PRIMARY_HUE + 150, 85, 70)],
      'surface/base': [BLACK, hsl(PRIMARY_HUE, 35, 17), { r: 0.02, g: 0.02, b: 0.03 }],
      'text/primary': [WHITE, WHITE, WHITE],
      'key/stroke': [WHITE, WHITE, hsl(PRIMARY_HUE, 85, 65)]
    };
    Object.keys(defs).forEach(function (k) {
      var v = figma.variables.createVariable(k, COLL, 'COLOR');
      v.setValueForMode(MODES.economy, defs[k][0]);
      v.setValueForMode(MODES.premium, defs[k][1]);
      v.setValueForMode(MODES.business, defs[k][2]);
      V[k] = v;
    });
    var nums = figma.variables.createVariable('backlight/dim-opacity', COLL, 'FLOAT');
    [MODES.economy, MODES.premium, MODES.business].forEach(function (m) { nums.setValueForMode(m, 0.2); });
  } catch (e) { COLL = null; }
}
function setMode(node, tier) { if (COLL) { try { node.setExplicitVariableModeForCollection(COLL, MODES[tier]); } catch (e) { } } }

/* =========================================================
   2. TEXT STYLES
   ========================================================= */
function buildTextStyles() {
  var defs = [['Meridian/Title', 23, 's'], ['Meridian/Title Small', 18, 's'], ['Meridian/Body', 13, 'r'], ['Meridian/Caption', 10, 'm'], ['Meridian/Key Legend', 20, 's'], ['Meridian/Key Label', 9, 'r'], ['Meridian/Numeric', 16, 'b']];
  defs.forEach(function (d) {
    var s = figma.createTextStyle(); s.name = d[0]; s.fontName = FONT[d[2]]; s.fontSize = d[1]; STYLES[d[0]] = s;
  });
}

/* =========================================================
   3. COMPONENTS
   ========================================================= */
var SHAPES = { Squircle: [46, 62, 18], Orb: [74, 74, 37], Pill: [78, 44, 22], Blade: [44, 196, 22] };
var KEYSET = null, KEYPROPS = {};
var COMP = {};

async function buildComponents(page) {
  page.backgrounds = [solid({ r: 0.04, g: 0.04, b: 0.05 })];
  await text(page, 'Title', 'Components', 32, 'b', WHITE, 1, 0, -80);
  var variants = [], col = 0;
  for (var ti = 0; ti < TIERS.length; ti++) {
    var tier = TIERS[ti].id, x = 0;
    for (var sh in SHAPES) {
      var s = SHAPES[sh];
      var c = figma.createComponent(); c.name = 'Shape=' + sh + ', Cabin=' + TIERS[ti].name;
      c.resize(s[0], s[1]); c.cornerRadius = s[2]; c.clipsContent = true;
      c.x = x; c.y = ti * 230;
      c.fills = [solid(WHITE, tier === 'economy' ? 0.04 : 0.05)];
      if (tier === 'economy') { c.strokes = [solid(WHITE, 0.35)]; c.strokeWeight = 1.5; c.strokeAlign = 'INSIDE'; }
      else if (tier === 'premium') { c.strokes = [solid(WHITE, 0.18)]; c.strokeWeight = 1; c.strokeAlign = 'INSIDE'; c.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.45 }, offset: { x: 0, y: 8 }, radius: 16, spread: 0, visible: true, blendMode: 'NORMAL' }]; }
      else {
        c.strokes = [grad([[hsl(PRIMARY_HUE, 85, 65), 0.9], [hsl(PRIMARY_HUE + 60, 85, 65), 0.9], [hsl(PRIMARY_HUE + 150, 85, 65), 0.9]], 'right')];
        c.strokeWeight = 1.5; c.strokeAlign = 'INSIDE'; c.fills = [solid(BLACK, 0.55)];
        c.effects = [{ type: 'BACKGROUND_BLUR', radius: 4, visible: true }];
      }
      var under = rect(c, 'Under-glass glow', 0, 0, s[0], s[1], [solid(hsl(PRIMARY_HUE, 80, 60), 0)]);
      under.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
      if (tier !== 'economy') {
        var hl = rect(c, 'Highlight', s[0] * 0.18, s[1] * 0.05, s[0] * 0.64, s[1] * 0.3, [grad([[WHITE, 0.3], [WHITE, 0]], 'down')], 99);
        hl.constraints = { horizontal: 'SCALE', vertical: 'MIN' };
      }
      var lg = await text(c, 'Legend', '●', 20, 's', WHITE, 1, 0, 0, { align: 'CENTER', width: s[0] });
      lg.y = sh === 'Blade' ? s[1] / 2 - 12 : (sh === 'Squircle' ? 12 : s[1] / 2 - 12);
      lg.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
      if (sh === 'Squircle') { var lb = await text(c, 'Label', 'Menu', 9, 'r', WHITE, 0.6, 0, 40, { align: 'CENTER', width: s[0] }); lb.constraints = { horizontal: 'STRETCH', vertical: 'MAX' }; }
      page.appendChild(c); variants.push(c);
      x += s[0] + 40;
    }
  }
  KEYSET = figma.combineAsVariants(variants, page);
  KEYSET.name = '🔘 Glass Key';
  KEYSET.x = 0; KEYSET.y = 0;
  KEYSET.fills = [solid({ r: 0.06, g: 0.06, b: 0.08 })]; KEYSET.cornerRadius = 16;
  KEYSET.layoutMode = 'NONE';
  try {
    KEYPROPS.legend = KEYSET.addComponentProperty('Legend', 'TEXT', '●');
    KEYPROPS.label = KEYSET.addComponentProperty('Label', 'TEXT', 'Menu');
    KEYSET.children.forEach(function (v) {
      v.children.forEach(function (n) {
        if (n.name === 'Legend') n.componentPropertyReferences = { characters: KEYPROPS.legend };
        if (n.name === 'Label') n.componentPropertyReferences = { characters: KEYPROPS.label };
      });
    });
  } catch (e) { }
  KEYSET.description = 'Clear-glass physical key. Shapes are tactile (findable by feel). The legend is drawn by the display underneath, so it can change by context.';

  // --- Status bar
  var sb = figma.createComponent(); sb.name = '📶 Status Bar'; sb.resize(168, 14); sb.fills = []; sb.x = 0; sb.y = 760;
  await text(sb, 'Seat', '32C', 10, 'm', WHITE, 0.5, 0, 0, { upper: true });
  var ctx = await text(sb, 'Context', 'Seatback', 10, 'm', WHITE, 0.5, 100, 0, { upper: true, width: 68, align: 'RIGHT' });
  ctx.constraints = { horizontal: 'MAX', vertical: 'MIN' };
  page.appendChild(sb); COMP.status = sb;

  // --- Airline logo
  var lg2 = figma.createComponent(); lg2.name = '🏷 Airline Logo'; lg2.resize(70, 40); lg2.fills = []; lg2.x = 220; lg2.y = 760;
  var logoImg = CFG.theme.logoUrl ? await image(CFG.theme.logoUrl) : null;
  if (logoImg) { rect(lg2, 'Logo image', 3, 0, 64, 26, [{ type: 'IMAGE', imageHash: logoImg.hash, scaleMode: 'FIT' }]); }
  else {
    var peak = figma.createVector(); peak.name = 'Peak mark';
    peak.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 1 21 L 11 5 L 16 13 L 19.5 8 L 31 21 Z' }];
    peak.fills = [grad([[hsl(PRIMARY_HUE, 80, 70), 1], [hexRgb(CFG.theme.secondary), 1]], 'right')];
    peak.x = 19; peak.y = 0; lg2.appendChild(peak);
  }
  await text(lg2, 'Wordmark', CFG.theme.airline || 'Airline', 7, 's', hsl(PRIMARY_HUE, 60, 78), 1, 0, 28, { width: 70, align: 'CENTER', upper: true });
  page.appendChild(lg2); COMP.logo = lg2;

  // --- Call pill
  var cp = figma.createComponent(); cp.name = '🔔 Crew Call Pill'; cp.resize(174, 32); cp.cornerRadius = 16; cp.x = 320; cp.y = 760;
  cp.fills = [solid(BLACK, 0.55)]; cp.strokes = [solid(WHITE, 0.1)]; cp.effects = [{ type: 'BACKGROUND_BLUR', radius: 12, visible: true }];
  var dot = ellipse(cp, 'Status dot', 12, 11, 10, 10, [V.accent ? bind(solid(WHITE), V.accent) : solid(WHITE)]);
  ellipse(cp, 'Pulse ring', 7, 6, 20, 20, [V.accent ? bind(solid(WHITE, 0.25), V.accent) : solid(WHITE, 0.25)]);
  await text(cp, 'Message', 'Crew called · Sarah, ~1 min', 12, 'm', WHITE, 1, 30, 8);
  page.appendChild(cp); COMP.call = cp;

  // --- OSD toast
  var osd = figma.createComponent(); osd.name = '💬 OSD Toast'; osd.resize(176, 56); osd.cornerRadius = 16; osd.x = 520; osd.y = 760;
  osd.fills = [solid(BLACK, 0.7)]; osd.strokes = [solid(WHITE, 0.1)]; osd.effects = [{ type: 'BACKGROUND_BLUR', radius: 12, visible: true }];
  await text(osd, 'Label', 'Volume', 12, 'm', WHITE, 0.6, 16, 20, { upper: true });
  await text(osd, 'Value', '6', 28, 'b', WHITE, 1, 130, 10, { width: 30, align: 'RIGHT' });
  page.appendChild(osd); COMP.osd = osd;

  // --- Documentation card
  var doc = frame(page, '📘 How to use these components', 0, 860, 720, 150, [solid({ r: 0.06, g: 0.06, b: 0.08 })], 16);
  await text(doc, 'Body', '• Glass Key: pick Shape + Cabin in the right panel, edit the Legend/Label text properties.\n• Colours come from the "Meridian Tokens" variables. Switch a frame\'s mode to Economy / Premium Economy / Business.\n• Change brand/primary once and every key, progress bar and gradient updates.\n• Edit a component here and every screen on every cabin page updates.', 12, 'r', WHITE, 0.85, 20, 20, { width: 680 });
}

function key(shape, tier, legend, label) {
  var cab = TIERS.filter(function (t) { return t.id === tier; })[0].name;
  var v = KEYSET.children.filter(function (n) { return n.name === 'Shape=' + shape + ', Cabin=' + cab; })[0];
  var inst = v.createInstance(); inst.name = (label || shape) + ' key';
  try { var p = {}; p[KEYPROPS.legend] = legend; if (label !== undefined) p[KEYPROPS.label] = label; inst.setProperties(p); } catch (e) { }
  return inst;
}

/* =========================================================
   4. SCREENS
   ========================================================= */
function fmt(s) { var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60); return h ? h + ':' + (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x : m + ':' + (x < 10 ? '0' : '') + x; }

async function screen(page, tier, state, x, y) {
  var lib = CFG.library;
  var item = tier === 'economy' ? (lib.Movies[0] || lib.Music[0]) : (lib.Music[tier === 'business' ? 1 : 0] || lib.Music[0] || lib.Movies[0]);
  var hue = tierHue(item);
  var pos = item.kind === 'Music' ? 52 : 2710, pct = pos / item.duration;
  var tierName = TIERS.filter(function (t) { return t.id === tier; })[0].name;

  // Wrapper (with hardware outside the glass)
  var wrap = frame(page, tierName + ' / ' + state, x, y, W + 40, H + 80, []);
  setMode(wrap, tier);
  wrap.exportSettings = [{ format: 'PNG', suffix: '@2x', constraint: { type: 'SCALE', value: 2 } }, { format: 'SVG', suffix: '' }];

  var dev = frame(wrap, 'Device', 20, 20, W, H, [solid(BLACK)], 32);
  dev.clipsContent = true;
  dev.strokes = [solid({ r: 0.11, g: 0.11, b: 0.13 })]; dev.strokeWeight = 5; dev.strokeAlign = 'OUTSIDE';
  dev.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.7 }, offset: { x: 0, y: 25 }, radius: 50, spread: 0, visible: true, blendMode: 'NORMAL' }];

  // 🎨 Background
  var bg = frame(dev, '🎨 Background', 0, 0, W, H, []);
  if (tier === 'premium') rect(bg, 'Tint', 0, 0, W, H, [grad([[hsl(hue, 35, 17), 1], [{ r: 0.02, g: 0.02, b: 0.03 }, 1, 0.72]], 'down')]);
  if (tier === 'business') {
    [[hue, -40, -40], [hue + 60, 60, 180], [hue + 150, 0, 320]].forEach(function (b, i) {
      var e = ellipse(bg, 'Gradient blob ' + (i + 1), b[1], b[2], 260, 260, [solid(hsl(b[0], 75, 55), 0.45)]);
      e.effects = [{ type: 'LAYER_BLUR', radius: 60, visible: true }];
    });
    if (state !== 'Menu') rect(bg, 'Artwork wash', 0, 0, W, H * 0.58, await imageFill(item.art, hue, 0.45)).blendMode = 'LUMINOSITY';
  }

  // 📺 Display
  var disp = frame(dev, '📺 Display', 0, 0, W, 272, []);
  if (state === 'Dimmed') disp.opacity = 0.2;
  var sb = COMP.status.createInstance(); sb.x = 16; sb.y = 16; disp.appendChild(sb);
  var accent = tier === 'economy' ? WHITE : hsl(hue, 65, 72);
  var accentPaint = function (o) { return V.accent ? bind(solid(WHITE, o), V.accent) : solid(accent, o); };

  if (state === 'Menu') {
    var g = frame(disp, 'Browse', 16, 40, 168, 224, []);
    var cx = 0;
    var kinds = ['Movies', 'TV', 'Music'];
    for (var k = 0; k < 3; k++) {
      var t = await text(g, 'Category / ' + kinds[k], kinds[k], 14, 's', WHITE, k === 2 ? 1 : 0.35, cx, 0);
      if (k === 2) rect(g, 'Category underline', cx, 20, t.width, 2, [accentPaint(1)], 1);
      cx += t.width + 12;
    }
    var mi = lib.Music[0] || item;
    if (tier === 'economy') {
      await text(g, 'Title', mi.title, 24, 's', WHITE, 1, 0, 80, { width: 168, style: 'Meridian/Title' });
      await text(g, 'Subtitle', mi.sub, 14, 'r', WHITE, 0.6, 0, 140, { width: 168 });
    } else {
      rect(g, 'Artwork', 0, 32, 168, 128, await imageFill(mi.art, mi.hue), 16);
      await text(g, 'Title', mi.title, 18, 's', WHITE, 1, 0, 166, { width: 168, style: 'Meridian/Title Small' });
      await text(g, 'Subtitle', mi.sub, 12, 'r', WHITE, 0.6, 0, 190, { width: 168 });
    }
    var dots = frame(g, 'Page dots', 62, 214, 44, 6, []);
    for (var d = 0; d < 3; d++) rect(dots, 'Dot ' + (d + 1), d === 0 ? 0 : 14 + (d - 1) * 10 + 6, 0, d === 0 ? 14 : 6, 6, [accentPaint(d === 0 ? 1 : 0.3)], 3);
  } else {
    var np = frame(disp, 'Now Playing', 16, 40, 168, 228, []);
    var yy = 0;
    if (tier === 'economy') { await text(np, 'Kind icon', item.kind === 'Music' ? '♪' : '🎬', 30, 'r', WHITE, 1, 0, 70); yy = 115; }
    if (tier === 'premium') { rect(np, 'Artwork', 0, 20, 80, 80, await imageFill(item.art, hue), 12); yy = 110; }
    if (tier === 'business') { var ch = await text(np, 'Chapter', item.chapters[1] || 'Chapter', 11, 'm', accent, 1, 0, 90, { upper: true }); ch.fills = [accentPaint(1)]; yy = 108; }
    await text(np, 'Title', item.title, 23, 's', WHITE, 1, 0, yy, { width: 168, style: 'Meridian/Title' });
    await text(np, 'Subtitle', item.sub, 13, 'r', WHITE, 0.6, 0, yy + 32, { width: 168, style: 'Meridian/Body' });
    if (tier === 'economy') {
      await text(np, 'Time', fmt(pos) + ' / ' + fmt(item.duration), 14, 'r', WHITE, 0.8, 0, yy + 60);
    } else {
      var pr = frame(np, 'Progress', 0, yy + 58, 168, 5, [solid(WHITE, 0.15)], 3); pr.clipsContent = true;
      var fill = rect(pr, 'Progress fill', 0, 0, 168 * pct, 5, [tier === 'business'
        ? grad([[hsl(hue, 85, 65), 1], [hsl(hue + 60, 85, 70), 1], [hsl(hue + 150, 85, 70), 1]], 'right')
        : accentPaint(1)], 3);
      await text(np, 'Elapsed', fmt(pos), 11, 'r', WHITE, 0.55, 0, yy + 67);
      await text(np, 'Remaining', '-' + fmt(item.duration - pos), 11, 'r', WHITE, 0.55, 120, yy + 67, { width: 48, align: 'RIGHT' });
      if (item.kind === 'Music') {
        var vz = frame(np, 'Visualizer', 0, yy + 84, 168, 30, []);
        for (var b = 0; b < 28; b++) {
          var f = b / 28, hgt = Math.max(3, 30 * (0.25 + 0.55 * (1 - f * 0.6) * (0.5 + 0.5 * Math.sin(b * 0.9))));
          rect(vz, 'Bar ' + (b + 1), b * 6, 30 - hgt, 4, hgt, [tier === 'business' ? grad([[hsl(hue + f * 150, 85, 62), 1], [hsl(hue + f * 150 + 40, 85, 75), 0.35]], 'up') : solid(hsl(hue, 55, 72), 0.6)], 2);
        }
      }
    }
  }

  // 💧 Volume Liquid (rendered by the display, under the glass blade)
  var vol = 6;
  var liq = frame(dev, '💧 Volume Liquid', 146, 288, 44, 196, [], 22); liq.clipsContent = true;
  if (state === 'Dimmed') liq.opacity = 0.35;
  var lh = 196 * vol / 10;
  rect(liq, 'Liquid', 0, 196 - lh, 44, lh, [tier === 'economy' ? solid(WHITE, 0.22)
    : tier === 'premium' ? grad([[hsl(hue, 60, 50), 0.8], [hsl(hue, 65, 68), 0.35]], 'up')
      : grad([[hsl(hue, 85, 55), 1], [hsl(hue + 60, 85, 62), 1], [hsl(hue + 150, 85, 70), 0.6]], 'up')]);
  if (tier !== 'economy') {
    var wave = figma.createVector(); wave.name = 'Surface wave';
    wave.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 0 6 Q 5.5 0 11 6 T 22 6 T 33 6 T 44 6 L 44 12 L 0 12 Z' }];
    wave.fills = [solid(tier === 'business' ? hsl(hue + 150, 85, 70) : hsl(hue, 65, 68), tier === 'business' ? 0.65 : 0.5)];
    wave.x = 0; wave.y = 196 - lh - 8; liq.appendChild(wave);
  }
  if (tier === 'business') for (var bb = 0; bb < 6; bb++) ellipse(liq, 'Bubble ' + (bb + 1), 6 + ((bb * 29) % 30), 196 - 10 - bb * 16, 2 + (bb % 3), 2 + (bb % 3), [solid(WHITE, 0.6)]);

  // 🔘 Glass Keys
  var keys = frame(dev, '🔘 Glass Keys', 0, 0, W, H, []);
  var menu = state === 'Menu';
  var k1 = key('Squircle', tier, menu ? '↩' : '☰', menu ? 'Back' : 'Menu'); k1.x = 10; k1.y = 300; keys.appendChild(k1);
  var k2 = key('Squircle', tier, '💡', 'Light'); k2.x = 10; k2.y = 372; k2.name = 'Light key'; keys.appendChild(k2);
  var k3 = key('Orb', tier, menu ? '▶' : '❚❚'); k3.x = 64; k3.y = 296; k3.name = 'Orb key (play / select)'; keys.appendChild(k3);
  var k4 = key('Pill', tier, menu ? '‹   ›' : '«   »'); k4.x = 62; k4.y = 384; k4.name = 'Scrub key'; keys.appendChild(k4);
  var k5 = key('Blade', tier, menu ? '⇅' : String(vol)); k5.x = 146; k5.y = 288; k5.name = 'Volume blade'; keys.appendChild(k5);
  await text(keys, 'Volume + legend', menu ? '▲' : '+', 20, 's', WHITE, 1, 146, 298, { width: 44, align: 'CENTER' });
  await text(keys, 'Volume − legend', menu ? '▼' : '−', 20, 's', WHITE, 1, 146, 450, { width: 44, align: 'CENTER' });
  await text(keys, 'Scrub caption', menu ? 'Browse' : (item.kind === 'Music' ? '10 sec' : '30 sec'), 9, 'r', WHITE, 0.45, 62, 432, { width: 78, align: 'CENTER' });
  if (state === 'Dimmed') { k3.opacity = 0.25; k2.opacity = 0.25; }

  // 🏷 Airline logo (centred between first two key columns)
  var lg = COMP.logo.createInstance(); lg.x = 40; lg.y = 446; dev.appendChild(lg);
  if (state === 'Dimmed' || state === 'Sleep') lg.opacity = 0.3;

  // 💬 Overlays
  var ov = frame(dev, '💬 Overlays', 0, 0, W, H, []);
  if (state === 'Volume') { var o = COMP.osd.createInstance(); o.x = 12; o.y = 150; ov.appendChild(o); }
  if (state === 'Crew Call') { var c = COMP.call.createInstance(); c.x = 12; c.y = 12; ov.appendChild(c); }
  if (state === 'Sleep') {
    rect(ov, 'Sleep scrim', 0, 0, W, H, [solid(BLACK, 0.9)]);
    await text(ov, 'Clock', '11:42 PM', 34, 'r', WHITE, 0.6, 0, 210, { width: W, align: 'CENTER' });
    await text(ov, 'Hint', 'Sleeping · press any key', 11, 'm', WHITE, 0.6, 0, 256, { width: W, align: 'CENTER', upper: true });
  }

  // 🔩 Hardware (outside the glass)
  var hw = frame(wrap, '🔩 Hardware', 0, 0, W + 40, H + 80, []);
  rect(hw, 'Power / Sleep key', 20 + W / 2 - 23, 12, 46, 9, [grad([[{ r: 0.23, g: 0.24, b: 0.27 }, 1], [{ r: 0.33, g: 0.35, b: 0.37 }, 1], [{ r: 0.23, g: 0.24, b: 0.27 }, 1]], 'right')], 3);
  rect(hw, 'Call key (side)', 20 + W, 130, 9, 56, [state === 'Crew Call' ? accentPaint(1) : grad([[{ r: 0.23, g: 0.24, b: 0.27 }, 1], [{ r: 0.33, g: 0.35, b: 0.37 }, 1]], 'down')], 3);
  var cord = figma.createVector(); cord.name = 'Cord';
  cord.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 20 0 C 5 10 35 15 20 25 C 5 35 35 40 20 50' }];
  cord.strokes = [solid({ r: 0.16, g: 0.17, b: 0.19 })]; cord.strokeWeight = 5; cord.fills = [];
  cord.x = 20 + W / 2 - 20; cord.y = H + 20; hw.appendChild(cord);
  wrap.appendChild(hw); // top of the layer list
  return wrap;
}

/* =========================================================
   RUN
   ========================================================= */
(async function () {
  try {
    await Promise.all([FONT.r, FONT.m, FONT.s, FONT.b].map(function (f) { return figma.loadFontAsync(f); }));
    figma.notify('Building Meridian handset file…', { timeout: 4000 });
    buildVariables();
    buildTextStyles();

    var cover = figma.root.children[0]; cover.name = '📘 Cover';
    var compPage = figma.createPage(); compPage.name = '🧩 Components';
    await buildComponents(compPage);

    for (var t = 0; t < TIERS.length; t++) {
      var p = figma.createPage(); p.name = (t + 1) + ' · ' + TIERS[t].name;
      p.backgrounds = [solid({ r: 0.04, g: 0.04, b: 0.05 })];
      var hdr = await text(p, 'Page title', TIERS[t].name + ' — ' + TIERS[t].tag, 28, 'b', WHITE, 1, 0, -70);
      for (var s = 0; s < STATES.length; s++) {
        var sc = await screen(p, TIERS[t].id, STATES[s], s * 300, 0);
        await text(p, 'Label / ' + STATES[s], STATES[s], 14, 'm', WHITE, 0.6, s * 300 + 20, H + 90);
      }
    }

    // Cover
    cover.backgrounds = [solid({ r: 0.04, g: 0.04, b: 0.05 })];
    var cv = frame(cover, 'Cover', 0, 0, 1200, 680, [grad([[hsl(PRIMARY_HUE, 70, 22), 1], [{ r: 0.02, g: 0.02, b: 0.03 }, 1]], 'down')], 24);
    await text(cv, 'Title', 'Meridian Handset', 56, 'b', WHITE, 1, 60, 60);
    await text(cv, 'Subtitle', (CFG.theme.airline || 'Airline') + ' · 2″×5″ corded handset · 3 cabin classes · generated ' + new Date().toLocaleDateString(), 18, 'r', WHITE, 0.7, 60, 135);
    await text(cv, 'Guide',
      'HOW THIS FILE IS ORGANISED\n\n' +
      '🧩 Components — Glass Key (Shape × Cabin variants), Status Bar, Airline Logo, Crew Call Pill, OSD Toast.\n' +
      '1 · Economy   2 · Premium Economy   3 · Business — every screen state: Now Playing, Menu, Volume, Crew Call, Dimmed, Sleep.\n\n' +
      'EVERY SCREEN HAS THE SAME LAYER FOLDERS\n' +
      '🔩 Hardware  ·  💬 Overlays  ·  🏷 Airline Logo  ·  🔘 Glass Keys  ·  💧 Volume Liquid  ·  📺 Display  ·  🎨 Background\n\n' +
      'EDITING\n' +
      '• Colours: Local variables → "Meridian Tokens". Change brand/primary once; modes switch per cabin.\n' +
      '• Type: Local styles → Meridian/…\n' +
      '• New screens: duplicate any frame, keep the folders, swap instances.\n' +
      '• Export: each screen frame has PNG @2x + SVG export presets.\n' +
      '• Hand back to engineering: export, plus the colour/text values map 1:1 to meridian.tokens.css.',
      15, 'r', WHITE, 0.85, 60, 200, { width: 1080 });

    await figma.setCurrentPageAsync(compPage);
    figma.viewport.scrollAndZoomIntoView(compPage.children);
    figma.notify('✓ Meridian file built: components, tokens, ' + (TIERS.length * STATES.length) + ' screens', { timeout: 6000 });
  } catch (e) {
    figma.notify('Build error: ' + (e && e.message ? e.message : e), { error: true, timeout: 10000 });
    console.error(e);
  }
  figma.closePlugin();
})();
