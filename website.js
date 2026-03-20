/* ============================================
   ALLEVAMENTUM — Premium Interactions
   Custom smooth scroll, generative canvas,
   clip-path reveals, magnetic cursor,
   mouse-reactive text, accordion
   ============================================ */

(function(){
'use strict';

/* ===================== BOOT ===================== */
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
});

function boot() {
    initSmoothScroll();
    initCursor();
    initNav();
    initMobileMenu();
    initAnimations();
    initCounters();
    initHeroCanvas();
    initTilt();
    initAccordion();
    initTestimonials();
    initElevateText();
    initSmoothLinks();
    initParallax();
    // Draw accent underline after hero animation
    setTimeout(() => {
        const a = document.querySelector('.h1-accent');
        if (a) a.classList.add('drawn');
    }, 3600);
}

/* ===================== LOADER ===================== */
function initLoader() {
    const el = document.getElementById('loader');
    if (!el) return boot();
    setTimeout(() => {
        el.classList.add('out');
        boot();
    }, 2600);
}

/* ===================== SMOOTH SCROLL (Lerp) ===================== */
let scrollY = 0, smoothY = 0, scrollH = 0, winH = 0;
let isSmooth = true;

function initSmoothScroll() {
    const main = document.getElementById('smooth');
    if (!main || window.innerWidth < 769) { isSmooth = false; return; }

    document.body.style.height = main.scrollHeight + 'px';
    winH = window.innerHeight;
    scrollH = main.scrollHeight;

    window.addEventListener('resize', () => {
        document.body.style.height = main.scrollHeight + 'px';
        winH = window.innerHeight;
        scrollH = main.scrollHeight;
    });

    (function tick() {
        scrollY = window.scrollY;
        smoothY += (scrollY - smoothY) * 0.09;
        // Snap if close enough
        if (Math.abs(scrollY - smoothY) < 0.5) smoothY = scrollY;
        main.style.transform = `translate3d(0,${-smoothY}px,0)`;
        requestAnimationFrame(tick);
    })();
}

function getCurrentScroll() {
    return isSmooth ? smoothY : window.scrollY;
}

/* ===================== CURSOR ===================== */
function initCursor() {
    const dot = document.getElementById('cur');
    const ring = document.getElementById('curRing');
    if (!dot || !ring || window.innerWidth < 769) return;

    let mx = 0, my = 0;
    let dx = 0, dy = 0;
    let rx = 0, ry = 0;
    // Spring physics for ring
    let vx = 0, vy = 0;
    const stiffness = 0.12;
    const damping = 0.7;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
        // Dot: fast follow
        dx += (mx - dx) * 0.2;
        dy += (my - dy) * 0.2;
        dot.style.left = dx + 'px';
        dot.style.top = dy + 'px';

        // Ring: spring physics
        const ax = (mx - rx) * stiffness;
        const ay = (my - ry) * stiffness;
        vx = (vx + ax) * damping;
        vy = (vy + ay) * damping;
        rx += vx;
        ry += vy;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';

        requestAnimationFrame(loop);
    })();

    const hovers = document.querySelectorAll('a,button,.work-card,.t-pill,.acc-head,.el-char');
    hovers.forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('big'); ring.classList.add('big'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('big'); ring.classList.remove('big'); });
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
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobNav');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('on');
        menu.classList.toggle('on');
        document.body.style.overflow = menu.classList.contains('on') ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
        burger.classList.remove('on');
        menu.classList.remove('on');
        document.body.style.overflow = '';
    }));
}

/* ===================== ANIMATIONS (Reveal) ===================== */
function initAnimations() {
    const els = document.querySelectorAll('[data-anim]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseFloat(el.dataset.delay || 0);
                // Stagger siblings
                const parent = el.parentElement;
                const sibs = parent ? parent.querySelectorAll(':scope > [data-anim]') : [];
                let idx = 0;
                sibs.forEach((s, i) => { if (s === el) idx = i; });
                const totalDelay = delay ? delay * 180 : idx * 120;

                setTimeout(() => el.classList.add('in'), totalDelay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => observer.observe(el));
}

/* ===================== COUNTERS ===================== */
function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); }
        });
    }, { threshold: 0.5 });
    nums.forEach(el => obs.observe(el));

    function countUp(el) {
        const target = parseInt(el.dataset.count);
        const dur = 2200;
        const start = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            el.textContent = Math.round(target * ease);
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }
}

/* ===================== HERO CANVAS — Generative Triangle Mesh ===================== */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const mouse = { x: -1000, y: -1000 };

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
    canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    // Generate points in a mountain-like distribution
    const points = [];
    const numPoints = Math.min(180, Math.floor((window.innerWidth) / 8));

    for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * 1.2 - 0.1; // slight overflow
        // Mountain distribution: more points near bottom, peak in center
        const centerWeight = 1 - Math.abs(x - 0.5) * 2;
        const yBase = 1 - (centerWeight * 0.6 + Math.random() * 0.4) * (0.3 + Math.random() * 0.5);
        points.push({
            ox: x, oy: yBase,
            x: x, y: yBase,
            vx: 0, vy: 0,
            phase: Math.random() * Math.PI * 2,
            speed: 0.003 + Math.random() * 0.005,
            amp: 0.003 + Math.random() * 0.008,
        });
    }

    // Simple Delaunay-like: connect nearby points
    function getConnections() {
        const conns = [];
        const maxDist = 0.12;
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].ox - points[j].ox;
                const dy = points[i].oy - points[j].oy;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < maxDist) conns.push([i, j, d]);
            }
        }
        return conns;
    }

    const connections = getConnections();

    // Find triangles from connections
    const triangles = [];
    const connSet = new Set(connections.map(c => c[0] + '_' + c[1]));
    function hasConn(a, b) {
        const key = Math.min(a,b) + '_' + Math.max(a,b);
        return connSet.has(key);
    }
    for (const [a, b] of connections) {
        for (let c = b + 1; c < points.length; c++) {
            if (hasConn(a, c) && hasConn(b, c)) {
                triangles.push([a, b, c]);
            }
        }
    }

    let time = 0;

    function draw() {
        ctx.clearRect(0, 0, w, h);
        time += 0.016;

        // Update point positions
        for (const p of points) {
            // Gentle floating
            p.x = p.ox + Math.sin(time * 2 + p.phase) * p.amp;
            p.y = p.oy + Math.cos(time * 1.5 + p.phase * 1.3) * p.amp * 0.7;

            // Mouse repulsion
            const px = p.x * w, py = p.y * h;
            const dx = px - mouse.x, dy = py - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
                const force = (160 - dist) / 160 * 0.015;
                p.x += (dx / dist) * force;
                p.y += (dy / dist) * force;
            }
        }

        // Draw filled triangles
        for (const [a, b, c] of triangles) {
            const pa = points[a], pb = points[b], pc = points[c];
            ctx.beginPath();
            ctx.moveTo(pa.x * w, pa.y * h);
            ctx.lineTo(pb.x * w, pb.y * h);
            ctx.lineTo(pc.x * w, pc.y * h);
            ctx.closePath();
            ctx.fillStyle = 'rgba(230,57,70,0.012)';
            ctx.fill();
        }

        // Draw connections
        for (const [i, j, d] of connections) {
            const pa = points[i], pb = points[j];
            const alpha = (1 - d / 0.12) * 0.08;
            ctx.beginPath();
            ctx.moveTo(pa.x * w, pa.y * h);
            ctx.lineTo(pb.x * w, pb.y * h);
            ctx.strokeStyle = `rgba(230,57,70,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Draw points
        for (const p of points) {
            const px = p.x * w, py = p.y * h;
            const dx = px - mouse.x, dy = py - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const glow = dist < 200 ? (200 - dist) / 200 : 0;
            const alpha = 0.1 + glow * 0.4;
            const size = 1 + glow * 2;

            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(230,57,70,${alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    draw();
}

/* ===================== TILT ===================== */
function initTilt() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
        const inner = card.querySelector('.wc-inner') || card;
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            inner.style.transform = `perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

/* ===================== ACCORDION ===================== */
function initAccordion() {
    document.querySelectorAll('.acc-head').forEach(head => {
        head.addEventListener('click', () => {
            const item = head.parentElement;
            const body = item.querySelector('.acc-body');
            const inner = body.querySelector('.acc-body-inner');
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.acc-item.open').forEach(openItem => {
                openItem.classList.remove('open');
                openItem.querySelector('.acc-body').style.maxHeight = '0';
            });

            if (!isOpen) {
                item.classList.add('open');
                body.style.maxHeight = inner.offsetHeight + 'px';
            }

            // Recalculate scroll height
            if (isSmooth) {
                setTimeout(() => {
                    const main = document.getElementById('smooth');
                    document.body.style.height = main.scrollHeight + 'px';
                }, 700);
            }
        });
    });
}

/* ===================== TESTIMONIALS ===================== */
function initTestimonials() {
    const cards = document.querySelectorAll('.testi-card');
    const dots = document.querySelectorAll('.tn-dot');
    const prev = document.getElementById('tPrev');
    const next = document.getElementById('tNext');
    if (!cards.length || !prev || !next) return;

    let cur = 0;
    function goTo(i) {
        cards[cur].classList.remove('active');
        dots[cur].classList.remove('on');
        cur = (i + cards.length) % cards.length;
        cards[cur].classList.add('active');
        dots[cur].classList.add('on');
    }
    prev.addEventListener('click', () => goTo(cur - 1));
    next.addEventListener('click', () => goTo(cur + 1));
    setInterval(() => goTo(cur + 1), 7000);
}

/* ===================== MOUSE-REACTIVE "ELEVATE" ===================== */
function initElevateText() {
    const chars = document.querySelectorAll('.el-char');
    if (!chars.length || window.innerWidth < 769) return;

    document.addEventListener('mousemove', e => {
        chars.forEach(ch => {
            const r = ch.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 300;

            if (dist < maxDist) {
                const force = (maxDist - dist) / maxDist;
                const moveX = (dx / dist) * force * -20;
                const moveY = (dy / dist) * force * -15;
                ch.style.transform = `translate(${moveX}px, ${moveY}px)`;
                const opacity = 0.08 + force * 0.7;
                ch.style.color = `rgba(230,57,70,${opacity})`;
                ch.style.webkitTextStrokeColor = `rgba(230,57,70,${opacity * 0.6})`;
            } else {
                ch.style.transform = 'translate(0,0)';
                ch.style.color = 'transparent';
                ch.style.webkitTextStrokeColor = 'rgba(255,255,255,0.08)';
            }
        });
    });
}

/* ===================== SMOOTH LINKS ===================== */
function initSmoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const top = target.getBoundingClientRect().top + (isSmooth ? smoothY : window.scrollY) - 80;
                window.scrollTo({ top, behavior: isSmooth ? 'auto' : 'smooth' });
                if (isSmooth) scrollY = top;
            }
        });
    });
}

/* ===================== PARALLAX ===================== */
function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    window.addEventListener('scroll', () => {
        const y = isSmooth ? smoothY : window.scrollY;
        if (y < window.innerHeight * 1.2) {
            const ratio = y / window.innerHeight;
            heroContent.style.transform = `translateY(${y * 0.2}px)`;
            heroContent.style.opacity = 1 - ratio * 0.6;
        }
    }, { passive: true });
}

})();
