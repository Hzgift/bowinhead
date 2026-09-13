/* =========================================================
   BOWINHEAD — Interactive Experience
   ========================================================= */
(function(){
  'use strict';

  const doc = document;
  const body = doc.body;
  const isMobile = window.matchMedia('(max-width:900px)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a,b,t)=>a+(b-a)*t;

  /* ---------- 1. PRELOADER ---------- */
  const pl = doc.getElementById('preloader');
  const plNum = doc.getElementById('plCount');
  const plFill = doc.getElementById('plFill');
  let progress = 0;
  const plTarget = 100;
  const plDuration = 1600;
  const plStart = performance.now();

  function tickPreloader(now){
    const t = Math.min((now - plStart)/plDuration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    progress = Math.round(eased * plTarget);
    plNum.textContent = progress;
    plFill.style.width = progress + '%';
    if(t < 1){ requestAnimationFrame(tickPreloader); }
    else {
      setTimeout(()=>{
        pl.classList.add('done');
        body.classList.remove('loading');
        startHeroAnimations();
      }, 250);
    }
  }
  requestAnimationFrame(tickPreloader);

  /* ---------- 2. SMOOTH SCROLL (LENIS) ---------- */
  let lenis = null;
  if(!reduce && typeof Lenis !== 'undefined'){
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      infinite: false,
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // anchor smooth
    doc.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const id = a.getAttribute('href');
        if(id.length < 2) return;
        const el = doc.querySelector(id);
        if(!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -40, duration: 1.4 });
      });
    });
  }

  /* ---------- 3. GSAP + SCROLLTRIGGER ---------- */
  if(typeof gsap !== 'undefined'){
    gsap.registerPlugin(ScrollTrigger);

    // Reveal on scroll (stagger per section)
    const reveals = doc.querySelectorAll('.reveal-y');
    reveals.forEach(el=>{
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Hero title special — letter-aware reveal
    if(typeof SplitText === 'undefined'){
      // Manual: each word
      gsap.to('.reveal-word', {
        y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.09, delay: 0.15
      });
    }

    // Parallax on blobs
    const blobs = doc.querySelectorAll('.blob');
    window.addEventListener('mousemove', e=>{
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      blobs.forEach((b,i)=>{
        const s = (i+1) * 22;
        gsap.to(b, { x: x*s, y: y*s, duration: 1.6, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    // Section numbers rotate in on scroll
    gsap.utils.toArray('.section-num').forEach(n=>{
      gsap.from(n, { x: -30, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: n, start: 'top 90%', once: true }});
    });
  }

  function startHeroAnimations(){
    if(typeof gsap !== 'undefined'){
      gsap.to('.reveal-word', { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.1, delay: 0.2 });
      gsap.to('.hero-eyebrow, .hero-left, .hero-right, .hero-scroll', {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.6
      });
    } else {
      doc.querySelectorAll('.reveal-word, .reveal-y').forEach(el=>{
        el.style.transform = 'none'; el.style.opacity = 1;
      });
    }
  }

  /* ---------- 4. CURSOR ---------- */
  if(!isMobile){
    const dot = doc.getElementById('cursorDot');
    const ring = doc.getElementById('cursorRing');
    const label = doc.getElementById('cursorLabel');
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let dx = mx, dy = my, rx = mx, ry = my;

    window.addEventListener('mousemove', e=>{ mx = e.clientX; my = e.clientY; });
    window.addEventListener('mousedown', ()=> body.classList.add('cursor-down'));
    window.addEventListener('mouseup', ()=> body.classList.remove('cursor-down'));

    function loop(){
      dx = lerp(dx, mx, 0.55);
      dy = lerp(dy, my, 0.55);
      rx = lerp(rx, mx, 0.14);
      ry = lerp(ry, my, 0.14);
      dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    // Hover states
    doc.querySelectorAll('[data-cursor="hover"], a, button').forEach(el=>{
      el.addEventListener('mouseenter', ()=> body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', ()=> body.classList.remove('cursor-hover'));
    });

    // View state on portfolio
    doc.querySelectorAll('.art').forEach(el=>{
      el.addEventListener('mouseenter', ()=>{
        body.classList.add('cursor-view');
        label.textContent = 'VIEW';
      });
      el.addEventListener('mouseleave', ()=> body.classList.remove('cursor-view'));
    });
  }

  /* ---------- 5. SPOTLIGHT + PARTICLE REPEL ---------- */
  if(!isMobile){
    const spot = doc.getElementById('spotlight');
    let sx = window.innerWidth/2, sy = window.innerHeight/2;
    let tx = sx, ty = sy;
    window.addEventListener('mousemove', e=>{ tx = e.clientX; ty = e.clientY; });
    function spotLoop(){
      sx = lerp(sx, tx, 0.12); sy = lerp(sy, ty, 0.12);
      spot.style.left = sx + 'px';
      spot.style.top = sy + 'px';
      requestAnimationFrame(spotLoop);
    }
    spotLoop();
  }

  /* ---------- 6. PARTICLES ---------- */
  const canvas = doc.getElementById('particles');
  if(canvas && !reduce){
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const mouse = { x: null, y: null, r: 160 };
    window.addEventListener('mousemove', e=>{ mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', ()=>{ mouse.x = mouse.y = null; });
    window.addEventListener('resize', ()=>{
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    const COUNT = isMobile ? 40 : 90;
    const MAX_D = 140;
    const particles = [];

    function rnd(min, max){ return Math.random()*(max-min)+min; }

    class P {
      constructor(){
        this.x = rnd(0,W); this.y = rnd(0,H);
        this.vx = rnd(-0.35,0.35); this.vy = rnd(-0.35,0.35);
        this.r = rnd(0.6, 2.1);
        this.a = rnd(0.15, 0.6);
        this.c = Math.random() < 0.75 ? '245,208,0' : '255,140,26';
      }
      step(){
        if(mouse.x !== null){
          const dx = this.x - mouse.x, dy = this.y - mouse.y;
          const d = Math.hypot(dx,dy);
          if(d < mouse.r){
            const f = (1 - d/mouse.r) * 2.2;
            this.x += (dx/d) * f;
            this.y += (dy/d) * f;
          }
        }
        this.x += this.vx; this.y += this.vy;
        if(this.x < 0 || this.x > W) this.vx *= -1;
        if(this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${this.c},${this.a})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.c},.6)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    for(let i=0;i<COUNT;i++) particles.push(new P());

    function loop(){
      ctx.clearRect(0,0,W,H);
      // connect
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const a = particles[i], b = particles[j];
          const dx = a.x-b.x, dy = a.y-b.y;
          const d = Math.hypot(dx,dy);
          if(d < MAX_D){
            const o = (1 - d/MAX_D) * 0.18;
            ctx.strokeStyle = `rgba(245,208,0,${o})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      particles.forEach(p=>{ p.step(); p.draw(); });
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------- 7. TILT CARDS ---------- */
  if(!isMobile){
    doc.querySelectorAll('.art-inner.tilt').forEach(card=>{
      const parent = card.closest('.art');
      parent.addEventListener('mousemove', e=>{
        const r = parent.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${x*10}deg) rotateX(${-y*10}deg) scale(1.03)`;
        const img = card.querySelector('img');
        if(img) img.style.transform = `scale(1.15) translate(${-x*14}px, ${-y*14}px)`;
      });
      parent.addEventListener('mouseleave', ()=>{
        card.style.transform = '';
        const img = card.querySelector('img');
        if(img) img.style.transform = '';
      });
    });

    // Glow follow on price cards
    doc.querySelectorAll('.price-card').forEach(c=>{
      c.addEventListener('mousemove', e=>{
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- 8. NAV SCROLL ---------- */
  const nav = doc.getElementById('nav');
  const bar = doc.getElementById('progressBar');
  let lastY = 0;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    const h = doc.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (y/h*100) + '%';
    nav.classList.toggle('scrolled', y > 60);
    lastY = y;
  }, { passive: true });

  /* ---------- 9. LIGHTBOX ---------- */
  const lb = doc.getElementById('lightbox');
  const lbImg = doc.getElementById('lbImg');
  const lbCap = doc.getElementById('lbCap');
  const lbClose = doc.getElementById('lbClose');

  doc.querySelectorAll('.art').forEach(fig=>{
    fig.addEventListener('click', ()=>{
      const src = fig.getAttribute('data-art');
      const label = fig.getAttribute('data-label') || '';
      lbImg.src = src;
      lbCap.textContent = label;
      lb.classList.add('open');
      body.classList.add('lb-open');
      if(lenis) lenis.stop();
      if(typeof gsap !== 'undefined'){
        gsap.fromTo(lbImg, {scale:0.9, opacity:0}, {scale:1, opacity:1, duration:.8, ease:'power3.out'});
      }
    });
  });
  function closeLb(){
    lb.classList.remove('open');
    body.classList.remove('lb-open');
    if(lenis) lenis.start();
  }
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', e=>{ if(e.target === lb) closeLb(); });
  doc.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeLb(); });

  /* ---------- 10. DISCORD COPY ---------- */
  const toast = doc.getElementById('toast');
  let toastTimer;
  function showToast(){
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), 2600);
  }
  doc.querySelectorAll('.copy-discord').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const text = 'bowinhead';
      if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(text).then(showToast).catch(()=> fallback(text));
      } else fallback(text);
    });
  });
  function fallback(text){
    const ta = doc.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.left='-9999px';
    doc.body.appendChild(ta); ta.select();
    try { doc.execCommand('copy'); showToast(); } catch(_){}
    ta.remove();
  }

  /* ---------- 11. CLICK RIPPLE + SPARKS ---------- */
  doc.addEventListener('click', e=>{
    if(reduce) return;
    const x = e.clientX, y = e.clientY;

    // Waves
    const w1 = doc.createElement('div');
    w1.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;border:1.5px solid rgba(245,208,0,.9);pointer-events:none;z-index:99996;transform:translate(-50%,-50%);box-shadow:0 0 30px rgba(245,208,0,.6)`;
    const w2 = doc.createElement('div');
    w2.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;background:rgba(245,208,0,.35);pointer-events:none;z-index:99996;transform:translate(-50%,-50%);filter:blur(2px)`;
    doc.body.append(w1, w2);

    if(typeof gsap !== 'undefined'){
      gsap.to(w1, { width: 520, height: 520, opacity: 0, duration: 1, ease: 'power3.out', onComplete: ()=> w1.remove() });
      gsap.to(w2, { width: 160, height: 160, opacity: 0, duration: .55, ease: 'power2.out', onComplete: ()=> w2.remove() });
    }

    // Sparks
    const sparkCount = 18;
    for(let i=0;i<sparkCount;i++){
      const s = doc.createElement('div');
      s.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:5px;height:5px;border-radius:50%;background:#F5D000;pointer-events:none;z-index:99996;box-shadow:0 0 14px #FF8C1A;transform:translate(-50%,-50%)`;
      doc.body.appendChild(s);
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 180;
      const tx = Math.cos(angle)*dist;
      const ty = Math.sin(angle)*dist;
      if(typeof gsap !== 'undefined'){
        gsap.to(s, { x: tx, y: ty, opacity: 0, scale: 0.2, duration: 0.9 + Math.random()*0.3, ease: 'power3.out', onComplete: ()=> s.remove() });
      } else {
        setTimeout(()=> s.remove(), 900);
      }
    }
  });

  /* ---------- 12. PAGE READY FALLBACK ---------- */
  // Just in case preloader fails (no rAF) — force reveal after 4s
  setTimeout(()=>{
    if(!pl.classList.contains('done')){
      pl.classList.add('done');
      startHeroAnimations();
    }
  }, 4000);

  // Enable interactive on user gesture for mobile
  window.addEventListener('touchstart', ()=>{}, { once: true });

})();
