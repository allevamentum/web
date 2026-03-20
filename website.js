/* ============================================
   ALLEVAMENTUM — Premium Interactions v4
   Blue-violet scheme, magnetic buttons,
   3D tilt cards, interactive dot grid,
   scroll-color text, text scramble
   ============================================ */

(function(){
'use strict';

document.addEventListener('DOMContentLoaded', () => initLoader());

function boot() {
    initSmoothScroll();
    initCursor();
    initNav();
    initMobileMenu();
    initAnimations();
    initCounters();
    initHeroDotGrid();
    initGlowCards();
    initScrollColorText();
    initTilt();
    initMagnetic();
    initTestimonials();
    initSmoothLinks();
    initParallax();
    initTextScramble();
}

/* ===================== LOADER ===================== */
function initLoader() {
    const el = document.getElementById('loader');
    if (!el) return boot();
    setTimeout(() => { el.classList.add('out'); boot(); }, 2600);
}

/* ===================== SMOOTH SCROLL ===================== */
let scrollY = 0, smoothY = 0, isSmooth = true;

function initSmoothScroll() {
    const main = document.getElementById('smooth');
    if (!main || window.innerWidth < 769) { isSmooth = false; return; }

    function updateHeight() { document.body.style.height = main.scrollHeight + 'px'; }
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const ro = new ResizeObserver(updateHeight);
    ro.observe(main);

    (function tick() {
        scrollY = window.scrollY;
        smoothY += (scrollY - smoothY) * 0.085;
        if (Math.abs(scrollY - smoothY) < 0.5) smoothY = scrollY;
        main.style.transform = `translate3d(0,${-smoothY}px,0)`;
        requestAnimationFrame(tick);
    })();
}

/* ===================== CURSOR ===================== */
function initCursor() {
    const dot = document.getElementById('cur');
    const ring = document.getElementById('curRing');
    if (!dot || !ring || window.innerWidth < 769) return;

    let mx = -100, my = -100, dx = -100, dy = -100, rx = -100, ry = -100, vx = 0, vy = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
        dx += (mx - dx) * 0.22;
        dy += (my - dy) * 0.22;
        dot.style.left = dx + 'px';
        dot.style.top = dy + 'px';

        vx = (vx + (mx - rx) * 0.1) * 0.72;
        vy = (vy + (my - ry) * 0.1) * 0.72;
        rx += vx; ry += vy;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';

        requestAnimationFrame(loop);
    })();

    const hovers = 'a,button,.service-card,.adv-item,.proc-card,.tech-cat,.t-pill,.tn-btn,.btn,.testi-card';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hovers)) { dot.classList.add('big'); ring.classList.add('big'); }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hovers)) { dot.classList.remove('big'); ring.classList.remove('big'); }
    });
}

/* ===================== NAV ===================== */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 100);
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
        burger.classList.remove('on'); menu.classList.remove('on');
        document.body.style.overflow = '';
    }));
}

/* ===================== ANIMATIONS ===================== */
function initAnimations() {
    const els = document.querySelectorAll('[data-anim]');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseFloat(el.dataset.delay || 0);
                const parent = el.parentElement;
                const sibs = parent ? parent.querySelectorAll(':scope > [data-anim]') : [];
                let idx = 0;
                sibs.forEach((s, i) => { if (s === el) idx = i; });
                const totalDelay = delay ? delay * 200 : idx * 150;
                setTimeout(() => el.classList.add('in'), totalDelay);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
    els.forEach(el => obs.observe(el));
}

/* ===================== COUNTERS ===================== */
function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(el => obs.observe(el));

    function countUp(el) {
        const target = parseInt(el.dataset.count);
        const dur = 2400;
        const start = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            // Spring-like bounce at the end
            const ease = p < 0.8
                ? 1 - Math.pow(1 - p / 0.8, 4)
                : 1 + Math.sin((p - 0.8) / 0.2 * Math.PI) * 0.03;
            el.textContent = Math.round(target * Math.min(ease, 1));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }
}

/* ===================== HERO — Interactive Dot Grid ===================== */
function initHeroDotGrid() {
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
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    const spacing = 30;
    let dots = [];
    const activationRadius = 200;
    const connectionRadius = 65;

    function generateDots() {
        dots = [];
        const cols = Math.ceil(w / spacing) + 1;
        const rows = Math.ceil(h / spacing) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                dots.push({
                    baseX: c * spacing, baseY: r * spacing,
                    x: c * spacing, y: r * spacing,
                    baseAlpha: 0.04 + Math.random() * 0.02,
                    alpha: 0, targetAlpha: 0,
                    size: 1, targetSize: 1,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        }
    }
    generateDots();
    window.addEventListener('resize', generateDots);

    let time = 0;

    function draw() {
        ctx.clearRect(0, 0, w, h);
        time += 0.006;

        const activeDots = [];

        for (const dot of dots) {
            dot.x = dot.baseX + Math.sin(time + dot.phase) * 1.2;
            dot.y = dot.baseY + Math.cos(time * 0.7 + dot.phase * 1.3) * 1.2;

            const dx = dot.x - mouse.x, dy = dot.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < activationRadius) {
                const proximity = 1 - dist / activationRadius;
                dot.targetAlpha = dot.baseAlpha + proximity * 0.5;
                dot.targetSize = 1 + proximity * 2.8;
                activeDots.push(dot);
                const repel = proximity * 5;
                dot.x += (dx / dist) * repel;
                dot.y += (dy / dist) * repel;
            } else {
                dot.targetAlpha = dot.baseAlpha;
                dot.targetSize = 1;
            }

            dot.alpha += (dot.targetAlpha - dot.alpha) * 0.07;
            dot.size += (dot.targetSize - dot.size) * 0.07;

            if (dot.alpha > 0.01) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(79,125,247,${dot.alpha})`;
                ctx.fill();
            }
        }

        // Connect activated dots
        for (let i = 0; i < activeDots.length; i++) {
            for (let j = i + 1; j < activeDots.length; j++) {
                const a = activeDots[i], b = activeDots[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionRadius) {
                    const alpha = (1 - dist / connectionRadius) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(79,125,247,${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Brand triangle constellation
        const cx = w * 0.5, cy = h * 0.38;
        const triSize = Math.min(w, h) * 0.16;
        const triAlpha = 0.012 + Math.sin(time * 0.5) * 0.004;

        // Outer
        ctx.beginPath();
        ctx.moveTo(cx, cy - triSize);
        ctx.lineTo(cx + triSize * 0.87, cy + triSize * 0.5);
        ctx.lineTo(cx - triSize * 0.87, cy + triSize * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(79,125,247,${triAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Inner
        const inner = triSize * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - inner);
        ctx.lineTo(cx + inner * 0.87, cy + inner * 0.5);
        ctx.lineTo(cx - inner * 0.87, cy + inner * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(139,108,247,${triAlpha * 0.8})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        requestAnimationFrame(draw);
    }
    draw();
}

/* ===================== GLOW CARDS ===================== */
function initGlowCards() {
    if (window.innerWidth < 769) return;
    document.addEventListener('mousemove', e => {
        document.querySelectorAll('[data-glow]').forEach(card => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--glow-x', (e.clientX - r.left) + 'px');
            card.style.setProperty('--glow-y', (e.clientY - r.top) + 'px');
        });
    });
}

/* ===================== SCROLL COLOR TEXT ===================== */
function initScrollColorText() {
    const el = document.querySelector('[data-scroll-color]');
    if (!el) return;

    const html = el.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let wordIndex = 0;
    function wrapWords(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent.split(/(\s+)/);
            const fragment = document.createDocumentFragment();
            words.forEach(word => {
                if (word.trim()) {
                    const span = document.createElement('span');
                    span.className = 'st-word';
                    span.textContent = word;
                    span.dataset.wordIdx = wordIndex++;
                    fragment.appendChild(span);
                } else if (word) {
                    fragment.appendChild(document.createTextNode(word));
                }
            });
            return fragment;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const clone = node.cloneNode(false);
            Array.from(node.childNodes).forEach(child => {
                clone.appendChild(wrapWords(child));
            });
            const span = document.createElement('span');
            span.className = 'st-word';
            span.dataset.wordIdx = wordIndex++;
            span.appendChild(clone);
            return span;
        }
        return node.cloneNode(true);
    }

    const fragment = document.createDocumentFragment();
    Array.from(tempDiv.childNodes).forEach(child => {
        fragment.appendChild(wrapWords(child));
    });
    el.innerHTML = '';
    el.appendChild(fragment);

    const words = el.querySelectorAll('.st-word');
    const totalWords = words.length;

    function update() {
        const rect = el.getBoundingClientRect();
        const winH = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (winH * 0.8 - rect.top) / (winH * 0.6)));
        const litCount = Math.floor(progress * totalWords);
        words.forEach((w, i) => w.classList.toggle('lit', i < litCount));
        requestAnimationFrame(update);
    }
    update();
}

/* ===================== 3D TILT ===================== */
function initTilt() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(800px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

/* ===================== MAGNETIC BUTTONS ===================== */
function initMagnetic() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => el.style.transition = '', 500);
        });
    });
}

/* ===================== TEXT SCRAMBLE ON HOVER ===================== */
function initTextScramble() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

    document.querySelectorAll('.nav-link, .ft-col a').forEach(link => {
        const original = link.textContent;
        let isScrambling = false;

        link.addEventListener('mouseenter', () => {
            if (isScrambling) return;
            isScrambling = true;
            let iteration = 0;
            const interval = setInterval(() => {
                link.textContent = original.split('')
                    .map((char, i) => {
                        if (i < iteration) return original[i];
                        if (char === ' ') return ' ';
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join('');
                iteration += 1 / 2;
                if (iteration >= original.length) {
                    link.textContent = original;
                    clearInterval(interval);
                    isScrambling = false;
                }
            }, 30);
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
    setInterval(() => goTo(cur + 1), 8000);
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
    const orb1 = document.querySelector('.hero-orb-1');
    const orb2 = document.querySelector('.hero-orb-2');
    if (!heroContent) return;

    (function tick() {
        const y = isSmooth ? smoothY : window.scrollY;
        if (y < window.innerHeight * 1.3) {
            const ratio = y / window.innerHeight;
            heroContent.style.transform = `translateY(${y * 0.18}px)`;
            heroContent.style.opacity = 1 - ratio * 0.7;
            if (orb1) orb1.style.transform = `translate(${Math.sin(Date.now()/3000)*30}px, ${y * 0.08 + Math.cos(Date.now()/4000)*20}px)`;
            if (orb2) orb2.style.transform = `translate(${Math.cos(Date.now()/3500)*25}px, ${y * 0.05 + Math.sin(Date.now()/4500)*15}px)`;
        }
        requestAnimationFrame(tick);
    })();
}

})();
