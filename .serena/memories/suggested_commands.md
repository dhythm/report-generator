# 開発コマンド一覧

## 開発環境の起動
```bash
pnpm dev
```
開発サーバーを起動（http://localhost:3000）

## ビルド
```bash
pnpm build
```
本番用ビルドを生成

## 本番サーバー起動
```bash
pnpm start
```
ビルド後の本番サーバーを起動

## リンター実行
```bash
pnpm lint
```
Next.js標準のESLintを実行してコード品質をチェック

## パッケージインストール
```bash
pnpm install
```
package.jsonの依存関係をインストール

## Git操作
```bash
git status      # 変更状況確認
git add -A      # 全ファイルをステージング
git commit -m "message"  # コミット
git log         # コミット履歴確認
```

## macOS固有コマンド
```bash
ls              # ファイル一覧表示
cd <dir>        # ディレクトリ移動
pwd             # 現在のディレクトリ表示
grep            # ファイル内検索
find            # ファイル検索
```

## その他の便利なコマンド
```bash
pnpm add <package>        # パッケージ追加
pnpm remove <package>     # パッケージ削除
pnpm update              # パッケージ更新
```