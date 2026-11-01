// Persistent learner state. Pure logic + a pluggable storage backend (localStorage in the browser,
// an in-memory object in tests).

export const STORAGE_KEY = 'neuroatlas.v1';
export const DRAFT_SECTIONS = ['title', 'abstract', 'introduction', 'methods', 'results', 'discussion', 'references'];

export function emptyState() {
  return {
    version: 1,
    lang: null,
    theme: 'auto',
    progress: {},      // { [lessonKey]: { done, steps: {concept,visual,practice,check,reflect}, quiz: {score,total,at}, practice: string, updatedAt } }
    review: [],        // [{ key, qid }]
    entries: [],       // [{ id, type: 'note'|'aha'|'question', text, key, resolved, at }]
    draft: Object.fromEntries(DRAFT_SECTIONS.map(s => [s, ''])),
    lastLesson: null,
  };
}

function memoryBackend() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

function safeBackend() {
  try {
    const ls = globalThis.localStorage;
    const probe = '__na_probe__';
    ls.setItem(probe, '1'); ls.removeItem(probe);
    return ls;
  } catch { return memoryBackend(); }
}

/** Merge unknown/partial data into a valid state (used for loading and importing). */
export function normalize(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  const s = { ...base, ...raw };
  delete s.app; delete s.exportedAt;
  s.progress = raw.progress && typeof raw.progress === 'object' ? raw.progress : {};
  s.review = Array.isArray(raw.review) ? raw.review.filter(r => r && r.key && r.qid) : [];
  s.entries = Array.isArray(raw.entries)
    ? raw.entries.filter(e => e && typeof e.text === 'string' && ['note', 'aha', 'question'].includes(e.type))
    : [];
  s.draft = { ...base.draft, ...(raw.draft && typeof raw.draft === 'object' ? raw.draft : {}) };
  for (const k of DRAFT_SECTIONS) if (typeof s.draft[k] !== 'string') s.draft[k] = '';
  if (!['auto', 'light', 'dark'].includes(s.theme)) s.theme = 'auto';
  if (s.lang !== null && !['ja', 'en'].includes(s.lang)) s.lang = null;
  return s;
}

let idCounter = 0;
export function newId() { idCounter += 1; return `${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }

export function createStore(backend = safeBackend()) {
  let state;
  try { state = normalize(JSON.parse(backend.getItem(STORAGE_KEY) || 'null')); } catch { state = emptyState(); }
  const listeners = new Set();
  const save = () => {
    try { backend.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota or private mode: keep in memory */ }
    listeners.forEach(fn => fn(state));
  };
  const lessonState = key => (state.progress[key] ||= { done: false, steps: {}, quiz: null, practice: '', updatedAt: null });

  return {
    get state() { return state; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    setPref(k, v) { state[k] = v; save(); },

    lesson(key) { return state.progress[key] || { done: false, steps: {}, quiz: null, practice: '' }; },
    markStep(key, step) { const l = lessonState(key); l.steps[step] = true; l.updatedAt = new Date().toISOString(); state.lastLesson = key; save(); },
    setPractice(key, text) { const l = lessonState(key); l.practice = text; l.steps.practice = true; l.updatedAt = new Date().toISOString(); save(); },
    complete(key) { const l = lessonState(key); l.done = true; l.updatedAt = new Date().toISOString(); state.lastLesson = key; save(); },
    uncomplete(key) { const l = lessonState(key); l.done = false; save(); },

    /** Record quiz results. `results` = [{ qid, correct }]. Wrong answers enter the review queue. */
    recordQuiz(key, results) {
      const l = lessonState(key);
      const score = results.filter(r => r.correct).length;
      l.quiz = { score, total: results.length, at: new Date().toISOString() };
      l.steps.check = true;
      for (const r of results) {
        const i = state.review.findIndex(x => x.key === key && x.qid === r.qid);
        if (!r.correct && i < 0) state.review.push({ key, qid: r.qid });
        if (r.correct && i >= 0) state.review.splice(i, 1);
      }
      save();
      return l.quiz;
    },
    resolveReview(key, qid, correct) {
      const i = state.review.findIndex(x => x.key === key && x.qid === qid);
      if (correct && i >= 0) { state.review.splice(i, 1); save(); }
    },

    addEntry(type, text, key = null) {
      const e = { id: newId(), type, text: text.trim(), key, resolved: false, at: new Date().toISOString() };
      if (!e.text) return null;
      state.entries.unshift(e); save(); return e;
    },
    updateEntry(id, patch) { const e = state.entries.find(x => x.id === id); if (e) { Object.assign(e, patch); save(); } },
    deleteEntry(id) { state.entries = state.entries.filter(x => x.id !== id); save(); },

    setDraft(section, text) { if (DRAFT_SECTIONS.includes(section)) { state.draft[section] = text; save(); } },
    appendDraft(section, text, label = '') {
      if (!DRAFT_SECTIONS.includes(section) || !text.trim()) return;
      const block = label ? `<!-- ${label} -->\n${text.trim()}` : text.trim();
      // Replace an earlier block from the same lesson instead of duplicating it.
      if (label) {
        const re = new RegExp(`<!-- ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} -->\\n[\\s\\S]*?(?=\\n\\n<!-- |$)`);
        if (re.test(state.draft[section])) { state.draft[section] = state.draft[section].replace(re, block); save(); return; }
      }
      state.draft[section] = state.draft[section] ? `${state.draft[section]}\n\n${block}` : block;
      save();
    },

    importState(raw) { state = normalize(raw); save(); },
    reset() { const lang = state.lang, theme = state.theme; state = emptyState(); state.lang = lang; state.theme = theme; save(); },
  };
}

// ---------- Derived progress (pure) ----------

export function courseProgress(course, progress) {
  const total = course.lessons.length;
  const done = course.lessons.filter(l => progress[`${course.id}/${l.id}`]?.done).length;
  let qs = 0, qt = 0;
  for (const l of course.lessons) { const q = progress[`${course.id}/${l.id}`]?.quiz; if (q) { qs += q.score; qt += q.total; } }
  const started = course.lessons.some(l => { const p = progress[`${course.id}/${l.id}`]; return p && (p.done || Object.keys(p.steps || {}).length); });
  return { done, total, ratio: total ? done / total : 0, mastery: qt ? qs / qt : null, started };
}

export function sectionProgress(courses, section, progress) {
  const cs = courses.filter(c => c.section === section);
  const total = cs.reduce((a, c) => a + c.lessons.length, 0);
  const done = cs.reduce((a, c) => a + courseProgress(c, progress).done, 0);
  return { done, total, ratio: total ? done / total : 0 };
}

/** Next lesson to study: first incomplete lesson of the last-touched course, else first incomplete in curriculum order (prep → core). */
export function nextLesson(lessons, state) {
  const incomplete = x => !state.progress[x.key]?.done;
  if (state.lastLesson) {
    const last = lessons.find(x => x.key === state.lastLesson);
    if (last) {
      if (incomplete(last)) return last;
      const same = lessons.find(x => x.course.id === last.course.id && incomplete(x));
      if (same) return same;
    }
  }
  return lessons.find(x => x.course.section !== 'elective' && incomplete(x)) || lessons.find(incomplete) || null;
}

/** Research pipeline milestones derived from progress + draft. */
export function pipelineStatus(state) {
  const done = k => !!state.progress[k]?.done;
  const theory = ['p1/p1-1', 'c1/c1-1', 'c2/c2-2'].filter(done).length / 3;
  const replicate = ['c3/c3-3', 'c4/c4-2', 'c7/c7-3'].filter(done).length / 3;
  const hypothesis = ['c6/c6-2', 'c9/c9-1', 'c9/c9-2'].filter(done).length / 3;
  const d = state.draft;
  const draft = ['abstract', 'introduction', 'methods', 'discussion'].filter(s => (d[s] || '').trim().length > 40).length / 4;
  return { theory, replicate, hypothesis, draft };
}
