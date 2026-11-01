// Learner records. Pure logic + a pluggable storage backend (localStorage in the browser,
// an in-memory map in tests).

export const STORAGE_KEY = 'neuroatlas.v2';
export const DRAFT_SECTIONS = ['title', 'abstract', 'introduction', 'methods', 'results', 'discussion', 'references'];
export const INTERVALS_DAYS = [1, 3, 7, 14, 30];
const DAY = 86400000;

export function emptyState() {
  return {
    version: 2,
    lang: null,
    scores: {},     // { [questionId]: { attempts, correct, last, streak, due } }   (due = ms timestamp)
    tasks: {},      // { [questionId]: { text, done, at } }   research tasks
    bookmarks: {},  // { [questionId]: true }
    entries: [],    // [{ id, type: 'note'|'aha'|'question', text, qid, resolved, at }]
    draft: Object.fromEntries(DRAFT_SECTIONS.map(s => [s, ''])),
  };
}

function memoryBackend() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}
function safeBackend() {
  try { const ls = globalThis.localStorage; ls.setItem('__na', '1'); ls.removeItem('__na'); return ls; }
  catch { return memoryBackend(); }
}

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

/** Coerce unknown data (storage, imported backups) into a valid state. */
export function normalize(raw) {
  const s = emptyState();
  if (!isObj(raw)) return s;
  if (['ja', 'en'].includes(raw.lang)) s.lang = raw.lang;
  if (isObj(raw.scores)) for (const [k, v] of Object.entries(raw.scores)) if (isObj(v) && Number.isFinite(v.attempts)) s.scores[k] = v;
  if (isObj(raw.tasks)) for (const [k, v] of Object.entries(raw.tasks)) if (isObj(v)) s.tasks[k] = { text: String(v.text || ''), done: !!v.done, at: v.at || null };
  if (isObj(raw.bookmarks)) for (const [k, v] of Object.entries(raw.bookmarks)) if (v) s.bookmarks[k] = true;
  if (Array.isArray(raw.entries)) s.entries = raw.entries.filter(e => isObj(e) && typeof e.text === 'string' && ['note', 'aha', 'question'].includes(e.type));
  if (isObj(raw.draft)) for (const k of DRAFT_SECTIONS) if (typeof raw.draft[k] === 'string') s.draft[k] = raw.draft[k];
  return s;
}

let idCounter = 0;
const newId = () => `${Date.now().toString(36)}-${(++idCounter).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function createStore(backend = safeBackend(), now = () => Date.now()) {
  let state;
  try { state = normalize(JSON.parse(backend.getItem(STORAGE_KEY) || 'null')); } catch { state = emptyState(); }
  const save = () => { try { backend.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode / quota: keep in memory */ } };

  return {
    get state() { return state; },
    setLang(l) { state.lang = l; save(); },

    score(qid) { return state.scores[qid] || { attempts: 0, correct: 0, last: null, streak: 0, due: null }; },
    /** Record an answer. Wrong → due now. Right → due after 1/3/7/14/30 days depending on the streak. */
    record(qid, ok) {
      const s = this.score(qid);
      const streak = ok ? s.streak + 1 : 0;
      state.scores[qid] = {
        attempts: s.attempts + 1, correct: s.correct + (ok ? 1 : 0), last: ok, streak,
        due: now() + (ok ? INTERVALS_DAYS[Math.min(streak - 1, INTERVALS_DAYS.length - 1)] * DAY : 0),
      };
      save();
      return state.scores[qid];
    },

    /** Research tasks are never "due"; saving or skipping both move the flow on. */
    saveTask(qid, text, done) {
      state.tasks[qid] = { text, done, at: new Date(now()).toISOString() };
      const s = this.score(qid);
      state.scores[qid] = { attempts: s.attempts + 1, correct: s.correct + (done ? 1 : 0), last: done, streak: 0, due: null, task: true };
      save();
    },

    toggleBookmark(qid) { if (state.bookmarks[qid]) delete state.bookmarks[qid]; else state.bookmarks[qid] = true; save(); return !!state.bookmarks[qid]; },

    addEntry(type, text, qid = null) {
      const t = text.trim(); if (!t) return null;
      const e = { id: newId(), type, text: t, qid, resolved: false, at: new Date(now()).toISOString() };
      state.entries.unshift(e); save(); return e;
    },
    updateEntry(id, patch) { const e = state.entries.find(x => x.id === id); if (e) { Object.assign(e, patch); save(); } },
    deleteEntry(id) { state.entries = state.entries.filter(x => x.id !== id); save(); },

    setDraft(section, text) { if (DRAFT_SECTIONS.includes(section)) { state.draft[section] = text; save(); } },
    /** Add a labelled block to a draft section; a later answer from the same task replaces its block. */
    appendDraft(section, text, label) {
      if (!DRAFT_SECTIONS.includes(section) || !text.trim()) return;
      const block = `<!-- ${label} -->\n${text.trim()}`;
      const re = new RegExp(`<!-- ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} -->\\n[\\s\\S]*?(?=\\n\\n<!-- |$)`);
      const cur = state.draft[section];
      state.draft[section] = re.test(cur) ? cur.replace(re, block) : (cur ? `${cur}\n\n${block}` : block);
      save();
    },

    importState(raw) { const lang = state.lang; state = normalize(raw); state.lang = lang; save(); },
    reset() { const lang = state.lang; state = emptyState(); state.lang = lang; save(); },
  };
}

// ---------- derived (pure) ----------
export const attempted = (state, q) => (state.scores[q.id]?.attempts || 0) > 0;

/** Choice questions whose review date has come. Tasks never come back. */
export function dueQuestions(questions, state, t = Date.now()) {
  return questions.filter(q => q.type === 'choice' && state.scores[q.id] && state.scores[q.id].due <= t);
}

/** First unanswered question in curriculum order (prep → core → electives), with its course's remaining count. */
export function nextUp(courses, state) {
  for (const c of courses) {
    const left = c.questions.filter(q => !attempted(state, q));
    if (left.length) return { course: c, question: left[0], left };
  }
  return null;
}

export function courseStats(course, state) {
  const total = course.questions.length;
  const done = course.questions.filter(q => attempted(state, q)).length;
  let a = 0, c = 0;
  for (const q of course.questions) { const s = state.scores[q.id]; if (s && q.type === 'choice') { a += s.attempts; c += s.correct; } }
  return { done, total, ratio: total ? done / total : 0, accuracy: a ? c / a : null };
}

export function overall(questions, state) {
  let a = 0, c = 0, n = 0;
  for (const q of questions) { const s = state.scores[q.id]; if (s?.attempts) { n++; if (q.type === 'choice') { a += s.attempts; c += s.correct; } } }
  return { answered: n, total: questions.length, accuracy: a ? c / a : null };
}

/** Has the learner already worked on another question in this unit? Then the concept card starts collapsed. */
export function unitSeen(questions, state, q) {
  return questions.some(x => x.unit === q.unit && x.id !== q.id && attempted(state, x));
}
