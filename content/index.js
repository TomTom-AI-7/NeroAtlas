// Content registry. Add a course by appending to one of the section arrays.
import { PREP } from './prep.js';
import { CORE_A } from './core-a.js';
import { CORE_B } from './core-b.js';
import { ELECTIVES } from './electives.js';
export { RESOURCES, RESOURCE_MAP } from './resources.js';

export const SECTIONS = [
  { id: 'prep', label: { ja: 'プレップ（基礎・準備）', en: 'Prep (Foundations)' },
    short: { ja: 'プレップ', en: 'Prep' },
    desc: { ja: 'コアに入る前の土台：神経科学・数学/Python・研究リテラシー', en: 'Groundwork before Core: neuroscience, math/Python, research literacy' } },
  { id: 'core', label: { ja: 'コア（必須）', en: 'Core (Required)' },
    short: { ja: 'コア', en: 'Core' },
    desc: { ja: 'EEG計測 → 信号処理 → 実データ → 機械学習 → 精神医学 → 研究手法 → 論文読解・再現 → 英語執筆 → 独自研究', en: 'Measurement → signals → real data → ML → psychiatry → methods → replication → writing → original research' } },
  { id: 'elective', label: { ja: 'エレクティブ（選択）', en: 'Electives' },
    short: { ja: '選択', en: 'Electives' },
    desc: { ja: '研究の方向に合わせて選ぶ発展コース', en: 'Advanced options matched to your research direction' } },
];

export const COURSES = [...PREP, ...CORE_A, ...CORE_B, ...ELECTIVES];
export const COURSE_MAP = Object.fromEntries(COURSES.map(c => [c.id, c]));

export function lessonKey(courseId, lessonId) { return `${courseId}/${lessonId}`; }

/** Flat, ordered list of all lessons (core path order = prep, core, electives). */
export const LESSONS = COURSES.flatMap(c => c.lessons.map((l, i) => ({ course: c, lesson: l, index: i, key: lessonKey(c.id, l.id) })));

export function findLesson(courseId, lessonId) {
  return LESSONS.find(x => x.course.id === courseId && x.lesson.id === lessonId) || null;
}
