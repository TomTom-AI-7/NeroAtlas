// Content registry. Courses are authored as lessons (content/*.js); here each lesson becomes a
// UNIT = concept card (figure first) → knowledge-check questions → one research task.
// The study flow walks units in curriculum order, one question at a time.
import { PREP } from './prep.js';
import { CORE_A } from './core-a.js';
import { CORE_B } from './core-b.js';
import { ELECTIVES } from './electives.js';
export { RESOURCES, RESOURCE_MAP } from './resources.js';

export const SECTIONS = [
  { id: 'prep', label: { ja: 'プレップ', en: 'Prep' }, desc: { ja: '基礎・準備', en: 'Foundations' } },
  { id: 'core', label: { ja: 'コア', en: 'Core' }, desc: { ja: '必修', en: 'Required' } },
  { id: 'elective', label: { ja: '選択', en: 'Elective' }, desc: { ja: '研究の方向に合わせて', en: 'Match your direction' } },
];

function toUnit(course, l) {
  const ja = l.concept.ja, en = l.concept.en;
  const base = { course: course.id, unit: l.id, topic: l.title };
  const questions = l.quiz.map(q => ({ ...base, ...q, id: `${l.id}-${q.id}`, type: 'choice' }));
  const p = l.practice;
  questions.push({
    ...base, id: `${l.id}-task`, type: 'task',
    task: p.task, prompt: p.prompt, code: p.code || null, packages: p.packages || null,
    draftSection: p.draftSection || null, wordTarget: p.wordTarget || null, reflect: l.reflect,
  });
  return {
    id: l.id, course: course.id, title: l.title,
    figure: l.visual || null,
    lead: { ja: ja[0], en: en[0] },
    points: ja.slice(1).map((s, i) => ({ ja: s, en: en[i + 1] })),
    keywords: l.keywords || [],
    questions,
  };
}

export const COURSES = [...PREP, ...CORE_A, ...CORE_B, ...ELECTIVES].map(c => {
  const units = c.lessons.map(l => toUnit(c, l));
  return { ...c, units, questions: units.flatMap(u => u.questions) };
});
export const COURSE_MAP = Object.fromEntries(COURSES.map(c => [c.id, c]));
export const UNITS = COURSES.flatMap(c => c.units);
export const UNIT_MAP = Object.fromEntries(UNITS.map(u => [u.id, u]));
/** Every question in study order: prep → core → electives, unit by unit. */
export const QUESTIONS = COURSES.flatMap(c => c.questions);
export const QUESTION_MAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
