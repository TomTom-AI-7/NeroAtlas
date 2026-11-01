// NeuroAtlas — app shell, router and study session.
// Opening the app goes straight to the next unanswered question (one-question mode),
// so there is never a decision to make before studying.
import { createStore, nextUp, dueQuestions } from './store.js';
import { b, pick, setLang, getLang } from './i18n.js';
import { html } from './dom.js';
import { COURSES, QUESTIONS, QUESTION_MAP } from '../content/index.js';
import { remountAll } from './widgets/index.js';
import * as home from './views/home.js';
import * as course from './views/course.js';
import * as practice from './views/practice.js';
import * as review from './views/review.js';
import * as notes from './views/notes.js';
import * as library from './views/library.js';

const store = createStore();
const main = document.getElementById('main');
let cleanup = () => {};
let session = null; // { ids, index, solo, correct }

const ctx = {
  store, b, pick,
  get lang() { return getLang(); },
  L: o => pick(o),
  go: hash => { if (location.hash === hash) route(); else location.hash = hash; },
  get session() { return session; },
  /** Start practice with these question ids. solo = one-question mode from the Continue button. */
  start(ids, solo = false) {
    ids = ids.filter(id => QUESTION_MAP[id]);
    if (!ids.length) return;
    session = { ids, index: 0, solo, correct: 0 };
    ctx.go('#/practice');
  },
  /** The question the Continue button points at: next unanswered, else the oldest due review. */
  continueTarget() {
    const nx = nextUp(COURSES, store.state);
    if (nx) return nx.question.id;
    return dueQuestions(QUESTIONS, store.state)[0]?.id || null;
  },
};

// ---- language: flip a CSS switch, no re-render ----
setLang(store.state.lang || ((navigator.language || 'ja').startsWith('ja') ? 'ja' : 'en'));
document.getElementById('lang-toggle').addEventListener('click', () => {
  const l = getLang() === 'ja' ? 'en' : 'ja';
  setLang(l); store.setLang(l); remountAll(); setTitle();
});

const NAV = [
  ['learn', '#/', 'M4 5h16v3H4zM4 10.5h16v3H4zM4 16h10v3H4z'],
  ['review', '#/review', 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6'],
  ['notes', '#/notes', 'M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM9 7h7M9 11h7M9 15h4'],
  ['library', '#/library', 'M5 4h3v16H5zM10 4h3v16h-3zM15.5 4.5l2.9-.8 4 15.4-2.9.8z'],
];
document.getElementById('nav').innerHTML = html`${NAV.map(([k, href, d]) => html`<a href="${href}" data-nav="${k}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg><span>${b(k)}</span>${k === 'review' ? html`<b class="nav-badge" id="due-badge" hidden></b>` : ''}</a>`)}`;
document.querySelector('.brand-tag').innerHTML = b('appTagline');

function refreshBadge() {
  const n = dueQuestions(QUESTIONS, store.state).length;
  const el = document.getElementById('due-badge');
  el.hidden = !n; el.textContent = n;
}
function setTitle() {
  const h1 = main.querySelector('h1 [data-l="' + getLang() + '"]') || main.querySelector('h1');
  const name = h1 ? h1.textContent.trim() : '';
  document.title = name && !location.hash.match(/^#\/?$/) ? `${name} · NeuroAtlas` : 'NeuroAtlas';
}

const ROUTES = [
  [/^\/?$/, () => home.render, 'learn'],
  [/^\/course\/(\w+)$/, m => (el, c) => course.render(el, c, m[1]), 'learn'],
  [/^\/practice$/, () => practice.render, 'learn'],
  [/^\/review$/, () => review.render, 'review'],
  [/^\/notes(?:\/(\w+))?$/, m => (el, c) => notes.render(el, c, m[1]), 'notes'],
  [/^\/library$/, () => library.render, 'library'],
];

function route() {
  const path = (location.hash.replace(/^#/, '') || '/').split('?')[0];
  cleanup(); cleanup = () => {};
  // Practice needs a session; arriving without one (reload, shared link) resumes the next question.
  if (path === '/practice' && !session) {
    const id = ctx.continueTarget();
    if (id) session = { ids: [id], index: 0, solo: true, correct: 0 };
    else { location.replace('#/'); return; }
  }
  for (const [re, make, nav] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    document.querySelectorAll('[data-nav]').forEach(a => a.setAttribute('aria-current', a.dataset.nav === nav ? 'page' : 'false'));
    const r = make(m)(main, ctx);
    if (typeof r === 'function') cleanup = r;
    refreshBadge(); setTitle();
    return;
  }
  main.innerHTML = html`<h1>${b('notFound')}</h1><p><a href="#/">${b('learn')}</a></p>`;
}

let lastPath = null;
addEventListener('hashchange', () => {
  const p = location.hash.split('?')[0];
  if (p !== lastPath) scrollTo({ top: 0 });
  lastPath = p;
  route();
});

// First open: go straight to the next question.
if (/^#?\/?$/.test(location.hash)) {
  const id = ctx.continueTarget();
  if (id) { session = { ids: [id], index: 0, solo: true, correct: 0 }; history.replaceState(null, '', '#/practice'); }
}
lastPath = location.hash.split('?')[0];
route();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
