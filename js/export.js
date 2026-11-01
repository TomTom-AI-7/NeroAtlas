// Export the research notebook. Builders are pure (testable); download() touches the DOM.

const TYPE_LABEL = {
  note: { ja: '研究メモ', en: 'Research notes' },
  aha: { ja: 'アハ体験', en: 'Aha moments' },
  question: { ja: '疑問', en: 'Questions' },
};
const DRAFT_LABEL = { abstract: 'Abstract', introduction: 'Introduction', methods: 'Methods', results: 'Results', discussion: 'Discussion', references: 'References' };
const stripMarkers = s => (s || '').replace(/<!-- [^>]* -->\n?/g, '').trim();

/** "C2 · FFT & PSD" for a question id, using the course list. */
export function questionLabel(qid, courses, lang = 'ja') {
  for (const c of courses) {
    const q = c.questions.find(x => x.id === qid);
    if (q) return `${c.code} · ${q.topic[lang] || q.topic.ja}`;
  }
  return '';
}

export function buildMarkdown(state, courses, lang = 'ja') {
  const L = o => o[lang] || o.ja;
  const ja = lang === 'ja';
  const all = courses.flatMap(c => c.questions);
  const answered = all.filter(q => state.scores[q.id]?.attempts).length;
  const out = ['# NeuroAtlas Research Notebook', '', `_Exported ${new Date().toISOString().slice(0, 10)}_`, '',
    `## ${ja ? '進捗' : 'Progress'}`, '', `${answered} / ${all.length} ${ja ? '問に回答' : 'questions attempted'}`, ''];

  for (const type of ['note', 'aha', 'question']) {
    const es = state.entries.filter(e => e.type === type);
    out.push(`## ${L(TYPE_LABEL[type])} (${es.length})`, '');
    if (!es.length) out.push('_—_', '');
    for (const e of es) {
      const where = e.qid ? ` — ${questionLabel(e.qid, courses, lang)}` : '';
      const box = type === 'question' ? (e.resolved ? '[x] ' : '[ ] ') : '';
      out.push(`- ${box}**${e.at.slice(0, 10)}**${where}`, ...e.text.split('\n').map(l => `  ${l}`));
    }
    out.push('');
  }

  out.push(`## ${ja ? '研究課題' : 'Research tasks'}`, '');
  const tasks = all.filter(q => q.type === 'task' && state.tasks[q.id]);
  if (!tasks.length) out.push('_—_', '');
  for (const q of tasks) {
    const t = state.tasks[q.id];
    out.push(`### ${questionLabel(q.id, courses, lang)}${t.done ? '' : (ja ? '（未提出）' : ' (not done)')}`, '', (t.text || '').trim() || '_—_', '');
  }

  out.push(`## ${ja ? '論文草稿' : 'Paper draft'}`, '', '### Title', '', stripMarkers(state.draft.title) || '_—_', '');
  for (const [k, label] of Object.entries(DRAFT_LABEL)) out.push(`### ${label}`, '', stripMarkers(state.draft[k]) || '_—_', '');
  return out.join('\n');
}

export function buildProposal(state) {
  const d = state.draft, s = k => stripMarkers(d[k]) || '_(to be written)_';
  return [`# ${stripMarkers(d.title) || 'Research Proposal (draft)'}`, '',
    '## Background & Gap', '', s('introduction'), '',
    '## Research Question & Hypothesis / Data & Methods', '', s('methods'), '',
    '## Expected Results & Risks', '', s('discussion'), '',
    '## Summary (Abstract)', '', s('abstract'), '',
    '## Timeline', '', '_(fill in)_', '',
    '## Why this lab', '', '_(fill in after reading the lab’s recent papers)_', ''].join('\n');
}

const csvCell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function buildCsv(state, courses, lang = 'ja') {
  const rows = [['id', 'type', 'date', 'question', 'resolved', 'text']];
  for (const e of state.entries) rows.push([e.id, e.type, e.at, e.qid ? questionLabel(e.qid, courses, lang) : '', e.type === 'question' ? String(!!e.resolved) : '', e.text]);
  return '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n'); // BOM so Excel reads UTF-8 Japanese
}

export function buildJson(state) {
  return JSON.stringify({ app: 'NeuroAtlas', exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function download(filename, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
