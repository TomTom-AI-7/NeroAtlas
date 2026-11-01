import { makeCanvas, linePlot, barPlot, palette, slider, toggle, controls, readout, rng, normCdf, pearson, mean, sd } from './plot.js';

const onResize = (cvs, draw) => { const f = () => { cvs.forEach(c => c.resize()); draw(); }; addEventListener('resize', f); return () => removeEventListener('resize', f); };
const button = (parent, label, onClick) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-small'; b.textContent = label; b.addEventListener('click', onClick); parent.appendChild(b); return b; };

// ---------- two distributions / effect size ----------
export function distribution(el, props = {}, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 180, L({ ja: '2群の分布', en: 'Two distributions' }));
  const out = readout(el);
  const st = props.preset === 'biomarker' ? { diff: 0.3, sd: 1, n: 200 } : { diff: 1, sd: 1, n: 30 };
  const xs = Array.from({ length: 241 }, (_, i) => -5 + i * 0.05);
  const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  function draw() {
    const p = palette();
    const m1 = -st.diff / 2, m2 = st.diff / 2;
    linePlot(cv, [{ x: xs, y: xs.map(x => pdf(x, m1, st.sd)), color: p.a, width: 2 }, { x: xs, y: xs.map(x => pdf(x, m2, st.sd)), color: p.b, width: 2 }],
      { xlim: [-5, 5], ylim: [0, 0.85], xlabel: L({ ja: '特徴量', en: 'feature' }) });
    const d = st.diff / st.sd, ovl = 2 * normCdf(-Math.abs(d) / 2), acc = normCdf(Math.abs(d) / 2);
    const z = d / Math.sqrt(2 / st.n), pval = 2 * (1 - normCdf(Math.abs(z)));
    out.textContent = L({ ja: `効果量 d = ${d.toFixed(2)}、分布の重なり ${(ovl * 100).toFixed(0)}%、最良の閾値でも個人の正答率 ${(acc * 100).toFixed(0)}%。各群 n = ${st.n} なら p ≈ ${pval < 0.001 ? '< 0.001' : pval.toFixed(3)}。`,
      en: `Effect size d = ${d.toFixed(2)}, overlap ${(ovl * 100).toFixed(0)}%, best-threshold individual accuracy ${(acc * 100).toFixed(0)}%. With n = ${st.n} per group, p ≈ ${pval < 0.001 ? '< 0.001' : pval.toFixed(3)}.` });
  }
  slider(ctl, { label: L({ ja: '平均の差 ', en: 'Mean difference ' }), min: 0, max: 3, step: 0.1, value: st.diff, onInput: v => { st.diff = v; draw(); } });
  slider(ctl, { label: L({ ja: '標準偏差 SD ', en: 'Standard deviation ' }), min: 0.5, max: 2.5, step: 0.1, value: st.sd, onInput: v => { st.sd = v; draw(); } });
  slider(ctl, { label: L({ ja: '各群の人数 n ', en: 'n per group ' }), min: 10, max: 500, step: 10, value: st.n, onInput: v => { st.n = v; draw(); } });
  draw();
  return onResize([cv], draw);
}

// ---------- leakage: trial-wise vs subject-wise CV ----------
export function simulateLeakage({ fingerprint = 2, nSub = 20, nTrials = 20, nFeat = 6, k = 5, seed = 1 } = {}) {
  const r = rng(seed);
  const X = [], y = [], g = [];
  for (let s = 0; s < nSub; s++) {
    const fp = Array.from({ length: nFeat }, () => r.n() * fingerprint);
    const label = s < nSub / 2 ? 0 : 1; // diagnosis assigned per subject; features carry NO real group effect
    for (let t = 0; t < nTrials; t++) { X.push(fp.map(v => v + r.n())); y.push(label); g.push(s); }
  }
  const knnAcc = (trainIdx, testIdx) => {
    let correct = 0;
    for (const i of testIdx) {
      const d = trainIdx.map(j => { let s = 0; for (let f = 0; f < nFeat; f++) s += (X[i][f] - X[j][f]) ** 2; return [s, y[j]]; });
      d.sort((a, b) => a[0] - b[0]);
      const votes = d.slice(0, k).reduce((s, v) => s + v[1], 0);
      if ((votes > k / 2 ? 1 : 0) === y[i]) correct++;
    }
    return correct / testIdx.length;
  };
  const cv = folds => mean(folds.map(test => { const set = new Set(test); return knnAcc(X.map((_, i) => i).filter(i => !set.has(i)), test); }));
  // trial-wise: shuffle all trials into 5 folds
  const idx = X.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r.u() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const trialFolds = Array.from({ length: 5 }, (_, f) => idx.filter((_, i) => i % 5 === f));
  // subject-wise: balanced subjects per fold (one from each class per fold where possible)
  const subjFolds = Array.from({ length: 5 }, (_, f) => X.map((_, i) => i).filter(i => (g[i] % (nSub / 2)) % 5 === f));
  return { trial: cv(trialFolds), subject: cv(subjFolds) };
}
export function leakage(el, _p, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 190, L({ ja: '交差検証の精度', en: 'Cross-validated accuracy' }));
  const out = readout(el);
  const st = { fp: 2, seed: 1 };
  function draw() {
    const p = palette();
    const res = simulateLeakage({ fingerprint: st.fp, seed: st.seed });
    barPlot(cv, [{ label: L({ ja: '試行単位分割', en: 'Trial-wise split' }), value: res.trial, color: p.bad }, { label: L({ ja: '被験者単位分割', en: 'Subject-wise split' }), value: res.subject, color: p.ok }],
      { max: 1, pct: true, showValues: true, hlines: [{ y: 0.5, label: L({ ja: '真の精度（チャンス）50%', en: 'True accuracy (chance) 50%' }) }] });
    out.textContent = L({ ja: `20人×20試行、群差ゼロ。個人差の大きさ ${st.fp} のとき、試行単位分割は ${(res.trial * 100).toFixed(0)}%、被験者単位分割は ${(res.subject * 100).toFixed(0)}%。高精度の正体は「人の識別」。`,
      en: `20 people × 20 trials, zero group effect. With individual differences ${st.fp}, trial-wise = ${(res.trial * 100).toFixed(0)}%, subject-wise = ${(res.subject * 100).toFixed(0)}%. The “accuracy” comes from recognising people.` });
  }
  slider(ctl, { label: L({ ja: '個人差の大きさ ', en: 'Individual differences ' }), min: 0, max: 4, step: 0.25, value: st.fp, onInput: v => { st.fp = v; draw(); } });
  button(ctl, L({ ja: '別のデータで再試行', en: 'Resample data' }), () => { st.seed++; draw(); });
  draw();
  return onResize([cv], draw);
}

// ---------- class imbalance ----------
export function imbalance(el, _p, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 190, L({ ja: '評価指標の比較', en: 'Metric comparison' }));
  const out = readout(el);
  const st = { prev: 0.1, sens: 0.8, spec: 0.8 };
  function draw() {
    const p = palette();
    const acc = st.sens * st.prev + st.spec * (1 - st.prev), ba = (st.sens + st.spec) / 2;
    const ppv = st.sens * st.prev / (st.sens * st.prev + (1 - st.spec) * (1 - st.prev));
    barPlot(cv, [
      { label: 'accuracy', value: acc, color: p.a }, { label: 'balanced acc', value: ba, color: p.b },
      { label: 'PPV', value: ppv, color: p.c }, { label: L({ ja: '常に陰性', en: 'always “no”' }), value: 1 - st.prev, color: p.muted },
    ], { max: 1, pct: true, showValues: true });
    out.textContent = L({ ja: `有病率 ${(st.prev * 100).toFixed(0)}%：陽性と判定された人のうち本当に陽性なのは ${(ppv * 100).toFixed(0)}%。「常に陰性」と答えるだけで accuracy ${((1 - st.prev) * 100).toFixed(0)}%。`,
      en: `Prevalence ${(st.prev * 100).toFixed(0)}%: only ${(ppv * 100).toFixed(0)}% of positives are true positives. Always answering “no” scores ${((1 - st.prev) * 100).toFixed(0)}% accuracy.` });
  }
  const pct = v => Math.round(v * 100);
  slider(ctl, { label: L({ ja: '有病率 ', en: 'Prevalence ' }), min: 0.01, max: 0.5, step: 0.01, value: st.prev, format: pct, unit: '%', onInput: v => { st.prev = v; draw(); } });
  slider(ctl, { label: L({ ja: '感度 ', en: 'Sensitivity ' }), min: 0.5, max: 1, step: 0.01, value: st.sens, format: pct, unit: '%', onInput: v => { st.sens = v; draw(); } });
  slider(ctl, { label: L({ ja: '特異度 ', en: 'Specificity ' }), min: 0.5, max: 1, step: 0.01, value: st.spec, format: pct, unit: '%', onInput: v => { st.spec = v; draw(); } });
  draw();
  return onResize([cv], draw);
}

// ---------- confounding ----------
export function confound(el, props = {}, { L }) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 300 110'); svg.classList.add('viz-svg', 'dag');
  svg.innerHTML = `<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10z" class="dag-arrowhead"/></marker></defs>
    <g class="dag-node"><rect x="105" y="6" width="90" height="28" rx="8"/><text x="150" y="25" text-anchor="middle">${L({ ja: '睡眠不足', en: 'Sleep loss' })}</text></g>
    <g class="dag-node"><rect x="10" y="74" width="90" height="28" rx="8"/><text x="55" y="93" text-anchor="middle">EEG</text></g>
    <g class="dag-node"><rect x="200" y="74" width="90" height="28" rx="8"/><text x="245" y="93" text-anchor="middle">${L({ ja: '抑うつ症状', en: 'Symptoms' })}</text></g>
    <path d="M125,34 L72,72" class="dag-edge" marker-end="url(#arr)"/><path d="M175,34 L228,72" class="dag-edge" marker-end="url(#arr)"/>
    <path d="M102,88 L198,88" class="dag-edge dag-q" marker-end="url(#arr)"/><text x="150" y="82" text-anchor="middle" class="svg-label">?</text>`;
  el.appendChild(svg);
  const ctl = controls(el);
  const cv = makeCanvas(el, 200, L({ ja: '散布図', en: 'Scatter plot' }));
  const out = readout(el);
  const st = { a: 0.8, adjust: false };
  const r = rng(61), n = 250;
  const sleep = Array.from({ length: n }, () => r.n()), e1 = sleep.map(() => r.n()), e2 = sleep.map(() => r.n());
  const resid = (y, x) => { const b = pearson(y, x) * sd(y) / sd(x), my = mean(y), mx = mean(x); return y.map((v, i) => v - my - b * (x[i] - mx)); };
  function draw() {
    const p = palette();
    let eeg = sleep.map((s, i) => st.a * s + e1[i]), sym = sleep.map((s, i) => st.a * s + e2[i]);
    if (st.adjust) { eeg = resid(eeg, sleep); sym = resid(sym, sleep); }
    linePlot(cv, [{ x: eeg, y: sym, color: p.a, width: 0, dots: 2.2 }], { xlim: [-4.5, 4.5], ylim: [-4.5, 4.5], xlabel: 'EEG', ylabel: L({ ja: '症状', en: 'symptoms' }) });
    const rr = pearson(eeg, sym);
    out.textContent = L({ ja: `EEG と症状の直接の因果はゼロ（設定上）。交絡の強さ ${st.a} で相関 r = ${rr.toFixed(2)}${st.adjust ? '（睡眠で調整後）' : ''}。`,
      en: `There is no direct EEG → symptom effect (by construction). Confounding ${st.a} gives r = ${rr.toFixed(2)}${st.adjust ? ' (after adjusting for sleep)' : ''}.` });
  }
  slider(ctl, { label: L({ ja: '交絡の強さ ', en: 'Confounding strength ' }), min: 0, max: 1.5, step: 0.1, value: st.a, onInput: v => { st.a = v; draw(); } });
  if (props.adjustable) toggle(ctl, { label: L({ ja: '睡眠で調整する', en: 'Adjust for sleep' }), value: false, onChange: v => { st.adjust = v; draw(); } });
  draw();
  return onResize([cv], draw);
}

// ---------- confidence intervals ----------
export function ci(el, _p, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 260, L({ ja: '40回の標本の95%信頼区間', en: '95% CIs from 40 samples' }));
  const out = readout(el);
  const st = { n: 20, seed: 1 };
  function draw() {
    const p = palette(), { ctx, w, h } = cv, r = rng(st.seed);
    ctx.clearRect(0, 0, w, h);
    const K = 40, pad = 30, X = v => pad + (v + 1.5) / 3 * (w - 2 * pad);
    ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(0), 6); ctx.lineTo(X(0), h - 18); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = p.muted; ctx.font = '11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(L({ ja: '真値 μ = 0', en: 'true μ = 0' }), X(0), h - 4);
    let miss = 0;
    for (let k = 0; k < K; k++) {
      const xs = Array.from({ length: st.n }, () => r.n()); const m = mean(xs), se = sd(xs) / Math.sqrt(st.n);
      const lo = m - 1.96 * se, hi = m + 1.96 * se, bad = lo > 0 || hi < 0; if (bad) miss++;
      const y = 8 + k * (h - 30) / K;
      ctx.strokeStyle = bad ? p.bad : p.a; ctx.lineWidth = bad ? 2.2 : 1.5;
      ctx.beginPath(); ctx.moveTo(X(Math.max(lo, -1.5)), y); ctx.lineTo(X(Math.min(hi, 1.5)), y); ctx.stroke();
      ctx.fillStyle = bad ? p.bad : p.a; ctx.beginPath(); ctx.arc(X(m), y, 2.2, 0, 7); ctx.fill();
    }
    out.textContent = L({ ja: `n = ${st.n}：40区間のうち ${miss} 個が真値を外した（長期的には約5%）。n を増やすと区間は狭くなるが、外れる割合は変わらない。`,
      en: `n = ${st.n}: ${miss} of 40 intervals missed the true value (≈5% in the long run). Larger n narrows intervals; the miss rate stays the same.` });
  }
  slider(ctl, { label: L({ ja: '標本サイズ n ', en: 'Sample size n ' }), min: 5, max: 200, step: 5, value: st.n, onInput: v => { st.n = v; draw(); } });
  button(ctl, L({ ja: '取り直す', en: 'Resample' }), () => { st.seed++; draw(); });
  draw();
  return onResize([cv], draw);
}

// ---------- multiple comparisons ----------
export function multipleTest(m, seed) {
  const r = rng(seed); const ps = Array.from({ length: m }, () => r.u()); // null p-values are Uniform(0,1)
  const raw = ps.filter(p => p < 0.05).length;
  const bonf = ps.filter(p => p < 0.05 / m).length;
  const sorted = [...ps].sort((a, b) => a - b); let kmax = 0; sorted.forEach((p, i) => { if (p <= (i + 1) / m * 0.05) kmax = i + 1; });
  return { raw, bonf, fdr: kmax };
}
export function multiple(el, _p, { L }) {
  const ctl = controls(el);
  const cv = makeCanvas(el, 190, L({ ja: '偽陽性の数', en: 'False positives' }));
  const out = readout(el);
  const st = { m: 64, seed: 1 };
  function draw() {
    const p = palette();
    const one = multipleTest(st.m, st.seed);
    let fw = { raw: 0, bonf: 0, fdr: 0 };
    for (let s = 0; s < 300; s++) { const x = multipleTest(st.m, 1000 + s); fw.raw += x.raw > 0; fw.bonf += x.bonf > 0; fw.fdr += x.fdr > 0; }
    barPlot(cv, [{ label: L({ ja: '補正なし', en: 'uncorrected' }), value: one.raw, color: p.bad }, { label: 'Bonferroni', value: one.bonf, color: p.ok }, { label: 'FDR (BH)', value: one.fdr, color: p.b }],
      { max: Math.max(4, Math.ceil(st.m * 0.05 * 1.8)), showValues: true });
    out.textContent = L({ ja: `効果ゼロの特徴量 ${st.m} 個を検定。補正なしで ${one.raw} 個が「有意」（期待値 ${(st.m * 0.05).toFixed(1)}）。1つ以上の偽陽性が出る確率：補正なし ${(fw.raw / 3).toFixed(0)}%、Bonferroni ${(fw.bonf / 3).toFixed(0)}%、FDR ${(fw.fdr / 3).toFixed(0)}%。`,
      en: `${st.m} null features tested. Uncorrected: ${one.raw} “significant” (expected ${(st.m * 0.05).toFixed(1)}). Probability of ≥1 false positive: uncorrected ${(fw.raw / 3).toFixed(0)}%, Bonferroni ${(fw.bonf / 3).toFixed(0)}%, FDR ${(fw.fdr / 3).toFixed(0)}%.` });
  }
  slider(ctl, { label: L({ ja: '検定する特徴量の数 ', en: 'Number of tests ' }), min: 5, max: 320, step: 5, value: st.m, onInput: v => { st.m = v; draw(); } });
  button(ctl, L({ ja: '別のデータで再試行', en: 'Resample data' }), () => { st.seed++; draw(); });
  draw();
  return onResize([cv], draw);
}
