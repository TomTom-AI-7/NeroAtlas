// Notes: notes / aha / questions / research tasks / paper draft, plus export and backup.
import { html, toast, esc } from '../dom.js';
import { COURSES, QUESTIONS, QUESTION_MAP } from '../../content/index.js';
import { DRAFT_SECTIONS } from '../store.js';
import { buildMarkdown, buildCsv, buildJson, buildProposal, questionLabel } from '../export.js';
import { showExport, confirmButton } from './exportpanel.js';

const TABS = ['note', 'aha', 'question', 'tasks', 'draft'];
let tab = 'note', query = '';

export function render(main, ctx, tabParam) {
  const { store, b, pick } = ctx;
  if (TABS.includes(tabParam)) tab = tabParam;
  const label = qid => esc(questionLabel(qid, COURSES, ctx.lang));
  const stamp = () => new Date().toISOString().slice(0, 10);

  main.innerHTML = html`
    <h1>${b('notes')}</h1>
    <nav class="tabs" role="tablist">${TABS.map(x => html`<button type="button" role="tab" class="tab" data-tab="${x}" aria-selected="${x === tab}">${b(x === 'note' ? 'note' : x)}</button>`)}</nav>
    <div id="panel"></div>
    <section class="card">
      <h2 class="small-h">${b('export')}</h2>
      <div class="btn-row">
        <button type="button" class="btn btn-small" data-exp="md">${b('exportMd')}</button>
        <button type="button" class="btn btn-small ghost" data-exp="proposal">${b('exportProposal')}</button>
        <button type="button" class="btn btn-small ghost" data-exp="csv">${b('exportCsv')}</button>
        <button type="button" class="btn btn-small ghost" data-exp="json">${b('exportJson')}</button>
      </div>
      <div id="export-panel" class="export-panel" hidden></div>
    </section>
    <details class="card">
      <summary><strong>${b('data')}</strong></summary>
      <p class="small muted">${b('dataNote')}</p>
      <label class="btn btn-small ghost file-btn">${b('restoreFile')}<input type="file" id="restore-file" accept="application/json,.json" hidden></label>
      <label class="field"><span>${b('restore')}</span><textarea id="restore-text" rows="3"></textarea></label>
      <div class="btn-row"><button type="button" class="btn btn-small ghost" id="restore-go">${b('restoreGo')}</button>
        <button type="button" class="btn btn-small danger" id="reset">${b('reset')}</button></div>
    </details>`;

  const panel = main.querySelector('#panel');
  main.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
    tab = btn.dataset.tab; main.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === btn))); draw();
  }));
  main.querySelectorAll('[data-exp]').forEach(btn => btn.addEventListener('click', () => {
    const s = store.state, k = btn.dataset.exp;
    const f = {
      md: [`neuroatlas-notebook-${stamp()}.md`, () => buildMarkdown(s, COURSES, ctx.lang), 'text/markdown;charset=utf-8'],
      proposal: [`neuroatlas-proposal-${stamp()}.md`, () => buildProposal(s), 'text/markdown;charset=utf-8'],
      csv: [`neuroatlas-notes-${stamp()}.csv`, () => buildCsv(s, COURSES, ctx.lang), 'text/csv;charset=utf-8'],
      json: [`neuroatlas-backup-${stamp()}.json`, () => buildJson(s), 'application/json'],
    }[k];
    showExport(main.querySelector('#export-panel'), { filename: f[0], content: f[1](), mime: f[2] });
  }));
  const restore = text => {
    try { const d = JSON.parse(text); if (d.app !== 'NeuroAtlas' && !d.scores) throw 0; store.importState(d); toast(pick('restored')); render(main, ctx); }
    catch { toast(pick('restoreFail')); }
  };
  main.querySelector('#restore-file').addEventListener('change', async e => { const f = e.target.files[0]; if (f) restore(await f.text()); });
  main.querySelector('#restore-go').addEventListener('click', () => restore(main.querySelector('#restore-text').value));
  confirmButton(main.querySelector('#reset'), 'confirmReset', () => { store.reset(); render(main, ctx); });

  function draw() {
    if (tab === 'draft') return drawDraft();
    if (tab === 'tasks') return drawTasks();
    drawEntries();
  }

  function drawEntries() {
    panel.innerHTML = html`<div class="card">
        <textarea id="new-entry" rows="3" data-i18n-aria="${tab}" aria-label="${pick(tab)}"></textarea>
        <button type="button" class="btn btn-small" id="add-entry">${b('add')}</button></div>
      <input type="search" id="q" class="search" data-i18n-ph="search" placeholder="${pick('search')}" aria-label="${pick('search')}" value="${query}">
      <ul class="entries" id="list"></ul>`.toString();
    const list = panel.querySelector('#list');
    const drawList = () => {
      const es = store.state.entries.filter(e => e.type === tab && (!query || e.text.toLowerCase().includes(query.toLowerCase())));
      if (!es.length) { list.innerHTML = `<li class="muted">${b('empty')}</li>`; return; }
      list.innerHTML = es.map(e => `<li class="entry" data-id="${esc(e.id)}">
        <div class="entry-meta"><small class="muted">${esc(e.at.slice(0, 10))}${e.qid && QUESTION_MAP[e.qid] ? ` · <button type="button" class="link-btn inline" data-open="${esc(e.qid)}">${label(e.qid)}</button>` : ''}</small>
          <span class="entry-actions">${tab === 'question' ? `<label class="small"><input type="checkbox" data-act="resolve" ${e.resolved ? 'checked' : ''}> ${b('resolved')}</label>` : ''}
          <button type="button" class="link-btn" data-del>${b('delete')}</button></span></div>
        <div class="entry-text ${e.resolved ? 'resolved' : ''}" contenteditable="plaintext-only" data-act="edit">${esc(e.text)}</div></li>`).join('');
      list.querySelectorAll('[data-del]').forEach(btn => confirmButton(btn, 'confirmDelete', () => { store.deleteEntry(btn.closest('.entry').dataset.id); drawList(); }));
      list.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => ctx.start([btn.dataset.open])));
    };
    drawList();
    panel.querySelector('#add-entry').addEventListener('click', () => { const ta = panel.querySelector('#new-entry'); if (store.addEntry(tab, ta.value)) { ta.value = ''; drawList(); toast(pick('saved')); } });
    panel.querySelector('#q').addEventListener('input', e => { query = e.target.value; drawList(); });
    list.addEventListener('change', e => { const li = e.target.closest('.entry'); if (li && e.target.dataset.act === 'resolve') { store.updateEntry(li.dataset.id, { resolved: e.target.checked }); drawList(); } });
    list.addEventListener('focusout', e => { const li = e.target.closest('.entry'); if (li && e.target.dataset.act === 'edit') store.updateEntry(li.dataset.id, { text: e.target.innerText.trim() }); });
  }

  function drawTasks() {
    const items = QUESTIONS.filter(q => q.type === 'task' && store.state.tasks[q.id]);
    panel.innerHTML = items.length ? items.map(q => { const t = store.state.tasks[q.id]; return `<section class="card">
      <div class="row-between"><strong>${label(q.id)}</strong><span class="badge ${t.done ? 'ok' : ''}">${b(t.done ? 'done' : 'pending')}</span></div>
      <p class="small muted">${b(q.task)}</p>
      ${t.text.trim() ? `<pre class="practice-out">${esc(t.text)}</pre>` : ''}
      <button type="button" class="btn btn-small ghost" data-open="${esc(q.id)}">${b(t.done ? 'read' : 'researchTask')} →</button></section>`; }).join('')
      : `<p class="empty">${b('emptyTasks')}</p>`;
    panel.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => ctx.start([btn.dataset.open])));
  }

  function drawDraft() {
    const d = store.state.draft;
    const names = { title: 'Title', abstract: 'Abstract', introduction: 'Introduction', methods: 'Methods', results: 'Results', discussion: 'Discussion', references: 'References' };
    panel.innerHTML = html`<p class="muted small">${b('draftHint')}</p>
      ${DRAFT_SECTIONS.map(s => html`<label class="field draft-field"><span>${names[s]} <small class="muted tabnum" data-wc="${s}"></small></span>
        <textarea data-sec="${s}" rows="${s === 'title' ? 2 : 7}">${d[s]}</textarea></label>`)}`.toString();
    const wc = (s, v) => { panel.querySelector(`[data-wc="${s}"]`).textContent = `(${(v.replace(/<!-- [^>]* -->/g, '').match(/[A-Za-z0-9’'-]+/g) || []).length} ${pick('words')})`; };
    panel.querySelectorAll('textarea[data-sec]').forEach(ta => {
      wc(ta.dataset.sec, ta.value);
      let timer = 0;
      ta.addEventListener('input', () => { wc(ta.dataset.sec, ta.value); clearTimeout(timer); timer = setTimeout(() => store.setDraft(ta.dataset.sec, ta.value), 400); });
      ta.addEventListener('blur', () => store.setDraft(ta.dataset.sec, ta.value));
    });
  }

  draw();
}
