// Export the research notebook. Builders are pure (testable); download() touches the DOM.

const TYPE_LABEL = {
  note: { ja: '研究メモ', en: 'Research notes' },
  aha: { ja: 'アハ体験', en: 'Aha moments' },
  question: { ja: '疑問', en: 'Questions' },
};
const DRAFT_LABEL = {
  abstract: 'Abstract', introduction: 'Introduction', methods: 'Methods',
  results: 'Results', discussion: 'Discussion', references: 'References',
};

function lessonTitle(key, lessons, lang) {
  const x = lessons.find(l => l.key === key);
  if (!x) return '';
  return `${x.course.code} · ${x.lesson.title[lang] || x.lesson.title.ja}`;
}

const stripMarkers = s => (s || '').replace(/<!-- [^>]* -->\n?/g, '').trim();

export function buildMarkdown(state, lessons, lang = 'ja') {
  const L = (o) => o[lang] || o.ja;
  const date = new Date().toISOString().slice(0, 10);
  const out = [`# NeuroAtlas Research Notebook`, ``, `_Exported ${date}_`, ``];

  // Progress
  const done = lessons.filter(x => state.progress[x.key]?.done);
  out.push(`## ${lang === 'ja' ? '進捗' : 'Progress'}`, '', `${done.length} / ${lessons.length} ${lang === 'ja' ? 'レッスン完了' : 'lessons completed'}`, '');

  // Entries
  for (const type of ['note', 'aha', 'question']) {
    const es = state.entries.filter(e => e.type === type);
    out.push(`## ${L(TYPE_LABEL[type])} (${es.length})`, '');
    if (!es.length) out.push('_—_', '');
    for (const e of es) {
      const where = e.key ? ` — ${lessonTitle(e.key, lessons, lang)}` : '';
      const status = type === 'question' ? (e.resolved ? '[x] ' : '[ ] ') : '';
      out.push(`- ${status}**${e.at.slice(0, 10)}**${where}`);
      out.push(...e.text.split('\n').map(line => `  ${line}`));
    }
    out.push('');
  }

  // Practice work per lesson
  const practiced = lessons.filter(x => (state.progress[x.key]?.practice || '').trim());
  out.push(`## ${lang === 'ja' ? '演習の成果物' : 'Practice work'}`, '');
  if (!practiced.length) out.push('_—_', '');
  for (const x of practiced) {
    out.push(`### ${lessonTitle(x.key, lessons, lang)}`, '', state.progress[x.key].practice.trim(), '');
  }

  // Draft
  out.push(`## ${lang === 'ja' ? '論文草稿' : 'Paper draft'}`, '', `### Title`, '', stripMarkers(state.draft.title) || '_—_', '');
  for (const [k, label] of Object.entries(DRAFT_LABEL)) out.push(`### ${label}`, '', stripMarkers(state.draft[k]) || '_—_', '');
  return out.join('\n');
}

export function buildProposal(state) {
  const d = state.draft;
  const s = k => stripMarkers(d[k]) || '_(to be written)_';
  return [
    `# ${stripMarkers(d.title) || 'Research Proposal (draft)'}`, '',
    `## Background & Gap`, '', s('introduction'), '',
    `## Research Question & Hypothesis / Data & Methods`, '', s('methods'), '',
    `## Expected Results & Risks`, '', s('discussion'), '',
    `## Summary (Abstract)`, '', s('abstract'), '',
    `## Timeline`, '', '_(fill in)_', '',
    `## Why this lab`, '', '_(fill in after reading the lab’s recent papers)_', '',
  ].join('\n');
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(state, lessons, lang = 'ja') {
  const rows = [['id', 'type', 'date', 'course', 'lesson', 'resolved', 'text']];
  for (const e of state.entries) {
    const x = lessons.find(l => l.key === e.key);
    rows.push([e.id, e.type, e.at, x ? x.course.code : '', x ? (x.lesson.title[lang] || x.lesson.title.ja) : '', e.type === 'question' ? String(!!e.resolved) : '', e.text]);
  }
  return '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n'); // BOM so Excel opens UTF-8 Japanese correctly
}

export function buildJson(state) {
  return JSON.stringify({ app: 'NeuroAtlas', exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
