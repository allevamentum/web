/* ============================================
   ALLEVAMENTUM — Website Interactions
   Maximum wow-factor animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
});

function boot() {
    initCustomCursor();
    initNavScroll();
    initScrollReveal();
    initCounters();
    initHeroCanvas();
    initTiltCards();
    initTestimonials();
    initSmoothScroll();
    initParallax();
    initMagnetic();
}

/* ===================== PRELOADER ===================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('done');
        boot();
    }, 2200);
}

/* ===================== CUSTOM CURSOR ===================== */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mx = 0, my = 0, cx = 0, cy = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function animate() {
        cx += (mx - cx) * 0.2;
        cy += (my - cy) * 0.2;
        fx += (mx - fx) * 0.08;
        fy += (my - fy) * 0.08;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
        follower.style.left = fx + 'px';
        follower.style.top = fy + 'px';
        requestAnimationFrame(animate);
    }
    animate();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .work-card, .service-item');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}

/* ===================== NAV SCROLL ===================== */
function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let lastY = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 100);
        lastY = y;
    }, { passive: true });
}

/* ===================== SCROLL REVEAL ===================== */
function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger delay based on sibling index
                    const parent = entry.target.parentElement;
                    const siblings = parent.querySelectorAll(':scope > [data-reveal]');
                    let idx = 0;
                    siblings.forEach((s, i) => { if (s === entry.target) idx = i; });
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, idx * 120);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach(el => observer.observe(el));
}

/* ===================== ANIMATED COUNTERS ===================== */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
}

/* ===================== HERO CANVAS (Particle Network) ===================== */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, mouse = { x: null, y: null };

    function resize() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    const particles = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.4 + 0.1,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        particles.forEach(p => {
            // Mouse repulsion
            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.vx += (dx / dist) * force * 0.3;
                    p.vy += (dy / dist) * force * 0.3;
                }
            }

            // Damping
            p.vx *= 0.98;
            p.vy *= 0.98;

            p.x += p.vx;
            p.y += p.vy;

            // Wrap
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(230, 57, 70, ${p.alpha})`;
            ctx.fill();
        });

        // Connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(230, 57, 70, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }
    draw();
}

/* ===================== TILT CARDS (3D) ===================== */
function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}

/* ===================== TESTIMONIALS SLIDER ===================== */
function initTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    const prev = document.getElementById('prevTestimonial');
    const next = document.getElementById('nextTestimonial');
    if (!testimonials.length || !prev || !next) return;

    let current = 0;
    const total = testimonials.length;

    function goTo(index) {
        testimonials[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + total) % total;
        testimonials[current].classList.add('active');
        dots[current].classList.add('active');
    }

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));

    // Auto-advance
    setInterval(() => goTo(current + 1), 6000);
}

/* ===================== SMOOTH SCROLL ===================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            hero.style.transform = `translateY(${y * 0.3}px)`;
            hero.style.opacity = 1 - (y / window.innerHeight) * 0.8;
        }
    }, { passive: true });
}

/* ===================== MAGNETIC BUTTONS ===================== */
function initMagnetic() {
    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}
