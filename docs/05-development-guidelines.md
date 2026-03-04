# 開発ガイドライン

## コーディング規約

### 基本方針

- TypeScript を使用し、型安全性を保つ
- `any` 型の使用は原則禁止（やむを得ない場合は `// eslint-disable-next-line` コメントで理由を明記）
- 関数は単一責任の原則に従い、1つの関数が1つの処理を担う
- 副作用（API呼び出し等）はコンポーネントから分離し `services/` に集約

### TypeScript

```typescript
// ✅ Good: 明示的な型定義
const fetchRevisions = async (pageId: string): Promise<RevisionWithNo[]> => {
  // ...
};

// ❌ Bad: any型
const fetchRevisions = async (pageId: any): Promise<any> => {
  // ...
};
```

### React

- 関数コンポーネント + Hooks を使用（クラスコンポーネント禁止）
- `useState` / `useEffect` / `useCallback` / `useMemo` を適切に使用
- Props には必ず型定義を付ける

```typescript
// ✅ Good
interface RevisionSelectorProps {
  revisions: RevisionWithNo[];
  selectedId: string | null;
  onChange: (id: string) => void;
}

const RevisionSelector: React.FC<RevisionSelectorProps> = ({ revisions, selectedId, onChange }) => {
  // ...
};
```

### エラーハンドリング

- API呼び出しには必ず try-catch を実装
- エラー時はユーザーに分かりやすいメッセージを表示
- コンソールへのエラーログは必須

```typescript
try {
  const revisions = await RevisionDiffService.fetchRevisions(pageId);
} catch (error) {
  console.error('リビジョン取得エラー:', error);
  setErrorMessage('リビジョンの取得に失敗しました。');
}
```

## 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| コンポーネント | PascalCase | `RevisionDiffModal` |
| 関数・変数 | camelCase | `fetchRevisions`, `selectedRevisionId` |
| 型・インターフェース | PascalCase | `RevisionWithNo`, `DiffMode` |
| 定数 | UPPER_SNAKE_CASE | `MAX_REVISIONS`, `DIFF_COLORS` |
| CSSクラス | kebab-case | `revision-diff-modal`, `diff-added` |
| ファイル（コンポーネント） | PascalCase | `RevisionDiffModal.tsx` |
| ファイル（サービス・型） | PascalCase + suffix | `RevisionDiffService.ts` |

## スタイリング規約

### CSSクラス命名

プレフィックス `growi-plugin-revision-diff-` を付けてGrowiネイティブCSSとの衝突を防ぐ。

```css
/* ✅ Good */
.growi-plugin-revision-diff-modal { }
.growi-plugin-revision-diff-panel { }
.growi-plugin-revision-diff-added { background-color: #e0ffe0; }
.growi-plugin-revision-diff-removed { background-color: #ffe0e0; }

/* ❌ Bad: プレフィックスなし（Growiのスタイルと衝突する可能性） */
.modal { }
.diff-added { }
```

### 差分ハイライトカラー

| 用途 | 色 | CSSクラス |
|---|---|---|
| 追加部分 | `#e0ffe0`（淡い緑） | `.growi-plugin-revision-diff-added` |
| 削除部分 | `#ffe0e0`（淡いピンク） | `.growi-plugin-revision-diff-removed` |

## テスト規約

### テスト対象

- `RevisionDiffService`: revisionNo計算ロジックのユニットテスト
- 差分算出ロジックのユニットテスト

### テストファイル配置

```
src/
└── services/
    ├── RevisionDiffService.ts
    └── RevisionDiffService.test.ts
```

## Git規約

### ブランチ戦略

```
main          # 本番リリースブランチ
└── feature/  # 機能開発ブランチ
    fix/      # バグ修正ブランチ
```

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に準拠：

```
<type>: <subject>

[optional body]
```

**typeの種類：**

| type | 用途 |
|---|---|
| `feat` | 新機能追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメント更新 |
| `style` | コードスタイル修正（動作変更なし） |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `chore` | ビルド設定・依存関係更新 |

**例：**
```
feat: Sidebarに差分確認ボタンを追加
fix: revisionNoの計算が誤っていた問題を修正
docs: 機能設計書にAPI設計を追記
```

## 品質チェックリスト

実装完了後に以下を確認すること：

- [ ] TypeScript型エラーなし（`tsc --noEmit`）
- [ ] ESLintエラーなし（`eslint src/`）
- [ ] Growiプラグイン仕様に準拠したエントリーポイント
- [ ] Sidebarボタンがネイティブスタイルと一致
- [ ] モーダルの開閉が正常動作
- [ ] リビジョン一覧が正しく取得・表示される
- [ ] revisionNoが日付昇順で正しく連番付与される
- [ ] Markdown差分が正しくハイライト表示される
- [ ] HTML差分が正しくハイライト表示される（ピンク/緑）
- [ ] XSS対策が施されている
