/* =============================================
   ヘッダー：スクロールで背景表示
   ============================================= */
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
}, { passive: true });

/* =============================================
   ハンバーガーメニュー（SP用）
   ============================================= */
const menuBtn = document.getElementById('menuBtn');
const nav     = document.getElementById('nav');

menuBtn.addEventListener('click', () => {
  const isOpen = menuBtn.classList.toggle('is-open');
  nav.classList.toggle('is-open', isOpen);
  // メニューオープン中はページスクロールを禁止
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// ナビリンクをタップしたらメニューを閉じる
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('is-open');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  });
});

/* =============================================
   フェードインアニメーション（Intersection Observer）
   ============================================= */
const fadeTargets = document.querySelectorAll([
  '.section-header',
  '.about__image',
  '.about__content',
  '.menu__card',
  '.gallery__item',
  '.staff__card',
  '.access__inner',
  '.contact__form-block',
].join(', '));

// 対象要素にフェードインクラスを付与
fadeTargets.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeTargets.forEach(el => fadeObserver.observe(el));

/* =============================================
   ギャラリー・ライトボックス
   ============================================= */
const galleryItems  = document.querySelectorAll('.gallery__item');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

let currentIndex = 0;

// ギャラリー画像の src と alt をまとめて取得
const galleryImages = Array.from(galleryItems).map(item => ({
  src: item.querySelector('img').src,
  alt: item.querySelector('img').alt,
}));

// 指定インデックスの画像をライトボックスに表示
function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = galleryImages[index].src;
  lightboxImg.alt = galleryImages[index].alt;
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

// ライトボックスを閉じる
function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

// 前の画像へ（先頭なら末尾に戻る）
function showPrev() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].src;
  lightboxImg.alt = galleryImages[currentIndex].alt;
}

// 次の画像へ（末尾なら先頭に戻る）
function showNext() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[currentIndex].src;
  lightboxImg.alt = galleryImages[currentIndex].alt;
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);

// オーバーレイ部分をクリックしても閉じる
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// キーボード操作対応
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showPrev();
  if (e.key === 'ArrowRight')  showNext();
});

/* =============================================
   予約フォームのバリデーション
   ============================================= */
const bookingForm = document.getElementById('bookingForm');

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (validateBookingForm()) {
    document.getElementById('bookingNotice').textContent =
      'ありがとうございます。内容を確認後、担当者よりご連絡いたします。';
    bookingForm.reset();
  }
});

function validateBookingForm() {
  let isValid = true;

  // 名前
  isValid = checkRequired(
    document.getElementById('bookingName'),
    document.getElementById('bookingNameError'),
    'お名前を入力してください。'
  ) && isValid;

  // 電話番号
  const tel = document.getElementById('bookingTel');
  const telError = document.getElementById('bookingTelError');
  if (!tel.value.trim()) {
    setError(tel, telError, '電話番号を入力してください。');
    isValid = false;
  } else if (!/^[0-9\-\+\s]{10,15}$/.test(tel.value.trim())) {
    setError(tel, telError, '正しい電話番号を入力してください。');
    isValid = false;
  } else {
    clearError(tel, telError);
  }

  // 希望日時
  isValid = checkRequired(
    document.getElementById('bookingDate'),
    document.getElementById('bookingDateError'),
    'ご希望日時を選択してください。'
  ) && isValid;

  // メニュー
  isValid = checkRequired(
    document.getElementById('bookingMenu'),
    document.getElementById('bookingMenuError'),
    'ご希望メニューを選択してください。'
  ) && isValid;

  return isValid;
}

/* =============================================
   お問い合わせフォームのバリデーション
   ============================================= */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (validateContactForm()) {
    document.getElementById('contactNotice').textContent =
      'お問い合わせを受け付けました。担当者よりご連絡いたします。';
    contactForm.reset();
  }
});

function validateContactForm() {
  let isValid = true;

  // 名前
  isValid = checkRequired(
    document.getElementById('contactName'),
    document.getElementById('contactNameError'),
    'お名前を入力してください。'
  ) && isValid;

  // メールアドレス
  const email = document.getElementById('contactEmail');
  const emailError = document.getElementById('contactEmailError');
  if (!email.value.trim()) {
    setError(email, emailError, 'メールアドレスを入力してください。');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    setError(email, emailError, '正しいメールアドレスを入力してください。');
    isValid = false;
  } else {
    clearError(email, emailError);
  }

  // お問い合わせ内容
  isValid = checkRequired(
    document.getElementById('contactMessage'),
    document.getElementById('contactMessageError'),
    'お問い合わせ内容を入力してください。'
  ) && isValid;

  return isValid;
}

/* =============================================
   バリデーションのユーティリティ関数
   ============================================= */

// 必須チェック（空の場合エラーを表示）
function checkRequired(field, errorEl, message) {
  if (!field.value.trim()) {
    setError(field, errorEl, message);
    return false;
  }
  clearError(field, errorEl);
  return true;
}

// エラー状態をセット
function setError(field, errorEl, message) {
  errorEl.textContent = message;
  field.classList.add('is-error');
}

// エラー状態をクリア
function clearError(field, errorEl) {
  errorEl.textContent = '';
  field.classList.remove('is-error');
}
