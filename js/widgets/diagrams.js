import { readout, reducedMotion } from './plot.js';

const FLOWS = {
  question: [
    { ja: '関心', en: 'Interest', d: { ja: '「うつと脳波に関係はある？」', en: '“Are depression and EEG related?”' } },
    { ja: '問い', en: 'Question', d: { ja: '何と何の関係を、誰で調べる？', en: 'Which relation, in whom?' } },
    { ja: '操作化', en: 'Operationalise', d: { ja: '閉眼後頭 alpha 相対パワー × BDI-II', en: 'Eyes-closed occipital relative alpha × BDI-II' } },
    { ja: '仮説', en: 'Hypothesis', d: { ja: 'r ≤ −0.2（年齢・性別・睡眠で調整）', en: 'r ≤ −0.2 (adjusted for age, sex, sleep)' } },
    { ja: '反証条件', en: 'Falsified if', d: { ja: '95%CI が −0.2 より上に収まる', en: '95% CI lies entirely above −0.2' } },
  ],
  mne: [
    { ja: 'ファイル', en: 'File', d: { ja: 'EDF / BDF / BIDS', en: 'EDF / BDF / BIDS' } },
    { ja: 'Raw', en: 'Raw', d: { ja: 'チャネル×時間 + info', en: 'channels × time + info' } },
    { ja: 'Annotations / Events', en: 'Annotations / Events', d: { ja: '時刻とラベル（T0/T1/T2）', en: 'times and labels (T0/T1/T2)' } },
    { ja: 'Epochs', en: 'Epochs', d: { ja: '試行×チャネル×時間', en: 'trials × channels × time' } },
    { ja: 'PSD / Evoked / 特徴量', en: 'PSD / Evoked / features', d: { ja: '解析・可視化・分類へ', en: 'to analysis, plots, decoding' } },
  ],
  csp: [
    { ja: 'Epochs (7–30 Hz)', en: 'Epochs (7–30 Hz)', d: { ja: 'バンドパス済みの試行', en: 'band-passed trials' } },
    { ja: '学習foldで CSP.fit', en: 'CSP.fit on train fold', d: { ja: '2クラスの分散比が最大の空間フィルタ', en: 'spatial filters maximising variance ratio' } },
    { ja: 'log-variance 特徴', en: 'log-variance features', d: { ja: '各フィルタ出力の対数分散', en: 'log variance of each filtered signal' } },
    { ja: 'LDA', en: 'LDA', d: { ja: '線形判別', en: 'linear discriminant' } },
    { ja: 'テストfoldで評価', en: 'Evaluate on test fold', d: { ja: '精度とチャンスレベルを報告', en: 'report accuracy and chance' } },
  ],
  reading: [
    { ja: 'パス1：10分', en: 'Pass 1: 10 min', d: { ja: 'タイトル・Abstract・図・結論', en: 'title, abstract, figures, conclusion' } },
    { ja: 'パス2：1時間', en: 'Pass 2: 1 h', d: { ja: '図表とMethodsの要点を抽出', en: 'extract figures and Methods essentials' } },
    { ja: 'パス3：数時間', en: 'Pass 3: hours', d: { ja: '再現するつもりで仮定と弱点を探す', en: 'read to replicate; hunt assumptions and weaknesses' } },
  ],
  replication: [
    { ja: '再現対象を決める', en: 'Pick a target', d: { ja: 'どの図・どの数値', en: 'which figure, which number' } },
    { ja: 'データと版', en: 'Data & version', d: { ja: 'DOI・ライセンス・README', en: 'DOI, licence, README' } },
    { ja: '環境を固定', en: 'Pin environment', d: { ja: 'requirements.txt・seed', en: 'requirements.txt, seeds' } },
    { ja: '前処理・除外', en: 'Preprocess & exclude', d: { ja: '順序・パラメータ・人数の流れ', en: 'order, parameters, participant flow' } },
    { ja: '解析と比較', en: 'Analyse & compare', d: { ja: '元論文との差を記録', en: 'log differences from original' } },
    { ja: '差の考察', en: 'Explain differences', d: { ja: '原因候補を切り分け', en: 'isolate candidate causes' } },
  ],
};

export function pipeline(el, props = {}, { L }) {
  if (props.kind === 'cv') return cvDiagram(el, L);
  const steps = FLOWS[props.kind] || FLOWS.question;
  const ol = document.createElement('ol'); ol.className = 'flow';
  steps.forEach((s, i) => {
    const li = document.createElement('li'); li.style.setProperty('--i', i);
    li.innerHTML = `<span class="flow-n">${i + 1}</span><strong>${L(s)}</strong><small>${L(s.d)}</small>`;
    ol.appendChild(li);
  });
  el.appendChild(ol);
  if (!reducedMotion()) ol.classList.add('animate');
  return () => {};
}

function cvDiagram(el, L) {
  const grid = document.createElement('div'); grid.className = 'cvgrid'; grid.setAttribute('role', 'img');
  grid.setAttribute('aria-label', L({ ja: '5分割交差検証：各行で1つの塊がテスト', en: '5-fold CV: one block per row is the test set' }));
  for (let r = 0; r < 5; r++) {
    const row = document.createElement('div'); row.className = 'cvrow';
    row.innerHTML = `<span class="cvlabel">Fold ${r + 1}</span>` + Array.from({ length: 5 }, (_, c) => `<span class="cvcell ${c === r ? 'test' : 'train'}">${c === r ? 'test' : 'train'}</span>`).join('');
    grid.appendChild(row);
  }
  el.appendChild(grid);
  const out = readout(el);
  out.textContent = L({ ja: '各 fold で、前処理（標準化・特徴選択・CSP）も train 部分だけで fit する。最終スコアは5回の平均±ばらつき。', en: 'In each fold, preprocessing (scaling, selection, CSP) is fit on the train part only. Report the mean ± spread over 5 folds.' });
  let k = 0, timer = 0;
  if (!reducedMotion()) timer = setInterval(() => { k = (k + 1) % 5; grid.querySelectorAll('.cvrow').forEach((r, i) => r.classList.toggle('active', i === k)); }, 1200);
  grid.querySelector('.cvrow').classList.add('active');
  return () => clearInterval(timer);
}

const IMRAD = [
  { id: 'I', path: 'M20,10 L280,10 L190,70 L110,70 Z', name: 'Introduction', q: { ja: 'なぜ重要？ 何が未解明？（広→狭）', en: 'Why does it matter? What is unknown? (broad → narrow)' } },
  { id: 'M', path: 'M110,74 L190,74 L190,120 L110,120 Z', name: 'Methods', q: { ja: '何を、どうやったか？（再現できる詳しさ）', en: 'What exactly did you do? (reproducible detail)' } },
  { id: 'R', path: 'M110,124 L190,124 L190,170 L110,170 Z', name: 'Results', q: { ja: '何がわかったか？（解釈は入れない）', en: 'What did you find? (no interpretation)' } },
  { id: 'D', path: 'M110,174 L190,174 L280,234 L20,234 Z', name: 'Discussion', q: { ja: '何を意味し、限界は？（狭→広）', en: 'What does it mean, and what are the limits? (narrow → broad)' } },
];
export function imrad(el, _p, { L }) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 300 244'); svg.classList.add('viz-svg', 'imrad');
  const out = readout(el);
  IMRAD.forEach((s, i) => {
    const g = document.createElementNS(ns, 'g'); g.classList.add('imrad-part', `r${i}`); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', s.name);
    const cy = [40, 97, 147, 210][i];
    g.innerHTML = `<path d="${s.path}"/><text x="150" y="${cy + 5}" text-anchor="middle">${s.name}</text>`;
    const pick = () => { svg.querySelectorAll('.imrad-part').forEach(x => x.classList.remove('sel')); g.classList.add('sel'); out.innerHTML = `<strong>${s.name}</strong> — ${L(s.q)}`; };
    g.addEventListener('click', pick); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    svg.appendChild(g);
  });
  el.appendChild(svg);
  out.textContent = L({ ja: '各部分をタップ。', en: 'Tap a section.' });
  return () => {};
}
