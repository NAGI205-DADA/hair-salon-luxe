// ========================================
// ヘッダー：スクロール時にスタイルを切り替える
// ========================================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
}, { passive: true });

// ========================================
// ハンバーガーメニュー：ナビリンクをクリックで閉じる
// ========================================
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.checked = false;
  });
});

// ========================================
// フェードインアニメーション
// ========================================
const fadeTargets = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

fadeTargets.forEach(el => fadeObserver.observe(el));

// ========================================
// 予約フォーム：バリデーション & 送信処理
// ========================================
const reservationForm = document.getElementById('reservation-form');
const formSuccess     = document.getElementById('form-success');

if (reservationForm && formSuccess) {

  // ── バリデーションルール定義 ──────────────────────────────
  const rules = [
    {
      groupId:  'group-name',
      inputId:  'name',
      errorId:  'error-name',
      validate: (v) => v.trim() !== '',
      message:  'お名前を入力してください。',
    },
    {
      groupId:  'group-email',
      inputId:  'email',
      errorId:  'error-email',
      validate: (v) => {
        if (v.trim() === '') return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
      },
      /* メールは空と形式不正で文言を変える */
      messageOf: (v) =>
        v.trim() === ''
          ? 'メールアドレスを入力してください。'
          : '正しいメールアドレスを入力してください。',
    },
    {
      groupId:  'group-menu',
      inputId:  'menu-select',
      errorId:  'error-menu',
      validate: (v) => v !== '',
      message:  '希望メニューを選択してください。',
    },
  ];

  // ── エラーを表示する ────────────────────────────────────
  function showError(rule, value) {
    const group = document.getElementById(rule.groupId);
    const span  = document.getElementById(rule.errorId);
    if (!group || !span) return;

    group.classList.add('has-error');
    span.textContent = rule.messageOf ? rule.messageOf(value) : rule.message;
  }

  // ── エラーをクリアする ──────────────────────────────────
  function clearError(rule) {
    const group = document.getElementById(rule.groupId);
    const span  = document.getElementById(rule.errorId);
    if (!group || !span) return;

    group.classList.remove('has-error');
    span.textContent = '';
  }

  // ── フォーム全体を検証し、失敗した件数を返す ─────────────
  function validateAll() {
    let errorCount = 0;

    rules.forEach(rule => {
      const input = document.getElementById(rule.inputId);
      if (!input) return;

      if (rule.validate(input.value)) {
        clearError(rule);
      } else {
        showError(rule, input.value);
        errorCount++;
      }
    });

    return errorCount;
  }

  // ── 各フィールドの入力中にリアルタイムでエラーをクリア ──
  rules.forEach(rule => {
    const input = document.getElementById(rule.inputId);
    if (!input) return;

    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';

    input.addEventListener(eventType, () => {
      // 入力が正しくなった時点でエラーを消す
      if (rule.validate(input.value)) {
        clearError(rule);
      }
    });
  });

  // ── 送信ハンドラ ────────────────────────────────────────
  reservationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const errorCount = validateAll();

    if (errorCount > 0) {
      // 最初のエラーフィールドへスクロール
      const firstError = reservationForm.querySelector('.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // バリデーション通過 → フォームを隠してサンクスメッセージを表示
    reservationForm.hidden = true;
    formSuccess.hidden     = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
