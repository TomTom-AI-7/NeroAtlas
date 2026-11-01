import { html } from '../dom.js';
import { RESOURCES, COURSES } from '../../content/index.js';
import { resourceItem } from './courses.js';

const DRIVE_STATUS = [
  { name: 'NeuroAtlas｜Coursera・edX厳選講座と論文研究への接続', st: 'full' },
  { name: 'NeuroAtlas｜追加研究教材・オンラインコース・論文執筆リソース集', st: 'full' },
  { name: 'NeuroAtlas｜10分×42日 ロードマップ', st: 'full' },
  { name: 'EEG_BCI_研究学習リソース.txt / Springer_研究学習資料リスト.txt', st: 'full' },
  { name: '06_MNE_CSP_演習コード.zip', st: 'inspected' },
  { name: '02_MNE_解析入門コード.zip', st: 'listed' },
  { name: '03_EEG_Signal_Processing_with_Python.pdf ほか PDF 5点', st: 'listed' },
];
const ST = {
  full: { ja: '内容を読み込み、カリキュラムに反映', en: 'Read and reflected in the curriculum' },
  inspected: { ja: '中身を確認（MNE 公式例・BSD-3）。公式URLへリンク', en: 'Inspected (official MNE example, BSD-3); linked to source' },
  listed: { ja: 'ファイル名のみ確認。本文は転載せずリンクのみ', en: 'Listed only; content not reproduced, linked' },
};

export function render(main, { t, L }) {
  let access = 'all', type = 'all', q = '';
  const accesses = ['all', ...new Set(RESOURCES.map(r => r.access))];
  const types = ['all', ...new Set(RESOURCES.map(r => r.type))];
  main.innerHTML = html`
    <h1>${t('library')}</h1>
    <section class="card notice"><h2 class="small-h">${t('copyrightTitle')}</h2><p class="small">${t('copyrightBody')}</p></section>
    <div class="filters">
      <input type="search" class="search" id="lib-q" placeholder="${t('search')}" aria-label="${t('search')}">
      <select id="lib-access" aria-label="access">${accesses.map(a => html`<option value="${a}">${a === 'all' ? t('all') : t('access_' + a)}</option>`)}</select>
      <select id="lib-type" aria-label="type">${types.map(a => html`<option value="${a}">${a === 'all' ? t('all') : t('type_' + a)}</option>`)}</select>
    </div>
    <ul class="res-list card" id="lib-list"></ul>
    <section class="card"><h2 class="small-h">${t('driveStatus')}</h2>
      <ul class="drive-status">${DRIVE_STATUS.map(d => html`<li><strong>${d.name}</strong><br><small class="muted">${L(ST[d.st])}</small></li>`)}</ul>
    </section>`;
  const list = main.querySelector('#lib-list');
  const draw = () => {
    const rs = RESOURCES.filter(r => (access === 'all' || r.access === access) && (type === 'all' || r.type === type) && (!q || (r.title + r.provider + L(r.note)).toLowerCase().includes(q)));
    list.innerHTML = rs.map(r => {
      const used = COURSES.filter(c => c.resources.includes(r.id));
      return resourceItem(r, t, L).toString().replace('</li>', `<p class="small">${t('usedIn')}: ${used.map(c => `<a href="#/course/${c.id}">${c.code}</a>`).join(', ') || '—'}</p></li>`);
    }).join('') || `<li class="muted">—</li>`;
  };
  main.querySelector('#lib-q').addEventListener('input', e => { q = e.target.value.toLowerCase(); draw(); });
  main.querySelector('#lib-access').addEventListener('change', e => { access = e.target.value; draw(); });
  main.querySelector('#lib-type').addEventListener('change', e => { type = e.target.value; draw(); });
  draw();
}
