/* ============================================
   ALLEVAMENTUM — iOS 26.3 Premium v7
   Liquid glass, 3D depth, spring physics,
   emotional visual design, inclusive UX
   ============================================ */

(function(){
'use strict';

document.addEventListener('DOMContentLoaded', () => initLoader());

function boot() {
    initSmoothScroll();
    initScrollProgress();
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
    initSmoothLinks();
    initParallax();
    initTextScramble();
    initBackgroundParticles();
    initDepthCards();
    initFormFocus();
}

/* ===================== LOADER ===================== */
function initLoader() {
    const el = document.getElementById('loader');
    if (!el) return boot();
    setTimeout(() => { el.classList.add('out'); boot(); }, 2600);
}

/* ===================== SMOOTH SCROLL (iOS-style inertia) ===================== */
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

/* ===================== SCROLL PROGRESS ===================== */
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    function update() {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docH > 0 ? (window.scrollY / docH) * 100 : 0;
        bar.style.width = progress + '%';
        requestAnimationFrame(update);
    }
    update();
}

/* ===================== TRIANGLE CURSOR ===================== */
function initCursor() {
    const dot = document.getElementById('cur');
    const glow = document.getElementById('curGlow');
    if (!dot || !glow || window.innerWidth < 769) return;

    let mx = -100, my = -100, dx = -100, dy = -100, gx = -100, gy = -100;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
        dx += (mx - dx) * 0.2;
        dy += (my - dy) * 0.2;
        dot.style.left = dx + 'px';
        dot.style.top = dy + 'px';

        gx += (mx - gx) * 0.1;
        gy += (my - gy) * 0.1;
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';

        requestAnimationFrame(loop);
    })();

    const hovers = 'a,button,.service-card,.adv-item,.proc-card,.tech-cat,.t-pill,.btn,.glass-card';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hovers)) { dot.classList.add('hovering'); glow.classList.add('hovering'); }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hovers)) { dot.classList.remove('hovering'); glow.classList.remove('hovering'); }
    });
}

/* ===================== NAV ===================== */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 80);
        nav.classList.toggle('nav-hidden', y > 300 && y > lastScroll);
        lastScroll = y;
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
                const totalDelay = delay ? delay * 200 : idx * 120;
                setTimeout(() => el.classList.add('in'), totalDelay);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
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

    const spacing = 28;
    let dots = [];
    const activationRadius = 220;
    const connectionRadius = 70;

    const dotColors = [
        [79, 125, 247],
        [139, 108, 247],
        [45, 212, 191],
        [245, 166, 35],
    ];

    function generateDots() {
        dots = [];
        const cols = Math.ceil(w / spacing) + 1;
        const rows = Math.ceil(h / spacing) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const colorRoll = Math.random();
                let color;
                if (colorRoll < 0.6) color = dotColors[0];
                else if (colorRoll < 0.78) color = dotColors[1];
                else if (colorRoll < 0.91) color = dotColors[2];
                else color = dotColors[3];

                dots.push({
                    baseX: c * spacing, baseY: r * spacing,
                    x: c * spacing, y: r * spacing,
                    baseAlpha: 0.035 + Math.random() * 0.025,
                    alpha: 0, targetAlpha: 0,
                    size: 1, targetSize: 1,
                    phase: Math.random() * Math.PI * 2,
                    color: color,
                });
            }
        }
    }
    generateDots();
    window.addEventListener('resize', generateDots);

    let time = 0;

    function draw() {
        ctx.clearRect(0, 0, w, h);
        time += 0.005;

        const activeDots = [];

        for (const dot of dots) {
            dot.x = dot.baseX + Math.sin(time + dot.phase) * 1.5;
            dot.y = dot.baseY + Math.cos(time * 0.7 + dot.phase * 1.3) * 1.5;

            const dx = dot.x - mouse.x, dy = dot.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < activationRadius) {
                const proximity = 1 - dist / activationRadius;
                const pCurve = proximity * proximity;
                dot.targetAlpha = dot.baseAlpha + pCurve * 0.55;
                dot.targetSize = 1 + pCurve * 3;
                activeDots.push(dot);
                const repel = pCurve * 6;
                dot.x += (dx / dist) * repel;
                dot.y += (dy / dist) * repel;
            } else {
                dot.targetAlpha = dot.baseAlpha;
                dot.targetSize = 1;
            }

            dot.alpha += (dot.targetAlpha - dot.alpha) * 0.06;
            dot.size += (dot.targetSize - dot.size) * 0.06;

            if (dot.alpha > 0.01) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                const c = dot.color;
                ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${dot.alpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < activeDots.length; i++) {
            for (let j = i + 1; j < activeDots.length; j++) {
                const a = activeDots[i], b = activeDots[j];
                const ddx = a.x - b.x, ddy = a.y - b.y;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                if (dist < connectionRadius) {
                    const alpha = (1 - dist / connectionRadius) * 0.14;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(79,125,247,${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        /* Ambient triangle watermark */
        const cx = w * 0.5, cy = h * 0.38;
        const triSize = Math.min(w, h) * 0.16;
        const triAlpha = 0.015 + Math.sin(time * 0.4) * 0.005;

        ctx.beginPath();
        ctx.moveTo(cx, cy - triSize);
        ctx.lineTo(cx + triSize * 0.87, cy + triSize * 0.5);
        ctx.lineTo(cx - triSize * 0.87, cy + triSize * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(79,125,247,${triAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const inner = triSize * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - inner);
        ctx.lineTo(cx + inner * 0.87, cy + inner * 0.5);
        ctx.lineTo(cx - inner * 0.87, cy + inner * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(139,108,247,${triAlpha * 0.7})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        requestAnimationFrame(draw);
    }
    draw();
}

/* ===================== BACKGROUND PARTICLES ===================== */
function initBackgroundParticles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = [
        [79, 125, 247],
        [139, 108, 247],
        [45, 212, 191],
        [245, 166, 35],
    ];

    const particleCount = 55;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isTriangle = Math.random() < 0.3;
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.15 - 0.08,
            size: 1.5 + Math.random() * 2.5,
            color: color,
            alpha: 0.025 + Math.random() * 0.05,
            phase: Math.random() * Math.PI * 2,
            isTriangle: isTriangle,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.004,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            p.x += p.vx + Math.sin(p.phase + performance.now() * 0.0002) * 0.12;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;

            const c = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;

            if (p.isTriangle) {
                const s = p.size * 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -s);
                ctx.lineTo(s * 0.87, s * 0.5);
                ctx.lineTo(-s * 0.87, s * 0.5);
                ctx.closePath();
                ctx.strokeStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
                ctx.fill();
            }

            ctx.restore();
        }

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

/* ===================== SCROLL COLOR TEXT (fixed <em> handling) ===================== */
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
            const isEm = node.tagName === 'EM';
            if (isEm) {
                /* Don't double-wrap <em>: process children as emphasis words */
                const fragment = document.createDocumentFragment();
                Array.from(node.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        const words = child.textContent.split(/(\s+)/);
                        words.forEach(word => {
                            if (word.trim()) {
                                const span = document.createElement('span');
                                span.className = 'st-word st-em';
                                span.textContent = word;
                                span.dataset.wordIdx = wordIndex++;
                                fragment.appendChild(span);
                            } else if (word) {
                                fragment.appendChild(document.createTextNode(word));
                            }
                        });
                    } else {
                        fragment.appendChild(wrapWords(child));
                    }
                });
                return fragment;
            }
            const clone = node.cloneNode(false);
            Array.from(node.childNodes).forEach(child => {
                clone.appendChild(wrapWords(child));
            });
            return clone;
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
        const progress = Math.max(0, Math.min(1, (winH * 0.75 - rect.top) / (winH * 0.55)));
        const litCount = Math.floor(progress * totalWords);
        words.forEach((w, i) => w.classList.toggle('lit', i < litCount));
        requestAnimationFrame(update);
    }
    update();
}

/* ===================== 3D TILT (iOS-style perspective) ===================== */
function initTilt() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-10px) scale(1.015)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });
}

/* ===================== 3D DEPTH CARDS ===================== */
function initDepthCards() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('[data-depth]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            const inner = card.querySelector('.adv-inner,.proc-inner,.tc-inner');
            if (inner) {
                inner.style.transform = `translate3d(${x * 8}px, ${y * 8}px, 20px)`;
                inner.style.transition = 'transform 0.3s ease-out';
            }
        });
        card.addEventListener('mouseleave', e => {
            const inner = e.currentTarget.querySelector('.adv-inner,.proc-inner,.tc-inner');
            if (inner) {
                inner.style.transform = 'translate3d(0,0,0)';
            }
        });
    });
}

/* ===================== FORM FOCUS EFFECTS ===================== */
function initFormFocus() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const card = form.closest('.glass-card');
    if (!card) return;

    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('focus', () => {
            card.style.boxShadow = '0 8px 40px rgba(79,125,247,0.15), 0 0 80px rgba(79,125,247,0.06)';
        });
        field.addEventListener('blur', () => {
            card.style.boxShadow = '';
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
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
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

    (function tick() {
        const y = isSmooth ? smoothY : window.scrollY;
        if (y < window.innerHeight * 1.3) {
            const ratio = y / window.innerHeight;
            heroContent.style.transform = `translateY(${y * 0.15}px)`;
            heroContent.style.opacity = 1 - ratio * 0.65;
        }
        requestAnimationFrame(tick);
    })();
}

})();
