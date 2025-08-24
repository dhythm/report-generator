# レポート生成システム

## 環境構築

### 要件定義プロンプト

利用モデル: Claude Opus4.1

```
入力フォームに実施した業務の概要を書くだけで日報のマークダウンが自動で生成されるアプリケーションを作成します。また、1週間の日報の文章を取り込むことで週報を作成する機能も有します。
文書の整形は生成AIを活用し、統一フォーマットに寄せて作成。マークダウン出力（エディタで編集可能）ですが、最終的にSlack連携で投入までも可能にします。
このようなアプリケーションを作成するために必要な要件を定義してください。
```

### 調整プロンプト

利用モデル: Claude Opus4.1

```
ユーザー認証は不要です。
全員共通のオンラインエディタで、投稿はユーザー毎にではなく、アプリケーションから実施する形にします。
そのため、入力欄には日報の作成者情報の入力は必要です。
```

```
データを保存する必要はありません。
週報作成のためにデータを収集する機能ですが、ユーザーが手動で過去の1週間の日報情報を入力、もしくはテキストファイルのアップロードを行います。
このアプリケーションとしては、アップロードされた日報情報を分析し、週報を作成するのみの機能です。（将来的には、データを保持して自動で週報を作る機能を構築します）
```

### モック画面作成プロンプト

```
Create a daily/weekly report generator application with the following specifications:

## Layout
- Single page application with 3 tabs: "日報作成" (Daily Report), "週報作成" (Weekly Report), "設定" (Settings)
- Modern, clean Japanese business application design
- Responsive layout that works on desktop and mobile

## Daily Report Tab (日報作成)
Split screen layout:
- Left side: Input form with:
  - Author name field (作成者名) - required
  - Department/team field (部署/チーム)
  - Date picker (default: today)
  - Large textarea for work summary (業務概要)
  - Project/category tags input
  - Work hours input (optional)
  - "生成" (Generate) button with AI sparkle icon

- Right side: Output area with:
  - Tab toggle for Markdown/Preview view
  - Generated markdown display with syntax highlighting
  - Editable markdown editor
  - Action buttons at bottom: Copy to clipboard, Download (.md), Send to Slack

## Weekly Report Tab (週報作成)
Vertical layout:
- Input section at top with two options:
  1. Large textarea for pasting multiple daily reports (with placeholder showing format example)
  2. File upload area with drag-and-drop support (accepts .txt, .md, .csv)
  - Author name field for the weekly report
  - Date range picker (default: last 7 days)
  - "週報を生成" (Generate Weekly Report) button

- Output section below:
  - Generated weekly report in markdown
  - Same view options as daily report (Markdown/Preview toggle)
  - Action buttons: Copy, Download, Send to Slack

## Settings Tab (設定)
- Slack webhook URL input field (password type)
- Default Slack channel selector
- Default template selection dropdown
- Save settings button

## Design Requirements
- Use a modern UI with card-based layouts
- Color scheme: Professional blue and gray tones
- Clear visual hierarchy with proper spacing
- Loading states for AI generation (skeleton loader or spinner)
- Success/error toast notifications
- Markdown preview should look like actual formatted document
- Include helpful placeholder text and tooltips
- Add icons to all buttons for better UX

## Sample Content
Include sample Japanese text for:
- Daily report showing: date, author, today's tasks, achievements, issues, tomorrow's plans
- Weekly report showing: period summary, main achievements, challenges faced, next week's goals

## Interactive Elements
- Show loading animation when "生成" button is clicked (simulate 2-3 second delay)
- Copy button should show "Copied!" feedback
- File upload should show file name when uploaded
- Tab switching should be smooth
- Markdown editor should have basic toolbar (bold, italic, heading, list)

Use Tailwind CSS for styling, React with TypeScript, and include Japanese UI text throughout. Make it feel like a professional internal business tool.
```

```
## 改善点
- ラベルと入力フィールドの距離が近いので余白を入れてください
- 入力内容は、「作成者」「日付」「業務概要」→「業務内容」に変更のみにしてください
- 「業務内容」は音声入力が使えるようにしてください

## 命令
改善点で指摘した部分のみを変更してください。
それ以外の既存の実装は残してください。
```

```
「週報作成」「設定」画面においてラベルと入力フィールドの距離が近いので余白を入れてください。
「日報作成」画面と同じ余白になればちょうど良いです。
```

## リポジトリ構築

### 1. モックのダウンロード

v0.dev からモックをダウンロードし、必要なファイルを作成。

```sh
touch README.md

pnpm install

git init
git add -A
git commit -m "first commit"
```

### 2. Serena の導入

Serena はコーディングエージェントと、プロジェクトコードの仲介者として働く MCP サーバ。
参考: https://note.com/kyutaro15/n/n61a8825fe303

1. MCP の追加:

```sh
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
```

2. Serena のセットアップ（要：Claude Code の起動）:

```sh
/mcp__serena__initial_instructions
```

### 3. linter/formatter の導入

**プロンプト**:

```
linter/formatter を導入したいです。
何パターンか選択肢を提示してください。
それぞれのメリット・デメリットも紹介してください。
```

```
⏺ どのlinter/formatterパターンを選択されますか？

  1. ESLint + Prettier (最も一般的で安定)
  2. Biome (高速でシンプル)
  3. ESLint単体 (1ツールで完結)
  4. oxlint + Prettier (最新・実験的)
```

ここでは 1 (ESLint + Prettier) を選択。

### 4. Unit testing の導入

**プロンプト**:

```
TDD を実施するため、テストフレームワークを導入したいです。
vitest の実行環境を構築してください。
```

### 5. Claude Code Hooks の導入

`.claude/settings.json` に hooks を追加する。  
ファイルが変更された場合に、linter/formatter を実行。

### 6. CLAUDE.md の作成 (Optional)

```sh
/init in japanese
```

## 機能開発

Claude Code に指示を出して機能を開発する。

### 機能: LLM を用いたマークダウン生成ロジック

**プロンプト**:

```
TDD で実装してください。
OpenAI SDK をインストールしてください。
画面から受け取った、作成者、日時、業務内容の情報をもとに、マークダウン生成用の処理を実装します。
API Route を作成し、OpenAI を呼び出して生成されたマークダウンを取得してください。

ユーザーが入力した情報を元に、時系列順に業務日報を作成します。
ユーザーは思い出しながら入力するため、入力順が時系列順とは限りません。
文脈を捉えて時系列順に並び変えられるよう、工夫したプロンプトを用意してください。

また、プロンプトには、出力形式を定義した学習データを含めてください。
学習データが変われば、出力形式が変わることを期待します。
```

生成した機能の不足部分を修正。

```
[Image #1]
[Image #2]

プレビュー時の余白が大きすぎる問題、マークダウン時のフォントが他のフォントと比べて書けはなられている問題が発生しています。原因を分析し、対応してください。
```

## Claude Code 利用時の Tips

1. 実装を依頼するときは「Plan mode」で計画を立てさせてから実行
2. 作業が終わるとこまめに `/clear` でセッションをリセット
3. 定期的に `/init` もしくは手動で `CLAUDE.md` を更新
