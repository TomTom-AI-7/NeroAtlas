import { html, toast } from '../dom.js';
import { download } from '../export.js';

/** Show export content in-page with Copy and Download. Works where file downloads are blocked (embedded viewers). */
export function showExport(host, { filename, content, mime }, t) {
  host.hidden = false;
  host.innerHTML = html`<div class="row-between"><strong>${filename}</strong><button type="button" class="link-btn" data-x aria-label="${t('close')}">✕</button></div>
    <textarea readonly rows="10" class="code" id="export-text" aria-label="${filename}"></textarea>
    <div class="btn-row"><button type="button" class="btn btn-small" data-copy>${t('copy')}</button>
      <button type="button" class="btn btn-small ghost" data-dl>${t('downloadFile')}</button></div>
    <p class="muted small">${t('exportHint')}</p>`.toString();
  const ta = host.querySelector('textarea');
  ta.value = content.replace(/^﻿/, '');
  host.querySelector('[data-x]').addEventListener('click', () => { host.hidden = true; host.innerHTML = ''; });
  host.querySelector('[data-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(ta.value); toast(t('copied')); }
    catch { ta.focus(); ta.select(); toast(t('selectToCopy')); }
  });
  host.querySelector('[data-dl]').addEventListener('click', () => download(filename, content, mime));
  host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/** Two-step confirmation inside the button itself (browser confirm dialogs are unavailable in some viewers). */
export function confirmButton(btn, confirmLabel, onConfirm) {
  const original = btn.textContent;
  let armed = false, timer = 0;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (!armed) { armed = true; btn.textContent = confirmLabel; btn.classList.add('armed'); timer = setTimeout(() => { armed = false; btn.textContent = original; btn.classList.remove('armed'); }, 4000); return; }
    clearTimeout(timer); onConfirm();
  });
}
