document.addEventListener('DOMContentLoaded', () => {

    /* ========== 1. PRELOADER ========== */
    const preloader = document.getElementById('preloader');
    const preBar = document.querySelector('.pre-bar span');
    const prePercent = document.querySelector('.pre-percent');
    let prog = 0;
    const loadInterval = setInterval(() => {
        prog += Math.random() * 18 + 6;
        if (prog > 100) prog = 100;
        preBar.style.width = prog + '%';
        prePercent.textContent = Math.floor(prog) + '%';
        if (prog >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => preloader.classList.add('hide'), 400);
        }
    }, 130);

    /* ========== 2. CUSTOM CURSOR (3 layers with lerp) ========== */
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const aura = document.querySelector('.cursor-aura');
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let dx = mx, dy = my, rx = mx, ry = my, ax = mx, ay = my;

    window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });

    function cursorLoop(){
        dx += (mx - dx) * 0.85;
        dy += (my - dy) * 0.85;
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ax += (mx - ax) * 0.08;
        ay += (my - ay) * 0.08;
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        aura.style.transform = `translate(${ax}px,${ay}px) translate(-50%,-50%)`;
        requestAnimationFrame(cursorLoop);
    }
    cursorLoop();

    const linkHover = document.querySelectorAll('a, button, .nav-item, .ft-link, .pc-row');
    linkHover.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hover-link'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hover-link'));
    });
    document.querySelectorAll('.work-card').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hover-view'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hover-view'));
    });
    window.addEventListener('mousedown', () => document.body.classList.add('pressing'));
    window.addEventListener('mouseup', () => document.body.classList.remove('pressing'));

    /* ========== 3. KINETIC HERO TEXT (letters react to mouse) ========== */
    const heroLines = document.querySelectorAll('.line');
    window.addEventListener('mousemove', e => {
        const cx = window.innerWidth/2, cy = window.innerHeight/2;
        const ox = (e.clientX - cx) / cx;
        const oy = (e.clientY - cy) / cy;
        heroLines.forEach((line, i) => {
            const depth = (i+1) * 8;
            line.style.setProperty('--mx', (ox * depth) + 'px');
            line.style.setProperty('--my', (oy * depth) + 'px');
        });
    });

    /* ========== 4. FX CANVAS — particles + connections + mouse interaction ========== */
    const canvas = document.getElementById('fx-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COLORS = ['255,215,0','255,140,0','255,235,120','255,180,60'];
    const mouse = { x: -9999, y: -9999, radius: 160 };

    function resize(){
        W = canvas.width = window.innerWidth * dpr();
        H = canvas.height = window.innerHeight * dpr();
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }
    function dpr(){ return Math.min(window.devicePixelRatio || 1, 2); }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX * dpr(); mouse.y = e.clientY * dpr(); });
    window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

    class P{
        constructor(){
            this.x = Math.random()*W;
            this.y = Math.random()*H;
            this.vx = (Math.random()-.5)*.35 * dpr();
            this.vy = (Math.random()-.5)*.35 * dpr();
            this.r = (Math.random()*1.6+.4) * dpr();
            this.c = COLORS[Math.floor(Math.random()*COLORS.length)];
            this.a = Math.random()*.55+.15;
        }
        update(){
            // mouse repulsion
            const dx = this.x - mouse.x, dy = this.y - mouse.y;
            const d2 = dx*dx + dy*dy;
            const r = mouse.radius * dpr();
            if (d2 < r*r){
                const d = Math.sqrt(d2);
                const f = (r-d)/r;
                this.x += (dx/d) * f * 2.5;
                this.y += (dy/d) * f * 2.5;
            }
            this.x += this.vx;
            this.y += this.vy;
            if (this.x<0||this.x>W) this.vx *= -1;
            if (this.y<0||this.y>H) this.vy *= -1;
        }
        draw(){
            ctx.beginPath();
            ctx.fillStyle = `rgba(${this.c},${this.a})`;
            ctx.shadowColor = `rgba(${this.c},1)`;
            ctx.shadowBlur = 12 * dpr();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function initP(){
        particles = [];
        const count = window.innerWidth < 768 ? 60 : 130;
        for (let i=0;i<count;i++) particles.push(new P());
    }
    initP();

    function connect(){
        const maxD = 130 * dpr();
        const maxD2 = maxD * maxD;
        for (let i=0;i<particles.length;i++){
            for (let j=i+1;j<particles.length;j++){
                const a = particles[i], b = particles[j];
                const dx = a.x-b.x, dy = a.y-b.y;
                const d2 = dx*dx + dy*dy;
                if (d2 < maxD2){
                    const op = (1 - d2/maxD2) * 0.16;
                    ctx.strokeStyle = `rgba(255,215,0,${op})`;
                    ctx.lineWidth = 0.5 * dpr();
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }

    let rafP;
    function loopP(){
        ctx.clearRect(0,0,W,H);
        for (const p of particles){ p.update(); p.draw(); }
        connect();
        rafP = requestAnimationFrame(loopP);
    }
    loopP();
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(rafP);
        else loopP();
    });

    /* ========== 5. MAGNETIC ELEMENTS ========== */
    document.querySelectorAll('.magnetic').forEach(el => {
        const strength = parseFloat(el.dataset.magneticStrength || 20);
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left - r.width/2;
            const y = e.clientY - r.top - r.height/2;
            el.style.transform = `translate(${(x/r.width)*strength}px, ${(y/r.height)*strength}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0,0)';
        });
    });

    /* ========== 6. TILT WITH DEPTH + SPOTLIGHT ========== */
    document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            const cx = r.width/2, cy = r.height/2;
            const rX = ((y-cy)/cy) * -8;
            const rY = ((x-cx)/cx) * 8;
            card.style.transform = `perspective(1200px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(0)`;
            card.style.setProperty('--x', x + 'px');
            card.style.setProperty('--y', y + 'px');
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)';
        });
    });

    // Spotlight on price cards
    document.querySelectorAll('.spot').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--x', (e.clientX - r.left) + 'px');
            card.style.setProperty('--y', (e.clientY - r.top) + 'px');
        });
    });

    /* ========== 7. REVEAL ON SCROLL ========== */
    const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting){
                en.target.classList.add('on');
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* ========== 8. CLICK WAVES + SPARKS ========== */
    document.body.addEventListener('click', e => {
        // rings
        for (let i=0;i<2;i++){
            const w = document.createElement('div');
            w.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;
                width:0;height:0;border-radius:50%;pointer-events:none;z-index:99997;
                border:${i===0?'2px':'1px'} solid rgba(255,215,0,${i===0?1:.6});
                transform:translate(-50%,-50%);`;
            document.body.appendChild(w);
            const size = i===0 ? 450 : 220;
            w.animate(
                [{width:'0px',height:'0px',opacity:1},{width:size+'px',height:size+'px',opacity:0}],
                {duration: 700 + i*150, easing:'cubic-bezier(.19,1,.22,1)'}
            );
            setTimeout(()=>w.remove(), 900);
        }
        // sparks
        for (let i=0;i<24;i++){
            const s = document.createElement('div');
            const ang = Math.random()*Math.PI*2;
            const dist = 80 + Math.random()*160;
            const tx = Math.cos(ang)*dist, ty = Math.sin(ang)*dist;
            const sz = 2 + Math.random()*5;
            s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;
                width:${sz}px;height:${sz}px;border-radius:50%;pointer-events:none;
                background:rgb(255,${180+Math.floor(Math.random()*70)},0);z-index:99998;
                box-shadow:0 0 12px rgba(255,215,0,.9);`;
            document.body.appendChild(s);
            s.animate(
                [{transform:'translate(-50%,-50%) scale(1)',opacity:1},
                 {transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0)`,opacity:0}],
                {duration: 700 + Math.random()*400, easing:'cubic-bezier(.19,1,.22,1)'}
            );
            setTimeout(()=>s.remove(), 1200);
        }
    });

    /* ========== 9. NAV / PROGRESS / CLOCK ========== */
    const nav = document.querySelector('.nav');
    const progress = document.getElementById('progress');
    window.addEventListener('scroll', () => {
        const st = window.scrollY;
        const dh = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (st/dh*100) + '%';
        nav.classList.toggle('scrolled', st > 40);
    }, { passive: true });

    function tick(){
        const d = new Date();
        document.getElementById('clock').textContent =
            String(d.getHours()).padStart(2,'0') + ':' +
            String(d.getMinutes()).padStart(2,'0') + ':' +
            String(d.getSeconds()).padStart(2,'0');
    }
    tick(); setInterval(tick, 1000);

    /* ========== 10. LIGHTBOX ========== */
    window.openLightbox = src => {
        const lb = document.getElementById('lightbox');
        const img = document.getElementById('lb-img');
        img.src = src;
        lb.classList.add('on');
        document.body.style.overflow = 'hidden';
    };
    document.getElementById('lightbox').addEventListener('click', e => {
        if (e.target.id === 'lightbox' || e.target.classList.contains('lb-close')){
            document.getElementById('lightbox').classList.remove('on');
            document.body.style.overflow = 'auto';
        }
    });

    /* ========== 11. COPY DISCORD ========== */
    window.copyDiscord = function(e){
        e.preventDefault();
        e.stopPropagation();
        const nick = 'bowinhead';
        const done = () => {
            const t = document.getElementById('toast');
            t.classList.add('on');
            setTimeout(()=>t.classList.remove('on'), 2600);
        };
        if (navigator.clipboard && window.isSecureContext){
            navigator.clipboard.writeText(nick).then(done).catch(()=>fallbackCopy(nick, done));
        } else fallbackCopy(nick, done);
    };
    function fallbackCopy(text, cb){
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); cb(); } catch(err){ console.error(err); }
        ta.remove();
    }
});
