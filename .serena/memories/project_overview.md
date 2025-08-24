# プロジェクト概要

## プロジェクト名
レポート生成システム（Report Generator）

## プロジェクトの目的
日報・週報を自動生成するWebアプリケーション。業務内容を入力するだけで、生成AIを活用して統一フォーマットの日報を作成し、Slack連携での投稿も可能。

## 主な機能
1. **日報作成機能**
   - 作成者名、日付、業務内容の入力
   - 音声入力対応
   - AIによる自動整形
   - Markdown形式での出力・編集

2. **週報作成機能**
   - 1週間分の日報テキスト入力またはファイルアップロード
   - AIによる週報自動生成
   - ドラッグ&ドロップ対応

3. **設定機能**
   - Slack Webhook URL設定
   - デフォルトチャンネル設定
   - テンプレート選択

## 技術スタック
- **フレームワーク**: Next.js 15.2.4（App Router）
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS v4、tailwindcss-animate
- **UIコンポーネント**: Radix UI、shadcn/ui
- **フォーム管理**: React Hook Form 7.60、Zod 3.25
- **パッケージマネージャー**: pnpm
- **その他**: 
  - lucide-react（アイコン）
  - sonner（トースト通知）
  - date-fns（日付処理）

## プロジェクト構成
```
/
├── app/              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/       # Reactコンポーネント
│   ├── ui/          # 共通UIコンポーネント
│   └── theme-provider.tsx
├── styles/          # スタイル関連
├── hooks/           # カスタムフック
├── lib/             # ユーティリティ
└── public/          # 静的ファイル
```