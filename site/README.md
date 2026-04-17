# fukui-pharma.com - Astro SSG版

Vite SPA から Astro 静的サイトジェネレータ（SSG）への移行プロジェクト

## 📋 プロジェクト概要

**従来アーキテクチャ（Vite SPA）**
- React + Vite でバンドル
- ページロード時に JavaScript 実行
- メタタグは useEffect で動的生成
- 検索エンジンが JS を実行しないため SEO に不利

**新アーキテクチャ（Astro SSG）**
- ビルド時に 98 ページを静的 HTML として生成
- 各ページが独立した index.html を持つ
- メタタグはビルド時に埋め込み（SEO 対応）
- React は Islands Architecture で対話機能のみに限定

## 🚀 現在の進行状況

### ✅ 完了フェーズ

#### Phase 1: Astro 基盤構築
- [x] Astro 6.x + @astrojs/react インストール
- [x] Content Collections で 9 つのセクション定義
- [x] src/content/ にマークダウン移行
- [x] 動的ルーティング実装 (`src/pages/[...slug].astro`)
- [x] 98 ページを静的 HTML として生成

**成果物**: `dist/` に個別 HTML ファイル
```
dist/
├── aensiryou/index.html
├── vitamin-mineral/eiyou/index.html
├── flowers/2007catC/index.html
└── ... (計98ページ)
```

#### Phase 2: React Islands 統合
- [x] MenuLeftIsland.jsx 作成（対話式メニュー）
- [x] BaseLayout に Island 統合（client:load）
- [x] currentSlug, currentSection props で動的ハイライト
- [x] SSR + クライアント側ハイドレーション実装

**成果物**:
- SSR 版メニューHTML（検索エンジン対応）
- React による対話機能（アコーディオン開閉）

### 📌 次のフェーズ（予定）

#### Phase 3: SEO メタ生成
- [ ] markdown frontmatter から title, description 抽出
- [ ] 各ページで正しいメタタグを生成
- [ ] og:image, canonical URL を自動設定
- [ ] @astrojs/sitemap で sitemap.xml 自動生成

#### Phase 4: 画像・アセット対応
- [ ] 不足画像ファイルの整理
- [ ] ビルド時画像検証
- [ ] public/ → dist/ の自動コピー

#### Phase 5: URL 保持・リダイレクト
- [ ] 既存 URL 互換性維持
- [ ] レガシー URL の 301 リダイレクト設定
- [ ] Cloudflare _middleware.js 簡素化

#### Phase 6: テスト・デプロイ
- [ ] ローカル動作確認
- [ ] 各ページのメタタグ検証
- [ ] Cloudflare Pages へのデプロイ

## 📁 ディレクトリ構造

```
site/
├── src/
│   ├── content/           # マークダウンコンテンツ
│   │   ├── vitamin-mineral/
│   │   ├── flowers/
│   │   ├── supplement/
│   │   └── ... (その他セクション)
│   ├── components/        # React コンポーネント
│   │   └── MenuLeftIsland.jsx
│   ├── layouts/          # Astro レイアウト
│   │   ├── BaseLayout.astro
│   │   └── MarkdownLayout.astro
│   └── pages/            # ページ・ルート
│       └── [...slug].astro
├── public/               # 静的アセット（画像など）
├── dist/                 # ビルド出力（98個の HTML）
├── astro.config.mjs      # Astro 設定
├── src/content.config.ts # Content Collections 定義
└── package.json
```

## 🛠️ 開発環境セットアップ

### インストール
```bash
cd site
npm install
```

### 開発サーバー起動
```bash
npm run dev
# http://localhost:3000 で起動
```

### ビルド
```bash
npm run build
# dist/ に 98 個の HTML ファイルを生成
```

## 📊 構成要素の説明

### Content Collections
マークダウンファイルをカテゴリ別に整理：
- `vitamin-mineral`: ビタミン・ミネラル（44ファイル）
- `flowers`: 花の写真・記事（28ファイル）
- `supplement`: サプリメント（6ファイル）
- `travel`: 旅行記（7ファイル）
- 他 5 セクション

### Dynamic Routes (`src/pages/[...slug].astro`)
```javascript
export async function getStaticPaths() {
  // 全 Collection から slug を抽出
  // 各 slug に対して /slug/index.html を生成
}
```

### React Island (MenuLeftIsland.jsx)
```javascript
export const MenuLeftIsland = ({ currentSlug, currentSection }) => {
  // currentSlug, currentSection に基づいてメニューをハイライト
  // クライアント側で開閉状態を管理
}
```

### レイアウト階層
```
BaseLayout.astro
  └── MenuLeftIsland (React Island, client:load)
      └── MarkdownLayout.astro
          └── コンテンツ
```

## 🔍 SEO の改善

### 従来型（Vite SPA）との比較

| 項目 | SPA | SSG |
|------|-----|-----|
| ページロード | JS 実行必須 | 即座に表示 |
| メタタグ | JS 生成（遅延） | HTML に埋め込み |
| 検索エンジン | 不完全なインデックス | 完全にインデックス |
| ファーストバイト | 遅い | 高速 |
| SEO スコア | 低い | 高い |

## ⚠️ 既知の制限・今後の対応

### 画像ファイル
- 現状: markdown の画像参照を `[Image]` に置換
- 理由: 実際のファイルが存在しない、パスが複雑
- 対応: Phase 4 で整理予定

### メタタグ（title, description）
- 現状: 全ページで "Fukui Pharma" というジェネリック表示
- 理由: markdown に frontmatter が記載されていない
- 対応: Phase 3 で frontmatter を抽出・自動生成予定

### URL 末尾スラッシュ
- Astro は `/vitamin-mineral/aensiryou/` で生成
- `/vitamin-mineral/aensiryou` へのアクセスは 301 リダイレクト予定

## 📝 主な変更点

### 削除・不要化
- ❌ SPAミドルウェア（_middleware.js）の複雑な処理
- ❌ useEffect でのメタタグ操作
- ❌ window.location による動的ルーティング

### 新規追加
- ✅ Astro Content Collections
- ✅ React Islands
- ✅ 静的 HTML 生成

## 🚢 デプロイ

### Cloudflare Pages
本番環境への展開手順（Phase 6 で実施）：
```bash
npm run build
# dist/ が生成される
# Cloudflare Pages に git push → 自動デプロイ
```

## 📖 参考リンク

- [Astro公式ドキュメント](https://docs.astro.build/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [React Islands Architecture](https://docs.astro.build/en/guides/integrations-guide/react/)
- 詳細計画: [Astro Migration Plan](/../../.claude/plans/astro-migration.md)

## 🔄 メンテナンス

### markdown ファイル追加時
1. `src/content/{section}/` に .md ファイルを配置
2. `npm run build` で自動的に HTML 生成
3. frontmatter（title, description）を記載しておくと、後で Phase 3 で自動抽出

### スタイル変更
- `src/components/MenuLeftIsland.jsx` の import で使用している CSS を修正
- Astro ライアウトの `<style>` タグで共通スタイルを定義可能

## ❓ FAQ

**Q: なぜ Astro にしたのか？**
A: 静的 HTML 生成で SEO 対応、ビルド時最適化、React Islands で対話機能の柔軟性。

**Q: Vite 版に戻せるか？**
A: `astro-migration` ブランチで新版を管理。`master` ブランチで旧版も保持可能。

**Q: デプロイはいつ？**
A: Phase 6 完了後（全 URL 対応、画像整理完了後）を予定。

---

## 📧 更新履歴

- **2026-04-18**: Phase 1, 2 完了（98ページ静的生成 + React Islands 統合）
- **計画中**: Phase 3-6 実施予定

**ブランチ**: `astro-migration`
