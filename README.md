# クレジットカードSEO記事修正ツール

## プロジェクト概要

クレジットカードメディアのSEO記事を、ガイドラインとレギュレーションに基づいて自動修正するWebアプリケーションです。

- **対象カード**: JCB、ACマスターカード、楽天カード
- **技術スタック**: Hono + TypeScript + TailwindCSS + OpenAI API
- **デプロイ**: Cloudflare Pages

## 機能一覧

### ✅ 完成済み機能

1. **パスワード認証システム**
   - パスワード: `0908`
   - セッション管理

2. **テキスト修正機能**
   - プレーンテキストの内容を修正
   - JCB、ACマスターカード、楽天カード関連のみ修正
   - その他のカードは一切変更なし

3. **HTML修正機能**
   - HTMLコードの内容を修正
   - デザイン・構造・クラス名は完全保持
   - テキストコンテンツのみを修正
   - プレビュー機能付き

4. **ガイドライン設定機能**
   - 各カードごとのガイドライン管理
   - ローカルストレージに保存
   - 修正時に自動適用

5. **OpenAI統合**
   - GPT-4oを使用した高精度修正
   - APIキーは環境変数で管理
   - エラーハンドリング実装済み

## URLs

- **開発環境**: https://3000-ilbxtz6nh2o21hj438xc4-de59bda9.sandbox.novita.ai
- **GitHub**: （未設定）
- **本番環境**: （未デプロイ）

## 使い方

### 1. ログイン
- パスワード `0908` を入力してログイン

### 2. ガイドライン設定
1. 「ガイドライン設定」タブを開く
2. 各カードのガイドラインを入力
3. 「保存」をクリック

### 3. テキスト修正
1. 「テキスト修正」タブを開く
2. 修正したいテキストを入力
3. 「修正を実行」をクリック
4. 修正結果をコピー

### 4. HTML修正
1. 「HTML修正」タブを開く
2. 修正したいHTMLコードを入力
3. 「修正を実行」をクリック
4. 「プレビュー」で確認
5. 修正結果をコピー

## データアーキテクチャ

### ストレージ
- **ローカルストレージ**: ガイドライン設定（ブラウザ側）
- **環境変数**: OpenAI APIキー、パスワード

### API構成
- `POST /api/login` - 認証
- `POST /api/correct-text` - テキスト修正
- `POST /api/correct-html` - HTML修正

### OpenAI統合
- モデル: `gpt-4o`
- Temperature: 0.3（一貫性重視）
- Max Tokens: 4000（テキスト）、8000（HTML）

## 開発環境セットアップ

### 必要なもの
- Node.js 18+
- npm

### ローカル開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# 開発サーバー起動（PM2）
pm2 start ecosystem.config.cjs

# 動作確認
curl http://localhost:3000

# ログ確認
pm2 logs webapp --nostream

# サービス停止
pm2 delete webapp
```

### 環境変数設定

`.dev.vars` ファイルを作成（ローカル開発用）:
```bash
OPENAI_API_KEY=sk-proj-...
APP_PASSWORD=0908
```

**注意**: `.dev.vars` は `.gitignore` に含まれており、Gitにコミットされません。

## デプロイ

### Cloudflare Pagesへのデプロイ

```bash
# ビルド
npm run build

# デプロイ
npm run deploy

# 本番環境の環境変数設定
wrangler pages secret put OPENAI_API_KEY --project-name webapp
wrangler pages secret put APP_PASSWORD --project-name webapp
```

## プロジェクト構造

```
webapp/
├── src/
│   └── index.tsx              # Honoバックエンド（認証・API）
├── public/
│   └── static/
│       └── app.js             # フロントエンドロジック
├── dist/                      # ビルド出力
├── .dev.vars                  # ローカル環境変数（Git除外）
├── ecosystem.config.cjs       # PM2設定
├── wrangler.jsonc            # Cloudflare設定
├── package.json              # 依存関係とスクリプト
└── README.md                 # このファイル
```

## ガイドライン設定について

### 後から設定する項目
以下のガイドラインは、アプリケーション内の「ガイドライン設定」タブから設定してください：

1. **JCBカード ガイドライン**
   - JCBに関する表記ルール
   - 修正基準
   - 注意事項

2. **ACマスターカード ガイドライン**
   - ACマスターカードに関する表記ルール
   - 修正基準
   - 注意事項

3. **楽天カード ガイドライン**
   - 楽天カードに関する表記ルール
   - 修正基準
   - 注意事項

### ガイドライン例

```
## 表記ルール
- 正式名称を使用する
- ×「JCBカード」→ ○「JCBオリジナルシリーズ」

## 禁止事項
- 誤解を招く表現は使用しない
- 古い情報を掲載しない

## SEO最適化
- キーワードを自然に含める
- 読みやすい文章にする
```

## トラブルシューティング

### OpenAI APIエラー
- `.dev.vars` のAPIキーが正しいか確認
- APIキーの使用量制限を確認
- ネットワーク接続を確認

### ビルドエラー
```bash
# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ポート競合
```bash
# ポート3000を解放
npm run clean-port
# または
fuser -k 3000/tcp
```

## セキュリティ

- OpenAI APIキーは環境変数で管理
- `.dev.vars` はGitから除外
- パスワード認証は本番環境では必ず変更してください
- 本番デプロイ時は `wrangler pages secret` を使用

## ライセンス

このプロジェクトは内部使用のために開発されました。

## 今後の拡張予定

- [ ] ガイドラインのインポート/エクスポート機能
- [ ] 修正履歴の保存機能
- [ ] 一括修正機能（複数ファイル対応）
- [ ] カスタムプロンプトの設定機能
- [ ] 修正前後の差分表示機能

## 最終更新日

2026-02-12
