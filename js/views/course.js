// Course page: one button to continue, then the units in order (tap one to study it), goals and links.
import { html } from '../dom.js';
import { COURSE_MAP, RESOURCE_MAP } from '../../content/index.js';
import { courseStats, attempted } from '../store.js';

export function render(main, ctx, id) {
  const { store, b } = ctx;
  const c = COURSE_MAP[id];
  if (!c) { main.innerHTML = html`<h1>${b('notFound')}</h1>`; return; }
  const s = store.state;
  const st = courseStats(c, s);
  const left = c.questions.filter(q => !attempted(s, q));
  const chip = cid => { const x = COURSE_MAP[cid]; return x ? html`<a class="chip-link" href="#/course/${x.id}"><span class="chip">${x.code}</span>${b(x.title)}</a>` : ''; };

  main.innerHTML = html`
    <a class="back" href="#/">← ${b('learn')}</a>
    <header class="course-head">
      <span class="row"><span class="chip">${c.code}</span><span class="muted small">${b(c.section)}</span></span>
      <h1>${b(c.title)}</h1>
      <p class="muted">${b(c.summary)}</p>
      <span class="pbar"><span style="width:${Math.round(st.ratio * 100)}%"></span></span>
      <span class="muted small">${st.done}/${st.total} ${b('questions')}${st.accuracy !== null ? ` · ${Math.round(st.accuracy * 100)}%` : ''}</span>
      <button type="button" class="btn big" id="go">${left.length ? (st.done ? b('courseContinue') : b('courseStart')) : b('courseReview')} →</button>
    </header>

    <ol class="unit-list">
      ${c.units.map((u, i) => {
        const done = u.questions.filter(q => attempted(s, q)).length;
        return html`<li><button type="button" class="unit-row ${done === u.questions.length ? 'done' : done ? 'started' : ''}" data-unit="${u.id}">
          <span class="unit-n" aria-hidden="true">${done === u.questions.length ? '✓' : i + 1}</span>
          <span class="unit-body"><strong>${b(u.title)}</strong><small class="muted">${done}/${u.questions.length} ${b('questionsUnit')}${u.figure ? ' · ◧' : ''}</small></span>
          <span aria-hidden="true">→</span></button></li>`;
      })}
    </ol>

    <section class="card">
      <h2>${b('goals')}</h2>
      <ul class="checklist">${c.goals.map(g => html`<li>${b(g)}</li>`)}</ul>
      <h3>${b('deliverable')}</h3><p>${b(c.deliverable)}</p>
      ${c.prereq.length ? html`<h3>${b('prereq')}</h3><div class="chips">${c.prereq.map(chip)}</div>` : ''}
      ${c.next.length ? html`<h3>${b('next')}</h3><div class="chips">${c.next.map(chip)}</div>` : ''}
    </section>

    <details class="card">
      <summary><strong>${b('resources')}</strong></summary>
      <ul class="res-list">${c.resources.map(r => RESOURCE_MAP[r]).filter(Boolean).map(r => resourceItem(r, b))}</ul>
      <p class="small muted">${b('copyrightBody')}</p>
    </details>`;

  main.querySelector('#go').addEventListener('click', () => {
    const ids = (left.length ? left : c.questions.filter(q => q.type === 'choice')).slice(0, 7).map(q => q.id);
    ctx.start(ids);
  });
  main.querySelectorAll('[data-unit]').forEach(btn => btn.addEventListener('click', () => {
    const u = c.units.find(x => x.id === btn.dataset.unit);
    const open = u.questions.filter(q => !attempted(s, q));
    ctx.start((open.length ? open : u.questions).map(q => q.id));
  }));
}

function resourceItem(r, b) {
  return html`<li class="res">
    <a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>
    <div class="res-meta"><span class="badge acc-${r.access}">${b('access_' + r.access)}</span><span class="badge">${b('type_' + r.type)}</span><span class="muted small">${r.provider}</span></div>
    <p class="small muted">${b(r.note)}</p></li>`;
}
