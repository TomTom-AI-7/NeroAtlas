# Cloudflare Pages へのデプロイ

fmva-study と同じく、GitHub のリポジトリを Cloudflare Pages につなぎ、push するたびに自動で公開する。
サーバーは不要（静的サイト）。ホーム画面に追加すればオフラインでも開ける PWA として動く。

## 最初の1回だけ（Cloudflare のダッシュボード）

1. Cloudflare にログイン → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub の `TomTom-AI-7/NeroAtlas` を選ぶ（初回は Cloudflare の GitHub App にこのリポジトリへのアクセスを許可）
3. 設定:

   | 項目 | 値 |
   |---|---|
   | Project name | `neuroatlas`（URL が `https://neuroatlas.pages.dev` になる） |
   | Production branch | `main`（PR をマージする前に試すなら `claude/neuroatlas-mvp`） |
   | Framework preset | None |
   | Build command | `node scripts/build.mjs` |
   | Build output directory | `dist` |

4. **Save and Deploy**。1分ほどで公開される。

以降は、production branch に push すると本番、それ以外のブランチに push するとプレビュー URL が自動で作られる。

## ビルドがしていること（`scripts/build.mjs`）

- アプリが使うファイル（`index.html`・`css/`・`js/`・`content/`・`icons/`・`manifest.webmanifest`・`sw.js`）だけを `dist/` にコピー
  （`docs/`・`tests/`・`notebooks/` は公開しない）
- Service Worker のキャッシュ名にコミット ID を入れる → 公開のたびに、インストール済みのアプリも次回起動時に更新される
- `_headers` で `sw.js` と `index.html` を毎回再検証させる

手元での確認: `npm run preview`（`dist/` を作って http://localhost:8000 で配信）

## iPhone でアプリとして使う

Safari で公開 URL を開く → 共有 → **ホーム画面に追加**。黒地に白線のアイコン（`icons/apple-touch-icon.png`）で追加され、全画面で開く。

## 注意

- 学習記録はブラウザ（端末）ごとに保存される。今の claude.ai のリンクで解いた記録は引き継がれないので、
  必要ならノート →「バックアップ(JSON)」→ 新しい URL のノート →「データ」→ 復元。
- 「ブラウザで実行」（Pyodide）は `cdn.jsdelivr.net` から読み込むので、Cloudflare 版ではそのまま動く。

## Vercel の場合

`vercel.json` にビルド設定が入っているので、Vercel では **Add New → Project → `TomTom-AI-7/NeroAtlas` を Import → Deploy** だけで動く
（Build Command `node scripts/build.mjs`、Output Directory `dist` は自動で読み込まれる）。
本番にするブランチは Settings → Git → Production Branch で `claude/neuroatlas-mvp`（または `main` にマージ）。

## 自動デプロイ（おすすめ・推奨設定）

`.github/workflows/deploy-vercel.yml` が、`main` または `claude/neuroatlas-mvp` に push されるたびに
テスト → ビルド確認 → Vercel（チーム AvoAvo's projects、プロジェクト `neuroatlas`）への本番公開 を自動で行う。
GitHub 側から公開するので、Vercel にログインしている GitHub アカウントの権限は関係ない。

最初の1回だけ:
1. https://vercel.com/account/tokens でトークンを作る（Scope: AvoAvo's projects、期限は任意）
2. GitHub に TomTom-AI-7 でログイン → `TomTom-AI-7/NeroAtlas` → Settings → Secrets and variables → Actions →
   New repository secret → Name `VERCEL_TOKEN`、Secret に 1 のトークン → Add secret

以降は何もしなくてよい。公開 URL は `https://neuroatlas.vercel.app`（同名が使用済みなら Vercel が別名を付ける。Actions の実行結果に URL が出る）。
