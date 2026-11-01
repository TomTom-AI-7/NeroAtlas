// Bilingual text. Both languages are rendered into the page; the language button only flips
// `data-lang` on <html>, and CSS hides the other language. Nothing re-renders, so scroll position,
// typed answers and open cards stay exactly where they were.
import { raw, esc } from './dom.js';

const UI = {
  appTagline: { ja: '神経科学・BCI・メンタルヘルス研究', en: 'Neuroscience, BCI & mental-health research' },
  learn: { ja: '学習', en: 'Learn' },
  review: { ja: '復習', en: 'Review' },
  notes: { ja: 'ノート', en: 'Notes' },
  library: { ja: '教材', en: 'Library' },

  heroEyebrow: { ja: 'LEARN · REPLICATE · WRITE', en: 'LEARN · REPLICATE · WRITE' },
  heroTitle1: { ja: '今日の一問が、', en: 'One question today,' },
  heroTitle2: { ja: '自分の論文につながる。', en: 'one step toward your paper.' },
  heroSub: { ja: '基礎 → 再現実験 → 独自テーマ → 英語論文草稿', en: 'Foundations → replication → your own question → an English draft' },
  statAnswered: { ja: '学習した問題', en: 'Questions attempted' },
  statAccuracy: { ja: '累計正答率', en: 'Overall accuracy' },
  statDue: { ja: '今日の復習', en: 'Due for review' },
  continue: { ja: '続きから', en: 'Continue' },
  oneQuestion: { ja: '1問だけ', en: 'one question' },
  leftInCourse: { ja: 'この講座の残り', en: 'left in this course' },
  allAnswered: { ja: '全問に一度は答えました。', en: 'You have answered everything once.' },
  keepReviewing: { ja: 'あとは復習を続けましょう。', en: 'Keep the review going.' },
  nothingDue: { ja: 'いまは復習の期限も来ていません。', en: 'Nothing is due right now.' },
  reviewBannerTitle: { ja: '忘れる前に、もう一度。', en: 'Revisit it before you forget.' },
  reviewBannerSub: { ja: '期限の来た問題（1回10問まで）', en: 'due now (up to 10 per session)' },
  mapTitle: { ja: '全体の流れ', en: 'How it fits together' },
  yourCourses: { ja: '講座一覧', en: 'Your courses' },
  searchCourses: { ja: '講座・用語を検索', en: 'Search courses or terms' },
  all: { ja: 'すべて', en: 'All' },
  prep: { ja: 'プレップ', en: 'Prep' },
  core: { ja: 'コア', en: 'Core' },
  elective: { ja: '選択', en: 'Elective' },
  units: { ja: '概念', en: 'concepts' },
  questions: { ja: '問', en: 'questions' },
  notStarted: { ja: '未学習', en: 'Not started' },
  questionsUnit: { ja: '問', en: 'q' },

  backToLearning: { ja: '学習画面に戻る', en: 'Back to learning' },
  knowledgeCheck: { ja: '知識チェック', en: 'Knowledge check' },
  researchTask: { ja: '研究課題', en: 'Research task' },
  calculation: { ja: '計算問題', en: 'Calculation' },
  readFigure: { ja: '図を読む', en: 'Read the figure' },
  electrodeMap: { ja: '電極をタップ', en: 'Tap the electrode' },
  codeCompletion: { ja: 'コードを完成させる', en: 'Complete the code' },
  ordering: { ja: '順番に並べる', en: 'Put in order' },
  hint: { ja: 'ヒント', en: 'Hint' },
  submit: { ja: '回答する', en: 'Check' },
  yourAnswer: { ja: 'あなたの答え', en: 'Your answer' },
  numPlaceholder: { ja: '数値または式（例 0.05/320）', en: 'Number or expression (e.g. 0.05/320)' },
  slip: { ja: '計算ミスだったので、できたことにする', en: 'It was just a slip — count it as correct' },
  countedCorrect: { ja: '✓ できたことにしました', en: '✓ Counted as correct' },
  tapElectrode: { ja: '10–20法の電極配置', en: '10–20 electrode layout' },
  orderHelp: { ja: '下の項目を、最初に来るものから順にタップ。', en: 'Tap the items below, starting with the first step.' },
  startOver: { ja: 'やり直す', en: 'Start over' },
  correctOrder: { ja: '正しい順番：', en: 'Correct order:' },
  concept: { ja: '概念の解説', en: 'Concept' },
  read: { ja: '読む', en: 'Read' },
  hide: { ja: '閉じる', en: 'Hide' },
  keywords: { ja: 'キーワード', en: 'Keywords' },
  correct: { ja: '✓ 正解です', en: '✓ Correct' },
  retry: { ja: 'もう一度、整理しましょう', en: 'Let’s work through it' },
  answerIs: { ja: '正解：', en: 'Answer: ' },
  addedToReview: { ja: '復習リストに追加しました。', en: 'Added to your review list.' },
  nextQuestion: { ja: '次の問題へ', en: 'Next question' },
  backHome: { ja: 'ホームに戻る', en: 'Back to home' },
  seeResults: { ja: '結果を見る', en: 'See results' },
  oneMore: { ja: '気力があれば、もう一問', en: 'One more, while you are here' },
  saveQuestion: { ja: '問題を保存', en: 'Save question' },
  prevQuestion: { ja: '前の問題', en: 'Prev' },
  sessionDone: { ja: 'おつかれさまでした。', en: 'Practice complete.' },
  sessionNote: { ja: '誤答は復習へ。正解も 1・3・7・14・30 日後に再確認します。', en: 'Missed questions go to review. Correct ones return after 1, 3, 7, 14 and 30 days.' },
  correctCount: { ja: '正解', en: 'correct' },
  saveAndNext: { ja: '保存して次へ', en: 'Save and continue' },
  skipTask: { ja: 'あとでやる', en: 'Do it later' },
  taskSaved: { ja: '保存しました（ノート →「課題」で見返せます）', en: 'Saved (see Notes → Tasks)' },
  taskSkipped: { ja: 'スキップしました。ノート →「課題」に残っています。', en: 'Skipped. It stays in Notes → Tasks.' },
  alsoDraft: { ja: '論文草稿にも追記されます：', en: 'Also added to your paper draft: ' },
  yourWork: { ja: 'あなたの答え', en: 'Your answer' },
  copy: { ja: 'コピー', en: 'Copy' },
  copied: { ja: 'コピーしました', en: 'Copied' },
  runInBrowser: { ja: 'ブラウザで実行', en: 'Run in browser' },
  running: { ja: '実行中…（初回はPython環境を読み込みます）', en: 'Running… (first run loads Python)' },
  localOnly: { ja: 'ローカルで実行（pip install mne など）', en: 'Run locally (pip install mne, etc.)' },
  memoTitle: { ja: 'メモ・アハ・疑問を残す', en: 'Add a note, aha or question' },
  note: { ja: 'メモ', en: 'Note' },
  aha: { ja: 'アハ', en: 'Aha' },
  question: { ja: '疑問', en: 'Question' },
  add: { ja: '保存', en: 'Save' },
  saved: { ja: '保存しました', en: 'Saved' },
  source: { ja: '参照教材', en: 'Sources' },
  words: { ja: '語', en: 'words' },

  courseContinue: { ja: 'このコースを続ける', en: 'Continue this course' },
  courseStart: { ja: 'このコースを始める', en: 'Start this course' },
  courseReview: { ja: 'このコースを解き直す', en: 'Practise this course again' },
  goals: { ja: '到達目標', en: 'Goals' },
  deliverable: { ja: '成果物', en: 'Deliverable' },
  prereq: { ja: '前提', en: 'Before this' },
  next: { ja: '次', en: 'Next' },
  resources: { ja: '外部教材（リンクのみ）', en: 'External resources (links only)' },

  reviewEyebrow: { ja: 'SPACED REPETITION', en: 'SPACED REPETITION' },
  reviewTitle: { ja: 'できなかった、をできる、に。', en: 'Make it stick.' },
  reviewSub: { ja: '誤答はすぐ復習へ。正解後は 1・3・7・14・30 日で再確認します。', en: 'Missed questions come back now. Correct ones return after 1, 3, 7, 14 and 30 days.' },
  reviewNow: { ja: '復習する', en: 'Review' },
  savedQuestions: { ja: '保存した問題', en: 'Saved questions' },
  dueList: { ja: '復習待ち', en: 'Due for review' },
  noDue: { ja: '今の復習待ちはありません。講座へ進みましょう。', en: 'Nothing due. Continue with a course.' },
  noSaved: { ja: '★で保存した問題がここに並びます。', en: 'Questions you star appear here.' },

  tasks: { ja: '課題', en: 'Tasks' },
  draft: { ja: '論文草稿', en: 'Paper draft' },
  empty: { ja: 'まだありません。問題の下の「メモ・アハ・疑問を残す」から保存できます。', en: 'Nothing yet. Save from “Add a note” under any question.' },
  emptyTasks: { ja: 'まだありません。各概念の最後に研究課題が出ます。', en: 'Nothing yet. A research task comes at the end of each concept.' },
  pending: { ja: '未提出', en: 'Not done' },
  done: { ja: '提出済み', en: 'Done' },
  draftHint: { ja: '研究課題の答えが自動で追記されます。ここで自由に編集できます（自動保存）。', en: 'Research-task answers are added here automatically. Edit freely (autosaved).' },
  search: { ja: '検索', en: 'Search' },
  delete: { ja: '削除', en: 'Delete' },
  confirmDelete: { ja: 'もう一度押して削除', en: 'Tap again to delete' },
  resolved: { ja: '解決', en: 'Resolved' },
  export: { ja: '書き出し', en: 'Export' },
  exportMd: { ja: 'Markdown', en: 'Markdown' },
  exportCsv: { ja: 'CSV', en: 'CSV' },
  exportJson: { ja: 'バックアップ(JSON)', en: 'Backup (JSON)' },
  exportProposal: { ja: '1ページ提案書', en: 'One-page proposal' },
  close: { ja: '閉じる', en: 'Close' },
  downloadFile: { ja: 'ファイルを保存', en: 'Save file' },
  exportHint: { ja: '保存ボタンが効かない環境では「コピー」してメモアプリ等に貼り付けてください。', en: 'If saving is blocked here, copy the text and paste it into a notes app.' },
  selectToCopy: { ja: '選択しました。長押し／Ctrl+C でコピー', en: 'Selected — long-press or Ctrl+C to copy' },
  data: { ja: 'データ', en: 'Data' },
  dataNote: { ja: '記録はこの端末のブラウザにだけ保存されます。端末を変える前にバックアップしてください。', en: 'Your records stay in this browser only. Back up before switching devices.' },
  restore: { ja: 'バックアップを貼り付けて復元', en: 'Restore by pasting a backup' },
  restoreFile: { ja: 'ファイルから復元', en: 'Restore from file' },
  restoreGo: { ja: '復元する', en: 'Restore' },
  restored: { ja: '復元しました', en: 'Restored' },
  restoreFail: { ja: '復元できませんでした。バックアップのJSONか確認してください。', en: 'Could not restore. Check that this is a NeuroAtlas backup.' },
  reset: { ja: '全データをリセット', en: 'Reset all data' },
  confirmReset: { ja: 'もう一度押すと全削除', en: 'Tap again to erase everything' },

  copyrightTitle: { ja: '著作権と利用条件', en: 'Copyright & terms' },
  copyrightBody: { ja: '解説・図・問題・コードは NeuroAtlas の独自作成です。外部教材は公式リンクと利用条件のみ掲載し、有料教材や書籍の本文は転載しません。Drive のファイルは本人の学習用リンクで、共有・再配布はできません。', en: 'Explanations, figures, questions and code are original to NeuroAtlas. External materials are listed as official links with access terms only; paid course and book content is never reproduced. Drive links point to your personal copies and must not be shared.' },
  usedIn: { ja: '使用コース', en: 'Used in' },
  driveStatus: { ja: 'Google Drive 教材の取り込み状況', en: 'Google Drive materials' },
  access_free: { ja: '無料', en: 'Free' },
  access_audit: { ja: '無料聴講(Audit)', en: 'Free audit' },
  access_paid: { ja: '有料', en: 'Paid' },
  access_subscription: { ja: '購読・購入', en: 'Subscription' },
  'access_open-access': { ja: 'オープンアクセス', en: 'Open access' },
  access_personal: { ja: '個人保管・再配布不可', en: 'Personal · no redistribution' },
  type_course: { ja: '講座', en: 'Course' }, type_book: { ja: '書籍', en: 'Book' }, type_docs: { ja: '公式ドキュメント', en: 'Docs' },
  type_dataset: { ja: 'データ', en: 'Dataset' }, type_guideline: { ja: 'ガイドライン', en: 'Guideline' }, type_paper: { ja: '論文', en: 'Paper' },
  type_drive: { ja: 'Drive', en: 'Drive' }, type_tool: { ja: 'ツール', en: 'Tool' },
  notFound: { ja: 'ページが見つかりません', en: 'Page not found' },
};

let lang = 'ja';
export function setLang(l) {
  lang = l === 'en' ? 'en' : 'ja';
  const root = document.documentElement;
  root.dataset.lang = lang;
  root.lang = lang;
  // Attributes can't hold two languages, so swap them in place.
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = pick(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', pick(el.dataset.i18nAria)); });
}
export const getLang = () => lang;

const obj = k => (typeof k === 'string' ? (UI[k] || { ja: k, en: k }) : k);

/** Plain text in the current language (for attributes, toasts, canvas labels). */
export function pick(k, vars) {
  const o = obj(k); if (o == null) return '';
  let s = o[lang] ?? o.ja ?? o.en ?? '';
  if (vars) for (const [a, v] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, v);
  return s;
}

/** Both languages as markup; CSS shows the active one. `tag` lets block content stay block-level. */
export function b(k, tag = 'span') {
  const o = obj(k); if (o == null) return raw('');
  if (o.ja === o.en || !o.en || !o.ja) return raw(esc(o.ja || o.en || ''));
  return raw(`<${tag} data-l="ja">${esc(o.ja)}</${tag}><${tag} data-l="en">${esc(o.en)}</${tag}>`);
}

export const UI_STRINGS = UI;
