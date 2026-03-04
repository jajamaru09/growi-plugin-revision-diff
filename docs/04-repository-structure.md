# リポジトリ構造定義書

## フォルダ・ファイル構成

```
growi-plugin-revision-diff/
├── CLAUDE.md                          # プロジェクトメモリ（AI用指示書）
├── package.json                       # パッケージ設定
├── tsconfig.json                      # TypeScript設定
├── .eslintrc.js                       # ESLint設定
├── .prettierrc                        # Prettier設定
│
├── docs/                              # 永続的ドキュメント
│   ├── 01-product-requirements.md
│   ├── 02-functional-design.md
│   ├── 03-architecture.md
│   ├── 04-repository-structure.md
│   ├── 05-development-guidelines.md
│   └── 06-glossary.md
│
├── .steering/                         # 作業単位ドキュメント
│   └── [YYYYMMDD-##]-[タイトル]/
│       ├── 01-requirements.md
│       ├── 02-design.md
│       └── 03-tasklist.md
│
└── src/                               # ソースコード
    ├── index.ts                       # プラグインエントリーポイント
    │                                  # Sidebarボタン注入・モーダル初期化
    │
    ├── components/                    # Reactコンポーネント
    │   ├── RevisionDiffModal.tsx      # 差分確認モーダル本体
    │   ├── RevisionSelector.tsx       # リビジョン選択ドロップダウン
    │   └── DiffViewer.tsx             # 差分表示領域（Markdown/HTML両対応）
    │
    ├── services/                      # ビジネスロジック・API呼び出し
    │   └── RevisionDiffService.ts     # リビジョン取得・revisionNo計算・HTMLレンダリング
    │
    ├── types/                         # 型定義
    │   └── index.ts                   # Revision, RevisionWithNo, DiffMode 等
    │
    └── styles/                        # スタイル定義
        └── RevisionDiffModal.css      # モーダル・差分ハイライト用CSS
```

## ディレクトリの役割

### `src/`
プラグインのソースコード本体。

### `src/index.ts`
プラグインのエントリーポイント。
- Growiのプラグインシステムへの登録処理
- Sidebarへのボタン動的注入（growi-plugin-all-seen-usersと同方式）
- RevisionDiffModalのReactルートへのマウント

### `src/components/`
Reactコンポーネント群。UIの描画に専念し、APIコールは行わない。

| ファイル | 役割 |
|---|---|
| `RevisionDiffModal.tsx` | モーダル全体の状態管理（選択リビジョン・表示モード）とレイアウト |
| `RevisionSelector.tsx` | リビジョン一覧のドロップダウン表示。`revisionNo - revisionId - 更新日時` 形式 |
| `DiffViewer.tsx` | Markdown/HTMLモードを切り替えて差分をレンダリング・ハイライト表示 |

### `src/services/`
APIコールとビジネスロジックを担当。コンポーネントから分離。

| ファイル | 役割 |
|---|---|
| `RevisionDiffService.ts` | Growi APIからリビジョン一覧・詳細取得、revisionNo計算、HTMLレンダリング呼び出し |

### `src/types/`
TypeScript型定義。コンポーネント・サービス間の契約を定義。

### `src/styles/`
CSSスタイル定義。
- 差分ハイライトカラー（ピンク・緑）
- モーダルレイアウト
- Growiネイティブスタイルとの整合性

## ファイル配置ルール

- コンポーネントは1ファイル1コンポーネント
- コンポーネントファイル名はPascalCase（例：`RevisionDiffModal.tsx`）
- サービス・ユーティリティはcamelCase（例：`RevisionDiffService.ts`）
- 型定義は `src/types/index.ts` に集約
- スタイルはコンポーネントと同名のCSSファイルまたは `src/styles/` 配下に配置
