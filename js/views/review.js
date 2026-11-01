// Review: questions whose spaced-repetition date has come, plus starred questions.
import { html } from '../dom.js';
import { QUESTIONS, COURSE_MAP } from '../../content/index.js';
import { dueQuestions } from '../store.js';

export function render(main, ctx) {
  const { store, b } = ctx;
  const due = dueQuestions(QUESTIONS, store.state);
  const starred = QUESTIONS.filter(q => store.state.bookmarks[q.id]);
  const row = q => { const c = COURSE_MAP[q.course]; return html`<li><button type="button" class="review-row" data-q="${q.id}">
    <span><small class="muted"><span class="chip" style="--c:${c.color}">${c.code}</span> ${b(q.topic)}</small><span class="review-text">${b(q.q || q.task)}</span></span><span aria-hidden="true">→</span></button></li>`; };
  main.innerHTML = html`
    <p class="eyebrow">${b('reviewEyebrow')}</p>
    <h1>${b('reviewTitle')}</h1>
    <p class="muted">${b('reviewSub')}</p>
    <div class="btn-row">
      <button type="button" class="btn" id="go-due" ${due.length ? '' : 'disabled'}>${b('reviewNow')} · ${due.length} →</button>
      <button type="button" class="btn ghost" id="go-star" ${starred.length ? '' : 'disabled'}>${b('savedQuestions')} · ${starred.length}</button>
    </div>
    <h2 class="spaced">${b('dueList')}</h2>
    ${due.length ? html`<ul class="plain">${due.map(row)}</ul>` : html`<p class="empty">${b('noDue')}</p>`}
    <h2 class="spaced">${b('savedQuestions')}</h2>
    ${starred.length ? html`<ul class="plain">${starred.map(row)}</ul>` : html`<p class="empty">${b('noSaved')}</p>`}`;
  main.querySelector('#go-due').addEventListener('click', () => ctx.start(due.slice(0, 20).map(q => q.id)));
  main.querySelector('#go-star').addEventListener('click', () => ctx.start(starred.map(q => q.id)));
  main.querySelectorAll('[data-q]').forEach(btn => btn.addEventListener('click', () => ctx.start([btn.dataset.q])));
}
