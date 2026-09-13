document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. AURORA SHADER BACKGROUND (жидкое золото)
     ========================================================= */
  const aurora = document.getElementById('aurora');
  const actx = aurora.getContext('2d');
  let aw, ah;

  function resizeAurora(){
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    aw = aurora.width  = window.innerWidth * dpr * 0.5;
    ah = aurora.height = window.innerHeight * dpr * 0.5;
    aurora.style.width = '100vw';
    aurora.style.height = '100vh';
  }
  resizeAurora();
  window.addEventListener('resize', resizeAurora);

  const waves = [
    { color:'rgba(255,215,0,0.55)',  amp:0.28, freq:0.9,  speed:0.00018, phase:0,   y:0.55, w:1.4 },
    { color:'rgba(255,158,0,0.55)',  amp:0.35, freq:0.7,  speed:0.00012, phase:2,   y:0.45, w:1.2 },
    { color:'rgba(255,106,0,0.45)',  amp:0.30, freq:1.1,  speed:0.00022, phase:4,   y:0.65, w:1.0 },
    { color:'rgba(255,241,168,0.35)',amp:0.22, freq:0.6,  speed:0.00015, phase:1.5, y:0.5,  w:0.9 },
    { color:'rgba(255,180,50,0.40)', amp:0.32, freq:0.85, speed:0.00020, phase:3.2, y:0.6,  w:1.1 },
  ];

  let t0 = 0;
  function drawAurora(time){
    const t = time * 0.001;
    actx.clearRect(0,0,aw,ah);

    // Черный фон
    actx.fillStyle = '#050505';
    actx.fillRect(0,0,aw,ah);

    actx.globalCompositeOperation = 'lighter';

    waves.forEach((w, i) => {
      const grad = actx.createLinearGradient(0,0,0,ah);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.3, w.color);
      grad.addColorStop(0.7, w.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      actx.fillStyle = grad;
      actx.beginPath();
      actx.moveTo(0, ah);

      const baseY = ah * w.y;
      const amp = ah * w.amp;
      const freq = w.freq * 2 * Math.PI / aw;
      const speed = t * w.speed * 1000 + w.phase;

      for (let x = 0; x <= aw; x += 4){
        // Двойная синусоида — создаёт живой поток
        const y1 = Math.sin(x * freq + speed) * amp;
        const y2 = Math.sin(x * freq * 2.3 + speed * 1.5 + i) * amp * 0.35;
        const y3 = Math.cos(x * freq * 0.5 + speed * 0.7) * amp * 0.2;
        const y = baseY + y1 + y2 + y3;
        actx.lineTo(x, y);
      }

      actx.lineTo(aw, ah);
      actx.closePath();
      actx.fill();
    });

    actx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawAurora);
  }
  requestAnimationFrame(drawAurora);


  /* =========================================================
     2. ЧАСТИЦЫ с отталкиванием
     ========================================================= */
  const pc = document.getElementById('particles');
  const pctx = pc.getContext('2d');
  let pw, ph;
  const mouse = { x: null, y: null, radius: 180 };

  function resizeParticles(){
    pw = pc.width = window.innerWidth;
    ph = pc.height = window.innerHeight;
  }
  resizeParticles();
  window.addEventListener('resize', resizeParticles);

  const COLORS = ['#FFD700', '#FF9E00', '#FFF1A8', '#FF6A00'];
  const N = window.innerWidth < 768 ? 60 : 130;
  const particles = [];

  class P {
    constructor(){
      this.x = Math.random() * pw;
      this.y = Math.random() * ph;
      this.vx = (Math.random() - .5) * 0.4;
      this.vy = (Math.random() - .5) * 0.4;
      this.size = Math.random() * 1.8 + 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update(){
      // отталкивание от мыши
      if (mouse.x !== null){
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < mouse.radius && d > 0){
          const force = (mouse.radius - d) / mouse.radius;
          this.x += (dx / d) * force * 2.5;
          this.y += (dy / d) * force * 2.5;
        }
      }
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > pw) this.vx *= -1;
      if (this.y < 0 || this.y > ph) this.vy *= -1;
    }
    draw(){
      pctx.fillStyle = this.color;
      pctx.globalAlpha = this.alpha;
      pctx.shadowBlur = 12;
      pctx.shadowColor = this.color;
      pctx.beginPath();
      pctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      pctx.fill();
      pctx.shadowBlur = 0;
      pctx.globalAlpha = 1;
    }
  }
  for (let i = 0; i < N; i++) particles.push(new P());

  function drawLinks(){
    for (let i = 0; i < particles.length; i++){
      for (let j = i + 1; j < particles.length; j++){
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 120){
          pctx.strokeStyle = `rgba(255,215,0,${(1 - d / 120) * 0.12})`;
          pctx.lineWidth = 0.5;
          pctx.beginPath();
          pctx.moveTo(particles[i].x, particles[i].y);
          pctx.lineTo(particles[j].x, particles[j].y);
          pctx.stroke();
        }
      }
    }
  }

  function loop(){
    pctx.clearRect(0, 0, pw, ph);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLinks();
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });


  /* =========================================================
     3. КУРСОР (с инерцией + состояния)
     ========================================================= */
  const cDot = document.querySelector('.cursor-dot');
  const cRing = document.querySelector('.cursor-ring');
  const cGlow = document.querySelector('.cursor-glow');

  let mx = 0, my = 0;
  let dx = 0, dy = 0, rx = 0, ry = 0, gx = 0, gy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });

  function animateCursor(){
    dx += (mx - dx) * 0.9;
    dy += (my - dy) * 0.9;
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;

    cDot.style.transform  = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    cRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    cGlow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Состояния
  document.querySelectorAll('a, button, [data-hover="cursor-hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.querySelectorAll('.card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-view'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
  });

  window.addEventListener('mousedown', () => document.body.classList.add('cursor-down'));
  window.addEventListener('mouseup', () => document.body.classList.remove('cursor-down'));


  /* =========================================================
     4. ПРЕЛОАДЕР с counter
     ========================================================= */
  const pre = document.getElementById('preloader');
  const preCount = document.getElementById('pre-count');
  const preFill = document.querySelector('.pre-fill');
  let counter = 0;

  function tickCounter(){
    counter += Math.random() * 3 + 1;
    if (counter >= 100){
      counter = 100;
      preCount.textContent = counter;
      preFill.style.width = '100%';
      setTimeout(() => {
        pre.classList.add('hide');
        document.body.classList.add('loaded');
        startHeroAnimations();
      }, 400);
      return;
    }
    preCount.textContent = Math.floor(counter);
    preFill.style.width = counter + '%';
    setTimeout(tickCounter, 40 + Math.random() * 60);
  }
  tickCounter();


  /* =========================================================
     5. SPLIT TEXT (побуквенная анимация)
     ========================================================= */
  function splitText(el){
    const text = el.textContent;
    el.innerHTML = '';
    const frag = document.createDocumentFragment();
    [...text].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
    return el.querySelectorAll('.char');
  }

  const heroChars = [];
  document.querySelectorAll('[data-split]').forEach(el => {
    heroChars.push({ el, chars: splitText(el) });
  });

  function startHeroAnimations(){
    heroChars.forEach(({ el, chars }) => {
      const isHero = el.closest('.hero');
      chars.forEach((c, i) => {
        setTimeout(() => {
          c.classList.add('in');
        }, (isHero ? 0 : 0) + i * 45);
      });
    });
  }


  /* =========================================================
     6. REVEAL ON SCROLL
     ========================================================= */
  const revealUp = document.querySelectorAll('.reveal-up');
  const revealClip = document.querySelectorAll('.reveal-clip');

  const io1 = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io1.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  const io2 = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io2.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  revealUp.forEach(el => io1.observe(el));
  revealClip.forEach(el => io2.observe(el));

  // Split для section title при попадании в вьюпорт
  document.querySelectorAll('.section-title').forEach(title => {
    const chars = title.querySelectorAll('.char');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          chars.forEach((c, i) => setTimeout(() => c.classList.add('in'), i * 55));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(title);
  });

  // footer title
  document.querySelectorAll('.footer-title').forEach(title => {
    const chars = title.querySelectorAll('.char');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          chars.forEach((c, i) => setTimeout(() => c.classList.add('in'), i * 40));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(title);
  });


  /* =========================================================
     7. 3D TILT на карточках
     ========================================================= */
  document.querySelectorAll('.tilt-card').forEach(card => {
    let raf;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rotX = ((y - cy) / cy) * -7;
      const rotY = ((x - cx) / cx) * 7;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1200px) rotateX(0) rotateY(0) scale(1)`;
    });
  });


  /* =========================================================
     8. PRICE CARDS — световое пятно за курсором
     ========================================================= */
  document.querySelectorAll('.price-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });


  /* =========================================================
     9. МАГНИТНЫЕ ЭЛЕМЕНТЫ
     ========================================================= */
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });


  /* =========================================================
     10. ЛАЙТБОКС
     ========================================================= */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.view;
      if (!src) return;
      lbImg.src = src;
      lb.classList.add('on');
      document.body.style.overflow = 'hidden';
    });
  });

  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lb-close')){
      lb.classList.remove('on');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('on')){
      lb.classList.remove('on');
      document.body.style.overflow = '';
    }
  });


  /* =========================================================
     11. ССЫЛКИ-ЯКОРЯ (плавный скролл)
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target){
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* =========================================================
     12. КНОПКИ — RIPPLE
     ========================================================= */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;
        width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.5);
        transform:translate(-50%,-50%) scale(0);pointer-events:none;
        animation:rippleAnim .7s ease-out forwards;z-index:2;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // добавляем keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim{
      to{transform:translate(-50%,-50%) scale(30);opacity:0}
    }
    @keyframes sparkAnim{
      to{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}
    }
  `;
  document.head.appendChild(style);


  /* =========================================================
     13. ГЛОБАЛЬНЫЙ КЛИК — ВОЛНЫ + ИСКРЫ
     ========================================================= */
  document.body.addEventListener('click', e => {
    // волна-обводка
    const wave = document.createElement('div');
    wave.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      width:0;height:0;border:1.5px solid rgba(255,215,0,.8);border-radius:50%;
      transform:translate(-50%,-50%);pointer-events:none;z-index:9997;
      box-shadow:0 0 30px rgba(255,215,0,.5);
    `;
    document.body.appendChild(wave);
    wave.animate([
      { width:'0px', height:'0px', opacity:1 },
      { width:'500px', height:'500px', opacity:0 }
    ], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => wave.remove();

    // искры
    for (let i = 0; i < 24; i++){
      const s = document.createElement('div');
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 160 + 40;
      const size = Math.random() * 5 + 2;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      s.style.cssText = `
        position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};pointer-events:none;z-index:9998;
        box-shadow:0 0 15px ${color};
        --tx:${Math.cos(angle) * dist}px;
        --ty:${Math.sin(angle) * dist}px;
      `;
      document.body.appendChild(s);
      s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`, opacity: 0 }
      ], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => s.remove();
    }
  });


  /* =========================================================
     14. SCROLL — прогресс, навбар, сайд-навигация, параллакс
     ========================================================= */
  const progress = document.querySelector('.scroll-progress span');
  const nav = document.querySelector('.nav');
  const sections = ['hero', 'portfolio', 'pricing', 'socials'].map(id => document.getElementById(id));
  const dots = document.querySelectorAll('.side-nav .dot');
  const bgText = document.querySelector('.hero-bg-text');

  function onScroll(){
    const st = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (st / dh) * 100;
    progress.style.width = pct + '%';

    if (st > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    // активная секция
    let active = 0;
    sections.forEach((s, i) => {
      if (s){
        const top = s.offsetTop - window.innerHeight / 2;
        if (st >= top) active = i;
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active));

    // параллакс bg-text
    if (bgText){
      bgText.style.transform = `translate(-50%, calc(-50% + ${st * 0.3}px))`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* =========================================================
     15. ПАРАЛЛАКС ОТ МЫШИ (hero-bg-text)
     ========================================================= */
  const heroBg = document.querySelector('.hero-bg-text');
  window.addEventListener('mousemove', e => {
    if (!heroBg) return;
    const x = (e.clientX - window.innerWidth / 2) * 0.02;
    const y = (e.clientY - window.innerHeight / 2) * 0.02;
    heroBg.style.setProperty('--px', x + 'px');
    heroBg.style.setProperty('--py', y + 'px');
  });


  /* =========================================================
     16. DISCORD COPY
     ========================================================= */
  window.copyDiscord = function(e){
    e.preventDefault();
    e.stopPropagation();
    const nick = 'bowinhead';
    const done = () => {
      const toast = document.getElementById('toast');
      toast.classList.add('on');
      clearTimeout(window.__toastT);
      window.__toastT = setTimeout(() => toast.classList.remove('on'), 2600);
    };
    if (navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(nick).then(done).catch(() => fallback(nick, done));
    } else {
      fallback(nick, done);
    }
  };
  function fallback(text, cb){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch(e){}
    ta.remove();
  }

});
