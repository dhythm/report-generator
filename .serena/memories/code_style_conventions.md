# コーディング規約

## TypeScript設定
- **strict mode**: 有効
- **target**: ES6
- **module**: ESNext
- **jsx**: preserve
- **パスエイリアス**: `@/*` で相対パスをサポート

## プロジェクト規約
1. **ファイル名**
   - コンポーネント: PascalCase（例: `ReportGenerator.tsx`）
   - その他: kebab-case（例: `theme-provider.tsx`）

2. **インポート順序**
   - React/Next.js
   - 外部ライブラリ
   - 内部コンポーネント（@/components）
   - ユーティリティ（@/lib）
   - スタイル

3. **コンポーネント**
   - 関数コンポーネントを使用
   - デフォルトエクスポート推奨
   - propsの型定義必須

4. **スタイリング**
   - Tailwind CSSクラスを使用
   - cn()ヘルパーでクラス名を結合
   - shadcn/uiコンポーネントのバリアント活用

5. **状態管理**
   - React Hook Form + Zodでフォーム管理
   - useStateでローカル状態管理

6. **エラーハンドリング**
   - try-catchブロックで例外処理
   - sonnerでユーザー通知

## 注意事項
- ESLintやPrettier設定ファイルは現在存在しない
- Next.js標準のlintコマンドが利用可能
- コードスタイルは既存コードに合わせる