// CORE section, part A: measurement → signal processing → MNE → machine learning.

export const CORE_A = [
  {
    id: 'c1', code: 'C1', section: 'core', color: '#2f7cf6',
    title: { ja: 'EEG計測の原理', en: 'EEG Measurement Principles' },
    summary: { ja: 'EEGが測るもの、電極配置と参照、周波数帯、アーチファクトを理解し「EEGで言えること／言えないこと」を区別する。',
      en: 'What EEG measures, electrode layout and reference, frequency bands, artefacts — and what EEG can and cannot tell you.' },
    goals: [
      { ja: '10–20法と参照電極の意味を説明できる', en: 'Explain the 10–20 system and the reference electrode' },
      { ja: '主要な周波数帯と典型的な出現条件を言える', en: 'Name the main bands and when they typically appear' },
      { ja: '瞬目・筋電・電源雑音を見分ける手がかりを3つ挙げられる', en: 'Give three cues to tell blinks, EMG and mains noise from brain signal' },
    ],
    deliverable: { ja: '「EEGで言えること／言えないこと」表', en: '“What EEG can / cannot tell” table' },
    prereq: ['p1'], next: ['c2', 'c3'],
    resources: ['mne-tutorials', 'springer-eeg-python', 'drive-eeg-python', 'jhu-neuroimaging', 'zero-to-lab', 'iisc-sensors'],
    lessons: [
      {
        id: 'c1-1', title: { ja: 'EEGは何を測るのか', en: 'What does EEG measure?' },
        keywords: ['volume conduction', 'dipole', 'temporal resolution', 'spatial resolution'],
        concept: {
          ja: [
            'EEGは頭皮上の2点間の電位差を、ミリ秒単位で測る。時間分解能は高いが、頭蓋骨と頭皮で電場がにじむ（容積伝導）ため空間分解能は数cm程度と粗い。',
            '信号源は、皮質表面に垂直に並ぶ錐体細胞群の同期した電流（等価電流双極子）。数万〜数百万個のニューロンが同時に活動してはじめて頭皮で数〜数十µVになる。',
            'したがってEEGは「遺伝子」や「神経伝達物質の量」を直接は測れない。測れるのは大規模な同期活動の電気的な結果だけ。',
          ],
          en: [
            'EEG measures potential differences between scalp sites with millisecond precision. Temporal resolution is excellent, but volume conduction through skull and scalp blurs spatial resolution to several centimetres.',
            'Sources are synchronised currents of pyramidal cells oriented perpendicular to the cortex (equivalent current dipoles). Tens of thousands to millions of neurons must act together to produce a few to tens of µV.',
            'So EEG does not directly measure genes or transmitter levels — only the electrical consequence of large-scale synchrony.',
          ],
        },
        visual: { widget: 'synchrony', caption: { ja: '同期度を上げると、多数のニューロンの和（頭皮電位）が大きくなる。', en: 'Raise synchrony: the summed scalp potential grows.' } },
        practice: {
          task: { ja: '「EEGで言えること／言えないこと」を3つずつ表にまとめよう（例：言えない＝遺伝要因の直接測定）。', en: 'Make a table of three things EEG can and cannot tell (e.g. cannot: directly measure genetic factors).' },
          prompt: { ja: '言えること:\n1.\n2.\n3.\n言えないこと:\n1.\n2.\n3.', en: 'Can:\n1.\n2.\n3.\nCannot:\n1.\n2.\n3.' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'EEGの長所は？', en: 'EEG’s main strength?' },
            options: [{ ja: '高い時間分解能', en: 'High temporal resolution' }, { ja: '高い空間分解能', en: 'High spatial resolution' }, { ja: '深部構造の直接測定', en: 'Direct deep-structure measurement' }], answer: 0,
            explain: { ja: 'ミリ秒単位の変化を追える。空間分解能は低い。', en: 'Millisecond timing; poor spatial resolution.' } },
          { id: 'q2', q: { ja: '同期していない多数のニューロンの電流は頭皮でどうなる？', en: 'Unsynchronised currents from many neurons at the scalp…' },
            options: [{ ja: '打ち消し合って小さくなる', en: 'largely cancel out' }, { ja: '必ず大きくなる', en: 'always grow' }], answer: 0,
            explain: { ja: '位相がばらばらだと和は √N 程度にしか増えない。同期すると N に比例。', en: 'Random phases sum to ~√N; synchrony gives ~N.' } },
        ],
        reflect: { ja: '自分の研究関心にとってEEGの弱点は致命的？ メモしよう。', en: 'Is EEG’s weakness fatal for your interest? Note it.' },
      },
      {
        id: 'c1-2', title: { ja: '10–20法と参照電極', en: 'The 10–20 system & reference' },
        keywords: ['10–20', 'Fz/Cz/Pz', 'reference', 'average reference', 'montage'],
        concept: {
          ja: [
            '10–20法は、鼻根（nasion）と後頭結節（inion）の距離などを10%・20%で分割して電極位置を決める国際標準。F=前頭、C=中心、P=頭頂、O=後頭、T=側頭。奇数は左、偶数は右、zは正中線。',
            'EEGの値は常に「ある電極 − 参照」の電位差。参照を耳朶（A1/A2）、Cz、平均参照に変えると波形が変わる。参照の選択は結果の解釈に影響するので、Methodsに必ず書く。',
            '平均参照は全電極の平均を引く方法。電極数が少ない・偏っていると歪む。',
          ],
          en: [
            'The 10–20 system places electrodes at 10%/20% fractions of skull distances (nasion–inion, etc.). F = frontal, C = central, P = parietal, O = occipital, T = temporal; odd = left, even = right, z = midline.',
            'Every EEG value is a difference “electrode − reference”. Changing the reference (earlobes, Cz, average) changes waveforms, so always report it in Methods.',
            'Average reference subtracts the mean of all electrodes; it is distorted with few or unevenly spaced electrodes.',
          ],
        },
        visual: { widget: 'electrodes', caption: { ja: '電極をタップして名前と領域を確認。参照を切り替えると表示される波形が変わる。', en: 'Tap electrodes; switch the reference and watch the waveform change.' } },
        practice: {
          task: { ja: '図解で O1 を選び、参照を Cz → 平均参照に変えたとき alpha の見え方がどう変わったかを書こう。', en: 'Select O1; switch reference from Cz to average and describe how alpha changes.' },
          prompt: { ja: '参照を変えると波形が変わる理由:', en: 'Why the waveform changes with reference:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'C3 の位置は？', en: 'Where is C3?' },
            options: [{ ja: '左中心部', en: 'Left central' }, { ja: '右後頭部', en: 'Right occipital' }, { ja: '正中前頭部', en: 'Midline frontal' }], answer: 0,
            explain: { ja: 'C=中心、奇数=左。運動野の手の領域に近い。', en: 'C = central, odd = left; near the hand motor area.' } },
          { id: 'q2', q: { ja: '参照電極についてMethodsに書くべき理由は？', en: 'Why must Methods state the reference?' },
            options: [{ ja: '参照によって波形・効果が変わりうるから', en: 'Waveforms and effects depend on it' }, { ja: '慣習だから', en: 'Only by convention' }], answer: 0,
            explain: { ja: '再現性に直結する解析条件。', en: 'It directly affects reproducibility.' } },
        ],
        reflect: { ja: '参照について、まだ腑に落ちないことを疑問として保存。', en: 'Save anything about references that still puzzles you.' },
      },
      {
        id: 'c1-3', title: { ja: '周波数帯とアーチファクト', en: 'Frequency bands & artefacts' },
        keywords: ['delta', 'theta', 'alpha', 'beta', 'gamma', 'EOG', 'EMG', 'line noise'],
        concept: {
          ja: [
            '目安：delta 0.5–4 Hz（深睡眠）、theta 4–8 Hz（眠気・記憶課題）、alpha 8–13 Hz（閉眼安静で後頭部優位）、beta 13–30 Hz（覚醒・運動）、gamma 30 Hz〜（局所処理、筋電混入に注意）。境界は文献により異なる。',
            'アーチファクト（脳以外の信号）：瞬目・眼球運動（前頭部に大きく低周波）、筋電（高周波で広帯域、側頭部に多い）、電源雑音（50/60 Hzの鋭いピーク）、電極ポップ（単一チャネルの急な段差）、心電。',
            '周波数帯と精神疾患は一対一に対応しない。眠気、カフェイン、薬、開閉眼、記録環境で帯域パワーは大きく変わる。',
          ],
          en: [
            'Rough bands: delta 0.5–4 Hz (deep sleep), theta 4–8 Hz (drowsiness, memory tasks), alpha 8–13 Hz (eyes-closed rest, posterior), beta 13–30 Hz (alertness, movement), gamma > 30 Hz (local processing; beware EMG). Exact limits vary by paper.',
            'Artefacts: blinks/eye movements (large, slow, frontal), muscle EMG (broadband high frequency, temporal), mains noise (sharp 50/60 Hz peak), electrode pops (sudden step on one channel), ECG.',
            'Bands do not map one-to-one onto disorders: drowsiness, caffeine, medication, eyes open/closed and environment all shift band power.',
          ],
        },
        visual: { widget: 'artifacts', caption: { ja: 'アーチファクトを1つずつ加えて、波形とスペクトルの特徴を確認。', en: 'Add artefacts one by one and see their waveform and spectral signatures.' } },
        practice: {
          task: { ja: '図解で各アーチファクトを加え、「EEGと雑音を区別する指標」を3つ（空間分布・周波数・時間波形）書こう。', en: 'Add each artefact and write three cues to distinguish brain signal from noise (topography, frequency, time course).' },
          prompt: { ja: '指標1（空間）:\n指標2（周波数）:\n指標3（時間波形）:', en: 'Cue 1 (space):\nCue 2 (frequency):\nCue 3 (time course):' },
        },
        quiz: [
          { id: 'q1', q: { ja: '閉眼安静で後頭部に強く出るのは？', en: 'Strong over occipital sites during eyes-closed rest?' },
            options: [{ ja: 'alpha', en: 'alpha' }, { ja: 'gamma', en: 'gamma' }, { ja: 'delta', en: 'delta' }], answer: 0,
            explain: { ja: '開眼で減衰する（alpha blocking）。', en: 'It attenuates on eye opening (alpha blocking).' } },
          { id: 'q2', q: { ja: 'スペクトルの 50 Hz に鋭いピーク。最も疑うべきは？', en: 'A sharp 50 Hz spectral peak most likely means…' },
            options: [{ ja: '電源雑音', en: 'Mains noise' }, { ja: '強いgamma活動', en: 'Strong gamma activity' }, { ja: '瞬目', en: 'Blinks' }], answer: 0,
            explain: { ja: '商用電源周波数。ノッチフィルタや電極インピーダンスの確認で対処。', en: 'Power-line frequency; notch filter, check impedances.' } },
          { id: 'q3', q: { ja: '側頭部で高周波の広帯域パワーが増えた。まず考えるのは？', en: 'Broadband high-frequency power rises at temporal sites. First suspect?' },
            options: [{ ja: '咀嚼や噛みしめの筋電', en: 'Jaw muscle EMG' }, { ja: '認知能力の向上', en: 'Improved cognition' }], answer: 0,
            explain: { ja: '側頭筋の筋電は gamma 帯の解析を汚染しやすい。', en: 'Temporalis EMG contaminates gamma analyses.' } },
        ],
        reflect: { ja: 'アーチファクトを「脳の信号」と誤認すると研究はどう歪む？', en: 'How could mistaking artefacts for brain signal distort a study?' },
      },
    ],
  },

  {
    id: 'c2', code: 'C2', section: 'core', color: '#14a37f',
    title: { ja: '信号処理', en: 'Signal Processing' },
    summary: { ja: 'サンプリング、FFT/PSD、フィルタ、バンドパワーを合成波で体験し、前処理の「利点とリスク」を判断できるようにする。',
      en: 'Sampling, FFT/PSD, filters and band power on synthetic signals — so you can judge the benefits and risks of each preprocessing step.' },
    goals: [
      { ja: 'ナイキスト周波数とエイリアシングを説明できる', en: 'Explain the Nyquist frequency and aliasing' },
      { ja: 'Welch法でPSDを推定し、ピークを解釈できる', en: 'Estimate a PSD with Welch’s method and interpret peaks' },
      { ja: 'フィルタの選択（帯域・次数・位相）の影響を説明できる', en: 'Explain how filter band, order and phase affect results' },
      { ja: '被験者×電極×帯域のバンドパワー表を作れる', en: 'Build a subject × channel × band power table' },
    ],
    deliverable: { ja: 'フィルタ前後のスペクトル比較図と判断理由（notebooks/02_spectrum_filter.py）', en: 'Before/after-filter spectrum figure with rationale (notebooks/02_spectrum_filter.py)' },
    prereq: ['p2', 'c1'], next: ['c3', 'c4'],
    resources: ['epfl-dsp1', 'mne-tutorials', 'springer-eeg-python', 'drive-eeg-python', 'springer-eeg-feature'],
    lessons: [
      {
        id: 'c2-1', title: { ja: 'サンプリングとエイリアシング', en: 'Sampling & aliasing' },
        keywords: ['Nyquist', 'aliasing', 'anti-aliasing filter', 'downsampling'],
        concept: {
          ja: [
            'サンプリング周波数 fs で記録すると、表現できる最高周波数はナイキスト周波数 fs/2。100 Hz サンプリングなら 50 Hz まで。',
            'fs/2 を超える成分は消えるのではなく、低い周波数に“化けて”混入する（エイリアシング）。だからアンプは記録前にアナログのローパス（アンチエイリアス）フィルタをかける。',
            'ダウンサンプリングする時も同じ。MNE の raw.resample() は内部でローパスをかけてから間引く。単に配列を間引く（x[::4]）のは危険。',
          ],
          en: [
            'At sampling rate fs, the highest representable frequency is the Nyquist frequency fs/2 — 50 Hz at 100 Hz sampling.',
            'Components above fs/2 do not vanish; they fold back into lower frequencies (aliasing). That is why amplifiers apply an analogue low-pass (anti-aliasing) filter before digitising.',
            'The same applies to downsampling: MNE’s raw.resample() low-passes before decimating. Naively slicing x[::4] is dangerous.',
          ],
        },
        visual: { widget: 'sampling', caption: { ja: 'サンプリング周波数を下げていくと、点を結んだ波が別の周波数に見える。', en: 'Lower the sampling rate: the dots start tracing a different frequency.' } },
        practice: {
          task: { ja: '図解で信号 30 Hz・fs 40 Hz にすると、見かけの周波数は何 Hz？ 計算式 |f − k·fs| で確かめよう。', en: 'With a 30 Hz signal and fs = 40 Hz, what is the apparent frequency? Verify with |f − k·fs|.' },
          prompt: { ja: '予測 / 図解の結果 / 計算', en: 'Prediction / visual result / calculation' },
        },
        quiz: [
          { id: 'q1', q: { ja: '100 Hz サンプリングで記録できる最高周波数は？', en: 'Highest frequency at 100 Hz sampling?' },
            options: [{ ja: '50 Hz', en: '50 Hz' }, { ja: '100 Hz', en: '100 Hz' }, { ja: '200 Hz', en: '200 Hz' }], answer: 0,
            explain: { ja: 'ナイキスト周波数 = fs/2。', en: 'Nyquist = fs/2.' } },
          { id: 'q2', q: { ja: 'fs = 40 Hz で 30 Hz の正弦波を記録すると見かけの周波数は？', en: 'A 30 Hz sine sampled at 40 Hz appears as…' },
            options: [{ ja: '10 Hz', en: '10 Hz' }, { ja: '30 Hz', en: '30 Hz' }, { ja: '70 Hz', en: '70 Hz' }], answer: 0,
            explain: { ja: '|30 − 40| = 10 Hz に折り返す。', en: '|30 − 40| = 10 Hz.' } },
        ],
        reflect: { ja: '公開データの fs と、解析したい帯域が両立するか確認する習慣をメモ。', en: 'Note a habit: check that a dataset’s fs supports your band of interest.' },
      },
      {
        id: 'c2-2', title: { ja: 'FFTとパワースペクトル密度（PSD）', en: 'FFT & power spectral density' },
        keywords: ['PSD', 'Welch', 'window', 'log scale', '1/f'],
        concept: {
          ja: [
            '1本の長い FFT はノイジー。Welch 法は信号を重なりのある短い窓に分け、窓関数（Hann等）をかけて FFT し、パワーを平均する。分散が減る代わりに周波数分解能が下がる。',
            'EEG の PSD は一般に周波数が上がるほど下がる「1/f（非周期）成分」に、alpha などの律動ピークが乗った形。帯域パワーの差が「律動の変化」か「1/f の傾きの変化」かを区別する手法（例：specparam/FOOOF）もある。',
            'PSD は対数軸（dB）で見るのが基本。',
          ],
          en: [
            'A single long FFT is noisy. Welch’s method splits the signal into overlapping windows, applies a taper (e.g. Hann), and averages power — lower variance, coarser resolution.',
            'An EEG PSD is typically a falling 1/f (aperiodic) background with rhythmic peaks like alpha on top. Methods such as specparam/FOOOF separate oscillatory peaks from changes in the aperiodic slope.',
            'View PSDs on a log (dB) scale.',
          ],
        },
        visual: { widget: 'spectrum', props: { welch: true }, caption: { ja: '雑音を増やすとスペクトルが荒れる。alpha のピークが 1/f 背景の上に乗る。', en: 'More noise → rougher spectrum. Alpha sits on a 1/f background.' } },
        practice: {
          task: { ja: 'scipy.signal.welch で PSD を推定し、nperseg を 1 秒→4 秒に変えて分解能とノイズの変化を比べよう。', en: 'Estimate a PSD with scipy.signal.welch; compare nperseg = 1 s vs 4 s for resolution and noise.' },
          code: `import numpy as np
from scipy.signal import welch

fs = 250
rng = np.random.default_rng(0)
t = np.arange(0, 60, 1/fs)
# 1/f-like background: cumulative sum of white noise, high-passed by detrending
pink = np.cumsum(rng.standard_normal(t.size)); pink -= np.convolve(pink, np.ones(fs)/fs, 'same')
x = 0.3 * pink + 2.0 * np.sin(2*np.pi*10*t) + rng.standard_normal(t.size)

for seg_sec in (1, 4):
    f, P = welch(x, fs=fs, nperseg=int(seg_sec * fs))
    band = (f >= 8) & (f <= 13)
    print(f"nperseg={seg_sec}s  df={f[1]-f[0]:.2f} Hz  peak={f[band][np.argmax(P[band])]:.2f} Hz")`,
          packages: ['numpy', 'scipy'],
          prompt: { ja: 'nperseg を長くすると何が得られ、何を失う？', en: 'What do you gain and lose with a longer nperseg?' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'Welch 法の主な利点は？', en: 'Main advantage of Welch’s method?' },
            options: [{ ja: 'PSD 推定のばらつきが減る', en: 'Lower variance of the PSD estimate' }, { ja: '分解能が無限に上がる', en: 'Infinite resolution' }], answer: 0,
            explain: { ja: '窓ごとのスペクトルを平均するため。代わりに分解能は窓長で決まる。', en: 'Averaging windows reduces variance; resolution set by window length.' } },
          { id: 'q2', q: { ja: 'alpha 帯パワーが増えた。別の説明として考えるべきは？', en: 'Alpha power rose. An alternative explanation?' },
            options: [{ ja: '1/f 背景（非周期成分）の変化', en: 'A change in the aperiodic 1/f background' }, { ja: '必ず律動が強まった', en: 'Oscillations must have strengthened' }], answer: 0,
            explain: { ja: '背景の傾き・オフセットが変わっても帯域パワーは変わる。', en: 'Shifts in slope/offset alter band power too.' } },
        ],
        reflect: { ja: '1/f 成分について気になったことを疑問に。', en: 'Save a question about the 1/f component.' },
      },
      {
        id: 'c2-3', title: { ja: 'フィルタ：利点とリスク', en: 'Filters: benefits and risks' },
        keywords: ['high-pass', 'low-pass', 'band-pass', 'notch', 'FIR/IIR', 'zero-phase'],
        concept: {
          ja: [
            'ハイパス（例 0.5–1 Hz）は電極のドリフトを除き、ローパス（例 40 Hz）は筋電や高周波雑音を減らす。両方でバンドパス。ノッチは 50/60 Hz を狙い撃ち。',
            'リスク：急峻なフィルタはリンギング（波打ち）を起こし、ERP の形を歪める。強いハイパス（> 0.5 Hz）は遅い成分を消し、偽の効果を生むことがある。因果（片方向）フィルタは位相を遅らせる。',
            '原則：研究目的に必要な帯域だけ残す／フィルタ条件（種類・カットオフ・次数・位相）をMethodsに書く／判断理由を研究ノートに残す。',
          ],
          en: [
            'High-pass (e.g. 0.5–1 Hz) removes drift; low-pass (e.g. 40 Hz) reduces EMG and high-frequency noise; together they form a band-pass. A notch targets 50/60 Hz.',
            'Risks: steep filters ring and distort ERP shapes; aggressive high-pass (> 0.5 Hz) can remove slow components and create spurious effects; causal filters shift phase.',
            'Rules: keep only the band your question needs; report type, cut-offs, order and phase; log your rationale in the notebook.',
          ],
        },
        visual: { widget: 'filter', caption: { ja: 'カットオフを動かして、フィルタ前後の波形とスペクトルを比較。', en: 'Move the cut-offs and compare waveform and spectrum before/after.' } },
        practice: {
          task: { ja: '0.5–40 Hz のバンドパスについて、利点2つ・リスク2つを書こう。ds003478 の安静時 alpha 研究ならどう設定する？', en: 'List two benefits and two risks of a 0.5–40 Hz band-pass. What would you choose for a resting-alpha study on ds003478?' },
          code: `import numpy as np
from scipy.signal import butter, sosfiltfilt, welch

fs = 250
rng = np.random.default_rng(1)
t = np.arange(0, 30, 1/fs)
x = (np.sin(2*np.pi*10*t) + 0.8*np.sin(2*np.pi*50*t)
     + 0.5*np.cumsum(rng.standard_normal(t.size))/50 + 0.3*rng.standard_normal(t.size))

sos = butter(4, [0.5, 40], btype="bandpass", fs=fs, output="sos")
y = sosfiltfilt(sos, x)           # zero-phase (forward + backward)

for name, sig in [("raw", x), ("filtered", y)]:
    f, P = welch(sig, fs=fs, nperseg=2*fs)
    p50 = P[np.argmin(abs(f-50))]; p10 = P[np.argmin(abs(f-10))]
    print(f"{name:9s} power@10Hz={p10:.3f}  power@50Hz={p50:.5f}")`,
          packages: ['numpy', 'scipy'],
          prompt: { ja: '利点:\nリスク:\n自分の設定と理由:', en: 'Benefits:\nRisks:\nMy setting and why:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'sosfiltfilt（順方向＋逆方向）の利点は？', en: 'Advantage of sosfiltfilt (forward–backward)?' },
            options: [{ ja: '位相の遅れがない（ゼロ位相）', en: 'Zero phase shift' }, { ja: 'リアルタイムで使える', en: 'Works in real time' }], answer: 0,
            explain: { ja: 'オフライン解析向け。未来のデータを使うのでリアルタイムBCIには使えない。', en: 'Offline only: it uses future samples, so not for real-time BCI.' } },
          { id: 'q2', q: { ja: 'ERP 解析で 2 Hz の強いハイパスをかけると？', en: 'A strong 2 Hz high-pass in ERP analysis may…' },
            options: [{ ja: '遅い成分を歪め、偽の効果を生みうる', en: 'distort slow components and create artefactual effects' }, { ja: '常に結果が改善する', en: 'always improve results' }], answer: 0,
            explain: { ja: 'P300 などの遅い成分は低周波を含む。', en: 'Slow components like P300 contain low frequencies.' } },
        ],
        reflect: { ja: '前処理の判断で迷った点を研究メモに。', en: 'Log any preprocessing decision you were unsure about.' },
      },
      {
        id: 'c2-4', title: { ja: 'バンドパワー特徴量', en: 'Band-power features' },
        keywords: ['absolute power', 'relative power', 'alpha asymmetry', 'feature table'],
        concept: {
          ja: [
            'バンドパワー＝PSD を帯域内で積分した値。絶対パワー（µV²）は頭蓋の厚さや電極インピーダンスの影響を受けるため、相対パワー（全帯域に対する割合）や対数変換もよく使われる。',
            '前頭 alpha 非対称性（ln F4 − ln F3 など）はうつ研究で長く調べられてきたが、再現性は一貫していない。こうした「結果が揺れている指標」こそ、慎重な追試の価値がある。',
            '機械学習に渡す前に、1行＝1被験者（または1試行）の表を作る。列：subject_id、条件、電極×帯域、共変量（年齢・性別・服薬・記録時刻）。',
          ],
          en: [
            'Band power = PSD integrated over a band. Absolute power (µV²) depends on skull thickness and impedance, so relative power (fraction of total) or log transforms are common.',
            'Frontal alpha asymmetry (e.g. ln F4 − ln F3) has long been studied in depression, but replication is inconsistent — exactly the kind of measure worth a careful replication.',
            'Before ML, build a table with one row per subject (or trial): subject_id, condition, channel × band, covariates (age, sex, medication, recording time).',
          ],
        },
        visual: { widget: 'bands', caption: { ja: '開眼／閉眼を切り替えて帯域パワーの変化を観察。', en: 'Toggle eyes open/closed and watch band powers change.' } },
        practice: {
          task: { ja: 'notebooks/02_spectrum_filter.py を参考に、被験者ごとに1行のバンドパワー表の列名を設計しよう。', en: 'Using notebooks/02_spectrum_filter.py as a guide, design the columns of a one-row-per-subject band-power table.' },
          prompt: { ja: '列名の案（共変量を含む）:', en: 'Proposed columns (incl. covariates):' },
        },
        quiz: [
          { id: 'q1', q: { ja: '相対パワーを使う理由は？', en: 'Why use relative power?' },
            options: [{ ja: '個人差（頭蓋・インピーダンス）による全体スケールの違いを減らす', en: 'Reduce overall scale differences between people' }, { ja: '計算が速い', en: 'Faster computation' }], answer: 0,
            explain: { ja: 'ただし、ある帯域が増えると他が相対的に減るという制約が生じる。', en: 'But bands become interdependent (they sum to 1).' } },
          { id: 'q2', q: { ja: '試行ごとに1行の表を作った場合、評価時に注意すべきは？', en: 'With one row per trial, what must you watch during evaluation?' },
            options: [{ ja: '同一被験者の試行が学習とテストに分かれないようにする', en: 'Keep each subject’s trials on one side of the split' }, { ja: '特になし', en: 'Nothing special' }], answer: 0,
            explain: { ja: 'C4 で学ぶデータリークの典型。', en: 'The classic leakage covered in C4.' } },
        ],
        reflect: { ja: '前頭 alpha 非対称性について読みたい論文を疑問として保存。', en: 'Save a question about frontal alpha asymmetry papers to read.' },
      },
    ],
  },

  {
    id: 'c3', code: 'C3', section: 'core', color: '#d6456b',
    title: { ja: 'Python×MNEで実データ解析', en: 'Real EEG with Python & MNE' },
    summary: { ja: 'MNE-Python の Raw/Events/Epochs を理解し、PhysioNet 運動イメージデータで CSP+LDA ベースラインを再現する。',
      en: 'Understand MNE’s Raw/Events/Epochs and reproduce a CSP+LDA baseline on the PhysioNet motor-imagery dataset.' },
    goals: [
      { ja: 'Raw の channels・sfreq・duration・annotations を確認できる', en: 'Inspect channels, sfreq, duration and annotations in Raw' },
      { ja: '読み込み→QC→前処理→Epochs→可視化の順序を説明できる', en: 'Explain load → QC → preprocess → epochs → visualise' },
      { ja: '公式例を実行し、評価方法の前提（被験者内）を指摘できる', en: 'Run the official example and point out its evaluation assumption (within-subject)' },
    ],
    deliverable: { ja: '再現Notebook v1：PhysioNet MI 被験者1の CSP+LDA（環境・版・seedを記録）', en: 'Replication notebook v1: CSP+LDA on PhysioNet MI subject 1 (env, versions, seeds logged)' },
    prereq: ['c2'], next: ['c4', 'c7'],
    resources: ['mne-tutorials', 'mne-csp', 'drive-mne-intro', 'drive-mne-csp', 'physionet-mi', 'moabb'],
    lessons: [
      {
        id: 'c3-1', title: { ja: 'Raw・Events・Epochs', en: 'Raw, Events, Epochs' },
        keywords: ['mne.io.read_raw_edf', 'annotations', 'events', 'Epochs', 'baseline'],
        concept: {
          ja: [
            'Raw：連続データ（チャネル×時間）とメタ情報 info（sfreq、ch_names、bads）。Annotations／Events：刺激や課題の時刻とラベル。Epochs：イベント前後を切り出した 試行×チャネル×時間 の3次元配列。',
            'PhysioNet eegmmidb では T0=安静、T1/T2 の意味が run によって変わる（例：run 6,10,14 では T1=両手、T2=両足のイメージ）。ラベルの定義は必ず原典のドキュメントで確認する。',
            '最初にやること：print(raw.info)、raw.plot()、raw.compute_psd().plot() で「何が記録されているか」を目で確認。いきなり分類しない。',
          ],
          en: [
            'Raw: continuous data (channels × time) plus info (sfreq, ch_names, bads). Annotations/Events: times and labels of stimuli. Epochs: trials × channels × time cut around events.',
            'In PhysioNet eegmmidb, T0 = rest while T1/T2 meanings depend on the run (e.g. runs 6, 10, 14: T1 = both fists, T2 = both feet imagery). Always confirm label definitions in the source documentation.',
            'First: print(raw.info), raw.plot(), raw.compute_psd().plot() — look at what was recorded before classifying anything.',
          ],
        },
        visual: { widget: 'pipeline', props: { kind: 'mne' }, caption: { ja: 'MNE の基本データ構造の流れ。', en: 'Flow of MNE’s core data structures.' } },
        practice: {
          task: { ja: 'ローカル環境（pip install mne）で以下を実行し、チャネル数・sfreq・記録時間・アノテーションの種類をメモしよう。※データは PhysioNet から自動ダウンロード（約数MB）。', en: 'Locally (pip install mne), run this and note channel count, sfreq, duration and annotation labels. Data downloads from PhysioNet (a few MB).' },
          code: `import mne
from mne.datasets import eegbci

files = eegbci.load_data(subjects=1, runs=[6, 10, 14])
raw = mne.concatenate_raws([mne.io.read_raw_edf(f, preload=True) for f in files])
eegbci.standardize(raw)
raw.set_montage("standard_1005")

print(raw.info)
print("duration (s):", raw.times[-1])
print("labels:", set(raw.annotations.description))
raw.compute_psd(fmax=60).plot()`,
          prompt: { ja: 'channels:\nsfreq:\nduration:\nlabels:\n気づき:', en: 'channels:\nsfreq:\nduration:\nlabels:\nobservations:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'Epochs のデータ形状は？', en: 'Shape of Epochs data?' },
            options: [{ ja: '試行 × チャネル × 時間', en: 'trials × channels × time' }, { ja: 'チャネル × 時間', en: 'channels × time' }, { ja: '被験者 × 特徴量', en: 'subjects × features' }], answer: 0,
            explain: { ja: 'epochs.get_data() は3次元配列を返す。', en: 'epochs.get_data() returns a 3-D array.' } },
          { id: 'q2', q: { ja: 'eegmmidb の T1 の意味について正しいのは？', en: 'About T1 in eegmmidb:' },
            options: [{ ja: 'run によって意味が異なるので原典を確認する', en: 'Its meaning depends on the run — check the docs' }, { ja: '常に左手', en: 'Always left fist' }], answer: 0,
            explain: { ja: 'ラベル誤解は再現失敗の典型的原因。', en: 'Misread labels are a classic cause of failed replication.' } },
        ],
        reflect: { ja: 'データを最初に見たときの気づき・違和感を保存。', en: 'Save your first impressions or anything odd in the data.' },
      },
      {
        id: 'c3-2', title: { ja: '前処理と品質管理（QC）', en: 'Preprocessing & quality control' },
        keywords: ['bad channels', 'ICA', 'rejection', 'preprocessing log'],
        concept: {
          ja: [
            '推奨順序の一例：①不良チャネルの確認・補間 → ②フィルタ（ハイパス／ローパス、必要ならノッチ） → ③再参照 → ④ICAで瞬目・心電成分を除去（1 Hz ハイパスしたコピーで学習するのが定石） → ⑤エポック化と振幅基準での除外。',
            '前処理は「研究者の自由度」が大きい。後から結果を見て変えると、偶然の結果を拾いやすくなる。事前に方針を書き、除外した試行・被験者数を必ず報告する。',
            'QCレポート（除外数、ICAで除いた成分、各被験者の残り試行数）を自動で出力すると、追試者が判断を検証できる。',
          ],
          en: [
            'One recommended order: ① inspect/interpolate bad channels → ② filter (high/low-pass, notch if needed) → ③ re-reference → ④ ICA to remove blink/ECG components (fit on a 1 Hz high-passed copy) → ⑤ epoch and reject by amplitude.',
            'Preprocessing has many “researcher degrees of freedom”. Changing it after seeing results invites false positives. Pre-specify, and always report excluded trials/subjects.',
            'Auto-generate a QC report (exclusions, removed ICA components, remaining trials per subject) so replicators can check your choices.',
          ],
        },
        visual: { widget: 'artifacts', props: { cleanable: true }, caption: { ja: '雑音を加えた後、除去手順を順に適用して効果を確認。', en: 'Add noise, then apply cleaning steps in order.' } },
        practice: {
          task: { ja: '自分の前処理パイプラインを「手順｜パラメータ｜理由｜リスク」の表で書こう（ds003478 安静時データを想定）。', en: 'Write your pipeline as “step | parameters | reason | risk” (assume ds003478 resting data).' },
          prompt: { ja: '手順｜パラメータ｜理由｜リスク\n1.\n2.\n3.\n4.\n5.', en: 'step | params | reason | risk\n1.\n2.\n3.\n4.\n5.' },
          draftSection: 'methods',
        },
        quiz: [
          { id: 'q1', q: { ja: 'ICA の学習用に 1 Hz ハイパスしたコピーを使う理由は？', en: 'Why fit ICA on a 1 Hz high-passed copy?' },
            options: [{ ja: '遅いドリフトがICA分解を不安定にするため', en: 'Slow drifts destabilise the decomposition' }, { ja: '計算を速くするため', en: 'Speed only' }], answer: 0,
            explain: { ja: '学習した分解行列は元データ（弱いハイパス）に適用できる。', en: 'The learned unmixing can be applied to the original data.' } },
          { id: 'q2', q: { ja: '結果を見てから除外基準を変更すると？', en: 'Changing exclusion criteria after seeing results…' },
            options: [{ ja: '偽陽性のリスクが上がる', en: 'inflates false positives' }, { ja: '必ず正確になる', en: 'always improves accuracy' }], answer: 0,
            explain: { ja: '「分岐する道の庭（garden of forking paths）」問題。', en: 'The garden-of-forking-paths problem.' } },
        ],
        reflect: { ja: '前処理で自分が一番迷いそうな判断は？', en: 'Which preprocessing decision will you struggle with most?' },
      },
      {
        id: 'c3-3', title: { ja: '再現実験：CSP＋LDA', en: 'Replication: CSP + LDA' },
        keywords: ['CSP', 'LDA', 'motor imagery', 'ERD/ERS', 'chance level'],
        concept: {
          ja: [
            '運動イメージ中は対応する感覚運動野で mu/beta 帯のパワーが下がる（ERD）。CSP は2クラス間で分散（パワー）の比が最大になる空間フィルタを学習し、その対数分散を LDA で分類する。',
            'MNE 公式例（Drive の 06_MNE_CSP_演習コード.zip と同じ、BSD-3）は被験者1人の試行を ShuffleSplit で分割する「被験者内」評価。これは「この人の別の試行を当てられるか」であり、「新しい人に使えるか」ではない。',
            '再現の記録：MNE/Python/scikit-learn のバージョン、seed、runs、フィルタ帯域、tmin/tmax、CV方式、チャンスレベル。これがないと第三者は追試できない。',
          ],
          en: [
            'During motor imagery, mu/beta power drops over the corresponding sensorimotor cortex (ERD). CSP learns spatial filters maximising the variance ratio between two classes; LDA classifies the log-variance features.',
            'The official MNE example (same as your Drive ZIP, BSD-3) splits one subject’s trials with ShuffleSplit — a within-subject evaluation. It answers “can we decode this person’s other trials?”, not “does it work on a new person?”.',
            'Log for replication: MNE/Python/scikit-learn versions, seed, runs, filter band, tmin/tmax, CV scheme, chance level. Without these nobody can reproduce you.',
          ],
        },
        visual: { widget: 'pipeline', props: { kind: 'csp' }, caption: { ja: 'CSP+LDA パイプライン。CSP は必ず学習データだけで fit する。', en: 'CSP+LDA pipeline. CSP must be fit on training data only.' } },
        practice: {
          task: { ja: 'MNE 公式例を実行して精度とチャンスレベルを記録。次に被験者を 1→2,3 に変えて精度のばらつきをメモしよう。', en: 'Run the official MNE example and log accuracy and chance level. Then try subjects 2 and 3 and note the variability.' },
          code: `# Official example (BSD-3): https://mne.tools/stable/auto_examples/decoding/decoding_csp_eeg.html
# Below: a compact NeuroAtlas wrapper that logs what a replicator needs.
import platform, numpy as np, mne, sklearn
from mne.datasets import eegbci
from mne.decoding import CSP
from sklearn.pipeline import Pipeline
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.model_selection import ShuffleSplit, cross_val_score

def run(subject, seed=42):
    files = eegbci.load_data(subject, [6, 10, 14])
    raw = mne.concatenate_raws([mne.io.read_raw_edf(f, preload=True, verbose=False) for f in files])
    eegbci.standardize(raw); raw.set_montage("standard_1005")
    raw.annotations.rename(dict(T1="hands", T2="feet"))
    raw.filter(7., 30., fir_design="firwin", verbose=False)
    ep = mne.Epochs(raw, event_id=["hands", "feet"], tmin=1., tmax=2., baseline=None,
                    picks="eeg", preload=True, verbose=False)
    X, y = ep.get_data(copy=False), ep.events[:, -1]
    clf = Pipeline([("csp", CSP(n_components=4, log=True)), ("lda", LDA())])
    cv = ShuffleSplit(10, test_size=0.2, random_state=seed)
    s = cross_val_score(clf, X, y, cv=cv)
    chance = max(np.mean(y == y[0]), 1 - np.mean(y == y[0]))
    return s.mean(), s.std(), chance

print("python", platform.python_version(), "mne", mne.__version__, "sklearn", sklearn.__version__)
for subj in (1, 2, 3):
    m, sd, ch = run(subj)
    print(f"subject {subj}: acc={m:.2f}±{sd:.2f}  chance={ch:.2f}")`,
          prompt: { ja: '環境:\n被験者ごとの精度:\nチャンスレベル:\nこの評価で言えること/言えないこと:', en: 'Environment:\nAccuracy per subject:\nChance:\nWhat this evaluation can / cannot claim:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'MNE の CSP 例の評価は何を示す？', en: 'The MNE CSP example’s evaluation shows…' },
            options: [{ ja: '同一被験者の未知試行への汎化', en: 'Generalisation to unseen trials of the same subject' }, { ja: '新しい被験者への汎化', en: 'Generalisation to new subjects' }], answer: 0,
            explain: { ja: '被験者間汎化を主張するには leave-subject-out が必要。', en: 'Cross-subject claims need leave-subject-out CV.' } },
          { id: 'q2', q: { ja: 'CSP を全データで fit してから交差検証すると？', en: 'Fitting CSP on all data before cross-validation…' },
            options: [{ ja: 'テスト情報が漏れて精度が過大評価される', en: 'leaks test information and inflates accuracy' }, { ja: '問題ない', en: 'is fine' }], answer: 0,
            explain: { ja: 'CSP は教師あり。Pipeline に入れて fold ごとに fit する。', en: 'CSP is supervised; put it in the Pipeline so it is fit per fold.' } },
          { id: 'q3', q: { ja: '2クラスが 60:40 のときのチャンスレベルは？', en: 'Chance level with a 60:40 class split?' },
            options: [{ ja: '0.5', en: '0.5' }, { ja: '0.6', en: '0.6' }], answer: 1,
            explain: { ja: '多数派を常に答えるだけで 0.6 になる。', en: 'Always guessing the majority gives 0.6.' } },
        ],
        reflect: { ja: '再現できた／できなかった点と、その理由の仮説を保存。', en: 'Save what replicated, what didn’t, and your hypothesis why.' },
      },
    ],
  },

  {
    id: 'c4', code: 'C4', section: 'core', color: '#8e44ad',
    title: { ja: '機械学習と信頼できる評価', en: 'Machine Learning & Trustworthy Evaluation' },
    summary: { ja: '分類・交差検証・データリーク・被験者独立分割・評価指標を学び、「高精度」の主張を疑えるようにする。',
      en: 'Classification, cross-validation, leakage, subject-independent splits and metrics — learn to interrogate “high accuracy” claims.' },
    goals: [
      { ja: 'Pipeline と交差検証で前処理込みの評価を書ける', en: 'Evaluate with preprocessing inside a Pipeline + CV' },
      { ja: '試行単位分割で起きるリークを実演・説明できる', en: 'Demonstrate and explain trial-level leakage' },
      { ja: 'accuracy / balanced accuracy / AUC を使い分けられる', en: 'Choose between accuracy, balanced accuracy and AUC' },
    ],
    deliverable: { ja: '被験者単位 GroupKFold の評価 Notebook（notebooks/03_subject_wise_cv.py）', en: 'Subject-wise GroupKFold notebook (notebooks/03_subject_wise_cv.py)' },
    prereq: ['c2', 'p2'], next: ['c6', 'c7', 'e2'],
    resources: ['sklearn-pitfalls', 'islp', 'stanford-statlearn', 'mitx-ml', 'dl-ml-specialization', 'moabb'],
    lessons: [
      {
        id: 'c4-1', title: { ja: '分類と交差検証', en: 'Classification & cross-validation' },
        keywords: ['train/test', 'k-fold', 'Pipeline', 'overfitting', 'regularisation'],
        concept: {
          ja: [
            'モデルの性能は「学習に使っていないデータ」で測る。k分割交差検証は、データを k 個に分け、1つをテスト、残りを学習に使うことを k 回繰り返す。',
            '標準化・特徴選択・CSP・PCA など、データから何かを“学ぶ”前処理はすべて学習データだけで fit する。scikit-learn の Pipeline に入れれば fold ごとに自動で正しく扱われる。',
            '特徴量が多くサンプルが少ない（EEGでは典型）と過学習しやすい。正則化（L2、shrinkage LDA）と単純なベースラインから始める。',
          ],
          en: [
            'Measure performance on data not used for training. k-fold CV splits data into k parts, testing on one and training on the rest, k times.',
            'Anything learned from data — scaling, feature selection, CSP, PCA — must be fit on training folds only. A scikit-learn Pipeline handles this per fold automatically.',
            'Many features and few samples (typical for EEG) invite overfitting. Start with regularisation (L2, shrinkage LDA) and simple baselines.',
          ],
        },
        visual: { widget: 'pipeline', props: { kind: 'cv' }, caption: { ja: '5分割交差検証の模式図。', en: 'Schematic of 5-fold cross-validation.' } },
        practice: {
          task: { ja: '「全データで標準化してから CV」と「Pipeline 内で標準化」を比較するコードを実行し、差を確認しよう（特徴選択で差が顕著になる）。', en: 'Run code comparing “select features on all data, then CV” vs “inside a Pipeline”. Observe the gap.' },
          code: `import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
X = rng.standard_normal((60, 2000))   # 60 samples, 2000 pure-noise features
y = rng.integers(0, 2, 60)            # random labels: true accuracy = 0.5

# WRONG: feature selection sees all labels before CV
X_sel = SelectKBest(f_classif, k=20).fit_transform(X, y)
wrong = cross_val_score(LogisticRegression(max_iter=1000), X_sel, y, cv=5).mean()

# RIGHT: selection happens inside each training fold
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression(max_iter=1000))
right = cross_val_score(pipe, X, y, cv=5).mean()
print(f"leaky = {wrong:.2f}   correct = {right:.2f}   (truth = 0.50)")`,
          packages: ['numpy', 'scikit-learn'],
          prompt: { ja: 'leaky と correct の差はなぜ生まれた？', en: 'Why do leaky and correct differ?' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'ラベルがランダムなのに精度 0.85。最も疑うべきは？', en: 'Random labels yet 0.85 accuracy. Most likely cause?' },
            options: [{ ja: 'データリーク', en: 'Data leakage' }, { ja: '優れたモデル', en: 'An excellent model' }], answer: 0,
            explain: { ja: '真の精度は0.5のはず。前処理がテスト情報を見ている。', en: 'True accuracy is 0.5; preprocessing saw test labels.' } },
          { id: 'q2', q: { ja: 'Pipeline を使う最大の理由は？', en: 'Main reason to use a Pipeline?' },
            options: [{ ja: '前処理を fold ごとに学習データだけで fit するため', en: 'Fit preprocessing on training folds only' }, { ja: 'コードを短くするため', en: 'Shorter code' }], answer: 0,
            explain: { ja: 'リーク防止の基本装置。', en: 'The basic anti-leakage device.' } },
        ],
        reflect: { ja: 'このレッスンのアハ体験を保存しよう。', en: 'Save your aha from this lesson.' },
      },
      {
        id: 'c4-2', title: { ja: 'データリークと被験者独立分割', en: 'Leakage & subject-independent splits' },
        keywords: ['GroupKFold', 'leave-one-subject-out', 'identity leakage', 'nested CV'],
        concept: {
          ja: [
            'EEG では同じ人の試行同士がよく似ている（頭の形、インピーダンス、個人固有の律動）。試行をランダムに分割すると、モデルは「病気」ではなく「誰か」を覚えて高精度を出してしまう。',
            '診断のような被験者レベルのラベルを予測するなら、必ず被験者単位で分割（GroupKFold、Leave-One-Subject-Out）。ハイパーパラメータ調整もするなら入れ子CV（nested CV）。',
            '他のリーク源：時間的に隣接した窓の分割、記録日・施設とラベルの交絡、全データでの正規化、テスト結果を見てからの特徴選択。',
          ],
          en: [
            'Trials from the same person look alike (head shape, impedance, idiosyncratic rhythms). Random trial splits let the model learn who someone is, not their condition — producing inflated accuracy.',
            'For subject-level labels like diagnosis, always split by subject (GroupKFold, leave-one-subject-out). If tuning hyperparameters, use nested CV.',
            'Other leaks: overlapping time windows across folds, site/date confounded with labels, normalising on all data, choosing features after seeing test results.',
          ],
        },
        visual: { widget: 'leakage', caption: { ja: '真の効果がゼロのデータでも、試行単位分割だと高精度が出る。被験者単位分割と比較しよう。', en: 'Even with zero true effect, trial-wise splits score high. Compare with subject-wise splits.' } },
        practice: {
          task: { ja: '図解で「個人差の大きさ」を上げ、試行単位と被験者単位の精度の差がどう変わるか観察。notebooks/03_subject_wise_cv.py をローカルで実行し同じ現象を確認しよう。', en: 'Increase “individual differences” in the visual and watch the gap grow. Run notebooks/03_subject_wise_cv.py locally to confirm.' },
          code: `import numpy as np
from sklearn.model_selection import KFold, GroupKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier

rng = np.random.default_rng(7)
n_sub, n_trials, n_feat = 20, 40, 10
fingerprints = rng.normal(0, 2.0, (n_sub, n_feat))      # person-specific signature
labels_sub = np.repeat([0, 1], n_sub // 2)               # diagnosis per subject, NO real effect
X = np.vstack([fp + rng.normal(0, 1, (n_trials, n_feat)) for fp in fingerprints])
y = np.repeat(labels_sub, n_trials)
groups = np.repeat(np.arange(n_sub), n_trials)

clf = KNeighborsClassifier(5)
trial = cross_val_score(clf, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()
subj = cross_val_score(clf, X, y, cv=GroupKFold(5), groups=groups).mean()
print(f"trial-wise split  : {trial:.2f}   <- leakage")
print(f"subject-wise split: {subj:.2f}   <- honest (truth = 0.50)")`,
          packages: ['numpy', 'scikit-learn'],
          prompt: { ja: '結果と、論文の Methods で確認すべき一文:', en: 'Result, and the sentence to look for in a paper’s Methods:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'うつ病 vs 健常の分類で正しい分割は？', en: 'Correct split for depression vs control classification?' },
            options: [{ ja: '被験者単位（GroupKFold）', en: 'By subject (GroupKFold)' }, { ja: '試行単位の KFold（shuffle）', en: 'Shuffled trial-wise KFold' }], answer: 0,
            explain: { ja: 'ラベルは被験者に属する。同じ人が両側にいると個人識別でリークする。', en: 'The label belongs to the subject; sharing people across folds leaks identity.' } },
          { id: 'q2', q: { ja: 'ハイパーパラメータを CV の平均精度で選び、その精度を報告。問題は？', en: 'You pick hyperparameters by CV score and report that same score. Problem?' },
            options: [{ ja: '楽観的バイアス。入れ子CVか独立テストが必要', en: 'Optimistic bias; use nested CV or a held-out test' }, { ja: '問題ない', en: 'None' }], answer: 0,
            explain: { ja: '選択に使ったデータで評価すると過大評価になる。', en: 'Evaluating on data used for selection overestimates.' } },
        ],
        reflect: { ja: '読んだことのある論文で、分割方法が気になったものは？ 疑問として保存。', en: 'Any paper whose split you now doubt? Save it as a question.' },
      },
      {
        id: 'c4-3', title: { ja: '評価指標：accuracy の罠', en: 'Metrics: the accuracy trap' },
        keywords: ['balanced accuracy', 'sensitivity', 'specificity', 'AUC', 'calibration'],
        concept: {
          ja: [
            'クラスが不均衡（例：健常90%、うつ10%）なら、常に「健常」と答えるだけで accuracy 90%。balanced accuracy（感度と特異度の平均）なら 50% になる。',
            'AUC は閾値に依存しない順位の良さ。臨床応用を考えるなら、感度・特異度・陽性的中率（有病率に依存）・較正（予測確率の当たり具合）も重要。',
            '報告するなら：指標の平均と分散（fold間・被験者間）、チャンスレベル、置換検定（ラベルをシャッフルした分布）との比較。予測モデル研究は TRIPOD+AI に沿って書く。',
          ],
          en: [
            'With imbalance (e.g. 90% control, 10% depressed), always answering “control” gives 90% accuracy. Balanced accuracy (mean of sensitivity and specificity) gives 50%.',
            'AUC measures ranking quality independent of threshold. For clinical relevance also report sensitivity, specificity, PPV (depends on prevalence) and calibration.',
            'Report mean and spread across folds/subjects, the chance level and a permutation test. Follow TRIPOD+AI for prediction-model studies.',
          ],
        },
        visual: { widget: 'imbalance', caption: { ja: '有病率とモデルの感度・特異度を動かして、accuracy と balanced accuracy、PPV を比較。', en: 'Move prevalence, sensitivity and specificity; compare accuracy, balanced accuracy and PPV.' } },
        practice: {
          task: { ja: '図解で有病率 5%、感度 90%、特異度 90% のとき PPV はいくら？ 臨床スクリーニングでの意味を書こう。', en: 'With 5% prevalence and 90% sensitivity/specificity, what is the PPV? What does it mean for screening?' },
          prompt: { ja: 'PPV =\n意味:', en: 'PPV =\nMeaning:' },
        },
        quiz: [
          { id: 'q1', q: { ja: '健常95%のデータで accuracy 95%。言えることは？', en: '95% accuracy when 95% are controls. You can say…' },
            options: [{ ja: '何も学習していない可能性がある', en: 'The model may have learned nothing' }, { ja: '優秀な診断モデル', en: 'An excellent diagnostic model' }], answer: 0,
            explain: { ja: 'balanced accuracy や AUC を確認する。', en: 'Check balanced accuracy or AUC.' } },
          { id: 'q2', q: { ja: 'PPV が有病率に依存する理由は？', en: 'Why does PPV depend on prevalence?' },
            options: [{ ja: '有病率が低いと偽陽性の絶対数が真陽性を上回りやすい', en: 'At low prevalence, false positives can outnumber true positives' }, { ja: '依存しない', en: 'It does not' }], answer: 0,
            explain: { ja: 'ベイズの定理そのもの。', en: 'That is Bayes’ theorem.' } },
        ],
        reflect: { ja: '「精度○%」という見出しを見たら確認する項目リストを作ろう。', en: 'Write a checklist for when you see “X% accuracy” headlines.' },
      },
    ],
  },
];
