import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  OPENAI_API_KEY: string
  APP_PASSWORD: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Login API
app.post('/api/login', async (c) => {
  try {
    const { password } = await c.req.json()
    const correctPassword = c.env.APP_PASSWORD || '0908'
    
    if (password === correctPassword) {
      return c.json({ success: true, message: 'ログイン成功' })
    } else {
      return c.json({ success: false, message: 'パスワードが間違っています' }, 401)
    }
  } catch (error) {
    return c.json({ success: false, message: 'エラーが発生しました' }, 500)
  }
})

// Text correction API (テキスト修正)
app.post('/api/correct-text', async (c) => {
  try {
    const { text, guidelines } = await c.req.json()
    const apiKey = c.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return c.json({ success: false, message: 'OpenAI APIキーが設定されていません' }, 500)
    }

    // OpenAI APIに送信するプロンプト
    const systemPrompt = `あなたはクレジットカードメディアのSEO記事を修正する専門家です。

## 修正対象カード（この3つのみ修正）
- JCB関連の内容（JCB CARD W、JCB CARD S、JCBゴールド等）
- ACマスターカード関連の内容
- 楽天カード関連の内容

## 絶対に修正しないカード
- 三井住友カード（NL）
- 三井住友カード ゴールド（NL）
- リクルートカード
- その他JCB・ACマスターカード・楽天カード以外のすべてのカード

---

## 【カード別】ガイドライン・レギュレーション

以下のガイドラインとレギュレーションに基づいて、各カード関連のテキストの内容を厳格に修正してください：

${guidelines || 'ガイドラインが設定されていません'}

## 修正実行ルール
1. **判定**: テキストにJCB・ACマスターカード・楽天カードが含まれるか確認
2. **カード特定**: どのカードに関する内容か正確に判定
3. **ガイドライン適用**: 該当カードのガイドラインのみを適用
4. **テキスト修正**: 該当するカードのみガイドラインに従って修正
5. **注釈追加**: ガイドラインで必須とされる注釈を適切に追加
   - 注釈は改行して記載
   - 「※」記号を使用
   - 複数の注釈がある場合は番号付き（※1、※2、※3）
6. **会社情報追加**: 必須記載事項（会社情報、貸付条件等）をテキスト末尾に追加
7. **保持**: その他のカードは一字一句変更しない
8. **精度**: すべての数値・表記を正確に修正

## 注釈の記載方法
注釈は以下の形式で追加：
- 本文中: 「1.0%※」「最短20分※」等、数値や表現の直後に※を付与
- 注釈説明: テキストの末尾に改行して記載
  ※還元率は交換商品により異なります。
  ※お申込時間や審査によりご希望に添えない場合がございます。

## 会社情報・必須記載事項の追加
ガイドラインで必須とされる情報は、テキストの末尾に以下の形式で追加：

【JCBカードの場合】
注釈エリアと公式サイトリンクを追加

【ACマスターカードの場合】
- 広告表記
- 貸付条件（融資額、金利、返済方式等）
- 会社情報（商号、所在地、登録番号等）

【楽天カードの場合】
- 会社情報（発行会社名、所在地、電話番号）
- 申込資格（高校生を除く18歳以上の方）

## 重要な注意事項
- JCBカードの内容にはJCBガイドラインを適用
- ACマスターカードの内容にはACマスターカードガイドラインを適用
- 楽天カードの内容には楽天カードガイドラインを適用
- 各カードのガイドラインを混同しない
- 他のカード（三井住友、リクルート等）は絶対に変更しない

## 出力形式
- 修正したテキストのみを返す
- 説明文や追加コメントは一切不要
- 元のテキスト構造を維持
- 注釈や会社情報は自然な位置に配置`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return c.json({ 
        success: false, 
        message: `OpenAI APIエラー: ${errorData.error?.message || 'Unknown error'}` 
      }, 500)
    }

    const data = await response.json()
    const correctedText = data.choices[0]?.message?.content || ''

    return c.json({ 
      success: true, 
      correctedText,
      message: '修正が完了しました'
    })
  } catch (error) {
    console.error('Error:', error)
    return c.json({ 
      success: false, 
      message: 'エラーが発生しました: ' + (error as Error).message 
    }, 500)
  }
})

// HTML correction API (HTML修正)
app.post('/api/correct-html', async (c) => {
  try {
    const { html, guidelines } = await c.req.json()
    const apiKey = c.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return c.json({ success: false, message: 'OpenAI APIキーが設定されていません' }, 500)
    }

    // OpenAI APIに送信するプロンプト
    const systemPrompt = `あなたはクレジットカードメディアのSEO記事を修正する専門家です。

## 修正対象カード（この3つのみ修正）
- JCB関連の内容（JCB CARD W、JCB CARD S、JCBゴールド等）
- ACマスターカード関連の内容
- 楽天カード関連の内容

## 絶対に修正しないカード
- 三井住友カード（NL）
- 三井住友カード ゴールド（NL）
- リクルートカード
- その他JCB・ACマスターカード・楽天カード以外のすべてのカード

---

## 【カード別】ガイドライン・レギュレーション

以下のガイドラインとレギュレーションに基づいて、各カード関連のHTMLコードの内容を厳格に修正してください：

${guidelines || 'ガイドラインが設定されていません'}

## 【最重要】HTML修正の制約事項
1. ✅ **修正可能**: 
   - テキストコンテンツの修正
   - 注釈・必須記載事項の追加（新規要素として追加）
2. ❌ **絶対変更禁止**: 
   - 既存のHTMLタグ構造（div、span、table、tr、td等）
   - 既存のクラス名（class属性）
   - 既存のID属性
   - 既存のスタイル属性（style、CSS）
   - JavaScript関連属性（onclick、data-*等）
   - 画像URL（src属性）- 各カード画像URLは完全保持
   - リンクURL（href属性）- CTAリンクは完全保持
   - その他既存の属性

## 【重要】注釈・必須記載事項の追加方法
ガイドラインで必須とされる注釈や会社情報は、以下のスタイルで追加してください：

### 注釈の追加スタイル
注釈は小さめのテキスト（font-size: 12px-13px）、グレー色（color: #666 または #777）で表示：
\`\`\`html
<p style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.6;">
  ※注釈内容をここに記載
</p>
\`\`\`

### 会社情報・貸付条件の追加スタイル
重要な情報は枠で囲み、読みやすく表示：
\`\`\`html
<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-top: 20px; font-size: 13px; color: #333; line-height: 1.7;">
  <p style="margin: 0 0 8px 0;"><strong>【会社情報】</strong></p>
  <p style="margin: 0 0 5px 0;">会社名、住所、電話番号等</p>
</div>
\`\`\`

### 広告表記の追加スタイル（ACマスターカード）
広告表記は目立つように黄色背景で表示：
\`\`\`html
<div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
  <p style="margin: 0; font-size: 14px; color: #856404; font-weight: bold;">【広告】</p>
  <p style="margin: 8px 0 0 0; font-size: 13px; color: #856404;">当サイトは広告による収益を得ています。</p>
</div>
\`\`\`

## 画像・リンクURL完全保持（絶対遵守）
以下のURLは一切変更しないこと：

【JCBカード】
- JCB CARD W 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/JCB-CARD-W.jpeg
- JCB CARD W CTA: https://iwataworks.jp/article/jcb-w
- JCB CARD S 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/JCBカード-S.webp
- JCB CARD S CTA: https://iwataworks.jp/article/jcb-s
- JCBゴールド 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/JCBゴールド.jpeg
- JCBゴールド CTA: https://iwataworks.jp/article/jcb-gold

【ACマスターカード】
- ACマスターカード 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/ACマスターカード.webp
- ACマスターカード CTA: https://iwataworks.jp/article/ac-master-card

## HTML修正実行ルール
1. **判定**: HTMLに含まれるカード名を確認
2. **カード特定**: どのカードに関する内容か正確に判定
3. **ガイドライン適用**: 該当カードのガイドラインのみを適用
4. **テキスト修正**: JCB・ACマスターカード・楽天カード関連のテキストのみ修正
5. **注釈追加**: ガイドラインで必須とされる注釈を適切なスタイルで追加
   - JCB: ※還元率は交換商品により異なります。等
   - ACマスターカード: ※お申込時間や審査により〜、広告表記等
   - 楽天カード: 会社情報、申込資格等
6. **会社情報追加**: 必須記載事項を枠付きで追加
7. **保持**: その他のカードのセクションは完全保持
8. **構造**: 既存のHTMLの構造・属性を一切変更しない
9. **URL**: 画像URLとリンクURLを完全保持

## 注釈・追加要素の配置位置
- カードセクションの直後に追加
- または記事の末尾に追加
- 既存要素の間に無理に挿入しない
- 自然な位置に配置

## アクセシビリティ強化（対象カードのみ）
- JCBカード: alt属性 "JCB CARD W券面画像"、aria-label "JCB CARD W公式サイトへ"
- ACマスターカード: alt属性 "ACマスターカード券面画像"、aria-label "ACマスターカード公式サイトへ"
- その他のカードのalt・aria-labelは変更しない

## 重要な注意事項
- JCBカードの内容にはJCBガイドラインを適用
- ACマスターカードの内容にはACマスターカードガイドラインを適用
- 楽天カードの内容には楽天カードガイドラインを適用
- 各カードのガイドラインを混同しない
- 他のカード（三井住友、リクルート等）は絶対に変更しない

## 出力形式
- 修正したHTMLコードのみを返す
- 説明文や追加コメントは一切不要
- コードブロック記法（\`\`\`html）は使用しない
- 元のHTML構造を完全に維持`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: html }
        ],
        temperature: 0.3,
        max_tokens: 8000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return c.json({ 
        success: false, 
        message: `OpenAI APIエラー: ${errorData.error?.message || 'Unknown error'}` 
      }, 500)
    }

    const data = await response.json()
    let correctedHtml = data.choices[0]?.message?.content || ''
    
    // コードブロックのマークダウン記法を削除
    correctedHtml = correctedHtml.replace(/^```html\n?/i, '').replace(/\n?```$/i, '')

    return c.json({ 
      success: true, 
      correctedHtml,
      message: '修正が完了しました'
    })
  } catch (error) {
    console.error('Error:', error)
    return c.json({ 
      success: false, 
      message: 'エラーが発生しました: ' + (error as Error).message 
    }, 500)
  }
})

// Default route - メインページ
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>クレジットカードSEO記事修正ツール</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
