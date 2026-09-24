/* KK Multi Services — interactions (vanilla JS, no dependencies beyond Bootstrap) */
(() => {
  'use strict';

  document.documentElement.classList.remove('no-js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WHATSAPP_NUMBER = '917276748645';

  /* ---------- Header state, progress bar, back-to-top ---------- */
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const backTop = $('#backTop');

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    backTop.classList.toggle('show', y > 600);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* Close mobile off-canvas after choosing a link */
  const navEl = $('#siteNav');
  $$('#siteNav a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    const oc = window.bootstrap && bootstrap.Offcanvas.getInstance(navEl);
    if (oc) oc.hide();
  }));

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* Process line draw */
  const processList = $('#processList');
  if (processList) {
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { processList.classList.add('is-drawn'); obs.disconnect(); }
    }, { threshold: 0.4 }).observe(processList);
  }

  /* ---------- Animated counters ---------- */
  const fmt = new Intl.NumberFormat('en-IN');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const render = v => (decimals ? v.toFixed(decimals) : fmt.format(Math.round(v))) + suffix;
    if (reduceMotion) { el.textContent = render(target); return; }
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = render(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCount(e.target);
      counterIO.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => counterIO.observe(el));

  /* ---------- Hero slider: no autoplay for reduced-motion users; keep active tab in view ---------- */
  const slider = $('#heroSlider');
  if (slider) {
    if (reduceMotion) slider.removeAttribute('data-bs-ride');
    slider.addEventListener('slid.bs.carousel', () => {
      const tab = $('.hero-tab-list .active', slider);
      const list = tab && tab.parentElement;
      if (list && list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  }

  /* ---------- Material ripple ---------- */
  document.addEventListener('pointerdown', (ev) => {
    const btn = ev.target.closest('.ripple');
    if (!btn || reduceMotion) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.cssText = `width:${size}px;height:${size}px;left:${ev.clientX - rect.left - size / 2}px;top:${ev.clientY - rect.top - size / 2}px`;
    btn.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });

  /* ---------- Contact form → WhatsApp ---------- */
  const form = $('#contactForm');
  const serviceSelect = $('#fService');

  /* "Book Now" on a service card preselects it in the form */
  $$('[data-service]').forEach(link => link.addEventListener('click', () => {
    const match = [...serviceSelect.options].find(o => o.text === link.dataset.service);
    if (match) serviceSelect.value = match.value;
  }));

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      form.querySelector(':invalid')?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const lines = [
      'Hello KK Multi Services, I would like to book a service.',
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Service: ${data.service}`,
      data.area && `Area: ${data.area}`,
      data.message && `Problem: ${data.message}`
    ].filter(Boolean);

    const success = $('#formSuccess');
    success.hidden = false;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    form.reset();
    form.classList.remove('was-validated');
    setTimeout(() => { success.hidden = true; }, 6000);
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
