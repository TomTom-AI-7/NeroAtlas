// CORE section, part B: psychiatry → methods → paper reading → writing → capstone.

export const CORE_B = [
  {
    id: 'c5', code: 'C5', section: 'core', color: '#c0392b',
    title: { ja: '精神医学とうつ病研究', en: 'Psychiatry & Depression Research' },
    summary: { ja: '症状・診断・尺度の違い、多因子モデルとRDoC、EEGバイオマーカー研究の可能性と限界を学ぶ。',
      en: 'Symptoms vs diagnosis vs scales, multifactorial models and RDoC, and the promise and limits of EEG biomarkers.' },
    goals: [
      { ja: '診断面接と症状尺度（BDI-II等）の違いを説明できる', en: 'Distinguish diagnostic interviews from symptom scales (e.g. BDI-II)' },
      { ja: '単一原因モデルの限界と RDoC の考え方を説明できる', en: 'Explain limits of single-cause models and the RDoC approach' },
      { ja: 'EEG研究で「言えること／言えないこと」を臨床的文脈で書ける', en: 'State what EEG findings can and cannot claim clinically' },
    ],
    deliverable: { ja: 'ds003478 を想定した「ラベル定義メモ」（何を予測／何と関連づけるか）', en: '“Label definition memo” for ds003478 (what you predict / associate)' },
    prereq: ['p1', 'c1'], next: ['c6', 'c7', 'e3', 'e4'],
    resources: ['nimh-depression', 'nimh-rdoc', 'microglia-review', 'drive-microglia', 'openneuro-ds003478', 'uct-clinical', 'alaskax-anxiety'],
    lessons: [
      {
        id: 'c5-1', title: { ja: '症状・診断・尺度', en: 'Symptoms, diagnosis & scales' },
        keywords: ['MDD', 'DSM-5', 'BDI-II', 'PHQ-9', 'clinical interview'],
        concept: {
          ja: [
            'うつ病（大うつ病性障害, MDD）の診断は、DSM-5 などの基準に基づく臨床面接で行う。抑うつ気分や興味の喪失を含む症状が一定期間続き、生活に支障があることが要件。',
            'BDI-II や PHQ-9 は自己記入式の症状尺度。高得点は「症状が強い」ことを示すが、それ自体は診断ではない。カットオフで群分けすると情報を失うため、連続量として扱う分析も検討する。',
            '同じ「うつ病」でも症状の組み合わせは人によって大きく異なる（異質性）。これが単一のバイオマーカー探索を難しくする。',
          ],
          en: [
            'Major depressive disorder (MDD) is diagnosed via clinical interview against criteria such as DSM-5: persistent low mood or loss of interest plus other symptoms, with functional impairment.',
            'BDI-II and PHQ-9 are self-report symptom scales. A high score means more severe symptoms — not a diagnosis. Dichotomising at a cut-off discards information; consider analysing scores as continuous.',
            'Two people with “depression” can share few symptoms (heterogeneity), which makes single-biomarker searches hard.',
          ],
        },
        practice: {
          task: { ja: 'OpenNeuro ds003478 の participants 情報を確認し、使える変数（尺度・群・共変量）と、「診断」と呼んではいけない理由を書こう。', en: 'Check ds003478 participant info: list usable variables (scales, groups, covariates) and why you must not call them “diagnoses”.' },
          prompt: { ja: '変数:\n予測／関連づける対象:\n言えること / 言えないこと:', en: 'Variables:\nTarget of prediction / association:\nCan claim / cannot claim:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'BDI-II 高得点群について正しい表現は？', en: 'Correct description of a high BDI-II group?' },
            options: [{ ja: '抑うつ症状が強い群', en: 'Group with elevated depressive symptoms' }, { ja: 'うつ病と診断された群', en: 'Diagnosed MDD group' }], answer: 0,
            explain: { ja: '自己記入尺度は診断面接の代わりにならない。', en: 'Self-report scales do not replace diagnostic interviews.' } },
          { id: 'q2', q: { ja: '症状得点をカットオフで2群に分ける欠点は？', en: 'Downside of dichotomising symptom scores?' },
            options: [{ ja: '情報が失われ検出力が下がる', en: 'Information loss and reduced power' }, { ja: '欠点はない', en: 'None' }], answer: 0,
            explain: { ja: 'カットオフ付近の人は似ているのに別群になる。', en: 'People near the cut-off are similar but split apart.' } },
        ],
        reflect: { ja: '自分の研究で使うラベルの定義を1行で。', en: 'Define your study’s label in one line.' },
      },
      {
        id: 'c5-2', title: { ja: '多因子モデルとRDoC', en: 'Multifactorial models & RDoC' },
        keywords: ['biopsychosocial', 'sleep', 'inflammation', 'RDoC', 'dimensional'],
        concept: {
          ja: [
            'うつ病は遺伝、ストレス、睡眠、炎症、社会環境、認知スタイルなど多くの要因が絡む。どれか1つが「原因」という単純なモデルは支持されていない。',
            'NIMH の RDoC は、診断カテゴリではなく「報酬系」「脅威系」「覚醒・制御」などの次元を、遺伝子〜回路〜行動の複数レベルで研究する枠組み。EEG は「回路・生理」レベルの測定にあたる。',
            '神経炎症仮説（ミクログリア総説：Drive 保存済み・OA）は、動物実験・ヒトの相関研究・介入研究で証拠の強さが異なる。読むときは「どの種類の証拠か」をタグ付けする。',
          ],
          en: [
            'Depression involves genetics, stress, sleep, inflammation, social environment, cognitive style and more. Single-cause models are not supported.',
            'NIMH’s RDoC studies dimensions (reward, threat, arousal/regulation…) across levels from genes to circuits to behaviour, instead of diagnostic categories. EEG sits at the circuit/physiology level.',
            'The neuroinflammation hypothesis (microglia review: in your Drive, OA) rests on evidence of different strength — animal work, human correlations, interventions. Tag each claim by evidence type when you read.',
          ],
        },
        visual: { widget: 'confound', caption: { ja: '睡眠不足が EEG と抑うつ症状の両方に影響すると、見かけの相関が生まれる。', en: 'If sleep loss affects both EEG and symptoms, a spurious correlation appears.' } },
        practice: {
          task: { ja: 'ミクログリア総説から主張を3つ選び、「動物／ヒト相関／ヒト介入」のどの証拠に基づくかタグ付けしよう。', en: 'Pick three claims from the microglia review and tag each as animal / human-correlational / human-interventional evidence.' },
          prompt: { ja: '主張1 [証拠の種類]:\n主張2:\n主張3:', en: 'Claim 1 [evidence type]:\nClaim 2:\nClaim 3:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'RDoC の特徴は？', en: 'Key feature of RDoC?' },
            options: [{ ja: '次元的・多レベルで研究する', en: 'Dimensional, multi-level research' }, { ja: '新しい診断基準', en: 'A new diagnostic manual' }], answer: 0,
            explain: { ja: '研究の枠組みであり臨床診断マニュアルではない。', en: 'A research framework, not a clinical manual.' } },
          { id: 'q2', q: { ja: 'マウスの炎症で抑うつ様行動が増えた。ヒトについて言えるのは？', en: 'Inflammation increases depressive-like behaviour in mice. For humans we can say…' },
            options: [{ ja: '仮説の根拠になるが、ヒトでの因果は別途検証が必要', en: 'It motivates a hypothesis; human causality needs separate testing' }, { ja: 'ヒトでも原因と確定', en: 'It is proven causal in humans' }], answer: 0,
            explain: { ja: '種差と行動指標の妥当性の問題がある。', en: 'Species differences and behavioural-proxy validity.' } },
        ],
        reflect: { ja: '自分の仮説に入れるべき交絡因子を3つ挙げよう。', en: 'Name three confounders your hypothesis must handle.' },
      },
      {
        id: 'c5-3', title: { ja: 'EEGバイオマーカー研究の限界', en: 'Limits of EEG biomarker research' },
        keywords: ['biomarker', 'replication', 'medication', 'site effects', 'clinical utility'],
        concept: {
          ja: [
            'うつ病の EEG マーカー候補（前頭 alpha 非対称性、theta、エントロピー等）は多数報告されてきたが、大規模・多施設での再現は一貫していない。原因として、小標本、解析の自由度、服薬・年齢・施設の交絡、リークが挙げられる。',
            '「群差がある」と「個人を診断できる」は別。群平均の差が有意でも分布が大きく重なれば個人予測には使えない（P2-3 の効果量を思い出す）。',
            'だからこそ、学部生の最初の研究として「既報の追試＋厳密な評価」は十分価値がある。否定的な結果も、方法が厳密なら報告価値を持つ。',
          ],
          en: [
            'Many EEG markers for depression (frontal alpha asymmetry, theta, entropy…) have been reported, but large multi-site replication is inconsistent — due to small samples, analytic flexibility, medication/age/site confounds and leakage.',
            '“A group difference exists” ≠ “we can diagnose individuals”. A significant mean difference with heavy overlap is useless for individual prediction (recall effect sizes in P2-3).',
            'That is why a careful replication with rigorous evaluation is a valuable first project. Null results are reportable when methods are sound.',
          ],
        },
        visual: { widget: 'distribution', props: { preset: 'biomarker' }, caption: { ja: '有意な群差（d=0.3）でも個人の分類はほぼ当たらない。', en: 'A significant group difference (d = 0.3) still classifies individuals poorly.' } },
        practice: {
          task: { ja: '「EEGでうつ病を診断」とうたう記事を想定し、確認すべき質問を5つ書こう（標本数、分割、交絡、外部検証、指標）。', en: 'Imagine a headline “EEG diagnoses depression”. Write five questions to check (sample size, split, confounds, external validation, metrics).' },
          prompt: { ja: '1.\n2.\n3.\n4.\n5.', en: '1.\n2.\n3.\n4.\n5.' },
        },
        quiz: [
          { id: 'q1', q: { ja: '群差が有意でも個人診断に使えない主な理由は？', en: 'Why can a significant group difference fail at individual diagnosis?' },
            options: [{ ja: '分布の重なりが大きい（効果量が小さい）', en: 'Distributions overlap heavily (small effect)' }, { ja: 'p 値が小さすぎる', en: 'p is too small' }], answer: 0,
            explain: { ja: '大標本では小さな差も有意になる。', en: 'Large samples make tiny differences significant.' } },
          { id: 'q2', q: { ja: '服薬中の患者群と健常群の EEG 差。注意すべきは？', en: 'EEG differences between medicated patients and controls. Watch out for…' },
            options: [{ ja: '薬の作用による差の可能性', en: 'Effects of medication itself' }, { ja: '特になし', en: 'Nothing' }], answer: 0,
            explain: { ja: '抗うつ薬・ベンゾジアゼピンは EEG を変える。', en: 'Antidepressants and benzodiazepines alter EEG.' } },
        ],
        reflect: { ja: '追試する価値がありそうな指標を1つ選び、理由をメモ。', en: 'Pick one marker worth replicating and note why.' },
      },
    ],
  },

  {
    id: 'c6', code: 'C6', section: 'core', color: '#2c3e50',
    title: { ja: '研究デザインと統計推論', en: 'Research Design & Statistical Inference' },
    summary: { ja: '効果量・信頼区間・検出力、多重比較と事前登録、相関・交絡・因果を扱い、事前分析計画を書けるようにする。',
      en: 'Effect sizes, CIs and power; multiple comparisons and preregistration; correlation, confounding and causation — leading to an analysis plan.' },
    goals: [
      { ja: '95%信頼区間を正しく解釈できる', en: 'Interpret a 95% CI correctly' },
      { ja: '多重比較の問題と補正法（Bonferroni, FDR, クラスター置換）を説明できる', en: 'Explain multiple comparisons and corrections (Bonferroni, FDR, cluster permutation)' },
      { ja: '交絡を図（DAG）で描き、調整の方針を書ける', en: 'Draw confounding as a DAG and plan adjustment' },
    ],
    deliverable: { ja: '事前分析計画（Pre-analysis plan）の骨子', en: 'Pre-analysis plan outline' },
    prereq: ['p2', 'p3'], next: ['c7', 'c9', 'e3', 'e6'],
    resources: ['tue-inferences', 'uct-clinical', 'openintro', 'mit-1805', 'responsible-research', 'neuromatch'],
    lessons: [
      {
        id: 'c6-1', title: { ja: '効果量・信頼区間・検出力', en: 'Effect sizes, CIs & power' },
        keywords: ['Cohen’s d', 'confidence interval', 'power', 'sample size'],
        concept: {
          ja: [
            'p 値は「効果がゼロだと仮定したとき、これ以上極端なデータが得られる確率」。効果の大きさや重要性は教えてくれない。効果量（Cohen’s d、相関 r）と信頼区間を併記する。',
            '95%信頼区間の正しい解釈：同じ手順を何度も繰り返すと、そのうち約95%の区間が真値を含む。「真値がこの区間にある確率が95%」ではない（頻度論の場合）。',
            '検出力：真の効果があるときに検出できる確率。d = 0.3 を 80% の検出力で見つけるには1群あたり約175人必要。小標本で有意な結果は効果を過大評価しがち（勝者の呪い）。',
          ],
          en: [
            'A p-value is the probability of data at least this extreme if the true effect were zero. It says nothing about effect size or importance — report effect sizes (Cohen’s d, r) with CIs.',
            'Correct 95% CI reading: across repetitions of the procedure, ~95% of intervals contain the true value. It is not “95% probability the true value is in this interval” (frequentist).',
            'Power: probability of detecting a true effect. Detecting d = 0.3 with 80% power needs ~175 per group. Significant small-sample results tend to overestimate effects (winner’s curse).',
          ],
        },
        visual: { widget: 'ci', caption: { ja: '標本を何度も取り直して95%信頼区間を描く。真値を外す区間（赤）は約5%。', en: 'Resample repeatedly and draw 95% CIs; about 5% (red) miss the true value.' } },
        practice: {
          task: { ja: '図解で n を 10→100 に変え、区間幅の変化を観察。「誤った解釈」の例文を1つ正しく書き直そう。', en: 'Change n from 10 to 100 and observe CI width. Rewrite one incorrect CI interpretation correctly.' },
          prompt: { ja: '誤：\n正：', en: 'Wrong:\nRight:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'p = 0.001 から言えることは？', en: 'p = 0.001 tells you…' },
            options: [{ ja: '効果ゼロの仮定のもとではまれなデータ', en: 'Such data would be rare if the effect were zero' }, { ja: '効果が大きい', en: 'The effect is large' }, { ja: '仮説が99.9%正しい', en: 'The hypothesis is 99.9% true' }], answer: 0,
            explain: { ja: '大きさは効果量と信頼区間で示す。', en: 'Size comes from effect sizes and CIs.' } },
          { id: 'q2', q: { ja: '各群20人の研究で大きな効果が有意。注意点は？', en: '20 per group, large significant effect. Caveat?' },
            options: [{ ja: '効果が過大評価されている可能性', en: 'The effect is likely overestimated' }, { ja: '再現は確実', en: 'Replication is certain' }], answer: 0,
            explain: { ja: '低検出力研究で有意になるのは、偶然大きく出た場合が多い。', en: 'Low-power studies reach significance mostly when estimates are inflated.' } },
        ],
        reflect: { ja: '自分の研究に必要なサンプルサイズを見積もる方法を疑問として保存。', en: 'Save a question on estimating the sample size you need.' },
      },
      {
        id: 'c6-2', title: { ja: '多重比較と事前登録', en: 'Multiple comparisons & preregistration' },
        keywords: ['family-wise error', 'Bonferroni', 'FDR', 'cluster permutation', 'preregistration'],
        concept: {
          ja: [
            'EEG は電極×周波数×時間で比較の数が膨大。効果ゼロでも α=0.05 で20回検定すれば平均1回は「有意」になる。',
            '補正：Bonferroni（α/m、厳しい）、FDR（Benjamini–Hochberg、偽発見の割合を制御）、クラスターベース置換検定（隣接する電極・時間の構造を利用、MNEで実装）。',
            '事前登録：仮説・主要アウトカム・解析方法を結果を見る前に記録（OSF 等）。探索的解析は禁止ではなく「探索的」と明記する。',
          ],
          en: [
            'EEG has huge numbers of comparisons (channels × frequencies × time). With zero effect, 20 tests at α = 0.05 yield one “significant” result on average.',
            'Corrections: Bonferroni (α/m, strict), FDR (Benjamini–Hochberg, controls the false-discovery proportion), cluster-based permutation (exploits adjacency; implemented in MNE).',
            'Preregistration: record hypotheses, primary outcomes and analyses before seeing results (e.g. OSF). Exploratory analyses are allowed — label them as exploratory.',
          ],
        },
        visual: { widget: 'multiple', caption: { ja: '効果ゼロのデータで多数の特徴量を検定。補正なし／Bonferroni／FDR の偽陽性数を比較。', en: 'Test many features with zero effect; compare false positives: none / Bonferroni / FDR.' } },
        practice: {
          task: { ja: '64電極×5帯域 = 320 比較で、補正なし α=0.05 の期待偽陽性数は？ 自分の研究の「主要アウトカム」を1つに絞って書こう。', en: 'With 64 channels × 5 bands = 320 tests, how many false positives at uncorrected α = 0.05? Narrow your study to one primary outcome.' },
          prompt: { ja: '期待偽陽性数:\n主要アウトカム:\n副次（探索的）:', en: 'Expected false positives:\nPrimary outcome:\nSecondary (exploratory):' },
          draftSection: 'methods',
        },
        quiz: [
          { id: 'q1', q: { ja: '効果ゼロで100回検定（α=0.05, 補正なし）。期待される有意数は？', en: '100 null tests at α = 0.05, uncorrected. Expected significant results?' },
            options: [{ ja: '約5', en: '≈5' }, { ja: '0', en: '0' }, { ja: '約50', en: '≈50' }], answer: 0,
            explain: { ja: '100 × 0.05 = 5。', en: '100 × 0.05 = 5.' } },
          { id: 'q2', q: { ja: '事前登録しても探索的解析は？', en: 'After preregistering, exploratory analyses are…' },
            options: [{ ja: '行ってよいが探索的と明記する', en: 'allowed but must be labelled exploratory' }, { ja: '禁止', en: 'forbidden' }], answer: 0,
            explain: { ja: '確証的と探索的の区別が透明性の核。', en: 'Transparency is about separating confirmatory and exploratory.' } },
        ],
        reflect: { ja: '主要アウトカムを1つに絞るときの迷いをメモ。', en: 'Note your hesitation in choosing one primary outcome.' },
      },
      {
        id: 'c6-3', title: { ja: '相関・交絡・因果', en: 'Correlation, confounding & causation' },
        keywords: ['DAG', 'confounder', 'collider', 'adjustment', 'reverse causation'],
        concept: {
          ja: [
            '相関は因果を意味しない。考えるべき代替説明：交絡（睡眠不足が EEG と症状の両方を変える）、逆因果（症状が生活リズムを変え EEG が変わる）、選択バイアス、偶然。',
            'DAG（有向非巡回グラフ）で因果仮定を描き、どの変数を調整すべきか判断する。交絡因子は調整、合流点（コライダー）は調整してはいけない。',
            '横断的な観察データ（ds003478 など）から言えるのは基本的に「関連」。因果を主張するには介入研究（RCT）や縦断デザイン、強い仮定が必要。',
          ],
          en: [
            'Correlation is not causation. Alternatives: confounding (sleep loss alters EEG and symptoms), reverse causation (symptoms disrupt routines, which alter EEG), selection bias, chance.',
            'Draw causal assumptions as a DAG to decide what to adjust for: adjust for confounders, never for colliders.',
            'Cross-sectional observational data (like ds003478) mostly supports association. Causal claims need interventions (RCTs), longitudinal designs or strong assumptions.',
          ],
        },
        visual: { widget: 'confound', props: { adjustable: true }, caption: { ja: '交絡の強さを変え、「睡眠で調整」をオンにすると見かけの相関が消える。', en: 'Change confounding strength; toggle “adjust for sleep” and the spurious correlation vanishes.' } },
        practice: {
          task: { ja: '自分の仮説について DAG を言葉で書こう（矢印を A → B の形で列挙）。調整すべき変数と、調整してはいけない変数は？', en: 'Write your hypothesis as a DAG (list arrows A → B). What should and should not be adjusted for?' },
          prompt: { ja: '矢印:\n調整する:\n調整しない（理由）:', en: 'Arrows:\nAdjust for:\nDo not adjust for (why):' },
        },
        quiz: [
          { id: 'q1', q: { ja: '睡眠時間が EEG と症状の両方に影響。睡眠時間は？', en: 'Sleep affects both EEG and symptoms. Sleep is a…' },
            options: [{ ja: '交絡因子', en: 'confounder' }, { ja: '合流点', en: 'collider' }, { ja: '結果変数', en: 'outcome' }], answer: 0,
            explain: { ja: '調整しないと見かけの関連が生じる。', en: 'Unadjusted, it creates a spurious association.' } },
          { id: 'q2', q: { ja: '横断データで EEG 指標と症状が相関。正しい主張は？', en: 'Cross-sectional EEG–symptom correlation. Valid claim?' },
            options: [{ ja: '関連が観察された', en: 'An association was observed' }, { ja: 'EEG の変化が症状を引き起こす', en: 'EEG changes cause symptoms' }], answer: 0,
            explain: { ja: '方向も因果も横断データでは決まらない。', en: 'Neither direction nor causality is identified.' } },
        ],
        reflect: { ja: '因果と予測の違いで生まれたアハ体験を保存。', en: 'Save an aha about causation vs prediction.' },
      },
    ],
  },

  {
    id: 'c7', code: 'C7', section: 'core', color: '#16a085',
    title: { ja: '論文読解と再現実験', en: 'Paper Reading & Replication' },
    summary: { ja: '3パス読解、先行研究比較表、公開データでの追試計画と実行で「論文を検証できる人」になる。',
      en: 'Three-pass reading, a literature comparison table and a replication on public data — become someone who can verify papers.' },
    goals: [
      { ja: '論文を3パスで読み、主張・証拠・限界を要約できる', en: 'Read papers in three passes and summarise claim / evidence / limits' },
      { ja: '先行研究3本を「データ・手法・評価・限界」で比較できる', en: 'Compare three papers by data, method, evaluation and limits' },
      { ja: '第三者が追試できる手順を書ける', en: 'Write steps a third party can reproduce' },
    ],
    deliverable: { ja: '先行研究比較表＋ds003478 追試レポート（再現手順6行以上）', en: 'Literature table + ds003478 replication report (≥ 6 reproducible steps)' },
    prereq: ['c3', 'c4', 'c5'], next: ['c8', 'c9'],
    resources: ['openneuro-ds003478', 'physionet-mi', 'moabb', 'jhu-sysreview', 'strobe', 'tripod-ai', 'sklearn-pitfalls'],
    lessons: [
      {
        id: 'c7-1', title: { ja: '論文の3パス読解', en: 'Three-pass paper reading' },
        keywords: ['abstract', 'figures first', 'methods scrutiny', 'claims vs evidence'],
        concept: {
          ja: [
            '1パス目（10分）：タイトル・Abstract・図・結論だけ。「何を主張しているか」「自分に関係あるか」を判断。',
            '2パス目（1時間）：図表を丁寧に読み、Methods の要点（対象者数、データ、前処理、分割、指標、統計）を抜き出す。わからない用語は疑問に保存。',
            '3パス目（数時間）：自分で再現するつもりで読む。前提・暗黙の選択・リークの可能性・代替説明を探す。英語表現で使えるものは英作文メモに。',
          ],
          en: [
            'Pass 1 (10 min): title, abstract, figures, conclusion. What is claimed? Is it relevant to you?',
            'Pass 2 (~1 h): read figures carefully; extract Methods essentials (n, data, preprocessing, split, metrics, statistics). Save unknown terms as questions.',
            'Pass 3 (hours): read as if you will replicate it. Hunt for assumptions, hidden choices, possible leakage and alternative explanations. Collect useful English phrasing.',
          ],
        },
        visual: { widget: 'pipeline', props: { kind: 'reading' }, caption: { ja: '3パス読解で深さを段階的に上げる。', en: 'Three passes, increasing depth.' } },
        practice: {
          task: { ja: 'うつ×EEG の論文を1本選び（OpenNeuro ds003478 を使った論文など）、2パス目のチェックリストを埋めよう。', en: 'Choose one depression × EEG paper (e.g. one using ds003478) and fill the pass-2 checklist.' },
          prompt: { ja: '書誌:\n主張:\nn（人数/試行）:\n前処理:\n分割:\n指標:\n限界/疑問:', en: 'Citation:\nClaim:\nn (people/trials):\nPreprocessing:\nSplit:\nMetrics:\nLimits/questions:' },
        },
        quiz: [
          { id: 'q1', q: { ja: '1パス目で読むべきでないのは？', en: 'What should you skip in pass 1?' },
            options: [{ ja: 'Methods の細部', en: 'Methods details' }, { ja: '図', en: 'Figures' }, { ja: 'Abstract', en: 'Abstract' }], answer: 0,
            explain: { ja: '細部は関係があると判断してから。', en: 'Details come once relevance is established.' } },
          { id: 'q2', q: { ja: '3パス目の主目的は？', en: 'Main goal of pass 3?' },
            options: [{ ja: '再現できるレベルで仮定と弱点を把握', en: 'Understand assumptions and weaknesses well enough to replicate' }, { ja: '引用数を確認', en: 'Check citation count' }], answer: 0,
            explain: { ja: '研究者として検証する読み方。', en: 'Reading as a verifier.' } },
        ],
        reflect: { ja: '論文中の英語で真似したい表現を1つ保存。', en: 'Save one English phrase from the paper worth imitating.' },
      },
      {
        id: 'c7-2', title: { ja: '先行研究比較表とギャップ', en: 'Literature table & gaps' },
        keywords: ['evidence table', 'research gap', 'systematic search'],
        concept: {
          ja: [
            '比較表の列：著者・年／データ（n、施設、公開か）／ラベル定義／特徴量／モデル／分割方式／主要結果（効果量・指標）／限界。',
            '研究ギャップは「誰もやっていない」より「既存結果がまだ検証していない条件」から探すと現実的：被験者独立評価、外部データでの検証、交絡調整、連続尺度での解析、前処理の頑健性（multiverse 解析）など。',
            '検索は PubMed / Google Scholar で検索式を記録して行う（例："EEG" AND depress* AND (classification OR biomarker)）。再現性はここから始まる。',
          ],
          en: [
            'Table columns: author/year · data (n, site, public?) · label definition · features · model · split · main result (effect size/metric) · limitations.',
            'Find gaps in “conditions prior results haven’t tested” rather than “nobody has ever done this”: subject-independent evaluation, external validation, confound adjustment, continuous-score analyses, preprocessing robustness (multiverse analysis).',
            'Search PubMed/Google Scholar with a recorded query (e.g. "EEG" AND depress* AND (classification OR biomarker)). Reproducibility starts here.',
          ],
        },
        practice: {
          task: { ja: '先行研究3本の比較表を作り、そこから研究ギャップ候補を3つ挙げよう。', en: 'Build a three-paper comparison table and list three gap candidates.' },
          prompt: { ja: '| 論文 | データ | ラベル | 特徴量 | 分割 | 結果 | 限界 |\n|---|---|---|---|---|---|---|\n| | | | | | | |\n\nギャップ候補:\n1.\n2.\n3.', en: '| Paper | Data | Label | Features | Split | Result | Limits |\n|---|---|---|---|---|---|---|\n| | | | | | | |\n\nGap candidates:\n1.\n2.\n3.' },
          draftSection: 'introduction',
        },
        quiz: [
          { id: 'q1', q: { ja: '現実的な研究ギャップの例は？', en: 'A realistic research gap?' },
            options: [{ ja: '既報の指標を被験者独立評価と交絡調整で再検証', en: 'Re-test a reported marker with subject-independent evaluation and confound adjustment' }, { ja: 'うつ病の原因を完全解明', en: 'Fully explain the cause of depression' }], answer: 0,
            explain: { ja: '範囲が明確で、公開データで実行可能。', en: 'Scoped and feasible on public data.' } },
          { id: 'q2', q: { ja: '検索式を記録する理由は？', en: 'Why record your search query?' },
            options: [{ ja: '文献選択の再現性と網羅性を示すため', en: 'To make literature selection reproducible' }, { ja: '不要', en: 'Not needed' }], answer: 0,
            explain: { ja: 'システマティックレビューの基本（E3）。', en: 'A systematic-review basic (E3).' } },
        ],
        reflect: { ja: '一番わくわくするギャップ候補はどれ？ アハとして保存。', en: 'Which gap excites you most? Save it as an aha.' },
      },
      {
        id: 'c7-3', title: { ja: '追試計画と再現レポート', en: 'Replication plan & report' },
        keywords: ['BIDS', 'environment', 'versions', 'exclusion criteria', 'README'],
        concept: {
          ja: [
            '追試の前に、データの README・participants.tsv・元論文の Methods を読み、「再現対象（どの図・どの数値）」を1つに決める。',
            '再現レポートの最小構成：目的／データ（版・DOI・ライセンス）／環境（Python・ライブラリの版、requirements.txt）／前処理（順序とパラメータ）／除外基準と人数の流れ／解析／結果（元論文との差）／差の考察。',
            '再現できなかったことも結果。差の原因候補（前処理、ラベル、版、seed）を切り分けて記録する。',
          ],
          en: [
            'Before replicating, read the README, participants.tsv and the original Methods, and fix one target (which figure, which number).',
            'Minimal replication report: aim · data (version, DOI, licence) · environment (Python and library versions, requirements.txt) · preprocessing (order, parameters) · exclusions and participant flow · analysis · results (vs original) · discussion of differences.',
            'Failing to replicate is a result. Isolate candidate causes (preprocessing, labels, versions, seeds) and record them.',
          ],
        },
        visual: { widget: 'pipeline', props: { kind: 'replication' }, caption: { ja: '再現レポートの流れ。', en: 'Flow of a replication report.' } },
        practice: {
          task: { ja: 'ds003478 の追試計画を「第三者が追試できる手順」6行以上で書こう。研究ノートの草稿 Methods にも追記される。', en: 'Write a ds003478 replication plan as ≥ 6 reproducible steps. It is also appended to your draft Methods.' },
          prompt: { ja: '再現対象:\n1. データ取得（版）:\n2. 環境:\n3. 前処理:\n4. 除外基準:\n5. 特徴量:\n6. 評価:\n', en: 'Target:\n1. Data (version):\n2. Environment:\n3. Preprocessing:\n4. Exclusions:\n5. Features:\n6. Evaluation:\n' },
          draftSection: 'methods',
        },
        quiz: [
          { id: 'q1', q: { ja: '再現レポートに必須でないのは？', en: 'Which is NOT essential in a replication report?' },
            options: [{ ja: '使った PC の色', en: 'The colour of your laptop' }, { ja: 'ライブラリのバージョン', en: 'Library versions' }, { ja: '除外基準', en: 'Exclusion criteria' }], answer: 0,
            explain: { ja: '版と除外基準は結果に影響する。', en: 'Versions and exclusions affect results.' } },
          { id: 'q2', q: { ja: '元論文と結果が違った。まずすべきことは？', en: 'Your result differs from the paper. First step?' },
            options: [{ ja: '差の原因候補を1つずつ切り分けて記録', en: 'Isolate and log candidate causes one at a time' }, { ja: '元論文に合うまでパラメータを調整', en: 'Tune until it matches' }], answer: 0,
            explain: { ja: '合わせに行くのは p-hacking と同じ構造。', en: 'Tuning to match is p-hacking in disguise.' } },
        ],
        reflect: { ja: '追試で一番不安な工程を疑問として保存。', en: 'Save the step you are least sure about as a question.' },
      },
    ],
  },

  {
    id: 'c8', code: 'C8', section: 'core', color: '#b9770e',
    title: { ja: '英語科学論文の執筆', en: 'Scientific Writing in English' },
    summary: { ja: 'IMRaD の構造、明快な英文の原則、Methods と報告ガイドラインを学び、200語 Abstract を書く。',
      en: 'IMRaD structure, principles of clear English, Methods and reporting guidelines — then write a 200-word abstract.' },
    goals: [
      { ja: 'IMRaD 各節が答える問いを言える', en: 'State the question each IMRaD section answers' },
      { ja: '能動態・簡潔・具体の原則で英文を書き直せる', en: 'Revise English for active voice, concision, specificity' },
      { ja: 'STROBE / TRIPOD+AI のチェック項目で Methods を点検できる', en: 'Audit Methods against STROBE / TRIPOD+AI' },
    ],
    deliverable: { ja: '200語の英語 Abstract（研究ノートの草稿に保存）', en: '200-word English abstract (saved to your draft)' },
    prereq: ['c7'], next: ['c9'],
    resources: ['sciwrite', 'strobe', 'tripod-ai', 'responsible-research'],
    lessons: [
      {
        id: 'c8-1', title: { ja: 'IMRaD とストーリー', en: 'IMRaD & the story' },
        keywords: ['Introduction', 'Methods', 'Results', 'Discussion', 'hourglass'],
        concept: {
          ja: [
            'Introduction：なぜこの問いが重要で、何がまだわかっていないか（広→狭）。Methods：何をどうやったか（再現できる詳しさ）。Results：何がわかったか（解釈を混ぜない）。Discussion：それは何を意味し、限界は何か（狭→広）。',
            'この形は「砂時計」：一般的な背景からギャップへ絞り、結果のあと再び一般的な意義へ広がる。',
            '書く順番は IMRaD 順でなくてよい。おすすめは Methods → Results（図）→ Introduction → Discussion → Abstract → Title。',
          ],
          en: [
            'Introduction: why the question matters and what is unknown (broad → narrow). Methods: what you did, in reproducible detail. Results: what you found, without interpretation. Discussion: what it means and its limits (narrow → broad).',
            'This is the hourglass: from general background to the gap, then back out to broader significance.',
            'You need not write in IMRaD order. Try Methods → Results (figures) → Introduction → Discussion → Abstract → Title.',
          ],
        },
        visual: { widget: 'imrad', caption: { ja: '砂時計構造。各節をタップすると「答える問い」が出る。', en: 'The hourglass. Tap a section to see the question it answers.' } },
        practice: {
          task: { ja: '自分の研究について、IMRaD 各節が答える問いを英語で1行ずつ書こう。', en: 'For your study, write one English line per IMRaD section stating the question it answers.' },
          prompt: { ja: 'Introduction:\nMethods:\nResults:\nDiscussion:', en: 'Introduction:\nMethods:\nResults:\nDiscussion:' },
        },
        quiz: [
          { id: 'q1', q: { ja: 'Results に書かないものは？', en: 'What does NOT belong in Results?' },
            options: [{ ja: '結果が意味することの推測', en: 'Speculation about meaning' }, { ja: '統計量と効果量', en: 'Statistics and effect sizes' }], answer: 0,
            explain: { ja: '解釈は Discussion へ。', en: 'Interpretation goes in Discussion.' } },
          { id: 'q2', q: { ja: 'おすすめの執筆順で最初に書くのは？', en: 'Recommended first section to draft?' },
            options: [{ ja: 'Methods', en: 'Methods' }, { ja: 'Abstract', en: 'Abstract' }], answer: 0,
            explain: { ja: 'やったことは一番書きやすく、他の節の土台になる。', en: 'What you did is easiest and anchors the rest.' } },
        ],
        reflect: { ja: '英語で書くときの一番の壁は？', en: 'Your biggest barrier when writing in English?' },
      },
      {
        id: 'c8-2', title: { ja: '明快な英文の原則', en: 'Principles of clear English' },
        keywords: ['active voice', 'concision', 'nominalisation', 'hedging'],
        concept: {
          ja: [
            '能動態を基本に：“It was found that alpha power was decreased” → “Alpha power decreased.” 主語と動詞を近づける。',
            '名詞化を避ける：“performed an analysis of” → “analysed”。不要語を削る：“in order to” → “to”。',
            '主張の強さを証拠に合わせる（hedging）：相関なら “was associated with”、因果を示していないのに “caused” と書かない。“suggests”, “may”, “is consistent with” を適切に。',
          ],
          en: [
            'Prefer active voice: “It was found that alpha power was decreased” → “Alpha power decreased.” Keep subject and verb close.',
            'Avoid nominalisations: “performed an analysis of” → “analysed”. Cut clutter: “in order to” → “to”.',
            'Match claim strength to evidence (hedging): use “was associated with” for correlations; never “caused” without causal evidence. Use “suggests”, “may”, “is consistent with” appropriately.',
          ],
        },
        practice: {
          task: { ja: '次の文を簡潔に書き直そう：“In order to perform an investigation of the relationship between EEG and depression, an analysis was conducted by us, and it was shown that alpha caused depression.”', en: 'Rewrite concisely: “In order to perform an investigation of the relationship between EEG and depression, an analysis was conducted by us, and it was shown that alpha caused depression.”' },
          prompt: { ja: '書き直し:\n直した点:', en: 'Rewrite:\nWhat I changed:' },
        },
        quiz: [
          { id: 'q1', q: { ja: '横断研究の結果として適切な英語は？', en: 'Appropriate wording for a cross-sectional finding?' },
            options: [{ ja: 'Lower alpha power was associated with higher BDI-II scores.', en: 'Lower alpha power was associated with higher BDI-II scores.' }, { ja: 'Low alpha power causes depression.', en: 'Low alpha power causes depression.' }], answer: 0,
            explain: { ja: '関連と因果を区別する。', en: 'Separate association from causation.' } },
          { id: 'q2', q: { ja: '“performed an analysis of” の簡潔形は？', en: 'Concise form of “performed an analysis of”?' },
            options: [{ ja: 'analysed', en: 'analysed' }, { ja: 'did an analysing of', en: 'did an analysing of' }], answer: 0,
            explain: { ja: '名詞化を動詞に戻す。', en: 'Turn the nominalisation back into a verb.' } },
        ],
        reflect: { ja: '自分がよく使ってしまう冗長表現をメモ。', en: 'Note a wordy habit of yours.' },
      },
      {
        id: 'c8-3', title: { ja: 'Abstract と報告ガイドライン', en: 'Abstract & reporting guidelines' },
        keywords: ['structured abstract', 'STROBE', 'TRIPOD+AI', 'limitations'],
        concept: {
          ja: [
            '200語 Abstract の型：Background（1–2文：重要性とギャップ）→ Objective（1文）→ Methods（2–3文：データ・n・特徴量・評価）→ Results（2–3文：数値と不確実性）→ Conclusion（1–2文：言えることと限界）。',
            'STROBE は観察研究、TRIPOD+AI は予測モデル研究の報告項目。チェックリストで抜けを点検すると、査読で指摘される典型的欠落を防げる。',
            '限界は隠さず具体的に：標本、横断デザイン、ラベルの妥当性、外部検証の欠如。',
          ],
          en: [
            '200-word abstract template: Background (1–2 sentences: importance and gap) → Objective (1) → Methods (2–3: data, n, features, evaluation) → Results (2–3: numbers with uncertainty) → Conclusion (1–2: what can be claimed, limits).',
            'STROBE covers observational studies; TRIPOD+AI covers prediction models. Auditing against them prevents typical omissions reviewers flag.',
            'State limitations concretely: sample, cross-sectional design, label validity, lack of external validation.',
          ],
        },
        practice: {
          task: { ja: '型に沿って200語の英語 Abstract を書こう（追試計画でも可）。保存すると草稿の Abstract に入る。', en: 'Write a 200-word English abstract using the template (a replication plan is fine). Saving fills your draft’s Abstract.' },
          prompt: { ja: 'Background:\nObjective:\nMethods:\nResults:\nConclusion:', en: 'Background:\nObjective:\nMethods:\nResults:\nConclusion:' },
          draftSection: 'abstract', wordTarget: 200,
        },
        quiz: [
          { id: 'q1', q: { ja: 'EEG で抑うつ症状を予測するモデル研究の報告ガイドラインは？', en: 'Reporting guideline for an EEG model predicting depressive symptoms?' },
            options: [{ ja: 'TRIPOD+AI', en: 'TRIPOD+AI' }, { ja: 'CONSORT', en: 'CONSORT' }], answer: 0,
            explain: { ja: 'CONSORT は RCT 用。', en: 'CONSORT is for RCTs.' } },
          { id: 'q2', q: { ja: 'Abstract の Results に必要なのは？', en: 'Results in an abstract need…' },
            options: [{ ja: '数値と不確実性（CI等）', en: 'Numbers with uncertainty (CIs etc.)' }, { ja: '「興味深い結果が得られた」', en: '“Interesting results were obtained”' }], answer: 0,
            explain: { ja: '具体的な数値で主張を支える。', en: 'Support claims with concrete numbers.' } },
        ],
        reflect: { ja: 'Abstract を書いて見えた研究の弱点を保存。', en: 'Save a weakness of your study revealed by writing the abstract.' },
      },
    ],
  },

  {
    id: 'c9', code: 'C9', section: 'core', color: '#e74c3c',
    title: { ja: 'キャップストーン：独自研究と論文草稿', en: 'Capstone: Original Research & Draft' },
    summary: { ja: '追試から一歩進み、研究ギャップ→反証可能な仮説→事前分析計画→図表と限界→英語草稿と1ページ提案書を完成させる。',
      en: 'Move beyond replication: gap → falsifiable hypothesis → pre-analysis plan → figures and limits → English draft and a one-page proposal.' },
    goals: [
      { ja: '自分の研究ギャップと新規性を1段落で説明できる', en: 'Explain your gap and novelty in one paragraph' },
      { ja: '反証条件つきの仮説と事前分析計画を書ける', en: 'Write a hypothesis with falsification criteria and an analysis plan' },
      { ja: 'IMRaD 草稿と教授に送れる1ページ提案書を作れる', en: 'Produce an IMRaD draft and a one-page proposal for a professor' },
    ],
    deliverable: { ja: 'IMRaD 英語草稿＋1ページ研究提案（研究ノートからエクスポート）', en: 'IMRaD English draft + one-page proposal (exported from the notebook)' },
    prereq: ['c6', 'c7', 'c8'], next: [],
    resources: ['openneuro-ds003478', 'tripod-ai', 'strobe', 'sciwrite', 'responsible-research', 'tue-inferences'],
    lessons: [
      {
        id: 'c9-1', title: { ja: '研究ギャップと新規性', en: 'Gap & novelty' },
        keywords: ['novelty', 'contribution', 'scope'],
        concept: {
          ja: [
            '新規性は大発見である必要はない。「既存結果を、より厳密な評価（被験者独立・外部検証・交絡調整）で検証する」「別のデータセットに一般化する」「前処理の選択に結果がどれだけ依存するか示す」は立派な貢献。',
            '貢献を1文で：“We test whether X, previously reported under Y, holds under Z.”',
            'スコープは実行可能な範囲に。公開データ・自分の計算資源・期間で終わる問いを選ぶ。',
          ],
          en: [
            'Novelty need not be a breakthrough. Testing prior findings with stricter evaluation (subject-independent, external validation, confound adjustment), generalising to new data, or quantifying preprocessing sensitivity are real contributions.',
            'State your contribution in one sentence: “We test whether X, previously reported under Y, holds under Z.”',
            'Keep scope feasible: a question that public data, your compute and your time can answer.',
          ],
        },
        practice: {
          task: { ja: 'C7 のギャップ候補から1つ選び、貢献を英語1文＋日本語の説明で書こう。草稿の Introduction に入る。', en: 'Choose one gap from C7; write your contribution in one English sentence plus explanation. Goes into the draft Introduction.' },
          prompt: { ja: 'Contribution (EN):\n背景と理由:', en: 'Contribution:\nBackground & rationale:' },
          draftSection: 'introduction',
        },
        quiz: [
          { id: 'q1', q: { ja: '学部生の最初の研究として適切な新規性は？', en: 'Appropriate novelty for a first undergraduate project?' },
            options: [{ ja: '既報指標の被験者独立・交絡調整による再検証', en: 'Re-testing a reported marker with subject-independent, confound-adjusted analysis' }, { ja: 'EEGだけでうつ病の原因を特定', en: 'Identifying depression’s cause from EEG alone' }], answer: 0,
            explain: { ja: '実行可能で、方法論的な貢献が明確。', en: 'Feasible, with a clear methodological contribution.' } },
        ],
        reflect: { ja: '教授に相談したい点を疑問として保存。', en: 'Save what you want to ask a professor.' },
      },
      {
        id: 'c9-2', title: { ja: '反証可能な仮説と事前分析計画', en: 'Falsifiable hypothesis & analysis plan' },
        keywords: ['H0/H1', 'primary outcome', 'smallest effect of interest', 'exclusion'],
        concept: {
          ja: [
            '仮説：H1「閉眼安静時の後頭 alpha 相対パワーは BDI-II 得点と負の相関（r ≤ −0.2）を示す」、H0「相関はない、または |r| < 0.2」。棄却条件を数値で書く。',
            '事前分析計画：対象と除外基準／主要アウトカム（1つ）／特徴量の定義／共変量／統計モデル／多重比較の扱い／欠測の扱い／感度分析。',
            '予測モデルなら：被験者独立 CV、主要指標（balanced accuracy や AUC）、ベースラインモデル、置換検定、外部検証の有無。',
          ],
          en: [
            'Hypothesis: H1 “Eyes-closed occipital relative alpha power correlates negatively with BDI-II (r ≤ −0.2)”; H0 “no correlation, or |r| < 0.2”. State rejection criteria numerically.',
            'Pre-analysis plan: sample and exclusions · one primary outcome · feature definitions · covariates · statistical model · multiplicity · missing data · sensitivity analyses.',
            'For prediction: subject-independent CV, primary metric (balanced accuracy or AUC), baseline model, permutation test, external validation (yes/no).',
          ],
        },
        visual: { widget: 'pipeline', props: { kind: 'question' } },
        practice: {
          task: { ja: '自分の H0/H1 と事前分析計画を書こう。草稿の Methods に追記される。', en: 'Write your H0/H1 and pre-analysis plan. Appended to the draft Methods.' },
          prompt: { ja: 'H1:\nH0:\n棄却条件:\n対象・除外:\n主要アウトカム:\n共変量:\n統計モデル:\n多重比較:\n感度分析:', en: 'H1:\nH0:\nRejection criteria:\nSample & exclusions:\nPrimary outcome:\nCovariates:\nModel:\nMultiplicity:\nSensitivity analyses:' },
          draftSection: 'methods',
        },
        quiz: [
          { id: 'q1', q: { ja: '良い仮説の条件でないのは？', en: 'Which is NOT a property of a good hypothesis?' },
            options: [{ ja: 'どんな結果でも支持される', en: 'Supported by any result' }, { ja: '棄却条件が明確', en: 'Clear rejection criteria' }, { ja: '測定可能な変数', en: 'Measurable variables' }], answer: 0,
            explain: { ja: 'どんな結果でも支持される仮説は反証不能。', en: 'A hypothesis compatible with everything is unfalsifiable.' } },
        ],
        reflect: { ja: '仮説が棄却されたら、次に何を調べる？', en: 'If your hypothesis is rejected, what next?' },
      },
      {
        id: 'c9-3', title: { ja: '図表と限界', en: 'Figures & limitations' },
        keywords: ['one message per figure', 'uncertainty', 'generalisability'],
        concept: {
          ja: [
            '1つの図に1つのメッセージ。個々のデータ点（被験者）を見せ、平均だけでなくばらつき・信頼区間を描く。色覚多様性に配慮した配色。',
            'キャプションだけで図が理解できるように：何を・何人で・誤差棒は何か（SD/SE/CI）。',
            '限界は3層で書く：内的妥当性（交絡・測定）、外的妥当性（対象集団・施設）、統計的妥当性（検出力・多重比較）。過大解釈しない。',
          ],
          en: [
            'One message per figure. Show individual data points (subjects), not just means; draw spread and CIs. Use colour-blind-safe palettes.',
            'Captions must stand alone: what, how many, and what error bars mean (SD/SE/CI).',
            'Write limitations at three levels: internal validity (confounds, measurement), external validity (population, site), statistical validity (power, multiplicity). Do not overclaim.',
          ],
        },
        practice: {
          task: { ja: '主要結果を伝える図を1枚設計（x軸・y軸・点・誤差棒・キャプション）し、限界を3点書こう。草稿の Results/Discussion に入る。', en: 'Design one key figure (axes, points, error bars, caption) and write three limitations. Goes into draft Results/Discussion.' },
          prompt: { ja: '図: x= / y= / 点= / 誤差棒= \nキャプション:\n限界1（内的）:\n限界2（外的）:\n限界3（統計）:', en: 'Figure: x= / y= / points= / error bars=\nCaption:\nLimitation 1 (internal):\nLimitation 2 (external):\nLimitation 3 (statistical):' },
          draftSection: 'discussion',
        },
        quiz: [
          { id: 'q1', q: { ja: '誤差棒についてキャプションに書くべきは？', en: 'What must a caption say about error bars?' },
            options: [{ ja: 'SD・SE・CI のどれか', en: 'Whether they are SD, SE or CI' }, { ja: '色', en: 'Their colour' }], answer: 0,
            explain: { ja: '種類によって意味がまったく違う。', en: 'They mean very different things.' } },
        ],
        reflect: { ja: '図を作って気づいたことをアハとして保存。', en: 'Save an aha from designing your figure.' },
      },
      {
        id: 'c9-4', title: { ja: '英語草稿と1ページ提案書', en: 'English draft & one-page proposal' },
        keywords: ['draft', 'proposal', 'feedback', 'cold email'],
        concept: {
          ja: [
            '研究ノートの「草稿」タブに、これまでのレッスンで書いた Introduction・Methods・Abstract・Discussion が集まっている。Results は実際の解析後に書く。',
            '1ページ提案書の見出し：Title / Background & Gap / Research Question & Hypothesis / Data & Methods / Expected Results & Risks / Timeline / Why this lab。',
            '海外の研究室に送る前に：指導教員・先輩のレビュー、英語校正、研究室の最近の論文を読んで「なぜこの研究室か」を具体化。投稿は新規性・方法・評価が十分になってから。',
          ],
          en: [
            'Your notebook’s Draft tab now collects the Introduction, Methods, Abstract and Discussion you wrote in earlier lessons. Write Results after the real analysis.',
            'One-page proposal headings: Title / Background & Gap / Research Question & Hypothesis / Data & Methods / Expected Results & Risks / Timeline / Why this lab.',
            'Before contacting labs abroad: get feedback from supervisors and peers, proofread, and read the lab’s recent papers to make “why this lab” concrete. Submit to journals only when novelty, methods and evaluation are solid.',
          ],
        },
        practice: {
          task: { ja: '草稿タブで Title と各節を整え、「1ページ提案書」として Markdown をエクスポートしよう。', en: 'Polish the title and sections in the Draft tab, then export the one-page proposal as Markdown.' },
          prompt: { ja: 'Title:\nWhy this lab:\nTimeline:', en: 'Title:\nWhy this lab:\nTimeline:' },
        },
        quiz: [
          { id: 'q1', q: { ja: '論文投稿の前に最も重要なのは？', en: 'Most important before journal submission?' },
            options: [{ ja: '指導者のレビューと方法・評価の妥当性確認', en: 'Supervisor review and validated methods/evaluation' }, { ja: 'できるだけ早く投稿', en: 'Submitting ASAP' }], answer: 0,
            explain: { ja: '研究の質が最優先。', en: 'Quality first.' } },
        ],
        reflect: { ja: 'ここまでの旅で最大のアハ体験は？', en: 'Your biggest aha of the whole journey?' },
      },
    ],
  },
];
