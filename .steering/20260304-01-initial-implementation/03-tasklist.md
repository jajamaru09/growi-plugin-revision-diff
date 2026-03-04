# タスクリスト - 初回実装

## 完了条件

- Growi Sidebarにネイティブスタイルと一致したボタンが表示される
- ボタンクリックで差分確認モーダルが開く
- リビジョン選択ドロップダウンに `revisionNo - revisionId - 更新日時` 形式で表示される
- Markdown差分モードで差分がハイライト表示される
- HTML差分モードでgrowidFacade + unified方式でレンダリングした差分がハイライト表示される

---

## タスク一覧

### フェーズ1: プロジェクト基盤セットアップ

- [ ] **T-01** `package.json` を作成
  - 依存: `react@18`, `@growi/pluginkit@1.1.0`, `diff`, `htmldiff-js`, `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`
  - devDependencies: `typescript@5`, `vite@5`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`
  - growi-plugin設定: `schemaVersion: "4"`, `types: ["script"]`

- [ ] **T-02** `tsconfig.json` を作成
  - target: ES2020, jsx: react-jsx, strict: true

- [ ] **T-03** `vite.config.ts` を作成
  - `manifest: true`, `preserveEntrySignatures: 'strict'`
  - エントリーポイント: `client-entry.tsx`

### フェーズ2: Growi共通ユーティリティ

- [ ] **T-04** `src/types/index.ts` を作成
  - `Revision` インターフェース
  - `RevisionWithNo` インターフェース（revisionNo, label フィールド追加）
  - `DiffMode` 型（`'markdown' | 'html'`）

- [ ] **T-05** `src/pageContext.ts` を作成
  - `PageMode` 型（`'view' | 'edit'`）
  - `GrowiPageContext` インターフェース（pageId, mode, revisionId）
  - `extractPageId()` 関数（MongoDBのObjectId形式を正規表現で抽出）

- [ ] **T-06** `src/growiNavigation.ts` を作成
  - Navigation APIを使ったSPAページ遷移監視
  - `createPageChangeListener()` 関数
  - 重複発火防止ロジック

- [ ] **T-07** `src/growiApi.ts` を作成
  - `fetchRevisions(pageId: string): Promise<RevisionWithNo[]>` — リビジョン一覧取得 + revisionNo計算
  - `renderMarkdownToHtml(markdown: string): Promise<string>` — growiFacade + unifiedによるHTMLレンダリング（フォールバックあり）
  - revisionNo計算ロジック（createdAt昇順ソート、1始まり連番、ラベル生成）

### フェーズ3: Reactコンポーネント実装

- [ ] **T-08** `src/components/RevisionSelector.tsx` を作成
  - Props: `revisions: RevisionWithNo[]`, `selectedId: string | null`, `onChange: (id: string) => void`
  - ドロップダウン表示: `{revisionNo} - {_id先頭8文字} - {更新日時}`

- [ ] **T-09** `src/components/DiffViewer.tsx` を作成
  - Props: `leftBody: string`, `rightBody: string`, `mode: DiffMode`
  - Markdownモード: `diffLines()` で差分算出、行ごとにハイライト表示
  - HTMLモード: `renderMarkdownToHtml()` → `htmldiff()` → `dangerouslySetInnerHTML`

- [ ] **T-10** `src/components/RevisionDiffModal.tsx` を作成
  - state: `leftRevisionId`, `rightRevisionId`, `mode: DiffMode`, `revisions`, `loading`, `error`
  - Props: `pageId: string`, `isOpen: boolean`, `onClose: () => void`
  - モーダル開放時にリビジョン一覧をfetch
  - ModalHeader（タイトル・Markdown/HTMLモード切替タブ・閉じるボタン）
  - 左右パネル（RevisionSelector + DiffViewer）

- [ ] **T-11** `src/components/RevisionDiffButton.tsx` を作成
  - Props: `pageId: string`, `cssClass: string`
  - ボタンスタイル: `btn btn-outline-neutral-secondary rounded-pill py-1 px-lg-3`
  - アイコン: `difference`（Material Symbols）
  - クリックでRevisionDiffModalを開く

### フェーズ4: Sidebarへの注入とエントリーポイント

- [ ] **T-12** `src/sidebarMount.tsx` を作成
  - `getContainer()`: `[data-testid="pageListButton"]` または `[data-testid="page-comment-button"]` からコンテナ取得
  - `getCssModuleClass()`: `PageAccessoriesControl_btn-page-accessories__` プレフィックスでCSSクラス取得
  - `ensureRoot()`: マウント用div（`growi-plugin-revision-diff-mount`）の生成管理
  - `mountOrUpdate(pageId: string)`: React 18 `createRoot` でRevisionDiffButtonをマウント
  - `unmount()`: クリーンアップ

- [ ] **T-13** `client-entry.tsx` を作成
  - `window.pluginActivators['growi-plugin-revision-diff'] = { activate, deactivate }`
  - activate: `createPageChangeListener` で view/edit モードを監視し、viewならmount、editならunmount

### フェーズ5: スタイリング

- [ ] **T-14** `src/styles/modal.css` を作成
  - モーダルオーバーレイ・コンテナ・ヘッダー・パネルのスタイル
  - 差分ハイライト: `ins { background: #e0ffe0 }`, `del { background: #ffe0e0; text-decoration: line-through }`
  - CSSクラスプレフィックス: `growi-plugin-revision-diff-`

### フェーズ6: 動作確認・品質チェック

- [ ] **T-15** TypeScriptエラーなし確認（`tsc --noEmit`）
- [ ] **T-16** `npm run build` でビルド成功確認
- [ ] **T-17** ローカルGrowiに組み込んで動作確認
  - Sidebarボタン表示確認
  - リビジョン一覧取得・表示確認
  - Markdown差分表示確認
  - HTML差分表示確認

---

## 実装順序の依存関係

```
T-01〜T-03（プロジェクト設定）
    ↓
T-04（型定義）
    ↓
T-05〜T-07（ユーティリティ）
    ↓
T-08〜T-09（基本コンポーネント）
    ↓
T-10〜T-11（上位コンポーネント）
    ↓
T-12〜T-13（注入・エントリーポイント）
    ↓
T-14（スタイル）
    ↓
T-15〜T-17（確認）
```
