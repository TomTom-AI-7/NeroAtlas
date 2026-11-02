# NeuroAtlas

A course-based learning app for **neuroscience, BCI and mental-health research**. It takes you from foundations through EEG measurement, signal processing, Python/MNE, machine learning, psychiatry and research methods, to reproducing a published result on public data, developing your own research question, and writing an **English paper draft**.

脳科学・BCI・メンタルヘルス研究を、コース単位で「基礎 → 再現実験 → 独自テーマ → 英語論文草稿」まで学ぶアプリです。日本語/英語切替、スマホ対応、オフライン動作（PWA）。

## 起動 / Run

```bash
python3 -m http.server 8000     # or: npm start
# open http://localhost:8000
```
静的サイト（ES Modules）。`file://` では動きません。

**公開**: Cloudflare Pages（Build command `node scripts/build.mjs`、Output `dist`）。手順は [`docs/DEPLOY.md`](docs/DEPLOY.md)。

## 構成 / What's inside

| Section | Courses |
|---|---|
| **Prep 基礎・準備** | P1 脳とニューロン · P2 数学とPython · P3 研究リテラシーと倫理 |
| **Core 必須** | C1 EEG計測 · C2 信号処理 · C3 Python×MNE · C4 機械学習と評価 · C5 精神医学 · C6 研究デザインと統計 · C7 論文読解と再現 · C8 英語執筆 · C9 キャップストーン |
| **Elective 選択** | E1 BCIハード/リアルタイム · E2 深層学習 · E3 臨床試験/メタ解析 · E4 神経炎症 · E5 計算論的神経科学 · E6 R統計 |

Every lesson has five steps: **Concept → Visual (interactive) → Practice (code / writing) → Check (auto-graded quiz) → Reflect (note / aha / question)**.
Missed quiz questions go into a review queue. Practice answers can feed straight into the paper draft (IMRaD), which you can export as Markdown, a one-page proposal, CSV or a JSON backup.

- Design docs: [`docs/CURRICULUM.md`](docs/CURRICULUM.md) (curriculum and Google Drive materials status), [`docs/SCREENS.md`](docs/SCREENS.md) (screen layout)
- Exercise scripts: [`notebooks/`](notebooks/)

## Extending
- **Add a course or lesson**: add data to `content/prep.js`, `core-a.js`, `core-b.js` or `electives.js`. The UI picks it up automatically.
- **Add a visual**: add a function `(el, props, ctx) => cleanup` under `js/widgets/` and register it in `js/widgets/index.js`.
- **Add a resource**: add it to `content/resources.js` (`access` is one of free / audit / subscription / open-access / personal).
- `npm test` catches missing translations, broken references, invalid quiz answers and service-worker file-list gaps.

## Copyright & data
All explanations, visuals, exercises, quizzes and code are original to this project. External materials are **links plus access terms only**. Content from paid courses and books is never reproduced. Google Drive links point to the learner's personal copies and are marked "no redistribution". Learner data stays in the browser's localStorage and is never sent to a server.

License: code MIT; course text CC BY 4.0.
