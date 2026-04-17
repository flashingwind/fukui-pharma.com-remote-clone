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

### Phase 3: SEOメタ生成 (予定)
**目標**: ビルド時に全メタタグを静的生成

実装予定:
1. markdownのfrontmatter抽出: title, description, keywords
2. BaseLayout.astroでメタタグを動的生成
3. og:image, canonical URLの自動設定
4. @astrojs/sitemap統合（自動サイトマップ生成）

### Phase 4: 画像・アセット対応 (予定)
**目標**: ビルド時画像検証で404エラーを防止

実装予定:
1. markdownの画像参照を検証スクリプトで確認
2. 不足している画像を警告またはスキップ
3. public/ 配下の画像を dist/ へ自動コピー

現状: 
- markdownから画像参照削除して動作（[Image]プレースホルダで対応）
- 後で画像を整理した上で復旧予定

### Phase 5: URL保持・リダイレクト (予定)
**目標**: 既存URL互換性を維持、レガシーURL対応

実装予定:
1. 既存URL保持: /vitamin-mineral/aensiryou → /vitamin-mineral/aensiryou/
2. レガシーURL対応: /eiyouso → /vitamin-mineral/eiyouso
3. Cloudflareミドルウェア修正（_middleware.js）
4. 301リダイレクト設定

### Phase 6: テスト・デプロイ (予定)
**目標**: 動作確認・本番環境への展開

実装予定:
1. ローカル開発: npm run dev で動作確認
2. 各ページのメタタグ検証
3. リンク・画像確認
4. Cloudflareへのデプロイ手順確認

## 実装スケジュール

| 週 | フェーズ | 内容 | 状態 |
|----|---------|------|------|
| 1 | Phase 1 | Astro基盤・Content Collections | ✅ 完了 |
| 2 | Phase 2 | React Islands統合 | ✅ 完了 |
| 3 | Phase 3 | SEOメタ生成 | 予定 |
| 4 | Phase 4 | 画像・アセット対応 | 予定 |
| 5 | Phase 5 | URL保持・リダイレクト | 予定 |
| 6 | Phase 6 | テスト・デプロイ | 予定 |

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
- 対応: ✅ Astroからpropで渡すように修正

### 2. 画像ファイル不足
- 問題: markdownに参照される画像が実際に存在しない
- 対応: [Image]プレースホルダで対応、後で整理予定

### 3. マークダウンのfrontmatter不足
- 問題: 多くのmdにtitle/description/keywordsがない
- 対応: SEO Phase 3で frontmatter 抽出・補足予定

### 4. Cloudflareミドルウェアの複雑性
- 問題: _middleware.js が SPA フォールバック制御（複雑）
- 対応: SSGで全ページ静的化されたので大幅簡化可能

## 成功基準

- [x] 98ページが静的HTML生成
- [x] React Islandで対話機能が動作
- [ ] 全ページのメタタグが正しく生成される
- [ ] 既存URLが全て機能（リダイレクト含む）
- [ ] テーマ設定が保持される
- [ ] ビルド時間が30秒以下
- [ ] 検索エンジンでのSEOスコア向上
- [ ] 本番Cloudflareへのデプロイ成功

## 技術スタック

| 項目 | 技術 |
|------|------|
| SSG | Astro 6.x |
| スタイリング | CSS（既存 MenuLeft.css 継続） |
| JSフレームワーク | React 19.x（Islands） |
| マークダウン処理 | marked |
| ホスティング | Cloudflare Pages |

## 次のステップ

1. Phase 3 実施: frontmatter から title/description を抽出・表示
2. Phase 4 実施: 画像ファイルを整理、build時検証追加
3. Phase 5 実施: URL リダイレクト設定
4. Phase 6 実施: 本番テスト・デプロイ
