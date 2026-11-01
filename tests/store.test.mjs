import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, normalize, courseProgress, nextLesson, pipelineStatus, STORAGE_KEY } from '../js/store.js';
import { buildMarkdown, buildCsv, buildJson, buildProposal } from '../js/export.js';
import { LESSONS, COURSE_MAP } from '../content/index.js';

const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k), m }; };

test('state persists across store instances', () => {
  const b = mem();
  const s1 = createStore(b); s1.complete('p1/p1-1'); s1.addEntry('aha', 'EEG sees synchrony', 'p1/p1-1');
  const s2 = createStore(b);
  assert.equal(s2.state.progress['p1/p1-1'].done, true);
  assert.equal(s2.state.entries[0].text, 'EEG sees synchrony');
  assert.ok(b.m.has(STORAGE_KEY));
});

test('corrupt storage falls back to an empty state', () => {
  const b = mem(); b.setItem(STORAGE_KEY, '{not json');
  assert.deepEqual(createStore(b).state.entries, []);
});

test('wrong answers enter the review queue and leave when corrected', () => {
  const s = createStore(mem());
  s.recordQuiz('c4/c4-2', [{ qid: 'q1', correct: false }, { qid: 'q2', correct: true }]);
  assert.deepEqual(s.state.review, [{ key: 'c4/c4-2', qid: 'q1' }]);
  s.recordQuiz('c4/c4-2', [{ qid: 'q1', correct: false }, { qid: 'q2', correct: true }]);
  assert.equal(s.state.review.length, 1, 'no duplicates');
  s.resolveReview('c4/c4-2', 'q1', true);
  assert.equal(s.state.review.length, 0);
  assert.deepEqual(s.state.progress['c4/c4-2'].quiz.score, 1);
});

test('empty entries are ignored; entries can be resolved and deleted', () => {
  const s = createStore(mem());
  assert.equal(s.addEntry('note', '   '), null);
  const e = s.addEntry('question', 'What is 1/f?');
  s.updateEntry(e.id, { resolved: true }); assert.equal(s.state.entries[0].resolved, true);
  s.deleteEntry(e.id); assert.equal(s.state.entries.length, 0);
});

test('appendDraft replaces the block from the same lesson instead of duplicating', () => {
  const s = createStore(mem());
  s.appendDraft('methods', 'v1', 'C3 c3-2');
  s.appendDraft('methods', 'other', 'C6 c6-2');
  s.appendDraft('methods', 'v2', 'C3 c3-2');
  assert.equal(s.state.draft.methods, '<!-- C3 c3-2 -->\nv2\n\n<!-- C6 c6-2 -->\nother');
});

test('normalize drops invalid data and export metadata', () => {
  const n = normalize({ app: 'NeuroAtlas', exportedAt: 'x', theme: 'neon', lang: 'fr', entries: [{ type: 'bogus', text: 'x' }, { type: 'note', text: 'ok' }], draft: { methods: 3 } });
  assert.equal(n.theme, 'auto'); assert.equal(n.lang, null); assert.equal(n.entries.length, 1); assert.equal(n.draft.methods, '');
  assert.equal(n.app, undefined); assert.equal(n.exportedAt, undefined);
});

test('progress helpers', () => {
  const s = createStore(mem());
  assert.equal(nextLesson(LESSONS, s.state).key, 'p1/p1-1');
  s.complete('p1/p1-1'); s.markStep('p1/p1-2', 'concept');
  assert.equal(nextLesson(LESSONS, s.state).key, 'p1/p1-2');
  const cp = courseProgress(COURSE_MAP.p1, s.state.progress);
  assert.equal(cp.done, 1); assert.equal(cp.total, 3); assert.equal(cp.started, true);
  s.setDraft('abstract', 'x'.repeat(50));
  assert.equal(pipelineStatus(s.state).draft, 0.25);
});

test('exports contain notes, practice work and draft; CSV is escaped', () => {
  const s = createStore(mem());
  s.addEntry('question', 'Line1\n"quoted", comma', 'c2/c2-2');
  s.setPractice('c1/c1-1', 'Can: timing');
  s.appendDraft('abstract', 'We test X.', 'C8 c8-3');
  s.setDraft('title', 'Alpha and BDI-II');
  const md = buildMarkdown(s.state, LESSONS, 'en');
  assert.match(md, /## Questions \(1\)/); assert.match(md, /- \[ \] \*\*/); assert.match(md, /Can: timing/);
  assert.match(md, /### Abstract\n\nWe test X\./); assert.ok(!md.includes('<!--'), 'markers stripped');
  const csv = buildCsv(s.state, LESSONS, 'en');
  assert.ok(csv.startsWith('﻿'));
  assert.ok(csv.includes('"Line1\n""quoted"", comma"'));
  const back = normalize(JSON.parse(buildJson(s.state)));
  assert.equal(back.entries.length, 1); assert.equal(back.draft.title, 'Alpha and BDI-II');
  assert.match(buildProposal(s.state), /^# Alpha and BDI-II/);
});
