// アプリケーションの状態管理
const state = {
  isAuthenticated: false,
  currentTab: 'text', // 'text' or 'html'
  apiKey: localStorage.getItem('openai_api_key') || '',
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
            onclick="switchTab('settings')" 
            id="tabSettings"
            class="flex-1 py-4 px-6 font-semibold transition duration-200 ${state.currentTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}"
          >
            <i class="fas fa-cog mr-2"></i>設定
          </button>
          <button 
            onclick="switchTab('guidelines')" 
            id="tabGuidelines"
            class="flex-1 py-4 px-6 font-semibold transition duration-200 ${state.currentTab === 'guidelines' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}"
          >
            <i class="fas fa-book mr-2"></i>ガイドライン
          </button>
        </div>

        <div class="p-6">
          ${state.currentTab === 'text' ? renderTextTab() : state.currentTab === 'html' ? renderHtmlTab() : state.currentTab === 'settings' ? renderSettingsTab() : renderGuidelinesTab()}
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

// 設定タブ
function renderSettingsTab() {
  return `
    <div class="space-y-6">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p class="text-yellow-800 text-sm">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <strong>重要:</strong> OpenAI APIキーはブラウザのLocalStorageに保存されます。セキュリティに注意してください。
        </p>
      </div>

      <!-- OpenAI APIキー設定 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-key mr-2 text-indigo-600"></i>OpenAI APIキー
        </label>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p class="text-blue-700 text-sm mb-2">
            <i class="fas fa-info-circle mr-2"></i>
            OpenAI APIキーは以下から取得できます：
          </p>
          <a 
            href="https://platform.openai.com/account/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-700 underline text-sm"
          >
            https://platform.openai.com/account/api-keys
            <i class="fas fa-external-link-alt ml-1 text-xs"></i>
          </a>
        </div>
        <div class="relative">
          <input 
            type="password" 
            id="apiKeyInput" 
            value="${state.apiKey}"
            class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-sm"
            placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <button
            onclick="toggleApiKeyVisibility()"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            type="button"
          >
            <i id="apiKeyToggleIcon" class="fas fa-eye"></i>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          ${state.apiKey ? '✅ APIキーが設定されています' : '⚠️ APIキーが未設定です'}
        </p>
      </div>

      <!-- パスワード設定の説明 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-lock mr-2 text-gray-600"></i>ログインパスワード
        </label>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p class="text-gray-700 text-sm mb-2">
            現在のパスワード: <code class="bg-gray-200 px-2 py-1 rounded">0908</code>
          </p>
          <p class="text-gray-600 text-xs">
            <i class="fas fa-info-circle mr-1"></i>
            パスワードの変更は管理者に依頼してください
          </p>
        </div>
      </div>

      <!-- 保存ボタン -->
      <div class="flex justify-center">
        <button 
          onclick="saveSettings()" 
          class="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
        >
          <i class="fas fa-save mr-2"></i>設定を保存
        </button>
      </div>

      <div id="settingsSuccess" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        <i class="fas fa-check-circle mr-2"></i>
        設定を保存しました
      </div>

      <div id="settingsError" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span id="settingsErrorMessage"></span>
      </div>
    </div>
  `
}

// ガイドライン設定タブ
function renderGuidelinesTab() {
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

// ACマスターカードデフォルトガイドライン（完全版）
function getDefaultACMasterGuideline() {
  return `# ACマスターカード アフィリエイトガイドライン・レギュレーション 完全版

## 1. 絶対禁止表現（最重要）
❌ 審査関連: 審査が甘い、通りやすい、簡単、柔軟、緩い、申し込みやすい
❌ 確実性: 確実に通る、必ず作れる、100%通過、誰でも作れる
❌ 対象者: ブラックでも可能、ブラックリストでも作れる、債務整理経験者でも
❌ 申込容易性: 申し込みやすい、審査が不安な方も、他社で落ちた方も
❌ 比較表現: 審査が他社より甘い、最も通りやすい、一番簡単
❌ 年齢: 18歳以上、20歳以上、学生可、未成年可（具体的年齢表記禁止）
❌ その他: 最後の砦、駆け込み寺、審査なし、無審査、即日融資、誰でもOK、収入不問

## 2. 必須指定表記（14項目対応）

### 2-1. 審査時間
✅ 必須表記: 「最短20分※」
✅ 必須注釈: ※お申込時間や審査によりご希望に添えない場合がございます。
❌ 違反例: 「最短20分」（注釈なし）、「約20分」、「20分程度」

### 2-2. 在籍確認
✅ 必須表記: 「原則、お勤め先へ在籍確認の電話なし※」
✅ 必須注釈: ※在籍確認が必要と判断された場合は、お勤め先に確認のご連絡をする場合がございます。
❌ 違反例: 「在籍確認なし」（原則の記載なし）、注釈なし

### 2-3. 自動契約機
✅ 必須表記: 「自動契約機(むじんくん)」
✅ 括弧: 必ず半角 (むじんくん) ✅ （むじんくん） ❌
❌ 台数表記禁止: 「約900台」❌ → 「全国に設置」✅

## 3. 貸付条件（必須記載・最新版）

【融資額】1万円~300万円(ショッピング枠利用時)
【貸付利率(実質年率)】2.4%~17.9% ※ショッピング枠ご利用時
【返済方式】定額リボルビング方式
【返済期間・返済回数】最長5年3ヶ月・1回~63回
【遅延損害金(年率)】20.0%
【担保・連帯保証人】不要

※ご契約極度額により、金利が異なります。
※返済期間・回数は、ご利用内容によって異なります。

⚠️ 重要: 金利は最新版を使用（2026年1月6日0:00以降）
❌ 旧金利(3.0%~18.0%)は使用禁止

## 4. 会社情報（必須記載・最新版）

【商号】アコム株式会社
【本社所在地】東京都千代田区内幸町2-1-1 東京汐留ビルディング15階・16階
【登録番号】関東財務局長(15)第00022号
【協会会員番号】日本貸金業協会会員 第000002号
【お問い合わせ】0120-07-1000

⚠️ 重要な更新事項:
✅ 登録番号: (15)第00022号（2025年12月15日更新）
❌ 旧番号(14)は使用禁止
✅ 住所: 東京汐留ビルディング15階・16階
❌ 旧住所は使用禁止

## 5. ステルスマーケティング表記（必須）

記事・ページの冒頭に以下を必ず記載:

【広告】
当サイトは広告による収益を得ています。本ページではアフィリエイトプログラムにより、ACマスターカードをご紹介しています。

推奨デザイン:
- 背景色: #fff3cd（黄色系）
- 枠線: 2px solid #ffc107（オレンジ系）
- 配置: ページ最上部、コンテンツ開始前

## 6. CTAリンク・遷移先

✅ 必須リンク先: https://www.acom.co.jp/lineup/credit/
❌ 禁止: 内部記事へのリンク（例: /article/ac-master-card）
❌ 禁止: 他のランディングページへのリンク
❌ 禁止: アフィリエイトリンク以外

リンク属性:
<a href="https://www.acom.co.jp/lineup/credit/" target="_blank" rel="noopener">

## 7. 許容表現

✅ 使用可能な表現:
- 審査基準: 独自の審査基準、独自の審査システム
- 審査スピード: 審査が早い、スピーディーな審査
- 発行速度: 最短20分※（注釈付き）、即日発行可能
- 在籍確認: 原則、お勤め先へ在籍確認の電話なし※（注釈付き）
- 対象者: 安定した収入と返済能力を有する方

推奨表現の具体例:
✅「ACマスターカードは独自の審査基準を採用しており、審査が早い点が特徴です」
✅「最短20分※で審査完了し、全国に設置された自動契約機(むじんくん)で即日カード受取も可能です」

## 8. 禁止される記事コンセプト（掲載不可）

❌ ブラックリスト・債務整理関連
   「ブラックでも作れる」「債務整理経験者でも審査通過」等
❌ 審査の甘さを訴求
   「審査が甘いカード比較」「審査に通りやすいカード」等
❌ 確実性を保証
   「必ず審査に通る方法」「100%発行できる」等

対応方法: 全面書き換えまたは掲載見送り

## 9. 他社カード情報の取り扱い

✅ 許可: 並列での比較（ACマスターカードと他社カードを同等に紹介）
✅ 許可: 簡潔な特徴説明（カード名、年会費、還元率、基本情報）
❌ 禁止: 他社カードの詳細すぎる説明
❌ 禁止: 他社カードのCTAが大きすぎる
❌ 禁止: ACマスターカードより他社カードを優遇

## 10. 画像・リンクURL保持（絶対変更禁止）

- ACマスターカード 画像: https://iwataworks.jp/article/wp-content/uploads/2025/11/ACマスターカード.webp
- ACマスターカード CTA: https://iwataworks.jp/article/ac-master-card

## 11. 追加レギュレーション（2025年12月15日更新）

### 11-1. 金利変更
旧: 3.0%~18.0% ❌
新: 2.4%~17.9% ✅（2026年1月6日0:00以降）

### 11-2. 登録番号更新
旧: 関東財務局長(14)第00022号 ❌
新: 関東財務局長(15)第00022号 ✅

### 11-3. 住所変更
新: 東京汐留ビルディング15階・16階 ✅

### 11-4. 台数表記削除
❌「約900台の自動契約機」
✅「全国に設置された自動契約機(むじんくん)」

### 11-5. Apple Pay表記禁止
Apple Payに関する記載は禁止

### 11-6. 計算式表記禁止
金利計算式の詳細な記載は禁止

## 12. チェックリスト（自動化用）

✅ ステルスマーケティング表記: ページ冒頭に必須
✅ 禁止表現チェック: 審査が甘い、通りやすい、簡単、柔軟等
✅ 審査時間: 最短20分※ + 注釈必須
✅ 在籍確認: 原則、お勤め先へ在籍確認の電話なし※ + 注釈必須
✅ 自動契約機: 自動契約機(むじんくん)（半角括弧）
✅ 年齢表記: 具体的年齢表記禁止
✅ 貸付条件: 必須記載（最新金利2.4%~17.9%）
✅ 会社情報: 必須記載（最新登録番号(15)）
✅ CTAリンク: https://www.acom.co.jp/lineup/credit/
✅ 他カード保持: JCB、楽天カード、三井住友カード等は変更なし

## 13. 違反レベル分類

### 最重大違反（即掲載停止）
- ブラックリスト・債務整理を訴求する記事
- 「審査が甘い」等の禁止表現を多用
- 虚偽の情報（古い金利、誤った登録番号等）
- ステルスマーケティング表記なし

### 重大違反（早急な修正必要）
- 指定表記の欠落（審査時間・在籍確認・自動契約機の注釈なし）
- 貸付条件・会社情報の欠落
- 内部記事へのリンク
- 年齢の具体的表記

### 軽微な違反（修正推奨）
- 自動契約機の括弧が全角
- 表現の微妙なニュアンス
- デザイン上の改善点

## 14. 正規表現パターン（自動検出用）

禁止表現検出:
- 審査.*?(甘|緩|柔軟|易しい|簡単|通りやすい)
- (確実|必ず|100%).*?(通る|作れる)
- ブラック.*?(でも|リスト|OK|可能)
- (債務整理|自己破産).*?(でも|経験者)

必須表記検出:
- 最短20分(?!.*?お申込時間)
- 在籍確認.*?電話.*?なし(?!.*?在籍確認が必要)
- 自動契約機（むじんくん）
- (3\.0|18\.0)%
- \(14\)第00022号

詳細は提供済みの完全版ガイドラインを参照してください。`
}

// 楽天カードデフォルトガイドライン（完全版）
function getDefaultRakutenGuideline() {
  return `# 楽天カードアフィリエイト広告ガイドライン・レギュレーション 完全版

## 1. 禁止表現の6大カテゴリ（最重要）
❌ ①楽天カードに関する誤情報の訴求
   - 事実と異なる情報の記載
   - 公式情報と矛盾する内容
   - 未確認情報の断定的表現
❌ ②楽天カードにとって不利益となる訴求
   - ネガティブキャンペーン
   - 「やめたほうがいい」等の否定的表現
   - 他社との不公平な比較
❌ ③他社で審査に落ちた方でも作れる・審査が緩い等の訴求【最重要】
   - 審査の甘さ・柔軟性を示唆する一切の表現を禁止
❌ ④専業主婦など収入のない方を狙う訴求
   - 「収入がなくても申込可能」
   - 「専業主婦でも作れる」
   - 「無職でもOK」
❌ ⑤最短即日審査等の当日発表訴求
   - 「最短即日審査」
   - 「最短10分で審査完了」
   - 「即日発行」「当日発行可能」
❌ ⑥有利誤認の訴求
   - 審査基準を推測・断定する表現
   - 「楽天サービス利用が審査に有利」
   - 「楽天会員なら審査で優遇」

## 2. 審査関連（完全禁止・15項目対応）

### 2-1. 絶対禁止表現
❌ 審査甘い / 審査が甘い / 甘め
❌ 審査緩い / 審査が緩い / ゆるい
❌ 審査柔軟 / 柔軟な審査 / 審査が柔らかい
❌ 審査が優しい / 審査基準が低い / 審査のハードルが低い
❌ 審査通過率 / 審査通過実績 / 審査に通りやすい / 通過しやすい
❌ 審査が簡単 / 審査が易しい / 簡単に通る
❌ 新規成約率が高い / 新規成約率○%
❌ 審査に不安がある方でも / 審査が心配な方
❌ 審査落ちした方でも / 審査に落ちた方でも
❌ 他社で落ちた方でも / 過去に審査に落ちた経験がある方
❌ ブラックでもOK / 無職でもOK / 誰でも作れる
❌ 絶対に審査を通る / 必ず審査通過 / 100%通過
❌ どこよりも簡単 / 一番通りやすい / 最も通過しやすい

### 2-2. 審査基準を推測する表現（禁止）
❌ 楽天サービス利用が審査に有利
❌ 楽天会員なら審査で優遇
❌ 楽天経済圏の利用実績がプラス評価
❌ 自動審査システムで人為的な厳格さを排除
❌ 利用者数拡大のため審査基準を柔軟に設定

### 2-3. 代替表現（推奨）
✅ 申込資格: 高校生を除く18歳以上の方
✅ パート・アルバイトでも申込可能
✅ 学生でも申込可能（高校生除く）
✅ 申込条件を満たしている方が申込可能
✅ 詳細な申込資格は公式サイトでご確認ください

## 3. 即日・時間関連（完全禁止）

### 3-1. 絶対禁止表現
❌ 最短即日審査 / 最短即日発行
❌ 即日発行 / 即日で使える / 当日発行
❌ 最短10分 / 最短20分 / 最短○分
❌ 最短日発行 / 最短○営業日発行
❌ 今すぐ使える / すぐに発行 / 今日中にカードが手に入る
❌ 審査時間は約○分 / ○営業日以内に審査完了

### 3-2. 代替表現（推奨）
✅ デジタルカード対応
✅ 審査結果はメールでお知らせいたします
✅ 審査時間は申込内容により異なります
✅ 発行スピード重視
✅ オンライン申込対応

## 4. 収入・属性関連（完全禁止）

### 4-1. 絶対禁止表現
❌ 専業主婦でも作れる / 専業主婦でも申込可能
❌ 収入がなくても申込可能 / 収入がない方でも
❌ 無職でもOK / 無職の方でも申込可能
❌ 年収○○円以下でも審査通過 / 年収が少なくても大丈夫
❌ 収入に不安がある方でも / 収入が不安定でも
❌ 主婦でも作れる / 主婦・パートでも審査通過

### 4-2. 「主婦」表現の注意事項
⚠️ 注意: 「主婦」は専業主婦を想起させる可能性あり
❌ 避けるべき: 主婦でも作れる、主婦・パートでも審査通過
✅ 許容表現: パート・アルバイトでも申込可能

### 4-3. 代替表現（推奨）
✅ 高校生を除く18歳以上の方が申込可能
✅ パート・アルバイトでも申込可能
✅ 学生でも申込可能（高校生除く）
✅ 申込資格は公式サイトでご確認ください
✅ 安定した収入のある方（ゴールド・プレミアムカード）

## 5. SPU関連（完全禁止）

### 5-1. 絶対禁止表現
❌ SPU○倍 / SPU最大○倍
❌ SPU+1倍 / SPU+2倍 / SPU活用で最大○倍
❌ 楽天市場で3倍 / 楽天市場で常時3倍以上
❌ ポイント3倍以上 / 最大○倍のポイント還元

### 5-2. 代替表現（推奨）
✅ 楽天市場でポイント還元率アップ
✅ 楽天市場でポイントアップ
✅ 楽天のサービス活用でお得
✅ 楽天経済圏でポイントが貯まる
✅ ポイント還元率1.0%〜

## 6. 期間限定表現（禁止）

### 6-1. 禁止表現
❌ 今なら○○ポイント
❌ 期間限定キャンペーン
❌ ○月○日まで
❌ 本日限り / 今だけ / 今だけ特典

### 6-2. 代替表現
✅ 最新のキャンペーン情報は公式サイトでご確認ください

## 7. 必須記載事項

### 7-1. 会社情報（正確な表記必須）
【楽天カード株式会社 会社情報】
・発行会社: 楽天カード株式会社
・所在地: 東京都世田谷区玉川一丁目14番1号 楽天クリムゾンハウス
・電話番号: 03-6740-6740
・公式サイト: https://www.rakuten-card.co.jp/

### 7-2. 申込資格（必須記載）
【楽天カードについて】
・申込資格: 高校生を除く18歳以上の方
・ゴールド・プレミアムカード: 20歳以上で安定収入のある方
※詳細な申込資格は公式サイトでご確認ください

## 8. 対象カード名の正確な表記

### 8-1. 正式カード名一覧
✅ 楽天カード
✅ 楽天PINKカード
✅ 楽天ゴールドカード
✅ 楽天プレミアムカード
✅ 楽天ANAマイレージクラブカード
✅ 楽天カード アカデミー
✅ 楽天銀行カード
✅ 楽天ビジネスカード

### 8-2. 表記ルール
- 正式名称を使用（略称禁止）
- 「楽天」のカタカナ表記厳守
- スペース・記号は正式表記に従う

## 9. キャッシング訴求の禁止
❌ キャッシング枠の積極的訴求
❌ 貸付を助長する表現
❌ 借入を推奨する内容

## 10. 内容不十分なサイトの禁止
❌ ペライチサイト（1ページのみのサイト）
❌ 情報量が極端に少ないサイト
❌ コンテンツの質が低いサイト

## 11. 広告表記の明示
✅ PR表記・広告表記の明示
✅ アフィリエイトリンクであることの明示
✅ 提携の有無が記事内容に影響しない旨の記載

## 12. 情報の正確性
✅ 公式情報との整合性確保
✅ 最新情報への更新
✅ 出典の明示
✅ 事実と意見の区別

## 13. 正規表現パターン（自動検出用）

### 審査関連
- 審査.{0,2}(甘|緩|柔|優しい|簡単|易しい|低い|通りやすい)
- 審査(通過率|基準|ハードル)
- (審査|審査に).{0,5}(不安|心配|落ち)
- 他社.{0,5}(落ち|審査)

### 時間・即日関連
- (最短)?即日(審査|発行|利用)
- 最短\d+分
- (今|当日|即).{0,3}(使える|発行)

### SPU関連
- SPU.{0,5}\d+倍
- 楽天市場.{0,5}\d+倍
- ポイント\d+倍以上

### 収入・属性関連
- 専業主婦.{0,5}(作れる|申込|OK)
- 収入.{0,5}(ない|なし|0).{0,5}(でも|OK)
- 無職.{0,5}(でも|OK)

## 14. チェックリスト（ツール実装用）
[ ] 禁止表現①: 誤情報がないか
[ ] 禁止表現②: 不利益訴求がないか
[ ] 禁止表現③: 審査の甘さを示唆する表現がないか
[ ] 禁止表現④: 収入のない方を狙う表現がないか
[ ] 禁止表現⑤: 即日審査・即日発行表現がないか
[ ] 禁止表現⑥: 有利誤認表現がないか
[ ] NGワード: 審査甘い、審査緩い、柔軟などがないか
[ ] NGワード: 最短○分、即日発行などがないか
[ ] NGワード: 専業主婦、無職、収入なしなどがないか
[ ] SPU表現: SPU倍率の具体的表記がないか
[ ] 会社情報: 正確な社名・住所・電話番号が記載されているか
[ ] 申込資格: 「高校生を除く18歳以上」が明記されているか
[ ] 公式URL: https://www.rakuten-card.co.jp/ へのリンクがあるか
[ ] カード名: 正式名称が使用されているか
[ ] 期間限定: 「今なら」などの表現がないか

## 15. 代替表現一覧（自動修正用）
審査甘い → 申込条件を満たす方が申込可能
審査に通りやすい → 年会費永年無料
審査に不安がある方 → 高校生を除く18歳以上の方
最短即日審査 → デジタルカード対応
最短10分 → 審査結果はメールでお知らせ
即日発行可能 → 発行スピード重視
SPU+1倍 → 楽天のサービス活用でお得
楽天市場で3倍 → 楽天市場でポイント還元率アップ
専業主婦でも作れる → パート・アルバイトでも申込可能
収入がなくても → 高校生を除く18歳以上の方が申込可能

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

    // APIキーをチェック
    if (!state.apiKey) {
      errorDiv.classList.remove('hidden')
      errorMessage.textContent = 'OpenAI APIキーが設定されていません。設定タブで設定してください。'
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-magic mr-2"></i>修正を実行'
      return
    }

    const response = await axios.post('/api/correct-text', {
      text: inputText,
      guidelines: guidelines,
      apiKey: state.apiKey
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

    // APIキーをチェック
    if (!state.apiKey) {
      errorDiv.classList.remove('hidden')
      errorMessage.textContent = 'OpenAI APIキーが設定されていません。設定タブで設定してください。'
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-magic mr-2"></i>修正を実行'
      return
    }

    const response = await axios.post('/api/correct-html', {
      html: inputHtml,
      guidelines: guidelines,
      apiKey: state.apiKey
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

// 設定を保存
function saveSettings() {
  const apiKey = document.getElementById('apiKeyInput').value.trim()
  const successDiv = document.getElementById('settingsSuccess')
  const errorDiv = document.getElementById('settingsError')
  const errorMessage = document.getElementById('settingsErrorMessage')
  
  // エラー・成功メッセージをリセット
  successDiv.classList.add('hidden')
  errorDiv.classList.add('hidden')
  
  // APIキーの検証
  if (apiKey && !apiKey.startsWith('sk-')) {
    errorDiv.classList.remove('hidden')
    errorMessage.textContent = 'OpenAI APIキーは "sk-" で始まる必要があります'
    return
  }
  
  // LocalStorageに保存
  if (apiKey) {
    localStorage.setItem('openai_api_key', apiKey)
    state.apiKey = apiKey
  } else {
    localStorage.removeItem('openai_api_key')
    state.apiKey = ''
  }
  
  // 成功メッセージを表示
  successDiv.classList.remove('hidden')
  setTimeout(() => {
    successDiv.classList.add('hidden')
  }, 3000)
}

// APIキーの表示/非表示を切り替え
function toggleApiKeyVisibility() {
  const input = document.getElementById('apiKeyInput')
  const icon = document.getElementById('apiKeyToggleIcon')
  
  if (input.type === 'password') {
    input.type = 'text'
    icon.classList.remove('fa-eye')
    icon.classList.add('fa-eye-slash')
  } else {
    input.type = 'password'
    icon.classList.remove('fa-eye-slash')
    icon.classList.add('fa-eye')
  }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
  loadGuidelines()
  init()
})
