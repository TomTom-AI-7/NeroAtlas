import { html, toast } from '../dom.js';
import { b, pick } from '../i18n.js';
import { download } from '../export.js';

/** Show export text in the page with Copy and Save. Works where file downloads are blocked (embedded viewers). */
export function showExport(host, { filename, content, mime }) {
  host.hidden = false;
  host.innerHTML = html`<div class="row-between"><strong>${filename}</strong><button type="button" class="link-btn" data-x data-i18n-aria="close" aria-label="${pick('close')}">✕</button></div>
    <textarea readonly rows="10" class="code" aria-label="${filename}"></textarea>
    <div class="btn-row"><button type="button" class="btn btn-small" data-copy>${b('copy')}</button>
      <button type="button" class="btn btn-small ghost" data-dl>${b('downloadFile')}</button></div>
    <p class="muted small">${b('exportHint')}</p>`.toString();
  const ta = host.querySelector('textarea');
  ta.value = content.replace(/^﻿/, '');
  host.querySelector('[data-x]').addEventListener('click', () => { host.hidden = true; host.innerHTML = ''; });
  host.querySelector('[data-copy]').addEventListener('click', () => copyText(ta.value, ta));
  host.querySelector('[data-dl]').addEventListener('click', () => download(filename, content, mime));
  host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

export async function copyText(text, selectable) {
  try { await navigator.clipboard.writeText(text); toast(pick('copied')); }
  catch { if (selectable) { selectable.focus(); selectable.select(); } toast(pick('selectToCopy')); }
}

/** Two-step confirmation inside the button itself (browser confirm dialogs are unavailable in some viewers). */
export function confirmButton(btn, confirmKey, onConfirm) {
  const original = btn.innerHTML;
  let armed = false, timer = 0;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (!armed) {
      armed = true; btn.innerHTML = b(confirmKey).toString(); btn.classList.add('armed');
      timer = setTimeout(() => { armed = false; btn.innerHTML = original; btn.classList.remove('armed'); }, 4000);
      return;
    }
    clearTimeout(timer); onConfirm();
  });
}
