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

---

## JCB修正の14項目チェックリスト（厳格実施）

### 1. ポイント・還元率表記 ✅
- すべての還元率数値に「※」を付与（例: 1.0% → 1.0%※、最大21倍 → 最大21倍※）
- 必須注釈: ※還元率は交換商品により異なります。
- ポイント名称: 「Oki Dokiポイント」→「J-POINT」（全箇所）

### 2. 年会費表記 ✅
- すべての年会費に「（税込）」を付与（例: 永年無料 → 永年無料（税込）、11,000円 → 11,000円（税込））
- テーブルヘッダー: 「年会費」→「年会費（税込）」

### 3. 対象年齢表記 ✅
- JCB CARD W: 「18～39歳限定」と明記
- JCB CARD S: 「年齢制限なし」または年齢記載を削除

### 4. 発行スピード表記 ✅
- 推奨表現: 「モバイル即時入会サービス（モバ即）対応」
- 注釈: ※9:00～20:00の申込完了で最短5分発行（審査状況により異なります）
- 禁止表現を削除: 「最短5分で発行」「即日発行可能」「すぐ使える」

### 5. 審査・在籍確認表記 ✅
- 禁止表現を削除: 「審査が甘い」「通りやすい」「柔軟な審査」「学生でも作りやすい」
- 推奨表現: 「JCBオリジナルシリーズの信頼性」「安定したカード発行実績」
- 在籍確認: 「原則なし（JCB公式サイト記載に基づく）」
- ヘッダー変更: 「審査・発行」→「カードの特徴」または削除

### 6. 付帯保険表記 ✅
- JCB CARD W/S: 「海外旅行保険最高2,000万円（利用付帯）」
- JCBゴールド: 「最高1億円の旅行保険付帯」

### 7. ブランド・商標表記 ✅
- Oki Dokiポイント → J-POINT（全箇所）
- Oki Dokiランド → J-POINTパートナー店
- JCB Card W → JCB CARD W（大文字統一）
- Amazon → Amazon.co.jp※2（注釈※2追加）
- セブン → セブン‐イレブン※3（ハイフン全角、注釈※3追加）
- スタバ → スターバックス※1（正式名称、注釈※1追加）

### 8. パートナー店・特約店表記 ✅
- 統一名称: 優待店・特約店 → J-POINTパートナー店

### 9. アクセシビリティ要件 ✅
- 画像alt属性: 「JCB CARD W券面画像」（該当する場合）
- リンクaria-label: 「JCB CARD W公式サイトへ」（該当する場合）

### 10. 注釈・出典要件 ✅
- 注釈エリアを新設（末尾に追加）
- 公式リンク必須: 「JCB公式サイト https://original.jcb.co.jp/」

### 11. 画像・リンクURL保持（絶対変更禁止） ✅
- すべてのURL（画像、CTA）は一切変更しない

### 12. 禁止表現削除 ✅
削除対象:
- 審査関連: 審査が甘い、通りやすい、柔軟、簡単
- 発行関連: 絶対、必ず、確実に○分
- ポイント関連: 必ず貯まる、絶対お得
- 対象者関連: 誰でも作れる、学生でも簡単
- 比較関連: 業界No.1、最強、一番お得

### 13. 必須記載事項の追加 ✅
末尾に以下を追加:

【注釈エリア】
※1 スターバックスは、スターバックス コーヒー ジャパン株式会社の登録商標です。
※2 Amazon.co.jpは、Amazon.com, Inc.またはその関連会社の商標です。
※3 セブン‐イレブンは、株式会社セブン‐イレブン・ジャパンの登録商標です。
※還元率は交換商品により異なります。
※9:00～20:00の申込完了で最短5分発行（審査状況により異なります）

【公式サイト】
JCB公式サイト: https://original.jcb.co.jp/

### 14. 推奨表現への置換 ✅
- JCBオリジナルシリーズの信頼性
- 安定したカード発行実績
- モバイル即時入会サービス（モバ即）
- 基本還元率1.0%※
- J-POINTパートナー店

---

## ACマスターカード修正の14項目チェックリスト（厳格実施）

### 1. 絶対禁止表現の完全削除 ✅
削除対象:
- 審査関連: 審査が甘い、通りやすい、簡単、柔軟、緩い、申し込みやすい
- 確実性: 確実に通る、必ず作れる、100%通過、誰でも作れる
- 対象者: ブラックでも可能、債務整理経験者でも、他社で落ちた方も
- その他: 最後の砦、駆け込み寺、審査なし、無審査、誰でもOK、収入不問

### 2. 審査時間の必須表記 ✅
- 必須表記: 「最短20分※」
- 必須注釈: ※お申込時間や審査によりご希望に添えない場合がございます。
- 注釈なしは違反

### 3. 在籍確認の必須表記 ✅
- 必須表記: 「原則、お勤め先へ在籍確認の電話なし※」
- 必須注釈: ※在籍確認が必要と判断された場合は、お勤め先に確認のご連絡をする場合がございます。
- 「原則」の記載は必須

### 4. 自動契約機の正確な表記 ✅
- 必須表記: 「自動契約機(むじんくん)」
- 括弧は半角必須: (むじんくん) ✅
- 台数表記は禁止: 「約900台」❌ → 「全国に設置」✅

### 5. 年齢表記の禁止 ✅
- 具体的年齢表記は完全禁止: 「18歳以上」「20歳以上」❌
- 「学生可」「未成年可」も禁止
- 許容表現: 「安定した収入と返済能力を有する方」

### 6. 貸付条件の必須記載（最新版） ✅
末尾に以下を必ず追加:

【ACマスターカード 貸付条件】
・融資額: 1万円~300万円(ショッピング枠利用時)
・貸付利率(実質年率): 2.4%~17.9% ※ショッピング枠ご利用時
・返済方式: 定額リボルビング方式
・返済期間・返済回数: 最長5年3ヶ月・1回~63回
・遅延損害金(年率): 20.0%
・担保・連帯保証人: 不要
※ご契約極度額により、金利が異なります。
※返済期間・回数は、ご利用内容によって異なります。

### 7. 会社情報の必須記載（最新版） ✅
末尾に以下を必ず追加:

【アコム株式会社 会社情報】
・商号: アコム株式会社
・本社所在地: 東京都千代田区内幸町2-1-1 東京汐留ビルディング15階・16階
・登録番号: 関東財務局長(15)第00022号
・協会会員番号: 日本貸金業協会会員 第000002号
・お問い合わせ: 0120-07-1000

### 8. ステルスマーケティング表記 ✅
冒頭に以下を必ず追加:

【広告】
当サイトは広告による収益を得ています。本ページではアフィリエイトプログラムにより、ACマスターカードをご紹介しています。

### 9. CTAリンク先の確認 ✅
- 必須リンク先: https://www.acom.co.jp/lineup/credit/
- 内部記事リンクは禁止

### 10. 許容表現の適用 ✅
使用可能な表現:
- 独自の審査基準、独自の審査システム
- 審査が早い、スピーディーな審査
- 最短20分※（注釈付き）
- 原則、お勤め先へ在籍確認の電話なし※（注釈付き）
- 安定した収入と返済能力を有する方

### 11. 禁止記事コンセプトチェック ✅
以下のコンセプトは掲載不可:
- ブラックリスト・債務整理を訴求する内容
- 審査の甘さを保証する内容
- 確実性を保証する内容

### 12. 旧情報の更新（2025年12月15日以降） ✅
- 金利: 旧3.0%~18.0% → 新2.4%~17.9%
- 登録番号: 旧(14) → 新(15)
- 住所: 東京汐留ビルディング15階・16階
- 台数表記削除、Apple Pay表記削除、計算式表記削除

### 13. 注釈の統一 ✅
すべての注釈に※記号を使用:
- ※1、※2、※3等の番号付き注釈
- 末尾に注釈説明エリアを設置

### 14. 他カード情報の保持 ✅
- 三井住友カード、JCB、楽天カード等は一切変更しない
- ACマスターカードのみ修正

---

## 修正実行ルール
1. **判定**: テキストにJCB・ACマスターカード・楽天カードが含まれるか確認
2. **カード特定**: どのカードに関する内容か正確に判定
3. **JCBの場合**: 上記14項目チェックリストをすべて厳格に実行
4. **ACマスターカード・楽天の場合**: 該当ガイドラインを適用
5. **保持**: その他のカードは一字一句変更しない
6. **精度**: すべての数値・表記を正確に修正

## 注釈の記載方法
- 本文中: 「1.0%※」「最短5分※」「Amazon.co.jp※2」等
- 注釈説明: テキストの末尾に改行して記載

## 出力形式
- 修正したテキストのみを返す
- 説明文や追加コメントは一切不要
- 元のテキスト構造を維持
- 注釈や公式リンクは末尾に追加`

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

---

## JCB修正の14項目チェックリスト（厳格実施）

### 1. ポイント・還元率表記 ✅
- すべての還元率数値に「※」を付与（例: 1.0% → 1.0%※、最大21倍 → 最大21倍※）
- 必須注釈: ※還元率は交換商品により異なります。
- ポイント名称: 「Oki Dokiポイント」→「J-POINT」（全箇所）

### 2. 年会費表記 ✅
- すべての年会費に「（税込）」を付与（例: 永年無料 → 永年無料（税込）、11,000円 → 11,000円（税込））
- テーブルヘッダー: 「年会費」→「年会費（税込）」

### 3. 対象年齢表記 ✅
- JCB CARD W: 「18～39歳限定」と明記
- JCB CARD S: 「年齢制限なし」または年齢記載を削除

### 4. 発行スピード表記 ✅
- 推奨表現: 「モバイル即時入会サービス（モバ即）対応」
- 注釈: ※9:00～20:00の申込完了で最短5分発行（審査状況により異なります）
- 禁止表現を削除: 「最短5分で発行」「即日発行可能」「すぐ使える」

### 5. 審査・在籍確認表記 ✅
- 禁止表現を削除: 「審査が甘い」「通りやすい」「柔軟な審査」「学生でも作りやすい」
- 推奨表現: 「JCBオリジナルシリーズの信頼性」「安定したカード発行実績」
- 在籍確認: 「原則なし（JCB公式サイト記載に基づく）」
- ヘッダー変更: 「審査・発行」→「カードの特徴」または削除

### 6. 付帯保険表記 ✅
- JCB CARD W/S: 「海外旅行保険最高2,000万円（利用付帯）」
- JCBゴールド: 「最高1億円の旅行保険付帯」

### 7. ブランド・商標表記 ✅
- Oki Dokiポイント → J-POINT（全箇所）
- Oki Dokiランド → J-POINTパートナー店
- JCB Card W → JCB CARD W（大文字統一）
- Amazon → Amazon.co.jp※2（注釈※2追加）
- セブン → セブン‐イレブン※3（ハイフン全角、注釈※3追加）
- スタバ → スターバックス※1（正式名称、注釈※1追加）

### 8. パートナー店・特約店表記 ✅
- 統一名称: 優待店・特約店 → J-POINTパートナー店

### 9. アクセシビリティ要件 ✅
- 画像alt属性: 「JCB CARD W券面画像」（該当する場合）
- リンクaria-label: 「JCB CARD W公式サイトへ」（該当する場合）

### 10. 注釈・出典要件 ✅
- 注釈エリアを新設（スタイル付き）
- 公式リンク必須: 「JCB公式サイト https://original.jcb.co.jp/」

### 11. 画像・リンクURL保持（絶対変更禁止） ✅
- すべてのURL（画像、CTA）は一切変更しない

### 12. 禁止表現削除 ✅
削除対象:
- 審査関連: 審査が甘い、通りやすい、柔軟、簡単
- 発行関連: 絶対、必ず、確実に○分
- ポイント関連: 必ず貯まる、絶対お得
- 対象者関連: 誰でも作れる、学生でも簡単
- 比較関連: 業界No.1、最強、一番お得

### 13. 必須記載事項の追加（スタイル付き） ✅
以下をスタイル付きで追加:

\`\`\`html
<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-top: 20px; font-size: 13px; color: #333; line-height: 1.7;">
  <p style="margin: 0 0 8px 0;"><strong>【注釈】</strong></p>
  <p style="margin: 0 0 5px 0;">※1 スターバックスは、スターバックス コーヒー ジャパン株式会社の登録商標です。</p>
  <p style="margin: 0 0 5px 0;">※2 Amazon.co.jpは、Amazon.com, Inc.またはその関連会社の商標です。</p>
  <p style="margin: 0 0 5px 0;">※3 セブン‐イレブンは、株式会社セブン‐イレブン・ジャパンの登録商標です。</p>
  <p style="margin: 0 0 5px 0;">※還元率は交換商品により異なります。</p>
  <p style="margin: 0;">※9:00～20:00の申込完了で最短5分発行（審査状況により異なります）</p>
</div>

<div style="background-color: #f0f8ff; border: 1px solid #0066cc; border-radius: 8px; padding: 15px; margin-top: 15px; font-size: 13px; color: #333;">
  <p style="margin: 0;"><strong>【公式サイト】</strong></p>
  <p style="margin: 8px 0 0 0;">JCB公式サイト: <a href="https://original.jcb.co.jp/" target="_blank" rel="noopener" style="color: #0066cc; text-decoration: underline;">https://original.jcb.co.jp/</a></p>
</div>
\`\`\`

### 14. 推奨表現への置換 ✅
- JCBオリジナルシリーズの信頼性
- 安定したカード発行実績
- モバイル即時入会サービス（モバ即）
- 基本還元率1.0%※
- J-POINTパートナー店

---

## ACマスターカード修正の14項目チェックリスト（厳格実施）

### 1. 絶対禁止表現の完全削除 ✅
削除対象（テキストから完全除去）:
- 審査関連: 審査が甘い、通りやすい、簡単、柔軟、緩い、申し込みやすい
- 確実性: 確実に通る、必ず作れる、100%通過、誰でも作れる
- 対象者: ブラックでも可能、債務整理経験者でも、他社で落ちた方も
- その他: 最後の砦、駆け込み寺、審査なし、無審査、誰でもOK、収入不問

### 2. 審査時間の必須表記とスタイル ✅
テキスト修正:
- 必須表記: 「最短20分※」
- 注釈追加（小さめグレーテキスト）:
\`\`\`html
<p style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.6;">
  ※お申込時間や審査によりご希望に添えない場合がございます。
</p>
\`\`\`

### 3. 在籍確認の必須表記とスタイル ✅
テキスト修正:
- 必須表記: 「原則、お勤め先へ在籍確認の電話なし※」
- 注釈追加:
\`\`\`html
<p style="font-size: 12px; color: #666; margin-top: 8px; line-height: 1.6;">
  ※在籍確認が必要と判断された場合は、お勤め先に確認のご連絡をする場合がございます。
</p>
\`\`\`

### 4. 自動契約機の正確な表記 ✅
- 必須表記: 「自動契約機(むじんくん)」
- 括弧は半角必須: (むじんくん) ✅ （むじんくん） ❌
- 台数表記削除: 「約900台」❌ → 「全国に設置」✅

### 5. 年齢表記の完全削除 ✅
- 具体的年齢表記を削除: 「18歳以上」「20歳以上」❌
- 「学生可」「未成年可」も削除
- 代替表現: 「安定した収入と返済能力を有する方」

### 6. 貸付条件の必須追加（枠付きスタイル） ✅
ACマスターカードセクション末尾に以下を追加:
\`\`\`html
<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 25px; margin-top: 30px; margin-bottom: 30px; font-size: 13px; color: #333; line-height: 1.7;">
  <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #333; border-bottom: 2px solid #3498db; padding-bottom: 10px;">ACマスターカード 貸付条件</p>
  <p style="margin: 0 0 10px 0;"><strong>【融資額】</strong>1万円~300万円(ショッピング枠利用時)</p>
  <p style="margin: 0 0 10px 0;"><strong>【貸付利率(実質年率)】</strong>2.4%~17.9% ※ショッピング枠ご利用時</p>
  <p style="margin: 0 0 10px 0;"><strong>【返済方式】</strong>定額リボルビング方式</p>
  <p style="margin: 0 0 10px 0;"><strong>【返済期間・返済回数】</strong>最長5年3ヶ月・1回~63回</p>
  <p style="margin: 0 0 10px 0;"><strong>【遅延損害金(年率)】</strong>20.0%</p>
  <p style="margin: 0 0 15px 0;"><strong>【担保・連帯保証人】</strong>不要</p>
  <p style="margin: 0; font-size: 12px; color: #666;">※ご契約極度額により、金利が異なります。<br>※返済期間・回数は、ご利用内容によって異なります。</p>
</div>
\`\`\`

### 7. 会社情報の必須追加（枠付きスタイル） ✅
ACマスターカードセクション末尾に以下を追加:
\`\`\`html
<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 25px; margin-bottom: 30px; font-size: 13px; color: #333; line-height: 1.7;">
  <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #333; border-bottom: 2px solid #3498db; padding-bottom: 10px;">アコム株式会社 会社情報</p>
  <p style="margin: 0 0 8px 0;"><strong>【商号】</strong>アコム株式会社</p>
  <p style="margin: 0 0 8px 0;"><strong>【本社所在地】</strong>東京都千代田区内幸町2-1-1 東京汐留ビルディング15階・16階</p>
  <p style="margin: 0 0 8px 0;"><strong>【登録番号】</strong>関東財務局長(15)第00022号</p>
  <p style="margin: 0 0 8px 0;"><strong>【協会会員番号】</strong>日本貸金業協会会員 第000002号</p>
  <p style="margin: 0;"><strong>【お問い合わせ】</strong>0120-07-1000</p>
</div>
\`\`\`

### 8. ステルスマーケティング表記（黄色枠） ✅
ページ冒頭またはACマスターカードセクション冒頭に以下を追加:
\`\`\`html
<div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
  <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #856404;">【広告】</p>
  <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">当サイトは広告による収益を得ています。本ページではアフィリエイトプログラムにより、ACマスターカードをご紹介しています。</p>
</div>
\`\`\`

### 9. CTAリンク先の確認と修正 ✅
- ACマスターカードのhref属性を確認
- 必須URL: https://www.acom.co.jp/lineup/credit/
- 内部記事リンク（例: /article/ac-master-card）は禁止

### 10. 許容表現の適用 ✅
使用可能な表現に置換:
- 「独自の審査基準を採用」
- 「審査が早い」「スピーディーな審査」
- 「最短20分※で審査完了」（注釈付き）
- 「原則、お勤め先へ在籍確認の電話なし※」（注釈付き）
- 「安定した収入と返済能力を有する方」

### 11. 禁止記事コンセプトチェック ✅
以下の内容は全面書き換え:
- ブラックリスト・債務整理を訴求する内容
- 審査の甘さを保証する内容
- 確実性を保証する内容

### 12. 旧情報の更新（2025年12月15日以降） ✅
以下を最新版に更新:
- 金利: 3.0%~18.0% → 2.4%~17.9%
- 登録番号: (14)第00022号 → (15)第00022号
- 住所: 東京汐留ビルディング15階・16階
- 台数表記削除、Apple Pay表記削除

### 13. 注釈エリアの新設 ✅
注釈を集約したエリアを追加:
\`\`\`html
<div style="background-color: #e8f4f8; border-left: 4px solid #3498db; padding: 20px; margin-top: 20px; border-radius: 4px;">
  <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #2c3e50;">【ご注意】</p>
  <p style="margin: 0 0 8px 0; font-size: 13px; color: #333; line-height: 1.7;">※お申込時間や審査によりご希望に添えない場合がございます。</p>
  <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.7;">※在籍確認が必要と判断された場合は、お勤め先に確認のご連絡をする場合がございます。</p>
</div>
\`\`\`

### 14. 他カード情報の完全保持 ✅
- JCB、三井住友カード、楽天カード等のセクションは一切変更しない
- ACマスターカードのみ修正

---

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
