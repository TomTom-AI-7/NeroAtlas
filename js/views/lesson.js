import { html, toast, esc } from '../dom.js';
import { findLesson, LESSONS } from '../../content/index.js';
import { mountWidget } from '../widgets/index.js';
import { runPython } from '../pyrunner.js';
import { quizHtml, gradeQuiz } from './quiz.js';

const DRAFT_NAME = { abstract: 'Abstract', introduction: 'Introduction', methods: 'Methods', results: 'Results', discussion: 'Discussion' };

export function render(main, ctx, params) {
  const { store, t, L } = ctx;
  const found = findLesson(params.course, params.lesson);
  if (!found) { main.innerHTML = html`<h1>${t('notFound')}</h1>`; return; }
  const { course, lesson, index, key } = found;
  const steps = ['concept', ...(lesson.visual ? ['visual'] : []), 'practice', 'check', 'reflect'];
  const stepLabel = { concept: 'stepConcept', visual: 'stepVisual', practice: 'stepPractice', check: 'stepCheck', reflect: 'stepReflect' };
  let cur = Math.max(0, steps.indexOf(params.step));
  if (params.step === undefined) cur = 0;
  let cleanup = () => {};

  main.innerHTML = html`
    <a class="back" href="#/course/${course.id}">← ${course.code} ${L(course.title)}</a>
    <header class="lesson-head">
      <small class="muted">${t('lessonOf', { i: index + 1, n: course.lessons.length })}</small>
      <h1>${L(lesson.title)}</h1>
    </header>
    <nav class="stepper" aria-label="${t('openStep')}">
      ${steps.map((s, i) => html`<button type="button" class="step" data-i="${i}"><span class="step-n">${i + 1}</span><span class="step-l">${t(stepLabel[s])}</span></button>`)}
    </nav>
    <section id="step-panel" class="card step-panel" tabindex="-1"></section>
    <div class="step-nav">
      <button type="button" class="btn ghost" id="prev">← ${t('prev')}</button>
      <button type="button" class="btn" id="next">${t('next')} →</button>
    </div>`;

  const panel = main.querySelector('#step-panel');
  const stepBtns = [...main.querySelectorAll('.step')];
  stepBtns.forEach(b => b.addEventListener('click', () => go(+b.dataset.i)));
  main.querySelector('#prev').addEventListener('click', () => go(cur - 1));
  main.querySelector('#next').addEventListener('click', () => go(cur + 1));

  function refreshStepper() {
    const lp = store.lesson(key);
    stepBtns.forEach((b, i) => {
      b.setAttribute('aria-current', i === cur ? 'step' : 'false');
      b.classList.toggle('visited', !!lp.steps?.[steps[i]]);
    });
    main.querySelector('#prev').disabled = cur === 0;
    main.querySelector('#next').hidden = cur === steps.length - 1;
  }

  function go(i) {
    if (i < 0 || i >= steps.length) return;
    cur = i;
    history.replaceState(null, '', `#/lesson/${course.id}/${lesson.id}?step=${steps[cur]}`);
    draw();
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function draw() {
    cleanup(); cleanup = () => {};
    const step = steps[cur];
    store.markStep(key, step);
    ({ concept, visual, practice, check, reflect })[step]();
    refreshStepper();
  }

  // ---- steps ----
  function concept() {
    panel.innerHTML = html`<h2>${t('stepConcept')}</h2>
      ${(lesson.concept[ctx.lang] || lesson.concept.ja).map(p => html`<p>${p}</p>`)}
      ${lesson.keywords?.length ? html`<p class="kw"><strong>${t('keywords')}:</strong> ${lesson.keywords.map(k => html`<span class="tag">${k}</span>`)}</p>` : ''}`;
  }

  function visual() {
    panel.innerHTML = html`<h2>${t('stepVisual')}</h2>${lesson.visual.caption ? html`<p class="muted">${L(lesson.visual.caption)}</p>` : ''}<div class="viz"></div>`;
    cleanup = mountWidget(lesson.visual.widget, panel.querySelector('.viz'), lesson.visual.props, ctx);
  }

  function practice() {
    const pr = lesson.practice;
    const saved = store.lesson(key).practice;
    const runnable = pr.code && pr.packages;
    panel.innerHTML = html`<h2>${t('stepPractice')}</h2>
      <p>${L(pr.task)}</p>
      ${pr.code ? html`<div class="code-wrap">
        <textarea class="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python code" rows="${Math.min(22, pr.code.split('\n').length + 1)}">${pr.code}</textarea>
        <div class="code-actions">
          <button type="button" class="btn btn-small ghost" data-act="copy">${t('copy')}</button>
          ${runnable ? html`<button type="button" class="btn btn-small" data-act="run">▶ ${t('runInBrowser')}</button>` : html`<span class="muted small">${t('localOnly')}</span>`}
        </div>
        ${runnable ? html`<p class="muted small">${t('runNote')}</p>` : ''}
        <pre class="code-out" hidden></pre></div>` : ''}
      <label class="field"><span>${t('yourWork')}${pr.wordTarget ? html` <small class="muted" id="wc"></small>` : ''}</span>
        <textarea id="practice-text" rows="8">${saved || L(pr.prompt)}</textarea></label>
      ${pr.draftSection ? html`<p class="muted small">${t('alsoDraft', { s: DRAFT_NAME[pr.draftSection] })}</p>` : ''}
      <button type="button" class="btn" id="save-practice">${t('saveToNotebook')}</button>`;

    const code = panel.querySelector('textarea.code');
    const outEl = panel.querySelector('.code-out');
    panel.querySelector('[data-act=copy]')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.value); toast(t('copied')); } catch { code.select(); document.execCommand('copy'); toast(t('copied')); }
    });
    panel.querySelector('[data-act=run]')?.addEventListener('click', async e => {
      const btn = e.currentTarget; btn.disabled = true; outEl.hidden = false; outEl.textContent = t('running');
      try { outEl.textContent = await runPython(code.value, pr.packages); } catch (err) { outEl.textContent = String(err.message || err); }
      btn.disabled = false;
    });
    const ta = panel.querySelector('#practice-text');
    const wc = panel.querySelector('#wc');
    const count = () => { if (wc) { const n = (ta.value.match(/[A-Za-z0-9’'-]+/g) || []).length; wc.textContent = `(${n}/${pr.wordTarget} ${t('words')})`; } };
    ta.addEventListener('input', count); count();
    panel.querySelector('#save-practice').addEventListener('click', () => {
      store.setPractice(key, ta.value);
      if (pr.draftSection) store.appendDraft(pr.draftSection, ta.value, `${course.code} ${lesson.id}`);
      toast(t('saved'));
      refreshStepper();
    });
  }

  function check() {
    const prev = store.lesson(key).quiz;
    panel.innerHTML = html`<h2>${t('stepCheck')}</h2>
      ${prev ? html`<p class="muted">${t('score')}: ${prev.score}/${prev.total}</p>` : ''}
      <form id="quiz">${quizHtml(lesson.quiz, 'lq', L)}
        <div class="row"><button class="btn" type="submit">${t('checkAnswer')}</button></div></form>`;
    const form = panel.querySelector('#quiz');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const res = gradeQuiz(form, lesson.quiz, 'lq', L, t);
      const q = store.recordQuiz(key, res.map(({ qid, correct }) => ({ qid, correct })));
      const row = form.querySelector('.row');
      row.innerHTML = html`<strong class="score">${t('score')}: ${q.score}/${q.total}</strong> <button class="btn ghost" type="button" id="retry">${t('retry')}</button>`.toString();
      row.querySelector('#retry').addEventListener('click', check);
      refreshStepper();
    });
  }

  function reflect() {
    const mine = () => store.state.entries.filter(e => e.key === key);
    const lp = store.lesson(key);
    const idx = LESSONS.findIndex(x => x.key === key);
    const next = LESSONS[idx + 1] && LESSONS[idx + 1].course.id === course.id ? LESSONS[idx + 1] : null;
    panel.innerHTML = html`<h2>${t('stepReflect')}</h2>
      <p class="prompt">${L(lesson.reflect)}</p>
      <div class="seg" role="radiogroup" aria-label="${t('stepReflect')}">
        ${['note', 'aha', 'question'].map((ty, i) => html`<button type="button" role="radio" class="etype-btn ${ty}" data-type="${ty}" aria-checked="${i === 0}">${t(ty)}</button>`)}
      </div>
      <textarea id="entry-text" rows="4" aria-label="${t('stepReflect')}"></textarea>
      <button type="button" class="btn" id="add-entry">${t('add')}</button>
      <ul class="entries" id="lesson-entries"></ul>
      <div class="complete-box">
        ${lp.done ? html`<p class="ok">✓ ${t('completed')}</p>` : html`<button type="button" class="btn big" id="complete">${t('complete')}</button>`}
        ${next ? html`<a class="btn ghost" href="#/lesson/${next.course.id}/${next.lesson.id}">${t('nextLesson')} →</a>` : html`<a class="btn ghost" href="#/course/${course.id}">${t('backToCourse')}</a>`}
      </div>`;
    let type = 'note';
    panel.querySelectorAll('.etype-btn').forEach(b => b.addEventListener('click', () => {
      type = b.dataset.type; panel.querySelectorAll('.etype-btn').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    }));
    const list = panel.querySelector('#lesson-entries');
    const drawList = () => { list.innerHTML = mine().map(e => `<li><span class="etype ${e.type}">${esc(t(e.type))}</span> ${esc(e.text)}</li>`).join(''); };
    drawList();
    panel.querySelector('#add-entry').addEventListener('click', () => {
      const ta = panel.querySelector('#entry-text');
      if (store.addEntry(type, ta.value, key)) { ta.value = ''; drawList(); toast(t('saved')); }
    });
    panel.querySelector('#complete')?.addEventListener('click', () => {
      store.complete(key); toast(t('completed')); reflect(); refreshStepper();
    });
  }

  draw();
  return () => cleanup();
}

