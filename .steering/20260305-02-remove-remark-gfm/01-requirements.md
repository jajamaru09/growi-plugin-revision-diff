# 01-requirements.md

## 変更・追加する機能の説明

HTMLレンダリングを growiFacade のみに一本化し、remark-gfm への依存を削除する。

前ステアリング（20260305-01-add-remark-gfm）では remark-gfm をフォールバックとして追加したが、
Growi のレンダリングエンジンを信頼し、独自の Markdown 変換処理を持たない方針に変更する。

growiFacade が利用できない場合（growiFacade 未初期化など）は、HTMLレンダリングを行わず
エラーとして扱う。

## ユーザーストーリー

- プラグインとして、Growi のレンダリングエンジンと一貫した表示（テーブル・数式・mermaid等）を
  提供したい

## 受け入れ条件

- `remark-gfm` パッケージが dependencies から削除されている
- `renderMarkdownToHtml` は growiFacade のみを使用し、remark-gfm フォールバックを持たない
- growiFacade が失敗した場合はエラーを throw し、DiffViewer がエラー表示を行う
- Markdown モードの動作は変わらない

## 制約事項

- growiFacade が利用できない環境では HTML モードが動作しない可能性を許容する
