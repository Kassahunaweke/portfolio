// Interactive engine for /learn/geostatistics (lessons 1–3).
// All visible text comes from src/i18n/geostatistics.ts.
import { text, type Lang, type TextKey } from "../i18n/geostatistics";

// ---------------------------------------------------------------- language
const root = document.getElementById("geo") as HTMLElement;
const langButtons = Array.from(root.querySelectorAll<HTMLButtonElement>(".lang-switch button"));
let lang: Lang = "en";

function t(key: TextKey, vars?: Record<string, string | number>): string {
  let s: string = (text[lang] as Record<string, string>)[key] ?? text.en[key];
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

function applyLang(l: Lang) {
  lang = l;
  root.setAttribute("lang", l);
  root.querySelectorAll<HTMLElement>("[data-t]").forEach((el) => {
    el.innerHTML = t(el.dataset.t as TextKey);
  });
  langButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
  try {
    localStorage.setItem("geostat-lang", l);
  } catch {}
  drawAll();
  if (l === "am" && document.fonts) {
    document.fonts.load('16px "Noto Sans Ethiopic"', "ሀ").then(drawAll).catch(() => {});
  }
}

const canvasFont = (px: number, weight = 400) =>
  `${weight} ${px}px ${lang === "am" ? '"Noto Sans Ethiopic", ' : ""}"Segoe UI", Arial, sans-serif`;

// ---------------------------------------------------------------- random field & wells
const SIZE = 10; // map is 10 km x 10 km
const MAX_LAG = 7; // km, longest distance used in the variogram
const NBINS = 12;
const BIN_W = MAX_LAG / NBINS;

type Well = { x: number; y: number; z: number; noise: number };
type Wave = { kx: number; ky: number; phi: number };

let waves: Wave[] = [];
let wells: Well[] = [];

function randn() {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

// Spectral method: a sum of random waves gives a smooth, spatially correlated surface.
function makeField() {
  const range = 3.5 + Math.random() * 2; // km
  const sk = Math.sqrt(6) / range;
  waves = Array.from({ length: 150 }, () => ({
    kx: randn() * sk,
    ky: randn() * sk,
    phi: Math.random() * 2 * Math.PI,
  }));
}

function field(x: number, y: number) {
  let s = 0;
  for (const w of waves) s += Math.cos(w.kx * x + w.ky * y + w.phi);
  return s * Math.sqrt(2 / waves.length);
}

function makeWell(x: number, y: number): Well {
  const noise = randn() * 0.3;
  return { x, y, noise, z: Math.max(1, 15 + 4 * field(x, y) + noise) };
}

function makeWells(n = 60) {
  makeField();
  wells = [];
  let tries = 0;
  while (wells.length < n && tries < 5000) {
    tries++;
    const x = 0.3 + Math.random() * (SIZE - 0.6);
    const y = 0.3 + Math.random() * (SIZE - 0.6);
    if (wells.every((w) => Math.hypot(w.x - x, w.y - y) > 0.45)) wells.push(makeWell(x, y));
  }
}

// ---------------------------------------------------------------- derived data
type Pair = { i: number; j: number; h: number; g: number };
type Bin = { lo: number; hi: number; n: number; h: number; g: number };
let pairs: Pair[] = [];
let bins: Bin[] = [];
let zMin = 0;
let zMax = 1;

function recompute() {
  zMin = Math.min(...wells.map((w) => w.z));
  zMax = Math.max(...wells.map((w) => w.z));
  pairs = [];
  for (let i = 0; i < wells.length; i++)
    for (let j = i + 1; j < wells.length; j++) {
      const h = Math.hypot(wells[i].x - wells[j].x, wells[i].y - wells[j].y);
      const dz = wells[i].z - wells[j].z;
      pairs.push({ i, j, h, g: 0.5 * dz * dz });
    }
  bins = Array.from({ length: NBINS }, (_, k) => ({ lo: k * BIN_W, hi: (k + 1) * BIN_W, n: 0, h: 0, g: 0 }));
  for (const p of pairs) {
    if (p.h >= MAX_LAG) continue;
    const b = bins[Math.floor(p.h / BIN_W)];
    b.n++;
    b.h += p.h;
    b.g += p.g;
  }
  for (const b of bins) {
    if (b.n) {
      b.h /= b.n;
      b.g /= b.n;
    }
  }
}

const gammaMax = () => Math.max(1e-6, ...bins.filter((b) => b.n).map((b) => b.g));
const variance = () => {
  const m = wells.reduce((a, w) => a + w.z, 0) / wells.length;
  return wells.reduce((a, w) => a + (w.z - m) ** 2, 0) / wells.length;
};

// ---------------------------------------------------------------- drawing helpers
const BLUE = "#0b5c8e";
const NAVY = "#173753";
const ORANGE = "#e8743b";
const STOPS = ["#2c7bb6", "#abd9e9", "#ffffbf", "#fdae61", "#d7191c"].map((h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]);

const UNC_STOPS = ["#ffffff", "#dadaeb", "#9e9ac8", "#6a51a3", "#3f007d"].map((h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]);

function ramp(stops: number[][], u: number) {
  const tt = Math.min(1, Math.max(0, u)) * (stops.length - 1);
  const k = Math.min(stops.length - 2, Math.floor(tt));
  const f = tt - k;
  return stops[k].map((v, i) => Math.round(v + (stops[k + 1][i] - v) * f));
}

const colorRGB = (z: number) => ramp(STOPS, (z - zMin) / (zMax - zMin || 1));

function colorFor(z: number) {
  const c = colorRGB(z);
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// Paint a G x G grid of values onto the map area (row 0 = south).
const gridCanvas = document.createElement("canvas");
function drawGrid(
  ctx: CanvasRenderingContext2D,
  g: MapGeom,
  values: Float64Array,
  G: number,
  color: (v: number) => number[],
) {
  gridCanvas.width = G;
  gridCanvas.height = G;
  const gctx = gridCanvas.getContext("2d")!;
  const img = gctx.createImageData(G, G);
  for (let j = 0; j < G; j++)
    for (let i = 0; i < G; i++) {
      const c = color(values[j * G + i]);
      const o = ((G - 1 - j) * G + i) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  gctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(gridCanvas, g.pad, g.pad, g.side, g.side);
  ctx.restore();
  ctx.strokeStyle = "#b8c6d4";
  ctx.lineWidth = 1;
  ctx.strokeRect(g.pad, g.pad, g.side, g.side);
}

function prep(canvas: HTMLCanvasElement) {
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

type MapGeom = { pad: number; side: number; r: number; px: (x: number) => number; py: (y: number) => number };

function mapGeom(w: number, h: number): MapGeom {
  const pad = 14;
  const side = Math.min(w, h) - 2 * pad;
  return {
    pad,
    side,
    r: Math.max(4, side / 75),
    px: (x) => pad + (x / SIZE) * side,
    py: (y) => pad + (1 - y / SIZE) * side,
  };
}

function drawMapBase(ctx: CanvasRenderingContext2D, g: MapGeom) {
  ctx.strokeStyle = "#e6ecf2";
  ctx.lineWidth = 1;
  for (let k = 0; k <= SIZE; k++) {
    ctx.beginPath();
    ctx.moveTo(g.px(k), g.py(0));
    ctx.lineTo(g.px(k), g.py(SIZE));
    ctx.moveTo(g.px(0), g.py(k));
    ctx.lineTo(g.px(SIZE), g.py(k));
    ctx.stroke();
  }
  ctx.strokeStyle = "#b8c6d4";
  ctx.strokeRect(g.pad, g.pad, g.side, g.side);
}

function drawScaleBar(ctx: CanvasRenderingContext2D, g: MapGeom) {
  const x0 = g.px(0.4);
  const y0 = g.py(0.35);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(x0 - 6, y0 - 20, g.px(1.4) - x0 + 12, 26);
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(g.px(1.4), y0);
  ctx.stroke();
  ctx.fillStyle = NAVY;
  ctx.font = canvasFont(11);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`1 ${t("km")}`, (x0 + g.px(1.4)) / 2, y0 - 3);
}

function drawWells(ctx: CanvasRenderingContext2D, g: MapGeom) {
  for (const w of wells) {
    ctx.beginPath();
    ctx.arc(g.px(w.x), g.py(w.y), g.r, 0, 2 * Math.PI);
    ctx.fillStyle = colorFor(w.z);
    ctx.fill();
    ctx.strokeStyle = "rgba(23,55,83,0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  drawScaleBar(ctx, g);
}

function niceStep(max: number, n = 5) {
  const raw = max / n;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

function niceMax(v: number) {
  const s = niceStep(v);
  return Math.ceil(v / s) * s;
}

type Frame = { X: (v: number) => number; Y: (v: number) => number; l: number; r: number; t: number; b: number };

function plotFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  xmax: number,
  ymax: number,
  xlabel: string,
  ylabel: string,
): Frame {
  const l = 56;
  const r = w - 14;
  const tp = 14;
  const b = h - 46;
  const X = (v: number) => l + (v / xmax) * (r - l);
  const Y = (v: number) => b - (v / ymax) * (b - tp);
  ctx.font = canvasFont(11);
  ctx.fillStyle = "#555";
  ctx.strokeStyle = "#e6ecf2";
  ctx.lineWidth = 1;
  const xs = niceStep(xmax);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let v = 0; v <= xmax + 1e-9; v += xs) {
    ctx.beginPath();
    ctx.moveTo(X(v), tp);
    ctx.lineTo(X(v), b);
    ctx.stroke();
    ctx.fillText(fmt(v), X(v), b + 5);
  }
  const ys = niceStep(ymax);
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let v = 0; v <= ymax + 1e-9; v += ys) {
    ctx.beginPath();
    ctx.moveTo(l, Y(v));
    ctx.lineTo(r, Y(v));
    ctx.stroke();
    ctx.fillText(fmt(v), l - 6, Y(v));
  }
  ctx.strokeStyle = "#8a9bb0";
  ctx.beginPath();
  ctx.moveTo(l, tp);
  ctx.lineTo(l, b);
  ctx.lineTo(r, b);
  ctx.stroke();
  ctx.fillStyle = NAVY;
  ctx.font = canvasFont(12, 600);
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(xlabel, (l + r) / 2, h - 4);
  ctx.save();
  ctx.translate(14, (tp + b) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textBaseline = "middle";
  ctx.fillText(ylabel, 0, 0);
  ctx.restore();
  return { X, Y, l, r, t: tp, b };
}

function fmt(v: number) {
  return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke?: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function legendItem(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  dot(ctx, x, y, 5, color);
  ctx.fillStyle = "#333";
  ctx.font = canvasFont(12);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 10, y);
}

// ---------------------------------------------------------------- lesson 1
const l1Map = document.getElementById("l1-map") as HTMLCanvasElement;
const l1Plot = document.getElementById("l1-plot") as HTMLCanvasElement;
const l1Readout = document.getElementById("l1-readout") as HTMLElement;
let l1Sel = 0;

function l1Neighbours() {
  const s = wells[l1Sel];
  const others = wells
    .map((w, i) => ({ i, h: Math.hypot(w.x - s.x, w.y - s.y), dz: Math.abs(w.z - s.z) }))
    .filter((o) => o.i !== l1Sel)
    .sort((a, b) => a.h - b.h);
  return { others, near: others.slice(0, 3), far: others.slice(-3) };
}

function drawL1() {
  if (!wells.length) return;
  const { ctx, w, h } = prep(l1Map);
  const g = mapGeom(w, h);
  drawMapBase(ctx, g);
  const s = wells[l1Sel];
  const { others, near, far } = l1Neighbours();
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = ORANGE;
  for (const o of far) {
    ctx.beginPath();
    ctx.moveTo(g.px(s.x), g.py(s.y));
    ctx.lineTo(g.px(wells[o.i].x), g.py(wells[o.i].y));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 2.5;
  for (const o of near) {
    ctx.beginPath();
    ctx.moveTo(g.px(s.x), g.py(s.y));
    ctx.lineTo(g.px(wells[o.i].x), g.py(wells[o.i].y));
    ctx.stroke();
  }
  drawWells(ctx, g);
  ctx.beginPath();
  ctx.arc(g.px(s.x), g.py(s.y), g.r + 4, 0, 2 * Math.PI);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.stroke();

  // plot: distance vs difference
  const p = prep(l1Plot);
  const xmax = niceMax(Math.max(...others.map((o) => o.h)));
  const ymax = niceMax(Math.max(0.5, ...others.map((o) => o.dz)) * 1.1);
  const f = plotFrame(p.ctx, p.w, p.h, xmax, ymax, t("axDist"), t("axDiff"));
  for (const o of others) dot(p.ctx, f.X(o.h), f.Y(o.dz), 3, "rgba(23,55,83,0.3)");
  for (const o of far) dot(p.ctx, f.X(o.h), f.Y(o.dz), 6, ORANGE, "white");
  for (const o of near) dot(p.ctx, f.X(o.h), f.Y(o.dz), 6, BLUE, "white");
  legendItem(p.ctx, f.l + 14, f.t + 12, BLUE, t("l1Nearest"));
  legendItem(p.ctx, f.l + 14, f.t + 32, ORANGE, t("l1Farthest"));

  const mean = (a: { dz: number }[]) => a.reduce((x, o) => x + o.dz, 0) / a.length;
  const nm = mean(near);
  const fm = mean(far);
  l1Readout.innerHTML =
    t("l1Readout", { near: nm.toFixed(1), far: fm.toFixed(1) }) +
    (nm >= fm ? ` <span class="exception">${t("l1Exception")}</span>` : "");
}

l1Map.addEventListener("click", (e) => {
  const r = l1Map.getBoundingClientRect();
  const g = mapGeom(r.width, r.height);
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;
  let best = -1;
  let bestD = Infinity;
  wells.forEach((w, i) => {
    const d = Math.hypot(g.px(w.x) - mx, g.py(w.y) - my);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  if (bestD <= g.r + 8) {
    l1Sel = best;
  } else {
    const x = ((mx - g.pad) / g.side) * SIZE;
    const y = (1 - (my - g.pad) / g.side) * SIZE;
    if (x < 0 || y < 0 || x > SIZE || y > SIZE || wells.length >= 120) return;
    wells.push(makeWell(x, y));
    l1Sel = wells.length - 1;
    recompute();
    l4Dirty = true;
    drawAll();
    resetSims();
    return;
  }
  drawL1();
});

// ---------------------------------------------------------------- lesson 2
const l2Map = document.getElementById("l2-map") as HTMLCanvasElement;
const l2Plot = document.getElementById("l2-plot") as HTMLCanvasElement;
const l2Band = document.getElementById("l2-band") as HTMLInputElement;
const l2Cloud = document.getElementById("l2-cloud") as HTMLInputElement;
const l2Readout = document.getElementById("l2-readout") as HTMLElement;
l2Band.max = String(NBINS - 1);

function drawL2() {
  if (!wells.length) return;
  const band = Number(l2Band.value);
  const bin = bins[band];
  const inBand = pairs.filter((p) => p.h >= bin.lo && p.h < bin.hi);

  const { ctx, w, h } = prep(l2Map);
  const g = mapGeom(w, h);
  drawMapBase(ctx, g);
  ctx.strokeStyle = "rgba(11,92,142,0.35)";
  ctx.lineWidth = 1.2;
  for (const p of inBand) {
    ctx.beginPath();
    ctx.moveTo(g.px(wells[p.i].x), g.py(wells[p.i].y));
    ctx.lineTo(g.px(wells[p.j].x), g.py(wells[p.j].y));
    ctx.stroke();
  }
  drawWells(ctx, g);

  const p = prep(l2Plot);
  const cloud = l2Cloud.checked;
  let ymax: number;
  if (cloud) {
    const gs = pairs.filter((q) => q.h < MAX_LAG).map((q) => q.g).sort((a, b) => a - b);
    ymax = niceMax(gs[Math.floor(gs.length * 0.97)] || 1);
  } else {
    ymax = niceMax(gammaMax() * 1.25);
  }
  const f = plotFrame(p.ctx, p.w, p.h, MAX_LAG, ymax, t("axDist"), t("axGamma"));
  p.ctx.fillStyle = "rgba(11,92,142,0.09)";
  p.ctx.fillRect(f.X(bin.lo), f.t, f.X(bin.hi) - f.X(bin.lo), f.b - f.t);
  if (cloud) {
    for (const q of pairs) {
      if (q.h >= MAX_LAG || q.g > ymax) continue;
      const sel = q.h >= bin.lo && q.h < bin.hi;
      dot(p.ctx, f.X(q.h), f.Y(q.g), sel ? 2.2 : 1.6, sel ? "rgba(11,92,142,0.55)" : "rgba(120,130,140,0.25)");
    }
  }
  bins.forEach((b, k) => {
    if (!b.n || b.g > ymax) return;
    dot(p.ctx, f.X(b.h), f.Y(b.g), k === band ? 8 : 5.5, k === band ? ORANGE : NAVY, "white");
  });

  l2Readout.innerHTML = t("l2Readout", {
    n: bin.n,
    a: bin.lo.toFixed(1),
    b: bin.hi.toFixed(1),
    g: bin.n ? bin.g.toFixed(2) : "–",
  });
}

l2Band.addEventListener("input", drawL2);
l2Cloud.addEventListener("change", drawL2);

// ---------------------------------------------------------------- lesson 3
type Model = "spherical" | "exponential" | "gaussian";
const l3Plot = document.getElementById("l3-plot") as HTMLCanvasElement;
const l3Nugget = document.getElementById("l3-nugget") as HTMLInputElement;
const l3Sill = document.getElementById("l3-sill") as HTMLInputElement;
const l3Range = document.getElementById("l3-range") as HTMLInputElement;
const l3Readout = document.getElementById("l3-readout") as HTMLElement;
const l3Radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="l3-model"]'));
const l3Eqs = Array.from(root.querySelectorAll<HTMLElement>("#lesson3 .eq[data-model]"));

const shape: Record<Model, (r: number) => number> = {
  spherical: (r) => (r < 1 ? 1.5 * r - 0.5 * r * r * r : 1),
  exponential: (r) => 1 - Math.exp(-3 * r),
  gaussian: (r) => 1 - Math.exp(-3 * r * r),
};

const model = () => (l3Radios.find((r) => r.checked)?.value ?? "spherical") as Model;

function params() {
  const c0 = Number(l3Nugget.value);
  const s = Math.max(c0, Number(l3Sill.value));
  return { c0, s, a: Number(l3Range.value) };
}

function gammaModel(m: Model, h: number, c0: number, s: number, a: number) {
  return h <= 0 ? 0 : c0 + (s - c0) * shape[m](h / a);
}

function fitError(m: Model, c0: number, s: number, a: number) {
  let num = 0;
  let den = 0;
  for (const b of bins) {
    if (b.n < 3) continue;
    num += b.n * (b.g - gammaModel(m, b.h, c0, s, a)) ** 2;
    den += b.n;
  }
  return den ? Math.sqrt(num / den) : 0;
}

function setSliderScale() {
  const top = niceMax(Math.max(gammaMax(), variance()) * 1.6);
  for (const el of [l3Nugget, l3Sill]) {
    el.max = String(top);
    el.step = String(top / 500);
  }
}

function autoFit() {
  const m = model();
  const use = bins.filter((b) => b.n >= 3);
  let best = { err: Infinity, c0: 0, s: 1, a: 3 };
  const sMax = 1.5 * variance();
  for (let a = 0.3; a <= MAX_LAG + 1e-4; a += 0.05) {
    let suu = 0, suv = 0, svv = 0, suy = 0, svy = 0, sw = 0, swy = 0;
    for (const b of use) {
      const v = shape[m](b.h / a);
      const u = 1 - v;
      const w = b.n;
      suu += w * u * u;
      suv += w * u * v;
      svv += w * v * v;
      suy += w * u * b.g;
      svy += w * v * b.g;
      sw += w;
      swy += w * b.g;
    }
    const det = suu * svv - suv * suv;
    let c0 = det ? (suy * svv - svy * suv) / det : 0;
    let s = det ? (suu * svy - suv * suy) / det : swy / sw;
    if (c0 < 0) {
      c0 = 0;
      s = svv ? svy / svv : swy / sw;
    }
    if (s < c0) c0 = s = swy / sw;
    if (s > sMax) continue; // unrealistic: far above the spread of the data
    const err = fitError(m, c0, s, a);
    if (err < best.err) best = { err, c0, s, a };
  }
  const top = Number(l3Sill.max);
  if (best.s > top) {
    for (const el of [l3Nugget, l3Sill]) el.max = String(niceMax(best.s * 1.2));
  }
  l3Nugget.value = String(best.c0);
  l3Sill.value = String(best.s);
  l3Range.value = String(Math.round(best.a * 20) / 20);
  drawL3();
}

function drawL3() {
  if (!wells.length) return;
  const m = model();
  const { c0, s, a } = params();
  (document.getElementById("l3-nugget-v") as HTMLOutputElement).textContent = `${c0.toFixed(2)} m²`;
  (document.getElementById("l3-sill-v") as HTMLOutputElement).textContent = `${s.toFixed(2)} m²`;
  (document.getElementById("l3-range-v") as HTMLOutputElement).textContent = `${a.toFixed(2)} ${t("km")}`;
  l3Eqs.forEach((el) => (el.hidden = el.dataset.model !== m));

  const p = prep(l3Plot);
  const ymax = niceMax(Math.max(gammaMax() * 1.3, s * 1.15));
  const f = plotFrame(p.ctx, p.w, p.h, MAX_LAG, ymax, t("axDist"), t("axGamma"));
  const ctx = p.ctx;

  // guides for sill and range
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "rgba(23,55,83,0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(f.l, f.Y(s));
  ctx.lineTo(f.r, f.Y(s));
  if (a <= MAX_LAG) {
    ctx.moveTo(f.X(a), f.b);
    ctx.lineTo(f.X(a), f.t);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = NAVY;
  ctx.font = `italic ${canvasFont(14, 600)}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("s", f.r - 4, f.Y(s) - 3);
  if (a <= MAX_LAG) {
    ctx.textAlign = "left";
    ctx.fillText("a", f.X(a) + 4, f.t + 16);
  }

  // experimental points
  const maxN = Math.max(...bins.map((b) => b.n));
  for (const b of bins) {
    if (!b.n || b.g > ymax) continue;
    dot(ctx, f.X(b.h), f.Y(b.g), 3.5 + 4.5 * Math.sqrt(b.n / maxN), NAVY, "white");
  }

  // model curve
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const steps = 300;
  for (let k = 0; k <= steps; k++) {
    const hh = (k / steps) * MAX_LAG;
    const x = f.X(hh);
    const y = f.Y(k === 0 ? c0 : gammaModel(m, hh, c0, s, a));
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // nugget marker
  dot(ctx, f.X(0), f.Y(0), 4, "white", ORANGE);
  if (c0 > 0) {
    ctx.fillStyle = NAVY;
    ctx.font = `italic ${canvasFont(13, 600)}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("c₀", f.X(0) + 8, f.Y(c0));
  }

  l3Readout.innerHTML = t("l3Readout", { e: fitError(m, c0, s, a).toFixed(2) });
}

function onVariogramChange() {
  drawL3();
  l4Dirty = true;
  scheduleL4();
  resetSims();
}

[l3Nugget, l3Sill, l3Range].forEach((el) => el.addEventListener("input", onVariogramChange));
l3Radios.forEach((r) => r.addEventListener("change", onVariogramChange));
document.getElementById("l3-fit")!.addEventListener("click", () => {
  autoFit();
  onVariogramChange();
});

function usesText() {
  const { c0, s, a } = params();
  const key = ({ spherical: "l3Spherical", exponential: "l3Exponential", gaussian: "l3Gaussian" } as const)[model()];
  return t("usesVariogram", { model: t(key), c0: c0.toFixed(2), s: s.toFixed(2), a: a.toFixed(2) });
}

// ---------------------------------------------------------------- linear algebra
// In-place LU decomposition with partial pivoting of an N x N matrix.
function luFactor(A: Float64Array, N: number) {
  const piv = new Int32Array(N);
  for (let i = 0; i < N; i++) piv[i] = i;
  for (let k = 0; k < N; k++) {
    let p = k;
    let max = Math.abs(A[k * N + k]);
    for (let i = k + 1; i < N; i++) {
      const v = Math.abs(A[i * N + k]);
      if (v > max) {
        max = v;
        p = i;
      }
    }
    if (p !== k) {
      for (let j = 0; j < N; j++) {
        const tmp = A[k * N + j];
        A[k * N + j] = A[p * N + j];
        A[p * N + j] = tmp;
      }
      const tp = piv[k];
      piv[k] = piv[p];
      piv[p] = tp;
    }
    const d = A[k * N + k] || 1e-12;
    for (let i = k + 1; i < N; i++) {
      const f = (A[i * N + k] /= d);
      if (f !== 0) for (let j = k + 1; j < N; j++) A[i * N + j] -= f * A[k * N + j];
    }
  }
  return piv;
}

function luSolve(A: Float64Array, piv: Int32Array, N: number, b: Float64Array) {
  const x = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let s = b[piv[i]];
    for (let j = 0; j < i; j++) s -= A[i * N + j] * x[j];
    x[i] = s;
  }
  for (let i = N - 1; i >= 0; i--) {
    let s = x[i];
    for (let j = i + 1; j < N; j++) s -= A[i * N + j] * x[j];
    x[i] = s / (A[i * N + i] || 1e-12);
  }
  return x;
}

// Variogram from lesson 3, with a tiny extra nugget for numerical stability.
function gammaFn() {
  const m = model();
  const { c0, s, a } = params();
  const tiny = 1e-3 * Math.max(s, 1e-6);
  return (h: number) => (h <= 1e-9 ? 0 : gammaModel(m, h, c0, s, a) + tiny);
}

// ---------------------------------------------------------------- lesson 4: kriging
const G4 = 50;
const l4Map = document.getElementById("l4-map") as HTMLCanvasElement;
const l4Unc = document.getElementById("l4-unc") as HTMLCanvasElement;
const l4Readout = document.getElementById("l4-readout") as HTMLElement;
const l4Error = document.getElementById("l4-error") as HTMLElement;
const l4Views = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="l4-view"]'));
let l4Dirty = true;
let l4Target = { x: SIZE / 2, y: SIZE / 2 };
let l4Drag = -1;
const k4 = {
  est: new Float64Array(G4 * G4),
  sd: new Float64Array(G4 * G4),
  idw: new Float64Array(G4 * G4),
  truth: new Float64Array(G4 * G4),
  rmseK: 0,
  rmseI: 0,
  sdMax: 1,
};

type OK = { N: number; LU: Float64Array; piv: Int32Array; g: (h: number) => number };

function okPrepare(): OK {
  const g = gammaFn();
  const n = wells.length;
  const N = n + 1;
  const A = new Float64Array(N * N);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) A[i * N + j] = g(Math.hypot(wells[i].x - wells[j].x, wells[i].y - wells[j].y));
    A[i * N + n] = 1;
    A[n * N + i] = 1;
  }
  const piv = luFactor(A, N);
  return { N, LU: A, piv, g };
}

function okEstimate(ok: OK, x: number, y: number) {
  const n = ok.N - 1;
  const b = new Float64Array(ok.N);
  for (let i = 0; i < n; i++) b[i] = ok.g(Math.hypot(wells[i].x - x, wells[i].y - y));
  b[n] = 1;
  const sol = luSolve(ok.LU, ok.piv, ok.N, b);
  let est = 0;
  let v = sol[n];
  for (let i = 0; i < n; i++) {
    est += sol[i] * wells[i].z;
    v += sol[i] * b[i];
  }
  return { w: sol.subarray(0, n), est, sd: Math.sqrt(Math.max(0, v)) };
}

const trueDepth = (x: number, y: number) => Math.max(1, 15 + 4 * field(x, y));

function computeL4() {
  const ok = okPrepare();
  let eK = 0;
  let eI = 0;
  for (let j = 0; j < G4; j++)
    for (let i = 0; i < G4; i++) {
      const x = ((i + 0.5) / G4) * SIZE;
      const y = ((j + 0.5) / G4) * SIZE;
      const k = j * G4 + i;
      const r = okEstimate(ok, x, y);
      k4.est[k] = r.est;
      k4.sd[k] = r.sd;
      let num = 0;
      let den = 0;
      let exact = NaN;
      for (const w of wells) {
        const d2 = (w.x - x) ** 2 + (w.y - y) ** 2;
        if (d2 < 1e-12) {
          exact = w.z;
          break;
        }
        num += w.z / d2;
        den += 1 / d2;
      }
      k4.idw[k] = Number.isNaN(exact) ? num / den : exact;
      k4.truth[k] = trueDepth(x, y);
      eK += (k4.est[k] - k4.truth[k]) ** 2;
      eI += (k4.idw[k] - k4.truth[k]) ** 2;
    }
  k4.rmseK = Math.sqrt(eK / (G4 * G4));
  k4.rmseI = Math.sqrt(eI / (G4 * G4));
  k4.sdMax = Math.sqrt(params().s) || 1;
  l4Dirty = false;
  return ok;
}

const uncRGB = (sd: number) => ramp(UNC_STOPS, sd / k4.sdMax);

function drawTarget(ctx: CanvasRenderingContext2D, g: MapGeom) {
  const x = g.px(l4Target.x);
  const y = g.py(l4Target.y);
  dot(ctx, x, y, 10, "white", NAVY);
  ctx.fillStyle = NAVY;
  ctx.font = canvasFont(13, 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x, y + 1);
}

function drawL4() {
  if (!wells.length) return;
  const ok = l4Dirty ? computeL4() : okPrepare();
  const view = l4Views.find((r) => r.checked)?.value ?? "kriging";
  const target = okEstimate(ok, l4Target.x, l4Target.y);

  const { ctx, w, h } = prep(l4Map);
  const g = mapGeom(w, h);
  drawGrid(ctx, g, view === "idw" ? k4.idw : view === "truth" ? k4.truth : k4.est, G4, colorRGB);
  drawWells(ctx, g);
  drawTarget(ctx, g);
  if (view === "kriging") {
    // label the most important wells with their weights
    const top = Array.from(target.w, (wt, i) => ({ wt, i }))
      .sort((a, b) => Math.abs(b.wt) - Math.abs(a.wt))
      .slice(0, 6);
    ctx.font = canvasFont(11, 700);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (const { wt, i } of top) {
      const x = g.px(wells[i].x) + g.r + 3;
      const y = g.py(wells[i].y);
      const label = wt.toFixed(2);
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(x - 2, y - 8, tw + 4, 16);
      ctx.fillStyle = NAVY;
      ctx.fillText(label, x, y);
    }
  }

  const u = prep(l4Unc);
  const gu = mapGeom(u.w, u.h);
  drawGrid(u.ctx, gu, k4.sd, G4, uncRGB);
  for (const wl of wells) dot(u.ctx, gu.px(wl.x), gu.py(wl.y), Math.max(2.5, gu.r * 0.55), NAVY);
  drawTarget(u.ctx, gu);
  drawScaleBar(u.ctx, gu);

  (document.getElementById("l4-uses") as HTMLElement).textContent = usesText();
  l4Readout.innerHTML = t("l4Readout", { est: target.est.toFixed(1), sd: target.sd.toFixed(1) });
  l4Error.innerHTML = t("l4Error", { k: k4.rmseK.toFixed(2), i: k4.rmseI.toFixed(2) });
}

let l4Raf = 0;
function scheduleL4() {
  cancelAnimationFrame(l4Raf);
  l4Raf = requestAnimationFrame(drawL4);
}

function mapPoint(canvas: HTMLCanvasElement, e: PointerEvent) {
  const r = canvas.getBoundingClientRect();
  const g = mapGeom(r.width, r.height);
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;
  return {
    g,
    mx,
    my,
    x: Math.min(SIZE - 0.05, Math.max(0.05, ((mx - g.pad) / g.side) * SIZE)),
    y: Math.min(SIZE - 0.05, Math.max(0.05, (1 - (my - g.pad) / g.side) * SIZE)),
  };
}

for (const cv of [l4Map, l4Unc]) {
  cv.style.touchAction = "none";
  cv.addEventListener("pointerdown", (e) => {
    const p = mapPoint(cv, e);
    let best = -1;
    let bestD = Infinity;
    wells.forEach((w, i) => {
      const d = Math.hypot(p.g.px(w.x) - p.mx, p.g.py(w.y) - p.my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (bestD <= p.g.r + 8) {
      l4Drag = best;
      cv.setPointerCapture(e.pointerId);
    } else {
      l4Target = { x: p.x, y: p.y };
      scheduleL4();
    }
  });
  cv.addEventListener("pointermove", (e) => {
    if (l4Drag < 0) return;
    const p = mapPoint(cv, e);
    const wl = wells[l4Drag];
    wl.x = p.x;
    wl.y = p.y;
    wl.z = Math.max(1, 15 + 4 * field(p.x, p.y) + wl.noise);
    recompute();
    l4Dirty = true;
    scheduleL4();
  });
  const end = () => {
    if (l4Drag < 0) return;
    l4Drag = -1;
    drawL1();
    drawL2();
    drawL3();
    resetSims();
  };
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);
}
l4Views.forEach((r) => r.addEventListener("change", scheduleL4));

// ---------------------------------------------------------------- lesson 5: simulation (SGS)
const G5 = 40;
const K5 = 12; // neighbours used at each step
const l5Sim = document.getElementById("l5-sim") as HTMLCanvasElement;
const l5Cmp = document.getElementById("l5-cmp") as HTMLCanvasElement;
const l5Readout = document.getElementById("l5-readout") as HTMLElement;
const l5Another = document.getElementById("l5-another") as HTMLButtonElement;
const l5More = document.getElementById("l5-more") as HTMLButtonElement;
const l5Views = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="l5-view"]'));
let sims: Float64Array[] = [];
let simSum = new Float64Array(G5 * G5);
let simToken = 0;
let simBusy = false;
let simTimer = 0;

// One realization by Sequential Gaussian Simulation with simple kriging.
function simulateOne(): Float64Array {
  const m = model();
  const { c0, s, a } = params();
  const tiny = 1e-3 * Math.max(s, 1e-6);
  const C = (h: number) => (h <= 1e-9 ? s + tiny : s - gammaModel(m, h, c0, s, a));
  const mean = wells.reduce((acc, w) => acc + w.z, 0) / wells.length;
  const total = wells.length + G5 * G5;
  const px = new Float64Array(total);
  const py = new Float64Array(total);
  const pv = new Float64Array(total);
  let np = 0;
  for (const w of wells) {
    px[np] = w.x;
    py[np] = w.y;
    pv[np] = w.z;
    np++;
  }
  const order = Array.from({ length: G5 * G5 }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const out = new Float64Array(G5 * G5);
  const nIdx = new Int32Array(K5);
  const nD = new Float64Array(K5);
  for (const cell of order) {
    const x = ((cell % G5) + 0.5) / G5 * SIZE;
    const y = (Math.floor(cell / G5) + 0.5) / G5 * SIZE;
    // find the K5 nearest known points
    let found = 0;
    for (let p = 0; p < np; p++) {
      const d = (px[p] - x) ** 2 + (py[p] - y) ** 2;
      if (found < K5) {
        let q = found++;
        while (q > 0 && nD[q - 1] > d) {
          nD[q] = nD[q - 1];
          nIdx[q] = nIdx[q - 1];
          q--;
        }
        nD[q] = d;
        nIdx[q] = p;
      } else if (d < nD[K5 - 1]) {
        let q = K5 - 1;
        while (q > 0 && nD[q - 1] > d) {
          nD[q] = nD[q - 1];
          nIdx[q] = nIdx[q - 1];
          q--;
        }
        nD[q] = d;
        nIdx[q] = p;
      }
    }
    const k = found;
    const A = new Float64Array(k * k);
    const b = new Float64Array(k);
    for (let r = 0; r < k; r++) {
      const ir = nIdx[r];
      for (let c = 0; c < k; c++) {
        const ic = nIdx[c];
        A[r * k + c] = C(Math.hypot(px[ir] - px[ic], py[ir] - py[ic]));
      }
      b[r] = C(Math.sqrt(nD[r]));
    }
    const piv = luFactor(A, k);
    const lam = luSolve(A, piv, k, b);
    let est = mean;
    let v = s;
    for (let r = 0; r < k; r++) {
      est += lam[r] * (pv[nIdx[r]] - mean);
      v -= lam[r] * b[r];
    }
    const val = est + Math.sqrt(Math.max(0, v)) * randn();
    out[cell] = val;
    px[np] = x;
    py[np] = y;
    pv[np] = val;
    np++;
  }
  return out;
}

async function addSims(count: number) {
  if (simBusy) return;
  simBusy = true;
  const token = simToken;
  l5Another.disabled = l5More.disabled = true;
  l5Readout.innerHTML = t("l5Working");
  for (let i = 0; i < count; i++) {
    await new Promise((r) => setTimeout(r, 0));
    if (token !== simToken) break;
    const sim = simulateOne();
    sims.push(sim);
    for (let k = 0; k < sim.length; k++) simSum[k] += sim[k];
    drawL5();
  }
  simBusy = false;
  l5Another.disabled = l5More.disabled = false;
  drawL5();
  if (token !== simToken) addSims(1);
}

function resetSims() {
  simToken++;
  sims = [];
  simSum = new Float64Array(G5 * G5);
  clearTimeout(simTimer);
  simTimer = window.setTimeout(() => addSims(1), 250);
}

function drawL5() {
  if (!wells.length) return;
  if (l4Dirty) computeL4();
  const view = l5Views.find((r) => r.checked)?.value ?? "kriging";
  const n = sims.length;
  (document.getElementById("l5-uses") as HTMLElement).textContent = usesText();
  (document.getElementById("l5-current") as HTMLElement).textContent = n ? t("l5Current", { n }) : "";

  const a = prep(l5Sim);
  const ga = mapGeom(a.w, a.h);
  if (n) drawGrid(a.ctx, ga, sims[n - 1], G5, colorRGB);
  else drawMapBase(a.ctx, ga);
  drawWells(a.ctx, ga);

  const b = prep(l5Cmp);
  const gb = mapGeom(b.w, b.h);
  if (view === "average" && n) {
    drawGrid(b.ctx, gb, simSum.map((v) => v / n), G5, colorRGB);
  } else if (view === "truth") {
    drawGrid(b.ctx, gb, k4.truth, G4, colorRGB);
  } else {
    drawGrid(b.ctx, gb, k4.est, G4, colorRGB);
  }
  drawWells(b.ctx, gb);

  if (!simBusy) l5Readout.innerHTML = t("l5Readout", { n });
}

l5Another.addEventListener("click", () => addSims(1));
l5More.addEventListener("click", () => addSims(20));
l5Views.forEach((r) => r.addEventListener("change", drawL5));

function resetL3() {
  setSliderScale();
  l3Nugget.value = "0";
  l3Sill.value = String(variance());
  l3Range.value = "1.5";
}

// ---------------------------------------------------------------- wiring
// Start lesson 1 on a well near the middle that shows the idea clearly.
function centralWell() {
  let best = 0;
  let bestScore = -Infinity;
  const prev = l1Sel;
  wells.forEach((w, i) => {
    const d = Math.hypot(w.x - SIZE / 2, w.y - SIZE / 2);
    if (d > 3) return;
    l1Sel = i;
    const { near, far } = l1Neighbours();
    const m = (a: { dz: number }[]) => a.reduce((x, o) => x + o.dz, 0) / a.length;
    const score = m(far) / (m(near) + 0.2) - d * 0.3;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  l1Sel = prev;
  return best;
}

function newWells() {
  makeWells();
  recompute();
  l1Sel = centralWell();
  resetL3();
  autoFit();
  l4Dirty = true;
  l4Target = { x: SIZE / 2, y: SIZE / 2 };
  drawAll();
  resetSims();
}

function drawAll() {
  drawL1();
  drawL2();
  drawL3();
  drawL4();
  drawL5();
}

let raf = 0;
const ro = new ResizeObserver(() => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(drawAll);
});
[l1Map, l1Plot, l2Map, l2Plot, l3Plot, l4Map, l4Unc, l5Sim, l5Cmp].forEach((c) => ro.observe(c));

document.getElementById("new-wells")!.addEventListener("click", newWells);
langButtons.forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang as Lang)));

newWells();
let saved: string | null = null;
try {
  saved = localStorage.getItem("geostat-lang");
} catch {}
if (saved === "am" || (!saved && navigator.language?.toLowerCase().startsWith("am"))) applyLang("am");
document.fonts?.ready.then(drawAll);
