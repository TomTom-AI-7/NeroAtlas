// Home: one Continue button, a review button, the curriculum at a glance, then the course list.
import { html } from '../dom.js';
import { COURSES, QUESTIONS } from '../../content/index.js';
import { nextUp, dueQuestions, overall, courseStats } from '../store.js';
import { mountHeroArt } from './heroart.js';

let filter = 'all', search = '';

export function render(main, ctx) {
  const { store, b, pick } = ctx;
  const s = store.state;
  const nx = nextUp(COURSES, s);
  const due = dueQuestions(QUESTIONS, s);
  const ov = overall(QUESTIONS, s);
  const unitOf = q => COURSES.find(c => c.id === q.course).units.find(u => u.id === q.unit);

  main.innerHTML = html`
    <section class="hero">
      <canvas class="hero-art" id="hero-art" aria-hidden="true"></canvas>
      <div class="hero-text">
        <p class="eyebrow">${b('heroEyebrow')}</p>
        <h1>${b('heroTitle1')}<br>${b('heroTitle2')}</h1>
        <p class="muted">${b('heroSub')}</p>
      </div>
    </section>

    <div class="stats">
      <div><span>${b('statAnswered')}</span><strong>${ov.answered}<small> / ${ov.total}</small></strong>
        <i class="stat-bar"><b style="width:${Math.round(ov.answered / ov.total * 100)}%"></b></i></div>
      <div><span>${b('statAccuracy')}</span><strong>${ov.accuracy === null ? '—' : Math.round(ov.accuracy * 100)}<small>%</small></strong>
        <i class="stat-bar"><b style="width:${ov.accuracy === null ? 0 : Math.round(ov.accuracy * 100)}%"></b></i></div>
      <div><span>${b('statDue')}</span><strong>${due.length}</strong>
        <i class="stat-dots">${[0, 1, 2, 3].map(i => html`<b class="${i < Math.min(due.length, 4) ? 'on' : ''}"></b>`)}</i></div>
    </div>

    <button type="button" class="banner" id="continue" ${!nx && !due.length ? 'disabled' : ''}>
      <span class="banner-body">
        <strong>${nx ? html`<span class="chip">${nx.course.code}</span> ${b(unitOf(nx.question).title)}` : b('allAnswered')}</strong>
        <small>${nx ? html`${b(nx.course.title)} · ${b('oneQuestion')} · ${b('leftInCourse')} ${nx.left.length}` : due.length ? b('keepReviewing') : b('nothingDue')}</small>
      </span>
      <span class="banner-go">${nx ? b('continue') : b('reviewNow')} →</span>
    </button>
    ${nx && due.length ? html`<button type="button" class="banner banner-sub" id="review-due">
      <span class="banner-body"><strong>${b('reviewBannerTitle')}</strong><small>${due.length} ${b('reviewBannerSub')}</small></span>
      <span class="pill-btn">${b('reviewNow')} →</span></button>` : ''}

    <div class="row-between list-heading">
      <h2 class="rule-h">${b('yourCourses')} <small class="muted">${COURSES.length}</small></h2>
      <label class="search-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
        <input type="search" id="course-search" class="search" data-i18n-ph="searchCourses" placeholder="${pick('searchCourses')}" data-i18n-aria="searchCourses" aria-label="${pick('searchCourses')}" value="${search}"></label>
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
        <a class="course-card" href="#/course/${c.id}">
          <span class="row-between card-meta"><span class="cat">${b(c.section)}</span><span class="chip">${c.code}</span></span>
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
  return mountHeroArt(main.querySelector('#hero-art'));
}
