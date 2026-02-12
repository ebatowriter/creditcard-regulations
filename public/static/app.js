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
          <i class="fas fa-credit-card mr-2 text-indigo-600"></i>JCBカード ガイドライン
        </label>
        <textarea 
          id="guidelineJcb" 
          rows="6" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="JCBカードに関するガイドラインとレギュレーションを入力してください..."
        >${state.guidelines.jcb}</textarea>
      </div>

      <!-- ACマスターカードガイドライン -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-credit-card mr-2 text-red-600"></i>ACマスターカード ガイドライン
        </label>
        <textarea 
          id="guidelineAcMaster" 
          rows="6" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="ACマスターカードに関するガイドラインとレギュレーションを入力してください..."
        >${state.guidelines.acMaster}</textarea>
      </div>

      <!-- 楽天カードガイドライン -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-credit-card mr-2 text-pink-600"></i>楽天カード ガイドライン
        </label>
        <textarea 
          id="guidelineRakuten" 
          rows="6" 
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
  }
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
