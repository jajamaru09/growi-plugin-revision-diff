# 02-design.md

## 実装アプローチ

### 基本方針

各リビジョンの HTML を、隠し iframe で Growi ページとして読み込み取得する。
同一オリジンで動作するため iframe の DOM へのアクセスが可能。

### iframe URL の構成

`handlePageChange` から受け取る `pageId` は `/68bae875eb2c292a594a1095` 形式（MongoDB ObjectId）で、
Growi はこのIDをページパスとしてルーティングする。

```
{pageId}?revisionId={revisionId}
例: /68bae875eb2c292a594a1095?revisionId=69a6e5e3f17c96c558fe5a28
```

`RevisionDiffButton` → `RevisionDiffModal` はすでに `pageId` を持っているため、追加APIコールは不要。

### コンテンツ取得セレクター

Growi のページ本文コンテナを特定するセレクター（優先順位順）：

```typescript
const CONTENT_SELECTORS = [
  '.growi-page-content',
  '.wiki',
  '[data-testid="page-body"]',
  'main',
];
```

### React レンダリング完了の待機

`iframe.onload` 後、React がページをレンダリングするまで時間がかかる。
ポーリングで対応：

```typescript
async function waitForContent(
  iframe: HTMLIFrameElement,
  selectors: string[],
  timeout = 15000,
): Promise<Element> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const sel of selectors) {
      const el = iframe.contentDocument?.querySelector(sel);
      if (el && el.innerHTML.trim() !== '') return el;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('コンテンツの読み込みがタイムアウトしました');
}
```

### データフローの変更

```
変更前:
RevisionDiffModal → DiffViewer(leftBody, rightBody, mode)
                       └─ HtmlDiffView → renderMarkdownToHtml(body) → htmldiff

変更後:
RevisionDiffModal → DiffViewer(leftRevision, rightRevision, pageId, mode)
                       └─ HtmlDiffView → extractRevisionHtml(pageId, revisionId) → htmldiff
```

### 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `src/growiApi.ts` | `renderMarkdownToHtml` を `extractRevisionHtml(pageId, revisionId)` に置き換え |
| `src/components/DiffViewer.tsx` | Props を `leftRevision / rightRevision / pageId` に変更。`HtmlDiffView` を iframe ベースに書き換え |
| `src/components/RevisionDiffModal.tsx` | `DiffViewer` に `leftRevision / rightRevision / pageId` を渡すよう変更 |
| `src/types/index.ts` | `DiffViewerProps` の型を更新 |

### 差分ハイライト

htmldiff-js が生成する `<ins>` / `<del>` タグに対して CSS で色付け（既存の `modal.css` に追記）：

```css
ins { background-color: rgba(0, 200, 0, 0.2); text-decoration: none; }
del { background-color: rgba(255, 0, 0, 0.2); text-decoration: none; }
```

### iframe のクリーンアップ

取得完了後は即座に iframe を `document.body` から削除する。
モーダルが閉じられた際も cleanup を保証する（`useEffect` return）。

### growiApi.ts の `renderMarkdownToHtml` の扱い

growiFacade 関連のコードを完全削除し、`extractRevisionHtml` に置き換える。
`unified` / `remark-parse` / `remark-rehype` / `rehype-stringify` の import も不要になるため削除する。
`package.json` の当該パッケージも削除する。

## 参考 URL

- 前ステアリング [20260305-02-remove-remark-gfm](.steering/20260305-02-remove-remark-gfm/) - growiFacade の設計上の限界を確認済み
