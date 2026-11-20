'use strict';
/* Vice City Dusk Cover Studio — an offline GTA-style cover art maker.
   Every sample scene is drawn procedurally in code (no photos, no Rockstar
   art, no network). The cover is rendered on a 2D canvas: panels + grade +
   lettering, exported as PNG in four post sizes. */

const $ = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* Deterministic random, so the sample scenes look the same every load. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------- sample scenes */

function drawPalm(ctx, x, y, s, lean, rnd, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.045);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.06, -s * 0.55, s * 0.02, -s * 0.95);
  ctx.stroke();
  ctx.translate(s * 0.02, -s * 0.95);
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.15) - (i * Math.PI * 0.115) + (rnd() - 0.5) * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * s * 0.45, Math.sin(a) * s * 0.45 - s * 0.12,
      Math.cos(a) * s * 0.85, Math.sin(a) * s * 0.85 + s * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function paintBeach(ctx, w, h) {
  const rnd = mulberry32(11);
  skyGradient(ctx, w, h, [[0, '#2b1055'], [0.42, '#ff5e8a'], [0.55, '#ff9a3c'], [0.62, '#ffd166']]);
  const sunX = w * 0.68, sunY = h * 0.44, sunR = w * 0.085;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 3.2);
  glow.addColorStop(0, 'rgba(255,240,180,0.95)');
  glow.addColorStop(0.35, 'rgba(255,160,90,0.45)');
  glow.addColorStop(1, 'rgba(255,160,90,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();
  /* sea */
  const sea = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.8);
  sea.addColorStop(0, '#ff8a5c'); sea.addColorStop(0.5, '#b23a7d'); sea.addColorStop(1, '#2a1a5e');
  ctx.fillStyle = sea; ctx.fillRect(0, h * 0.55, w, h * 0.25);
  ctx.fillStyle = 'rgba(255,230,160,0.5)';
  for (let i = 0; i < 26; i++) {
    const yy = h * (0.56 + rnd() * 0.22);
    const ww = w * (0.02 + rnd() * 0.10) * (1 - (yy - h * 0.56) / (h * 0.22) * 0.4);
    ctx.fillRect(sunX - ww / 2 + (rnd() - 0.5) * w * 0.05, yy, ww, 2.5);
  }
  /* sand */
  const sand = ctx.createLinearGradient(0, h * 0.8, 0, h);
  sand.addColorStop(0, '#f7c873'); sand.addColorStop(1, '#d97b3f');
  ctx.fillStyle = sand; ctx.fillRect(0, h * 0.8, w, h * 0.2);
  ctx.fillStyle = 'rgba(120,60,20,0.35)';
  for (let i = 0; i < 40; i++) ctx.fillRect(rnd() * w, h * (0.82 + rnd() * 0.16), 3, 2);
  /* palms + birds */
  drawPalm(ctx, w * 0.10, h * 0.86, h * 0.42, 0.16, rnd, '#1a0b2e');
  drawPalm(ctx, w * 0.93, h * 0.84, h * 0.36, -0.2, rnd, '#241040');
  ctx.strokeStyle = 'rgba(30,10,50,0.8)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const bx = w * (0.25 + rnd() * 0.45), by = h * (0.12 + rnd() * 0.2), s = 8 + rnd() * 10;
    ctx.beginPath();
    ctx.moveTo(bx - s, by); ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.7, bx + s, by);
    ctx.stroke();
  }
}

function litWindows(ctx, x, y, bw, bh, rnd, palette) {
  ctx.fillStyle = 'rgba(255,209,102,0.9)';
  const cols = Math.max(2, Math.floor(bw / 34)), rows = Math.max(3, Math.floor(bh / 44));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (rnd() < 0.42) {
        ctx.fillStyle = palette[Math.floor(rnd() * palette.length)];
        ctx.fillRect(x + 8 + c * ((bw - 16) / cols), y + 10 + r * ((bh - 20) / rows), 12, 16);
      }
    }
  }
}

function paintStreet(ctx, w, h) {
  const rnd = mulberry32(23);
  skyGradient(ctx, w, h, [[0, '#160a30'], [0.4, '#7b2ff7'], [0.58, '#ff5e8a'], [0.64, '#ff9a3c']]);
  const horizon = h * 0.62;
  /* skyline */
  ctx.fillStyle = '#1c0b33';
  let bx = 0;
  while (bx < w) {
    const bw = w * (0.08 + rnd() * 0.12), bh = h * (0.12 + rnd() * 0.3);
    ctx.fillRect(bx, horizon - bh, bw, bh);
    litWindows(ctx, bx, horizon - bh, bw, bh, rnd, ['#ffd166', '#19e3c2', '#ff7ad9']);
    bx += bw + 4;
  }
  /* street */
  const road = ctx.createLinearGradient(0, horizon, 0, h);
  road.addColorStop(0, '#3a2358'); road.addColorStop(1, '#12081f');
  ctx.fillStyle = road; ctx.fillRect(0, horizon, w, h - horizon);
  /* wet neon reflections */
  for (let i = 0; i < 14; i++) {
    const rx = rnd() * w, rw = 6 + rnd() * 26;
    const g = ctx.createLinearGradient(rx, horizon, rx, h);
    const col = ['255,46,136', '25,227,194', '255,201,60'][i % 3];
    g.addColorStop(0, `rgba(${col},0.5)`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(rx - rw / 2, horizon, rw, h - horizon);
  }
  /* neon signs */
  const signs = [
    { x: 0.13, y: 0.30, t: 'HOTEL', c: '#ff2e88' },
    { x: 0.62, y: 0.22, t: 'VICE', c: '#19e3c2' },
    { x: 0.78, y: 0.44, t: '24H', c: '#ffc93c' },
  ];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const s of signs) {
    const fs = Math.round(w * 0.045);
    ctx.font = `900 ${fs}px "Arial Black","DejaVu Sans",sans-serif`;
    const tw = ctx.measureText(s.t).width + fs * 0.9;
    ctx.save();
    ctx.shadowColor = s.c; ctx.shadowBlur = 22;
    ctx.fillStyle = 'rgba(10,4,20,0.85)';
    ctx.fillRect(w * s.x - tw / 2, h * s.y - fs * 0.75, tw, fs * 1.5);
    ctx.strokeStyle = s.c; ctx.lineWidth = 3;
    ctx.strokeRect(w * s.x - tw / 2, h * s.y - fs * 0.75, tw, fs * 1.5);
    ctx.fillStyle = s.c;
    ctx.fillText(s.t, w * s.x, h * s.y + fs * 0.05);
    ctx.restore();
  }
  /* sports car silhouette */
  ctx.fillStyle = '#0a0514';
  ctx.beginPath();
  ctx.moveTo(w * 0.30, h * 0.94);
  ctx.lineTo(w * 0.34, h * 0.86); ctx.lineTo(w * 0.44, h * 0.80);
  ctx.lineTo(w * 0.60, h * 0.80); ctx.lineTo(w * 0.70, h * 0.86);
  ctx.lineTo(w * 0.74, h * 0.94); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath(); ctx.ellipse(w * 0.52, h * 0.95, w * 0.24, h * 0.012, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath(); ctx.arc(w * 0.72, h * 0.885, 5, 0, Math.PI * 2); ctx.fill();
}

function paintPalms(ctx, w, h) {
  const rnd = mulberry32(37);
  skyGradient(ctx, w, h, [[0, '#3d1658'], [0.45, '#ff5e8a'], [0.6, '#ff9a3c'], [0.66, '#ffd166']]);
  const sunX = w * 0.5, sunY = h * 0.58, sunR = w * 0.11;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 3);
  glow.addColorStop(0, 'rgba(255,240,180,0.9)');
  glow.addColorStop(0.4, 'rgba(255,150,80,0.4)');
  glow.addColorStop(1, 'rgba(255,150,80,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();
  /* distant skyline */
  ctx.fillStyle = '#2a1245';
  let bx = 0;
  while (bx < w) {
    const bw = w * (0.06 + rnd() * 0.1), bh = h * (0.06 + rnd() * 0.16);
    ctx.fillRect(bx, h * 0.66 - bh, bw, bh);
    bx += bw + 3;
  }
  /* road */
  ctx.fillStyle = '#241335';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.66); ctx.lineTo(w * 0.58, h * 0.66);
  ctx.lineTo(w * 0.98, h); ctx.lineTo(w * 0.02, h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.setLineDash([h * 0.06, h * 0.05]);
  ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.68); ctx.lineTo(w * 0.5, h); ctx.stroke();
  ctx.setLineDash([]);
  /* palm rows, shrinking into the distance */
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const s = h * (0.34 - t * 0.20);
    const y = h * (0.70 + t * 0.28);
    drawPalm(ctx, w * (0.30 - t * 0.16), y, s, 0.14, rnd, '#180a2c');
    drawPalm(ctx, w * (0.70 + t * 0.16), y, s, -0.14, rnd, '#180a2c');
  }
}

function paintNight(ctx, w, h) {
  const rnd = mulberry32(51);
  skyGradient(ctx, w, h, [[0, '#04061a'], [0.5, '#141038'], [0.62, '#3a1a5e']]);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.3 + rnd() * 0.7;
    ctx.fillRect(rnd() * w, rnd() * h * 0.4, 2, 2);
  }
  ctx.globalAlpha = 1;
  /* moon */
  ctx.fillStyle = '#f5efe6';
  ctx.beginPath(); ctx.arc(w * 0.82, h * 0.16, w * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(4,6,26,0.5)';
  ctx.beginPath(); ctx.arc(w * 0.80, h * 0.15, w * 0.04, 0, Math.PI * 2); ctx.fill();
  /* skyline + bokeh */
  ctx.fillStyle = '#0d0722';
  let bx = 0;
  while (bx < w) {
    const bw = w * (0.07 + rnd() * 0.11), bh = h * (0.10 + rnd() * 0.26);
    ctx.fillRect(bx, h * 0.62 - bh, bw, bh);
    litWindows(ctx, bx, h * 0.62 - bh, bw, bh, rnd, ['#ffd166', '#ff7ad9', '#19e3c2']);
    bx += bw + 4;
  }
  for (let i = 0; i < 26; i++) {
    const cols = ['255,46,136', '25,227,194', '255,201,60', '123,47,247'];
    ctx.fillStyle = `rgba(${cols[i % 4]},${0.10 + rnd() * 0.25})`;
    ctx.beginPath();
    ctx.arc(rnd() * w, h * (0.1 + rnd() * 0.5), 6 + rnd() * 26, 0, Math.PI * 2);
    ctx.fill();
  }
  /* road */
  const road = ctx.createLinearGradient(0, h * 0.62, 0, h);
  road.addColorStop(0, '#1a0f30'); road.addColorStop(1, '#05030c');
  ctx.fillStyle = road; ctx.fillRect(0, h * 0.62, w, h * 0.38);
  /* sports car */
  ctx.save();
  ctx.translate(w * 0.5, h * 0.86);
  const cs = w * 0.0011;
  ctx.scale(cs, cs);
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath(); ctx.ellipse(0, 78, 330, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0514';
  ctx.beginPath();
  ctx.moveTo(-320, 60); ctx.lineTo(-300, 10); ctx.lineTo(-190, -38);
  ctx.lineTo(-60, -58); ctx.lineTo(90, -58); ctx.lineTo(210, -30);
  ctx.lineTo(300, 8); ctx.lineTo(320, 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1d2b4a';
  ctx.beginPath();
  ctx.moveTo(-170, -40); ctx.lineTo(-60, -52); ctx.lineTo(80, -52); ctx.lineTo(180, -32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#05030c';
  ctx.beginPath(); ctx.arc(-190, 60, 42, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(190, 60, 42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9aa7c7';
  ctx.beginPath(); ctx.arc(-190, 60, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(190, 60, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath(); ctx.arc(312, 18, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  /* headlight beam */
  const beam = ctx.createLinearGradient(w * 0.78, h * 0.84, w, h * 0.7);
  beam.addColorStop(0, 'rgba(255,243,176,0.35)');
  beam.addColorStop(1, 'rgba(255,243,176,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(w * 0.78, h * 0.84); ctx.lineTo(w, h * 0.68); ctx.lineTo(w, h * 0.9); ctx.closePath(); ctx.fill();
}

const SCENES = {
  beach: { name: 'Beach Sunset', paint: paintBeach },
  street: { name: 'City Street', paint: paintStreet },
  palms: { name: 'Palm Avenue', paint: paintPalms },
  night: { name: 'Night Car', paint: paintNight },
};
const SCENE_KEYS = Object.keys(SCENES);
const sceneCache = new Map();

function sceneCanvas(key) {
  if (!sceneCache.has(key)) {
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 900;
    SCENES[key].paint(c.getContext('2d'), 1200, 900);
    sceneCache.set(key, c);
  }
  return sceneCache.get(key);
}

/* ---------------------------------------------------------- layouts & grades */

const LAYOUTS = {
  hero: {
    name: 'Hero Poster', note: 'Big hero + 3 strips',
    aspect: 4 / 5,
    panels: [
      { name: 'Hero', x: 0, y: 0, w: 1, h: 0.62 },
      { name: 'Strip 1', x: 0, y: 0.62, w: 1 / 3, h: 0.38 },
      { name: 'Strip 2', x: 1 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
      { name: 'Strip 3', x: 2 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
    ],
    caption: { x: 0.05, y: 0.47, align: 'left', size: 0.115 },
  },
  loading: {
    name: 'Loading Screen', note: 'Hero left, two stacked',
    aspect: 16 / 9,
    panels: [
      { name: 'Hero', x: 0, y: 0, w: 0.62, h: 1 },
      { name: 'Top right', x: 0.62, y: 0, w: 0.38, h: 0.5 },
      { name: 'Bottom right', x: 0.62, y: 0.5, w: 0.38, h: 0.5 },
    ],
    caption: { x: 0.04, y: 0.78, align: 'left', size: 0.13 },
  },
  split: {
    name: 'Split Panels', note: 'Four-panel grid',
    aspect: 1,
    panels: [
      { name: 'Top left', x: 0, y: 0, w: 0.5, h: 0.5 },
      { name: 'Top right', x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { name: 'Bottom left', x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { name: 'Bottom right', x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
    caption: { x: 0.05, y: 0.36, align: 'left', size: 0.115 },
  },
  story: {
    name: 'Story 9:16', note: 'Vertical story cover',
    aspect: 9 / 16,
    panels: [
      { name: 'Hero', x: 0, y: 0, w: 1, h: 0.45 },
      { name: 'Middle left', x: 0, y: 0.45, w: 0.5, h: 0.30 },
      { name: 'Middle right', x: 0.5, y: 0.45, w: 0.5, h: 0.30 },
      { name: 'Bottom', x: 0, y: 0.75, w: 1, h: 0.25 },
    ],
    caption: { x: 0.5, y: 0.86, align: 'center', size: 0.16 },
  },
};

const GRADES = {
  sunset: {
    name: 'Sunset', note: 'Warm neon dusk',
    overlays: [
      { op: 'overlay', stops: [[0, 'rgba(255,122,24,0.28)'], [1, 'rgba(255,46,136,0.30)']] },
      { op: 'soft-light', stops: [[0, 'rgba(255,180,80,0.35)'], [1, 'rgba(120,20,120,0.25)']] },
    ],
  },
  neon: {
    name: 'Neon Night', note: 'Teal + magenta',
    overlays: [
      { op: 'overlay', stops: [[0, 'rgba(25,227,194,0.30)'], [1, 'rgba(255,46,136,0.34)']] },
      { op: 'multiply', stops: [[0, 'rgba(20,10,80,0.25)'], [1, 'rgba(10,10,40,0.30)']] },
    ],
  },
  pastel: {
    name: 'Pastel Vice', note: 'Soft pink + mint',
    overlays: [
      { op: 'soft-light', stops: [[0, 'rgba(255,150,200,0.40)'], [1, 'rgba(150,230,210,0.35)']] },
      { op: 'screen', stops: [[0, 'rgba(255,220,240,0.18)'], [1, 'rgba(220,255,245,0.14)']] },
    ],
  },
  mono: {
    name: 'Mono', note: 'Noir black & white',
    filter: 'grayscale(1) contrast(1.12) brightness(1.04)',
    overlays: [
      { op: 'soft-light', stops: [[0, 'rgba(255,255,255,0.25)'], [1, 'rgba(0,0,0,0.30)']] },
    ],
  },
};

/* ---------------------------------------------------------- state */

function defaultPanels(layoutKey) {
  return LAYOUTS[layoutKey].panels.map((p, i) => ({
    source: { kind: 'scene', key: SCENE_KEYS[i % SCENE_KEYS.length] },
    ox: 0, oy: 0, zoom: 1,
  }));
}

let state = {
  layout: 'hero',
  grade: 'sunset',
  title: 'SUNSET HEIST',
  subtitle: 'Vice City nights',
  tag: 'LEONIDA · VICE CITY',
  grain: true,
  vignette: true,
  selected: 0,
  panels: defaultPanels('hero'),
};

const undoStack = [];
const redoStack = [];

function snapshotState() {
  return JSON.parse(JSON.stringify({
    layout: state.layout, grade: state.grade, title: state.title,
    subtitle: state.subtitle, tag: state.tag, grain: state.grain,
    vignette: state.vignette, selected: state.selected,
    panels: state.panels.map((p) => ({
      source: p.source.kind === 'scene'
        ? { kind: 'scene', key: p.source.key }
        : { kind: 'upload', dataUrl: p.source.dataUrl },
      ox: p.ox, oy: p.oy, zoom: p.zoom,
    })),
  }));
}

function restoreSnapshot(snap) {
  state.layout = snap.layout; state.grade = snap.grade;
  state.title = snap.title; state.subtitle = snap.subtitle; state.tag = snap.tag;
  state.grain = snap.grain; state.vignette = snap.vignette;
  state.selected = snap.selected;
  state.panels = snap.panels.map((p) => {
    if (p.source.kind === 'upload') {
      const img = new Image();
      img.src = p.source.dataUrl;
      return { source: { kind: 'upload', dataUrl: p.source.dataUrl, img }, ox: p.ox, oy: p.oy, zoom: p.zoom };
    }
    return { source: { kind: 'scene', key: p.source.key }, ox: p.ox, oy: p.oy, zoom: p.zoom };
  });
  syncControls();
  renderPreview();
}

function pushHistory() {
  undoStack.push(snapshotState());
  if (undoStack.length > 40) undoStack.shift();
  redoStack.length = 0;
  updateUndoButtons();
}

function updateUndoButtons() {
  $('undoBtn').disabled = undoStack.length === 0;
  $('redoBtn').disabled = redoStack.length === 0;
}

function panelImage(panel) {
  if (panel.source.kind === 'upload') return panel.source.img;
  return sceneCanvas(panel.source.key);
}

/* ---------------------------------------------------------- cover renderer */

let grainPattern = null;
function getGrainPattern(ctx) {
  if (grainPattern) return grainPattern;
  const c = document.createElement('canvas');
  c.width = 160; c.height = 160;
  const g = c.getContext('2d');
  const rnd = mulberry32(99);
  for (let i = 0; i < 2600; i++) {
    const v = Math.floor(rnd() * 255);
    g.fillStyle = `rgba(${v},${v},${v},${0.10 + rnd() * 0.22})`;
    g.fillRect(Math.floor(rnd() * 160), Math.floor(rnd() * 160), 1.4, 1.4);
  }
  grainPattern = ctx.createPattern(c, 'repeat');
  return grainPattern;
}

function fitTitleFont(ctx, text, maxWidth, startPx) {
  let px = startPx;
  const family = '"Arial Black","Archivo Black","DejaVu Sans",sans-serif';
  while (px > 18) {
    ctx.font = `900 ${px}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return px;
    px = Math.floor(px * 0.92);
  }
  return px;
}

function renderCover(ctx, W, H, st) {
  const layout = LAYOUTS[st.layout];
  const gutter = Math.max(2, Math.round(Math.min(W, H) * 0.008));

  /* 1. panels on a composition canvas (so grades can filter the whole image) */
  const comp = document.createElement('canvas');
  comp.width = W; comp.height = H;
  const c = comp.getContext('2d');
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, W, H);
  layout.panels.forEach((p, i) => {
    const panel = st.panels[i];
    if (!panel) return;
    const px = p.x * W + gutter, py = p.y * H + gutter;
    const pw = p.w * W - gutter * 2, ph = p.h * H - gutter * 2;
    const img = panelImage(panel);
    if (!img || (img.naturalWidth === 0 && img.width === 0)) return;
    c.save();
    c.beginPath(); c.rect(px, py, pw, ph); c.clip();
    const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    const base = Math.max(pw / iw, ph / ih) * panel.zoom;
    const dw = iw * base, dh = ih * base;
    const dx = px + (pw - dw) / 2 + panel.ox * pw;
    const dy = py + (ph - dh) / 2 + panel.oy * ph;
    c.drawImage(img, dx, dy, dw, dh);
    c.restore();
  });

  /* 2. grade */
  const grade = GRADES[st.grade];
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (grade.filter) ctx.filter = grade.filter;
  ctx.drawImage(comp, 0, 0);
  ctx.restore();
  for (const ov of grade.overlays) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    for (const [at, color] of ov.stops) g.addColorStop(at, color);
    ctx.save();
    ctx.globalCompositeOperation = ov.op;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* 3. vignette + grain */
  if (st.vignette) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }
  if (st.grain) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = getGrainPattern(ctx);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* 4. white frame */
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(2, Math.round(Math.min(W, H) * 0.006));
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);

  /* 5. lettering */
  const cap = layout.caption;
  const cx = cap.x * W;
  const cy = cap.y * H;
  const title = (st.title || 'VICE CITY').toUpperCase();
  const maxTitleW = cap.align === 'center' ? W * 0.92 : W * (1 - cap.x - 0.04);
  const titlePx = fitTitleFont(ctx, title, maxTitleW, Math.round(Math.min(W, H) * cap.size));
  ctx.save();
  ctx.textAlign = cap.align;
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = `${Math.max(1, Math.round(titlePx * 0.02))}px`; } catch (e) { /* older canvas */ }
  ctx.lineJoin = 'round';
  ctx.font = `900 ${titlePx}px "Arial Black","Archivo Black","DejaVu Sans",sans-serif`;
  ctx.strokeStyle = 'rgba(10,4,24,0.92)';
  ctx.lineWidth = Math.max(3, Math.round(titlePx * 0.14));
  ctx.strokeText(title, cx, cy);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, cx, cy);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  /* subtitle in neon script */
  if (st.subtitle) {
    const subPx = Math.round(titlePx * 0.42);
    ctx.font = `italic 700 ${subPx}px "Brush Script MT","Segoe Script","DejaVu Sans",cursive`;
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = Math.round(subPx * 0.55);
    ctx.fillStyle = '#ffd7ea';
    const subY = cy + Math.round(titlePx * 0.62);
    ctx.fillText(st.subtitle, cx, subY);
    ctx.shadowBlur = 0;
  }
  /* top tag */
  if (st.tag) {
    const tagPx = Math.round(Math.min(W, H) * 0.026);
    ctx.font = `800 ${tagPx}px "Arial Black","DejaVu Sans",sans-serif`;
    ctx.textAlign = 'left';
    const tagX = Math.max(W * 0.03, gutter * 2);
    const tagY = Math.max(H * 0.03, gutter * 2) + tagPx;
    ctx.fillStyle = 'rgba(8,4,20,0.55)';
    const tw = ctx.measureText(`★ ${st.tag}`).width;
    ctx.fillRect(tagX - 10, tagY - tagPx - 6, tw + 20, tagPx + 14);
    ctx.fillStyle = '#ffc93c';
    ctx.fillText(`★ ${st.tag}`, tagX, tagY);
  }
  ctx.restore();
}

/* ---------------------------------------------------------- preview + editor */

const preview = $('preview');
const previewCtx = preview.getContext('2d');

function renderPreview() {
  const layout = LAYOUTS[state.layout];
  const W = 1080;
  const H = Math.round(W / layout.aspect);
  if (preview.width !== W || preview.height !== H) {
    preview.width = W;
    preview.height = H;
  }
  renderCover(previewCtx, W, H, state);
  /* selection outline */
  const p = layout.panels[state.selected];
  if (p) {
    const gutter = Math.max(2, Math.round(Math.min(W, H) * 0.008));
    previewCtx.save();
    previewCtx.strokeStyle = '#ffc93c';
    previewCtx.lineWidth = 6;
    previewCtx.setLineDash([18, 12]);
    previewCtx.strokeRect(p.x * W + gutter - 3, p.y * H + gutter - 3,
      p.w * W - gutter * 2 + 6, p.h * H - gutter * 2 + 6);
    previewCtx.setLineDash([]);
    previewCtx.font = '900 30px "Arial Black","DejaVu Sans",sans-serif';
    const label = ` ${p.name} `;
    const lw = previewCtx.measureText(label).width;
    previewCtx.fillStyle = '#ffc93c';
    previewCtx.fillRect(p.x * W + gutter, p.y * H + gutter, lw, 40);
    previewCtx.fillStyle = '#1a0b2e';
    previewCtx.fillText(label, p.x * W + gutter, p.y * H + gutter + 30);
    previewCtx.restore();
  }
  $('selectedPanelLabel').textContent = LAYOUTS[state.layout].panels[state.selected].name;
}

function previewPoint(evt) {
  const r = preview.getBoundingClientRect();
  return {
    x: (evt.clientX - r.left) * (preview.width / r.width),
    y: (evt.clientY - r.top) * (preview.height / r.height),
  };
}

function hitPanel(pt) {
  const layout = LAYOUTS[state.layout];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (pt.x >= p.x * preview.width && pt.x <= (p.x + p.w) * preview.width &&
        pt.y >= p.y * preview.height && pt.y <= (p.y + p.h) * preview.height) return i;
  }
  return -1;
}

let drag = null;
preview.addEventListener('pointerdown', (evt) => {
  const pt = previewPoint(evt);
  const idx = hitPanel(pt);
  if (idx < 0) return;
  if (idx !== state.selected) {
    state.selected = idx;
    syncControls();
  }
  drag = { x: pt.x, y: pt.y, moved: false };
  preview.setPointerCapture(evt.pointerId);
});
preview.addEventListener('pointermove', (evt) => {
  if (!drag) return;
  const pt = previewPoint(evt);
  const panel = state.panels[state.selected];
  const p = LAYOUTS[state.layout].panels[state.selected];
  panel.ox = clamp(panel.ox + (pt.x - drag.x) / (p.w * preview.width), -0.5, 0.5);
  panel.oy = clamp(panel.oy + (pt.y - drag.y) / (p.h * preview.height), -0.5, 0.5);
  drag.x = pt.x; drag.y = pt.y; drag.moved = true;
  renderPreview();
  syncSliders();
});
preview.addEventListener('pointerup', () => {
  if (drag && drag.moved) pushHistory();
  drag = null;
});
preview.addEventListener('wheel', (evt) => {
  evt.preventDefault();
  const idx = hitPanel(previewPoint(evt));
  if (idx < 0) return;
  if (idx !== state.selected) { state.selected = idx; syncControls(); }
  const panel = state.panels[state.selected];
  panel.zoom = clamp(panel.zoom * Math.exp(-evt.deltaY * 0.0012), 0.6, 3);
  renderPreview();
  syncSliders();
}, { passive: false });

/* ---------------------------------------------------------- controls */

function buildChoiceRow(el, items, activeKey, onPick) {
  el.innerHTML = '';
  for (const [key, item] of Object.entries(items)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice-btn' + (key === activeKey ? ' active' : '');
    b.innerHTML = `<b></b><small></small>`;
    b.querySelector('b').textContent = item.name;
    b.querySelector('small').textContent = item.note;
    b.addEventListener('click', () => {
      pushHistory();
      onPick(key);
      buildChoiceRow(el, items, key, onPick);
      renderPreview();
    });
    el.appendChild(b);
  }
}

function buildSceneStrip() {
  const strip = $('sceneStrip');
  strip.innerHTML = '';
  for (const key of SCENE_KEYS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'scene-thumb';
    b.title = SCENES[key].name;
    const c = document.createElement('canvas');
    c.width = 240; c.height = 180;
    c.getContext('2d').drawImage(sceneCanvas(key), 0, 0, 240, 180);
    const label = document.createElement('span');
    label.textContent = SCENES[key].name;
    b.append(c, label);
    b.addEventListener('click', () => {
      pushHistory();
      state.panels[state.selected].source = { kind: 'scene', key };
      state.panels[state.selected].ox = 0;
      state.panels[state.selected].oy = 0;
      state.panels[state.selected].zoom = 1;
      syncSceneStrip();
      renderPreview();
    });
    strip.appendChild(b);
  }
  syncSceneStrip();
}

function syncSceneStrip() {
  const panel = state.panels[state.selected];
  [...$('sceneStrip').children].forEach((b, i) => {
    b.classList.toggle('active',
      panel.source.kind === 'scene' && panel.source.key === SCENE_KEYS[i]);
  });
}

function syncSliders() {
  const panel = state.panels[state.selected];
  $('zoomSlider').value = panel.zoom;
  $('xSlider').value = panel.ox;
  $('ySlider').value = panel.oy;
}

function syncControls() {
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('tagInput').value = state.tag;
  $('grainToggle').checked = state.grain;
  $('vignetteToggle').checked = state.vignette;
  buildChoiceRow($('layoutRow'), LAYOUTS, state.layout, (key) => {
    state.layout = key;
    const old = state.panels;
    state.panels = defaultPanels(key);
    for (let i = 0; i < Math.min(old.length, state.panels.length); i++) {
      state.panels[i] = old[i];
    }
    state.selected = 0;
    syncControls();
  });
  buildChoiceRow($('gradeRow'), GRADES, state.grade, (key) => { state.grade = key; });
  syncSliders();
  syncSceneStrip();
}

$('zoomSlider').addEventListener('input', (e) => {
  state.panels[state.selected].zoom = parseFloat(e.target.value);
  renderPreview();
});
$('zoomSlider').addEventListener('change', pushHistory);
$('xSlider').addEventListener('input', (e) => {
  state.panels[state.selected].ox = parseFloat(e.target.value);
  renderPreview();
});
$('xSlider').addEventListener('change', pushHistory);
$('ySlider').addEventListener('input', (e) => {
  state.panels[state.selected].oy = parseFloat(e.target.value);
  renderPreview();
});
$('ySlider').addEventListener('change', pushHistory);

$('titleInput').addEventListener('input', (e) => { state.title = e.target.value; renderPreview(); });
$('titleInput').addEventListener('change', pushHistory);
$('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; renderPreview(); });
$('subtitleInput').addEventListener('change', pushHistory);
$('tagInput').addEventListener('input', (e) => { state.tag = e.target.value; renderPreview(); });
$('tagInput').addEventListener('change', pushHistory);
$('grainToggle').addEventListener('change', (e) => { pushHistory(); state.grain = e.target.checked; renderPreview(); });
$('vignetteToggle').addEventListener('change', (e) => { pushHistory(); state.vignette = e.target.checked; renderPreview(); });

$('photoInput').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      pushHistory();
      state.panels[state.selected].source = { kind: 'upload', dataUrl: reader.result, img };
      state.panels[state.selected].ox = 0;
      state.panels[state.selected].oy = 0;
      state.panels[state.selected].zoom = 1;
      syncSceneStrip();
      renderPreview();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

$('fillAllBtn').addEventListener('click', () => {
  pushHistory();
  const src = state.panels[state.selected].source;
  for (const p of state.panels) {
    p.source = src.kind === 'scene' ? { kind: 'scene', key: src.key } : src;
    p.ox = 0; p.oy = 0; p.zoom = 1;
  }
  syncSceneStrip();
  renderPreview();
});

$('shuffleBtn').addEventListener('click', () => {
  pushHistory();
  const rnd = mulberry32(Date.now() % 2147483647);
  const keys = [...SCENE_KEYS];
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  state.panels.forEach((p, i) => { p.source = { kind: 'scene', key: keys[i % keys.length] }; });
  syncSceneStrip();
  renderPreview();
});

$('undoBtn').addEventListener('click', () => {
  if (!undoStack.length) return;
  redoStack.push(snapshotState());
  restoreSnapshot(undoStack.pop());
  updateUndoButtons();
});
$('redoBtn').addEventListener('click', () => {
  if (!redoStack.length) return;
  undoStack.push(snapshotState());
  restoreSnapshot(redoStack.pop());
  updateUndoButtons();
});

/* ---------------------------------------------------------- export */

const EXPORT_SIZES = {
  poster: { w: 1080, h: 1350, label: 'Poster 4:5' },
  story: { w: 1080, h: 1920, label: 'Story 9:16' },
  square: { w: 1080, h: 1080, label: 'Square 1:1' },
  wide: { w: 1920, h: 1080, label: 'Wide 16:9' },
};

function exportCover(sizeKey) {
  const size = EXPORT_SIZES[sizeKey];
  const c = document.createElement('canvas');
  c.width = size.w; c.height = size.h;
  renderCover(c.getContext('2d'), size.w, size.h, state);
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vice-city-dusk-${sizeKey}-${size.w}x${size.h}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve(blob ? blob.size : 0);
    }, 'image/png');
  });
}

document.querySelectorAll('[data-export]').forEach((btn) => {
  btn.addEventListener('click', () => exportCover(btn.dataset.export));
});

/* ---------------------------------------------------------- shot mode + self test */

const params = new URLSearchParams(location.search);

function applyShotParams() {
  if (params.get('layout') && LAYOUTS[params.get('layout')]) {
    state.layout = params.get('layout');
    state.panels = defaultPanels(state.layout);
  }
  if (params.get('grade') && GRADES[params.get('grade')]) state.grade = params.get('grade');
  if (params.get('caption') !== null) state.title = params.get('caption');
  if (params.get('subtitle') !== null) state.subtitle = params.get('subtitle');
  if (params.get('tag') !== null) state.tag = params.get('tag');
  if (params.get('scene') && SCENES[params.get('scene')]) {
    state.panels[0].source = { kind: 'scene', key: params.get('scene') };
  }
  if (params.get('scene2') && SCENES[params.get('scene2')]) {
    state.panels[1].source = { kind: 'scene', key: params.get('scene2') };
  }
  if (params.get('scene3') && SCENES[params.get('scene3')]) {
    state.panels[2].source = { kind: 'scene', key: params.get('scene3') };
  }
  if (params.get('scene4') && SCENES[params.get('scene4')]) {
    state.panels[3].source = { kind: 'scene', key: params.get('scene4') };
  }
}

function runSelfTest() {
  const lines = [];
  let ok = true;
  for (const [key, size] of Object.entries(EXPORT_SIZES)) {
    const c = document.createElement('canvas');
    c.width = size.w; c.height = size.h;
    renderCover(c.getContext('2d'), size.w, size.h, state);
    const url = c.toDataURL('image/png');
    const bytes = Math.round(url.length * 0.75);
    const px = c.getContext('2d').getImageData(0, 0, 40, 40).data;
    let variance = 0;
    for (let i = 0; i < px.length; i += 4) variance += Math.abs(px[i] - px[i + 1]);
    const good = bytes > 20000 && variance > 0;
    if (!good) ok = false;
    lines.push(`${key} ${size.w}x${size.h}: png~${bytes} bytes, nonblank=${variance > 0}`);
  }
  const sceneOk = SCENE_KEYS.every((k) => {
    const c = sceneCanvas(k);
    const d = c.getContext('2d').getImageData(0, 0, 60, 60).data;
    let v = 0;
    for (let i = 0; i < d.length; i += 4) v += Math.abs(d[i] - d[i + 2]);
    return v > 0;
  });
  if (!sceneOk) ok = false;
  lines.push(`scenes nonblank=${sceneOk}`);
  lines.push(ok ? 'SELFTEST PASS' : 'SELFTEST FAIL');
  const el = $('selftest');
  el.hidden = false;
  el.textContent = lines.join('\n');
  document.title = ok ? 'SELFTEST PASS' : 'SELFTEST FAIL';
  console.log(lines.join('\n'));
}

function init() {
  applyShotParams();
  const shot = params.get('shot');
  if (shot === 'cover') {
    document.body.classList.add('shot');
    const W = clamp(parseInt(params.get('w') || '1280', 10) || 1280, 320, 1920);
    const H = clamp(parseInt(params.get('h') || '720', 10) || 720, 320, 1920);
    preview.width = W;
    preview.height = H;
    renderCover(previewCtx, W, H, state);
    document.title = `COVER ${state.layout} ${W}x${H}`;
    return;
  }
  buildSceneStrip();
  syncControls();
  renderPreview();
  updateUndoButtons();
  if (params.get('selftest') === '1') runSelfTest();
}

init();
