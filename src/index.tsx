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

以下のガイドラインとレギュレーションに基づいて、テキストの内容を修正してください：

${guidelines || 'ガイドラインが設定されていません'}

## 修正対象カード
- JCB関連の内容
- ACマスターカード関連の内容
- 楽天カード関連の内容

## 修正ルール
1. 上記3つのカードに関連する内容のみを修正する
2. その他のクレジットカードの内容は一切修正しない
3. ガイドラインとレギュレーションに準拠する
4. SEO観点で最適化する
5. 正確で読みやすい日本語にする

修正したテキストのみを返してください。説明や追加のコメントは不要です。`

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

以下のガイドラインとレギュレーションに基づいて、HTMLコードの内容を修正してください：

${guidelines || 'ガイドラインが設定されていません'}

## 修正対象カード
- JCB関連の内容
- ACマスターカード関連の内容
- 楽天カード関連の内容

## 重要な制約
1. HTMLの構造、タグ、クラス名、ID、属性は一切変更しない
2. CSSスタイルやデザインに関わる部分は一切変更しない
3. JavaScript関連の属性（onclick等）は一切変更しない
4. テキストコンテンツのみを修正する
5. 上記3つのカードに関連する内容のみを修正する
6. その他のクレジットカードの内容は一切修正しない
7. ガイドラインとレギュレーションに準拠する

修正したHTMLコードのみを返してください。説明や追加のコメントは不要です。`

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
