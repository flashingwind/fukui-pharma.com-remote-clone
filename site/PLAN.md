# fukui-pharma.com Astro SSG移行計画

## 概要
fukui-pharma.comをVite SPA（シングルページアプリケーション）からAstro SSG（静的サイトジェネレータ）に移行します。React Islands Architectureを使用して対話的機能を保持しながら、各ページに個別のHTMLファイルを生成してSEOを改善します。

## 現在の状態分析

### SPA（Vite）のアーキテクチャ問題
- **SEOの課題**: 全てのメタタグ、タイトル、説明がuseEffect + document.headで動的生成
- **パフォーマンス**: 毎回のページロードでReactアプリ全体をバンドル・実行
- **検索エンジン対応**: JavaScriptを実行しない検索エンジンからのインデックスが不完全
- **ブラウザAPI依存**: MenuLeft.jsxがwindow.locationに依存

### コンテンツ構造
- マークダウンファイル約100個: vitamin-mineral, supplement, active-oxygen, atopic, flowers, travel, others, publication, shop, access
- メニュー自動生成スクリプト完備（generate-menu-sets.js, generate-flowers-index.js）
- Cloudflareミドルウェア（_middleware.js）がマークダウン存在確認でSPAフォールバック制御
- 画像フォールバックはonErrorコールバック使用（SSGでは動作しない）

## 移行戦略

### Phase 1: Astro基盤構築 & Content Collections ✅ 完了
**目標**: Astro + Content Collections APIで基本構造を確立

実施内容:
- Astro 6.x + @astrojs/react インストール
- astro.config.mjs設定（static output）
- src/content.config.ts定義（9つのコレクション）
- markdown ファイル src/content/ へ移行
- [動的ルーティング](/src/pages/[...slug].astro)で98ページを静的生成
- BaseLayout.astro & MarkdownLayout.astro 作成

成果: **98ページの静的HTML生成に成功**

### Phase 2: React Islands統合 ✅ 完了
**目標**: CSRコンポーネントをIslands Architectureに変換

実施内容:
- MenuLeftIsland.jsx作成（React Interactive）
- BaseLayoutにIslandを統合（client:load）
- 動的ルートから currentSlug, currentSection propを渡す
- 静的HTML + クライアント側ハイドレーション実装

成果: 
- SSR版メニューHTML（SEO対応）
- クライアント側で対話機能（アコーディオン開閉）を実現

### Phase 3: SEOメタ生成 ✅ 完了
**目標**: ビルド時に全メタタグを静的生成

実施内容:
1. descriptionをfrontmatterから取得、なければ本文冒頭120文字から自動生成
2. BaseLayout.astroでcanonical URL・titleを静的生成
3. keywordsメタタグ削除（Googleは無視するため不要）
4. sitemap.xml はAstro自動生成

### Phase 4: 画像・アセット対応 ✅ 完了
**目標**: 全ページの画像を正しく表示

実施内容:
1. 移行時に `[Image]` プレースホルダに置き換えられていた画像を全復元
2. 旧サイト（old-viteブランチ）のmdと照合してパスを修正
3. `new.svg` など小アイコンも復元
4. `public/` 配下の画像は Astro が dist/ へ自動コピー

### Phase 5: URL保持・リダイレクト ✅ 完了
**目標**: 既存URL互換性を維持

実施内容:
1. Astro生成URL: /collection/slug/（末尾スラッシュ）で統一
2. `_redirects`: /index.html → / の301リダイレクト
3. 旧Vite用 `_middleware.js` を削除（全ページ静的化済みで不要）

### Phase 6: テスト・デプロイ ✅ 完了
**目標**: 動作確認・本番環境への展開

実施内容:
1. Cloudflare Pages へのデプロイ自動化（post-pushフック）
2. 全99ページのHTTPステータス確認
3. 内部リンクチェック（Pythonスクリプト）
4. menuの自動展開（currentSection = collectionキー）確認

## 実装スケジュール

| 週 | フェーズ | 内容 | 状態 |
|----|---------|------|------|
| 1 | Phase 1 | Astro基盤・Content Collections | ✅ 完了 |
| 2 | Phase 2 | React Islands統合 | ✅ 完了 |
| 3 | Phase 3 | SEOメタ生成 | ✅ 完了 |
| 4 | Phase 4 | 画像・アセット対応 | ✅ 完了 |
| 5 | Phase 5 | URL保持・リダイレクト | ✅ 完了 |
| 6 | Phase 6 | テスト・デプロイ | ✅ 完了 |

## 重要な設計判断

### React Islands vs 静的Astro
- **MenuLeft（Reactive）**: アコーディオン開閉状態管理が必要
- **テーマトグル（計画中）**: テーマ永続化にJS必要
- **コンテンツレンダリング（静的）**: markdown → HTML は変更なし

### メニュー生成戦略
- ✅ Astro内部で Content Collections APIから生成
- ❌ 別スクリプト（generate-menu-sets.js）は不要化

### URL構造
- 既存URL保持: /vitamin-mineral/aensiryou
- Astro生成: /vitamin-mineral/aensiryou/index.html（末尾スラッシュ）
- レガシー対応予定

## 既知の課題と対応

### 1. window.location依存
- 問題: MenuLeft.jsxが window.location.pathname を参照
- 対応: ✅ `client:only="react"` に変更、ブラウザ側で window.location から section/slug を取得

### 2. 画像ファイル不足
- 問題: 移行時に画像参照が `[Image]` プレースホルダに置換された
- 対応: ✅ 旧サイトmdと照合して全ページ復元済み

### 3. マークダウンのfrontmatter不足
- 問題: 多くのmdにtitle/descriptionがない
- 対応: ✅ descriptionは本文冒頭120文字から自動生成。titleはfrontmatter優先、なければ本文冒頭のh1から自動取得

### 4. Cloudflareミドルウェアの複雑性
- 問題: 旧Vite用 `_middleware.js` が全リクエストを横取りして全ページ404になった
- 対応: ✅ `functions/_middleware.js` を削除

### 5. nutrient-foods リンク切れ
- 問題: `vitamin-mineral/ganyuute.md` に `/vitamin-mineral/nutrient-foods/xxx` へのリンクが残存
- 対応: ✅ `/nutrient-foods/xxx` に修正済み

### 6. トップページ（/）が404
- 問題: `index.astro` がなく、`index.md` がコレクション外で静的生成されなかった
- 対応: ✅ `src/pages/index.astro` を追加

## 成功基準

- [x] 99ページが静的HTML生成
- [x] React Islandで対話機能が動作
- [x] 全ページのdescriptionメタタグが生成される
- [x] 既存URLが全て機能
- [x] ビルド時間が30秒以下（約6秒）
- [x] 本番Cloudflare Pagesへのデプロイ成功・自動化
- [x] 画像が全ページで正しく表示
- [x] メニューが現在のセクションで自動展開

## 技術スタック

| 項目 | 技術 |
|------|------|
| SSG | Astro 6.x |
| スタイリング | CSS（既存 MenuLeft.css 継続） |
| JSフレームワーク | React 19.x（Islands） |
| マークダウン処理 | marked |
| ホスティング | Cloudflare Pages |

## 移行完了 ✅

全フェーズ完了。https://fukui-pharma.com/ で本番稼働中。
