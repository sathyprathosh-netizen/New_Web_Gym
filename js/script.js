/* ============================================================
   APEX GYM — Global JavaScript
   ============================================================ */

/* ============================================================
   PAGE TRANSITION
   ============================================================ */
(function () {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Animate out on load
  window.addEventListener('load', () => {
    setTimeout(() => overlay.classList.add('exit'), 50);
  });

  // Animate in on link click
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || link.target === '_blank') return;
    e.preventDefault();
    overlay.classList.remove('exit');
    overlay.classList.add('enter');
    setTimeout(() => { window.location.href = href; }, 600);
  });
})();

/* ============================================================
   NAVIGATION
   ============================================================ */
(function () {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ============================================================
   APEX MOTION ENGINE (Unified Reveal System)
   ============================================================ */
(function () {
  // 1. Initial Preparations
  function initWordReveals() {
    const targets = document.querySelectorAll('.testimonial-text');
    targets.forEach(el => {
      const text = el.textContent.trim();
      const words = text.split(' ');
      el.innerHTML = words.map(word => `<span class="word-reveal-word">${word}</span>`).join(' ');
    });
  }

  function triggerWordReveal(el) {
    const words = el.querySelectorAll('.word-reveal-word');
    words.forEach((word, i) => {
      setTimeout(() => {
        word.classList.add('revealed');
      }, i * 40);
    });
  }

  // Run initial setup
  initWordReveals();

  // 2. The Engine
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);

        setTimeout(() => {
          el.classList.add('revealed');

          // Trigger nested animations
          const textTarget = el.querySelector('.testimonial-text');
          if (textTarget) triggerWordReveal(textTarget);
        }, delay);

        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // 3. Kickstart
  document.querySelectorAll('[data-reveal], .mask-reveal').forEach(el => revealObserver.observe(el));
})();

/* ============================================================
   PARALLAX / SCROLL HERO COMPRESSION
   ============================================================ */
(function () {
  const hero = document.querySelector('.home-hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const shape = hero.querySelector('.hero-shape-inner');
    if (shape) shape.style.transform = `translateY(${y * 0.22}px)`;
  }, { passive: true });
})();

/* ============================================================
   TILT EFFECT ON CARDS
   ============================================================ */
(function () {
  document.querySelectorAll('.tilt-wrap').forEach(card => {
    const inner = card.querySelector('.tilt-inner') || card;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
    });
  });
})();

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const startVal = 0;
  const formatter = new Intl.NumberFormat('en-US');

  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Snappier cinematic easing (Quintic)
    const eased = 1 - Math.pow(1 - progress, 5);

    const current = Math.round(startVal + (target - startVal) * eased);

    // Apply comma formatting for large numbers
    el.textContent = formatter.format(current);

    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

(function () {
  const statEls = document.querySelectorAll('[data-count]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.dataset.count);

        // SYNC WITH REVEAL: Check if there's a parent with a reveal delay
        const revealParent = el.closest('[data-reveal]');
        const delay = revealParent ? parseInt(revealParent.dataset.delay || 0) : 0;

        setTimeout(() => {
          animateCounter(el, targetValue);
        }, delay);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.01 }); /* Max sensitivity for immediate triggers */

  statEls.forEach(el => observer.observe(el));
})();

/* ============================================================
   PRICING TOGGLE
   ============================================================ */
(function () {
  const toggle = document.querySelector('.toggle-switch');
  if (!toggle) return;

  let isAnnual = false;

  const prices = {
    monthly: { starter: '29', pro: '59', elite: '99' },
    annual: { starter: '23', pro: '47', elite: '79' }
  };

  function updatePrices(mode) {
    const p = prices[mode];
    const cards = document.querySelectorAll('.plan-card');
    const keys = ['starter', 'pro', 'elite'];
    cards.forEach((card, i) => {
      const priceEl = card.querySelector('.plan-price-num');
      if (priceEl) {
        priceEl.textContent = p[keys[i]];
      }
    });
  }

  toggle.addEventListener('click', () => {
    isAnnual = !isAnnual;
    toggle.classList.toggle('annual', isAnnual);
    updatePrices(isAnnual ? 'annual' : 'monthly');
  });
})();

/* ============================================================
   GALLERY FILTER
   ============================================================ */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.opacity = show ? '1' : '0.15';
        item.style.transform = show ? 'scale(1)' : 'scale(0.95)';
        item.style.transition = 'opacity 0.4s, transform 0.4s';
      });
    });
  });
})();

/* ============================================================
   LIGHTBOX
   ============================================================ */
(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightbox.classList.add('open');
      document.body.classList.add('no-scroll');
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }
})();

/* ============================================================
   BEFORE / AFTER SLIDER
   ============================================================ */
(function () {
  const wrap = document.querySelector('.ba-slider-wrap');
  if (!wrap) return;

  const handle = wrap.querySelector('.ba-handle');
  const after = wrap.querySelector('.ba-after');
  let dragging = false;

  function setPosition(x) {
    const rect = wrap.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    handle.style.left = pct + '%';
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  }

  handle.addEventListener('mousedown', () => dragging = true);
  document.addEventListener('mouseup', () => dragging = false);
  document.addEventListener('mousemove', (e) => { if (dragging) setPosition(e.clientX); });

  handle.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });
  document.addEventListener('touchend', () => dragging = false);
  document.addEventListener('touchmove', (e) => {
    if (dragging) setPosition(e.touches[0].clientX);
  }, { passive: true });
})();

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = form.querySelector('.form-submit-btn');

  function validate(input) {
    const group = input.closest('.form-group');
    const err = group.querySelector('.form-error');
    const val = input.value.trim();
    let msg = '';

    if (input.required && !val) msg = 'This field is required.';
    else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Enter a valid email address.';
    else if (input.type === 'tel' && val && !/^\+?[\d\s\-().]{7,}$/.test(val)) msg = 'Enter a valid phone number.';

    group.classList.toggle('error', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', () => validate(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-group').classList.contains('error')) validate(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(input => {
      if (!validate(input)) valid = false;
    });
    if (!valid) return;

    // Loading state
    const origText = btn.innerHTML;
    btn.innerHTML = '<span class="btn-spinner"></span> Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = origText;
      btn.disabled = false;
      form.reset();
      const success = form.querySelector('.form-success');
      if (success) { success.style.display = 'block'; setTimeout(() => success.style.display = 'none', 4000); }
    }, 1800);
  });
})();

/* ============================================================
   JOIN FORM VALIDATION
   ============================================================ */
(function () {
  const form = document.getElementById('join-form');
  if (!form) return;

  const btn = form.querySelector('.form-submit-btn');

  function validate(input) {
    const group = input.closest('.form-group');
    const err = group ? group.querySelector('.form-error') : null;
    const val = input.value.trim();
    let msg = '';
    if (input.required && !val) msg = 'Required.';
    else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Invalid email.';
    if (group) group.classList.toggle('error', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }

  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('blur', () => validate(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(input => { if (!validate(input)) valid = false; });
    if (!valid) return;

    const origText = btn.innerHTML;
    btn.innerHTML = 'Processing… ⚡';
    btn.disabled = true;
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  });
})();

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
(function () {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  if (!daysEl) return;

  // Target: 7 days from now
  const target = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) return;

    const d = pad(Math.floor(diff / 86400000));
    const h = pad(Math.floor((diff % 86400000) / 3600000));
    const m = pad(Math.floor((diff % 3600000) / 60000));
    const s = pad(Math.floor((diff % 60000) / 1000));

    updateWithTick(daysEl, d);
    updateWithTick(hoursEl, h);
    updateWithTick(minsEl, m);
    updateWithTick(secsEl, s);
  }

  function updateWithTick(el, val) {
    if (el.textContent !== val) {
      el.classList.remove('tick');
      void el.offsetWidth; // Trigger reflow
      el.textContent = val;
      el.classList.add('tick');
    }
  }

  tick(); setInterval(tick, 1000);
})();

/* ============================================================
   MAGNETIC BUTTON EFFECT
   ============================================================ */
(function () {
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ============================================================
   ANIMATED NUMBER STAT (CSS counter-driven fallback)
   ============================================================ */
(function () {
  // Stagger entrance for trainer / program cards
  const cards = document.querySelectorAll('.trainer-card, .program-card, .plan-card, .why-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i * 0.08) + 's';
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.dataset.reveal = c.dataset.reveal || 'up';
    observer.observe(c);
  });
})();
