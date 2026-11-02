import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, normalize, nextUp, dueQuestions, courseStats, overall, unitSeen, STORAGE_KEY } from '../js/store.js';
import { buildMarkdown, buildCsv, buildJson, buildProposal } from '../js/export.js';
import { COURSES, QUESTIONS, COURSE_MAP } from '../content/index.js';

const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k), m }; };
const DAY = 86400000;

test('records persist across store instances', () => {
  const b = mem();
  const s1 = createStore(b); s1.record('p1-1-q1', true); s1.addEntry('aha', 'EEG sees synchrony', 'p1-1-q1');
  const s2 = createStore(b);
  assert.equal(s2.state.scores['p1-1-q1'].correct, 1);
  assert.equal(s2.state.entries[0].qid, 'p1-1-q1');
  assert.ok(b.m.has(STORAGE_KEY));
});

test('corrupt storage falls back to an empty state', () => {
  const b = mem(); b.setItem(STORAGE_KEY, '{oops');
  assert.deepEqual(createStore(b).state.scores, {});
});

test('spaced repetition: wrong is due now, right waits 1, 3, 7, 14, 30 days', () => {
  let t = 1_000_000;
  const s = createStore(mem(), () => t);
  s.record('x', false); assert.equal(s.state.scores.x.due, t);
  const gaps = [];
  for (let i = 0; i < 6; i++) { s.record('x', true); gaps.push((s.state.scores.x.due - t) / DAY); }
  assert.deepEqual(gaps, [1, 3, 7, 14, 30, 30]);
  s.record('x', false); assert.equal(s.state.scores.x.streak, 0);
});

test('Continue points at the first unanswered question, in curriculum order', () => {
  const s = createStore(mem());
  assert.equal(nextUp(COURSES, s.state).question.id, QUESTIONS[0].id);
  s.record(QUESTIONS[0].id, true);
  const nx = nextUp(COURSES, s.state);
  assert.equal(nx.question.id, QUESTIONS[1].id);
  assert.equal(nx.left.length, COURSE_MAP.p1.questions.length - 1);
});

test('tasks move the flow on but never come back for review', () => {
  const t0 = 5 * DAY, s = createStore(mem(), () => t0);
  const task = QUESTIONS.find(q => q.type === 'task');
  s.saveTask(task.id, 'my answer', false);
  assert.equal(s.state.tasks[task.id].done, false);
  assert.notEqual(nextUp(COURSES, s.state)?.question.id, task.id);
  s.record(QUESTIONS[0].id, false);
  const due = dueQuestions(QUESTIONS, s.state, t0 + 100 * DAY).map(q => q.id);
  assert.deepEqual(due, [QUESTIONS[0].id]);
});

test('concept card folds once another question in the unit was answered', () => {
  const s = createStore(mem());
  const [a, b] = QUESTIONS;
  assert.equal(unitSeen(QUESTIONS, s.state, b), false);
  s.record(a.id, true);
  assert.equal(unitSeen(QUESTIONS, s.state, b), true);
  assert.equal(unitSeen(QUESTIONS, s.state, a), false);
});

test('stats', () => {
  const s = createStore(mem());
  s.record('p1-1-q1', true); s.record('p1-1-q2', false);
  const cs = courseStats(COURSE_MAP.p1, s.state);
  assert.equal(cs.done, 2); assert.equal(cs.accuracy, 0.5);
  assert.equal(overall(QUESTIONS, s.state).answered, 2);
});

test('bookmarks toggle; empty entries are ignored', () => {
  const s = createStore(mem());
  assert.equal(s.toggleBookmark('q'), true); assert.equal(s.toggleBookmark('q'), false);
  assert.equal(s.addEntry('note', '  '), null);
});

test('appendDraft replaces the block from the same task instead of duplicating', () => {
  const s = createStore(mem());
  s.appendDraft('methods', 'v1', 'C3 c3-2'); s.appendDraft('methods', 'other', 'C6 c6-2'); s.appendDraft('methods', 'v2', 'C3 c3-2');
  assert.equal(s.state.draft.methods, '<!-- C3 c3-2 -->\nv2\n\n<!-- C6 c6-2 -->\nother');
});

test('normalize drops invalid data and export metadata', () => {
  const n = normalize({ app: 'NeuroAtlas', lang: 'fr', scores: { a: { attempts: 1 }, b: 'x' }, entries: [{ type: 'bogus', text: 'x' }, { type: 'note', text: 'ok' }], draft: { methods: 3 } });
  assert.equal(n.lang, null); assert.deepEqual(Object.keys(n.scores), ['a']); assert.equal(n.entries.length, 1);
  assert.equal(n.draft.methods, ''); assert.equal(n.app, undefined);
});

test('exports contain notes, tasks and draft; CSV is escaped; backup round-trips', () => {
  const s = createStore(mem());
  s.addEntry('note', 'Line1\n"quoted", comma', 'c2-2-q1');
  const task = COURSE_MAP.c1.questions.find(q => q.type === 'task');
  s.saveTask(task.id, 'Can: timing', true);
  s.appendDraft('abstract', 'We test X.', 'C8 c8-3'); s.setDraft('title', 'Alpha and BDI-II');
  const md = buildMarkdown(s.state, COURSES, 'en');
  assert.match(md, /## Notes \(1\)/); assert.match(md, /- \*\*\d{4}-/); assert.match(md, /C2 · /); assert.match(md, /Can: timing/);
  assert.match(md, /### Abstract\n\nWe test X\./); assert.ok(!md.includes('<!--'));
  const csv = buildCsv(s.state, COURSES, 'en');
  assert.ok(csv.startsWith('﻿')); assert.ok(csv.includes('"Line1\n""quoted"", comma"'));
  const back = normalize(JSON.parse(buildJson(s.state)));
  assert.equal(back.entries.length, 1); assert.equal(back.tasks[task.id].text, 'Can: timing');
  assert.match(buildProposal(s.state), /^# Alpha and BDI-II/);
});
