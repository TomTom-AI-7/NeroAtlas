import { html, progressBar, ring } from '../dom.js';
import { COURSES, COURSE_MAP, SECTIONS, RESOURCE_MAP } from '../../content/index.js';
import { courseProgress } from '../store.js';

export function renderList(main, { store, t, L }, params) {
  const section = SECTIONS.some(s => s.id === params.section) ? params.section : 'prep';
  const sec = SECTIONS.find(s => s.id === section);
  const s = store.state;
  main.innerHTML = html`
    <h1>${t('courses')}</h1>
    <nav class="tabs" aria-label="${t('courses')}">
      ${SECTIONS.map(x => html`<a href="#/courses/${x.id}" class="tab" aria-current="${x.id === section ? 'page' : 'false'}">${L(x.short)}</a>`)}
    </nav>
    <p class="lead">${L(sec.label)} — ${L(sec.desc)}</p>
    <div class="course-grid">
      ${COURSES.filter(c => c.section === section).map(c => {
        const p = courseProgress(c, s.progress);
        return html`<a class="card course-card" href="#/course/${c.id}" style="--c:${c.color}">
          <div class="row-between"><span class="chip" style="--c:${c.color}">${c.code}</span>${ring(p.ratio, 40)}</div>
          <h2>${L(c.title)}</h2>
          <p class="muted small">${L(c.summary)}</p>
          <div class="meta"><span>${c.lessons.length} ${t('lessons')}</span>
            ${p.mastery !== null ? html`<span>${t('mastery')} ${Math.round(p.mastery * 100)}%</span>` : ''}
            ${c.prereq.length ? html`<span>${t('prereq')}: ${c.prereq.map(id => COURSE_MAP[id]?.code).join(', ')}</span>` : ''}</div>
          ${progressBar(p.ratio, L(c.title))}
        </a>`;
      })}
    </div>`;
}

export function renderCourse(main, { store, t, L }, params) {
  const c = COURSE_MAP[params.id];
  if (!c) { main.innerHTML = html`<h1>${t('notFound')}</h1>`; return; }
  const s = store.state;
  const p = courseProgress(c, s.progress);
  const firstOpen = c.lessons.findIndex(l => !s.progress[`${c.id}/${l.id}`]?.done);
  const linkCourse = id => { const x = COURSE_MAP[id]; return x ? html`<a class="chip link" style="--c:${x.color}" href="#/course/${x.id}">${x.code} ${L(x.title)}</a>` : ''; };
  main.innerHTML = html`
    <a class="back" href="#/courses/${c.section}">← ${t('courses')}</a>
    <header class="course-head" style="--c:${c.color}">
      <span class="chip" style="--c:${c.color}">${c.code}</span>
      <h1>${L(c.title)}</h1>
      <p class="lead">${L(c.summary)}</p>
      <div class="row-between"><span class="muted">${p.done}/${p.total} ${t('lessons')}${p.mastery !== null ? ` · ${t('mastery')} ${Math.round(p.mastery * 100)}%` : ''}</span></div>
      ${progressBar(p.ratio, L(c.title))}
    </header>

    <section class="card">
      <h2>${t('roadmap')}</h2>
      <ol class="roadmap">
        ${c.lessons.map((l, i) => {
          const lp = s.progress[`${c.id}/${l.id}`];
          const state = lp?.done ? 'done' : i === firstOpen ? 'current' : lp ? 'started' : '';
          return html`<li class="${state}"><a href="#/lesson/${c.id}/${l.id}">
            <span class="rm-dot" aria-hidden="true">${lp?.done ? '✓' : i + 1}</span>
            <span class="rm-body"><strong>${L(l.title)}</strong>
              <small class="muted">${lp?.done ? t('completed') : lp ? t('inProgress') : t('todo')}${lp?.quiz ? ` · ${lp.quiz.score}/${lp.quiz.total}` : ''}</small></span></a></li>`;
        })}
        <li class="deliv"><span class="rm-dot" aria-hidden="true">★</span><span class="rm-body"><strong>${t('deliverable')}</strong><small>${L(c.deliverable)}</small></span></li>
      </ol>
    </section>

    <section class="card">
      <h2>${t('goals')}</h2>
      <ul class="checklist">${c.goals.map(g => html`<li>${L(g)}</li>`)}</ul>
    </section>

    <section class="card two-col">
      <div><h3>${t('prereq')}</h3><div class="chips">${c.prereq.length ? c.prereq.map(linkCourse) : html`<span class="muted">${t('none')}</span>`}</div></div>
      <div><h3>${t('nextCourses')}</h3><div class="chips">${c.next.length ? c.next.map(linkCourse) : html`<span class="muted">${t('none')}</span>`}</div></div>
    </section>

    <section class="card">
      <h2>${t('resources')}</h2>
      <ul class="res-list">${c.resources.map(id => RESOURCE_MAP[id]).filter(Boolean).map(r => resourceItem(r, t, L))}</ul>
    </section>`;
}

export function resourceItem(r, t, L) {
  return html`<li class="res">
    <a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>
    <div class="res-meta"><span class="badge acc-${r.access}">${t('access_' + r.access)}</span><span class="badge">${t('type_' + r.type)}</span><span class="muted small">${r.provider}</span></div>
    <p class="small muted">${L(r.note)}</p></li>`;
}
