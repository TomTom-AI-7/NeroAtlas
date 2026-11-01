// NeuroAtlas — hash router and app shell.
import { createStore } from './store.js';
import { t, setLang, getLang } from './i18n.js';
import { html } from './dom.js';
import * as home from './views/home.js';
import * as courses from './views/courses.js';
import * as lesson from './views/lesson.js';
import * as notebook from './views/notebook.js';
import * as library from './views/library.js';
import * as settings from './views/settings.js';

const store = createStore();
const main = document.getElementById('main');
let cleanup = () => {};

// Language: saved preference → browser language → Japanese.
setLang(store.state.lang || ((navigator.language || 'ja').startsWith('ja') ? 'ja' : 'en'));
applyTheme(store.state.theme);

function applyTheme(v) {
  if (v === 'light' || v === 'dark') document.documentElement.dataset.theme = v;
  else delete document.documentElement.dataset.theme;
}

const ctx = {
  store, t,
  get lang() { return getLang(); },
  L: o => t(o),
  setLang: l => { store.setPref('lang', l); setLang(l); renderShell(); },
  setTheme: v => { store.setPref('theme', v); applyTheme(v); },
  rerender: () => route(),
};

const ROUTES = [
  [/^\/?$/, () => home.render, 'home'],
  [/^\/courses(?:\/(\w+))?$/, m => (el, c) => courses.renderList(el, c, { section: m[1] }), 'courses'],
  [/^\/course\/(\w+)$/, m => (el, c) => courses.renderCourse(el, c, { id: m[1] }), 'courses'],
  [/^\/lesson\/([\w-]+)\/([\w-]+)$/, (m, q) => (el, c) => lesson.render(el, c, { course: m[1], lesson: m[2], step: q.get('step') ?? undefined }), 'courses'],
  [/^\/notebook(?:\/(\w+))?$/, m => (el, c) => notebook.render(el, c, { tab: m[1] }), 'notebook'],
  [/^\/library$/, () => library.render, 'library'],
  [/^\/settings$/, () => settings.render, 'settings'],
];

function renderShell() {
  document.querySelector('.brand-tag').textContent = t('appTagline');
  const langBtn = document.getElementById('lang-toggle');
  langBtn.textContent = getLang() === 'ja' ? 'EN' : 'JA';
  langBtn.setAttribute('aria-label', getLang() === 'ja' ? 'Switch to English' : '日本語に切り替え');
  const nav = document.getElementById('nav');
  const items = [['home', '#/', 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
    ['courses', '#/courses', 'M4 5h16v3H4zM4 10.5h16v3H4zM4 16h10v3H4z'],
    ['notebook', '#/notebook', 'M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM9 7h7M9 11h7M9 15h4'],
    ['library', '#/library', 'M5 4h3v16H5zM10 4h3v16h-3zM15.5 4.5l2.9-.8 4 15.4-2.9.8z'],
    ['settings', '#/settings', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.5 4l2-1.5-2-3.5-2.4.8a7 7 0 0 0-1.7-1L16 4h-4l-.4 2.8a7 7 0 0 0-1.7 1L7.5 7 5.5 10.5l2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-.8c.5.4 1.1.8 1.7 1L12 22h4l.4-2.8c.6-.2 1.2-.6 1.7-1l2.4.8 2-3.5-2-1.5a7 7 0 0 0 0-2z']];
  nav.innerHTML = html`${items.map(([k, href, d]) => html`<a href="${href}" data-nav="${k}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg><span>${t(k)}</span></a>`)}`;
  markNav();
}

let currentNav = 'home';
function markNav() { document.querySelectorAll('[data-nav]').forEach(a => a.setAttribute('aria-current', a.dataset.nav === currentNav ? 'page' : 'false')); }

function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const q = new URLSearchParams(qs || '');
  cleanup(); cleanup = () => {};
  for (const [re, make, nav] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    currentNav = nav; markNav();
    main.classList.remove('fade-in'); void main.offsetWidth; main.classList.add('fade-in');
    const result = make(m, q)(main, ctx);
    if (typeof result === 'function') cleanup = result;
    const h1 = main.querySelector('h1');
    document.title = h1 && nav !== 'home' ? `${h1.textContent} · NeuroAtlas` : 'NeuroAtlas';
    return;
  }
  main.innerHTML = html`<h1>${t('notFound')}</h1><p><a href="#/">${t('home')}</a></p>`;
}

let lastPath = null;
addEventListener('hashchange', () => {
  const path = location.hash.split('?')[0];
  if (path !== lastPath) scrollTo({ top: 0 });
  lastPath = path;
  route();
});
document.getElementById('lang-toggle').addEventListener('click', () => { ctx.setLang(getLang() === 'ja' ? 'en' : 'ja'); route(); });

renderShell();
lastPath = location.hash.split('?')[0];
route();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
