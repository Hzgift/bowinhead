/* =========================================================
   BOWINHEAD — INTERACTIVE EXPERIENCE
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ============ 1. PRELOADER ============ */
  const pre = document.getElementById('preloader');
  const fill = pre.querySelector('.pre-fill');
  const counter = pre.querySelector('.pre-counter');
  let prog = 0;

  const preTimer = setInterval(() => {
    prog += Math.random() * 8 + 2;
    if (prog >= 100) { prog = 100; clearInterval(preTimer);
      setTimeout(() => {
        pre.classList.add('done');
        setTimeout(() => pre.classList.add('gone'), 1400);
      }, 300);
    }
    fill.style.width = prog + '%';
    counter.textContent = String(Math.floor(prog)).padStart(3, '0');
  }, 60);

  /* ============ 2. WEBGL SHADER — AURORA ============ */
  const canvas = document.getElementById('gl');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  if (gl) {
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
    const fs = `
      precision highp float;
      uniform vec2 R; uniform float T; uniform vec2 M;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/R; uv.x*=R.x/R.y;
        vec2 m=M/R; m.x*=R.x/R.y;
        float t=T*.14;
        vec2 q=vec2(fbm(uv+t*.2),fbm(uv+vec2(5.2,1.3)));
        vec2 r=vec2(fbm(uv+4.*q+vec2(1.7,9.2)+t*.4),fbm(uv+4.*q+vec2(8.3,2.8)+t*.3));
        float f=fbm(uv+4.*r);
        vec3 black=vec3(.02,.02,.02);
        vec3 yellow=vec3(1.,.83,0.);
        vec3 orange=vec3(1.,.48,0.);
        vec3 col=mix(black,orange,smoothstep(.2,.9,f)*.55);
        col=mix(col,yellow,smoothstep(.5,1.,f)*.35);
        float d=distance(uv,m);
        col+=yellow*exp(-d*5.)*.15;
        col*=1.-length(uv-vec2(.5*R.x/R.y,.5))*.35;
        gl_FragColor=vec4(col,.5);
      }`;
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram();
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'R');
    const uT = gl.getUniformLocation(pr, 'T');
    const uM = gl.getUniformLocation(pr, 'M');
    let mx = 0, my = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);
    addEventListener('mousemove', e => { mx = e.clientX * Math.min(devicePixelRatio,1.5); my = innerHeight*Math.min(devicePixelRatio,1.5) - e.clientY*Math.min(devicePixelRatio,1.5); });
    const start = performance.now();
    (function loop() {
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(loop);
    })();
  } else {
    document.querySelector('.bg-black').style.background = 'radial-gradient(ellipse at 50% 30%, #1a1200 0%, #050505 70%)';
  }

  /* ============ 3. CUSTOM CURSOR ============ */
  const dot = document.querySelector('.cur-dot');
  const ring = document.querySelector('.cur-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });
  (function raf() {
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  })();
  document.addEventListener('mousedown', () => document.body.classList.add('cur-press'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cur-press'));

  // Hover state
  document.querySelectorAll('a,button,.nav-a,.foot-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });
  // View state on works
  document.querySelectorAll('.work').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-view'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-view'));
  });

  /* ============ 4. MAGNETIC ELEMENTS ============ */
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  /* ============ 5. SCROLL REVEALS ============ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.reveal-clip, .reveal-up').forEach((el, i) => {
    if (el.classList.contains('reveal-up')) {
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      el.animate([
        { opacity: 0, transform: 'translateY(40px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 900, delay: (i % 4) * 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
      el.style.opacity = '1';
    }
    io.observe(el);
  });

  /* ============ 6. CLICK EFFECTS — WAVE + SPARKS ============ */
  document.addEventListener('click', e => {
    // wave
    const w = document.createElement('div');
    w.className = 'wave';
    w.style.left = e.clientX + 'px';
    w.style.top = e.clientY + 'px';
    w.style.width = '0px'; w.style.height = '0px';
    document.body.appendChild(w);
    requestAnimationFrame(() => {
      w.style.width = '500px'; w.style.height = '500px';
      w.style.opacity = '0';
      w.style.transition = 'width 1s cubic-bezier(.16,1,.3,1), height 1s cubic-bezier(.16,1,.3,1), opacity 1s';
    });
    setTimeout(() => w.remove(), 1100);

    // sparks
    const count = 18;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 60 + Math.random() * 90;
      s.style.setProperty('--tx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--ty', Math.sin(ang) * dist + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
  });

  /* ============ 7. LIGHTBOX ============ */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  window.openLb = function(src) {
    lbImg.src = src;
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  };
  document.querySelectorAll('.work').forEach(w => {
    w.addEventListener('click', () => openLb(w.dataset.src));
  });
  lb.addEventListener('click', () => {
    lb.classList.remove('on');
    document.body.style.overflow = '';
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { lb.classList.remove('on'); document.body.style.overflow = ''; }
  });

  /* ============ 8. DISCORD COPY ============ */
  window.copyDiscord = function(e) {
    e.preventDefault(); e.stopPropagation();
    const nick = 'bowinhead';
    const done = () => {
      const t = document.getElementById('toast');
      t.classList.add('on');
      setTimeout(() => t.classList.remove('on'), 2600);
    };
    if (navigator.clipboard && isSecureContext) {
      navigator.clipboard.writeText(nick).then(done).catch(() => fb(nick, done));
    } else fb(nick, done);
  };
  function fb(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); cb(); } catch(e) {}
    ta.remove();
  }

  /* ============ 9. PROGRESS BAR + NAV ============ */
  const prog2 = document.getElementById('progress');
  const nav = document.querySelector('.nav');
  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const top = scrollY;
        const h = document.documentElement.scrollHeight - innerHeight;
        prog2.style.width = (top / h) * 100 + '%';
        if (top > 60) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ============ 10. LIVE CLOCK ============ */
  const clock = document.querySelector('.status-time');
  setInterval(() => {
    const d = new Date();
    clock.textContent = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }, 1000);

  /* ============ 11. 3D TILT ON CARDS ============ */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-8px) perspective(900px) rotateX(${-y*6}deg) rotateY(${x*6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ============ 12. PARALLAX ON MARQUEE ============ */
  addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 20;
    document.querySelectorAll('.marquee-track').forEach(t => {
      t.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

});
