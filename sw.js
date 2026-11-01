// Offline cache for the app shell (stale-while-revalidate). Bump VERSION when files change.
const VERSION = 'neuroatlas-v2';
const SHELL = [
  './', 'index.html', 'css/app.css', 'icon.svg', 'manifest.webmanifest',
  'js/app.js', 'js/i18n.js', 'js/store.js', 'js/export.js', 'js/dom.js', 'js/pyrunner.js',
  'js/views/home.js', 'js/views/courses.js', 'js/views/lesson.js', 'js/views/notebook.js', 'js/views/library.js', 'js/views/settings.js', 'js/views/quiz.js', 'js/views/exportpanel.js',
  'js/widgets/index.js', 'js/widgets/plot.js', 'js/widgets/neuro.js', 'js/widgets/signal.js', 'js/widgets/stats.js', 'js/widgets/diagrams.js',
  'content/index.js', 'content/resources.js', 'content/prep.js', 'content/core-a.js', 'content/core-b.js', 'content/electives.js',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // CDN (Pyodide) goes to network
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
