// Small canvas plotting + DSP toolkit shared by all widgets (no dependencies).

export function css(name, fallback = '#888') {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
export function palette() {
  return {
    fg: css('--fg'), muted: css('--muted'), grid: css('--grid'), bg: css('--surface'),
    a: css('--viz-1'), b: css('--viz-2'), c: css('--viz-3'), d: css('--viz-4'),
    ok: css('--ok'), bad: css('--danger'),
  };
}

export const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Create a HiDPI canvas inside `parent`. Returns { canvas, ctx, w, h, resize }. */
export function makeCanvas(parent, height = 180, label = '') {
  const canvas = document.createElement('canvas');
  canvas.className = 'viz-canvas';
  canvas.setAttribute('role', 'img');
  if (label) canvas.setAttribute('aria-label', label);
  parent.appendChild(canvas);
  const obj = { canvas, ctx: canvas.getContext('2d'), w: 0, h: height };
  obj.resize = () => {
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const w = Math.max(240, canvas.parentElement.clientWidth);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = height + 'px';
    obj.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    obj.w = w;
  };
  obj.resize();
  return obj;
}

/** Line plot. series: [{ y: number[], x?: number[], color, width, dash }] */
export function linePlot(cv, series, opt = {}) {
  const { ctx, w, h } = cv, p = palette();
  const pad = { l: 40, r: 10, t: 14, b: 26, ...(opt.pad || {}) };
  ctx.clearRect(0, 0, w, h);
  const xs = series[0].x || series[0].y.map((_, i) => i);
  const [x0, x1] = opt.xlim || [xs[0], xs[xs.length - 1]];
  let [y0, y1] = opt.ylim || (() => {
    let lo = Infinity, hi = -Infinity;
    for (const s of series) for (const v of s.y) { if (v < lo) lo = v; if (v > hi) hi = v; }
    if (lo === hi) { lo -= 1; hi += 1; }
    const m = (hi - lo) * 0.08; return [lo - m, hi + m];
  })();
  const X = x => pad.l + (x - x0) / (x1 - x0) * (w - pad.l - pad.r);
  const Y = y => h - pad.b - (y - y0) / (y1 - y0) * (h - pad.t - pad.b);
  // grid + axes
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1; ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = p.muted;
  const ticks = opt.xticks || niceTicks(x0, x1, 5);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const tx of ticks) { const px = X(tx); ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, h - pad.b); ctx.stroke(); ctx.fillText(fmt(tx), px, h - pad.b + 4); }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const ty of (opt.yticks || niceTicks(y0, y1, 4))) { const py = Y(ty); if (py < pad.t - 1 || py > h - pad.b + 1) continue; ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(w - pad.r, py); ctx.stroke(); ctx.fillText(fmt(ty), pad.l - 4, py); }
  if (opt.xlabel) { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(opt.xlabel, w - pad.r, h - pad.b - 2); }
  if (opt.ylabel) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(opt.ylabel, pad.l + 4, pad.t); }
  // shaded bands
  for (const b of opt.bands || []) { ctx.fillStyle = b.color; ctx.fillRect(X(b.from), pad.t, X(b.to) - X(b.from), h - pad.t - pad.b); }
  // horizontal reference lines
  for (const r of opt.hlines || []) { ctx.strokeStyle = r.color || p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pad.l, Y(r.y)); ctx.lineTo(w - pad.r, Y(r.y)); ctx.stroke(); ctx.setLineDash([]); if (r.label) { ctx.fillStyle = r.color || p.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText(r.label, pad.l + 4, Y(r.y) - 2); } }
  ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, w - pad.l - pad.r, h - pad.t - pad.b); ctx.clip();
  for (const s of series) {
    const sx = s.x || xs;
    ctx.strokeStyle = s.color || p.a; ctx.lineWidth = s.width || 1.5; ctx.setLineDash(s.dash || []);
    if (s.width !== 0) {
      ctx.beginPath();
      for (let i = 0; i < s.y.length; i++) { const px = X(sx[i]), py = Y(s.y[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    if (s.dots) { ctx.fillStyle = s.color || p.a; for (let i = 0; i < s.y.length; i++) { ctx.beginPath(); ctx.arc(X(sx[i]), Y(s.y[i]), s.dots, 0, 7); ctx.fill(); } }
  }
  ctx.restore();
  return { X, Y };
}

/** Vertical bar chart. bars: [{ label, value, color }] */
export function barPlot(cv, bars, opt = {}) {
  const { ctx, w, h } = cv, p = palette();
  const pad = { l: 36, r: 8, t: 14, b: 30 };
  ctx.clearRect(0, 0, w, h);
  const max = opt.max ?? Math.max(...bars.map(b => b.value), 1e-9) * 1.15;
  const bw = (w - pad.l - pad.r) / bars.length;
  ctx.font = '11px system-ui, sans-serif';
  ctx.strokeStyle = p.grid;
  for (const ty of niceTicks(0, max, 4)) { const py = h - pad.b - ty / max * (h - pad.t - pad.b); ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(w - pad.r, py); ctx.stroke(); ctx.fillStyle = p.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(opt.pct ? Math.round(ty * 100) + '%' : fmt(ty), pad.l - 4, py); }
  bars.forEach((b, i) => {
    const bh = b.value / max * (h - pad.t - pad.b);
    const x = pad.l + i * bw + bw * 0.15;
    ctx.fillStyle = b.color || p.a; ctx.fillRect(x, h - pad.b - bh, bw * 0.7, bh);
    ctx.fillStyle = p.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(b.label, x + bw * 0.35, h - pad.b + 4);
    if (opt.showValues) { ctx.textBaseline = 'bottom'; ctx.fillText(opt.pct ? Math.round(b.value * 100) + '%' : fmt(b.value), x + bw * 0.35, h - pad.b - bh - 2); }
  });
  for (const r of opt.hlines || []) { const py = h - pad.b - r.y / max * (h - pad.t - pad.b); ctx.strokeStyle = r.color || p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(w - pad.r, py); ctx.stroke(); ctx.setLineDash([]); if (r.label) { ctx.fillStyle = r.color || p.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(r.label, w - pad.r, py - 2); } }
}

export function niceTicks(a, b, n) {
  const span = b - a; if (!(span > 0)) return [a];
  const step0 = span / n, mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) || mag * 10;
  const out = []; for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
export function fmt(v) { const a = Math.abs(v); return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(0) : a >= 1 ? v.toFixed(1).replace(/\.0$/, '') : a === 0 ? '0' : v.toFixed(2); }

// ---------- controls ----------
let ctrlId = 0;
export function slider(parent, { label, min, max, step = 1, value, unit = '', onInput, format }) {
  const id = `na-ctl-${++ctrlId}`;
  const wrap = document.createElement('div'); wrap.className = 'ctl';
  const lab = document.createElement('label'); lab.htmlFor = id;
  const out = document.createElement('output');
  const input = Object.assign(document.createElement('input'), { type: 'range', id, min, max, step, value });
  const show = () => { out.textContent = (format ? format(+input.value) : input.value) + unit; };
  lab.textContent = label; lab.appendChild(out);
  input.addEventListener('input', () => { show(); onInput(+input.value); });
  wrap.append(lab, input); parent.appendChild(wrap); show();
  return input;
}
export function toggle(parent, { label, value = false, onChange }) {
  const wrap = document.createElement('label'); wrap.className = 'ctl ctl-toggle';
  const input = Object.assign(document.createElement('input'), { type: 'checkbox', checked: value });
  input.addEventListener('change', () => onChange(input.checked));
  wrap.append(input, document.createTextNode(' ' + label)); parent.appendChild(wrap);
  return input;
}
export function segmented(parent, { options, value, onChange, label }) {
  const wrap = document.createElement('div'); wrap.className = 'seg'; wrap.setAttribute('role', 'group');
  if (label) wrap.setAttribute('aria-label', label);
  const btns = options.map(o => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = o.label;
    b.setAttribute('aria-pressed', String(o.value === value));
    b.addEventListener('click', () => { btns.forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); onChange(o.value); });
    wrap.appendChild(b); return b;
  });
  parent.appendChild(wrap); return wrap;
}
export function readout(parent) { const d = document.createElement('div'); d.className = 'readout'; d.setAttribute('aria-live', 'polite'); parent.appendChild(d); return d; }
export function controls(parent) { const d = document.createElement('div'); d.className = 'ctls'; parent.appendChild(d); return d; }

// ---------- random ----------
export function rng(seed = 1) {
  let a = seed >>> 0;
  const u = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let spare = null;
  const n = () => { if (spare !== null) { const s = spare; spare = null; return s; } let x, y, r; do { x = u() * 2 - 1; y = u() * 2 - 1; r = x * x + y * y; } while (!r || r >= 1); const m = Math.sqrt(-2 * Math.log(r) / r); spare = y * m; return x * m; };
  return { u, n };
}

// ---------- DSP ----------
/** In-place radix-2 FFT on Float64Array re/im (length power of two). */
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br; im[i + k] = ai + bi; re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
export function ifft(re, im) { for (let i = 0; i < im.length; i++) im[i] = -im[i]; fft(re, im); const n = re.length; for (let i = 0; i < n; i++) { re[i] /= n; im[i] = -im[i] / n; } }

/** Amplitude spectrum of x (length power of two) with Hann window. Returns { f, amp }. */
export function spectrum(x, fs) {
  const n = x.length, re = new Float64Array(n), im = new Float64Array(n);
  let wsum = 0;
  for (let i = 0; i < n; i++) { const wv = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)); re[i] = x[i] * wv; wsum += wv; }
  fft(re, im);
  const half = n / 2, f = [], amp = [];
  for (let k = 0; k <= half; k++) { f.push(k * fs / n); amp.push(2 * Math.hypot(re[k], im[k]) / wsum); }
  return { f, amp };
}
/** Welch PSD (Hann, 50% overlap). seg must be power of two. Returns { f, psd }. */
export function welch(x, fs, seg) {
  const step = seg / 2, f = [], acc = new Float64Array(seg / 2 + 1);
  let count = 0, wss = 0;
  const win = Array.from({ length: seg }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (seg - 1)));
  for (const v of win) wss += v * v;
  for (let s = 0; s + seg <= x.length; s += step) {
    const re = new Float64Array(seg), im = new Float64Array(seg);
    for (let i = 0; i < seg; i++) re[i] = x[s + i] * win[i];
    fft(re, im);
    for (let k = 0; k <= seg / 2; k++) acc[k] += (re[k] ** 2 + im[k] ** 2) / (fs * wss) * (k && k < seg / 2 ? 2 : 1);
    count++;
  }
  for (let k = 0; k <= seg / 2; k++) f.push(k * fs / seg);
  return { f, psd: Array.from(acc, v => v / Math.max(count, 1)) };
}
/** Ideal (brick-wall, zero-phase) band-pass via FFT — for visualisation only. */
export function fftBandpass(x, fs, lo, hi) {
  const n = x.length, re = Float64Array.from(x), im = new Float64Array(n);
  fft(re, im);
  for (let k = 0; k < n; k++) { const fk = (k <= n / 2 ? k : n - k) * fs / n; if (fk < lo || fk > hi) { re[k] = 0; im[k] = 0; } }
  ifft(re, im); return Array.from(re);
}
export const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
export const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
export function normCdf(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
export function pearson(a, b) { const ma = mean(a), mb = mean(b); let n = 0, da = 0, db = 0; for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return n / Math.sqrt(da * db); }
