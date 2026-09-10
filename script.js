document.addEventListener('DOMContentLoaded', () => {

    // ============ 1. ПРЕЛОАДЕР ============
    const preloader = document.getElementById('preloader');
    const preloaderFill = document.getElementById('preloader-fill');
    const preloaderPercent = document.getElementById('preloader-percent');
    let progress = 0;

    const preloaderInterval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(preloaderInterval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => preloader.style.display = 'none', 800);
            }, 400);
        }
        preloaderFill.style.width = progress + '%';
        preloaderPercent.textContent = Math.floor(progress) + '%';
    }, 100);

    // ============ 2. КУРСОР ============
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline) {
        document.body.style.cursor = 'none';
        let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
            createTrail(mouseX, mouseY);
        });

        function animateCursor() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover эффект
        const hoverElements = document.querySelectorAll('a, button, .portfolio-card, .pricing-card, .nav-link, .social-btn, .lightbox-close');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        window.addEventListener('mousedown', () => document.body.classList.add('pressing'));
        window.addEventListener('mouseup', () => document.body.classList.remove('pressing'));
    } else {
        document.body.style.cursor = 'default';
    }

    // Шлейф курсора
    let lastTrailTime = 0;
    function createTrail(x, y) {
        const now = Date.now();
        if (now - lastTrailTime < 35) return;
        lastTrailTime = now;
        
        const trail = document.createElement('div');
        trail.classList.add('cursor-trail');
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        const size = Math.random() * 4 + 2;
        trail.style.width = size + 'px';
        trail.style.height = size + 'px';
        document.body.appendChild(trail);
        
        setTimeout(() => {
            trail.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            trail.style.opacity = '0';
            trail.style.transform = 'translate(-50%, -50%) scale(0)';
        }, 10);
        setTimeout(() => trail.remove(), 700);
    }

    // ============ 3. ЭФФЕКТЫ КЛИКА ============
    document.body.addEventListener('click', (e) => {
        // Волны
        const outerWave = document.createElement('div');
        outerWave.classList.add('click-wave');
        outerWave.style.left = e.clientX + 'px';
        outerWave.style.top = e.clientY + 'px';
        document.body.appendChild(outerWave);
        
        const innerWave = document.createElement('div');
        innerWave.classList.add('click-wave-inner');
        innerWave.style.left = e.clientX + 'px';
        innerWave.style.top = e.clientY + 'px';
        document.body.appendChild(innerWave);
        
        // Искры
        const sparkColors = ['#FFD700', '#FF8C00', '#FFFFFF', '#FFEA00', '#FFB347'];
        for (let i = 0; i < 24; i++) {
            const spark = document.createElement('div');
            spark.classList.add('spark');
            spark.style.left = e.clientX + 'px';
            spark.style.top = e.clientY + 'px';
            spark.style.background = sparkColors[Math.floor(Math.random() * sparkColors.length)];
            spark.style.boxShadow = `0 0 15px ${spark.style.background}`;
            
            const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.5;
            const distance = Math.random() * 150 + 60;
            spark.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            spark.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 1000);
        }

        setTimeout(() => { outerWave.remove(); innerWave.remove(); }, 900);
    });

    // ============ 4. RIPPLE НА КНОПКАХ ============
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');
            ripple.style.left = (x - size / 2) + 'px';
            ripple.style.top = (y - size / 2) + 'px';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 800);
        });
    });

    // ============ 5. TEXT SCRAMBLE ============
    const scrambleChars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    document.querySelectorAll('[data-scramble]').forEach(el => {
        const original = el.textContent;
        let isScrambling = false;

        el.addEventListener('mouseenter', () => {
            if (isScrambling) return;
            isScrambling = true;
            let iteration = 0;
            const interval = setInterval(() => {
                el.textContent = original.split('').map((char, i) => {
                    if (i < iteration) return original[i];
                    if (char === ' ') return ' ';
                    return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }).join('');
                
                if (iteration >= original.length) {
                    clearInterval(interval);
                    el.textContent = original;
                    isScrambling = false;
                }
                iteration += 1 / 3;
            }, 40);
        });
    });

    // ============ 6. КОПИРОВАНИЕ DISCORD ============
    window.copyDiscord = function(event) {
        event.preventDefault();
        event.stopPropagation();
        const discordNick = "bowinhead";
        
        const showToastMsg = () => {
            const toast = document.getElementById('toast');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        };
        
        const fallbackCopy = (text) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try { document.execCommand('copy'); showToastMsg(); } catch (err) { console.error(err); }
            textArea.remove();
        };
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(discordNick).then(showToastMsg).catch(() => fallbackCopy(discordNick));
        } else {
            fallbackCopy(discordNick);
        }
    };

    // ============ 7. АНИМАЦИЯ ПОЯВЛЕНИЯ ============
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('active'), i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -80px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // ============ 8. СЧЕТЧИКИ ЦЕН ============
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                let current = 0;
                const step = target / 40;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(current);
                }, 25);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));

    // ============ 9. ЧАСТИЦЫ С ПРИТЯЖЕНИЕМ К МЫШИ ============
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        const numberOfParticles = 90;
        const colors = ['#FFD700', '#FF8C00', '#FFFFFF', '#FFEA00'];
        const maxDistance = 130;
        let mouse = { x: null, y: null, radius: 180 };

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                // Притяжение к мыши
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x -= (dx / dist) * force * 1.5;
                        this.y -= (dy / dist) * force * 1.5;
                    }
                }
                
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) particlesArray.push(new Particle());
        }

        function connectParticles() {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    const dx = particlesArray[a].x - particlesArray[b].x;
                    const dy = particlesArray[a].y - particlesArray[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < maxDistance) {
                        const opacity = 1 - (distance / maxDistance);
                        ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.18})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesArray.forEach(p => { p.update(); p.draw(); });
            connectParticles();
            requestAnimationFrame(animateParticles);
        }
        initParticles();
        animateParticles();
    }

    // ============ 10. 3D TILT ============
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1200px) rotateX(0) rotateY(0) scale(1)`;
        });
    });

    // ============ 11. МАГНИТНЫЕ ЭЛЕМЕНТЫ ============
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate(0, 0)`;
        });
    });

    // ============ 12. ПАРАЛЛАКС ФОНА ============
    const blobs = document.querySelectorAll('.bg-blob');
    const heroTitle = document.querySelector('.hero-title');
    let parallaxX = 0, parallaxY = 0, currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
        parallaxX = (e.clientX / window.innerWidth - 0.5) * 60;
        parallaxY = (e.clientY / window.innerHeight - 0.5) * 60;
    });

    function animateParallax() {
        currentX += (parallaxX - currentX) * 0.05;
        currentY += (parallaxY - currentY) * 0.05;
        
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 0.4;
            blob.style.marginLeft = (currentX * speed) + 'px';
            blob.style.marginTop = (currentY * speed) + 'px';
        });
        
        if (heroTitle) {
            heroTitle.style.transform = `translate(${currentX * 0.3}px, ${currentY * 0.3}px)`;
        }
        requestAnimationFrame(animateParallax);
    }
    animateParallax();

    // ============ 13. ПРОГРЕСС СКРОЛЛА И НАВБАР ============
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        document.getElementById('progress-bar').style.width = scrollPercent + '%';
        
        const navbar = document.querySelector('.navbar');
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ============ 14. LIGHTBOX ============
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.getAttribute('data-img');
            lightboxImg.src = imgSrc;
            lightbox.classList.add('active');
        });
    });

    lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') lightbox.classList.remove('active');
    });

    // ============ 15. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});
