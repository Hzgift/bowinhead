/* ============================================================
   bowinhead — interactive layer
============================================================ */
(() => {
'use strict';

const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
const lerp = (a,b,t)=>a+(b-a)*t;
const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));

/* ------- 1. PRELOADER ------- */
const pre    = $('#preloader');
const preNum = $('#preCount');
const preFil = $('#preFill');
let prog = 0;
const tick = setInterval(()=>{
  prog += Math.random()*8+3;
  if (prog >= 100){prog = 100; clearInterval(tick); setTimeout(finish, 350);}
  preNum.textContent = String(Math.floor(prog)).padStart(2,'0');
  preFil.style.inset = `0 ${100-prog}% 0 0`;
},90);
function finish(){
  pre.classList.add('done');
  document.body.classList.add('loaded');
  runHeroIn();
  setTimeout(()=>pre.remove(), 1200);
}

/* ------- 2. SPLIT TEXT ------- */
function splitText(el){
  const txt = el.textContent.trim();
  el.textContent = '';
  const frag = document.createDocumentFragment();
  [...txt].forEach(ch=>{
    const s = document.createElement('span');
    s.className='char';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    frag.appendChild(s);
  });
  el.appendChild(frag);
  return [...el.querySelectorAll('.char')];
}
$$('[data-split]').forEach(splitText);

/* ------- 3. HERO INTRO ANIMATION ------- */
function runHeroIn(){
  const heroChars = $$('.hero-title .char');
  heroChars.forEach((c,i)=>{
    c.style.transition = `transform 1.1s cubic-bezier(.19,1,.22,1) ${i*0.03}s, opacity 0.9s ease ${i*0.03}s`;
    requestAnimationFrame(()=>{
      c.style.transform = 'translateY(0) rotate(0)';
      c.style.opacity = '1';
    });
  });
  $$('.reveal').forEach((el,i)=>{
    setTimeout(()=>el.classList.add('in'), 300 + i*120);
  });
}

/* ------- 4. SMOOTH SCROLL ANCHORS ------- */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id = a.getAttribute('href');
    if (id.length<2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({top: target.offsetTop - 40, behavior:'smooth'});
  });
});

/* ------- 5. CUSTOM CURSOR (lerp) ------- */
const dot  = $('.cursor-dot');
const ring = $('.cursor-ring');
let mx=innerWidth/2, my=innerHeight/2;
let rx=mx, ry=my;
let cx=mx, cy=my;
addEventListener('mousemove', e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
});
(function cursorRAF(){
  rx = lerp(rx, mx, 0.18);
  ry = lerp(ry, my, 0.18);
  ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(cursorRAF);
})();
addEventListener('mousedown',()=>document.body.classList.add('is-press'));
addEventListener('mouseup',  ()=>document.body.classList.remove('is-press'));

/* hover / view states */
const hoverSel = 'a,button,.nav-link,.magnetic,.cta-social';
$$(hoverSel).forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('is-hover'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('is-hover'));
});
$$('.work-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{document.body.classList.add('is-view');document.body.classList.remove('is-hover');});
  el.addEventListener('mouseleave',()=>document.body.classList.remove('is-view'));
});

/* ------- 6. MAGNETIC ELEMENTS ------- */
$$('.magnetic').forEach(el=>{
  const strength = 0.35;
  el.addEventListener('mousemove', e=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2);
    const y = (e.clientY - r.top  - r.height/2);
    el.style.transform = `translate(${x*strength}px,${y*strength}px)`;
    el.style.transition = 'transform .1s linear';
  });
  el.addEventListener('mouseleave',()=>{
    el.style.transition = 'transform .6s cubic-bezier(.19,1,.22,1)';
    el.style.transform = 'translate(0,0)';
  });
});

/* ------- 7. WORK CARD 3D TILT + SPOTLIGHT ------- */
$$('.work-card, .price-card').forEach(card=>{
  let raf=null, tX=0,tY=0,cX=0,cY=0;
  const intensity = 8;
  card.addEventListener('mousemove', e=>{
    const r = card.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const nx = (px / r.width  - .5);
    const ny = (py / r.height - .5);
    tX = -ny * intensity;
    tY =  nx * intensity;
    card.style.setProperty('--mx', px+'px');
    card.style.setProperty('--my', py+'px');
    if (!raf) raf = requestAnimationFrame(update);
  });
  card.addEventListener('mouseleave', ()=>{
    tX=0;tY=0;
    if (!raf) raf = requestAnimationFrame(update);
    setTimeout(()=>{card.style.transition = 'transform .8s cubic-bezier(.19,1,.22,1)';}, 0);
  });
  card.addEventListener('mouseenter', ()=>{
    card.style.transition = 'transform .3s cubic-bezier(.19,1,.22,1)';
  });
  function update(){
    cX = lerp(cX, tX, .12);
    cY = lerp(cY, tY, .12);
    card.style.transform = `perspective(900px) rotateX(${cX}deg) rotateY(${cY}deg)`;
    if (Math.abs(cX-tX)>.01 || Math.abs(cY-tY)>.01) raf = requestAnimationFrame(update);
    else raf = null;
  }
});

/* ------- 8. LIGHTBOX ------- */
const lb = $('#lightbox');
const lbImg = $('#lbImg');
const lbCap = $('#lbCap');
$$('.work-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    lbImg.src = card.dataset.img;
    lbCap.textContent = card.querySelector('.work-name').textContent;
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  });
});
lb.addEventListener('click', e=>{
  if (e.target === lb || e.target.classList.contains('lb-close')){
    lb.classList.remove('on');
    document.body.style.overflow = '';
  }
});
addEventListener('keydown', e=>{
  if (e.key === 'Escape' && lb.classList.contains('on')){
    lb.classList.remove('on');
    document.body.style.overflow = '';
  }
});

/* ------- 9. SECTION REVEALS (split-text for section titles) ------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if (en.isIntersecting){
      en.target.classList.add('in');
      // letter-stagger for its chars if any
      const chars = en.target.querySelectorAll('.char');
      if (chars.length){
        chars.forEach((c,i)=>{
          c.style.transition = `transform .9s cubic-bezier(.19,1,.22,1) ${i*0.02}s, opacity .7s ease ${i*0.02}s`;
          requestAnimationFrame(()=>{
            c.style.transform = 'translateY(0)';
            c.style.opacity = '1';
          });
        });
      }
      io.unobserve(en.target);
    }
  });
}, {threshold:.15});
$$('.reveal, [data-split], .section-head').forEach(el=>io.observe(el));

/* ------- 10. TICKER speed on scroll ------- */
const tickers = $$('.ticker-track');
addEventListener('scroll', ()=>{
  const v = window.scrollY * 0.05;
  tickers.forEach((t,i)=>{
    const sign = i%2 ? -1 : 1;
    t.style.transform = `translateX(${sign * v}px)`;
  });
},{passive:true});

/* ------- 11. SCROLL PROGRESS + NAV ------- */
const sbThumb = $('#sbThumb');
function onScroll(){
  const st = window.scrollY;
  const dh = document.documentElement.scrollHeight - innerHeight;
  const p  = clamp(st/dh,0,1);
  const track = document.querySelector('.scrollbar-track').clientHeight;
  const th = 60 + p*120;
  sbThumb.style.height = th+'px';
  sbThumb.style.top = (p*(track-th))+'px';

  const nav = $('.nav');
  if (st > 60) nav.style.padding = '16px 44px';
  else nav.style.padding = '26px 44px';
}
addEventListener('scroll', onScroll, {passive:true});
onScroll();

/* ------- 12. FLUID BACKGROUND (canvas blobs) ------- */
const fluid = $('#fluid');
if (fluid){
  const ctx = fluid.getContext('2d', {alpha:true});
  let W, H, blobs = [];
  const resize = ()=>{
    W = fluid.width  = innerWidth  * devicePixelRatio;
    H = fluid.height = innerHeight * devicePixelRatio;
    fluid.style.width = innerWidth+'px';
    fluid.style.height= innerHeight+'px';
    ctx.scale(1,1);
  };
  const COLORS = ['#ffce4a','#ff9f1a','#ffdf7a','#ffb84a','#ff7a1a'];
  class Blob{
    constructor(){
      this.x = Math.random()*W;
      this.y = Math.random()*H;
      this.r = (Math.random()*0.28 + 0.18) * Math.min(W,H);
      this.vx = (Math.random()-.5) * 0.35 * devicePixelRatio;
      this.vy = (Math.random()-.5) * 0.35 * devicePixelRatio;
      this.c  = COLORS[Math.floor(Math.random()*COLORS.length)];
      this.a  = 0.55 + Math.random()*0.35;
    }
    step(t){
      this.x += this.vx + Math.sin(t*0.0008 + this.r)*0.15;
      this.y += this.vy + Math.cos(t*0.0009 + this.r)*0.15;
      if (this.x < -this.r) this.x = W+this.r;
      if (this.x > W+this.r) this.x = -this.r;
      if (this.y < -this.r) this.y = H+this.r;
      if (this.y > H+this.r) this.y = -this.r;
    }
    draw(){
      const g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r);
      g.addColorStop(0, this.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = this.a;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fill();
    }
  }
  function init(){ resize(); blobs = []; const n = innerWidth < 700 ? 6 : 10;
    for (let i=0;i<n;i++) blobs.push(new Blob());
  }
  init();
  addEventListener('resize', init);
  let t0 = performance.now();
  (function loop(t){
    ctx.clearRect(0,0,W,H);
    // dark base
    ctx.fillStyle = 'rgba(8,8,10,0.35)';
    ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    blobs.forEach(b=>{ b.step(t); b.draw(); });
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })(t0);
}

/* ------- 13. PARTICLES (skip if reduced motion / small) ------- */
if (innerWidth > 700 && !matchMedia('(prefers-reduced-motion:reduce)').matches){
  const cvs = document.createElement('canvas');
  Object.assign(cvs.style,{
    position:'fixed',inset:'0',width:'100vw',height:'100vh',
    pointerEvents:'none',zIndex:'-1'
  });
  document.body.appendChild(cvs);
  const p = cvs.getContext('2d');
  let PW,PH,parts=[];
  const mouse = {x:-9999,y:-9999};
  const resize = ()=>{
    PW = cvs.width  = innerWidth  * devicePixelRatio;
    PH = cvs.height = innerHeight * devicePixelRatio;
    cvs.style.width = innerWidth+'px';
    cvs.style.height= innerHeight+'px';
  };
  resize(); addEventListener('resize', ()=>{resize(); build();});
  function build(){
    const n = 90;
    parts = Array.from({length:n},()=>({
      x: Math.random()*PW,
      y: Math.random()*PH,
      vx:(Math.random()-.5)*.35*devicePixelRatio,
      vy:(Math.random()-.5)*.35*devicePixelRatio,
      s: Math.random()*1.6*devicePixelRatio + .4,
    }));
  }
  build();
  addEventListener('mousemove', e=>{
    mouse.x = e.clientX*devicePixelRatio;
    mouse.y = e.clientY*devicePixelRatio;
  });
  (function loop(){
    p.clearRect(0,0,PW,PH);
    // connect
    for (let i=0;i<parts.length;i++){
      const a = parts[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x<0||a.x>PW) a.vx*=-1;
      if (a.y<0||a.y>PH) a.vy*=-1;
      // repel
      const dx = a.x-mouse.x, dy = a.y-mouse.y;
      const d2 = dx*dx+dy*dy;
      const R = 140*devicePixelRatio;
      if (d2 < R*R){
        const f = (1 - Math.sqrt(d2)/R) * 3;
        a.x += (dx/Math.sqrt(d2||1))*f;
        a.y += (dy/Math.sqrt(d2||1))*f;
      }
      // draw
      p.beginPath();
      p.arc(a.x,a.y,a.s,0,Math.PI*2);
      p.fillStyle = 'rgba(255,206,74,.55)';
      p.fill();

      for (let j=i+1;j<parts.length;j++){
        const b = parts[j];
        const bx = a.x-b.x, by = a.y-b.y;
        const dd = bx*bx+by*by;
        if (dd < (110*devicePixelRatio)**2){
          const o = 1 - Math.sqrt(dd)/(110*devicePixelRatio);
          p.strokeStyle = `rgba(255,206,74,${o*0.16})`;
          p.lineWidth = 0.6*devicePixelRatio;
          p.beginPath();
          p.moveTo(a.x,a.y); p.lineTo(b.x,b.y);
          p.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  })();
}

/* ------- 14. CLICK WAVES + SPARKS + FLASH ------- */
addEventListener('click', e=>{
  // ignore clicks on lightbox close
  const x = e.clientX, y = e.clientY;
  const wave = document.createElement('div');
  wave.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;
    border:1px solid rgba(255,206,74,.9);border-radius:50%;pointer-events:none;
    z-index:9990;transform:translate(-50%,-50%);box-shadow:0 0 30px rgba(255,206,74,.5);
    animation:cw .9s cubic-bezier(.19,1,.22,1) forwards;`;
  document.body.appendChild(wave);
  if (!document.getElementById('cwStyle')){
    const st = document.createElement('style'); st.id='cwStyle';
    st.textContent = `@keyframes cw{to{width:520px;height:520px;opacity:0}}
    @keyframes sparkFly{0%{transform:translate(-50%,-50%) scale(1);opacity:1}
    100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0);opacity:0}}`;
    document.head.appendChild(st);
  }
  setTimeout(()=>wave.remove(), 950);

  const n = 18;
  for (let i=0;i<n;i++){
    const s = document.createElement('div');
    const a = Math.random()*Math.PI*2;
    const d = Math.random()*140+40;
    s.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:6px;height:6px;
      background:#ffce4a;border-radius:50%;pointer-events:none;z-index:9991;
      box-shadow:0 0 14px #ff9f1a,0 0 4px #fff inset;--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d}px;
      animation:sparkFly .85s cubic-bezier(.22,1,.36,1) forwards;`;
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 880);
  }

  // flash on press
  document.body.animate(
    [{filter:'brightness(1)'},{filter:'brightness(1.08)'},{filter:'brightness(1)'}],
    {duration:260, easing:'ease-out'}
  );
});

/* ------- 15. DISCORD COPY ------- */
window.copyDiscord = function(e){
  e.preventDefault(); e.stopPropagation();
  const nick = 'bowinhead';
  const done = ()=>{
    const t = $('#toast');
    t.classList.add('on');
    setTimeout(()=>t.classList.remove('on'), 2400);
  };
  if (navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(nick).then(done).catch(()=>fallback());
  } else fallback();
  function fallback(){
    const ta = document.createElement('textarea');
    ta.value = nick; ta.style.position='fixed'; ta.style.left='-9999px';
    document.body.appendChild(ta); ta.select();
    try{document.execCommand('copy'); done();}catch(err){console.warn(err)}
    ta.remove();
  }
};

/* ------- 16. WHEEL-based section snap (optional, subtle) ------- */
// skip — не ломаем нативный скролл, чтобы всё осталось плавным.

})();
