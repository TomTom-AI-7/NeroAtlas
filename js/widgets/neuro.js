import { makeCanvas, linePlot, palette, slider, controls, readout, segmented, rng, reducedMotion } from './plot.js';

// ---------- LIF neuron ----------
export function neuron(el, props = {}, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 200, L({ ja: '膜電位の時間変化', en: 'Membrane potential over time' }));
  const out = readout(el);
  const st = { I: 18, inh: 0 };
  const dt = 0.1, T = 300, tau = 10, vRest = -70, vTh = -55, vReset = -75, tRef = 2;
  let trace = [], times = [], spikes = 0, raf = 0, cursor = 0;

  function simulate() {
    const r = rng(5); let v = vRest, last = -1e9; trace = []; times = []; spikes = 0;
    for (let i = 0; i < T / dt; i++) {
      const t = i * dt;
      if (t - last < tRef) { trace.push(vReset); times.push(t); continue; }
      const I = st.I - st.inh + r.n() * 3;
      v += dt / tau * (-(v - vRest) + I);
      if (v >= vTh) { trace.push(30); times.push(t); v = vReset; last = t; spikes++; continue; }
      trace.push(v); times.push(t);
    }
    out.textContent = L({ ja: `発火数 ${spikes} 回 / ${T} ms → 発火頻度 ≈ ${Math.round(spikes / T * 1000)} Hz`, en: `${spikes} spikes in ${T} ms → rate ≈ ${Math.round(spikes / T * 1000)} Hz` });
  }
  function draw(upto = trace.length) {
    const p = palette();
    linePlot(cv, [{ x: times.slice(0, upto), y: trace.slice(0, upto), color: p.a, width: 1.6 }],
      { xlim: [0, T], ylim: [-80, 35], xlabel: 'ms', ylabel: 'mV', hlines: [{ y: vTh, color: p.bad, label: L({ ja: '閾値', en: 'threshold' }) }] });
  }
  function animate() {
    cancelAnimationFrame(raf);
    if (reducedMotion()) { draw(); return; }
    cursor = 0;
    const step = () => { cursor = Math.min(trace.length, cursor + 40); draw(cursor); if (cursor < trace.length) raf = requestAnimationFrame(step); };
    step();
  }
  const update = () => { simulate(); animate(); };
  slider(ctl, { label: L({ ja: '興奮性入力電流 I ', en: 'Excitatory input I ' }), min: 0, max: 60, step: 1, value: st.I, onInput: v => { st.I = v; update(); } });
  if (props.showInhibition) slider(ctl, { label: L({ ja: '抑制性入力 ', en: 'Inhibitory input ' }), min: 0, max: 40, step: 1, value: st.inh, onInput: v => { st.inh = v; update(); } });
  const onResize = () => { cv.resize(); draw(); };
  addEventListener('resize', onResize);
  update();
  return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize); };
}

// ---------- synchrony & summation ----------
export function synchrony(el, _p, { L }) {
  const ctl = controls(el);
  const cv1 = makeCanvas(el, 120, L({ ja: '個々のニューロンの電流', en: 'Individual currents' }));
  const cv2 = makeCanvas(el, 120, L({ ja: '総和（頭皮電位）', en: 'Sum (scalp potential)' }));
  const out = readout(el);
  const N = 80, fs = 250, n = 250; let sync = 0.2;
  const r = rng(11); const jitter = Array.from({ length: N }, () => r.u() * 2 - 1);
  const t = Array.from({ length: n }, (_, i) => i / fs);
  function draw() {
    const p = palette();
    const phases = jitter.map(j => j * Math.PI * (1 - sync));
    const cells = phases.map(ph => t.map(tt => Math.sin(2 * Math.PI * 10 * tt + ph)));
    const sum = t.map((_, i) => cells.reduce((s, c) => s + c[i], 0));
    linePlot(cv1, cells.slice(0, 6).map((y, k) => ({ x: t, y, color: [p.a, p.b, p.c, p.d, p.a, p.b][k], width: 1 })), { ylim: [-1.3, 1.3], xlabel: 's' });
    linePlot(cv2, [{ x: t, y: sum, color: p.fg, width: 2 }], { ylim: [-N, N], xlabel: 's' });
    const amp = Math.max(...sum);
    out.textContent = L({ ja: `${N}個の和の振幅 ≈ ${amp.toFixed(0)}（完全同期なら ${N}、ランダム位相なら約 √${N} ≈ ${Math.sqrt(N).toFixed(0)}）`, en: `Sum amplitude ≈ ${amp.toFixed(0)} (fully synchronous: ${N}; random phases: ~√${N} ≈ ${Math.sqrt(N).toFixed(0)})` });
  }
  slider(ctl, { label: L({ ja: '同期度 ', en: 'Synchrony ' }), min: 0, max: 1, step: 0.05, value: sync, format: v => Math.round(v * 100), unit: '%', onInput: v => { sync = v; draw(); } });
  const onResize = () => { cv1.resize(); cv2.resize(); draw(); };
  addEventListener('resize', onResize); draw();
  return () => removeEventListener('resize', onResize);
}

// ---------- brain regions ----------
const REGIONS = [
  { id: 'pfc', shape: 'M40,110 C40,60 90,35 140,38 L150,95 C120,110 80,120 40,110Z', name: { ja: '前頭前野 (PFC)', en: 'Prefrontal cortex' },
    fn: { ja: '計画・意思決定・感情制御。うつ病研究で頻出。', en: 'Planning, decisions, emotion regulation; central to depression research.' }, eeg: { ja: '表層で比較的見えやすい（Fp/F電極）。ただし眼球アーチファクトの影響が大きい。', en: 'Superficial and fairly visible (Fp/F sites), but heavily affected by eye artefacts.' } },
  { id: 'motor', shape: 'M140,38 C165,36 185,38 200,42 L195,105 L150,95Z', name: { ja: '運動野・感覚運動野', en: 'Motor / sensorimotor cortex' },
    fn: { ja: '運動の実行とイメージ。運動イメージBCIの主役。', en: 'Movement execution and imagery — the core of motor-imagery BCI.' }, eeg: { ja: 'C3/Cz/C4 付近。mu/beta 帯の ERD が見える。', en: 'Near C3/Cz/C4; mu/beta ERD is visible.' } },
  { id: 'parietal', shape: 'M200,42 C235,48 262,68 272,95 L230,120 L195,105Z', name: { ja: '頭頂葉', en: 'Parietal lobe' },
    fn: { ja: '空間・注意・感覚統合。', en: 'Space, attention, sensory integration.' }, eeg: { ja: 'P電極。P300 などの ERP が見える。', en: 'P sites; ERPs such as P300.' } },
  { id: 'occipital', shape: 'M272,95 C285,120 282,150 265,170 L235,150 L230,120Z', name: { ja: '後頭葉（視覚野）', en: 'Occipital lobe (visual cortex)' },
    fn: { ja: '視覚処理。', en: 'Visual processing.' }, eeg: { ja: 'O1/O2。閉眼安静時の alpha が最も強い。', en: 'O1/O2; strongest eyes-closed alpha.' } },
  { id: 'temporal', shape: 'M70,140 C110,125 190,125 235,150 C215,185 140,195 90,175Z', name: { ja: '側頭葉', en: 'Temporal lobe' },
    fn: { ja: '聴覚・言語・記憶。', en: 'Hearing, language, memory.' }, eeg: { ja: 'T電極。咀嚼筋の筋電が混入しやすい。', en: 'T sites; jaw-muscle EMG contamination is common.' } },
  { id: 'amygdala', deep: true, cx: 120, cy: 150, r: 9, name: { ja: '扁桃体（深部）', en: 'Amygdala (deep)' },
    fn: { ja: '脅威・情動の評価。', en: 'Threat and affect appraisal.' }, eeg: { ja: '深部で頭皮からはほぼ直接見えない。fMRI等が必要。', en: 'Deep: essentially invisible to scalp EEG; needs fMRI etc.' } },
  { id: 'hippo', deep: true, cx: 160, cy: 155, r: 11, name: { ja: '海馬（深部）', en: 'Hippocampus (deep)' },
    fn: { ja: '記憶の形成と文脈。', en: 'Memory formation and context.' }, eeg: { ja: '深部。頭皮EEGでの直接観測は困難。', en: 'Deep; hard to observe directly with scalp EEG.' } },
];
export function brainmap(el, _p, { L }) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '20 20 280 190'); svg.classList.add('viz-svg');
  svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', L({ ja: '脳の側面図', en: 'Lateral brain view' }));
  const info = readout(el);
  let sel = null;
  const els = REGIONS.map((r, i) => {
    const node = r.deep ? document.createElementNS(ns, 'circle') : document.createElementNS(ns, 'path');
    if (r.deep) { node.setAttribute('cx', r.cx); node.setAttribute('cy', r.cy); node.setAttribute('r', r.r); node.classList.add('deep'); }
    else node.setAttribute('d', r.shape);
    node.classList.add('region', `r${i % 4}`);
    node.setAttribute('tabindex', '0'); node.setAttribute('role', 'button'); node.setAttribute('aria-label', L(r.name));
    const pick = () => { sel?.classList.remove('sel'); node.classList.add('sel'); sel = node; info.innerHTML = `<strong>${L(r.name)}</strong><br>${L(r.fn)}<br><em>EEG:</em> ${L(r.eeg)}`; };
    node.addEventListener('click', pick); node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    return node;
  });
  els.filter((_, i) => !REGIONS[i].deep).forEach(n => svg.appendChild(n));
  els.filter((_, i) => REGIONS[i].deep).forEach(n => svg.appendChild(n));
  const label = (x, y, s) => { const tx = document.createElementNS(ns, 'text'); tx.setAttribute('x', x); tx.setAttribute('y', y); tx.textContent = s; tx.classList.add('svg-label'); svg.appendChild(tx); };
  label(30, 32, L({ ja: '← 前（顔側）', en: '← front' }));
  el.prepend(svg);
  info.textContent = L({ ja: '領域をタップしてください（点線の円は深部構造）。', en: 'Tap a region (dashed circles are deep structures).' });
  return () => {};
}

// ---------- 10–20 electrodes & reference ----------
export const E1020 = {
  Fp1: [-0.25, 0.8], Fp2: [0.25, 0.8], F7: [-0.65, 0.48], F3: [-0.33, 0.42], Fz: [0, 0.4], F4: [0.33, 0.42], F8: [0.65, 0.48],
  T7: [-0.82, 0], C3: [-0.41, 0], Cz: [0, 0], C4: [0.41, 0], T8: [0.82, 0],
  P7: [-0.65, -0.48], P3: [-0.33, -0.42], Pz: [0, -0.4], P4: [0.33, -0.42], P8: [0.65, -0.48], O1: [-0.25, -0.8], O2: [0.25, -0.8],
};
const LOBE = { Fp: { ja: '前頭極', en: 'frontopolar' }, F: { ja: '前頭', en: 'frontal' }, C: { ja: '中心', en: 'central' }, T: { ja: '側頭', en: 'temporal' }, P: { ja: '頭頂', en: 'parietal' }, O: { ja: '後頭', en: 'occipital' } };
export function electrodes(el, _p, { L }) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '-1.15 -1.2 2.3 2.35'); svg.classList.add('viz-svg', 'head');
  svg.innerHTML = `<circle cx="0" cy="0" r="1" class="head-outline"/><path d="M-0.12,-0.99 L0,-1.13 L0.12,-0.99" class="head-outline"/>
    <ellipse cx="-1.04" cy="0" rx="0.06" ry="0.16" class="head-outline"/><ellipse cx="1.04" cy="0" rx="0.06" ry="0.16" class="head-outline"/>`;
  const ctl = controls(el);
  const cv = makeCanvas(el, 150, L({ ja: '選択電極の波形', en: 'Selected electrode waveform' }));
  const out = readout(el);
  let sel = 'O1', ref = 'Cz';
  const fs = 200, n = 400, r = rng(3);
  const t = Array.from({ length: n }, (_, i) => i / fs);
  const alpha = t.map(tt => Math.sin(2 * Math.PI * 10 * tt));
  const slow = t.map(tt => Math.sin(2 * Math.PI * 0.7 * tt));
  const noise = Object.fromEntries(Object.keys(E1020).map(k => [k, t.map(() => r.n() * 0.15)]));
  // alpha strength grows towards the back of the head; a shared slow drift appears everywhere
  const sig = name => { const [, y] = E1020[name]; const w = Math.max(0, (0.5 - y)) * 1.1; return t.map((_, i) => w * alpha[i] + 0.6 * slow[i] + noise[name][i]); };
  const sigs = Object.fromEntries(Object.keys(E1020).map(k => [k, sig(k)]));
  const ears = t.map((_, i) => 0.6 * slow[i] + 0.08 * alpha[i]);
  const avg = t.map((_, i) => Object.values(sigs).reduce((s, v) => s + v[i], 0) / 19);
  const nodes = {};
  for (const [name, [x, y]] of Object.entries(E1020)) {
    const g = document.createElementNS(ns, 'g'); g.classList.add('electrode'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', name);
    g.innerHTML = `<circle cx="${x}" cy="${-y}" r="0.11"/><text x="${x}" y="${-y + 0.035}" text-anchor="middle">${name}</text>`;
    const pick = () => { sel = name; draw(); };
    g.addEventListener('click', pick); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    svg.appendChild(g); nodes[name] = g;
  }
  el.prepend(svg);
  segmented(ctl, { label: L({ ja: '参照', en: 'Reference' }), value: ref, options: [
    { value: 'Cz', label: L({ ja: '参照: Cz', en: 'Ref: Cz' }) }, { value: 'ears', label: L({ ja: '両耳朶', en: 'Linked ears' }) }, { value: 'avg', label: L({ ja: '平均参照', en: 'Average' }) }],
    onChange: v => { ref = v; draw(); } });
  function draw() {
    const p = palette();
    Object.entries(nodes).forEach(([k, g]) => g.classList.toggle('sel', k === sel || (ref === 'Cz' && k === 'Cz')));
    const refSig = ref === 'Cz' ? sigs.Cz : ref === 'ears' ? ears : avg;
    const y = sigs[sel].map((v, i) => v - refSig[i]);
    linePlot(cv, [{ x: t, y, color: p.a, width: 1.6 }], { ylim: [-2, 2], xlabel: 's', ylabel: `${sel} − ${ref === 'Cz' ? 'Cz' : ref === 'ears' ? 'A1A2' : 'AVG'}` });
    const lobe = LOBE[sel.startsWith('Fp') ? 'Fp' : sel[0]];
    const side = /z$/.test(sel) ? L({ ja: '正中', en: 'midline' }) : (+sel.replace(/\D/g, '') % 2 ? L({ ja: '左', en: 'left' }) : L({ ja: '右', en: 'right' }));
    const amp = (Math.max(...y) - Math.min(...y)) / 2;
    out.textContent = L({ ja: `${sel}：${lobe.ja}・${side}。振幅 ≈ ${amp.toFixed(2)}（参照で変わる）。`, en: `${sel}: ${lobe.en}, ${side}. Amplitude ≈ ${amp.toFixed(2)} (depends on the reference).` });
    if (sel === 'Cz' && ref === 'Cz') out.textContent += L({ ja: ' ※自分自身を参照にすると信号はゼロ。', en: ' Note: referencing a channel to itself gives zero.' });
  }
  const onResize = () => { cv.resize(); draw(); };
  addEventListener('resize', onResize); draw();
  return () => removeEventListener('resize', onResize);
}
