/* ============================================
   ALLEVAMENTUM — Redesigned Interactions
   Glassmorphism / Atmospheric / Smooth
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
});

function boot() {
    initCursor();
    initNav();
    initMobileMenu();
    initReveal();
    initCounters();
    initHeroCanvas();
    initTilt();
    initTestimonials();
    initSmoothScroll();
    initParallax();
}

/* ===================== PRELOADER ===================== */
function initPreloader() {
    const el = document.getElementById('preloader');
    if (!el) return boot();
    setTimeout(() => {
        el.classList.add('done');
        boot();
    }, 2400);
}

/* ===================== CURSOR ===================== */
function initCursor() {
    const dot = document.getElementById('cursor');
    const glow = document.getElementById('cursorGlow');
    if (!dot || !glow || window.innerWidth < 769) return;

    let mx = 0, my = 0, dx = 0, dy = 0, gx = 0, gy = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    });

    (function loop() {
        dx += (mx - dx) * 0.18;
        dy += (my - dy) * 0.18;
        gx += (mx - gx) * 0.06;
        gy += (my - gy) * 0.06;
        dot.style.left = dx + 'px';
        dot.style.top = dy + 'px';
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';
        requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button, .work-card, .service-card, .tech-pill').forEach(el => {
        el.addEventListener('mouseenter', () => dot.classList.add('hover'));
        el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
    });
}

/* ===================== NAV ===================== */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
}

/* ===================== MOBILE MENU ===================== */
function initMobileMenu() {
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ===================== SCROLL REVEAL ===================== */
function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                const siblings = parent ? parent.querySelectorAll(':scope > [data-reveal]') : [];
                let idx = 0;
                siblings.forEach((s, i) => { if (s === entry.target) idx = i; });
                setTimeout(() => entry.target.classList.add('revealed'), idx * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
}

/* ===================== COUNTERS ===================== */
function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(el => observer.observe(el));

    function animate(el) {
        const target = parseInt(el.dataset.count);
        const dur = 2000;
        const start = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            el.textContent = Math.round(target * ease);
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }
}

/* ===================== HERO CANVAS ===================== */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const mouse = { x: null, y: null };

    function resize() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    const particles = [];
    const count = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 12000));

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * (w || 1),
            y: Math.random() * (h || 1),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.3 + 0.05,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            if (mouse.x !== null) {
                const dx = p.x - mouse.x, dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180) {
                    const f = (180 - dist) / 180;
                    p.vx += (dx / dist) * f * 0.2;
                    p.vy += (dy / dist) * f * 0.2;
                }
            }
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(230,57,70,${p.alpha})`;
            ctx.fill();
        }

        // Connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(230,57,70,${0.06 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }
    draw();
}

/* ===================== TILT ===================== */
function initTilt() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
        const inner = card.querySelector('.work-card-inner') || card;
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            inner.style.transform = `perspective(800px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}

/* ===================== TESTIMONIALS ===================== */
function initTestimonials() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.t-dot');
    const prev = document.getElementById('prevTest');
    const next = document.getElementById('nextTest');
    if (!cards.length || !prev || !next) return;

    let cur = 0;
    const total = cards.length;

    function goTo(i) {
        cards[cur].classList.remove('active');
        dots[cur].classList.remove('active');
        cur = (i + total) % total;
        cards[cur].classList.add('active');
        dots[cur].classList.add('active');
    }

    prev.addEventListener('click', () => goTo(cur - 1));
    next.addEventListener('click', () => goTo(cur + 1));
    setInterval(() => goTo(cur + 1), 7000);
}

/* ===================== SMOOTH SCROLL ===================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* ===================== PARALLAX ===================== */
function initParallax() {
    const hero = document.querySelector('.hero-content');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
            const ratio = y / window.innerHeight;
            hero.style.transform = `translateY(${y * 0.25}px)`;
            hero.style.opacity = 1 - ratio * 0.7;
        }
    }, { passive: true });
}
