# ユビキタス言語定義

## ドメイン用語

| 日本語 | 英語 | 定義 |
|---|---|---|
| リビジョン | Revision | 記事の特定時点での保存内容。編集・保存のたびに新たなリビジョンが作成される |
| リビジョンID | Revision ID | Growiが各リビジョンに付与する一意の識別子（MongoDB ObjectID） |
| リビジョン番号 | Revision No | 本プラグインが付与する表示用の連番。更新日時の昇順で1始まり |
| 差分 | Diff | 2つのリビジョン間のテキスト的な変更点 |
| 差分比較 | Diff Comparison | 2つのリビジョンを並べて差分を視覚的に確認する操作 |
| 追加部分 | Added | 新しいリビジョンに存在し、古いリビジョンに存在しないテキスト |
| 削除部分 | Removed | 古いリビジョンに存在し、新しいリビジョンに存在しないテキスト |

## UI/UX用語

| 日本語 | 英語 | 定義 |
|---|---|---|
| 差分確認モーダル | Revision Diff Modal | 2つのリビジョムを選択して差分を確認するためのモーダルダイアログ |
| 差分確認ボタン | Revision Diff Button | SidebarにあるモーダルをOpenするためのボタン |
| Markdownモード | Markdown Mode | 生のMarkdownテキストで差分を表示するモード |
| HTMLモード | HTML Mode | GrowiエンジンでレンダリングしたHTMLで差分を表示するモード |
| リビジョン選択ドロップダウン | Revision Selector | 比較対象のリビジョンを選択するドロップダウンメニュー |
| 左パネル | Left Panel | モーダル左側の差分表示領域（比較元リビジョン） |
| 右パネル | Right Panel | モーダル右側の差分表示領域（比較先リビジョン） |

## ビジネス用語

| 日本語 | 英語 | 定義 |
|---|---|---|
| 記事 | Page | Growi上の1つのWikiページ |
| ページID | Page ID | Growiが各ページに付与する一意の識別子 |
| Sidebar | Sidebar | Growiの画面右側（または左側）に表示される操作パネル |
| プラグイン | Plugin | Growiの機能を拡張するために外部から追加するモジュール |

## コード上の命名規則

| 概念 | コード上の名前 | 型 |
|---|---|---|
| リビジョン（APIレスポンス） | `Revision` | interface |
| リビジョン番号付きリビジョン | `RevisionWithNo` | interface |
| 差分表示モード | `DiffMode` | type (`'markdown' \| 'html'`) |
| 差分確認モーダル | `RevisionDiffModal` | React Component |
| リビジョン選択 | `RevisionSelector` | React Component |
| 差分表示 | `DiffViewer` | React Component |
| APIサービス | `RevisionDiffService` | Service class/module |

## 英語・日本語対応表

| English | 日本語 |
|---|---|
| Revision | リビジョン |
| Revision No | リビジョン番号 |
| Diff / Difference | 差分 |
| Modal | モーダル |
| Sidebar | サイドバー |
| Dropdown | ドロップダウン |
| Highlight | ハイライト |
| Render / Rendering | レンダリング |
| Panel | パネル |
| Plugin | プラグイン |
| Page | ページ（記事） |
