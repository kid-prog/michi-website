(() => {
  'use strict';

  const header = document.querySelector('.header');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const stickyCta = document.querySelector('.sticky-cta');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- ヘッダー背景・スマホ固定CTA ----
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (stickyCta) stickyCta.classList.toggle('is-visible', y > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- ハンバーガーメニュー ----
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  menuBtn.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  // ---- スクロールで表示 ----
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // ---- ヒーロー背景動画（YouTube・ミュート・ループ） ----
  // 回線の遅い端末・省データ設定・動きを減らす設定では静止画のまま
  const heroVideo = document.getElementById('heroVideo');
  const conn = navigator.connection || {};
  const lightMode = reduceMotion || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  // 実際に再生が始まってから表示する（自動再生が止められた端末では静止画のまま）
  if (heroVideo && !lightMode) {
    const id = heroVideo.dataset.video;
    const holder = document.createElement('div');
    heroVideo.appendChild(holder);
    window.onYouTubeIframeAPIReady = () => {
      new YT.Player(holder, {
        host: 'https://www.youtube-nocookie.com',
        videoId: id,
        playerVars: { autoplay: 1, mute: 1, loop: 1, playlist: id, controls: 0, playsinline: 1, rel: 0, modestbranding: 1, disablekb: 1, iv_load_policy: 3 },
        events: {
          onReady: (e) => { e.target.mute(); e.target.playVideo(); const f = e.target.getIframe(); f.tabIndex = -1; f.title = '背景動画'; },
          onStateChange: (e) => {
            // YouTubeのタイトル表示が消えるまで少し待ってから見せる
            if (e.data === YT.PlayerState.PLAYING) setTimeout(() => heroVideo.classList.add('is-ready'), 1200);
          },
        },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  }

  // ---- 施工事例の動画モーダル ----
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('modalFrame');
  let lastFocus = null;
  const openModal = (id) => {
    lastFocus = document.activeElement;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="施工事例の動画"></iframe>`;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  };
  const closeModal = () => {
    modal.hidden = true;
    frame.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  document.querySelectorAll('.work[data-video]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.video));
  });
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      else if (nav.classList.contains('is-open')) closeMenu();
    }
  });

  // ---- お問い合わせフォーム ----
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status';
      let valid = true;
      form.querySelectorAll('[required]').forEach((el) => {
        const ok = el.value.trim() !== '';
        el.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      const email = form.querySelector('[name="email"]');
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('is-invalid'); valid = false;
      }
      if (!valid) {
        status.textContent = '未入力または正しくない項目があります。';
        status.classList.add('is-error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.textContent = '送信中です…';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.message || 'error');
        form.reset();
        status.textContent = 'お問い合わせを受け付けました。担当者よりご連絡いたします。';
        status.classList.add('is-ok');
      } catch (err) {
        status.innerHTML = '送信できませんでした。お手数ですがお電話（<a href="tel:0667365522">06-6736-5522</a>）でご連絡ください。';
        status.classList.add('is-error');
      } finally {
        btn.disabled = false;
      }
    });
    form.querySelectorAll('input, textarea').forEach((el) => {
      el.addEventListener('input', () => el.classList.remove('is-invalid'));
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
