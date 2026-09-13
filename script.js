(() => {
'use strict';
const isTouch = matchMedia('(hover: none)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   1. WEBGL FLUID BACKGROUND
   ============================================================ */
const canvas = document.getElementById('gl');
let gl = null, prog = null, glUniforms = {}, dpr = Math.min(window.devicePixelRatio || 1, 1.5);

function initGL(){
    gl = canvas.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'high-performance' });
    if(!gl){ document.body.classList.add('no-gl'); canvas.remove(); return false; }

    const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;
    const frag = `
        precision highp float;
        uniform float uTime;
        uniform vec2 uRes;
        uniform vec2 uMouse;

        vec2 hash(vec2 p){
            p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
            return -1.0 + 2.0*fract(sin(p)*43758.5453123);
        }
        float noise(vec2 p){
            vec2 i = floor(p), f = fract(p);
            vec2 u = f*f*(3.0-2.0*f);
            return mix(
                mix(dot(hash(i+vec2(0.,0.)), f-vec2(0.,0.)),
                    dot(hash(i+vec2(1.,0.)), f-vec2(1.,0.)), u.x),
                mix(dot(hash(i+vec2(0.,1.)), f-vec2(0.,1.)),
                    dot(hash(i+vec2(1.,1.)), f-vec2(1.,1.)), u.x), u.y);
        }

        void main(){
            vec2 uv = gl_FragCoord.xy / uRes.xy;
            float aspect = uRes.x/uRes.y;
            vec2 p = uv; p.x *= aspect;

            vec2 mouse = uMouse / uRes;
            mouse.x *= aspect;

            float t = uTime * 0.09;

            // domain warping — жидкость
            vec2 q = vec2(noise(p*1.4 + t), noise(p*1.4 + vec2(5.2,1.3) - t));
            vec2 r = vec2(noise(p*1.4 + 2.0*q + vec2(1.7,9.2) + t*0.5),
                          noise(p*1.4 + 2.0*q + vec2(8.3,2.8) - t*0.5));
            float f = noise(p*1.4 + 2.4*r);

            // влияние мыши
            float d = length(p - mouse);
            f += exp(-d*3.2) * 0.45;

            vec3 c1 = vec3(0.012,0.012,0.012);
            vec3 c2 = vec3(0.45,0.22,0.02);
            vec3 c3 = vec3(1.0,0.62,0.0);
            vec3 c4 = vec3(1.0,0.84,0.0);

            float f1 = smoothstep(-0.5,0.15,f);
            float f2 = smoothstep(0.0,0.5,f);
            float f3 = smoothstep(0.35,0.85,f);

            vec3 col = mix(c1,c2,f1);
            col = mix(col,c3,f2);
            col = mix(col,c4,f3*0.65);

            // vignette
            vec2 vc = uv - 0.5;
            col *= 1.0 - dot(vc,vc)*1.4;
            col *= 0.9;

            gl_FragColor = vec4(col,1.0);
        }`;

    const mkShader = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
            console.warn(gl.getShaderInfoLog(s)); return null;
        }
        return s;
    };
    const vs = mkShader(gl.VERTEX_SHADER, vert);
    const fs = mkShader(gl.FRAGMENT_SHADER, frag);
    if(!vs || !fs){ document.body.classList.add('no-gl'); canvas.remove(); return false; }

    prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
        document.body.classList.add('no-gl'); canvas.remove(); return false;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    glUniforms.uTime  = gl.getUniformLocation(prog, 'uTime');
    glUniforms.uRes   = gl.getUniformLocation(prog, 'uRes');
    glUniforms.uMouse = gl.getUniformLocation(prog, 'uMouse');

    resizeGL();
    return true;
}

function resizeGL(){
    if(!gl) return;
    const scale = 0.65; // рисуем в меньшем разрешении — дешевле и красивее (размытие)
    const w = Math.max(1, Math.floor(innerWidth  * dpr * scale));
    const h = Math.max(1, Math.floor(innerHeight * dpr * scale));
    if(canvas.width !== w || canvas.height !== h){
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(glUniforms.uRes, w, h);
    }
}

let glMouseX = innerWidth/2, glMouseY = innerHeight/2;
const mouse = { x: glMouseX, y: glMouseY };
let smoothMx = glMouseX, smoothMy = glMouseY;

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
}, { passive: true });

let glRunning = false, glStart = performance.now();
function renderGL(now){
    if(!glRunning) return;
    const t = (now - glStart) / 1000;
    smoothMx += (mouse.x - smoothMx) * 0.05;
    smoothMy += (mouse.y - smoothMy) * 0.05;
    gl.uniform1f(glUniforms.uTime, t);
    gl.uniform2f(glUniforms.uMouse, smoothMx * dpr * 0.65, (innerHeight - smoothMy) * dpr * 0.65);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(renderGL);
}
function startGL(){ if(gl && !glRunning){ glRunning = true; requestAnimationFrame(renderGL); } }
function stopGL(){ glRunning = false; }

if(!isTouch && !reduced){
    if(initGL()) startGL();
} else if(!isTouch){
    initGL();
}

window.addEventListener('resize', resizeGL, { passive: true });
document.addEventListener('visibilitychange', () => document.hidden ? stopGL() : startGL());

/* ============================================================
   2. PRELOADER
   ============================================================ */
const preloader = document.getElementById('preloader');
const preNum = document.getElementById('preNum');
const preFill = document.querySelector('.pre-fill');
let pct = 0;
const pInt = setInterval(() => {
    pct = Math.min(100, pct + Math.random() * 18 + 4);
    preNum.textContent = Math.floor(pct);
    preFill.style.width = pct + '%';
    if(pct >= 100){
        clearInterval(pInt);
        setTimeout(() => preloader.classList.add('done'), 350);
    }
}, 110);

/* ============================================================
   3. KINETIC HERO TITLE
   ============================================================ */
document.querySelectorAll('.hero-title .word').forEach(word => {
    const text = word.dataset.word || '';
    let i = 0;
    for(const ch of text){
        const span = document.createElement('span');
        span.className = 'char' + (ch === ' ' ? ' space' : '');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.setProperty('--i', i++);
        word.appendChild(span);
    }
});

/* ============================================================
   4. CUSTOM CURSOR
   ============================================================ */
if(!isTouch){
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const label = document.querySelector('.cursor-label');
    let mx = innerWidth/2, my = innerHeight/2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    (function animCursor(){
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(animCursor);
    })();

    window.addEventListener('mousedown', () => document.body.classList.add('c-press'));
    window.addEventListener('mouseup',   () => document.body.classList.remove('c-press'));

    // делегирование hover-состояний через data-cursor
    document.addEventListener('mouseover', e => {
        const t = e.target.closest('[data-cursor]');
        if(!t) return;
        const type = t.dataset.cursor;
        document.body.classList.remove('c-hover','c-view','c-link');
        if(type === 'view'){ document.body.classList.add('c-view'); label.textContent = 'VIEW'; }
        else if(type === 'link'){ document.body.classList.add('c-link'); label.textContent = 'LINK'; }
        else { document.body.classList.add('c-hover'); label.textContent = ''; }
    });
    document.addEventListener('mouseout', e => {
        const t = e.target.closest('[data-cursor]');
        if(!t) return;
        const to = e.relatedTarget;
        if(!to || !to.closest || !to.closest('[data-cursor]')){
            document.body.classList.remove('c-hover','c-view','c-link');
        }
    });
}

/* ============================================================
   5. NAV SCROLL
   ============================================================ */
const navEl = document.querySelector('.nav');
const progress = document.getElementById('progress');
let ticking = false;
function onScroll(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(() => {
        const y = scrollY;
        navEl.classList.toggle('scrolled', y > 40);
        const h = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = (y / h * 100) + '%';
        ticking = false;
    });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================================
   6. REVEAL ON SCROLL
   ============================================================ */
const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.work-card, .price-card, .section-title, .eyebrow, .contact-title, .contact-link').forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
});

/* ============================================================
   7. MAGNETIC BUTTONS
   ============================================================ */
if(!isTouch){
    document.querySelectorAll('.magnetic').forEach(el => {
        const str = 0.35;
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width/2) * str;
            const y = (e.clientY - r.top  - r.height/2) * str;
            el.style.transform = `translate(${x}px,${y}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

/* ============================================================
   8. PRICING GLOW FOLLOW
   ============================================================ */
document.querySelectorAll('.price-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top ) + 'px');
    });
});

/* ============================================================
   9. LIGHTBOX
   ============================================================ */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
        const src = card.dataset.art;
        if(!src) return;
        lbImg.src = src;
        lb.classList.add('on');
        document.body.style.overflow = 'hidden';
    });
});
function closeLb(){
    lb.classList.remove('on');
    document.body.style.overflow = '';
}
lb.addEventListener('click', e => { if(e.target === lb || e.target.classList.contains('lb-close')) closeLb(); });
window.addEventListener('keydown', e => { if(e.key === 'Escape') closeLb(); });

/* ============================================================
   10. DISCORD COPY + TOAST
   ============================================================ */
const toast = document.getElementById('toast');
let toastTO;
function showToast(){
    toast.classList.add('on');
    clearTimeout(toastTO);
    toastTO = setTimeout(() => toast.classList.remove('on'), 2600);
}
function fallbackCopy(text){
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); showToast(); } catch(e){ console.warn(e); }
    ta.remove();
}
window.copyDiscord = function(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    const nick = 'bowinhead';
    if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(nick).then(showToast).catch(() => fallbackCopy(nick));
    } else fallbackCopy(nick);
};

/* ============================================================
   11. SMOOTH ANCHORS (fallback for browsers without scroll-behavior)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if(id.length < 2) return;
        const el = document.querySelector(id);
        if(!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

})();
