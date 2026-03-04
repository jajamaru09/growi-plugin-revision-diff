# 03-tasklist.md

## 実装タスク

| # | タスク | ステータス |
|---|---|---|
| T-01 | `package.json` に `remark-gfm` を追加 | 完了 |
| T-02 | `src/growiApi.ts` の `renderMarkdownToHtml` を growiFacade 引数付き呼び出し + remark-gfm フォールバックに書き換え | 完了 |
| T-03 | `npm install` でパッケージインストール | 完了 |
| T-04 | TypeScript 型チェック（`tsc --noEmit`）実施 | 完了（ビルドに含む） |
| T-05 | `npm run build` でビルド確認 | 完了 |
| T-06 | `docs/` 変更履歴追記 | 完了 |

## 完了条件

- `generateViewOptions('', { plantumlUri: null }, () => {})` の呼び出しで成功した場合、Growi フル機能 HTML が返される
- 失敗した場合でも `remark-gfm` フォールバックにより GFM テーブルが `<table>` タグとしてレンダリングされる
- コンソールに不要なエラー・警告が出ない
- ビルドが通ること
