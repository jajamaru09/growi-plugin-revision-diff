# 02-design.md

## 実装アプローチ

### 設計方針

growiFacade のみを使用し、remark-gfm への依存を完全に削除する。

`generateViewOptions('', { plantumlUri: null }, () => {})` の呼び出しが成功すれば
Growi のフル機能レンダリング（テーブル・数式・mermaid等）が使用できる。

growiFacade が失敗した場合はエラーを throw する（フォールバックなし）。
DiffViewer の既存エラーハンドリングがエラーメッセージを表示する。

### 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `package.json` | `remark-gfm` を dependencies から削除 |
| `src/growiApi.ts` | `renderMarkdownToHtml` から remark-gfm import とフォールバックを削除。growiFacade が失敗した場合はエラーを throw |

### 変更後の renderMarkdownToHtml

```typescript
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const growiFacade = /* ... window.growiFacade ... */;

  const options = growiFacade?.markdownRenderer?.optionsGenerators?.generateViewOptions?.(
    '',
    { plantumlUri: null },
    () => {},
  );
  if (options == null) {
    throw new Error('growiFacade が利用できません');
  }

  let processor = unified() as any;
  for (const plugin of options.remarkPlugins ?? []) {
    processor = processor.use(plugin);
  }
  for (const plugin of options.rehypePlugins ?? []) {
    processor = processor.use(plugin);
  }
  return String(await processor.process(markdown));
}
```

### 影響範囲

- `DiffViewer.tsx` は変更不要（既存の `.catch` ブロックがエラー表示を担当）
- Markdown モードは変更なし
- `unified` / `remark-parse` / `remark-rehype` / `rehype-stringify` はMarkdownモードで引き続き使用するため残す

## 参考 URL

- 前ステアリング [20260305-01-add-remark-gfm](.steering/20260305-01-add-remark-gfm/) で growiFacade の呼び出し方法を確立済み
