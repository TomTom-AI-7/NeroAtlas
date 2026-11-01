import { makeCanvas, linePlot, barPlot, palette, slider, toggle, controls, readout, segmented, rng, spectrum as amps, welch, fftBandpass, fft, ifft } from './plot.js';

const FS = 256, N = 1024; // 4 s
const T = Array.from({ length: N }, (_, i) => i / FS);
const sine = (f, a = 1, ph = 0) => T.map(t => a * Math.sin(2 * Math.PI * f * t + ph));
function pink(seed, scale = 1) { // 1/f-like background via spectral shaping of white noise
  const r = rng(seed), re = Float64Array.from({ length: N }, () => r.n()), im = new Float64Array(N);
  fft(re, im);
  for (let k = 1; k < N; k++) { const fk = (k <= N / 2 ? k : N - k) * FS / N; const g = 1 / Math.sqrt(Math.max(fk, 0.5)); re[k] *= g; im[k] *= g; }
  re[0] = 0; im[0] = 0; ifft(re, im);
  const out = Array.from(re); const m = Math.max(...out.map(Math.abs)); return out.map(v => v / m * scale);
}
const white = (seed, s) => { const r = rng(seed); return T.map(() => r.n() * s); };
const add = (...xs) => xs[0].map((_, i) => xs.reduce((s, x) => s + x[i], 0));
const dB = a => a.map(v => 10 * Math.log10(Math.max(v, 1e-6)));

function twoPanels(el, L, h1 = 130, h2 = 150) {
  const cv1 = makeCanvas(el, h1, L({ ja: '時間波形', en: 'Waveform' }));
  const cv2 = makeCanvas(el, h2, L({ ja: 'スペクトル', en: 'Spectrum' }));
  return [cv1, cv2];
}
function onResize(cvs, draw) { const f = () => { cvs.forEach(c => c.resize()); draw(); }; addEventListener('resize', f); return () => removeEventListener('resize', f); }

// ---------- composite signal & spectrum ----------
export function spectrum(el, props = {}, { L }) {
  const ctl = controls(el);
  const showSpec = props.showSpectrum !== false;
  const cvs = showSpec ? twoPanels(el, L) : [makeCanvas(el, 150)];
  const out = readout(el);
  const st = { alpha: 1, beta: 0.4, mains: 0.3, noise: 0.3 };
  const bg = pink(21, 0.8), wn = white(22, 1);
  function draw() {
    const p = palette();
    const x = add(sine(10, st.alpha), sine(20, st.beta, 1), sine(50, st.mains), wn.map(v => v * st.noise), props.welch ? bg : T.map(() => 0));
    linePlot(cvs[0], [{ x: T.slice(0, 512), y: x.slice(0, 512), color: p.a, width: 1.2 }], { xlabel: 's', ylabel: 'µV (a.u.)' });
    if (showSpec) {
      if (props.welch) {
        const { f, psd } = welch(x, FS, 256); const k = f.findIndex(v => v > 70);
        linePlot(cvs[1], [{ x: f.slice(0, k), y: dB(psd.slice(0, k)), color: p.b, width: 1.6 }], { xlabel: 'Hz', ylabel: 'dB', bands: [{ from: 8, to: 13, color: 'rgba(127,127,127,.12)' }] });
      } else {
        const { f, amp } = amps(x, FS); const k = f.findIndex(v => v > 70);
        linePlot(cvs[1], [{ x: f.slice(0, k), y: amp.slice(0, k), color: p.b, width: 1.6 }], { xlabel: 'Hz', ylabel: L({ ja: '振幅', en: 'amplitude' }), ylim: [0, 1.6] });
      }
    }
    out.textContent = L({ ja: `成分：alpha 10 Hz ×${st.alpha}、beta 20 Hz ×${st.beta}、電源 50 Hz ×${st.mains}、雑音 ${st.noise}${props.welch ? '、1/f 背景あり（Welch, 1 秒窓）' : ''}`,
      en: `Components: alpha 10 Hz ×${st.alpha}, beta 20 Hz ×${st.beta}, mains 50 Hz ×${st.mains}, noise ${st.noise}${props.welch ? ', with 1/f background (Welch, 1-s windows)' : ''}` });
  }
  slider(ctl, { label: 'alpha 10 Hz ', min: 0, max: 1.5, step: 0.1, value: st.alpha, onInput: v => { st.alpha = v; draw(); } });
  slider(ctl, { label: 'beta 20 Hz ', min: 0, max: 1.5, step: 0.1, value: st.beta, onInput: v => { st.beta = v; draw(); } });
  slider(ctl, { label: L({ ja: '電源 50 Hz ', en: 'Mains 50 Hz ' }), min: 0, max: 1.5, step: 0.1, value: st.mains, onInput: v => { st.mains = v; draw(); } });
  slider(ctl, { label: L({ ja: '雑音 ', en: 'Noise ' }), min: 0, max: 2, step: 0.1, value: st.noise, onInput: v => { st.noise = v; draw(); } });
  draw();
  return onResize(cvs, draw);
}

// ---------- sampling & aliasing ----------
export function sampling(el, _p, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 190, L({ ja: '連続信号と標本点', en: 'Continuous signal and samples' }));
  const out = readout(el);
  const st = { f: 30, fs: 40 };
  const dur = 0.5, fine = Array.from({ length: 1000 }, (_, i) => i / 1000 * dur);
  function draw() {
    const p = palette();
    const ts = []; for (let t = 0; t <= dur + 1e-9; t += 1 / st.fs) ts.push(t);
    const k = Math.round(st.f / st.fs), fa = Math.abs(st.f - k * st.fs);
    linePlot(cv, [
      { x: fine, y: fine.map(t => Math.sin(2 * Math.PI * st.f * t)), color: p.muted, width: 1 },
      { x: fine, y: fine.map(t => Math.sin(2 * Math.PI * fa * t) * (st.f - k * st.fs < 0 ? -1 : 1)), color: p.bad, width: 1.4, dash: [5, 4] },
      { x: ts, y: ts.map(t => Math.sin(2 * Math.PI * st.f * t)), color: p.a, width: 0, dots: 3.5 },
    ], { ylim: [-1.3, 1.3], xlabel: 's' });
    const ok = st.f < st.fs / 2;
    out.textContent = L({ ja: `信号 ${st.f} Hz、fs ${st.fs} Hz、ナイキスト ${st.fs / 2} Hz → ${ok ? '正しく表現できる' : `エイリアシング！見かけは ${fa} Hz（赤破線）`}`,
      en: `Signal ${st.f} Hz, fs ${st.fs} Hz, Nyquist ${st.fs / 2} Hz → ${ok ? 'represented correctly' : `aliasing! appears as ${fa} Hz (red dashed)`}` });
  }
  slider(ctl, { label: L({ ja: '信号の周波数 ', en: 'Signal frequency ' }), min: 1, max: 60, step: 1, value: st.f, unit: ' Hz', onInput: v => { st.f = v; draw(); } });
  slider(ctl, { label: L({ ja: 'サンプリング周波数 fs ', en: 'Sampling rate fs ' }), min: 8, max: 200, step: 1, value: st.fs, unit: ' Hz', onInput: v => { st.fs = v; draw(); } });
  draw();
  return onResize([cv], draw);
}

// ---------- filters ----------
export function filter(el, _p, { L }) {
  const ctl = controls(el);
  const cvs = twoPanels(el, L);
  const out = readout(el);
  const st = { lo: 0.5, hi: 40 };
  const drift = T.map(t => 2.2 * Math.sin(2 * Math.PI * 0.25 * t) + 0.6 * t);
  const x = add(sine(10, 1), sine(50, 0.7), drift, white(31, 0.35), pink(32, 0.5));
  function draw() {
    const p = palette();
    const y = fftBandpass(x, FS, st.lo, st.hi);
    linePlot(cvs[0], [{ x: T.slice(0, 768), y: x.slice(0, 768), color: p.muted, width: 1 }, { x: T.slice(0, 768), y: y.slice(0, 768), color: p.a, width: 1.5 }], { xlabel: 's' });
    const A = welch(x, FS, 256), B = welch(y, FS, 256); const k = A.f.findIndex(v => v > 80);
    linePlot(cvs[1], [{ x: A.f.slice(0, k), y: dB(A.psd.slice(0, k)), color: p.muted, width: 1 }, { x: B.f.slice(0, k), y: dB(B.psd.slice(0, k)).map(v => Math.max(v, -60)), color: p.b, width: 1.6 }],
      { xlabel: 'Hz', ylabel: 'dB', ylim: [-60, 10], bands: [{ from: st.lo, to: st.hi, color: 'rgba(127,127,127,.12)' }] });
    out.textContent = L({ ja: `通過帯域 ${st.lo}–${st.hi} Hz（灰：処理前／色：処理後）。※説明用の理想フィルタ。実際のフィルタには遷移帯域とリンギングがある。`,
      en: `Pass band ${st.lo}–${st.hi} Hz (grey: raw / colour: filtered). Illustrative ideal filter — real filters have transition bands and ringing.` });
  }
  slider(ctl, { label: L({ ja: 'ハイパス（下限） ', en: 'High-pass (low cut) ' }), min: 0, max: 12, step: 0.5, value: st.lo, unit: ' Hz', onInput: v => { st.lo = v; draw(); } });
  slider(ctl, { label: L({ ja: 'ローパス（上限） ', en: 'Low-pass (high cut) ' }), min: 13, max: 100, step: 1, value: st.hi, unit: ' Hz', onInput: v => { st.hi = v; draw(); } });
  draw();
  return onResize(cvs, draw);
}

// ---------- band power ----------
const BANDS = [['delta', 1, 4], ['theta', 4, 8], ['alpha', 8, 13], ['beta', 13, 30], ['gamma', 30, 45]];
export function bands(el, _p, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 180, L({ ja: '相対バンドパワー', en: 'Relative band power' }));
  const out = readout(el);
  let closed = true;
  const bg = pink(41, 1), wn = white(42, 0.3);
  function draw() {
    const p = palette();
    const x = add(bg, wn, sine(10, closed ? 1.4 : 0.35), sine(6, 0.25), sine(21, closed ? 0.25 : 0.35));
    const { f, psd } = welch(x, FS, 256);
    const pw = BANDS.map(([, a, b]) => psd.filter((_, i) => f[i] >= a && f[i] < b).reduce((s, v) => s + v, 0));
    const tot = pw.reduce((s, v) => s + v, 0);
    const cols = [p.c, p.d, p.a, p.b, p.muted];
    barPlot(cv, BANDS.map(([n], i) => ({ label: n, value: pw[i] / tot, color: cols[i] })), { pct: true, showValues: true, max: 0.8 });
    out.textContent = L({ ja: closed ? '閉眼安静：後頭部 alpha が優位。' : '開眼：alpha が減衰（alpha blocking）。相対パワーなので他の帯域の割合が上がって見える点に注意。',
      en: closed ? 'Eyes closed: posterior alpha dominates.' : 'Eyes open: alpha attenuates (alpha blocking). Because power is relative, other bands look larger.' });
  }
  segmented(ctl, { value: true, options: [{ value: true, label: L({ ja: '閉眼', en: 'Eyes closed' }) }, { value: false, label: L({ ja: '開眼', en: 'Eyes open' }) }], onChange: v => { closed = v; draw(); } });
  draw();
  return onResize([cv], draw);
}

// ---------- artefacts ----------
export function artifacts(el, props = {}, { L }) {
  const ctl = controls(el);
  const cvs = twoPanels(el, L);
  const out = readout(el);
  const st = { blink: false, emg: false, mains: false, pop: false, notch: false, lowpass: false, ica: false };
  const brain = add(sine(10, 0.6), pink(51, 0.6), white(52, 0.1));
  const blink = T.map(t => [0.8, 2.3, 3.4].reduce((s, c) => s + 4 * Math.exp(-((t - c) ** 2) / 0.012), 0));
  const r = rng(53); const emg = T.map(t => (t > 1.4 && t < 2.6 ? 1 : 0.05) * r.n() * 1.2);
  const mains = sine(50, 0.8);
  const pop = T.map(t => (t > 2.95 && t < 3.0 ? 4 : 0) + (t >= 3.0 ? 4 * Math.exp(-(t - 3.0) * 6) : 0));
  function draw() {
    const p = palette();
    let x = add(brain, st.blink && !st.ica ? blink : T.map(() => 0), st.emg ? emg : T.map(() => 0), st.mains ? mains : T.map(() => 0), st.pop ? pop : T.map(() => 0));
    if (st.notch) { const n = fftBandpass(x, FS, 49, 51); x = x.map((v, i) => v - n[i]); }
    if (st.lowpass) x = fftBandpass(x, FS, 0, 40);
    linePlot(cvs[0], [{ x: T, y: x, color: p.a, width: 1.1 }], { xlabel: 's' });
    const { f, psd } = welch(x, FS, 256); const k = f.findIndex(v => v > 80);
    linePlot(cvs[1], [{ x: f.slice(0, k), y: dB(psd.slice(0, k)), color: p.b, width: 1.6 }], { xlabel: 'Hz', ylabel: 'dB', ylim: [-50, 15] });
    const tips = [];
    if (st.blink && !st.ica) tips.push(L({ ja: '瞬目：前頭部で大きく遅い山。低周波パワー増。', en: 'Blink: large slow bumps, frontal; low-frequency power up.' }));
    if (st.emg) tips.push(L({ ja: '筋電：高周波・広帯域。側頭部に多い。', en: 'EMG: broadband high frequency; temporal.' }));
    if (st.mains && !st.notch) tips.push(L({ ja: '電源雑音：50 Hz の鋭いピーク。', en: 'Mains: sharp 50 Hz peak.' }));
    if (st.pop) tips.push(L({ ja: '電極ポップ：1チャネルの急な段差と緩やかな回復。', en: 'Electrode pop: sudden step then slow recovery on one channel.' }));
    if (st.ica) tips.push(L({ ja: 'ICA は瞬目成分を推定して除去する（ここでは既知成分を差し引いて模擬）。', en: 'ICA estimates and removes the blink component (simulated here by subtracting the known source).' }));
    out.textContent = tips.join(' ') || L({ ja: 'きれいな安静時EEG（alpha＋1/f）。', en: 'Clean resting EEG (alpha + 1/f).' });
  }
  const tg = (label, k) => toggle(ctl, { label, value: st[k], onChange: v => { st[k] = v; draw(); } });
  tg(L({ ja: '瞬目', en: 'Blinks' }), 'blink'); tg(L({ ja: '筋電', en: 'Muscle (EMG)' }), 'emg'); tg(L({ ja: '電源雑音', en: 'Mains noise' }), 'mains'); tg(L({ ja: '電極ポップ', en: 'Electrode pop' }), 'pop');
  if (props.cleanable) {
    const sep = document.createElement('div'); sep.className = 'ctl-sep'; sep.textContent = L({ ja: '除去手順', en: 'Cleaning steps' }); ctl.appendChild(sep);
    tg(L({ ja: 'ノッチ 50 Hz', en: 'Notch 50 Hz' }), 'notch'); tg(L({ ja: 'ローパス 40 Hz', en: 'Low-pass 40 Hz' }), 'lowpass'); tg(L({ ja: 'ICA で瞬目除去', en: 'ICA blink removal' }), 'ica');
  }
  draw();
  return onResize(cvs, draw);
}

// ---------- static figure for "read the figure" questions ----------
// props: { kind: 'trace', site, blink, emg, mains, pop } | { kind: 'spectrum', peaks: [[f, amp]], mains, noise }
export function stimulus(el, props = {}, { L }) {
  const cv = makeCanvas(el, props.kind === 'spectrum' ? 170 : 150, L({ ja: '問題の図', en: 'Question figure' }));
  const r = rng(71);
  function draw() {
    const p = palette();
    if (props.kind === 'spectrum') {
      const x = add(pink(72, 0.5), white(73, props.noise ?? 0.2), ...(props.peaks || []).map(([f, a], i) => sine(f, a, i)), props.mains ? sine(50, props.mains) : T.map(() => 0));
      const { f, psd } = welch(x, FS, 256); const k = f.findIndex(v => v > 70);
      linePlot(cv, [{ x: f.slice(1, k), y: dB(psd.slice(1, k)), color: p.b, width: 1.8 }], { xlabel: 'Hz', ylabel: 'PSD (dB)', xticks: [0, 10, 20, 30, 40, 50, 60, 70] });
      return;
    }
    const brain = add(sine(10, 0.5), pink(74, 0.5), white(75, 0.08));
    const blink = T.map(t => [0.7, 2.1, 3.3].reduce((s, c) => s + 4 * Math.exp(-((t - c) ** 2) / 0.012), 0));
    const emg = T.map(t => (t > 1.4 && t < 2.6 ? 1.3 : 0.04) * r.n());
    const x = add(brain, props.blink ? blink : T.map(() => 0), props.emg ? emg : T.map(() => 0), props.mains ? sine(50, 0.8) : T.map(() => 0));
    linePlot(cv, [{ x: T, y: x, color: p.a, width: 1.2 }], { xlabel: 's', ylabel: props.site || 'EEG', ylim: [-4, 6] });
  }
  draw();
  return onResize([cv], draw);
}
