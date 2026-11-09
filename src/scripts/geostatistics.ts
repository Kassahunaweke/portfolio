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

function colorFor(z: number) {
  const tt = Math.min(1, Math.max(0, (z - zMin) / (zMax - zMin || 1))) * (STOPS.length - 1);
  const k = Math.min(STOPS.length - 2, Math.floor(tt));
  const f = tt - k;
  const c = STOPS[k].map((v, i) => Math.round(v + (STOPS[k + 1][i] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
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
    drawAll();
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
  for (let a = 0.3; a <= 8.0001; a += 0.05) {
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

[l3Nugget, l3Sill, l3Range].forEach((el) => el.addEventListener("input", drawL3));
l3Radios.forEach((r) => r.addEventListener("change", drawL3));
document.getElementById("l3-fit")!.addEventListener("click", autoFit);

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
  drawAll();
}

function drawAll() {
  drawL1();
  drawL2();
  drawL3();
}

let raf = 0;
const ro = new ResizeObserver(() => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(drawAll);
});
[l1Map, l1Plot, l2Map, l2Plot, l3Plot].forEach((c) => ro.observe(c));

document.getElementById("new-wells")!.addEventListener("click", newWells);
langButtons.forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang as Lang)));

newWells();
let saved: string | null = null;
try {
  saved = localStorage.getItem("geostat-lang");
} catch {}
if (saved === "am" || (!saved && navigator.language?.toLowerCase().startsWith("am"))) applyLang("am");
document.fonts?.ready.then(drawAll);
