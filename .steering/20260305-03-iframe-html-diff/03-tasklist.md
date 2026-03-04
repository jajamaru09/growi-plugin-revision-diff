# 03-tasklist.md

## 実装タスク

| # | タスク | ステータス |
|---|---|---|
| T-01 | `src/growiApi.ts`: `renderMarkdownToHtml` と growiFacade コードを削除し、`extractRevisionHtml(pageId, revisionId)` を新規実装 | 未着手 |
| T-02 | `src/types/index.ts`: `DiffViewerProps` 型を `leftRevision / rightRevision / pageId` に更新 | 未着手 |
| T-03 | `src/components/DiffViewer.tsx`: `HtmlDiffView` を iframe ベースに書き換え、Props 更新 | 未着手 |
| T-04 | `src/components/RevisionDiffModal.tsx`: `DiffViewer` に `leftRevision / rightRevision / pageId` を渡すよう変更 | 未着手 |
| T-05 | `src/styles/modal.css`: `ins` / `del` タグのハイライト CSS を追加・調整 | 未着手 |
| T-06 | `package.json`: `unified` / `remark-parse` / `remark-rehype` / `rehype-stringify` を削除 | 未着手 |
| T-07 | `npm install` でパッケージ更新 | 未着手 |
| T-08 | `npm run build` でビルド確認 | 未着手 |
| T-09 | `docs/` 変更履歴追記 | 未着手 |

## 実装メモ

### T-01: extractRevisionHtml

```typescript
export async function extractRevisionHtml(pageId: string, revisionId: string): Promise<string> {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1280px;height:900px;visibility:hidden';
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve, reject) => {
      iframe.onload = () => resolve();
      iframe.onerror = () => reject(new Error('iframe 読み込みエラー'));
      iframe.src = `${pageId}?revisionId=${encodeURIComponent(revisionId)}`;
    });

    const SELECTORS = ['.growi-page-content', '.wiki', '[data-testid="page-body"]', 'main'];
    const content = await waitForContent(iframe, SELECTORS);
    return content.innerHTML;
  } finally {
    document.body.removeChild(iframe);
  }
}
```

### T-03: HtmlDiffView の変更点

- Props: `leftRevision: RevisionWithNo, rightRevision: RevisionWithNo, pageId: string`
- `extractRevisionHtml` を2並列で呼び出す（`Promise.all`）
- キャンセル処理（`cancelled` フラグ）を維持

## 完了条件

- HTML モードで2つのリビジョンの差分が Growi スタイルで表示される
- 追加部分に淡い緑、削除部分に淡いピンクのハイライトが表示される
- ビルドが通ること
- `unified` 系パッケージが `package.json` から削除されている
