# 実装設計 - 初回実装

## 実装アプローチ

### プラグイン基盤

growi-plugin-all-seen-users と同一のプロジェクト構成・パターンを採用する。

**プラグイン登録パターン（client-entry.tsx）：**

```typescript
window.pluginActivators[PLUGIN_NAME] = {
  activate(context) {
    listener = createPageChangeListener(async (ctx) => {
      if (ctx.mode === 'edit') {
        sidebarMount.unmount();
      } else {
        await sidebarMount.mountOrUpdate(ctx.pageId);
      }
    });
    listener.start();
  },
  deactivate() {
    listener?.stop();
    sidebarMount.unmount();
  },
};
```

**package.json の growi-plugin 設定：**
```json
{
  "growi-plugin": {
    "schemaVersion": "4",
    "types": ["script"]
  }
}
```

### Sidebarボタン注入方式（sidebarMount.tsx）

参考リポジトリと同一の DOM 探索戦略を採用する：

1. `[data-testid="pageListButton"]` または `[data-testid="page-comment-button"]` を探す
2. その `parentElement` をコンテナとして使用
3. CSS Modules でハッシュ化されたクラスをプレフィックス `"PageAccessoriesControl_btn-page-accessories__"` で探す
4. マウント用 `<div id="growi-plugin-revision-diff-mount">` を生成・挿入
5. React 18 の `createRoot` でコンポーネントをマウント

### ボタンの HTML/CSS

参考リポジトリから取得したネイティブスタイルを適用する：

```tsx
<button
  type="button"
  className={`btn btn-outline-neutral-secondary rounded-pill py-1 px-lg-3 ${cssClass}`}
  onClick={handleOpen}
>
  <span className="material-symbols-outlined">difference</span>
  <span className="d-none d-lg-inline ms-1">差分確認</span>
</button>
```

- アイコン：Material Symbols の `difference`（差分を表すアイコン）
- ラベル：LGブレークポイント以上で表示

### ビルド設定（vite.config.ts）

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,  // dist/.vite/manifest.json を生成（Growiがファイルを検出するために必須）
    lib: {
      entry: 'client-entry.tsx',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',  // activate/deactivate がツリーシェーキングで消えるのを防止
    },
  },
});
```

## 変更するコンポーネント（新規作成）

| ファイル | 役割 |
|---|---|
| `client-entry.tsx` | プラグインエントリーポイント |
| `src/sidebarMount.tsx` | SidebarへのDOM注入・Reactマウント管理 |
| `src/pageContext.ts` | PageId抽出・PageMode型定義 |
| `src/growiNavigation.ts` | Navigation APIによるSPAページ遷移監視 |
| `src/growiApi.ts` | Growi API呼び出し（リビジョン一覧・詳細取得）＋growiFacadeを使ったMarkdown→HTMLレンダリング |
| `src/components/RevisionDiffButton.tsx` | Sidebarに注入するボタンコンポーネント |
| `src/components/RevisionDiffModal.tsx` | 差分確認モーダル本体 |
| `src/components/RevisionSelector.tsx` | リビジョン選択ドロップダウン |
| `src/components/DiffViewer.tsx` | 差分表示（Markdown/HTML両モード対応） |
| `src/types/index.ts` | 型定義（Revision, RevisionWithNo, DiffMode） |
| `src/styles/modal.css` | モーダル・差分ハイライト用CSS |
| `package.json` | 依存関係・growi-plugin設定 |
| `tsconfig.json` | TypeScript設定 |
| `vite.config.ts` | Viteビルド設定 |

## データ構造

```typescript
// Growi API レスポンス
interface Revision {
  _id: string;
  body: string;
  createdAt: string;
}

// プラグイン内部データ（revisionNo付与済み）
interface RevisionWithNo extends Revision {
  revisionNo: number;   // 日付昇順での連番（1始まり）
  label: string;        // ドロップダウン表示用
}

type DiffMode = 'markdown' | 'html';
```

## 影響範囲の分析

- 新規プラグインのため、Growiコアへの影響なし
- 既存のGrowiページに対してSidebarへのDOM注入のみ行う
- ページ遷移時にマウント/アンマウントを制御するため、メモリリークに注意

## Growi API 仕様

### リビジョン一覧取得

```
GET /api/v3/revisions?pageId={pageId}&limit=100
Authorization: Cookie（Growiのセッションクッキーを自動送信）
```

レスポンス：
```json
{
  "docs": [
    { "_id": "...", "body": "...", "createdAt": "..." }
  ]
}
```

### HTMLレンダリング

Growiには直接HTMLを返すレンダリングAPIは存在しない。
`window.growiFacade` が提供する `generateViewOptions()` でGrowiのunifiedプロセッサ設定を取得し、
それを使って自前でMarkdown→HTMLをレンダリングする。

```typescript
// growiFacadeからunified設定を取得してレンダリング
async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const options = (window as any).growiFacade
    ?.markdownRenderer
    ?.optionsGenerators
    ?.generateViewOptions?.();

  if (options) {
    // Growiのremark/rehype設定を適用（Growi独自構文に対応）
    const processor = unified()
      .use(options.remarkPlugins ?? [])
      .use(options.rehypePlugins ?? []);
    return String(await processor.process(markdown));
  } else {
    // フォールバック: 基本的なMarkdown→HTML変換
    return String(await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown));
  }
}
```

**注意：** Growi独自構文（lsx, drawio等）はGrowiのunifiedプラグインが処理するが、
プラグイン文脈からは完全な再現が困難な場合がある。差分確認が主目的のため許容範囲とする。

### CSRF対応

```typescript
// Growiのメタタグからトークンを取得
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
```

## 差分算出の実装方針

### Markdown差分

```
import { diffLines } from 'diff';  // jsdiff ライブラリ

const changes = diffLines(leftBody, rightBody);
// added: true → 緑ハイライト
// removed: true → ピンクハイライト
```

### HTML差分

1. 左右のMarkdownをそれぞれ `renderMarkdownToHtml()` でHTMLに変換（growiFacade + unified方式）
2. `htmldiff-js` ライブラリでHTML差分を算出
   - `htmldiff(oldHtml, newHtml)` → `<ins>/<del>` タグ付きの差分HTML
3. CSSで差分ハイライトを適用
   - `ins` → 緑背景（`#e0ffe0`）
   - `del` → ピンク背景（`#ffe0e0`）、打ち消し線あり
4. 結果HTMLを `dangerouslySetInnerHTML` でレンダリング

## revisionNo計算ロジック

```typescript
function assignRevisionNos(revisions: Revision[]): RevisionWithNo[] {
  const sorted = [...revisions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return sorted.map((rev, index) => ({
    ...rev,
    revisionNo: index + 1,
    label: `${index + 1} - ${rev._id.slice(0, 8)} - ${formatDate(rev.createdAt)}`,
  }));
}
```

## 参考URL

- **growi-plugin-all-seen-users**: https://github.com/jajamaru09/growi-plugin-all-seen-users
  - Sidebarボタン注入の全パターン（DOM探索・CSSクラス取得・Reactマウント）
  - プラグイン登録方式：`window.pluginActivators[PLUGIN_NAME] = { activate, deactivate }`
  - Navigation APIによるSPAページ遷移監視（`growiNavigation.ts`）
  - ボタンスタイル：`btn btn-outline-neutral-secondary rounded-pill py-1 px-lg-3`
  - growi-plugin設定：`schemaVersion: "4"`, `types: ["script"]`
  - Viteビルド設定：`manifest: true`, `preserveEntrySignatures: 'strict'`
  - 依存パッケージ：`@growi/pluginkit@1.1.0`, `react@18.3.0`, `vite@5.4.0`
