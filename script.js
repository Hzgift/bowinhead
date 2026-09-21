document.addEventListener('DOMContentLoaded', () => {

  // 1. ПРЕЛОАДЕР
  const preloader = document.querySelector('.preloader');
  const preCounter = document.querySelector('.pre-counter');
  const preFill = document.querySelector('.pre-fill');
  let progress = 0;

  document.body.style.overflow = 'hidden';

  const preInt = setInterval(() => {
    progress += Math.random() * 11 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(preInt);
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 350);
    }
    preCounter.textContent = String(Math.floor(progress)).padStart(3, '0') + '%';
    preFill.style.right = (100 - progress) + '%';
  }, 90);

  // 2. КУРСОР
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const label = document.querySelector('.cursor-label');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });

  function loopCursor() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loopCursor);
  }
  loopCursor();

  document.querySelectorAll('a, button, .social-card, .hero-btn, .nav-logo, .lb-close').forEach(el => {
    el.addEventListener('mouseenter', () => {
      label.textContent = '';
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.querySelectorAll('.work-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      label.textContent = ':3';
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  window.addEventListener('mousedown', () => document.body.classList.add('pressing'));
  window.addEventListener('mouseup', () => document.body.classList.remove('pressing'));

  // 3. АВРОРА
  const aurora = document.querySelector('.aurora');
  const actx = aurora.getContext('2d');
  let aw, ah;
  const blobs = [
    { x: 0.12, y: 0.20, r: 0.75, h: 42, sp: 0.00022, ph: 0 },
    { x: 0.88, y: 0.25, r: 0.70, h: 28, sp: 0.00030, ph: 1.2 },
    { x: 0.50, y: 0.75, r: 0.85, h: 38, sp: 0.00024, ph: 2.4 },
    { x: 0.18, y: 0.88, r: 0.55, h: 50, sp: 0.00038, ph: 3.6 },
    { x: 0.82, y: 0.92, r: 0.60, h: 18, sp: 0.00032, ph: 4.8 },
    { x: 0.50, y: 0.05, r: 0.65, h: 35, sp: 0.00026, ph: 6.0 },
    { x: 0.05, y: 0.55, r: 0.50, h: 45, sp: 0.00034, ph: 7.2 },
    { x: 0.95, y: 0.60, r: 0.55, h: 25, sp: 0.00029, ph: 8.4 },
  ];

  function resizeAurora() {
    aw = aurora.width = window.innerWidth;
    ah = aurora.height = window.innerHeight;
  }
  resizeAurora();
  window.addEventListener('resize', resizeAurora);

  function drawAurora(t) {
    actx.fillStyle = '#050505';
    actx.fillRect(0, 0, aw, ah);
    actx.globalCompositeOperation = 'lighter';
    blobs.forEach(b => {
      const x = (b.x + Math.sin(t * b.sp + b.ph) * 0.14) * aw;
      const y = (b.y + Math.cos(t * b.sp * 1.4 + b.ph) * 0.12) * ah;
      const rad = b.r * Math.min(aw, ah) * (1 + Math.sin(t * b.sp * 0.7 + b.ph) * 0.18);
      const g = actx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0,    `hsla(${b.h}, 100%, 58%, 0.32)`);
      g.addColorStop(0.35, `hsla(${b.h}, 100%, 48%, 0.14)`);
      g.addColorStop(0.7,  `hsla(${b.h}, 100%, 42%, 0.05)`);
      g.addColorStop(1,    `hsla(${b.h}, 100%, 40%, 0)`);
      actx.fillStyle = g;
      actx.beginPath();
      actx.arc(x, y, rad, 0, Math.PI * 2);
      actx.fill();
    });
    actx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawAurora);
  }
  requestAnimationFrame(drawAurora);

  // 4. ЧАСТИЦЫ-СОЗВЕЗДИЯ
  const canvas = document.querySelector('.particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const COLORS = ['#FFD700','#FFB400','#FF8C00','#FFF6D5','#FFFFFF','#fff8b0','#FFE55C'];
  const COUNT = isMobile ? 40 : 180;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class P {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.z = Math.random();
      this.size = this.z * (isMobile ? 1.6 : 2.8) + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.30 * (0.3 + this.z);
      this.speedY = (Math.random() - 0.5) * 0.30 * (0.3 + this.z);
      this.color = COLORS[(Math.random() * COLORS.length) | 0];
      this.opacity = 0.45 + this.z * 0.55;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.015 + Math.random() * 0.035;
      this.isNode = Math.random() < (isMobile ? 0.08 : 0.15);
      if (this.isNode) {
        this.size = 3 + Math.random() * 1.8;
        this.opacity = 1;
      }
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      const dx = this.x - mx, dy = this.y - my;
      const d2 = dx*dx + dy*dy;
      if (d2 < 19600) {
        const d = Math.sqrt(d2) || 1;
        const f = (140 - d) / 140 * 2.2;
        this.x += (dx/d) * f;
        this.y += (dy/d) * f;
      }
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
      this.twinkle += this.twinkleSpeed;
    }
    draw() {
      const tw = 0.7 + Math.sin(this.twinkle) * 0.3;
      ctx.globalAlpha = this.opacity * tw;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.isNode ? 28 : 14 * this.z;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      if (this.isNode) {
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new P());

  function connect() {
    const MAX_D = isMobile ? 85 : 160;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_D) {
          const baseOp = 1 - d / MAX_D;
          const mult = (particles[a].isNode || particles[b].isNode) ? 0.7 : 0.35;
          const op = baseOp * mult;
          const grad = ctx.createLinearGradient(
            particles[a].x, particles[a].y,
            particles[b].x, particles[b].y
          );
          grad.addColorStop(0, `rgba(255,215,0,${op})`);
          grad.addColorStop(1, `rgba(255,140,0,${op})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = (particles[a].isNode || particles[b].isNode) ? 1.1 : 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(animParticles);
  }
  animParticles();

  // 5. КЛИК — волны + искры
  const animStyle = document.createElement('style');
  animStyle.textContent = `
    @keyframes clickWave{0%{width:0;height:0;opacity:1}100%{width:500px;height:500px;opacity:0}}
    @keyframes clickWave2{0%{width:0;height:0;opacity:1}100%{width:220px;height:220px;opacity:0}}
    @keyframes sparkFly{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0);opacity:0}}
    @keyframes pageFill{0%{width:0;height:0}100%{width:320vmax;height:320vmax}}
  `;
  document.head.appendChild(animStyle);

  function burstSparks(x, y, count = 18, color = '#FFD700') {
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 140;
      s.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${2 + Math.random() * 4}px;height:${2 + Math.random() * 4}px;background:${color};border-radius:50%;pointer-events:none;z-index:9998;box-shadow:0 0 14px ${color},0 0 6px #fff;--tx:${Math.cos(ang) * dist}px;--ty:${Math.sin(ang) * dist}px;animation:sparkFly .9s cubic-bezier(.19,1,.22,1) forwards;`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
  }
  function burstWaves(x, y) {
    const w1 = document.createElement('div');
    w1.style.cssText = `position:fixed;left:${x}px;top:${y}px;border-radius:50%;pointer-events:none;z-index:9997;border:1.5px solid rgba(255,215,0,.9);transform:translate(-50%,-50%);animation:clickWave .9s cubic-bezier(.19,1,.22,1) forwards;`;
    document.body.appendChild(w1);
    setTimeout(() => w1.remove(), 950);

    const w2 = document.createElement('div');
    w2.style.cssText = `position:fixed;left:${x}px;top:${y}px;border-radius:50%;pointer-events:none;z-index:9997;background:radial-gradient(circle,rgba(255,215,0,.4),transparent 70%);transform:translate(-50%,-50%);animation:clickWave2 .7s cubic-bezier(.19,1,.22,1) forwards;`;
    document.body.appendChild(w2);
    setTimeout(() => w2.remove(), 750);
  }

  document.addEventListener('click', e => {
    if (e.target.closest('.hero-btn')) return;
    if (e.target.closest('.social-card.adult')) return;
    burstSparks(e.clientX, e.clientY);
    burstWaves(e.clientX, e.clientY);
  });

  // 6. HERO — буквы + кнопки
  const heroLetters = document.querySelectorAll('.hero-letter');
  const hero = document.querySelector('.hero-name');

  if (hero) {
    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      heroLetters.forEach((l) => {
        const lr = l.getBoundingClientRect();
        const lx = lr.left - rect.left + lr.width / 2;
        const dist = Math.abs(lx - cx);
        const lift = Math.max(0, 1 - dist / 200);
        l.style.transform = `translateY(${-lift * 22}px) rotate(${(lx - cx) * 0.02}deg) scale(${1 + lift * 0.05})`;
        l.style.filter = `drop-shadow(0 0 ${20 + lift * 40}px rgba(255,215,0,${0.15 + lift * 0.45}))`;
      });
    });
    hero.addEventListener('mouseleave', () => {
      heroLetters.forEach(l => {
        l.style.transform = '';
        l.style.filter = '';
      });
    });
  }

  const heroBtns = document.querySelectorAll('.hero-btn');
  let transitioning = false;

  heroBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      if (transitioning) return;
      const target = btn.dataset.target;
      const cx = e.clientX;
      const cy = e.clientY;

      burstSparks(cx, cy, 26);
      burstWaves(cx, cy);

      transitioning = true;
      const circle = document.createElement('div');
      circle.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;border-radius:50%;pointer-events:none;z-index:9995;background:radial-gradient(circle at center, #2a1a00 0%, #050505 70%);box-shadow:inset 0 0 200px rgba(255,140,0,.25),0 0 100px rgba(255,140,0,.15);transform:translate(-50%,-50%);animation:pageFill .65s cubic-bezier(.65,.05,.36,1) forwards;`;
      document.body.appendChild(circle);

      setTimeout(() => {
        const t = document.querySelector(target);
        if (t) {
          const y = t.getBoundingClientRect().top + window.pageYOffset - 40;
          window.scrollTo({ top: y, behavior: 'auto' });
        }
      }, 500);

      setTimeout(() => {
        circle.style.transition = 'opacity .5s ease';
        circle.style.opacity = '0';
        setTimeout(() => {
          circle.remove();
          transitioning = false;
        }, 550);
      }, 750);
    });
  });

  // 7. REVEAL
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        revealIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  // 8. SCRAMBLE
  const CHARS = '!<>-_\\/[]{}—=+*^?#АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ';
  function scramble(el) {
    const original = el.dataset.text || el.textContent;
    el.dataset.text = original;
    const len = original.length;
    let frame = 0;
    const total = 20 + len * 2;
    const tick = () => {
      let out = '';
      for (let i = 0; i < len; i++) {
        const rev = Math.floor((frame / total) * len * 1.5);
        if (i < rev) out += original[i];
        else if (original[i] === ' ') out += ' ';
        else out += CHARS[(Math.random() * CHARS.length) | 0];
      }
      el.textContent = out;
      frame++;
      if (frame < total) requestAnimationFrame(tick);
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

  // 9. TILT + SPOTLIGHT
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

  // 10. МАГНИТНЫЕ
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  document.querySelectorAll('.social-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
  });

  // 11. ПРОГРЕСС + НАВБАР
  const nav = document.querySelector('.nav');
  const progressBar = document.querySelector('.progress-bar');
  window.addEventListener('scroll', () => {
    const st = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (st / dh * 100) + '%';
    nav.classList.toggle('scrolled', st > 40);
  }, { passive: true });

  // 12. СЧЁТЧИК ЦИФР
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => countIO.observe(c));

  // 13. ЛАЙТБОКС
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

  // 14. DISCORD COPY
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
    try { document.execCommand('copy'); cb(); } catch(err) {}
    ta.remove();
  }

  // 15. 18+ UNLOCK
  window.unlockAdult = function(e, el) {
    if (!el.classList.contains('unlocked')) {
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      burstSparks(cx, cy, 40, '#ff2e2e');
      setTimeout(() => burstSparks(cx, cy, 24, '#FFD700'), 200);

      el.style.animation = 'adultShake .6s ease';
      setTimeout(() => el.style.animation = '', 600
