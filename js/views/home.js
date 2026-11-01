import { html, progressBar, ring, toast } from '../dom.js';
import { COURSES, LESSONS, SECTIONS } from '../../content/index.js';
import { courseProgress, sectionProgress, nextLesson, pipelineStatus } from '../store.js';
import { quizHtml, gradeQuiz } from './quiz.js';

export function render(main, { store, t, L }) {
  const s = store.state;
  const nx = nextLesson(LESSONS, s);
  const doneAll = LESSONS.filter(x => s.progress[x.key]?.done).length;
  const pipe = pipelineStatus(s);
  const review = s.review.map(r => { const x = LESSONS.find(l => l.key === r.key); const q = x?.lesson.quiz.find(q => q.id === r.qid); return x && q ? { x, q } : null; }).filter(Boolean).slice(0, 3);
  const recent = s.entries.slice(0, 3);

  main.innerHTML = html`
    <section class="hero">
      <p class="eyebrow">NeuroAtlas</p>
      <h1>${t('appTagline')}</h1>
      ${nx ? html`
        <a class="card continue" href="#/lesson/${nx.course.id}/${nx.lesson.id}">
          <span class="chip" style="--c:${nx.course.color}">${nx.course.code}</span>
          <span class="continue-body"><small>${doneAll ? t('continue') : t('start')}</small><strong>${L(nx.lesson.title)}</strong><small class="muted">${L(nx.course.title)}</small></span>
          <span class="continue-go" aria-hidden="true">▶</span>
        </a>` : html`<p class="card">${t('allDone')}</p>`}
    </section>

    <section class="card">
      <div class="row-between"><h2>${t('overall')}</h2><span class="muted">${doneAll}/${LESSONS.length} ${t('lessons')}</span></div>
      ${progressBar(doneAll / LESSONS.length, t('overall'))}
      <div class="section-stats">
        ${SECTIONS.map(sec => { const p = sectionProgress(COURSES, sec.id, s.progress); return html`
          <a class="section-stat" href="#/courses/${sec.id}">${ring(p.ratio)}<span><strong>${L(sec.short)}</strong><small class="muted">${p.done}/${p.total}</small></span></a>`; })}
      </div>
    </section>

    <section class="card">
      <h2>${t('pipelineTitle')}</h2>
      <ol class="pipeline">
        ${[['pipe1', pipe.theory], ['pipe2', pipe.replicate], ['pipe3', pipe.hypothesis], ['pipe4', pipe.draft]].map(([k, v]) => html`
          <li class="${v >= 1 ? 'done' : v > 0 ? 'part' : ''}"><span class="pipe-dot" style="--p:${v}"></span><span>${t(k)}</span><small class="muted">${Math.round(v * 100)}%</small></li>`)}
      </ol>
    </section>

    <section class="card">
      <h2>${t('reviewQueue')} <span class="badge">${s.review.length}</span></h2>
      ${review.length ? html`<p class="muted small">${t('reviewHint')}</p><form id="review-form">
        ${review.map(({ x, q }) => html`<div class="review-item"><small class="muted">${x.course.code} · ${L(x.lesson.title)}</small>${quizHtml([q], 'rv-' + x.lesson.id, L)}</div>`)}
        <button class="btn" type="submit">${t('checkAnswer')}</button></form>` : html`<p class="muted">${t('reviewEmpty')}</p>`}
    </section>

    ${recent.length ? html`<section class="card"><div class="row-between"><h2>${t('recentEntries')}</h2><a href="#/notebook">${t('notebook')} →</a></div>
      <ul class="entries compact">${recent.map(e => html`<li><span class="etype ${e.type}">${t(e.type)}</span> ${e.text.slice(0, 120)}</li>`)}</ul></section>` : ''}

    <section class="card">
      <h2>${t('sectionsMap')}</h2>
      <div class="cmap">
        ${SECTIONS.map(sec => html`<div class="cmap-col"><h3>${L(sec.short)}</h3>
          ${COURSES.filter(c => c.section === sec.id).map(c => { const p = courseProgress(c, s.progress); return html`
            <a class="cmap-node ${p.ratio >= 1 ? 'done' : p.started ? 'started' : ''}" href="#/course/${c.id}" style="--c:${c.color};--p:${p.ratio}">
              <b>${c.code}</b><span>${L(c.title)}</span></a>`; })}
        </div>`)}
      </div>
    </section>`;

  const form = main.querySelector('#review-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const items = form.querySelectorAll('.review-item');
    review.forEach(({ x, q }, i) => {
      const [res] = gradeQuiz(items[i], [q], 'rv-' + x.lesson.id, L, t);
      if (res.answered) store.resolveReview(x.key, q.id, res.correct);
    });
    form.querySelector('button[type=submit]').remove();
    toast(t('saved'));
  });
}
