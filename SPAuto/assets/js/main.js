/* S. P. Enterprises — site interactions (vanilla JS, no framework) */
(function () {
  "use strict";

  const WHATSAPP_NUMBER = "918308502100";
  const EMAIL = "spe@sahpl.com";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.documentElement.classList.remove("no-js");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Sticky header state + back-to-top progress ---------- */
  const header = $("#siteHeader");
  const backToTop = $("#backToTop");
  const ring = $("#progressRing");
  const ringLength = 2 * Math.PI * 24;
  ring.style.strokeDasharray = ringLength;
  ring.style.strokeDashoffset = ringLength;

  let ticking = false;
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const menuOpen = $("#offcanvasNav").classList.contains("show");
    header.classList.toggle("is-scrolled", y > 20);
    // hide header when scrolling down past the hero, bring it back on scroll up
    if (Math.abs(y - lastY) > 6) {
      header.classList.toggle("is-hidden", y > lastY && y > 400 && !menuOpen && !header.contains(document.activeElement));
      lastY = y;
    }
    backToTop.classList.toggle("is-visible", y > 500);
    ring.style.strokeDashoffset = ringLength * (1 - (max > 0 ? y / max : 0));
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    $(".skip-link").focus({ preventScroll: true });
  });

  /* ---------- Close off-canvas menu when a link is chosen ---------- */
  $$("#offcanvasNav a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      const el = $("#offcanvasNav");
      if (window.bootstrap && el.classList.contains("show")) {
        bootstrap.Offcanvas.getOrCreateInstance(el).hide();
      }
    });
  });

  /* ---------- Desktop nav: sliding pill indicator ---------- */
  const track = $("#mainNav");
  const indicator = $(".nav-indicator", track);
  const desktop = window.matchMedia("(min-width: 1200px)");

  function moveIndicator(link) {
    if (!desktop.matches || !link) {
      indicator.classList.remove("is-ready");
      return;
    }
    indicator.style.width = link.offsetWidth + "px";
    indicator.style.transform = "translateX(" + link.offsetLeft + "px)";
    indicator.classList.add("is-ready");
  }
  const activeLink = () => $(".nav-link.active", track);

  $$(".nav-link", track).forEach((link) => {
    link.addEventListener("mouseenter", () => moveIndicator(link));
    link.addEventListener("focus", () => moveIndicator(link));
  });
  track.addEventListener("mouseleave", () => moveIndicator(activeLink()));
  window.addEventListener("activate.bs.scrollspy", () => moveIndicator(activeLink()));
  window.addEventListener("resize", () => moveIndicator(activeLink()));
  document.fonts && document.fonts.ready.then(() => moveIndicator(activeLink()));

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Count-up metrics ---------- */
  const counters = $$("[data-count]");
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    counters.forEach((el) => { el.textContent = "0"; });
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Hero controller: live-looking PV value ---------- */
  const pv = $("#pvValue");
  if (pv && !reduceMotion.matches) {
    let value = 236.0;
    setInterval(() => {
      value += (250 - value) * 0.18 + (Math.random() - 0.5) * 0.8;
      pv.textContent = value.toFixed(1);
    }, 900);
  }

  /* ---------- Product filter chips ---------- */
  const chips = $$("[data-filter]");
  const cols = $$("#productGrid > [data-group]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      cols.forEach((col) => {
        const show = f === "all" || col.dataset.group === f;
        col.classList.toggle("d-none", !show);
        col.classList.remove("offset-xl-4");
        if (show) {
          const card = $(".product-card", col);
          card.classList.remove("is-visible");
          requestAnimationFrame(() => card.classList.add("is-visible"));
        }
      });
      // keep the lone 10th card centred only in the full grid
      if (f === "all") cols[cols.length - 1].classList.add("offset-xl-4");
    });
  });

  /* ---------- Selected-product synchronisation ---------- */
  const cards = $$(".product-card");
  const select = $("#fProduct");
  const selectionText = $("#selectionText");
  const selectionLive = $("#selectionLive");
  const pill = $("#selectedPill");
  const pillText = $("#selectedPillText");
  const EMPTY = selectionText.textContent;

  function setSelection(name, { announce = true } = {}) {
    cards.forEach((card) => {
      const on = card.dataset.product === name;
      card.classList.toggle("is-selected", on);
      card.setAttribute("aria-pressed", String(on));
    });

    const hasOption = name && $$("option", select).some((o) => o.value === name);
    select.value = hasOption ? name : "";
    selectionText.textContent = name || EMPTY;
    pillText.textContent = name ? "Selected: " + name : "";
    pill.classList.toggle("is-visible", Boolean(name));
    if (announce) selectionLive.textContent = name ? name + " selected" : "Selection cleared";
  }

  cards.forEach((card) => {
    const toggle = () => {
      const name = card.dataset.product;
      setSelection(card.classList.contains("is-selected") ? "" : name);
    };
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-brand-tab]")) return; // handled below
      if (e.target.closest("[data-enquire]")) {
        setSelection(card.dataset.product);
        return; // let the link scroll to #contact
      }
      toggle();
    });
    card.addEventListener("keydown", (e) => {
      if (e.target !== card) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  select.addEventListener("change", () => setSelection(select.value));
  $("#clearSelection").addEventListener("click", () => { setSelection(""); select.focus(); });

  $$("[data-pick]").forEach((link) => {
    link.addEventListener("click", () => {
      $("[data-filter='all']").click();
      setSelection(link.dataset.pick);
    });
  });

  /* ---------- Brands: open a tab from category cards, enquire per brand ---------- */
  function showBrand(id) {
    const tab = $("#tab-" + id);
    if (!tab || !window.bootstrap) return;
    bootstrap.Tab.getOrCreateInstance(tab).show();
  }

  $$("[data-brand-tab]").forEach((link) => {
    link.addEventListener("click", () => showBrand(link.dataset.brandTab));
  });

  // keep the active tab visible in the horizontal strip on small screens
  // (horizontal scroll only, so it never fights the page's anchor scroll)
  $$(".brand-tab").forEach((tab) => {
    tab.addEventListener("shown.bs.tab", () => {
      const strip = tab.parentElement;
      if (strip.scrollWidth <= strip.clientWidth) return;
      const left = strip.scrollLeft + tab.getBoundingClientRect().left - strip.getBoundingClientRect().left - 12;
      strip.scrollTo({ left, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  });

  const message = $("#fMsg");
  $$("[data-brand-enquire]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSelection(btn.dataset.category);
      const prefix = "Interested in " + btn.dataset.brand + " products: ";
      if (!message.value.trim() || message.value.startsWith("Interested in ")) message.value = prefix;
    });
  });

  /* ---------- Enquiry form: validation + send ---------- */
  const form = $("#enquiryForm");
  const status = $("#formStatus");
  const statusText = $("#formStatusText");

  $$("input, select, textarea", form).forEach((field) => {
    field.addEventListener("input", () => {
      if (form.classList.contains("was-validated")) field.checkValidity();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.remove("is-visible");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      const firstInvalid = $(":invalid", form);
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const d = new FormData(form);
    const lines = [
      "New enquiry from website",
      "Name: " + d.get("name"),
      d.get("company") ? "Company: " + d.get("company") : "",
      "Mobile: " + d.get("phone"),
      "Email: " + d.get("email"),
      "Category: " + d.get("product"),
      d.get("qty") ? "Quantity: " + d.get("qty") : "",
      "Requirement: " + d.get("message"),
    ].filter(Boolean);
    const body = lines.join("\n");

    if (d.get("channel") === "email") {
      const subject = "Enquiry: " + d.get("product");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      statusText.textContent = "Your email app has opened with the enquiry. Please press send.";
    } else {
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(body), "_blank", "noopener");
      statusText.textContent = "WhatsApp has opened with your enquiry. Please press send.";
    }

    status.classList.add("is-visible");
    form.reset();
    form.classList.remove("was-validated");
    setSelection("", { announce: false });
  });

  /* ---------- Button ripple micro-interaction ---------- */
  if (!reduceMotion.matches) {
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const r = document.createElement("span");
      r.className = "ripple";
      r.style.width = r.style.height = size + "px";
      r.style.left = e.clientX - rect.left - size / 2 + "px";
      r.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
    });
  }
})();
