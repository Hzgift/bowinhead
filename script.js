document.addEventListener('DOMContentLoaded', () => {

    // 1. Прелоадер
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('preloader').classList.add('hidden');
        }, 1500); // Задержка для красоты
    });

    // 2. Лайтбокс (Галерея)
    window.openLightbox = function(src) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        img.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл
    };

    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close')) {
            document.getElementById('lightbox').classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // 3. Курсор
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline) {
        document.body.style.cursor = 'none';
        let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`;
        });

        function animateCursor() {
            let distX = mouseX - outlineX; let distY = mouseY - outlineY;
            outlineX += distX * 0.15; outlineY += distY * 0.15;
            cursorOutline.style.left = `${outlineX}px`; cursorOutline.style.top = `${outlineY}px`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Состояния курсора
        const hoverElements = document.querySelectorAll('a, button, .nav-link, .social-link');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        const viewElements = document.querySelectorAll('.portfolio-card');
        viewElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-view'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
        });

        window.addEventListener('mousedown', () => document.body.classList.add('pressing'));
        window.addEventListener('mouseup', () => document.body.classList.remove('pressing'));
    } else {
        document.body.style.cursor = 'default';
    }

    // 4. Ripple эффект на кнопках
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 5. ГЛОБАЛЬНЫЕ ЭФФЕКТЫ ПРИ КЛИКЕ (Волны + Искры)
    document.body.addEventListener('click', (e) => {
        // Волны
        const outerWave = document.createElement('div');
        outerWave.classList.add('click-wave');
        outerWave.style.left = `${e.clientX}px`; outerWave.style.top = `${e.clientY}px`;
        document.body.appendChild(outerWave);
        
        const innerWave = document.createElement('div');
        innerWave.classList.add('click-wave-inner');
        innerWave.style.left = `${e.clientX}px`; innerWave.style.top = `${e.clientY}px`;
        document.body.appendChild(innerWave);
        
        // Искры
        const sparkCount = 25;
        for (let i = 0; i < sparkCount; i++) {
            const spark = document.createElement('div');
            spark.classList.add('spark');
            spark.style.left = `${e.clientX}px`; spark.style.top = `${e.clientY}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150 + 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            spark.style.setProperty('--tx', `${tx}px`);
            spark.style.setProperty('--ty', `${ty}px`);
            
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 900);
        }

        setTimeout(() => { outerWave.remove(); innerWave.remove(); }, 800);
    });

    // 6. Копирование Discord
    window.copyDiscord = function(event) {
        event.preventDefault(); event.stopPropagation();
        const discordNick = "bowinhead";
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(discordNick).then(showToast).catch(() => fallbackCopy(discordNick));
        } else {
            fallbackCopy(discordNick);
        }
    };

    function fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-999999px";
        document.body.appendChild(textArea); textArea.focus(); textArea.select();
        try { document.execCommand('copy'); showToast(); } catch (err) { console.error('Ошибка копирования', err); }
        textArea.remove();
    }

    function showToast() {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // 7. Анимация появления
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // 8. ЧАСТИЦЫ С ОТТАЛКИВАНИЕМ ОТ МЫШИ
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        const numberOfParticles = 150;
        const colors = ['#FFD700', '#FF8C00', '#FFFFFF', '#FFEA00'];
        const maxDistance = 130;
        let mouse = { x: null, y: null, radius: 150 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX; mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null; mouse.y = null;
        });

        canvas.width = window.innerWidth; canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            initParticles();
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 0.5;
                this.baseX = this.x; this.baseY = this.y;
                this.speedX = Math.random() * 0.8 - 0.4; this.speedY = Math.random() * 0.8 - 0.4;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.2;
                this.density = (Math.random() * 30) + 1;
            }
            update() {
                // Отталкивание от мыши
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let forceDirectionX = dx / distance;
                        let forceDirectionY = dy / distance;
                        let maxDistance = mouse.radius;
                        let force = (maxDistance - distance) / maxDistance;
                        let directionX = forceDirectionX * force * this.density;
                        let directionY = forceDirectionY * force * this.density;
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
                
                this.x += this.speedX; this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = this.color; ctx.globalAlpha = this.opacity;
                ctx.shadowBlur = 10; ctx.shadowColor = this.color;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) particlesArray.push(new Particle());
        }

        function connectParticles() {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < maxDistance) {
                        let opacity = 1 - (distance / maxDistance);
                        ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesArray.forEach(p => { p.update(); p.draw(); });
            connectParticles(); requestAnimationFrame(animateParticles);
        }
        initParticles(); animateParticles();
    }

    // 9. 3D Tilt и Динамическое свечение карточек
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const centerX = rect.width / 2; const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            
            // Для свечения
            if (card.classList.contains('glow-card')) {
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        });
    });

    // 10. Магнитные элементы
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = `translate(0, 0)`; });
    });

    // 11. Параллакс фона
    const blobs = document.querySelectorAll('.bg-blob');
    const heroTitle = document.querySelector('.hero-title');
    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 0.6;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
        if (heroTitle) heroTitle.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
    });

    // 12. Прогресс скролла и навбар
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        document.getElementById('progress-bar').style.width = scrollPercent + '%';
        
        const navbar = document.querySelector('.navbar');
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(5, 5, 5, 0.95)';
            navbar.style.padding = '15px 50px';
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(5, 5, 5, 0.6)';
            navbar.style.padding = '20px 50px';
            navbar.style.boxShadow = 'none';
        }
    });

});
