(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canScrub = window.gsap && window.ScrollTrigger && !prefersReduced;

  if (!canScrub) {
    document.documentElement.classList.add("no-scrub");
    document.querySelectorAll(".bg-video").forEach((v) => v.play().catch(() => {}));
  }

  if (canScrub) {
    gsap.registerPlugin(ScrollTrigger);

    // --- Lenis smooth scroll, driven by GSAP ticker ---
    if (window.Lenis) {
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    initHeroScrub();
    initKineticTitle();
    initPillars();
  }

  initValuesStrip();
  initWorkCards();

  // ================= HERO CANVAS FRAME SCRUB =================
  function initHeroScrub() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const FRAME_COUNT = 97;
    const FRAME_PATH = (i) => `video/frames/hero/frame-${String(i).padStart(4, "0")}.jpg`;

    const images = new Array(FRAME_COUNT);
    let loadedCount = 0;
    let ready = false;

    const seq = { frame: 0 };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    }

    function render() {
      const img = images[Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(seq.frame)))];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width, ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw, dh, dx, dy;
      if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
      else { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (i === 0) render();
        if (loadedCount === FRAME_COUNT) ready = true;
      };
      img.src = FRAME_PATH(i + 1);
      images[i] = img;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    ScrollTrigger.create({
      trigger: ".hero-pin-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        seq.frame = self.progress * (FRAME_COUNT - 1);
        render();
      },
    });
  }

  // ================= KINETIC TITLE =================
  function initKineticTitle() {
    const words = document.querySelectorAll(".kinetic-title .word");
    if (!words.length) return;

    gsap.set(words, { yPercent: 110, opacity: 0 });
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.2,
    });

    gsap.to(".hero-content", {
      opacity: 0,
      scale: 0.92,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-pin-track",
        start: "top top",
        end: "35% top",
        scrub: 0.5,
      },
    });
  }

  // ================= THREE PILLARS REVEAL =================
  function initPillars() {
    const pillars = gsap.utils.toArray(".pillar");
    if (!pillars.length) return;

    gsap.set(pillars, { opacity: 0, y: 24 });
    gsap.set(pillars[0], { opacity: 1, y: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".pillars-pin-track",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      },
    });

    pillars.forEach((pillar, i) => {
      if (i === 0) return;
      tl.to(pillars[i - 1], { opacity: 0, y: -24, duration: 0.3 }, i - 0.5)
        .to(pillar, { opacity: 1, y: 0, duration: 0.3 }, i - 0.5);
    });
  }

  // ================= VALUES STRIP =================
  function initValuesStrip() {
    const items = document.querySelectorAll(".values-list li");
    if (!items.length) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.from(items, {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.08,
        ease: "power1.out",
        scrollTrigger: { trigger: ".values-strip", start: "top 85%" },
      });
    }
  }

  // ================= WORK CARDS =================
  function initWorkCards() {
    const cards = document.querySelectorAll(".work-card");
    if (!cards.length) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.from(cards, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.12,
        ease: "power1.out",
        scrollTrigger: { trigger: ".work-grid", start: "top 85%" },
      });
    }
  }
})();
