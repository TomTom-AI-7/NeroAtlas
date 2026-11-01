import { html, toast } from '../dom.js';
import { buildJson, download } from '../export.js';

export function render(main, { store, t, setLang, setTheme, rerender }) {
  const s = store.state;
  main.innerHTML = html`
    <h1>${t('settings')}</h1>
    <section class="card">
      <h2 class="small-h">${t('language')}</h2>
      <div class="seg" role="group" aria-label="${t('language')}">
        <button type="button" data-lang="ja" aria-pressed="${(s.lang || 'ja') === 'ja'}">日本語</button>
        <button type="button" data-lang="en" aria-pressed="${s.lang === 'en'}">English</button>
      </div>
      <h2 class="small-h">${t('theme')}</h2>
      <div class="seg" role="group" aria-label="${t('theme')}">
        ${['auto', 'light', 'dark'].map(v => html`<button type="button" data-theme-v="${v}" aria-pressed="${s.theme === v}">${t('theme' + v[0].toUpperCase() + v.slice(1))}</button>`)}
      </div>
    </section>
    <section class="card">
      <h2 class="small-h">${t('exportTitle')}</h2>
      <p class="small muted">${t('dataNote')}</p>
      <div class="btn-row">
        <button class="btn btn-small" id="backup">${t('exportJson')}</button>
        <label class="btn btn-small ghost file-btn">${t('importJson')}<input type="file" id="import" accept="application/json,.json" hidden></label>
      </div>
    </section>
    <section class="card">
      <button class="btn danger" id="reset">${t('reset')}</button>
    </section>
    <section class="card notice"><h2 class="small-h">${t('copyrightTitle')}</h2><p class="small">${t('copyrightBody')}</p>
      <p class="small muted">NeuroAtlas — MIT License (code). Course text © NeuroAtlas authors, CC BY 4.0.</p></section>`;

  main.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { setLang(b.dataset.lang); rerender(); }));
  main.querySelectorAll('[data-theme-v]').forEach(b => b.addEventListener('click', () => { setTheme(b.dataset.themeV); rerender(); }));
  main.querySelector('#backup').addEventListener('click', () => download(`neuroatlas-backup-${new Date().toISOString().slice(0, 10)}.json`, buildJson(store.state), 'application/json'));
  main.querySelector('#import').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const data = JSON.parse(await f.text()); if (data.app !== 'NeuroAtlas' && !data.progress) throw new Error('bad'); store.importState(data); toast(t('importDone')); rerender(); }
    catch { toast(t('importFail')); }
  });
  main.querySelector('#reset').addEventListener('click', () => { if (confirm(t('resetConfirm'))) { store.reset(); rerender(); } });
}
