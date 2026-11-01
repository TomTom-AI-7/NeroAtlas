import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulateLeakage, multipleTest } from '../js/widgets/stats.js';
import { fft, ifft, spectrum, welch, fftBandpass, rng } from '../js/widgets/plot.js';

test('leakage demo: trial-wise split inflates accuracy; subject-wise stays near chance', () => {
  let trial = 0, subj = 0;
  for (let seed = 1; seed <= 5; seed++) { const r = simulateLeakage({ fingerprint: 2, seed }); trial += r.trial / 5; subj += r.subject / 5; }
  assert.ok(trial > 0.85, `trial-wise ${trial}`);
  assert.ok(subj > 0.25 && subj < 0.75, `subject-wise ${subj}`);
});

test('multiple comparisons: corrections reduce false positives', () => {
  let raw = 0, bonf = 0, fdr = 0;
  for (let s = 0; s < 200; s++) { const r = multipleTest(100, s); raw += r.raw; bonf += r.bonf; fdr += r.fdr; }
  assert.ok(Math.abs(raw / 200 - 5) < 1, `raw mean ${raw / 200}`);
  assert.ok(bonf / 200 < 0.2 && fdr / 200 < 0.3);
});

test('FFT round-trips and finds a 10 Hz peak', () => {
  const n = 512, fs = 128, r = rng(1);
  const x = Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * 10 * i / fs) + 0.1 * r.n());
  const re = Float64Array.from(x), im = new Float64Array(n); fft(re, im); ifft(re, im);
  assert.ok(x.every((v, i) => Math.abs(v - re[i]) < 1e-9));
  const { f, amp } = spectrum(x, fs); assert.equal(f[amp.indexOf(Math.max(...amp))], 10);
  const W = welch(x, fs, 128); assert.equal(W.f[W.psd.indexOf(Math.max(...W.psd))], 10);
  const y = fftBandpass(x, fs, 20, 40); assert.ok(Math.max(...y.map(Math.abs)) < 0.3, 'band-pass removes 10 Hz');
});
