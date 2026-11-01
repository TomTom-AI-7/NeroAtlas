import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { COURSES, SECTIONS, RESOURCES, RESOURCE_MAP, COURSE_MAP, QUESTIONS, UNITS } from '../content/index.js';
const LESSONS = COURSES.flatMap(c => c.lessons.map(lesson => ({ course: c, lesson })));
import { WIDGET_IDS } from '../js/widgets/index.js';
import { UI_STRINGS } from '../js/i18n.js';

const bilingual = (o, where) => {
  assert.ok(o && typeof o === 'object', `${where}: missing`);
  assert.ok(typeof o.ja === 'string' && o.ja.trim(), `${where}: missing ja`);
  assert.ok(typeof o.en === 'string' && o.en.trim(), `${where}: missing en`);
};

test('three sections, each with courses', () => {
  assert.deepEqual(SECTIONS.map(s => s.id), ['prep', 'core', 'elective']);
  for (const s of SECTIONS) assert.ok(COURSES.some(c => c.section === s.id), s.id);
});

test('ids are unique', () => {
  const ids = COURSES.map(c => c.id); assert.equal(new Set(ids).size, ids.length);
  const lids = LESSONS.map(l => l.lesson.id); assert.equal(new Set(lids).size, lids.length);
  const rids = RESOURCES.map(r => r.id); assert.equal(new Set(rids).size, rids.length);
});

test('courses are complete and bilingual', () => {
  for (const c of COURSES) {
    const w = c.id;
    bilingual(c.title, `${w}.title`); bilingual(c.summary, `${w}.summary`); bilingual(c.deliverable, `${w}.deliverable`);
    assert.ok(c.goals.length, `${w}: goals`); c.goals.forEach((g, i) => bilingual(g, `${w}.goals[${i}]`));
    assert.ok(c.lessons.length, `${w}: lessons`);
    for (const id of [...c.prereq, ...c.next]) assert.ok(COURSE_MAP[id], `${w}: unknown course ref ${id}`);
    for (const id of c.resources) assert.ok(RESOURCE_MAP[id], `${w}: unknown resource ${id}`);
  }
});

test('lessons have all five learning parts', () => {
  for (const { course, lesson: l } of LESSONS) {
    const w = `${course.id}/${l.id}`;
    bilingual(l.title, `${w}.title`);
    assert.ok(Array.isArray(l.concept.ja) && l.concept.ja.length, `${w}: concept.ja`);
    assert.equal(l.concept.ja.length, l.concept.en.length, `${w}: concept paragraph count ja/en`);
    if (l.visual) { assert.ok(WIDGET_IDS.includes(l.visual.widget), `${w}: unknown widget ${l.visual.widget}`); if (l.visual.caption) bilingual(l.visual.caption, `${w}.visual.caption`); }
    bilingual(l.practice.task, `${w}.practice.task`); bilingual(l.practice.prompt, `${w}.practice.prompt`);
    if (l.practice.draftSection) assert.ok(['abstract', 'introduction', 'methods', 'results', 'discussion'].includes(l.practice.draftSection), `${w}: draftSection`);
    assert.ok(l.quiz.length >= 1, `${w}: quiz`);
    const qids = l.quiz.map(q => q.id); assert.equal(new Set(qids).size, qids.length, `${w}: duplicate qid`);
    for (const q of l.quiz) {
      bilingual(q.q, `${w}.${q.id}.q`); bilingual(q.explain, `${w}.${q.id}.explain`);
      assert.ok(q.options.length >= 2, `${w}.${q.id}: options`); q.options.forEach((o, i) => bilingual(o, `${w}.${q.id}.opt${i}`));
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${w}.${q.id}: answer index`);
    }
    bilingual(l.reflect, `${w}.reflect`);
  }
});

test('core path covers the required progression', () => {
  const core = COURSES.filter(c => c.section === 'core').map(c => c.id);
  assert.deepEqual(core, ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']);
});

test('prerequisite graph has no cycles', () => {
  const seen = new Set(), stack = new Set();
  const visit = id => { if (stack.has(id)) throw new Error('cycle at ' + id); if (seen.has(id)) return; stack.add(id); COURSE_MAP[id].prereq.forEach(visit); stack.delete(id); seen.add(id); };
  COURSES.forEach(c => visit(c.id));
});

test('resources: https links, known access types, personal Drive files flagged', () => {
  const access = ['free', 'audit', 'paid', 'subscription', 'open-access', 'personal'];
  for (const r of RESOURCES) {
    assert.match(r.url, /^https:\/\//, r.id); assert.ok(access.includes(r.access), r.id); bilingual(r.note, r.id);
    assert.ok(UI_STRINGS['access_' + r.access] && UI_STRINGS['type_' + r.type], `${r.id}: missing UI label`);
    if (r.type === 'drive') assert.equal(r.access, 'personal', `${r.id}: Drive files must be marked personal`);
  }
});

test('UI strings are bilingual', () => { for (const [k, v] of Object.entries(UI_STRINGS)) bilingual(v, `ui.${k}`); });

test('service worker shell lists only existing files and every JS module', async () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  const files = [...sw.matchAll(/'([^']+\.(?:js|css|html|svg|webmanifest))'/g)].map(m => m[1]);
  for (const f of files) assert.ok(existsSync(new URL('../' + f, import.meta.url)), `sw.js lists missing ${f}`);
  const { readdirSync } = await import('node:fs');
  for (const dir of ['js', 'js/views', 'js/widgets', 'content']) {
    for (const f of readdirSync(new URL('../' + dir, import.meta.url)).filter(f => f.endsWith('.js'))) assert.ok(files.includes(`${dir}/${f}`), `sw.js missing ${dir}/${f}`);
  }
});

test('every lesson becomes a unit: concept card, its questions, then one research task', () => {
  assert.equal(UNITS.length, LESSONS.length);
  for (const u of UNITS) {
    assert.ok(u.lead.ja && u.lead.en, u.id);
    assert.equal(u.questions.at(-1).type, 'task', `${u.id}: task last`);
    assert.ok(u.questions.slice(0, -1).every(q => q.type === 'choice'), `${u.id}: checks first`);
    for (const q of u.questions) { assert.equal(q.unit, u.id); assert.equal(q.course, u.course); }
  }
  const ids = QUESTIONS.map(q => q.id); assert.equal(new Set(ids).size, ids.length, 'question ids unique');
  assert.equal(QUESTIONS[0].course, 'p1', 'study order starts with Prep');
});
