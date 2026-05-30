/* =============================================
   hair salon LUXE — スクリプト
   ============================================= */

/* ===== DOM 取得 ===== */
const header      = document.getElementById('header');
const hamburger   = document.getElementById('hamburger');
const navOverlay  = document.getElementById('navOverlay');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

/* =============================================
   ヘッダー: スクロールで影を追加
   ============================================= */
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* =============================================
   ハンバーガーメニューの開閉
   ============================================= */
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('is-open');
  navOverlay.classList.toggle('is-open', isOpen);
  hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
});

/* オーバーレイ内のリンクをクリックしたら閉じる */
navOverlay.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('is-open');
    navOverlay.classList.remove('is-open');
    hamburger.setAttribute('aria-label', 'メニューを開く');
  });
});

/* =============================================
   スクロールフェードイン（IntersectionObserver）
   ============================================= */
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;

      /* カードが複数並ぶ場合は少しずつ遅らせて表示 */
      const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
      let delay = 0;
      siblings.forEach((sibling, i) => {
        if (sibling === entry.target) delay = i * 80;
      });

      setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, delay);

      fadeObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

/* .fade-in クラスを持つ要素を監視対象に登録 */
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* =============================================
   予約フォーム: バリデーションと送信演出
   ============================================= */

/**
 * メールアドレスの形式チェック
 * @param {string} value - 入力値
 * @returns {boolean}
 */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * フィールドのエラー状態を更新する
 * @param {HTMLElement} group - .form-group 要素
 * @param {boolean} hasError
 */
function setFieldError(group, hasError) {
  group.classList.toggle('has-error', hasError);
}

/* フォーム送信イベント */
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let isValid = true;

  /* 名前: 空チェック */
  const nameGroup = contactForm.querySelector('#name').closest('.form-group');
  const nameValue = contactForm.querySelector('#name').value.trim();
  if (!nameValue) {
    setFieldError(nameGroup, true);
    isValid = false;
  } else {
    setFieldError(nameGroup, false);
  }

  /* メール: 形式チェック */
  const emailGroup = contactForm.querySelector('#email').closest('.form-group');
  const emailValue = contactForm.querySelector('#email').value.trim();
  if (!emailValue || !isValidEmail(emailValue)) {
    setFieldError(emailGroup, true);
    isValid = false;
  } else {
    setFieldError(emailGroup, false);
  }

  /* 電話番号: 空チェック */
  const phoneGroup = contactForm.querySelector('#phone').closest('.form-group');
  const phoneValue = contactForm.querySelector('#phone').value.trim();
  if (!phoneValue) {
    setFieldError(phoneGroup, true);
    isValid = false;
  } else {
    setFieldError(phoneGroup, false);
  }

  /* 希望メニュー: 未選択チェック */
  const menuGroup = contactForm.querySelector('#menu-select').closest('.form-group');
  const menuValue = contactForm.querySelector('#menu-select').value;
  if (!menuValue) {
    setFieldError(menuGroup, true);
    isValid = false;
  } else {
    setFieldError(menuGroup, false);
  }

  /* 第1希望日時: 空チェック */
  const date1Group = contactForm.querySelector('#date1').closest('.form-group');
  const date1Value = contactForm.querySelector('#date1').value;
  if (!date1Value) {
    setFieldError(date1Group, true);
    isValid = false;
  } else {
    setFieldError(date1Group, false);
  }

  /* エラーがあれば最初のエラー項目へフォーカス */
  if (!isValid) {
    const firstError = contactForm.querySelector('.has-error input, .has-error select');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  /* バリデーション通過: 送信完了演出 */
  contactForm.style.transition = 'opacity 0.4s ease';
  contactForm.style.opacity = '0';

  setTimeout(() => {
    contactForm.style.display = 'none';
    formSuccess.classList.add('is-visible');
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 400);
});

/* リアルタイムバリデーション: フィールドが変更されたらエラーを解除 */
contactForm.querySelectorAll('input, select').forEach(field => {
  field.addEventListener('input', () => {
    const group = field.closest('.form-group');
    if (group && group.classList.contains('has-error') && field.value.trim()) {
      setFieldError(group, false);
    }
  });
});
