// Safe arithmetic for calculation answers: numbers, + - × ÷ * / ^ ( ), %, commas as thousands
// separators, and ln, log (base 10), sqrt, exp, pi, e. No eval().

const FUNCS = { ln: Math.log, log: Math.log10, sqrt: Math.sqrt, exp: Math.exp, abs: Math.abs };
const CONSTS = { pi: Math.PI, e: Math.E };

export function normalize(raw) {
  return String(raw ?? '')
    .replace(/[０-９．（）＋－×÷＊／]/g, c => '0123456789.()+-*/*/'['０１２３４５６７８９．（）＋－×÷＊／'.indexOf(c)] || c)
    .replace(/[×＊]/g, '*').replace(/[÷／]/g, '/').replace(/[−–—]/g, '-').replace(/√/g, 'sqrt')
    .replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/\s+/g, '').toLowerCase();
}

/** Evaluate an expression; returns NaN when it cannot be parsed. */
export function evaluate(raw) {
  const s = normalize(raw);
  if (!s) return NaN;
  let i = 0;
  const peek = () => s[i];
  const eat = c => (s[i] === c ? (i++, true) : false);
  function expr() { let v = term(); for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; } }
  function term() { let v = power(); for (;;) { if (eat('*')) v *= power(); else if (eat('/')) v /= power(); else return v; } }
  function power() { const base = unary(); return eat('^') ? base ** power() : base; }
  function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return postfix(); }
  function postfix() { let v = atom(); while (eat('%')) v /= 100; return v; }
  function atom() {
    if (eat('(')) { const v = expr(); if (!eat(')')) throw 0; return v; }
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(i));
    if (num) { i += num[0].length; return parseFloat(num[0]); }
    const word = /^[a-z]+/.exec(s.slice(i));
    if (word) {
      i += word[0].length;
      if (word[0] in FUNCS) { const sqrtNoParen = peek() !== '('; const v = sqrtNoParen ? atom() : (eat('('), (() => { const x = expr(); if (!eat(')')) throw 0; return x; })()); return FUNCS[word[0]](v); }
      if (word[0] in CONSTS) return CONSTS[word[0]];
    }
    throw 0;
  }
  try { const v = expr(); return i === s.length ? v : NaN; } catch { return NaN; }
}

/** True when the input is more than a plain number (so the screen shows "= value"). */
export const isExpression = raw => /[+*/^()a-z%√×÷−]|\d\s*-/.test(normalize(raw).replace(/^-/, ''));

/** Compare an answer. For percent questions, 0.321 and 32.1 are both accepted. */
export function isCorrect(raw, answer, tolerance = 0, percent = false) {
  const v = evaluate(raw);
  if (!Number.isFinite(v)) return false;
  const tol = Math.max(tolerance, Math.abs(answer) * 1e-9);
  if (Math.abs(v - answer) <= tol) return true;
  return percent && Math.abs(v * 100 - answer) <= tol;
}

export function format(v) {
  if (!Number.isFinite(v)) return '';
  const a = Math.abs(v);
  if (a !== 0 && (a < 0.001 || a >= 1e7)) return v.toPrecision(4);
  return (Math.round(v * 1e6) / 1e6).toLocaleString('en-US', { maximumFractionDigits: 6 });
}
