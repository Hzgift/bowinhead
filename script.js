document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. ПРЕЛОАДЕР
  // ============================================================
  const preloader = document.querySelector('.preloader');
  const preCounter = document.querySelector('.preloader-counter');
  const preFill = document.querySelector('.preloader-fill');
  let progress = 0;

  const preInt = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(preInt);
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
        // Trigger hero letter animation
      }, 400);
    }
    preCounter.textContent = String(Math.floor(progress)).padStart(3, '0');
    preFill.style.right = (100 - progress) + '%';
  }, 90);

  document.body.style.overflow = 'hidden';

  // ============================================================
  // 2. КУРСОР
  // ============================================================
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  function loopCursor() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loopCursor);
  }
  loopCursor();

  // Состояния курсора
  document.querySelectorAll('a, button, .social-card, .nav-cta').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
  document.querySelectorAll('.work-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.querySelector('.cursor-label').textContent = 'VIEW';
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
  window.addEventListener('mousedown', () => document.body.classList.add('pressing'));
  window.addEventListener('mouseup', () => document.body.classList.remove('pressing'));

  // ============================================================
  // 3. АВРОРА (фон)
  // ============================================================
  const aurora = document.querySelector('.aurora');
  const actx = aurora.getContext('2d');
  let aw, ah, ahue;

  const blobs = [
    { x: 0.15, y: 0.25, r: 0.55, h: 45, sp: 0.00020, ph: 0   },
    { x: 0.85, y: 0.30, r: 0.50, h: 30, sp: 0.00028, ph: 1.2 },
    { x: 0.50, y: 0.80, r: 0.60, h: 40, sp: 0.00022, ph: 2.4 },
    { x: 0.20, y: 0.85, r: 0.40, h: 55, sp: 0.00035, ph: 3.6 },
    { x: 0.80, y: 0.90, r: 0.45, h: 20, sp: 0.00030, ph: 4.8 },
  ];

  function resizeAurora() {
    aw = aurora.width = window.innerWidth * (window.devicePixelRatio > 1 ? 1 : 1);
    ah = aurora.height = window.innerHeight;
  }
  resizeAurora();
  window.addEventListener('resize', resizeAurora);

  function drawAurora(t) {
    actx.fillStyle = '#050505';
    actx.fillRect(0, 0, aw, ah);
    actx.globalCompositeOperation = 'lighter';

    blobs.forEach(b => {
      const x = (b.x + Math.sin(t * b.sp + b.ph) * 0.12) * aw;
      const y = (b.y + Math.cos(t * b.sp * 1.4 + b.ph) * 0.10) * ah;
      const rad = b.r * Math.min(aw, ah) * (1 + Math.sin(t * b.sp * 0.7 + b.ph) * 0.15);

      const g = actx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0,   `hsla(${b.h}, 100%, 55%, 0.13)`);
      g.addColorStop(0.4, `hsla(${b.h}, 100%, 45%, 0.05)`);
      g.addColorStop(1,   `hsla(${b.h}, 100%, 40%, 0)`);

      actx.fillStyle = g;
      actx.beginPath();
      actx.arc(x, y, rad, 0, Math.PI * 2);
      actx.fill();
    });

    actx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawAurora);
  }
  requestAnimationFrame(drawAurora);

  // ============================================================
  // 4. ЧАСТИЦЫ (с 3D-глубиной)
  // ============================================================
  const canvas = document.querySelector('.particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['#FFD700','#FFB400','#FF8C00','#FFF6D5','#FFFFFF'];
  const COUNT = 130;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class P {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 20;
      this.z = Math.random(); // depth
      this.size = this.z * 2.5 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.35 * (0.4 + this.z);
      this.speedY = (Math.random() - 0.5) * 0.35 * (0.4 + this.z);
      this.color = COLORS[(Math.random() * COLORS.length) | 0];
      this.opacity = 0.15 + this.z * 0.55;
      this.twinkle = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.speedX;
      this.y += this.speedY;
      // mouse repel
      const dx = this.x - mx, dy = this.y - my;
      const d2 = dx*dx + dy*dy;
      if (d2 < 14400) {
        const d = Math.sqrt(d2) || 1;
        const f = (120 - d) / 120 * 2;
        this.x += (dx/d) * f;
        this.y += (dy/d) * f;
      }
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
      this.twinkle += 0.02;
    }
    draw() {
      const tw = 0.6 + Math.sin(this.twinkle) * 0.4;
      ctx.globalAlpha = this.opacity * tw;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10 * this.z;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new P());

  function connect() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          const op = (1 - d/110) * 0.12;
          ctx.strokeStyle = `rgba(255,215,0,${op})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  let particleT = 0;
  function animParticles() {
    particleT += 16;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(particleT); p.draw(); });
    connect();
    requestAnimationFrame(animParticles);
  }
  animParticles();

  // ============================================================
  // 5. КЛИК — волны + искры
  // ============================================================
  document.addEventListener('click', e => {
    // волны
    for (let i = 0; i < 2; i++) {
      const w = document.createElement('div');
      const size = i === 0 ? 500 : 220;
      w.style.cssText = `
        position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:0;height:0;border-radius:50%;pointer-events:none;z-index:9997;
        border:${i===0 ? '1.5px solid rgba(255,215,0,.9)' : 'none'};
        background:${i===1 ? 'radial-gradient(circle,rgba(255,215,0,.35),transparent 70%)' : 'transparent'};
        transform:translate(-50%,-50%);
        animation:clickWave .9s cubic-bezier(.19,1,.22,1) forwards;
      `;
      document.body.appendChild(w);
      setTimeout(() => w.remove(), 950);
    }
    // искры
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('div');
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 140;
      s.style.cssText = `
        position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:${2 + Math.random() * 4}px;height:${2 + Math.random() * 4}px;
        background:#FFD700;border-radius:50%;pointer-events:none;z-index:9998;
        box-shadow:0 0 14px #FFB400,0 0 6px #fff;
        --tx:${Math.cos(ang) * dist}px;
        --ty:${Math.sin(ang) * dist}px;
        animation:sparkFly .9s cubic-bezier(.19,1,.22,1) forwards;
      `;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
  });

  // keyframes через JS (чтобы не засорять CSS)
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes clickWave {
      0%   { width:0; height:0; opacity:1; }
      100% { width: var(--w,500px); height: var(--w,500px); opacity:0; }
    }
    @keyframes sparkFly {
      0%   { transform:translate(-50%,-50%) scale(1); opacity:1; }
      100% { transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity:0; }
    }
  `;
  document.head.appendChild(styleSheet);

  // ============================================================
  // 6. REVEAL (появление)
  // ============================================================
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        revealIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  // ============================================================
  // 7. TEXT SCRAMBLE
  // ============================================================
  const CHARS = '!<>-_\\/[]{}—=+*^?#АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ';
  function scramble(el) {
    const original = el.dataset.text || el.textContent;
    el.dataset.text = original;
    const len = original.length;
    let frame = 0;
    const totalFrames = 20 + len * 2;

    const tick = () => {
      let out = '';
      for (let i = 0; i < len; i++) {
        const revealFrame = Math.floor((frame / totalFrames) * len * 1.5);
        if (i < revealFrame) out += original[i];
        else if (original[i] === ' ') out += ' ';
        else out += CHARS[(Math.random() * CHARS.length) | 0];
      }
      el.textContent = out;
      frame++;
      if (frame < totalFrames) requestAnimationFrame(tick);
      else el.textContent = original;
    };
    tick();
  }
  const scrambleIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        scramble(en.target);
        scrambleIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-scramble]').forEach(el => scrambleIO.observe(el));

  // ============================================================
  // 8. TILT КАРТОЧЕК + SPOTLIGHT
  // ============================================================
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rotY = ((x - cx) / cx) * 6;
      const rotX = ((y - cy) / cy) * -6;

      const inner = card.querySelector('.work-inner') || card;
      inner.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;

      // Спотлайт на прайс
      if (card.classList.contains('glow-card')) {
        card.style.setProperty('--x', x + 'px');
        card.style.setProperty('--y', y + 'px');
      }
    });
    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.work-inner') || card;
      inner.style.transform = '';
    });
  });

  // ============================================================
  // 9. МАГНИТНЫЕ ЭЛЕМЕНТЫ
  // ============================================================
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ============================================================
  // 10. ПРОГРЕСС + НАВБАР
  // ============================================================
  const nav = document.querySelector('.nav');
  const progressBar = document.querySelector('.progress-bar');

  window.addEventListener('scroll', () => {
    const st = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (st / dh * 100) + '%';
    nav.classList.toggle('scrolled', st > 40);
  }, { passive: true });

  // ============================================================
  // 11. ЛАЙТБОКС
  // ============================================================
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  window.openLightbox = function(src) {
    lbImg.src = src;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lb-close')) {
      lb.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('active')) {
      lb.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ============================================================
  // 12. DISCORD COPY
  // ============================================================
  const toast = document.getElementById('toast');
  window.copyDiscord = function(e) {
    e.preventDefault();
    const txt = 'bowinhead';
    const done = () => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(done).catch(() => fb(txt, done));
    } else {
      fb(txt, done);
    }
  };
  function fb(txt, cb) {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch(e) {}
    ta.remove();
  }

});
