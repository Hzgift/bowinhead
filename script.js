/* ===================== LOADER ===================== */
const preNum = document.getElementById('preNum');
const preFill = document.querySelector('.pre-fill');
const preloader = document.getElementById('preloader');
let loadVal = 0;
const loadInt = setInterval(() => {
  loadVal += Math.random() * 8 + 2;
  if (loadVal >= 100) { loadVal = 100; clearInterval(loadInt); setTimeout(finishLoad, 500); }
  preNum.textContent = Math.floor(loadVal);
  preFill.style.width = loadVal + '%';
}, 90);

function finishLoad(){
  preloader.classList.add('done');
  document.body.style.overflow = '';
  // Trigger hero animation
  document.querySelector('.hero-title')?.classList.add('in');
  document.querySelectorAll('.hero-title .char').forEach((c,i) => c.style.transitionDelay = (i*0.035)+'s');
  setTimeout(() => {
    document.querySelector('.hero-sub')?.classList.add('in');
    document.querySelector('.hero-cta')?.classList.add('in');
  }, 300);
  // Split titles trigger on scroll into view
  observeSplit();
}
document.body.style.overflow = 'hidden';

/* ===================== SPLIT TEXT ===================== */
function splitText(el){
  const walk = node => {
    if (node.nodeType === 3){
      const chars = node.textContent.split('');
      const frag = document.createDocumentFragment();
      chars.forEach(ch => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && node.nodeName !== 'BR'){
      [...node.childNodes].forEach(walk);
    }
  };
  [...el.childNodes].forEach(walk);
  // ensure only top-level .line wraps chars get delayed
  el.querySelectorAll('.line').forEach(line => {
    [...line.querySelectorAll('.char')].forEach((c,i) => c.style.transitionDelay = (i*0.035)+'s');
  });
}

document.querySelectorAll('[data-split]').forEach(splitText);

function observeSplit(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.15});
  document.querySelectorAll('[data-split]').forEach(el => io.observe(el));
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

/* ===================== WEBGL SHADER ===================== */
(function initShader(){
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime:  { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uRes:   { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`;

  const frag = `
    precision highp float;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uRes;
    varying vec2 vUv;

    vec2 hash2(vec2 p){
      p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
      return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }
    float vnoise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(dot(hash2(i+vec2(0.,0.)), f-vec2(0.,0.)),
                     dot(hash2(i+vec2(1.,0.)), f-vec2(1.,0.)), u.x),
                 mix(dot(hash2(i+vec2(0.,1.)), f-vec2(0.,1.)),
                     dot(hash2(i+vec2(1.,1.)), f-vec2(1.,1.)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for(int i=0;i<6;i++){ v += a*vnoise(p); p *= 2.02; a *= 0.5; }
      return v;
    }
    void main(){
      vec2 uv = vUv;
      uv.x *= uRes.x / uRes.y;
      float t = uTime * 0.14;

      // mouse influence
      vec2 m = uMouse * vec2(uRes.x/uRes.y, 1.0);
      float md = smoothstep(0.9, 0.0, distance(uv, m));

      // domain warp
      vec2 q = vec2(fbm(uv*1.6 + t), fbm(uv*1.6 + vec2(5.2,1.3) + t*0.9));
      vec2 r = vec2(fbm(uv*1.6 + 3.2*q + vec2(1.7,9.2) + t*0.7),
                    fbm(uv*1.6 + 3.2*q + vec2(8.3,2.8) + t*0.7));
      float f = fbm(uv*1.6 + 3.2*r + md*0.6);

      // palette (dark → deep orange → gold → light gold)
      vec3 c1 = vec3(0.015,0.012,0.012);
      vec3 c2 = vec3(0.30,0.10,0.02);
      vec3 c3 = vec3(1.00,0.62,0.12);
      vec3 c4 = vec3(1.00,0.92,0.55);

      vec3 col = mix(c1, c2, smoothstep(-0.25, 0.35, f));
      col = mix(col, c3, smoothstep(0.15, 0.70, f + length(q)*0.35 + md*0.4));
      col = mix(col, c4, smoothstep(0.55, 0.95, r.x + 0.35 + md*0.5));

      // darkening at edges (vignette)
      vec2 vc = uv - 0.5*vec2(uRes.x/uRes.y, 1.0);
      col *= 1.0 - dot(vc, vc) * 0.85;

      // subtle grain
      float g = fract(sin(dot(uv, vec2(12.9898,78.233)))*43758.5453);
      col += (g - 0.5) * 0.035;

      // overall brightness
      col *= 0.9;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), mat);
  scene.add(mesh);

  const clock = new THREE.Clock();
  let targetMouse = new THREE.Vector2(0.5, 0.5);

  window.addEventListener('mousemove', e => {
    targetMouse.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  });

  function tick(){
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uMouse.value.lerp(targetMouse, 0.05);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
  });
})();

/* ===================== CURSOR ===================== */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
  // spotlight
  document.querySelector('.spotlight').style.left = mx + 'px';
  document.querySelector('.spotlight').style.top  = my + 'px';
});
function loopRing(){
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(loopRing);
}
loopRing();

document.body.addEventListener('mousedown', () => document.body.classList.add('pressing'));
document.body.addEventListener('mouseup',   () => document.body.classList.remove('pressing'));

// Hover targets
document.querySelectorAll('a, button, .work, .nav-link, .contact-link').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
// VIEW targets (portfolio cards)
document.querySelectorAll('.work').forEach(el => {
  el.addEventListener('mouseenter', () => { document.body.classList.remove('cursor-hover'); document.body.classList.add('cursor-view'); });
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
});

/* ===================== RIPPLE ===================== */
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'rip';
    const size = Math.max(r.width, r.height);
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size/2) + 'px';
    s.style.top  = (e.clientY - r.top  - size/2) + 'px';
    btn.appendChild(s);
    setTimeout(() => s.remove(), 700);
  });
});

/* ===================== CLICK SHOCKWAVE + SPARKS ===================== */
document.body.addEventListener('click', e => {
  const x = e.clientX, y = e.clientY;

  // rings
  for (let i = 0; i < 2; i++){
    const w = document.createElement('div');
    w.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;
      pointer-events:none;z-index:99997;transform:translate(-50%,-50%);
      border:${1.5-i*0.5}px solid rgba(255,207,58,${0.9-i*0.3});`;
    document.body.appendChild(w);
    requestAnimationFrame(() => {
      w.style.transition = 'width .8s cubic-bezier(.22,1,.36,1),height .8s cubic-bezier(.22,1,.36,1),opacity .8s';
      w.style.width  = (300 + i*150) + 'px';
      w.style.height = (300 + i*150) + 'px';
      w.style.opacity = '0';
    });
    setTimeout(() => w.remove(), 900);
  }

  // sparks
  for (let i = 0; i < 22; i++){
    const s = document.createElement('div');
    const size = Math.random() * 6 + 2;
    s.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
      border-radius:50%;pointer-events:none;z-index:99998;
      background:${Math.random() > .5 ? '#ffcf3a' : '#ff7a00'};
      box-shadow:0 0 ${size*3}px ${Math.random()>.5?'#ffcf3a':'#ff7a00'};
      transform:translate(-50%,-50%);`;
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.random() * 160 + 60;
    const tx = Math.cos(ang) * dist;
    const ty = Math.sin(ang) * dist;
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1),opacity .9s';
      s.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
      s.style.opacity = '0';
    });
    setTimeout(() => s.remove(), 1000);
  }
});

/* ===================== LIGHTBOX ===================== */
window.openLightbox = src => {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
};
document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target.id === 'lightbox' || e.target.classList.contains('lb-close')){
    e.currentTarget.classList.remove('active');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){
    document.getElementById('lightbox')?.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ===================== DISCORD COPY ===================== */
window.copyDiscord = e => {
  e?.preventDefault?.();
  const nick = 'bowinhead';
  const done = () => {
    const t = document.getElementById('toast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  };
  if (navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(nick).then(done).catch(() => fb(nick, done));
  } else fb(nick, done);
};
function fb(text, cb){
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position='fixed'; ta.style.left='-9999px';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); cb(); } catch(_){}
  ta.remove();
}

/* ===================== MAGNETIC ===================== */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    el.style.transform = `translate(${x*0.25}px, ${y*0.3}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

/* ===================== 3D TILT ===================== */
document.querySelectorAll('[data-tilt]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const cx = r.width/2, cy = r.height/2;
    const rotX = ((y - cy) / cy) * -8;
    const rotY = ((x - cx) / cx) * 8;
    el.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    // glow card mouse coords
    if (el.classList.contains('glow-card')){
      el.style.setProperty('--mx', x+'px');
      el.style.setProperty('--my', y+'px');
    }
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

/* ===================== SCROLL EFFECTS ===================== */
const nav = document.querySelector('.nav');
const pbar = document.getElementById('progress-bar');
let lastY = window.scrollY, ticking = false;

function onScroll(){
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  pbar.style.width = (y/h*100) + '%';
  if (y > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
  lastY = y; ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
}, {passive:true});
onScroll();

/* ===================== PARALLAX BLOBS handled by shader; add subtle layer parallax ===================== */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.section-title').forEach(el => {
    const r = el.getBoundingClientRect();
    const progress = (window.innerHeight - r.top) / (window.innerHeight + r.height);
    el.style.transform = `translate3d(0, ${(0.5 - progress) * 20}px, 0)`;
  });
}, {passive:true});

/* ===================== OBSERVE ON INIT ===================== */
observeSplit();
// Fallback: if preloader is skipped (slow three.js), trigger anyway after 3s
setTimeout(() => {
  if (document.getElementById('preloader').classList.contains('done')) return;
  preloader.classList.add('done');
  document.body.style.overflow = '';
  document.querySelector('.hero-title')?.classList.add('in');
  setTimeout(() => {
    document.querySelector('.hero-sub')?.classList.add('in');
    document.querySelector('.hero-cta')?.classList.add('in');
  }, 300);
}, 3500);
