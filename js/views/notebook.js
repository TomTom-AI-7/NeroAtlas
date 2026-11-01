import { html, toast, esc } from '../dom.js';
import { LESSONS } from '../../content/index.js';
import { DRAFT_SECTIONS } from '../store.js';
import { buildMarkdown, buildCsv, buildJson, buildProposal } from '../export.js';
import { showExport, confirmButton } from './exportpanel.js';

const TABS = ['note', 'aha', 'question', 'practice', 'draft'];
const TAB_LABEL = { note: 'note', aha: 'aha', question: 'question', practice: 'stepPractice', draft: 'draft' };
let lastTab = 'note';

export function render(main, ctx, params) {
  const { store, t, L } = ctx;
  let tab = TABS.includes(params.tab) ? params.tab : lastTab;
  let query = '';
  const lessonLabel = key => { const x = LESSONS.find(l => l.key === key); return x ? `${x.course.code} · ${L(x.lesson.title)}` : ''; };
  const stamp = () => new Date().toISOString().slice(0, 10);

  main.innerHTML = html`
    <h1>${t('notebook')}</h1>
    <section class="card export-bar">
      <h2 class="small-h">${t('exportTitle')}</h2>
      <div class="btn-row">
        <button class="btn btn-small" data-exp="md">${t('exportMd')}</button>
        <button class="btn btn-small ghost" data-exp="csv">${t('exportCsv')}</button>
        <button class="btn btn-small ghost" data-exp="json">${t('exportJson')}</button>
        <button class="btn btn-small ghost" data-exp="proposal">${t('exportProposal')}</button>
      </div>
      <div id="export-panel" class="export-panel" hidden></div>
    </section>
    <nav class="tabs" role="tablist">${TABS.map(x => html`<button type="button" role="tab" class="tab" data-tab="${x}">${t(TAB_LABEL[x])}</button>`)}</nav>
    <div id="nb-panel"></div>`;

  main.querySelectorAll('[data-exp]').forEach(b => b.addEventListener('click', () => {
    const s = store.state;
    const kind = b.dataset.exp;
    const host = main.querySelector('#export-panel');
    const files = {
      md: [`neuroatlas-notebook-${stamp()}.md`, () => buildMarkdown(s, LESSONS, ctx.lang), 'text/markdown;charset=utf-8'],
      csv: [`neuroatlas-notes-${stamp()}.csv`, () => buildCsv(s, LESSONS, ctx.lang), 'text/csv;charset=utf-8'],
      json: [`neuroatlas-backup-${stamp()}.json`, () => buildJson(s), 'application/json'],
      proposal: [`neuroatlas-proposal-${stamp()}.md`, () => buildProposal(s), 'text/markdown;charset=utf-8'],
    };
    const [filename, build, mime] = files[kind];
    showExport(host, { filename, content: build(), mime }, t);
  }));
  const tabBtns = [...main.querySelectorAll('[data-tab]')];
  tabBtns.forEach(b => b.addEventListener('click', () => { tab = lastTab = b.dataset.tab; draw(); }));
  const panel = main.querySelector('#nb-panel');

  function draw() {
    tabBtns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    if (tab === 'draft') return drawDraft();
    if (tab === 'practice') return drawPractice();
    drawEntries();
  }

  function drawEntries() {
    panel.innerHTML = html`
      <div class="card">
        <textarea id="nb-new" rows="3" aria-label="${t(tab)}" placeholder="${t(tab)}…"></textarea>
        <button class="btn btn-small" id="nb-add">${t('add')}</button>
      </div>
      <input type="search" id="nb-search" class="search" placeholder="${t('search')}" aria-label="${t('search')}" value="${query}">
      <ul class="entries" id="nb-list"></ul>`.toString();
    const list = panel.querySelector('#nb-list');
    const wireDelete = () => list.querySelectorAll('[data-act=del]').forEach(b => confirmButton(b, t('confirmDelete'), () => { store.deleteEntry(b.closest('.entry').dataset.id); drawList(); }));
    const drawList = () => {
      const es = store.state.entries.filter(e => e.type === tab && (!query || e.text.toLowerCase().includes(query.toLowerCase())));
      if (!es.length) { list.innerHTML = `<li class="muted">${esc(t('emptyEntries'))}</li>`; return; }
      list.innerHTML = es.map(e => `<li class="entry" data-id="${esc(e.id)}">
        <div class="entry-meta"><small class="muted">${esc(e.at.slice(0, 10))}${e.key ? ' · <a href="#/lesson/' + esc(e.key) + '">' + esc(lessonLabel(e.key)) + '</a>' : ''}</small>
          <span class="entry-actions">${tab === 'question' ? `<label class="small"><input type="checkbox" data-act="resolve" ${e.resolved ? 'checked' : ''}> ${esc(t('resolved'))}</label>` : ''}
          <button class="link-btn" data-act="del" aria-label="${esc(t('delete'))}">${esc(t('delete'))}</button></span></div>
        <div class="entry-text ${e.resolved ? 'resolved' : ''}" contenteditable="plaintext-only" data-act="edit">${esc(e.text)}</div></li>`).join('');
      wireDelete();
    };
    drawList();
    panel.querySelector('#nb-add').addEventListener('click', () => { const ta = panel.querySelector('#nb-new'); if (store.addEntry(tab, ta.value)) { ta.value = ''; drawList(); toast(t('saved')); } });
    panel.querySelector('#nb-search').addEventListener('input', e => { query = e.target.value; drawList(); });
    list.addEventListener('change', e => { const li = e.target.closest('.entry'); if (li && e.target.dataset.act === 'resolve') { store.updateEntry(li.dataset.id, { resolved: e.target.checked }); drawList(); } });
    list.addEventListener('focusout', e => { const li = e.target.closest('.entry'); if (li && e.target.dataset.act === 'edit') store.updateEntry(li.dataset.id, { text: e.target.innerText.trim() }); });
  }

  function drawPractice() {
    const items = LESSONS.filter(x => (store.state.progress[x.key]?.practice || '').trim());
    panel.innerHTML = items.length ? items.map(x => `<section class="card"><h3><a href="#/lesson/${esc(x.course.id)}/${esc(x.lesson.id)}?step=practice">${esc(lessonLabel(x.key))}</a></h3><pre class="practice-out">${esc(store.state.progress[x.key].practice)}</pre></section>`).join('')
      : `<p class="muted">${esc(t('emptyEntries'))}</p>`;
  }

  function drawDraft() {
    const d = store.state.draft;
    const labels = { title: 'Title', abstract: 'Abstract', introduction: 'Introduction', methods: 'Methods', results: 'Results', discussion: 'Discussion', references: 'References' };
    panel.innerHTML = html`<p class="muted small">${t('draftHint')}</p>
      ${DRAFT_SECTIONS.map(s => html`<label class="field draft-field"><span>${labels[s]} <small class="muted" data-wc="${s}"></small></span>
        <textarea data-sec="${s}" rows="${s === 'title' ? 2 : 7}" lang="en">${d[s]}</textarea></label>`)}`.toString();
    const wc = (s, v) => { const el = panel.querySelector(`[data-wc="${s}"]`); if (el) el.textContent = `(${(v.replace(/<!-- [^>]* -->/g, '').match(/[A-Za-z0-9’'-]+/g) || []).length} ${t('words')})`; };
    panel.querySelectorAll('textarea[data-sec]').forEach(ta => {
      wc(ta.dataset.sec, ta.value);
      let timer = 0;
      ta.addEventListener('input', () => { wc(ta.dataset.sec, ta.value); clearTimeout(timer); timer = setTimeout(() => store.setDraft(ta.dataset.sec, ta.value), 400); });
      ta.addEventListener('blur', () => store.setDraft(ta.dataset.sec, ta.value));
    });
  }

  draw();
}
