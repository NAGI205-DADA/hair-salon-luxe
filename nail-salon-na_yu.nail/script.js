'use strict';

/* ===============================
   ハンバーガーメニューの開閉
=============================== */
const hamburger = document.getElementById('hamburger');
const gnav      = document.getElementById('gnav');

hamburger.addEventListener('click', () => {
    const isOpen = gnav.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
});

/* ナビリンクのタップでドロワーを閉じる */
gnav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        gnav.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'メニューを開く');
    });
});

/* ===============================
   タブ切り替え（メール / LINE）
=============================== */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        /* ボタンのアクティブ状態を更新 */
        tabBtns.forEach(b => {
            b.classList.remove('tab-btn--active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('tab-btn--active');
        btn.setAttribute('aria-selected', 'true');

        /* 対応するパネルを表示 */
        const targetId = btn.dataset.target;
        tabPanels.forEach(panel => {
            panel.classList.toggle('tab-panel--active', panel.id === targetId);
        });
    });
});

/* ===============================
   スクロール連動フェードインアニメーション
=============================== */
const fadeEls = document.querySelectorAll('.fade');

const fadeObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                /* 一度表示したら監視を解除 */
                fadeObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1 }
);

fadeEls.forEach(el => fadeObserver.observe(el));
