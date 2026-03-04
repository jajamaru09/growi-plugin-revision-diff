# 02-design.md

## 実装アプローチ

### 背景調査

Growi OSS ソースコードの解析により、`generateViewOptions` の実際のシグネチャが判明した。

```typescript
generateViewOptions(path: string, options: any, toc: Function): ViewOptions
```

- 第1引数: ページパス（文字列）
- 第2引数: 設定オブジェクト（`plantumlUri` などのサーバー設定を含む）
- 第3引数: TOC コールバック関数

現在のエラー `Cannot read properties of undefined (reading 'plantumlUri')` は、引数なしで呼び出していたため、第2引数 `options` が undefined になっていたことが原因。

### 設計方針

`generateViewOptions` に最低限必要な引数を渡して呼び出す。
これにより、Growi が持つ remark-gfm・数式・mermaid 等のすべてのプラグインが利用できる。

```typescript
const options = growiFacade
  ?.markdownRenderer
  ?.optionsGenerators
  ?.generateViewOptions?.('', { plantumlUri: null }, () => {});
```

フォールバック戦略：
1. **Primary**: growiFacade の `generateViewOptions` を引数付きで呼び出す
2. **Fallback A**: `remark-gfm` を追加した unified パイプライン（GFM テーブル対応）
3. **Fallback B**: 既存の基本 unified パイプライン

### 変更するコンポーネント

| ファイル | 変更内容 |
|---|---|
| `src/growiApi.ts` | `renderMarkdownToHtml` に引数付き growiFacade 呼び出しを追加 |
| `package.json` | `remark-gfm` を dependencies に追加（フォールバック用） |

### データフロー

```
renderMarkdownToHtml(markdown)
  ↓
  [Try] growiFacade.generateViewOptions('', { plantumlUri: null }, () => {})
    → remarkPlugins + rehypePlugins を取得して unified 実行
    → 成功: Growi フル機能 HTML を返す
  ↓ 失敗
  [Fallback A] unified + remark-gfm + remark-rehype + rehype-stringify
    → GFM テーブル対応 HTML を返す
```

### 影響範囲

- `DiffViewer.tsx` の変更は不要（`renderMarkdownToHtml` の入出力インターフェースは変わらない）
- Markdown モードの動作は変わらない

## 参考 URL

- [Growi Plugin Overview Documentation](https://docs.growi.org/en/dev/plugin/overview.html)
  - `growiFacade.markdownRenderer.optionsGenerators` の構造を確認
  - `customGenerateViewOptions` が公式のプラグイン拡張ポイント
- [Developing GROWI Plug-ins (Remark Plug-ins)](https://dev.to/goofmint/developing-growi-plug-ins-remark-plug-ins-1g7g)
  - `generateViewOptions(...args)` の呼び出しパターンを確認
  - 第2引数に設定オブジェクトが必要なことを確認
