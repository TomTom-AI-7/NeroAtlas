// ELECTIVE section — choose by research direction.

export const ELECTIVES = [
  {
    id: 'e1', code: 'E1', section: 'elective', color: '#5d6d7e',
    title: { ja: 'BCIハードウェアとリアルタイム処理', en: 'BCI Hardware & Real-time Processing' },
    summary: { ja: 'BrainFlow の合成ボード、OpenBCI、LSL、PsychoPy のトリガー検証で「計測系を作る」側に進む。',
      en: 'Move to building acquisition systems: BrainFlow synthetic board, OpenBCI, LSL and PsychoPy trigger validation.' },
    goals: [
      { ja: '実機なしで BrainFlow の合成ストリームを取得・解析できる', en: 'Stream and analyse BrainFlow synthetic data without hardware' },
      { ja: 'イベントトリガーの遅延と揺らぎを検証する方法を説明できる', en: 'Explain how to validate trigger latency and jitter' },
    ],
    deliverable: { ja: '合成ボードでの実時間バンドパワー表示スクリプト', en: 'Real-time band-power script on the synthetic board' },
    prereq: ['c2', 'c3'], next: [],
    resources: ['brainflow', 'openbci', 'openbci-lsl', 'psychopy', 'event-testing', 'zero-to-lab', 'iisc-sensors'],
    lessons: [
      {
        id: 'e1-1', title: { ja: 'BrainFlow 合成ボードで取得', en: 'Acquire with BrainFlow’s synthetic board' },
        keywords: ['BoardShim', 'synthetic board', 'ring buffer', 'causal filter'],
        concept: {
          ja: [
            'BrainFlow は多数の生体信号デバイスを同じ API で扱えるライブラリ。SYNTHETIC_BOARD を使えば実機なしでパイプラインを開発できる。',
            'リアルタイム処理では未来のデータを使えないため、ゼロ位相フィルタ（filtfilt）は使えず、因果フィルタ＋遅延の管理が必要。',
            '実機の安全：医療機器ではない装置の電気的安全性、電極の衛生、自分以外を測る場合の倫理審査。',
          ],
          en: [
            'BrainFlow exposes many biosignal devices through one API. SYNTHETIC_BOARD lets you develop pipelines without hardware.',
            'Real-time processing cannot use future samples, so zero-phase filtfilt is out; use causal filters and manage latency.',
            'Hardware safety: electrical safety of non-medical devices, electrode hygiene, and ethics review when recording others.',
          ],
        },
        practice: {
          task: { ja: 'pip install brainflow の上で実行し、取得したチャネル数と alpha 帯パワーを表示しよう。', en: 'After pip install brainflow, run this and print channel count and alpha power.' },
          code: `import time, numpy as np
from brainflow.board_shim import BoardShim, BrainFlowInputParams, BoardIds
from scipy.signal import welch

board_id = BoardIds.SYNTHETIC_BOARD.value
board = BoardShim(board_id, BrainFlowInputParams())
board.prepare_session(); board.start_stream()
time.sleep(5)
data = board.get_board_data(); board.stop_stream(); board.release_session()

fs = BoardShim.get_sampling_rate(board_id)
eeg_ch = BoardShim.get_eeg_channels(board_id)
f, P = welch(data[eeg_ch[0]], fs=fs, nperseg=fs*2)
alpha = P[(f >= 8) & (f <= 13)].mean()
print(f"fs={fs} Hz, {len(eeg_ch)} EEG channels, alpha power (ch0) = {alpha:.3f}")`,
          prompt: { ja: '結果と、リアルタイム化するときの課題:', en: 'Result and challenges for real-time use:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'リアルタイム BCI で filtfilt を使えない理由は？', en: 'Why can’t real-time BCI use filtfilt?' },
            options: [{ ja: '未来のサンプルが必要だから', en: 'It needs future samples' }, { ja: '遅すぎるから', en: 'It is too slow' }], answer: 0,
            explain: { ja: '逆方向のフィルタは未来を使う。', en: 'The backward pass uses the future.' } },
        ],
        reflect: { ja: '作ってみたいBCIのアイデアを保存。', en: 'Save a BCI idea you want to build.' },
      },
      {
        id: 'e1-2', title: { ja: 'トリガー同期と実験の検証', en: 'Trigger sync & experiment validation' },
        keywords: ['LSL', 'latency', 'jitter', 'photodiode'],
        concept: {
          ja: [
            '刺激提示 PC と EEG アンプの時計は別。LSL はストリーム間の時刻合わせを行うが、画面の描画遅延（数十ms）までは消えない。',
            '検証：フォトダイオードで実際の画面変化を記録し、トリガーとの遅延と揺らぎ（jitter）を測る。Drive の “A standardized framework to test event-based experiments” と “From zero to lab” が参考。',
          ],
          en: [
            'Stimulus PC and amplifier clocks differ. LSL aligns stream timestamps but cannot remove display latency (tens of ms).',
            'Validate with a photodiode on the screen: measure trigger-to-display latency and jitter. See the papers in your Drive on event-based experiment testing and “From zero to lab”.',
          ],
        },
        practice: {
          task: { ja: 'ERP 実験で 20 ms の jitter があると、何が起きるか（振幅・潜時）を説明しよう。', en: 'Explain what a 20 ms trigger jitter does to an ERP (amplitude, latency).' },
          prompt: { ja: '説明:', en: 'Explanation:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'トリガーの jitter が大きいと平均 ERP は？', en: 'Large trigger jitter makes the averaged ERP…' },
            options: [{ ja: '振幅が下がり形がなまる', en: 'smaller and smeared' }, { ja: '大きくなる', en: 'larger' }], answer: 0,
            explain: { ja: '試行ごとにずれた波形を平均するため。', en: 'Averaging misaligned trials smears the waveform.' } },
        ],
        reflect: { ja: '計測系で検証すべき項目リストをメモ。', en: 'Note a checklist for validating your setup.' },
      },
    ],
  },

  {
    id: 'e2', code: 'E2', section: 'elective', color: '#7d3c98',
    title: { ja: 'EEGの深層学習と公平なベンチマーク', en: 'Deep Learning for EEG & Fair Benchmarks' },
    summary: { ja: 'Braindecode の CNN を線形ベースラインと比較し、MOABB で公平に評価する。',
      en: 'Compare Braindecode CNNs to linear baselines and evaluate fairly with MOABB.' },
    goals: [
      { ja: '深層学習を使う前にベースラインを設定できる', en: 'Set baselines before using deep learning' },
      { ja: 'MOABB の評価条件（within / cross-session / cross-subject）を区別できる', en: 'Distinguish MOABB evaluation settings (within / cross-session / cross-subject)' },
    ],
    deliverable: { ja: 'CSP+LDA vs CNN の比較表（同一分割・同一指標）', en: 'CSP+LDA vs CNN table (same splits, same metric)' },
    prereq: ['c4'], next: [],
    resources: ['braindecode', 'moabb', 'mitx-ml', 'sklearn-pitfalls'],
    lessons: [
      {
        id: 'e2-1', title: { ja: 'ベースラインと公平な比較', en: 'Baselines & fair comparison' },
        keywords: ['EEGNet', 'ShallowConvNet', 'baseline', 'cross-subject'],
        concept: {
          ja: [
            '深層学習が「勝った」と言うには、同じデータ・同じ分割・同じ指標で強いベースライン（CSP+LDA、Riemannian + LR）と比べる必要がある。',
            'MOABB は WithinSession / CrossSession / CrossSubject の評価を標準化し、複数データセットで比較できる。CNN は小標本で過学習しやすく、seed による分散も大きい。複数 seed の平均と分散を報告する。',
          ],
          en: [
            'To claim deep learning “wins”, compare against strong baselines (CSP+LDA, Riemannian + LR) on the same data, splits and metric.',
            'MOABB standardises WithinSession / CrossSession / CrossSubject evaluation across datasets. CNNs overfit small samples and vary across seeds — report mean and spread over several seeds.',
          ],
        },
        visual: { widget: 'leakage' },
        practice: {
          task: { ja: 'MOABB の例を1つ選び、CrossSubject 評価で CSP+LDA の結果を記録。その後 Braindecode のモデルと比較する計画を書こう。', en: 'Pick a MOABB example; record CSP+LDA under CrossSubject evaluation, then plan the Braindecode comparison.' },
          prompt: { ja: 'データセット:\n評価条件:\nベースライン結果:\n比較計画:', en: 'Dataset:\nEvaluation:\nBaseline result:\nComparison plan:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'CNN が CSP+LDA より 3% 高い（seed 1つ）。言えることは？', en: 'CNN beats CSP+LDA by 3% with one seed. You can say…' },
            options: [{ ja: 'まだ言えない。複数 seed と分割で分散を見る', en: 'Not yet — check variance across seeds and splits' }, { ja: 'CNN が優れている', en: 'CNN is better' }], answer: 0,
            explain: { ja: 'seed による揺れが差より大きいことはよくある。', en: 'Seed variance often exceeds such gaps.' } },
        ],
        reflect: { ja: '深層学習を使う意義が自分の研究にあるか、メモ。', en: 'Does deep learning add value to your question? Note it.' },
      },
    ],
  },

  {
    id: 'e3', code: 'E3', section: 'elective', color: '#1e8449',
    title: { ja: '臨床試験とシステマティックレビュー', en: 'Clinical Trials & Systematic Review' },
    summary: { ja: 'RCT の設計（無作為化・対照・盲検）、CBT 効果研究、証拠の統合（メタ解析）を学ぶ。',
      en: 'RCT design (randomisation, control, blinding), CBT effect studies and evidence synthesis (meta-analysis).' },
    goals: [
      { ja: 'CBT 介入研究の主要評価項目・比較群・時点を設計できる', en: 'Design primary outcome, comparator and time points for a CBT trial' },
      { ja: 'システマティックレビューの手順（PRISMA）を説明できる', en: 'Explain systematic review steps (PRISMA)' },
    ],
    deliverable: { ja: 'CBT 介入研究の1ページ設計', en: 'One-page CBT trial design' },
    prereq: ['c5', 'c6'], next: [],
    resources: ['jhu-trials', 'jhu-sysreview', 'uct-clinical', 'nimh-depression'],
    lessons: [
      {
        id: 'e3-1', title: { ja: 'RCT と CBT 効果の評価', en: 'RCTs & evaluating CBT' },
        keywords: ['randomisation', 'control group', 'blinding', 'intention-to-treat'],
        concept: {
          ja: [
            '無作為化は既知・未知の交絡を平均的に均等にする。対照群（待機群、通常治療、注意対照）の選び方で「何と比べた効果か」が変わる。',
            '心理療法は盲検化が難しいため、評価者盲検や客観的アウトカムが重要。脱落者を含めた ITT 解析が基本。',
            'EEG を組み込むなら：治療前後の変化と症状変化の関連、あるいは治療反応の予測（予測研究として TRIPOD+AI）。',
          ],
          en: [
            'Randomisation balances known and unknown confounders on average. The control (waitlist, usual care, attention control) defines what the effect is relative to.',
            'Psychotherapy is hard to blind, so assessor blinding and objective outcomes matter. Intention-to-treat analysis is standard.',
            'Adding EEG: relate pre–post EEG change to symptom change, or predict treatment response (a prediction study → TRIPOD+AI).',
          ],
        },
        practice: {
          task: { ja: 'CBT 研究を1ページ設計：対象・介入・比較群・主要アウトカム（尺度と時点）・サンプルサイズの根拠。', en: 'Design a CBT trial on one page: population, intervention, comparator, primary outcome (scale and time point), sample-size rationale.' },
          prompt: { ja: 'P:\nI:\nC:\nO（尺度・時点）:\nn の根拠:', en: 'P:\nI:\nC:\nO (scale, time):\nn rationale:' },
        },
        quiz: [
          { id: 'q1', q: { ja: '待機群との比較で CBT に効果。言えることは？', en: 'CBT beats a waitlist. You can say…' },
            options: [{ ja: '何もしないより効果がある（非特異的要因を含む）', en: 'It beats doing nothing (incl. non-specific factors)' }, { ja: 'CBT 特有の技法が効いた', en: 'CBT-specific techniques caused it' }], answer: 0,
            explain: { ja: '注意対照などとの比較で特異的効果に迫る。', en: 'Attention controls are needed for specific effects.' } },
        ],
        reflect: { ja: '治療研究で EEG が役立ちそうな場面をメモ。', en: 'Where could EEG help in treatment research?' },
      },
    ],
  },

  {
    id: 'e4', code: 'E4', section: 'elective', color: '#a04000',
    title: { ja: '生物学的精神医学：神経炎症', en: 'Biological Psychiatry: Neuroinflammation' },
    summary: { ja: 'ミクログリアと炎症仮説を、証拠の種類（動物・ヒト相関・ヒト介入）を区別しながら読む。',
      en: 'Read the microglia/inflammation hypothesis while separating evidence types (animal, human correlational, human interventional).' },
    goals: [
      { ja: '総説の主張を証拠階層でタグ付けできる', en: 'Tag review claims by level of evidence' },
    ],
    deliverable: { ja: '証拠タグ付きの総説要約（独自の言葉で）', en: 'Evidence-tagged review summary (in your own words)' },
    prereq: ['c5'], next: [],
    resources: ['microglia-review', 'drive-microglia', 'epfl-cellular', 'alaskax-anxiety'],
    lessons: [
      {
        id: 'e4-1', title: { ja: '証拠の階層で総説を読む', en: 'Reading a review by evidence level' },
        keywords: ['microglia', 'cytokines', 'animal models', 'translation'],
        concept: {
          ja: [
            'ミクログリアは脳の免疫細胞。慢性ストレスで活性化し炎症性サイトカインを放出することが動物で示され、ヒトでは一部のうつ病患者で炎症マーカー上昇が報告されている。',
            '読み方：①動物モデルでの因果的操作、②ヒトでの相関（血中マーカー、PET）、③ヒトでの介入（抗炎症薬の試験）を区別。③が最も強いが結果は混在。',
            '総説の文章や図は著作物。要約は自分の言葉で、図は再掲せず引用元を示す。',
          ],
          en: [
            'Microglia are the brain’s immune cells. In animals, chronic stress activates them and they release pro-inflammatory cytokines; in humans, a subset of depressed patients show elevated inflammatory markers.',
            'Separate (1) causal manipulations in animal models, (2) human correlations (blood markers, PET), (3) human interventions (anti-inflammatory trials). (3) is strongest, but results are mixed.',
            'Review text and figures are copyrighted: summarise in your own words; cite rather than reproduce figures.',
          ],
        },
        practice: {
          task: { ja: 'Drive の Microglia in Depression を読み、主張5つに [動物/ヒト相関/ヒト介入] タグを付けて自分の言葉で要約しよう。', en: 'Read Microglia in Depression from your Drive; tag five claims [animal / human-corr / human-interv] and summarise in your own words.' },
          prompt: { ja: '1. [ ]\n2. [ ]\n3. [ ]\n4. [ ]\n5. [ ]', en: '1. [ ]\n2. [ ]\n3. [ ]\n4. [ ]\n5. [ ]' },
        },
        quiz: [
          { id: 'q1', q: { ja: '最も強い因果的証拠（ヒト）は？', en: 'Strongest causal evidence in humans?' },
            options: [{ ja: '無作為化された抗炎症薬の試験', en: 'Randomised anti-inflammatory trials' }, { ja: '血中マーカーの相関', en: 'Blood-marker correlations' }], answer: 0,
            explain: { ja: '介入＋無作為化が因果推論を支える。', en: 'Randomised intervention supports causal inference.' } },
        ],
        reflect: { ja: '炎症と EEG を結びつける研究アイデアがあれば保存。', en: 'Save any idea linking inflammation and EEG.' },
      },
    ],
  },

  {
    id: 'e5', code: 'E5', section: 'elective', color: '#117a65',
    title: { ja: '計算論的神経科学', en: 'Computational Neuroscience' },
    summary: { ja: 'LIF モデル、発火率の符号化、デコーディングを数式とコードで扱い、BCI の理論的基盤を作る。',
      en: 'LIF models, rate coding and decoding in maths and code — the theoretical base of BCI.' },
    goals: [
      { ja: 'f–I 曲線をシミュレーションで描ける', en: 'Simulate an f–I curve' },
      { ja: '符号化モデルと復号化モデルの違いを説明できる', en: 'Explain encoding vs decoding models' },
    ],
    deliverable: { ja: 'f–I 曲線とチューニング曲線のシミュレーション', en: 'f–I curve and tuning-curve simulation' },
    prereq: ['p1', 'p2'], next: [],
    resources: ['uw-compneuro', 'neuromatch', 'epfl-cellular'],
    lessons: [
      {
        id: 'e5-1', title: { ja: '符号化と復号化', en: 'Encoding & decoding' },
        keywords: ['tuning curve', 'population vector', 'f–I curve'],
        concept: {
          ja: [
            '符号化モデル：刺激 → 神経応答（例：運動方向に対するチューニング曲線）。復号化モデル：神経応答 → 刺激や意図の推定。BCI は復号化の応用。',
            '集団ベクトル法：各ニューロンの好む方向を発火率で重み付けして足すと、運動方向が推定できる。EEG では個々のニューロンは見えないため、CSP のような空間パターンが代わりの“集団”になる。',
          ],
          en: [
            'Encoding: stimulus → neural response (e.g. direction tuning curves). Decoding: response → estimated stimulus or intent. BCI is applied decoding.',
            'Population vector: sum each neuron’s preferred direction weighted by its rate to estimate movement direction. EEG cannot see single neurons, so spatial patterns like CSP play the “population” role.',
          ],
        },
        visual: { widget: 'neuron' },
        practice: {
          task: { ja: '8方向にチューニングされた ニューロン集団を作り、集団ベクトルで方向を復号するコードを実行しよう。', en: 'Run code that decodes direction from 8 direction-tuned neurons via the population vector.' },
          code: `import numpy as np
rng = np.random.default_rng(3)
pref = np.linspace(0, 2*np.pi, 8, endpoint=False)          # preferred directions
def rates(theta): return 10 + 8*np.cos(theta - pref)        # cosine tuning (Hz)

errors = []
for _ in range(200):
    true = rng.uniform(0, 2*np.pi)
    r = rng.poisson(rates(true))                            # noisy spike counts
    vec = (r - r.mean()) @ np.c_[np.cos(pref), np.sin(pref)]
    est = np.arctan2(vec[1], vec[0]) % (2*np.pi)
    errors.append(np.degrees(np.angle(np.exp(1j*(est-true)))))
print(f"mean |error| = {np.mean(np.abs(errors)):.1f} degrees")`,
          packages: ['numpy'],
          prompt: { ja: 'ニューロン数を増やすと誤差はどうなる？', en: 'What happens to error with more neurons?' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'BCI が主に使うのは？', en: 'BCI mainly uses…' },
            options: [{ ja: '復号化モデル', en: 'Decoding models' }, { ja: '符号化モデルのみ', en: 'Encoding models only' }], answer: 0,
            explain: { ja: '脳活動から意図を推定する。', en: 'Estimating intent from brain activity.' } },
        ],
        reflect: { ja: '符号化モデルを研究に使う可能性をメモ。', en: 'Could encoding models serve your research?' },
      },
    ],
  },

  {
    id: 'e6', code: 'E6', section: 'elective', color: '#6c3483',
    title: { ja: '統計をRで補強', en: 'Statistics in R' },
    summary: { ja: 'Python で計算した統計量を R で再計算し、結果の一致を確認する（クロス言語の再現性）。',
      en: 'Recompute Python statistics in R and confirm agreement (cross-language reproducibility).' },
    goals: [{ ja: '同じ t 検定・相関・信頼区間を Python と R で一致させる', en: 'Match a t-test, correlation and CI in Python and R' }],
    deliverable: { ja: 'Python/R 比較ノート', en: 'Python/R comparison note' },
    prereq: ['c6'], next: [],
    resources: ['harvardx-statsr', 'openintro'],
    lessons: [
      {
        id: 'e6-1', title: { ja: 'Python と R で同じ答えを出す', en: 'Same answer in Python and R' },
        keywords: ['t.test', 'cor.test', 'Welch', 'scipy.stats'],
        concept: {
          ja: [
            'R の t.test() は既定で Welch の t 検定（等分散を仮定しない）。scipy.stats.ttest_ind は既定で等分散を仮定する（equal_var=True）。既定値の違いは再現失敗の典型的原因。',
            '同じデータを CSV で両言語に渡し、統計量・自由度・p 値・CI が一致するかを確認する。',
          ],
          en: [
            'R’s t.test() defaults to Welch’s test (unequal variances); scipy.stats.ttest_ind defaults to equal_var=True. Differing defaults are a classic replication failure.',
            'Pass the same CSV to both languages and check statistic, df, p-value and CI agree.',
          ],
        },
        practice: {
          task: { ja: 'Python 側を実行し、R で t.test(a, b) と比較しよう。equal_var=False で一致する？', en: 'Run the Python side and compare with R’s t.test(a, b). Do they match with equal_var=False?' },
          code: `import numpy as np
from scipy import stats
rng = np.random.default_rng(11)
a = rng.normal(0.0, 1.0, 25); b = rng.normal(0.5, 2.0, 30)
print("Student:", stats.ttest_ind(a, b))
print("Welch  :", stats.ttest_ind(a, b, equal_var=False))
np.savetxt("ab.csv", np.c_[np.r_[a, [np.nan]*5], b], delimiter=",", header="a,b", comments="")
# R: d <- read.csv("ab.csv"); t.test(na.omit(d$a), d$b)`,
          packages: ['numpy', 'scipy'],
          prompt: { ja: '一致したか・既定値の違い:', en: 'Did they match? Default differences:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'R の t.test() の既定は？', en: 'Default of R’s t.test()?' },
            options: [{ ja: 'Welch（等分散を仮定しない）', en: 'Welch (unequal variances)' }, { ja: 'Student（等分散）', en: 'Student (equal variances)' }], answer: 0,
            explain: { ja: 'var.equal = FALSE が既定。', en: 'var.equal = FALSE by default.' } },
        ],
        reflect: { ja: '他に既定値の違いが怖い関数をメモ。', en: 'Note other functions whose defaults might bite.' },
      },
    ],
  },
];
