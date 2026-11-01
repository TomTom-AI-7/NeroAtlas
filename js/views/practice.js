// Practice: concept card (figure first) → question → answer & explanation → next.
// The concept card opens automatically the first time you meet a unit and stays folded afterwards.
import { html, esc, toast } from '../dom.js';
import { COURSE_MAP, UNIT_MAP, QUESTION_MAP, QUESTIONS, COURSES } from '../../content/index.js';
import { unitSeen, nextUp, dueQuestions } from '../store.js';
import { mountWidget } from '../widgets/index.js';
import { runPython } from '../pyrunner.js';
import { copyText } from './exportpanel.js';

const DRAFT_NAME = { abstract: 'Abstract', introduction: 'Introduction', methods: 'Methods', results: 'Results', discussion: 'Discussion' };

export function render(main, ctx) {
  const { store, b, pick } = ctx;
  const ses = ctx.session;
  let cleanupFig = () => {};

  if (ses.index >= ses.ids.length) return complete();

  const q = QUESTION_MAP[ses.ids[ses.index]];
  const unit = UNIT_MAP[q.unit];
  const course = COURSE_MAP[q.course];
  const last = ses.index + 1 >= ses.ids.length;
  const open = !unitSeen(QUESTIONS, store.state, q);
  const starred = !!store.state.bookmarks[q.id];

  main.innerHTML = html`
    <a class="back" href="#/">← ${b('backToLearning')}</a>
    <div class="practice">
      <div class="row-between">
        <span class="eyebrow">${q.type === 'task' ? b('researchTask') : b('knowledgeCheck')}</span>
        ${ses.ids.length > 1 ? html`<small class="muted tabnum">${ses.index + 1} / ${ses.ids.length}</small>` : ''}
      </div>
      ${ses.ids.length > 1 ? html`<span class="pbar"><span style="width:${(ses.index / ses.ids.length) * 100}%"></span></span>` : ''}
      <div class="row-between">
        <a class="muted small" href="#/course/${course.id}"><span class="chip" style="--c:${course.color}">${course.code}</span> ${b(course.title)}</a>
        <button type="button" class="star" id="star" aria-pressed="${starred}" data-i18n-aria="saveQuestion" aria-label="${pick('saveQuestion')}">${starred ? '★' : '☆'}</button>
      </div>

      <section class="teach ${open ? 'open' : ''}" id="teach">
        <div class="row-between">
          <span class="eyebrow">${b('concept')}</span>
          <button type="button" class="text-btn" id="teach-toggle" aria-expanded="${open}"><span class="when-open">${b('hide')}</span><span class="when-closed">${b('read')}</span></button>
        </div>
        <h2>${b(unit.title)}</h2>
        <div class="teach-body">
          ${unit.figure ? html`<figure class="teach-figure"><div class="viz" id="fig"></div>${unit.figure.caption ? html`<figcaption class="muted small">${b(unit.figure.caption)}</figcaption>` : ''}</figure>` : ''}
          <p class="teach-lead">${b(unit.lead)}</p>
          ${unit.points.length ? html`<ul class="teach-points">${unit.points.map(p => html`<li>${b(p)}</li>`)}</ul>` : ''}
          ${unit.keywords.length ? html`<p class="kw">${unit.keywords.map(k => html`<span class="tag">${k}</span>`)}</p>` : ''}
        </div>
      </section>

      ${q.type === 'task' ? taskHtml() : choiceHtml()}
      <div id="feedback" aria-live="polite"></div>

      <details class="memo" id="memo">
        <summary>${b('memoTitle')}</summary>
        <div class="seg" role="radiogroup">
          ${['note', 'aha', 'question'].map((ty, i) => html`<button type="button" role="radio" class="etype-btn ${ty}" data-type="${ty}" aria-checked="${i === 0}">${b(ty)}</button>`)}
        </div>
        <textarea id="memo-text" rows="3" data-i18n-aria="memoTitle" aria-label="${pick('memoTitle')}"></textarea>
        <button type="button" class="btn btn-small" id="memo-save">${b('add')}</button>
        <ul class="entries compact" id="memo-list"></ul>
      </details>
    </div>`;

  // ---- concept card ----
  const teach = main.querySelector('#teach');
  let figMounted = false;
  const mountFig = () => { if (unit.figure && !figMounted) { figMounted = true; cleanupFig = mountWidget(unit.figure.widget, main.querySelector('#fig'), unit.figure.props, ctx); } };
  if (open) mountFig();
  main.querySelector('#teach-toggle').addEventListener('click', e => {
    const now = !teach.classList.contains('open');
    teach.classList.toggle('open', now); e.currentTarget.setAttribute('aria-expanded', String(now));
    if (now) mountFig();
  });

  main.querySelector('#star').addEventListener('click', e => {
    const on = store.toggleBookmark(q.id);
    e.currentTarget.textContent = on ? '★' : '☆'; e.currentTarget.setAttribute('aria-pressed', String(on));
  });

  // ---- memo ----
  let memoType = 'note';
  const memoList = main.querySelector('#memo-list');
  const drawMemos = () => { memoList.innerHTML = store.state.entries.filter(e => e.qid === q.id).map(e => `<li><span class="etype ${e.type}">${b(e.type)}</span> ${esc(e.text)}</li>`).join(''); };
  drawMemos();
  main.querySelectorAll('.etype-btn').forEach(btn => btn.addEventListener('click', () => {
    memoType = btn.dataset.type; main.querySelectorAll('.etype-btn').forEach(x => x.setAttribute('aria-checked', String(x === btn)));
  }));
  main.querySelector('#memo-save').addEventListener('click', () => {
    const ta = main.querySelector('#memo-text');
    if (store.addEntry(memoType, ta.value, q.id)) { ta.value = ''; drawMemos(); toast(pick('saved')); }
  });

  const fb = main.querySelector('#feedback');
  if (q.type === 'task') wireTask(); else wireChoice();
  return () => cleanupFig();

  // ---------- choice ----------
  function choiceHtml() {
    return html`<h1 class="question">${b(q.q)}</h1>
      <div class="options" id="options">${q.options.map((o, i) => html`<button type="button" class="opt" data-i="${i}"><span class="opt-key">${String.fromCharCode(65 + i)}</span><span>${b(o)}</span></button>`)}</div>`;
  }
  function wireChoice() {
    const opts = [...main.querySelectorAll('.opt')];
    opts.forEach(btn => btn.addEventListener('click', () => {
      const pickIdx = +btn.dataset.i, ok = pickIdx === q.answer;
      store.record(q.id, ok);
      if (ok) ses.correct++;
      opts.forEach((x, i) => { x.disabled = true; x.classList.toggle('is-answer', i === q.answer); x.classList.toggle('is-wrong', i === pickIdx && !ok); });
      fb.innerHTML = html`<section class="feedback ${ok ? 'good' : 'retry'}">
        <h2>${ok ? b('correct') : b('retry')}</h2>
        ${ok ? '' : html`<p><strong>${b('answerIs')}${b(q.options[q.answer])}</strong></p>`}
        <p>${b(q.explain)}</p>
        ${ok ? '' : html`<small class="muted">${b('addedToReview')}</small>`}
        ${nextButtons()}</section>`.toString();
      wireNext();
      fb.querySelector('.btn')?.focus({ preventScroll: true });
      fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
  }

  // ---------- research task ----------
  function taskHtml() {
    const saved = store.state.tasks[q.id]?.text;
    return html`<h1 class="question">${b(q.task)}</h1>
      ${q.code ? html`<div class="code-wrap">
        <textarea class="code" id="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python" rows="${Math.min(18, q.code.split('\n').length + 1)}">${q.code}</textarea>
        <div class="btn-row"><button type="button" class="btn btn-small ghost" id="copy-code">${b('copy')}</button>
          ${q.packages ? html`<button type="button" class="btn btn-small ghost" id="run-code">▶ ${b('runInBrowser')}</button>` : html`<span class="muted small">${b('localOnly')}</span>`}</div>
        <pre class="code-out" id="code-out" hidden></pre></div>` : ''}
      <label class="field"><span>${b('yourWork')} <small class="muted tabnum" id="wc"></small></span>
        <textarea id="task-text" rows="7">${saved || pick(q.prompt)}</textarea></label>
      ${q.draftSection ? html`<p class="muted small">${b('alsoDraft')}${DRAFT_NAME[q.draftSection]}</p>` : ''}
      <div class="btn-row" id="task-actions"><button type="button" class="btn" id="task-save">${b('saveAndNext')}</button>
        <button type="button" class="btn ghost" id="task-skip">${b('skipTask')}</button></div>`;
  }
  function wireTask() {
    const code = main.querySelector('#code');
    main.querySelector('#copy-code')?.addEventListener('click', () => copyText(code.value, code));
    main.querySelector('#run-code')?.addEventListener('click', async e => {
      const btn = e.currentTarget, out = main.querySelector('#code-out');
      btn.disabled = true; out.hidden = false; out.textContent = pick('running');
      try { out.textContent = await runPython(code.value, q.packages); } catch (err) { out.textContent = String(err.message || err); }
      btn.disabled = false;
    });
    const ta = main.querySelector('#task-text'), wc = main.querySelector('#wc');
    const count = () => { if (q.wordTarget) wc.textContent = `(${(ta.value.match(/[A-Za-z0-9’'-]+/g) || []).length}/${q.wordTarget} ${pick('words')})`; };
    ta.addEventListener('input', count); count();
    const finish = done => {
      store.saveTask(q.id, ta.value, done);
      if (done) { ses.correct++; if (q.draftSection) store.appendDraft(q.draftSection, ta.value, `${course.code} ${q.unit}`); }
      main.querySelector('#task-actions').remove();
      fb.innerHTML = html`<section class="feedback ${done ? 'good' : 'past'}"><h2>${done ? b('taskSaved') : b('taskSkipped')}</h2>
        ${q.reflect ? html`<p class="muted">${b(q.reflect)}</p>` : ''}${nextButtons()}</section>`.toString();
      wireNext();
      if (done && q.reflect) main.querySelector('#memo').open = true;
    };
    main.querySelector('#task-save').addEventListener('click', () => finish(true));
    main.querySelector('#task-skip').addEventListener('click', () => finish(false));
  }

  // ---------- after answering ----------
  function nextButtons() {
    const more = ses.solo && last && (nextUp(COURSES, store.state) || dueQuestions(QUESTIONS, store.state).some(x => x.id !== q.id));
    return html`<div class="btn-row">
      <button type="button" class="btn" data-next>${!last ? b('nextQuestion') : ses.solo ? b('backHome') : b('seeResults')} →</button>
      ${more ? html`<button type="button" class="text-btn" data-more>${b('oneMore')} →</button>` : ''}</div>`;
  }
  function wireNext() {
    fb.querySelector('[data-next]').addEventListener('click', () => {
      if (ses.solo && last) { ctx.go('#/'); return; }
      ses.index++; ctx.go('#/practice'); scrollTo({ top: 0 });
    });
    fb.querySelector('[data-more]')?.addEventListener('click', () => {
      const id = ctx.continueTarget();
      if (id && id !== q.id) ctx.start([id], true); else ctx.go('#/');
      scrollTo({ top: 0 });
    });
  }

  // ---------- session summary ----------
  function complete() {
    const pct = Math.round((ses.correct / ses.ids.length) * 100);
    main.innerHTML = html`<div class="completion">
      <p class="eyebrow">SESSION COMPLETE</p>
      <h1>${b('sessionDone')}</h1>
      <div class="big-score tabnum">${pct}<small>%</small></div>
      <p>${ses.correct} / ${ses.ids.length} ${b('correctCount')}</p>
      <p class="muted">${b('sessionNote')}</p>
      <div class="btn-row center"><a class="btn" href="#/">${b('backHome')} →</a><a class="btn ghost" href="#/review">${b('reviewNow')}</a></div>
    </div>`;
  }
}
