/* ============================================
   ALLEVAMENTUM — Premium Interactions v3
   indicium.ai-inspired: interactive dot grid,
   glow cards, scroll color text, spring cursor,
   generative card art, Apple-level polish
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
    initHeroDotGrid();
    initGlowCards();
    initScrollColorText();
    initElevateText();
    initWorkCanvases();
    initTestimonials();
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
let scrollY = 0, smoothY = 0;
let isSmooth = true;

function initSmoothScroll() {
    const main = document.getElementById('smooth');
    if (!main || window.innerWidth < 769) { isSmooth = false; return; }

    function updateHeight() {
        document.body.style.height = main.scrollHeight + 'px';
    }
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Observe DOM changes for dynamic content
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

/* ===================== CURSOR (Spring Physics) ===================== */
function initCursor() {
    const dot = document.getElementById('cur');
    const ring = document.getElementById('curRing');
    if (!dot || !ring || window.innerWidth < 769) return;

    let mx = -100, my = -100;
    let dx = -100, dy = -100;
    let rx = -100, ry = -100;
    let vx = 0, vy = 0;
    const stiffness = 0.1;
    const damping = 0.72;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
        dx += (mx - dx) * 0.22;
        dy += (my - dy) * 0.22;
        dot.style.left = dx + 'px';
        dot.style.top = dy + 'px';

        vx = (vx + (mx - rx) * stiffness) * damping;
        vy = (vy + (my - ry) * stiffness) * damping;
        rx += vx;
        ry += vy;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';

        requestAnimationFrame(loop);
    })();

    // Hover effect on interactive elements
    const hovers = 'a,button,.work-card,.service-card,.glow-card,.t-pill,.el-char,.tn-btn,.btn';
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
                const parent = el.parentElement;
                const sibs = parent ? parent.querySelectorAll(':scope > [data-anim]') : [];
                let idx = 0;
                sibs.forEach((s, i) => { if (s === el) idx = i; });
                const totalDelay = delay ? delay * 200 : idx * 140;
                setTimeout(() => el.classList.add('in'), totalDelay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

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
        const dur = 2400;
        const start = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            el.textContent = Math.round(target * ease);
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
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    // Generate dot grid
    const spacing = 32;
    const dots = [];
    const activationRadius = 180;
    const connectionRadius = 60;

    function generateDots() {
        dots.length = 0;
        const cols = Math.ceil(w / spacing) + 1;
        const rows = Math.ceil(h / spacing) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                dots.push({
                    baseX: c * spacing,
                    baseY: r * spacing,
                    x: c * spacing,
                    y: r * spacing,
                    baseAlpha: 0.06 + Math.random() * 0.02,
                    alpha: 0,
                    targetAlpha: 0,
                    size: 1,
                    targetSize: 1,
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
        time += 0.008;

        const activeDots = [];

        for (const dot of dots) {
            // Subtle floating
            dot.x = dot.baseX + Math.sin(time + dot.phase) * 1.5;
            dot.y = dot.baseY + Math.cos(time * 0.8 + dot.phase * 1.3) * 1.5;

            const dx = dot.x - mouse.x;
            const dy = dot.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < activationRadius) {
                const proximity = 1 - dist / activationRadius;
                dot.targetAlpha = dot.baseAlpha + proximity * 0.45;
                dot.targetSize = 1 + proximity * 2.5;
                activeDots.push(dot);

                // Repel slightly from cursor
                const repel = proximity * 4;
                dot.x += (dx / dist) * repel;
                dot.y += (dy / dist) * repel;
            } else {
                dot.targetAlpha = dot.baseAlpha;
                dot.targetSize = 1;
            }

            // Smooth interpolation
            dot.alpha += (dot.targetAlpha - dot.alpha) * 0.08;
            dot.size += (dot.targetSize - dot.size) * 0.08;

            // Draw dot
            if (dot.alpha > 0.01) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230,57,70,${dot.alpha})`;
                ctx.fill();
            }
        }

        // Draw connections between activated dots
        for (let i = 0; i < activeDots.length; i++) {
            for (let j = i + 1; j < activeDots.length; j++) {
                const a = activeDots[i], b = activeDots[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionRadius) {
                    const alpha = (1 - dist / connectionRadius) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(230,57,70,${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Draw a subtle triangle constellation in center
        const cx = w * 0.5, cy = h * 0.4;
        const triSize = Math.min(w, h) * 0.18;
        const triAlpha = 0.015 + Math.sin(time) * 0.005;
        ctx.beginPath();
        ctx.moveTo(cx, cy - triSize);
        ctx.lineTo(cx + triSize * 0.87, cy + triSize * 0.5);
        ctx.lineTo(cx - triSize * 0.87, cy + triSize * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(230,57,70,${triAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Inner triangle
        const inner = triSize * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx, cy - inner);
        ctx.lineTo(cx + inner * 0.87, cy + inner * 0.5);
        ctx.lineTo(cx - inner * 0.87, cy + inner * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(230,57,70,${triAlpha * 0.7})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        requestAnimationFrame(draw);
    }
    draw();
}

/* ===================== GLOW CARDS (Mouse Tracking Border) ===================== */
function initGlowCards() {
    if (window.innerWidth < 769) return;

    document.addEventListener('mousemove', e => {
        const cards = document.querySelectorAll('[data-glow]');
        cards.forEach(card => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            card.style.setProperty('--glow-x', x + 'px');
            card.style.setProperty('--glow-y', y + 'px');
        });
    });
}

/* ===================== SCROLL COLOR TEXT ===================== */
function initScrollColorText() {
    const el = document.querySelector('[data-scroll-color]');
    if (!el) return;

    // Split text into words, preserving <em> tags
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
                const wrapped = wrapWords(child);
                clone.appendChild(wrapped);
            });
            // Wrap the element itself in a word span
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
        // Calculate progress: 0 when section enters, 1 when it leaves
        const start = winH * 0.8;
        const end = winH * 0.2;
        const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
        const litCount = Math.floor(progress * totalWords);

        words.forEach((w, i) => {
            w.classList.toggle('lit', i < litCount);
        });

        requestAnimationFrame(update);
    }
    update();
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
            const maxDist = 320;

            if (dist < maxDist) {
                const force = (maxDist - dist) / maxDist;
                const ease = force * force; // quadratic for snappier feel
                const moveX = (dx / dist) * ease * -24;
                const moveY = (dy / dist) * ease * -18;
                ch.style.transform = `translate(${moveX}px, ${moveY}px)`;
                const alpha = 0.06 + ease * 0.8;
                ch.style.color = `rgba(230,57,70,${alpha})`;
                ch.style.webkitTextStrokeColor = `rgba(230,57,70,${alpha * 0.5})`;
                ch.style.textShadow = `0 0 ${ease * 30}px rgba(230,57,70,${ease * 0.3})`;
            } else {
                ch.style.transform = 'translate(0,0)';
                ch.style.color = 'transparent';
                ch.style.webkitTextStrokeColor = 'rgba(255,255,255,0.06)';
                ch.style.textShadow = 'none';
            }
        });
    });
}

/* ===================== WORK CARD CANVASES ===================== */
function initWorkCanvases() {
    document.querySelectorAll('.wc-canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const type = canvas.dataset.art;
        let w, h;

        function resize() {
            w = canvas.width = canvas.parentElement.offsetWidth;
            h = canvas.height = canvas.parentElement.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        let time = 0;

        function drawGeo() {
            ctx.clearRect(0, 0, w, h);
            time += 0.005;

            // Floating geometric shapes
            const shapes = [
                { x: 0.3, y: 0.35, size: 0.2, rot: time * 0.3, sides: 3 },
                { x: 0.7, y: 0.5, size: 0.15, rot: -time * 0.2, sides: 6 },
                { x: 0.5, y: 0.7, size: 0.12, rot: time * 0.4, sides: 4 },
                { x: 0.2, y: 0.6, size: 0.08, rot: -time * 0.5, sides: 3 },
                { x: 0.8, y: 0.3, size: 0.1, rot: time * 0.25, sides: 5 },
            ];

            shapes.forEach((s, i) => {
                const cx = s.x * w + Math.sin(time + i) * 10;
                const cy = s.y * h + Math.cos(time * 0.8 + i) * 8;
                const size = s.size * Math.min(w, h);

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(s.rot);
                ctx.beginPath();
                for (let j = 0; j < s.sides; j++) {
                    const angle = (Math.PI * 2 / s.sides) * j - Math.PI / 2;
                    const px = Math.cos(angle) * size;
                    const py = Math.sin(angle) * size;
                    j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = `rgba(230,57,70,${0.04 + Math.sin(time + i) * 0.015})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
                ctx.restore();
            });

            // Connecting lines
            for (let i = 0; i < shapes.length - 1; i++) {
                const a = shapes[i], b = shapes[i + 1];
                ctx.beginPath();
                ctx.moveTo(a.x * w + Math.sin(time + i) * 10, a.y * h);
                ctx.lineTo(b.x * w + Math.sin(time + i + 1) * 10, b.y * h);
                ctx.strokeStyle = 'rgba(230,57,70,0.02)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            requestAnimationFrame(drawGeo);
        }

        function drawWave() {
            ctx.clearRect(0, 0, w, h);
            time += 0.008;

            // Multiple wave layers
            for (let layer = 0; layer < 4; layer++) {
                ctx.beginPath();
                const yBase = h * (0.3 + layer * 0.15);
                const amplitude = 30 + layer * 10;
                const frequency = 0.003 + layer * 0.001;
                const alpha = 0.03 - layer * 0.005;

                for (let x = 0; x <= w; x += 3) {
                    const y = yBase + Math.sin(x * frequency + time * (1 + layer * 0.3)) * amplitude
                        + Math.sin(x * frequency * 2.1 + time * 0.7) * amplitude * 0.3;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.strokeStyle = `rgba(230,57,70,${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            // Floating particles
            for (let i = 0; i < 12; i++) {
                const px = (w * (i / 12 + 0.04)) + Math.sin(time * 0.5 + i * 2) * 20;
                const py = h * 0.5 + Math.cos(time * 0.7 + i * 1.5) * h * 0.25;
                const size = 1 + Math.sin(time + i) * 0.5;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230,57,70,${0.08 + Math.sin(time + i) * 0.04})`;
                ctx.fill();
            }

            requestAnimationFrame(drawWave);
        }

        if (type === 'geo') drawGeo();
        else drawWave();
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
    const heroGlow = document.querySelector('.hero-glow');
    if (!heroContent) return;

    (function tick() {
        const y = isSmooth ? smoothY : window.scrollY;
        if (y < window.innerHeight * 1.3) {
            const ratio = y / window.innerHeight;
            heroContent.style.transform = `translateY(${y * 0.18}px)`;
            heroContent.style.opacity = 1 - ratio * 0.65;
            if (heroGlow) {
                heroGlow.style.transform = `translateX(-50%) translateY(${y * 0.1}px)`;
                heroGlow.style.opacity = 1 - ratio * 0.5;
            }
        }
        requestAnimationFrame(tick);
    })();
}

})();
