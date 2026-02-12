// アプリケーションの状態管理
const state = {
  isAuthenticated: false,
  currentTab: 'text', // 'text' or 'html'
  guidelines: {
    jcb: '',
    acMaster: '',
    rakuten: ''
  }
}

// アプリケーションの初期化
function init() {
  renderApp()
}

// メインのレンダリング関数
function renderApp() {
  const app = document.getElementById('app')
  
  if (!state.isAuthenticated) {
    app.innerHTML = renderLoginPage()
    attachLoginHandlers()
  } else {
    app.innerHTML = renderMainPage()
    attachMainHandlers()
  }
}

// ログインページのHTML
function renderLoginPage() {
  return `
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <i class="fas fa-credit-card text-white text-2xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">SEO記事修正ツール</h1>
          <p class="text-gray-600">クレジットカードメディア向け</p>
        </div>
        
        <form id="loginForm" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-lock mr-2"></i>パスワード
            </label>
            <input 
              type="password" 
              id="password" 
              name="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="パスワードを入力してください"
              required
            />
          </div>
          
          <button 
            type="submit" 
            class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>ログイン
          </button>
          
          <div id="loginError" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span id="loginErrorMessage"></span>
          </div>
        </form>
      </div>
    </div>
  `
}

// メインページのHTML
function renderMainPage() {
  return `
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- ヘッダー -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-600 p-3 rounded-lg">
              <i class="fas fa-credit-card text-white text-2xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">クレジットカードSEO記事修正ツール</h1>
              <p class="text-gray-600">JCB・ACマスターカード・楽天カード専用</p>
            </div>
          </div>
          <button 
            onclick="logout()" 
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
          >
            <i class="fas fa-sign-out-alt mr-2"></i>ログアウト
          </button>
        </div>
      </div>

      <!-- タブ切り替え -->
      <div class="bg-white rounded-2xl shadow-lg mb-6">
        <div class="flex border-b">
          <button 
            onclick="switchTab('text')" 
            id="tabText"
            class="flex-1 py-4 px-6 font-semibold transition duration-200 ${state.currentTab === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}"
          >
            <i class="fas fa-align-left mr-2"></i>テキスト修正
          </button>
          <button 
            onclick="switchTab('html')" 
            id="tabHtml"
            class="flex-1 py-4 px-6 font-semibold transition duration-200 ${state.currentTab === 'html' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}"
          >
            <i class="fas fa-code mr-2"></i>HTML修正
          </button>
          <button 
            onclick="switchTab('guidelines')" 
            id="tabGuidelines"
            class="flex-1 py-4 px-6 font-semibold transition duration-200 ${state.currentTab === 'guidelines' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}"
          >
            <i class="fas fa-book mr-2"></i>ガイドライン設定
          </button>
        </div>

        <div class="p-6">
          ${state.currentTab === 'text' ? renderTextTab() : state.currentTab === 'html' ? renderHtmlTab() : renderGuidelinesTab()}
        </div>
      </div>
    </div>
  `
}

// テキスト修正タブ
function renderTextTab() {
  return `
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-file-alt mr-2"></i>修正前のテキスト
        </label>
        <textarea 
          id="inputText" 
          rows="10" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="修正したいテキストを入力してください..."
        ></textarea>
      </div>

      <div class="flex justify-center">
        <button 
          onclick="correctText()" 
          id="correctTextBtn"
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
        >
          <i class="fas fa-magic mr-2"></i>修正を実行
        </button>
      </div>

      <div id="textResult" class="hidden">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-check-circle mr-2 text-green-600"></i>修正後のテキスト
        </label>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
          <p class="text-green-700 text-sm">
            <i class="fas fa-info-circle mr-2"></i>
            修正が完了しました。内容を確認してください。
          </p>
        </div>
        <textarea 
          id="outputText" 
          rows="10" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          readonly
        ></textarea>
        <div class="flex justify-end mt-3">
          <button 
            onclick="copyToClipboard('outputText')" 
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            <i class="fas fa-copy mr-2"></i>コピー
          </button>
        </div>
      </div>

      <div id="textError" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span id="textErrorMessage"></span>
      </div>
    </div>
  `
}

// HTML修正タブ
function renderHtmlTab() {
  return `
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-code mr-2"></i>修正前のHTML
        </label>
        <textarea 
          id="inputHtml" 
          rows="15" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-sm"
          placeholder="<div>修正したいHTMLコードを入力してください...</div>"
        ></textarea>
      </div>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-yellow-800 text-sm">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <strong>注意：</strong>HTMLの構造、タグ、クラス名、スタイルは変更されません。テキストコンテンツのみが修正されます。
        </p>
      </div>

      <div class="flex justify-center">
        <button 
          onclick="correctHtml()" 
          id="correctHtmlBtn"
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
        >
          <i class="fas fa-magic mr-2"></i>修正を実行
        </button>
      </div>

      <div id="htmlResult" class="hidden">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-check-circle mr-2 text-green-600"></i>修正後のHTML
        </label>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
          <p class="text-green-700 text-sm">
            <i class="fas fa-info-circle mr-2"></i>
            修正が完了しました。内容を確認してください。
          </p>
        </div>
        <textarea 
          id="outputHtml" 
          rows="15" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition font-mono text-sm"
          readonly
        ></textarea>
        <div class="flex justify-end mt-3 space-x-3">
          <button 
            onclick="previewHtml()" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            <i class="fas fa-eye mr-2"></i>プレビュー
          </button>
          <button 
            onclick="copyToClipboard('outputHtml')" 
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            <i class="fas fa-copy mr-2"></i>コピー
          </button>
        </div>
      </div>

      <div id="htmlError" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span id="htmlErrorMessage"></span>
      </div>

      <!-- プレビューモーダル -->
      <div id="previewModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-bold text-gray-800">
              <i class="fas fa-eye mr-2"></i>HTMLプレビュー
            </h3>
            <button 
              onclick="closePreview()" 
              class="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <i class="fas fa-times text-gray-600"></i>
            </button>
          </div>
          <div id="previewContent" class="p-6 overflow-auto max-h-[calc(90vh-80px)]"></div>
        </div>
      </div>
    </div>
  `
}

// ガイドライン設定タブ
function renderGuidelinesTab() {
  return `
    <div class="space-y-6">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p class="text-blue-800 text-sm">
          <i class="fas fa-info-circle mr-2"></i>
          各カードのガイドラインとレギュレーションを設定してください。設定した内容は修正時に自動的に適用されます。
        </p>
      </div>

      <!-- JCBガイドライン -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-credit-card mr-2 text-indigo-600"></i>JCBカード ガイドライン（提供済み - 確認・編集可能）
        </label>
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
          <p class="text-green-700 text-sm">
            <i class="fas fa-check-circle mr-2"></i>
            JCBガイドラインは既に設定済みです。内容を確認または編集できます。
          </p>
        </div>
        <textarea 
          id="guidelineJcb" 
          rows="8" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-xs"
          placeholder="JCBカードに関するガイドラインとレギュレーションを入力してください..."
        >${state.guidelines.jcb}</textarea>
      </div>

      <!-- ACマスターカードガイドライン -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-credit-card mr-2 text-red-600"></i>ACマスターカード ガイドライン（提供済み - 確認・編集可能）
        </label>
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
          <p class="text-green-700 text-sm">
            <i class="fas fa-check-circle mr-2"></i>
            ACマスターカードガイドラインは既に設定済みです。内容を確認または編集できます。
          </p>
        </div>
        <textarea 
          id="guidelineAcMaster" 
          rows="8" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-xs"
          placeholder="ACマスターカードに関するガイドラインとレギュレーションを入力してください..."
        >${state.guidelines.acMaster}</textarea>
      </div>

      <!-- 楽天カードガイドライン -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-credit-card mr-2 text-pink-600"></i>楽天カード ガイドライン（提供済み - 確認・編集可能）
        </label>
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
          <p class="text-green-700 text-sm">
            <i class="fas fa-check-circle mr-2"></i>
            楽天カードガイドラインは既に設定済みです。内容を確認または編集できます。
          </p>
        </div>
        <textarea 
          id="guidelineRakuten" 
          rows="8" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-xs"
          placeholder="楽天カードに関するガイドラインとレギュレーションを入力してください..."
        >${state.guidelines.rakuten}</textarea>
      </div>

      <div class="flex justify-center">
        <button 
          onclick="saveGuidelines()" 
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
        >
          <i class="fas fa-save mr-2"></i>保存
        </button>
      </div>

      <div id="guidelineSuccess" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        <i class="fas fa-check-circle mr-2"></i>
        ガイドラインを保存しました
      </div>
    </div>
  `
}

// イベントハンドラーの登録（ログイン）
function attachLoginHandlers() {
  const form = document.getElementById('loginForm')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const password = document.getElementById('password').value
    const errorDiv = document.getElementById('loginError')
    const errorMessage = document.getElementById('loginErrorMessage')

    try {
      const response = await axios.post('/api/login', { password })
      
      if (response.data.success) {
        state.isAuthenticated = true
        renderApp()
      } else {
        errorDiv.classList.remove('hidden')
        errorMessage.textContent = response.data.message
      }
    } catch (error) {
      errorDiv.classList.remove('hidden')
      errorMessage.textContent = error.response?.data?.message || 'ログインに失敗しました'
    }
  })
}

// イベントハンドラーの登録（メイン）
function attachMainHandlers() {
  // ガイドラインタブの場合、テキストエリアの値を復元
  if (state.currentTab === 'guidelines') {
    const jcbTextarea = document.getElementById('guidelineJcb')
    const acMasterTextarea = document.getElementById('guidelineAcMaster')
    const rakutenTextarea = document.getElementById('guidelineRakuten')
    
    if (jcbTextarea) jcbTextarea.value = state.guidelines.jcb
    if (acMasterTextarea) acMasterTextarea.value = state.guidelines.acMaster
    if (rakutenTextarea) rakutenTextarea.value = state.guidelines.rakuten
  }
}

// タブ切り替え
function switchTab(tab) {
  state.currentTab = tab
  renderApp()
}

// ログアウト
function logout() {
  state.isAuthenticated = false
  state.currentTab = 'text'
  renderApp()
}

// ガイドライン保存
function saveGuidelines() {
  state.guidelines.jcb = document.getElementById('guidelineJcb').value
  state.guidelines.acMaster = document.getElementById('guidelineAcMaster').value
  state.guidelines.rakuten = document.getElementById('guidelineRakuten').value
  
  // ローカルストレージに保存
  localStorage.setItem('guidelines', JSON.stringify(state.guidelines))
  
  const successDiv = document.getElementById('guidelineSuccess')
  successDiv.classList.remove('hidden')
  
  setTimeout(() => {
    successDiv.classList.add('hidden')
  }, 3000)
}

// ガイドラインの読み込み
function loadGuidelines() {
  const saved = localStorage.getItem('guidelines')
  if (saved) {
    state.guidelines = JSON.parse(saved)
  } else {
    // デフォルト値を設定
    state.guidelines.jcb = getDefaultJCBGuideline()
    state.guidelines.acMaster = getDefaultACMasterGuideline()
    state.guidelines.rakuten = getDefaultRakutenGuideline()
    // 初期値を保存
    localStorage.setItem('guidelines', JSON.stringify(state.guidelines))
  }
}

// JCBデフォルトガイドライン
function getDefaultJCBGuideline() {
  return `# JCBクレジットカード広告表示ガイドライン

## 1. ポイント・還元率表記
✅ すべての還元率数値に「※」を付与
✅ 注釈: ※還元率は交換商品により異なります。
✅ ポイント名称: Oki Dokiポイント → J-POINT

## 2. 年会費表記
✅ すべての年会費に「（税込）」を明記
✅ テーブルヘッダー: 年会費 → 年会費（税込）

## 3. 対象年齢表記
✅ JCB CARD W: 18～39歳限定
✅ JCB CARD S: 年齢制限なし

## 4. 発行スピード表記
✅ 推奨: モバイル即時入会サービス（モバ即）対応
✅ 注釈: ※9:00～20:00の申込完了で最短5分発行（審査状況により異なります）
❌ 禁止: 最短5分で発行、即日発行可能、すぐ使える

## 5. 審査・在籍確認表記
❌ 禁止: 審査が甘い、通りやすい、柔軟な審査、学生でも作りやすい
✅ 推奨: JCBオリジナルシリーズの信頼性、安定したカード発行実績
✅ ヘッダー: 審査・発行 → カードの特徴

## 6. 付帯保険表記
✅ JCB CARD W・S: 海外旅行保険最高2,000万円（利用付帯）
✅ JCBゴールド: 最高1億円の旅行保険付帯

## 7. ブランド・商標表記
✅ ポイント名称: Oki Dokiポイント → J-POINT
✅ パートナー名称: Oki Dokiランド → J-POINTパートナー店
✅ カード名称: JCB Card W → JCB CARD W
✅ Amazon: Amazon → Amazon.co.jp※2（注釈追加）
✅ セブン-イレブン: セブン → セブン‐イレブン※3（注釈追加）
✅ スターバックス: スタバ → スターバックス※1（注釈追加）

## 8. パートナー店・特約店表記
✅ 統一名称: 優待店・特約店 → J-POINTパートナー店

## 9. アクセシビリティ要件
✅ 画像alt属性: "JCB CARD W券面画像"
✅ リンクaria-label: "JCB CARD W公式サイトへ"

## 10. 注釈・出典要件
✅ 注釈エリア新設必須
✅ 公式リンク: https://original.jcb.co.jp/

## 11. 画像・リンクURL保持（絶対変更禁止）
- JCB CARD W 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/JCB-CARD-W.jpeg
- JCB CARD W CTA: https://iwataworks.jp/article/jcb-w
- JCB CARD S 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/JCBカード-S.webp
- JCB CARD S CTA: https://iwataworks.jp/article/jcb-s
- JCBゴールド 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/JCBゴールド.jpeg
- JCBゴールド CTA: https://iwataworks.jp/article/jcb-gold

## 12. 禁止表現
❌ 審査: 審査が甘い、通りやすい、柔軟、簡単
❌ 発行: 絶対、必ず、確実に○分
❌ ポイント: 必ず貯まる、絶対お得
❌ 対象者: 誰でも作れる、学生でも簡単
❌ 比較: 業界No.1、最強、一番お得

詳細は提供済みの完全版ガイドラインを参照してください。`
}

// ACマスターカードデフォルトガイドライン
function getDefaultACMasterGuideline() {
  return `# ACマスターカード アフィリエイトガイドライン

## 1. 絶対禁止表現
❌ 審査: 審査が甘い、通りやすい、簡単、柔軟、緩い、申し込みやすい
❌ 確実性: 確実に通る、必ず作れる、100%通過、誰でも作れる
❌ 対象者: ブラックでも可能、債務整理経験者でも、他社で落ちた方も
❌ 年齢: 18歳以上、20歳以上、学生可、未成年可
❌ その他: 最後の砦、駆け込み寺、審査なし、無審査、即日融資

## 2. 必須指定表記
✅ 審査時間: 最短20分※
   注釈: ※お申込時間や審査によりご希望に添えない場合がございます。

✅ 在籍確認: 原則、お勤め先へ在籍確認の電話なし※
   注釈: ※在籍確認が必要と判断された場合は、お勤め先に確認のご連絡をする場合がございます。

✅ 自動契約機: 自動契約機(むじんくん)
   - 括弧は半角必須
   - 台数表記は禁止（「約900台」❌ → 「全国に設置」✅）

## 3. 貸付条件（必須記載）
【融資額】1万円~300万円(ショッピング枠利用時)
【貸付利率(実質年率)】2.4%~17.9% ※ショッピング枠ご利用時
【返済方式】定額リボルビング方式
【返済期間・返済回数】最長5年3ヶ月・1回~63回
【遅延損害金(年率)】20.0%
【担保・連帯保証人】不要

※注意: 旧金利(3.0%~18.0%)は使用禁止

## 4. 会社情報（必須記載）
【商号】アコム株式会社
【本社所在地】東京都千代田区内幸町2-1-1 東京汐留ビルディング15階・16階
【登録番号】関東財務局長(15)第00022号
【協会会員番号】日本貸金業協会会員 第000002号
【お問い合わせ】0120-07-1000

※注意: 旧登録番号(14)は使用禁止

## 5. ステルスマーケティング表記（必須）
記事・ページの冒頭に以下を記載:
【広告】当サイトは広告による収益を得ています。本ページではアフィリエイトプログラムにより、ACマスターカードをご紹介しています。

## 6. CTAリンク・遷移先
✅ 必須リンク先: https://www.acom.co.jp/lineup/credit/
❌ 禁止: 内部記事へのリンク、他のランディングページ

## 7. 許容表現
✅ 使用可能: 独自の審査基準、審査が早い、スピーディーな審査
✅ 対象者: 安定した収入と返済能力を有する方

## 8. 禁止される記事コンセプト
❌ ブラックリスト・債務整理関連記事
❌ 審査の甘さを訴求する記事
❌ 確実性を保証する記事

## 9. 画像・リンクURL保持（絶対変更禁止）
- ACマスターカード 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/ACマスターカード.webp
- ACマスターカード CTA: https://iwataworks.jp/article/ac-master-card

## 10. 追加レギュレーション（2025年12月15日更新）
✅ 金利変更: 2.4%~17.9% (2026年1月6日0:00以降)
✅ 登録番号更新: (15)第00022号
✅ 住所変更: 東京汐留ビルディング15階・16階
❌ Apple Pay表記禁止
❌ 計算式表記禁止

詳細は提供済みの完全版ガイドラインを参照してください。`
}

// 楽天カードデフォルトガイドライン
function getDefaultRakutenGuideline() {
  return `# 楽天カード アフィリエイト広告ガイドライン

## 1. 禁止表現の6大カテゴリ
❌ ①楽天カードに関する誤情報の訴求
❌ ②楽天カードにとって不利益となる訴求
❌ ③他社で審査に落ちた方でも作れる・審査が緩い等の訴求【最重要】
❌ ④専業主婦など収入のない方を狙う訴求
❌ ⑤最短即日審査等の当日発表訴求
❌ ⑥有利誤認の訴求

## 2. 審査関連（完全禁止）
❌ 審査甘い/緩い/柔軟/優しい/簡単/易しい/低い
❌ 審査通過率/審査通過実績/審査に通りやすい
❌ 新規成約率が高い
❌ 審査に不安がある方でも/審査落ちした方でも
❌ 他社で落ちた方でも/過去に審査に落ちた経験
❌ ブラックでもOK/無職でもOK
❌ 誰でも作れる/絶対に審査を通る
❌ どこよりも簡単/一番通りやすい

## 3. 即日・時間関連（完全禁止）
❌ 最短即日審査/最短即日発行
❌ 即日発行/即日で使える/当日発行
❌ 最短10分/最短20分/最短○分
❌ 最短日発行/最短○営業日発行
❌ 今すぐ使える/すぐに発行

✅ 許容: デジタルカード対応、審査結果はメールでお知らせ

## 4. 収入・属性関連（要注意）
❌ 専業主婦でも作れる
❌ 収入がなくても申込可能
❌ 無職でもOK
❌ 年収○○円以下でも審査通過
❌ 収入に不安がある方でも

✅ 許容: 高校生を除く18歳以上の方が申込可能
✅ 許容: パート・アルバイトでも申込可能
✅ 許容: 学生でも申込可能（高校生除く）

## 5. SPU関連（完全禁止）
❌ SPU○倍/SPU最大○倍/SPU+1倍/SPU+2倍
❌ 楽天市場で3倍/楽天市場で常時3倍以上
❌ ポイント3倍以上/最大○倍

✅ 許容: 楽天市場でポイント還元率アップ
✅ 許容: 楽天のサービス活用でお得
✅ 許容: ポイント還元率1.0%〜

## 6. 期間限定表現（禁止）
❌ 今なら○○ポイント
❌ 期間限定キャンペーン
❌ ○月○日まで
❌ 本日限り/今だけ

## 7. 必須記載事項
【会社情報】
発行会社名: 楽天カード株式会社
所在地: 東京都世田谷区玉川一丁目14番1号 楽天クリムゾンハウス
電話番号: 03-6740-6740
公式サイト: https://www.rakuten-card.co.jp/

【申込資格】
- 高校生を除く18歳以上の方
- ゴールド・プレミアムカードは20歳以上で安定収入のある方
※詳細な申込資格は公式サイトでご確認ください

## 8. 正式カード名
✅ 楽天カード
✅ 楽天PINKカード
✅ 楽天ゴールドカード
✅ 楽天プレミアムカード
✅ 楽天ANAマイレージクラブカード
✅ 楽天カード アカデミー
✅ 楽天銀行カード
✅ 楽天ビジネスカード

## 9. 審査基準を推測する表現（禁止）
❌ 楽天サービス利用が審査に有利
❌ 楽天会員なら審査で優遇
❌ 楽天経済圏の利用実績がプラス評価
❌ 自動審査システムで人為的な厳格さを排除

## 10. キャッシング訴求の禁止
❌ キャッシング枠の積極的訴求
❌ 貸付を助長する表現
❌ 借入を推奨する内容

詳細は提供済みの完全版ガイドラインを参照してください。`
}

// テキスト修正
async function correctText() {
  const inputText = document.getElementById('inputText').value
  const resultDiv = document.getElementById('textResult')
  const errorDiv = document.getElementById('textError')
  const errorMessage = document.getElementById('textErrorMessage')
  const btn = document.getElementById('correctTextBtn')

  if (!inputText.trim()) {
    errorDiv.classList.remove('hidden')
    errorMessage.textContent = 'テキストを入力してください'
    return
  }

  // エラーメッセージを非表示
  errorDiv.classList.add('hidden')
  resultDiv.classList.add('hidden')

  // ボタンを無効化
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>修正中...'

  try {
    // 統合されたガイドラインを作成
    const guidelines = `
# JCBカード ガイドライン
${state.guidelines.jcb || '（設定なし）'}

# ACマスターカード ガイドライン
${state.guidelines.acMaster || '（設定なし）'}

# 楽天カード ガイドライン
${state.guidelines.rakuten || '（設定なし）'}
    `.trim()

    const response = await axios.post('/api/correct-text', {
      text: inputText,
      guidelines: guidelines
    })

    if (response.data.success) {
      document.getElementById('outputText').value = response.data.correctedText
      resultDiv.classList.remove('hidden')
    } else {
      errorDiv.classList.remove('hidden')
      errorMessage.textContent = response.data.message
    }
  } catch (error) {
    errorDiv.classList.remove('hidden')
    errorMessage.textContent = error.response?.data?.message || '修正に失敗しました'
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-magic mr-2"></i>修正を実行'
  }
}

// HTML修正
async function correctHtml() {
  const inputHtml = document.getElementById('inputHtml').value
  const resultDiv = document.getElementById('htmlResult')
  const errorDiv = document.getElementById('htmlError')
  const errorMessage = document.getElementById('htmlErrorMessage')
  const btn = document.getElementById('correctHtmlBtn')

  if (!inputHtml.trim()) {
    errorDiv.classList.remove('hidden')
    errorMessage.textContent = 'HTMLコードを入力してください'
    return
  }

  // エラーメッセージを非表示
  errorDiv.classList.add('hidden')
  resultDiv.classList.add('hidden')

  // ボタンを無効化
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>修正中...'

  try {
    // 統合されたガイドラインを作成
    const guidelines = `
# JCBカード ガイドライン
${state.guidelines.jcb || '（設定なし）'}

# ACマスターカード ガイドライン
${state.guidelines.acMaster || '（設定なし）'}

# 楽天カード ガイドライン
${state.guidelines.rakuten || '（設定なし）'}
    `.trim()

    const response = await axios.post('/api/correct-html', {
      html: inputHtml,
      guidelines: guidelines
    })

    if (response.data.success) {
      document.getElementById('outputHtml').value = response.data.correctedHtml
      resultDiv.classList.remove('hidden')
    } else {
      errorDiv.classList.remove('hidden')
      errorMessage.textContent = response.data.message
    }
  } catch (error) {
    errorDiv.classList.remove('hidden')
    errorMessage.textContent = error.response?.data?.message || '修正に失敗しました'
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-magic mr-2"></i>修正を実行'
  }
}

// クリップボードにコピー
function copyToClipboard(textareaId) {
  const textarea = document.getElementById(textareaId)
  textarea.select()
  document.execCommand('copy')
  
  // コピー成功のフィードバック
  const btn = event.target.closest('button')
  const originalHtml = btn.innerHTML
  btn.innerHTML = '<i class="fas fa-check mr-2"></i>コピーしました！'
  
  setTimeout(() => {
    btn.innerHTML = originalHtml
  }, 2000)
}

// HTMLプレビュー
function previewHtml() {
  const outputHtml = document.getElementById('outputHtml').value
  const modal = document.getElementById('previewModal')
  const content = document.getElementById('previewContent')
  
  content.innerHTML = outputHtml
  modal.classList.remove('hidden')
}

// プレビューを閉じる
function closePreview() {
  const modal = document.getElementById('previewModal')
  modal.classList.add('hidden')
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
  loadGuidelines()
  init()
})
