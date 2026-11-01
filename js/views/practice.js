// Practice: concept card (figure first) → question → answer & explanation → next.
// The concept card opens automatically the first time you meet a unit and stays folded afterwards.
import { html, esc, toast } from '../dom.js';
import { COURSE_MAP, UNIT_MAP, QUESTION_MAP, QUESTIONS, COURSES } from '../../content/index.js';
import { unitSeen, nextUp, dueQuestions } from '../store.js';
import { mountWidget } from '../widgets/index.js';
import { runPython } from '../pyrunner.js';
import { copyText } from './exportpanel.js';
import { evaluate, isCorrect, isExpression, format } from '../calc.js';
import { E1020 } from '../widgets/neuro.js';

const KIND = { choice: 'knowledgeCheck', number: 'calculation', electrode: 'electrodeMap', code: 'codeCompletion', order: 'ordering', task: 'researchTask' };

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
        <span class="eyebrow">${b(q.figure ? 'readFigure' : KIND[q.type])}</span>
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

      ${q.figure ? html`<figure class="q-figure"><div class="viz" id="qfig"></div></figure>` : ''}
      ${{ choice: choiceHtml, number: numberHtml, electrode: electrodeHtml, code: codeHtml, order: orderHtml, task: taskHtml }[q.type]()}
      ${q.hint ? html`<div class="hint-wrap"><button type="button" class="text-btn" id="hint-btn">💡 ${b('hint')}</button><p class="hint" id="hint" hidden>${b(q.hint)}</p></div>` : ''}
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
  let cleanupQFig = () => {};
  if (q.figure) cleanupQFig = mountWidget('stimulus', main.querySelector('#qfig'), q.figure, ctx);
  main.querySelector('#hint-btn')?.addEventListener('click', e => { main.querySelector('#hint').hidden = false; e.currentTarget.remove(); });
  ({ choice: wireChoice, number: wireNumber, electrode: wireElectrode, code: wireCode, order: wireOrder, task: wireTask })[q.type]();
  return () => { cleanupFig(); cleanupQFig(); };

  // ---------- shared feedback ----------
  function showFeedback(ok, body) {
    const before = { ...store.score(q.id) };
    store.record(q.id, ok);
    if (ok) ses.correct++;
    main.querySelector('#hint-btn')?.remove();
    fb.innerHTML = html`<section class="feedback ${ok ? 'good' : 'retry'}">
      <h2>${ok ? b('correct') : b('retry')}</h2>
      ${body}
      <p>${b(q.explain)}</p>
      ${ok ? '' : html`<small class="muted">${b('addedToReview')}</small>`}
      ${!ok && q.type === 'number' ? html`<button type="button" class="text-btn slip" id="slip">${b('slip')}</button>` : ''}
      ${nextButtons()}</section>`.toString();
    fb.querySelector('#slip')?.addEventListener('click', e => {
      store.overrideAsCorrect(q.id, before); ses.correct++;
      fb.querySelector('h2').innerHTML = b('countedCorrect').toString();
      fb.querySelector('.feedback').className = 'feedback good';
      e.currentTarget.remove();
    });
    wireNext();
    fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ---------- choice ----------
  function choiceHtml() {
    return html`<h1 class="question">${b(q.q)}</h1>
      <div class="options" id="options">${q.options.map((o, i) => html`<button type="button" class="opt" data-i="${i}"><span class="opt-key">${String.fromCharCode(65 + i)}</span><span>${b(o)}</span></button>`)}</div>`;
  }
  function wireChoice() {
    const opts = [...main.querySelectorAll('.opt')];
    opts.forEach(btn => btn.addEventListener('click', () => {
      const pickIdx = +btn.dataset.i, ok = pickIdx === q.answer;
      opts.forEach((x, i) => { x.disabled = true; x.classList.toggle('is-answer', i === q.answer); x.classList.toggle('is-wrong', i === pickIdx && !ok); });
      const correctText = q.type === 'code' ? html`<code>${q.options[q.answer]}</code>` : b(q.options[q.answer]);
      showFeedback(ok, html`${ok ? '' : html`<p><strong>${b('answerIs')}</strong>${correctText}</p>`}
        ${q.type === 'code' ? html`<pre class="code-block filled">${fillCode(q.options[q.answer])}</pre>` : ''}`);
    }));
  }

  // ---------- calculation ----------
  function numberHtml() {
    const unitLabel = q.measure ? (typeof q.measure === 'string' ? q.measure : b(q.measure)) : '';
    return html`<h1 class="question">${b(q.q)}</h1>
      <form id="num-form" class="num-form" autocomplete="off">
        <div class="num-row"><input id="num" class="num-input" inputmode="decimal" enterkeyhint="done" data-i18n-aria="yourAnswer" aria-label="${pick('yourAnswer')}" data-i18n-ph="numPlaceholder" placeholder="${pick('numPlaceholder')}">
          ${unitLabel ? html`<span class="num-unit">${unitLabel}</span>` : ''}</div>
        <p class="num-preview tabnum" id="num-preview" aria-live="polite"></p>
        <div class="op-bar" role="group">${['+', '−', '×', '÷', '(', ')', '√', 'ln'].map(op => html`<button type="button" data-op="${op}">${op}</button>`)}</div>
        <button type="submit" class="btn" id="num-submit" disabled>${b('submit')}</button>
      </form>`;
  }
  function wireNumber() {
    const input = main.querySelector('#num'), prev = main.querySelector('#num-preview'), submit = main.querySelector('#num-submit');
    const update = () => {
      const v = evaluate(input.value);
      submit.disabled = !Number.isFinite(v);
      prev.textContent = Number.isFinite(v) && isExpression(input.value) ? `= ${format(v)}${q.percent && Math.abs(v) < 1 ? ` (${format(v * 100)}%)` : ''}` : '';
    };
    input.addEventListener('input', update);
    main.querySelectorAll('[data-op]').forEach(btn => {
      btn.addEventListener('pointerdown', e => e.preventDefault());
      btn.addEventListener('click', () => {
        const op = { '√': 'sqrt(', ln: 'ln(' }[btn.dataset.op] || btn.dataset.op;
        const a = input.selectionStart ?? input.value.length, z = input.selectionEnd ?? input.value.length;
        input.value = input.value.slice(0, a) + op + input.value.slice(z);
        input.focus(); input.setSelectionRange(a + op.length, a + op.length); update();
      });
    });
    main.querySelector('#num-form').addEventListener('submit', e => {
      e.preventDefault();
      if (submit.disabled) return;
      const ok = isCorrect(input.value, q.answer, q.tolerance ?? 0, q.percent);
      input.disabled = true; main.querySelector('.op-bar').remove(); submit.remove();
      input.classList.add(ok ? 'is-correct' : 'is-wrong');
      showFeedback(ok, html`<p><strong>${b('answerIs')}</strong><span class="tabnum">${format(q.answer)}${q.percent ? '%' : ''}</span></p>
        ${q.formula ? html`<p class="worked"><code>${q.formula}</code></p>` : ''}`);
    });
    input.focus({ preventScroll: true });
  }

  // ---------- 10–20 electrode map ----------
  function electrodeHtml() {
    return html`<h1 class="question">${b(q.q)}</h1>
      <svg class="viz-svg head q-head" viewBox="-1.15 -1.2 2.3 2.35" role="group" data-i18n-aria="tapElectrode" aria-label="${pick('tapElectrode')}">
        <circle cx="0" cy="0" r="1" class="head-outline"/><path d="M-0.12,-0.99 L0,-1.13 L0.12,-0.99" class="head-outline"/>
        <ellipse cx="-1.04" cy="0" rx="0.06" ry="0.16" class="head-outline"/><ellipse cx="1.04" cy="0" rx="0.06" ry="0.16" class="head-outline"/>
        ${Object.entries(E1020).map(([name, [x, y]]) => html`<g class="electrode" tabindex="0" role="button" aria-label="${name}" data-e="${name}"><circle cx="${x}" cy="${-y}" r="0.11"/><text x="${x}" y="${-y + 0.035}" text-anchor="middle">${name}</text></g>`)}
      </svg>
      <p class="muted small center">${b({ ja: '上が鼻（前）、左右は本人から見た左右', en: 'Nose at the top; left and right are the subject’s own' })}</p>`;
  }
  function wireElectrode() {
    const nodes = [...main.querySelectorAll('[data-e]')];
    const choose = node => {
      if (main.querySelector('.q-head.answered')) return;
      const name = node.dataset.e, ok = q.answer.includes(name);
      main.querySelector('.q-head').classList.add('answered');
      nodes.forEach(n => { n.classList.toggle('is-answer', q.answer.includes(n.dataset.e)); n.classList.toggle('is-wrong', n === node && !ok); n.removeAttribute('tabindex'); });
      showFeedback(ok, html`<p><strong>${b('answerIs')}</strong>${q.answer.join(' / ')}</p>`);
    };
    nodes.forEach(n => {
      n.addEventListener('click', () => choose(n));
      n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(n); } });
    });
  }

  // ---------- code completion ----------
  function fillCode(fragment) {
    return html`${q.code.split('____').map((part, i, arr) => html`${part}${i < arr.length - 1 ? html`<mark>${fragment}</mark>` : ''}`)}`;
  }
  function codeHtml() {
    return html`<h1 class="question">${b(q.q)}</h1>
      <pre class="code-block">${q.code.split('____').map((part, i, arr) => html`${part}${i < arr.length - 1 ? html`<span class="blank">____</span>` : ''}`)}</pre>
      <div class="options">${q.options.map((o, i) => html`<button type="button" class="opt code-opt" data-i="${i}"><span class="opt-key">${String.fromCharCode(65 + i)}</span><code>${o}</code></button>`)}</div>`;
  }
  function wireCode() { wireChoice(); }

  // ---------- put in order ----------
  function orderHtml() {
    // Stable shuffle per question so the order is never the answer.
    const idx = q.items.map((_, i) => i);
    let seed = [...q.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    for (let i = idx.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) >>> 0; const j = seed % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    if (idx.every((v, i) => v === i)) idx.reverse();
    return html`<h1 class="question">${b(q.q)}</h1>
      <p class="muted small">${b('orderHelp')}</p>
      <ol class="order-picked" id="picked"></ol>
      <div class="order-pool" id="pool">${idx.map(i => html`<button type="button" class="order-item" data-i="${i}">${b(q.items[i])}</button>`)}</div>
      <div class="btn-row"><button type="button" class="btn" id="order-submit" disabled>${b('submit')}</button>
        <button type="button" class="btn ghost" id="order-reset">${b('startOver')}</button></div>`;
  }
  function wireOrder() {
    const picked = main.querySelector('#picked'), pool = main.querySelector('#pool'), submit = main.querySelector('#order-submit');
    const chosen = [];
    const sync = () => { submit.disabled = chosen.length !== q.items.length; };
    pool.addEventListener('click', e => {
      const btn = e.target.closest('.order-item'); if (!btn) return;
      chosen.push(+btn.dataset.i); btn.remove();
      const li = document.createElement('li'); li.className = 'order-slot'; li.dataset.i = btn.dataset.i; li.innerHTML = b(q.items[+btn.dataset.i]).toString();
      picked.appendChild(li); sync();
    });
    const poolHtml = pool.innerHTML;
    main.querySelector('#order-reset').addEventListener('click', () => { chosen.length = 0; picked.innerHTML = ''; pool.innerHTML = poolHtml; sync(); });
    submit.addEventListener('click', () => {
      const ok = chosen.every((v, i) => v === i);
      [...picked.children].forEach((li, i) => li.classList.add(+li.dataset.i === i ? 'is-correct' : 'is-wrong'));
      main.querySelector('#order-reset').parentElement.remove();
      showFeedback(ok, ok ? '' : html`<p><strong>${b('correctOrder')}</strong></p><ol class="order-answer">${q.items.map(it => html`<li>${b(it)}</li>`)}</ol>`);
    });
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
