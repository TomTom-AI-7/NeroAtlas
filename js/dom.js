// Tiny HTML templating with automatic escaping. Interpolated values are escaped unless wrapped in raw().
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = s => new Raw(String(s));
const val = v => v instanceof Raw ? v.s : Array.isArray(v) ? v.map(val).join('') : (v === null || v === undefined || v === false) ? '' : esc(v);
export function html(strings, ...vals) { return raw(strings.reduce((a, s, i) => a + s + (i < vals.length ? val(vals[i]) : ''), '')); }

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let toastTimer = 0;
export function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = Object.assign(document.createElement('div'), { id: 'toast', role: 'status' }); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

export function progressBar(ratio, label = '') {
  const pct = Math.round(ratio * 100);
  return html`<div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${label}"><span style="width:${pct}%"></span></div>`;
}

export function ring(ratio, size = 44) {
  const r = 18, c = 2 * Math.PI * r, pct = Math.round(ratio * 100);
  return html`<svg class="ring" width="${size}" height="${size}" viewBox="0 0 44 44" role="img" aria-label="${pct}%"><circle cx="22" cy="22" r="${r}" class="ring-bg"/><circle cx="22" cy="22" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - ratio)}" transform="rotate(-90 22 22)"/><text x="22" y="26" text-anchor="middle">${pct}</text></svg>`;
}
