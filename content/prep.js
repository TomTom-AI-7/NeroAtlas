// PREP section — foundations. All explanatory text is original to NeuroAtlas.

export const PREP = [
  {
    id: 'p1', code: 'P1', section: 'prep', color: '#7c5cff',
    title: { ja: '脳とニューロンの基礎', en: 'Brain & Neuron Foundations' },
    summary: {
      ja: 'EEGを理解する前提となる、膜電位・活動電位・シナプス・脳回路を押さえる。',
      en: 'Membrane potential, spikes, synapses and circuits — the prerequisites for understanding EEG.' },
    goals: [
      { ja: 'ニューロンの入力→統合→発火→出力を図で説明できる', en: 'Explain input → integration → firing → output with a diagram' },
      { ja: '興奮性・抑制性シナプスがネットワークの活動をどう変えるか予測できる', en: 'Predict how excitation/inhibition shapes network activity' },
      { ja: '前頭前野・扁桃体・海馬の役割と、機能局在の考え方の限界を述べられる', en: 'Describe PFC, amygdala, hippocampus and limits of localisation' },
    ],
    deliverable: { ja: 'ニューロンの入力→発火→出力の図と200字の説明（研究ノート）', en: 'Neuron I/O diagram + short explanation (notebook)' },
    prereq: [], next: ['c1', 'p2'],
    resources: ['harvardx-neuro1', 'harvardx-neuro2', 'mit-901', 'harvardx-neuro3', 'duke-medneuro'],
    lessons: [
      {
        id: 'p1-1',
        title: { ja: '膜電位と活動電位', en: 'Membrane potential & the action potential' },
        keywords: ['resting potential', 'threshold', 'Na⁺/K⁺', 'refractory period'],
        concept: {
          ja: [
            'ニューロンの細胞膜の内外にはイオン濃度の差があり、静止時の内側は外側に比べて約 −70 mV。これが静止膜電位。',
            '樹状突起に入った入力（シナプス電流）が細胞体で足し合わされ、膜電位が閾値（約 −55 mV）を超えると、電位依存性 Na⁺ チャネルが一気に開き、活動電位（スパイク）が発生する。その後 K⁺ の流出で再分極し、不応期を経て元に戻る。',
            '大事なのは「全か無か」：スパイクの大きさはほぼ一定で、情報は主に発火の“頻度とタイミング”に乗る。',
            'EEGへの橋渡し：頭皮EEGが拾うのは主に個々のスパイクではなく、多数の錐体細胞で同期したシナプス後電位の総和。スパイクは短すぎ（約1 ms）、向きもばらばらで頭皮では打ち消し合いやすい。',
          ],
          en: [
            'Ion concentration differences across the membrane keep the inside of a neuron at about −70 mV: the resting potential.',
            'Synaptic currents arriving at dendrites are summed at the soma. If the membrane potential crosses threshold (≈ −55 mV), voltage-gated Na⁺ channels open and a spike fires; K⁺ efflux repolarises the cell, followed by a refractory period.',
            'Spikes are all-or-none: their size is roughly fixed, so information rides mainly on firing rate and timing.',
            'Bridge to EEG: scalp EEG mostly reflects summed, synchronised post-synaptic potentials of many pyramidal cells — not individual spikes, which are brief (~1 ms) and tend to cancel at the scalp.',
          ],
        },
        visual: { widget: 'neuron', caption: {
          ja: '積分発火（LIF）モデル。入力電流を上げると発火頻度が上がり、閾値付近ではわずかな差で発火が決まる。',
          en: 'Leaky integrate-and-fire model. More input current → higher firing rate; near threshold, tiny changes decide firing.' } },
        practice: {
          task: {
            ja: '図解で入力電流を 0 から少しずつ上げ、「初めて発火する電流」と「発火頻度が入力に比例しなくなる理由（不応期）」をメモしよう。次に、下のPythonコードで同じモデルを動かして発火回数を数える。',
            en: 'In the visual, raise the input current from 0 and note (a) the first current that produces spikes and (b) why rate stops growing linearly (refractory period). Then run the Python model below and count spikes.' },
          code: `import numpy as np

# Leaky integrate-and-fire neuron (original NeuroAtlas exercise)
dt, T = 0.1, 500.0            # ms
tau, R = 10.0, 1.0            # membrane time constant (ms), resistance
v_rest, v_th, v_reset = -70.0, -55.0, -75.0
t_ref = 2.0                    # refractory period (ms)

def simulate(I):
    v, last_spike, spikes = v_rest, -1e9, []
    for step in range(int(T / dt)):
        t = step * dt
        if t - last_spike < t_ref:
            continue
        v += dt / tau * (-(v - v_rest) + R * I)
        if v >= v_th:
            spikes.append(t); v = v_reset; last_spike = t
    return spikes

for I in [10, 15, 16, 20, 30, 60]:
    n = len(simulate(I))
    print(f"I={I:>3}  spikes={n:>3}  rate={n / (T/1000):6.1f} Hz")`,
          packages: ['numpy'],
          prompt: { ja: '閾値電流はいくつ？ 発火頻度が頭打ちになる理由は？', en: 'What is the threshold current? Why does the rate saturate?' },
        },
        quiz: [
          { id: 'q1', q: { ja: '頭皮EEGの主な発生源として最も適切なのは？', en: 'What is the main generator of scalp EEG?' },
            options: [
              { ja: '個々のニューロンの活動電位', en: 'Individual action potentials' },
              { ja: '多数の錐体細胞の同期したシナプス後電位', en: 'Synchronised post-synaptic potentials of many pyramidal cells' },
              { ja: 'グリア細胞の代謝', en: 'Glial metabolism' },
              { ja: '血流の変化', en: 'Blood-flow changes' } ],
            answer: 1, explain: { ja: '平行に並ぶ錐体細胞の同期した電流が足し合わされて頭皮で測れる大きさになる。血流はfMRI/fNIRSの対象。', en: 'Parallel pyramidal cells summing synchronous currents produce scalp-measurable fields. Blood flow is what fMRI/fNIRS track.' } },
          { id: 'q2', q: { ja: '活動電位が「全か無か」であることから言えるのは？', en: 'Because spikes are all-or-none…' },
            options: [
              { ja: '情報は主に発火頻度やタイミングで表される', en: 'information is mainly coded in rate and timing' },
              { ja: '入力が強いほどスパイクの振幅が大きくなる', en: 'stronger input makes taller spikes' },
              { ja: 'ニューロンは情報を伝えられない', en: 'neurons cannot carry information' } ],
            answer: 0, explain: { ja: '振幅はほぼ一定。強い入力は発火の頻度を上げる。', en: 'Amplitude is ~fixed; stronger input raises firing rate.' } },
          { id: 'q3', q: { ja: '不応期の役割として正しいのは？', en: 'What does the refractory period do?' },
            options: [
              { ja: '最大発火頻度に上限を与える', en: 'Caps the maximum firing rate' },
              { ja: '静止膜電位を上げる', en: 'Raises the resting potential' },
              { ja: 'シナプスを増やす', en: 'Creates synapses' } ],
            answer: 0, explain: { ja: '直後に再発火できないため、頻度は入力に比例して無限には増えない。', en: 'The cell cannot refire immediately, so rate saturates.' } },
        ],
        reflect: { ja: '「EEGは脳の何を見ていて、何を見ていないか」を自分の言葉で1文に。', en: 'In one sentence: what does EEG see, and what does it miss?' },
      },
      {
        id: 'p1-2',
        title: { ja: 'シナプス：興奮と抑制のバランス', en: 'Synapses: excitation–inhibition balance' },
        keywords: ['EPSP', 'IPSP', 'glutamate', 'GABA', 'E/I balance'],
        concept: {
          ja: [
            '化学シナプスでは、前ニューロンの発火で神経伝達物質が放出され、後ニューロンに興奮性（EPSP、主にグルタミン酸）または抑制性（IPSP、主にGABA）の電位変化が起こる。',
            '脳の回路は興奮と抑制が釣り合った状態（E/Iバランス）で動作する。抑制性介在ニューロンは発火のタイミングを揃え、ガンマ帯などの律動（オシレーション）を生む役割を持つ。',
            'EEGの律動は、この興奮・抑制ループの同期の“影”として現れる。だから「alpha が強い＝この病気」という一対一対応は成り立たず、どの回路の、どの状態の変化なのかを常に考える必要がある。',
          ],
          en: [
            'At chemical synapses, a presynaptic spike releases neurotransmitter, producing an excitatory (EPSP, mostly glutamate) or inhibitory (IPSP, mostly GABA) potential in the postsynaptic cell.',
            'Circuits operate near an excitation–inhibition (E/I) balance. Inhibitory interneurons align spike timing and help generate oscillations such as gamma rhythms.',
            'EEG rhythms are a shadow of these E/I loops synchronising. So “strong alpha = disease X” is never a one-to-one mapping; always ask which circuit and which state changed.',
          ],
        },
        visual: { widget: 'neuron', props: { showInhibition: true }, caption: {
          ja: '抑制入力を加えると、同じ興奮入力でも発火頻度が下がる。', en: 'Adding inhibition lowers the firing rate for the same excitatory drive.' } },
        practice: {
          task: { ja: '仮説を立てよう：「抑制を2倍にすると発火頻度はどう変わるか？」図解で確かめ、予測と結果の差をメモ。', en: 'Make a prediction: what happens to firing rate if inhibition doubles? Test it in the visual and note the gap between prediction and result.' },
          prompt: { ja: '予測 → 結果 → 差の理由', en: 'Prediction → result → why they differ' },
        },
        quiz: [
          { id: 'q1', q: { ja: '主要な抑制性神経伝達物質は？', en: 'Main inhibitory neurotransmitter?' },
            options: [{ ja: 'グルタミン酸', en: 'Glutamate' }, { ja: 'GABA', en: 'GABA' }, { ja: 'ドーパミン', en: 'Dopamine' }],
            answer: 1, explain: { ja: '皮質ではGABAが主な抑制性伝達物質。', en: 'GABA is the main cortical inhibitory transmitter.' } },
          { id: 'q2', q: { ja: 'EEGのある帯域パワーが高い／低いことから直ちに言えないことは？', en: 'What can NOT be concluded directly from a band power change?' },
            options: [
              { ja: '特定の疾患がある', en: 'That a specific disease is present' },
              { ja: '同期の程度が変化した可能性', en: 'That synchrony may have changed' },
              { ja: '記録条件の影響を確認する必要がある', en: 'That recording conditions must be checked' } ],
            answer: 0, explain: { ja: '帯域パワーは多くの要因（覚醒度、開閉眼、薬、雑音）で変わる。疾患との一対一対応はない。', en: 'Band power depends on arousal, eyes open/closed, drugs, noise… no one-to-one disease mapping.' } },
        ],
        reflect: { ja: '抑制が弱まると脳波はどうなりそう？ 疑問として保存しておこう。', en: 'What might happen to EEG if inhibition weakens? Save it as a question.' },
      },
      {
        id: 'p1-3',
        title: { ja: '脳領域と回路：局在論の限界', en: 'Brain regions & circuits: limits of localisation' },
        keywords: ['prefrontal cortex', 'amygdala', 'hippocampus', 'networks'],
        concept: {
          ja: [
            '前頭前野（PFC）は計画・意思決定・感情制御、扁桃体は脅威や情動の評価、海馬は記憶の形成と文脈に関わる。うつ病研究ではこれらの回路の結合が注目される。',
            'ただし「領域Xが機能Yを担う」は近似にすぎない。機能はネットワーク（例：デフォルトモードネットワーク）として現れ、同じ領域が複数の機能に関わる。',
            'EEGは空間分解能が低く、扁桃体や海馬のような深部構造の活動を頭皮から直接特定するのは難しい。ソース推定には仮定（頭部モデル・逆問題の正則化）が必要。',
          ],
          en: [
            'Prefrontal cortex supports planning, decision-making and emotion regulation; the amygdala appraises threat and affect; the hippocampus supports memory and context. Depression research often studies how these circuits interact.',
            '“Region X does function Y” is only an approximation: functions emerge from networks (e.g. the default mode network), and regions are multi-functional.',
            'EEG has poor spatial resolution; deep structures like amygdala and hippocampus are hard to localise from the scalp. Source estimation requires assumptions (head model, regularised inverse).',
          ],
        },
        visual: { widget: 'brainmap', caption: { ja: '主な領域をタップして機能とEEGでの見えやすさを確認。', en: 'Tap regions to see function and how visible they are to EEG.' } },
        practice: {
          task: { ja: '3領域（PFC・扁桃体・海馬）について「働き」「EEGで観測しやすいか」「その理由」を表にまとめよう。', en: 'Make a 3-row table (PFC, amygdala, hippocampus): function / EEG visibility / why.' },
          prompt: { ja: '領域｜働き｜EEGでの見えやすさ｜理由', en: 'Region | function | EEG visibility | reason' },
        },
        quiz: [
          { id: 'q1', q: { ja: '頭皮EEGで最も直接的に捉えにくいのは？', en: 'Which is hardest to capture directly with scalp EEG?' },
            options: [{ ja: '後頭部皮質のalpha律動', en: 'Occipital alpha' }, { ja: '扁桃体の活動', en: 'Amygdala activity' }, { ja: '運動野のmu律動', en: 'Motor-cortex mu rhythm' }],
            answer: 1, explain: { ja: '扁桃体は深部にあり、構造的にも頭皮へ強い電場を作りにくい。', en: 'The amygdala is deep and geometrically produces weak scalp fields.' } },
          { id: 'q2', q: { ja: '「機能局在」についての適切な態度は？', en: 'A sound view of functional localisation?' },
            options: [{ ja: '1領域＝1機能と考える', en: 'One region = one function' }, { ja: '近似として使い、ネットワークの視点を併用する', en: 'Use it as an approximation alongside network views' }, { ja: '脳領域は機能と無関係', en: 'Regions are unrelated to function' }],
            answer: 1, explain: { ja: '局在は便利な近似。機能はネットワークで実現される。', en: 'Localisation is a useful approximation; networks implement function.' } },
        ],
        reflect: { ja: 'うつ病と関係しそうな回路について、知りたいことを1つ疑問として保存。', en: 'Save one question about circuits that may relate to depression.' },
      },
    ],
  },

  {
    id: 'p2', code: 'P2', section: 'prep', color: '#00a3a3',
    title: { ja: '数学とPythonの準備', en: 'Math & Python Toolkit' },
    summary: {
      ja: 'NumPyで信号を作り、正弦波・フーリエ・確率分布の直感を手で確かめる。',
      en: 'Build signals with NumPy and get hands-on intuition for sinusoids, Fourier and distributions.' },
    goals: [
      { ja: 'NumPyで任意の周波数・振幅・雑音の合成EEGを作れる', en: 'Generate synthetic EEG with chosen frequencies, amplitudes and noise' },
      { ja: '「信号は正弦波の和」というフーリエの考え方を説明できる', en: 'Explain the Fourier idea: signals as sums of sinusoids' },
      { ja: '平均・分散・正規分布を使ってばらつきを記述できる', en: 'Describe variability with mean, variance and the normal distribution' },
    ],
    deliverable: { ja: '合成EEG生成スクリプト（notebooks/01_synthetic_eeg.py を改造）', en: 'Synthetic-EEG script (adapt notebooks/01_synthetic_eeg.py)' },
    prereq: [], next: ['c2'],
    resources: ['neuromatch', 'epfl-dsp1', 'islp', 'mit-1805'],
    lessons: [
      {
        id: 'p2-1',
        title: { ja: 'NumPyで信号をつくる', en: 'Building signals with NumPy' },
        keywords: ['array', 'sampling rate', 'np.sin', 'noise'],
        concept: {
          ja: [
            'デジタル信号は「サンプリング周波数 fs で等間隔に並んだ数値の配列」。時間軸は t = np.arange(n) / fs で作る。',
            '周波数 f、振幅 A の正弦波は A·sin(2πft)。EEGらしい信号は、10 Hz の alpha ＋ 20 Hz の beta ＋ 雑音 ＋ 50 Hz の電源ノイズ（日本の東日本は50 Hz、西日本は60 Hz）のような足し算で近似できる。',
            '乱数を使う実験では np.random.default_rng(seed) で seed を固定する。再現性の第一歩。',
          ],
          en: [
            'A digital signal is an array of values sampled at a fixed rate fs. Build the time axis with t = np.arange(n) / fs.',
            'A sinusoid with frequency f and amplitude A is A·sin(2πft). EEG-like data can be approximated as 10 Hz alpha + 20 Hz beta + noise + mains hum (50 Hz in eastern Japan/Europe, 60 Hz in western Japan/US).',
            'Fix random seeds with np.random.default_rng(seed) — the first step of reproducibility.',
          ],
        },
        visual: { widget: 'spectrum', props: { showSpectrum: false }, caption: { ja: '成分の振幅を変えて合成波の形を観察。', en: 'Change component amplitudes and watch the composite waveform.' } },
        practice: {
          task: { ja: '下のコードを実行し、alpha の振幅を2倍にしたとき標準偏差がどう変わるか確かめよう。', en: 'Run the code; double the alpha amplitude and see how the standard deviation changes.' },
          code: `import numpy as np

fs = 250                         # sampling rate (Hz)
t = np.arange(0, 4, 1 / fs)      # 4 seconds
rng = np.random.default_rng(42)  # fixed seed = reproducible

alpha = 10e-6 * np.sin(2 * np.pi * 10 * t)   # 10 µV, 10 Hz
beta  =  3e-6 * np.sin(2 * np.pi * 20 * t)
mains =  5e-6 * np.sin(2 * np.pi * 50 * t)
noise =  4e-6 * rng.standard_normal(t.size)
eeg = alpha + beta + mains + noise

print("samples:", eeg.size, " duration:", eeg.size / fs, "s")
print(f"std = {eeg.std() * 1e6:.2f} µV")`,
          packages: ['numpy'],
          prompt: { ja: '振幅2倍で std は何倍？ なぜ2倍にならない？', en: 'How much does std grow when alpha doubles? Why not ×2?' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'fs = 250 Hz で 4 秒記録するとサンプル数は？', en: 'At fs = 250 Hz for 4 s, how many samples?' },
            options: [{ ja: '250', en: '250' }, { ja: '1000', en: '1000' }, { ja: '62.5', en: '62.5' }], answer: 1,
            explain: { ja: '250 × 4 = 1000。', en: '250 × 4 = 1000.' } },
          { id: 'q2', q: { ja: '乱数の seed を固定する主な目的は？', en: 'Main reason to fix a random seed?' },
            options: [{ ja: '計算を速くする', en: 'Speed' }, { ja: '結果を再現できるようにする', en: 'Reproducibility' }, { ja: '雑音を消す', en: 'Removing noise' }], answer: 1,
            explain: { ja: '同じコードで同じ結果を第三者が得られるようにするため。', en: 'So others get identical results from the same code.' } },
        ],
        reflect: { ja: '合成データと実データの違いとして思いつくことをメモ。', en: 'Note how synthetic data differs from real recordings.' },
      },
      {
        id: 'p2-2',
        title: { ja: 'フーリエの直感：信号は波の足し算', en: 'Fourier intuition: signals as sums of waves' },
        keywords: ['frequency domain', 'FFT', 'amplitude spectrum'],
        concept: {
          ja: [
            'フーリエ変換は「この信号に、各周波数の正弦波がどれくらい含まれているか」を求める操作。時間領域の波形を周波数領域のスペクトルに変換する。',
            'FFT（高速フーリエ変換）はその効率的アルゴリズム。N 点の FFT の周波数分解能は fs / N、つまり記録が長いほど細かい周波数を区別できる。',
            '時間で局在した現象（瞬目など）はスペクトル上では広い帯域に広がる。時間と周波数は同時に無限に細かくはできない（不確定性）。',
          ],
          en: [
            'The Fourier transform asks: how much of each sinusoid is in this signal? It maps a waveform (time domain) to a spectrum (frequency domain).',
            'The FFT is a fast algorithm for it. Frequency resolution of an N-point FFT is fs / N — longer windows resolve finer frequencies.',
            'Events localised in time (e.g. blinks) spread across many frequencies. You cannot be arbitrarily precise in both time and frequency.',
          ],
        },
        visual: { widget: 'spectrum', caption: { ja: '上：波形、下：振幅スペクトル。成分を足すとピークが現れる。', en: 'Top: waveform. Bottom: amplitude spectrum — each component becomes a peak.' } },
        practice: {
          task: { ja: '予測を書いてから実行：10 Hz と 23 Hz を足した信号の FFT で、どこにピークが出る？ 記録長を 1 秒にすると分解能は？', en: 'Predict first: where will peaks appear for 10 Hz + 23 Hz? What is the resolution with a 1-s window?' },
          code: `import numpy as np

fs, dur = 200, 2.0
t = np.arange(0, dur, 1 / fs)
x = np.sin(2*np.pi*10*t) + 0.5*np.sin(2*np.pi*23*t)

X = np.abs(np.fft.rfft(x)) * 2 / x.size
f = np.fft.rfftfreq(x.size, 1 / fs)
print("resolution =", fs / x.size, "Hz")
for i in np.argsort(X)[-2:][::-1]:
    print(f"peak at {f[i]:.1f} Hz, amplitude {X[i]:.2f}")`,
          packages: ['numpy'],
          prompt: { ja: '予測 / 結果 / 分解能', en: 'Prediction / result / resolution' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'fs = 200 Hz、N = 400 点の FFT の周波数分解能は？', en: 'Resolution of a 400-point FFT at fs = 200 Hz?' },
            options: [{ ja: '0.5 Hz', en: '0.5 Hz' }, { ja: '2 Hz', en: '2 Hz' }, { ja: '200 Hz', en: '200 Hz' }], answer: 0,
            explain: { ja: 'fs/N = 200/400 = 0.5 Hz。', en: 'fs/N = 200/400 = 0.5 Hz.' } },
          { id: 'q2', q: { ja: '瞬目のような短い出来事はスペクトル上でどう見える？', en: 'How does a brief event like a blink look in the spectrum?' },
            options: [{ ja: '鋭い単一ピーク', en: 'A single sharp peak' }, { ja: '低周波を中心に広い帯域に広がる', en: 'Broad, mainly low-frequency energy' }, { ja: '見えない', en: 'Invisible' }], answer: 1,
            explain: { ja: '時間的に短い現象ほど周波数的には広がる。', en: 'Short in time ⇒ broad in frequency.' } },
        ],
        reflect: { ja: '「時間」と「周波数」のトレードオフで、アハ体験があれば保存。', en: 'Any aha about the time–frequency trade-off? Save it.' },
      },
      {
        id: 'p2-3',
        title: { ja: '確率とばらつき：平均だけでは足りない', en: 'Probability & variability: the mean is not enough' },
        keywords: ['mean', 'SD', 'normal distribution', 'standard error'],
        concept: {
          ja: [
            '平均は「中心」、標準偏差（SD）は「ばらつき」。2群の平均が違っても、ばらつきが大きければ区別は難しい。',
            '標本平均のばらつきは標準誤差 SE = SD/√n。サンプルが4倍になると SE は半分。',
            '脳波特徴量は個人差が大きい。だから「何人から」「一人あたり何試行」のデータかを必ず区別する。試行数を増やしても、人数の少なさは補えない。',
          ],
          en: [
            'The mean is the centre; the standard deviation (SD) is the spread. Different means are hard to tell apart if the spread is large.',
            'The variability of a sample mean is the standard error, SE = SD/√n. Quadrupling n halves the SE.',
            'EEG features vary greatly across people. Always separate “how many people” from “how many trials per person” — more trials cannot fix too few participants.',
          ],
        },
        visual: { widget: 'distribution', caption: { ja: '2群の分布：平均差（効果）とばらつきを動かして重なりを観察。', en: 'Two groups: move mean difference and spread, watch the overlap.' } },
        practice: {
          task: { ja: '図解で平均差を固定し SD を倍にすると、重なり（区別しにくさ）はどう変わる？ 効果量 d = 平均差 / SD を計算しよう。', en: 'Keep the mean difference fixed and double the SD. How does overlap change? Compute d = difference / SD.' },
          prompt: { ja: 'd の値と重なりの関係', en: 'Relationship between d and overlap' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'n を 4 倍にすると標準誤差は？', en: 'If n quadruples, the standard error…' },
            options: [{ ja: '1/4', en: 'becomes 1/4' }, { ja: '1/2', en: 'halves' }, { ja: '変わらない', en: 'is unchanged' }], answer: 1,
            explain: { ja: 'SE = SD/√n。√4 = 2。', en: 'SE = SD/√n, √4 = 2.' } },
          { id: 'q2', q: { ja: '10人×各200試行のデータについて正しいのは？', en: 'For 10 people × 200 trials each:' },
            options: [{ ja: '実質2000人分の証拠になる', en: 'It is like 2000 independent people' }, { ja: '個人差の推定には10人分の情報しかない', en: 'Only 10 people inform between-person variability' }], answer: 1,
            explain: { ja: '試行は人の中で相関する。母集団への一般化は人数に制約される。', en: 'Trials are correlated within a person; generalisation is limited by people.' } },
        ],
        reflect: { ja: '自分の研究で「n」を何と定義するべきか、メモ。', en: 'Note what “n” should mean in your own study.' },
      },
    ],
  },

  {
    id: 'p3', code: 'P3', section: 'prep', color: '#e08a00',
    title: { ja: '研究リテラシーと倫理', en: 'Research Literacy & Ethics' },
    summary: {
      ja: '研究とは「反証可能な問い」を立て、誰でも追試できる形で答えること。倫理とデータ管理の基本も押さえる。',
      en: 'Research = asking falsifiable questions and answering them so anyone can check. Plus ethics and data stewardship.' },
    goals: [
      { ja: '良い研究質問（具体・測定可能・反証可能）を書ける', en: 'Write a good research question: specific, measurable, falsifiable' },
      { ja: '人を対象とする研究・公開データ利用の倫理的条件を説明できる', en: 'Explain ethical requirements for human research and public data' },
    ],
    deliverable: { ja: '1行研究質問＋測定項目＋弱点＋倫理チェック', en: 'One-line research question + measures + weaknesses + ethics check' },
    prereq: [], next: ['c6', 'c7'],
    resources: ['responsible-research', 'zero-to-lab', 'tue-inferences'],
    lessons: [
      {
        id: 'p3-1',
        title: { ja: '問い・仮説・反証', en: 'Questions, hypotheses, falsification' },
        keywords: ['research question', 'hypothesis', 'falsifiability', 'operationalisation'],
        concept: {
          ja: [
            '研究は「何を知りたいか（問い）」→「どうなると予想するか（仮説）」→「どう測るか（操作化）」→「どの結果なら仮説が誤りか（反証条件）」の順に具体化する。',
            '悪い例：「EEGでうつ病を解明する」。良い例：「安静閉眼時の後頭部 alpha パワーは、BDI-II 得点と負の相関を示すか（年齢・性別・睡眠時間を調整）」。',
            '研究は一人では完結しない。先行研究、指導教員、データ提供者、査読者との対話の中で精緻化される。',
          ],
          en: [
            'Sharpen research step by step: question → prediction (hypothesis) → measurement (operationalisation) → what result would prove you wrong (falsification).',
            'Bad: “Use EEG to understand depression.” Better: “Is eyes-closed occipital alpha power negatively correlated with BDI-II score, adjusting for age, sex and sleep duration?”',
            'Research is social: it is refined through prior work, supervisors, data providers and reviewers.',
          ],
        },
        visual: { widget: 'pipeline', props: { kind: 'question' }, caption: { ja: '漠然とした関心が検証可能な仮説になるまで。', en: 'From vague interest to a testable hypothesis.' } },
        practice: {
          task: { ja: '自分の関心を1つ選び、「問い／仮説／測定項目／反証条件／弱点」を各1行で書こう。研究ノートに保存される。', en: 'Pick one interest and write: question / hypothesis / measures / falsification / weakness — one line each.' },
          prompt: { ja: '問い:\n仮説:\n測定項目:\n反証条件:\n弱点:', en: 'Question:\nHypothesis:\nMeasures:\nFalsified if:\nWeakness:' },
        },
        quiz: [
          { id: 'q1', q: { ja: '最も検証可能な問いは？', en: 'Which question is most testable?' },
            options: [
              { ja: '脳波でうつ病の原因を特定できるか', en: 'Can EEG identify the cause of depression?' },
              { ja: '閉眼安静時の前頭 alpha 非対称性は BDI-II 得点と相関するか', en: 'Does eyes-closed frontal alpha asymmetry correlate with BDI-II score?' },
              { ja: '脳はどう心を作るか', en: 'How does the brain create the mind?' } ],
            answer: 1, explain: { ja: '測定項目と比較が明確で、反証可能。', en: 'Measures and comparison are explicit; it can be falsified.' } },
          { id: 'q2', q: { ja: '反証条件を事前に書く理由は？', en: 'Why state falsification criteria in advance?' },
            options: [{ ja: '結果を見てから解釈を都合よく変えないため', en: 'To avoid reinterpreting results after the fact' }, { ja: '論文を長くするため', en: 'To make papers longer' }], answer: 0,
            explain: { ja: '事後的な仮説変更（HARKing）を防ぐ。', en: 'Prevents HARKing (hypothesising after results are known).' } },
        ],
        reflect: { ja: '自分の問いの一番の弱点は何？', en: 'What is the biggest weakness of your question?' },
      },
      {
        id: 'p3-2',
        title: { ja: '研究倫理・データ・著作権', en: 'Ethics, data & copyright' },
        keywords: ['IRB', 'informed consent', 'data licence', 'authorship'],
        concept: {
          ja: [
            '人を対象とする計測・介入は、所属機関の倫理審査（IRB）と参加者のインフォームド・コンセントが前提。EEG計測も例外ではない。',
            '公開データにも利用条件がある（ライセンス、引用方法、再識別の禁止など）。README と論文を読み、データ提供者を正しく引用する。',
            '教材や論文の著作権：要約や引用は出典を明示し最小限に。有料講座のPDFや動画を再配布しない。オーサーシップは実質的な貢献に基づく。',
          ],
          en: [
            'Recording or intervening on humans requires ethics review (IRB) and informed consent — EEG included.',
            'Public data has terms too: licence, citation, no re-identification. Read the README and paper; cite data providers properly.',
            'Copyright: quote minimally with attribution; never redistribute paid course PDFs or videos. Authorship follows substantive contribution.',
          ],
        },
        practice: {
          task: { ja: 'OpenNeuro ds003478 のページを開き、ライセンス・引用すべき論文・参加者情報の扱いを確認してメモしよう。', en: 'Open OpenNeuro ds003478 and note its licence, the paper to cite, and how participant data is handled.' },
          prompt: { ja: 'ライセンス:\n引用:\n個人情報の扱い:', en: 'Licence:\nCitation:\nParticipant data handling:' },
        },
        quiz: [
          { id: 'q1', q: { ja: '有料講座からダウンロードしたPDFの扱いとして適切なのは？', en: 'A PDF downloaded from a paid course should be…' },
            options: [{ ja: '学習アプリに全文掲載して共有する', en: 'posted in full in a shared app' }, { ja: '利用条件の範囲で個人学習に使い、共有はリンクで行う', en: 'used personally within the terms; share links instead' }], answer: 1,
            explain: { ja: '再配布は通常禁止。NeuroAtlasもリンクのみ掲載。', en: 'Redistribution is usually prohibited; NeuroAtlas only links.' } },
          { id: 'q2', q: { ja: '自分で友人の脳波を測って論文にしたい。まず必要なのは？', en: 'You want to record friends’ EEG for a paper. First you need…' },
            options: [{ ja: '倫理審査と同意取得', en: 'Ethics approval and consent' }, { ja: '高性能GPU', en: 'A powerful GPU' }], answer: 0,
            explain: { ja: '研究目的の計測は倫理審査が前提。', en: 'Research recordings require prior ethics approval.' } },
        ],
        reflect: { ja: '倫理面で不安な点や確認したいことを疑問として保存。', en: 'Save any ethics concern as a question.' },
      },
    ],
  },
];
