// Home: one Continue button, a review button, the curriculum at a glance, then the course list.
import { html } from '../dom.js';
import { COURSES, QUESTIONS, SECTIONS } from '../../content/index.js';
import { nextUp, dueQuestions, overall, courseStats } from '../store.js';

let filter = 'all', search = '';

export function render(main, ctx) {
  const { store, b, pick, L } = ctx;
  const s = store.state;
  const nx = nextUp(COURSES, s);
  const due = dueQuestions(QUESTIONS, s);
  const ov = overall(QUESTIONS, s);
  const unitOf = q => COURSES.find(c => c.id === q.course).units.find(u => u.id === q.unit);

  main.innerHTML = html`
    <section class="hero">
      <div>
        <p class="eyebrow">${b('heroEyebrow')}</p>
        <h1>${b('heroTitle1')}<br>${b('heroTitle2')}</h1>
        <p class="muted">${b('heroSub')}</p>
      </div>
    </section>

    <div class="stats">
      <div><span>${b('statAnswered')}</span><strong>${ov.answered}<small> / ${ov.total}</small></strong></div>
      <div><span>${b('statAccuracy')}</span><strong>${ov.accuracy === null ? '—' : Math.round(ov.accuracy * 100)}<small>%</small></strong></div>
      <div><span>${b('statDue')}</span><strong>${due.length}</strong></div>
    </div>

    <button type="button" class="banner" id="continue" ${!nx && !due.length ? 'disabled' : ''}>
      <span class="banner-body">
        <strong>${nx ? html`<span class="chip" style="--c:${nx.course.color}">${nx.course.code}</span> ${b(unitOf(nx.question).title)}` : b('allAnswered')}</strong>
        <small>${nx ? html`${b(nx.course.title)} · ${b('oneQuestion')} · ${b('leftInCourse')} ${nx.left.length}` : due.length ? b('keepReviewing') : b('nothingDue')}</small>
      </span>
      <span class="banner-go">${nx ? b('continue') : b('reviewNow')} →</span>
    </button>
    ${nx && due.length ? html`<button type="button" class="banner banner-sub" id="review-due">
      <span class="banner-body"><strong>${b('reviewBannerTitle')}</strong><small>${due.length} ${b('reviewBannerSub')}</small></span>
      <span class="banner-go">${b('reviewNow')} →</span></button>` : ''}

    <section class="card map">
      <h2>${b('mapTitle')}</h2>
      <ol class="map-flow">
        ${SECTIONS.map(sec => html`<li class="map-col">
          <span class="map-label">${b(sec.label)}<small>${b(sec.desc)}</small></span>
          <span class="map-nodes">${COURSES.filter(c => c.section === sec.id).map(c => { const st = courseStats(c, s); return html`
            <a href="#/course/${c.id}" class="map-node ${st.ratio >= 1 ? 'done' : st.done ? 'started' : ''}" style="--c:${c.color};--p:${st.ratio}" title="${L(c.title)}">${c.code}</a>`; })}</span>
        </li>`)}
      </ol>
      <p class="muted small">${b({ ja: 'プレップで土台 → コアで再現実験から論文草稿まで → 選択で専門を深める', en: 'Prep builds the base → Core takes you from replication to a paper draft → Electives deepen a direction' })}</p>
    </section>

    <div class="row-between list-heading">
      <h2>${b('yourCourses')} <small class="muted">${COURSES.length}</small></h2>
      <input type="search" id="course-search" class="search" data-i18n-ph="searchCourses" placeholder="${pick('searchCourses')}" data-i18n-aria="searchCourses" aria-label="${pick('searchCourses')}" value="${search}">
    </div>
    <div class="filters" role="group">
      ${['all', 'prep', 'core', 'elective'].map(f => html`<button type="button" class="tab" data-f="${f}" aria-pressed="${f === filter}">${b(f)} <small>${f === 'all' ? COURSES.length : COURSES.filter(c => c.section === f).length}</small></button>`)}
    </div>
    <div class="course-grid" id="course-grid"></div>`;

  const grid = main.querySelector('#course-grid');
  const draw = () => {
    const q = search.toLowerCase();
    grid.innerHTML = COURSES.filter(c => (filter === 'all' || c.section === filter) &&
      (!q || [c.title.ja, c.title.en, c.code, ...c.units.flatMap(u => [u.title.ja, u.title.en, ...u.keywords])].join(' ').toLowerCase().includes(q)))
      .map(c => { const st = courseStats(c, s); return html`
        <a class="course-card" href="#/course/${c.id}" style="--c:${c.color}">
          <span class="row-between card-meta"><span class="cat">${b(c.section)}</span><span class="chip" style="--c:${c.color}">${c.code}</span></span>
          <h3>${b(c.title)}</h3>
          <p class="muted small">${c.units.slice(0, 2).map((u, i) => html`${i ? ' / ' : ''}${b(u.title)}`)}</p>
          <span class="row-between card-bottom"><span>${c.units.length} ${b('units')} · ${c.questions.length} ${b('questions')}</span>
            <span>${st.done ? `${st.done}/${st.total}` : b('notStarted')}</span></span>
          <span class="pbar"><span style="width:${Math.round(st.ratio * 100)}%"></span></span>
        </a>`; }).join('');
  };
  draw();
  main.querySelector('#course-search').addEventListener('input', e => { search = e.target.value; draw(); });
  main.querySelectorAll('[data-f]').forEach(btn => btn.addEventListener('click', () => {
    filter = btn.dataset.f; main.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', String(x === btn))); draw();
  }));
  main.querySelector('#continue').addEventListener('click', () => {
    if (nx) ctx.start([nx.question.id], true); else ctx.start(due.slice(0, 10).map(q => q.id));
  });
  main.querySelector('#review-due')?.addEventListener('click', () => ctx.start(due.slice(0, 10).map(q => q.id)));
}
