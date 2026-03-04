# 01-requirements.md

## 変更・追加する機能の説明

HTMLレンダリング時に GitHub Flavored Markdown (GFM) のテーブル構文が正しくHTMLテーブルに変換されるよう、`remark-gfm` プラグインを追加する。

現状では `remark-parse` + `remark-rehype` + `rehype-stringify` のみで変換しているため、GFM テーブル（`|` 区切り記法）がプレーンテキストのまま出力される。

## ユーザーストーリー

- ユーザーとして、HTMLモードで差分を確認する際に、Markdownのテーブルが正しく表として表示されることを望む

## 受け入れ条件

- `| col1 | col2 |` 形式のMarkdownテーブルがHTMLモードで `<table>` タグとしてレンダリングされる
- Markdownモードの動作は変わらない
- 既存のHTML差分表示（ピンク・緑のハイライト）が引き続き機能する

## 制約事項

- `remark-gfm` は unified エコシステムと互換性のある最新版を使用する
