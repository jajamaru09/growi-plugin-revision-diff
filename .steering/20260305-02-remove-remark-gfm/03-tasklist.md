# 03-tasklist.md

## 実装タスク

| # | タスク | ステータス |
|---|---|---|
| T-01 | `package.json` から `remark-gfm` を削除 | 完了 |
| T-02 | `src/growiApi.ts` から remark-gfm import とフォールバックを削除し、growiFacade 失敗時にエラー throw に変更 | 完了 |
| T-03 | `npm install` でパッケージ更新 | 完了 |
| T-04 | `npm run build` でビルド確認 | 完了 |
| T-05 | `docs/` 変更履歴追記 | 完了 |

## 完了条件

- `package.json` の dependencies に `remark-gfm` が存在しない
- `renderMarkdownToHtml` が growiFacade のみを使用している
- growiFacade が利用できない場合にエラーが throw される
- ビルドが通ること
