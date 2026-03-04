# 技術仕様書

## テクノロジースタック

### フロントエンド

| 技術 | バージョン | 用途 |
|---|---|---|
| JavaScript / TypeScript | ES2020+ | プラグインコア実装 |
| React | 18.x（Growi依存） | UIコンポーネント |
| CSS Modules / styled-components | Growi採用方式に準拠 | スタイリング |

### 差分処理ライブラリ

| ライブラリ | 用途 |
|---|---|
| `diff`（jsdiff） | Markdownテキスト差分算出 |
| `htmldiff-js` または `diff-dom` | HTMLレンダリング後の差分算出（実装時に選定） |

### プラグインシステム

| 技術 | 説明 |
|---|---|
| Growi Plugin System | `growi-plugin` 仕様に準拠 |
| Growi Client API | リビジョン取得・HTMLレンダリングエンドポイントを利用 |

## 開発ツールと手法

| ツール | 用途 |
|---|---|
| Node.js | 開発環境 |
| npm / yarn | パッケージ管理 |
| Webpack / Vite | バンドル（Growi プラグイン規約に従う） |
| ESLint | コード品質チェック |
| Prettier | コードフォーマット |

## 技術的制約と要件

### Growiプラグイン制約

- Growiのプラグインシステム（`growi-plugin`）の仕様に完全準拠
- Growiコアのソースコードを改変しない
- GrowiがすでにバンドルしているReactを使用（独自のReactバンドル不可）
- Growi APIのバージョンはv3を対象とする（`/api/v3/`）

### Sidebarボタン実装制約

- [growi-plugin-all-seen-users](https://github.com/jajamaru09/growi-plugin-all-seen-users) と同じ方式を採用
- Growi標準Sidebarに存在する既存ボタンと同一のHTML構造・CSSクラスを動的生成して注入

### HTML差分実装制約

- MarkdownからHTMLへの変換は必ずGrowiのレンダリングエンジンを使用
  - Growi外部の変換ライブラリ（marked, remark等）を単独で使用しない
- レンダリング後のHTMLに対して差分ハイライトを適用する

### セキュリティ制約

- Growi APIへのリクエストは認証済みセッションを使用（CSRFトークン含む）
- ユーザー入力のサニタイズ（XSS対策）
- レンダリングされたHTMLの安全な表示（dangerouslySetInnerHTMLを使用する場合はGrowiレンダリング済みコンテンツのみ対象）

## パフォーマンス要件

| 指標 | 目標値 |
|---|---|
| リビジョン一覧取得 | 2秒以内 |
| 差分算出・表示（Markdownモード） | 1秒以内 |
| HTMLレンダリング・差分表示 | 3秒以内 |
| モーダル初期表示 | 500ms以内 |

## ブラウザ対応

Growiがサポートするモダンブラウザに準拠：
- Chrome（最新2バージョン）
- Firefox（最新2バージョン）
- Safari（最新2バージョン）
- Edge（最新2バージョン）
