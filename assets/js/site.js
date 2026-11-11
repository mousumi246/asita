/* Asish & Ipsita: the invitation card.
   Opens the envelope, places the embroidered art, and runs each page's animation.
   Motion is kept to transforms and opacity so scrolling stays smooth. */
(() => {
'use strict';
const CONFIG = window.CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement, main = $('#main'), hd = $('#hd'), foot = $('#foot'), env = $('#env');

// if a library failed to load, show the page without the envelope rather than a locked screen
if (!window.gsap || !window.ScrollTrigger || !window.Orn) { env && env.remove(); return; }

const Orn = window.Orn;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - t, 3);
const wait = ms => new Promise(r => setTimeout(r, ms));
const f2 = n => +n.toFixed(2);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const graphemes = s => (window.Intl && Intl.Segmenter) ? [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].map(x => x.segment) : Array.from(s);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const thumb = src => /images\.unsplash\.com/.test(src) ? src.replace(/([?&])w=\d+/, '$1w=360') : src;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'expo.out', duration: 1.2 });
ScrollTrigger.config({ ignoreMobileResize: true });

/* ═════════ ornaments: gradients for the written names, paisley corners, line art ═════════ */
document.body.insertAdjacentHTML('afterbegin', Orn.defs());
$$('[data-card]').forEach(c => c.insertAdjacentHTML('afterbegin', '<i class="cn cn--tl"></i><i class="cn cn--tr"></i><i class="cn cn--br"></i><i class="cn cn--bl"></i>'));
const ORN = { divider: () => Orn.divider(240), mandala: () => Orn.mandala(), wheel: () => Orn.wheel() };
$$('[data-orn]').forEach(el => { el.innerHTML = ORN[el.dataset.orn](el); });

// torans repeat a whole number of times across the card (odd on the names card, so no bell hangs over the window)
function sizeToran(el) {
  const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
  const t0 = H * 1.5; let n = Math.max(1, Math.round(W / t0));
  if (el.hasAttribute('data-odd') && n % 2 === 0) n += W / t0 > n ? 1 : -1;
  el.style.backgroundSize = `${f2(W / Math.max(1, n))}px 100%`;
}
const torans = $$('[data-toran]');
const ro = new ResizeObserver(es => es.forEach(e => sizeToran(e.target)));
torans.forEach(t => { sizeToran(t); ro.observe(t); });

/* ═════════ embroidered arch frames, drawn at the window's live size ═════════ */
const Zari = (() => {
  let uid = 0;
  const cord = (d, w, per = w * .8, col = '#D7AF5A') => `<path d="${d}" fill="none" stroke="#6E4A12" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${f2(w * .78)}" stroke-dasharray="${f2(per * .62)} ${f2(per * .38)}" stroke-linejoin="round"/>`;
  const chain = d => `<path d="${d}" fill="none" stroke="#D7AF5A" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="2 2"/>`;
  const NS = 'http://www.w3.org/2000/svg';
  const probe = document.createElementNS(NS, 'svg'); probe.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden'); probe.setAttribute('aria-hidden', 'true');
  const pp = document.createElementNS(NS, 'path'); probe.appendChild(pp); document.body.appendChild(probe);
  const shift = (d, x, y) => d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (m, a, b) => `${f2(+a + x)} ${f2(+b + y)}`);
  const closed = (w, h, o) => shift(Orn.archPath(w + 2 * o, h + o).d, -o, -o);
  const open = (w, h, o) => closed(w, h, o).replace(/Z$/, '');
  function frame(w, h, pad = 24) {
    const id = 'z' + (++uid), top = 40, W = w + 2 * pad, H = h + pad + top + 14;
    let g = '', pr = '';
    const band = `${closed(w, h, 14)} ${closed(w, h, 4)}`;
    g += `<path d="${band}" fill-rule="evenodd" fill="#5E1022"/><path d="${band}" fill-rule="evenodd" fill="url(#${id}t)"/>`;
    g += cord(open(w, h, 3), 3.4, 2.8);
    g += cord(open(w, h, 15), 2.8, 2.2);
    g += chain(open(w, h, 21));
    pp.setAttribute('d', open(w, h, 9));
    const L = pp.getTotalLength(), n = Math.round(L / 6.4);
    for (let i = 0; i <= n; i++) { const p = pp.getPointAtLength(i / n * L); pr += `<circle cx="${f2(p.x)}" cy="${f2(p.y)}" r="2.4" fill="url(#${id}p)"/>`; }
    // plinth under the window
    g += `<rect x="-26" y="${h}" width="${w + 52}" height="13" fill="#5E1022"/><rect x="-26" y="${h}" width="${w + 52}" height="13" fill="url(#${id}t)"/>`;
    g += cord(`M-26 ${h + .5}H${w + 26}`, 2.6, 2.2) + cord(`M-26 ${h + 12.5}H${w + 26}`, 2.6, 2.2);
    for (let x = -18; x <= w + 18; x += 9) g += `<circle cx="${x}" cy="${h + 6.5}" r="1.9" fill="url(#${id}s)"/>`;
    // finial: a sequin flower crowned with pearls
    const ay = Orn.archPath(w + 42, h + 21).apexY - 21;
    for (let i = 0; i < 6; i++) { const a = (i * 60 - 90) * Math.PI / 180; g += `<ellipse cx="${f2(w / 2 + Math.cos(a) * 6)}" cy="${f2(ay - 9 + Math.sin(a) * 6)}" rx="5" ry="3" transform="rotate(${i * 60 - 90} ${f2(w / 2 + Math.cos(a) * 6)} ${f2(ay - 9 + Math.sin(a) * 6)})" fill="#C42638"/>`; }
    g += `<circle cx="${w / 2}" cy="${ay - 9}" r="3.4" fill="url(#${id}s)"/>`;
    [[0, -24, 2.6], [-6, -20, 1.8], [6, -20, 1.8]].forEach(([dx, dy, r]) => pr += `<circle cx="${w / 2 + dx}" cy="${ay + dy}" r="${r}" fill="url(#${id}p)"/>`);
    const defs = `<defs>
      <filter id="${id}f" filterUnits="userSpaceOnUse" x="${-pad - 20}" y="${-top - pad - 20}" width="${W + 40}" height="${H + 40}" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="ab"/><feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="lum"/>
        <feComposite in="ab" in2="lum" operator="arithmetic" k2=".5" k3=".5" result="h"/>
        <feDiffuseLighting in="h" surfaceScale="2.2" diffuseConstant="1.28" result="d"><feDistantLight azimuth="225" elevation="52"/></feDiffuseLighting>
        <feSpecularLighting in="h" surfaceScale="2.2" specularConstant=".85" specularExponent="22" lighting-color="#FFF3D6" result="s"><feDistantLight azimuth="225" elevation="40"/></feSpecularLighting>
        <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" result="m"/><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
        <feComposite in="m" in2="s2" operator="arithmetic" k2="1" k3=".6" result="l"/><feComposite in="l" in2="SourceAlpha" operator="in" result="l2"/>
        <feGaussianBlur in="SourceAlpha" stdDeviation=".9" result="sb"/><feOffset in="sb" dx=".7" dy="1.1" result="so"/><feFlood flood-color="#2A0A06" flood-opacity=".5"/><feComposite in2="so" operator="in" result="sh"/>
        <feMerge><feMergeNode in="sh"/><feMergeNode in="l2"/></feMerge></filter>
      <filter id="${id}d" filterUnits="userSpaceOnUse" x="${-pad - 20}" y="${-top - pad - 20}" width="${W + 40}" height="${H + 40}"><feDropShadow dx=".6" dy="1" stdDeviation=".7" flood-color="#2A0A06" flood-opacity=".5"/></filter>
      <pattern id="${id}t" width="40" height="1.25" patternUnits="userSpaceOnUse"><rect width="40" height=".55" fill="#fff" fill-opacity=".17"/><rect y=".72" width="40" height=".5" fill="#000" fill-opacity=".11"/></pattern>
      <radialGradient id="${id}p" cx=".5" cy=".5" r=".5" fx=".34" fy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#F7F1E6"/><stop offset=".78" stop-color="#D8CCB4"/><stop offset="1" stop-color="#A28F6E"/></radialGradient>
      <radialGradient id="${id}s" cx=".5" cy=".5" r=".5" fx=".38" fy=".34"><stop offset="0" stop-color="#FFF7D4"/><stop offset=".35" stop-color="#EBC86E"/><stop offset=".8" stop-color="#B98B34"/><stop offset="1" stop-color="#7E5719"/></radialGradient></defs>`;
    return { W, H, top, svg: `<svg viewBox="${-pad} ${-top - pad} ${W} ${H}" aria-hidden="true">${defs}<g filter="url(#${id}f)">${g}</g><g filter="url(#${id}d)">${pr}</g></svg>` };
  }
  function inside(d, pts) { pp.setAttribute('d', d); return pts.every(([x, y]) => pp.isPointInFill(new DOMPoint(x, y))); }
  return { frame, shift, inside };
})();
function placeFrame(win, el, pad) {
  const w = win.offsetWidth, h = win.offsetHeight; if (!w || !h) return;
  const k = w + 'x' + h; if (el._k === k) return; el._k = k;
  const fr = Zari.frame(w, h, pad);
  Object.assign(el.style, { left: -pad + 'px', top: -(fr.top + pad) + 'px', width: fr.W + 'px', height: fr.H + 'px' });
  el.innerHTML = fr.svg;
}

/* ═════════ smooth scrolling ═════════ */
let lenis = null;
if (!RM && window.Lenis) {
  lenis = new Lenis({ lerp: .1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollToEl = el => { if (lenis) lenis.scrollTo(el, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) }); else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); };
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
  if (html.classList.contains('menu-open')) Menu.close(() => scrollToEl(t)); else scrollToEl(t);
}));

/* ═════════ sparks and petal bursts ═════════ */
const FX = (() => {
  const cv = $('#fx'), ctx = cv.getContext('2d'); let parts = [], raf = 0, dpr = 1, last = 0;
  const size = () => { dpr = Math.min(1.5, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  size(); addEventListener('resize', size);
  const GOLD = ['#FFE19A', '#FFC14D', '#F6D68A', '#FFF3D0'], PETAL = ['#F7A21B', '#FFC234', '#E8742F', '#D7344A', '#FFB020'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function embers(x, y, n = 30, spread = 1) {
    if (RM) return;
    for (let i = 0; i < n; i++) parts.push({ k: 'e', x: x + (Math.random() - .5) * 20 * spread, y, vx: (Math.random() - .5) * 2 * spread, vy: -1 - Math.random() * 3, g: -.01, s: .8 + Math.random() * 1.6, c: pick(GOLD), life: 1, d: .014 + Math.random() * .012, w: Math.random() * 6.28 });
    go();
  }
  function burst(x, y, n = 60, power = 1) {
    if (RM) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 8) * power;
      parts.push({ k: Math.random() < .6 ? 'p' : 'e', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * power, g: .12, s: 1.2 + Math.random() * 2.2, c: Math.random() < .3 ? pick(GOLD) : pick(PETAL), life: 1, d: .007 + Math.random() * .006, w: Math.random() * 6.28, r: Math.random() * 6.28 });
    }
    go();
  }
  function tick(now) {
    const k = last ? clamp((now - last) / 16.67, .5, 3) : 1; last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g * k; p.vx *= Math.pow(.98, k); p.vy *= Math.pow(.98, k); p.w += .07 * k; p.x += (p.vx + Math.sin(p.w) * .5) * k; p.y += p.vy * k; p.life -= p.d * k;
      if (p.life <= 0 || p.y > innerHeight + 40) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.life * 1.8);
      if (p.k === 'e') { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 1.3, 0, 6.29); ctx.fill(); ctx.globalAlpha *= .25; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 3.5, 0, 6.29); ctx.fill(); }
      else { ctx.save(); ctx.translate(p.x, p.y); p.r += .07 * k; ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.s * 3.4, p.s * 1.6 * Math.abs(Math.cos(p.w)) + .6, 0, 0, 6.29); ctx.fill(); ctx.restore(); }
    }
    ctx.globalAlpha = 1;
    if (parts.length) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
  return { embers, burst };
})();

/* ═════════ a few marigold petals drifting down ═════════ */
const Petals = (() => {
  const cv = $('#petals'), ctx = cv.getContext('2d'); let W = 0, H = 0, on = false, last = 0, started = false;
  const COLS = [['#FFB21E', '#F28A0E'], ['#FFC93D', '#F7A21B'], ['#F59A1A', '#D86A08'], ['#E2475B', '#B9233A']];
  const P = [];
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W; cv.height = H; };
  size(); addEventListener('resize', size);
  const make = top => ({ x: Math.random() * W, y: top ? -20 - Math.random() * H * .4 : Math.random() * H, s: 4 + Math.random() * 4, vy: .35 + Math.random() * .45, sw: Math.random() * 6.28, sws: .01 + Math.random() * .012, r: Math.random() * 6.28, vr: (Math.random() - .5) * .03, flip: Math.random() * 6.28, c: COLS[Math.random() < .12 ? 3 : Math.floor(Math.random() * 3)] });
  for (let i = 0; i < (innerWidth < 700 ? 7 : 12); i++) P.push(make(false));
  let vel = 0;
  function tick(now) {
    if (!on) return;
    const k = last ? clamp((now - last) / 16.67, .5, 3) : 1; last = now;
    vel += ((lenis ? lenis.velocity : 0) - vel) * .1;
    ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      p.sw += p.sws * k; p.flip += .03 * k; p.r += p.vr * k;
      p.x += Math.sin(p.sw) * .5 * k; p.y += (p.vy - vel * .05) * k;
      if (p.y > H + 20) Object.assign(p, make(true));
      if (p.y < -60) p.y = H + 10;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.abs(Math.cos(p.flip)) * .7 + .3);
      ctx.globalAlpha = .85; ctx.fillStyle = p.c[0];
      ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.bezierCurveTo(p.s * .9, -p.s * .5, p.s * .7, p.s * .8, 0, p.s); ctx.bezierCurveTo(-p.s * .7, p.s * .8, -p.s * .9, -p.s * .5, 0, -p.s); ctx.fill();
      ctx.globalAlpha = .5; ctx.fillStyle = p.c[1]; ctx.beginPath(); ctx.ellipse(0, p.s * .3, p.s * .25, p.s * .6, 0, 0, 6.29); ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(tick);
  }
  const start = () => { if (RM || on) return; on = true; last = 0; requestAnimationFrame(tick); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) on = false; else if (started) start(); });
  return { start: () => { started = true; start(); } };
})();

/* ═════════ typewriter ═════════ */
function typeInto(el, text, speed = 34) {
  return new Promise(res => {
    if (RM) { el.textContent = text; return res(); }
    const g = graphemes(text); let k = 0;
    (function step() {
      if (k >= g.length) return res();
      el.textContent = g.slice(0, ++k).join('');
      setTimeout(step, g[k - 1] === '\n' ? speed * 8 : speed + Math.random() * speed * .6);
    })();
  });
}

/* ═════════ 0 · THE ENVELOPE ═════════ */
const mantraEl = $('#mantraText'), translitEl = $('#translit');
const mantraText = mantraEl.textContent.trim().replace(/ ([।॥])/g, ' $1'), translitText = translitEl.textContent.trim();
mantraEl.textContent = ''; translitEl.textContent = '';
translitEl.setAttribute('aria-label', translitText);

(() => {
  const box = $('#envBox'), flap = $('#envFlap'), card = $('#envCard'), seal = $('#seal'), hint = $('#envHint'), forEl = $('.env__for');
  html.classList.add('is-locked'); main.inert = true; hd.inert = true; foot.inert = true;
  let opened = false;

  // gold dust drifting up behind the envelope
  const Dust = (() => {
    const cv = $('#dust'), ctx = cv.getContext('2d'); let W = 0, H = 0, on = !RM;
    const size = () => { W = innerWidth; H = innerHeight; cv.width = W; cv.height = H; };
    size(); addEventListener('resize', size);
    const P = Array.from({ length: innerWidth < 700 ? 34 : 64 }, () => ({ x: Math.random(), y: Math.random(), s: .5 + Math.random() * 1.5, v: .0002 + Math.random() * .0005, w: Math.random() * 6.28, a: .2 + Math.random() * .55 }));
    function tick() {
      if (!on) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y -= p.v; p.w += .02; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        ctx.globalAlpha = p.a * .6 * (.6 + .4 * Math.sin(p.w * 3)); ctx.fillStyle = '#C99A3B'; ctx.beginPath(); ctx.arc(p.x * W + Math.sin(p.w) * 12, p.y * H, p.s, 0, 6.29); ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    if (on) requestAnimationFrame(tick);
    return { stop: () => { on = false; } };
  })();

  gsap.set(seal, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  if (!RM) {
    gsap.set(forEl, { opacity: 0, y: 24 });
    gsap.set(box, { opacity: 0, y: 70, rotateX: 18, transformPerspective: 1400, transformOrigin: '50% 100%' });
    gsap.set(hint, { opacity: 0 });
    gsap.set(seal, { scale: 0, rotate: -40 });
  }
  const imgs = $$('img', box).map(i => i.decode ? i.decode().catch(() => {}) : Promise.resolve());
  (async () => {
    await Promise.race([Promise.all([document.fonts.ready, ...imgs]), wait(2500)]);
    if (RM) return;
    gsap.timeline()
      .to(forEl, { opacity: 1, y: 0, duration: 1.6 }, .1)
      .to(box, { opacity: 1, y: 0, rotateX: 0, duration: 2 }, .3)
      .to(seal, { scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(2)' }, 1.2)
      .to(hint, { opacity: 1, duration: 1 }, 1.7)
      .to(box, { y: -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 2.3);
  })();

  function open() {
    if (opened) return; opened = true;
    gsap.killTweensOf(box);
    const sr = seal.getBoundingClientRect();
    if (RM) { done(); return; }
    FX.burst(sr.left + sr.width / 2, sr.top + sr.height / 2, 40, .7);
    const br = box.getBoundingClientRect(), cr = card.getBoundingClientRect();
    gsap.set([flap, card, '.env__front', '.env__back'], { force3D: true });
    gsap.timeline({ onComplete: done })
      .to([hint, forEl], { opacity: 0, y: -16, duration: .6, ease: 'power2.in' }, 0)
      .to(box, { y: 0, duration: .4, ease: 'power2.out' }, 0)
      .to(seal, { scale: 1.15, duration: .16, ease: 'power2.out' }, 0)
      .to(seal, { y: innerHeight * .9, x: 40, rotate: 110, duration: 1.15, ease: 'power2.in' }, .16)
      .to(seal, { opacity: 0, duration: .3 }, 1)
      .to(flap, { rotateX: 180, duration: 1.15, ease: 'power3.inOut' }, .26)
      .set(flap, { zIndex: 0 }, .84)
      .set(card, { zIndex: 2 }, .84)
      .to(card, { y: -cr.height * .62, duration: 1.3, ease: 'power3.inOut' }, 1.05)
      .add(() => FX.burst(br.left + br.width / 2, br.top + br.height * .15, 80, 1.05), 1.85)
      // the envelope drops away and the card grows into the page
      .to(['.env__back', '.env__front', flap, '.env__shadow'], { y: innerHeight * .75, opacity: 0, duration: 1.1, ease: 'power3.in' }, 2.3)
      .to(card, { y: 0, scale: Math.max(innerWidth / cr.width, innerHeight / cr.height) * 1.08, duration: 1.4, ease: 'expo.inOut' }, 2.5)
      .to(card, { opacity: 0, duration: .5, ease: 'power1.in' }, 3.3)
      .to(env, { opacity: 0, duration: .8 }, 3.2)
      .add(beginEnter, 3.15);
  }
  seal.addEventListener('click', e => { e.stopPropagation(); open(); });
  box.addEventListener('click', open);

  function done() {
    Dust.stop(); env.remove();
    html.classList.remove('is-locked'); main.inert = false; hd.inert = false; foot.inert = false;
    lenis && lenis.start();
    ScrollTrigger.sort(); ScrollTrigger.refresh();
    if (RM) beginEnter();
    Petals.start();
  }
})();

/* ═════════ 1 · THE BLESSING ═════════ */
const altar = $('.altar');
if (!RM) {
  gsap.set('#begin .om, #begin .sri, #begin .meaning, #begin .jay, #begin .cue', { opacity: 0 });
  gsap.set('#begin .om', { scale: .7, y: 10 });
  gsap.set('#begin .altar > *', { opacity: 0, y: 30 });
  gsap.set('#begin .toran', { yPercent: -60, opacity: 0 });
}
let begun = false;
function beginEnter() {
  if (begun) return; begun = true;
  gsap.to(hd, { opacity: 1, duration: 1.4, ease: 'power2.out' });
  if (RM) { mantraEl.textContent = mantraText; translitEl.textContent = translitText; altar.classList.remove('unlit'); return; }
  gsap.from('#begin .card', { scale: 1.04, opacity: 0, duration: 1.4, ease: 'power2.out' });
  gsap.timeline({ delay: .2 })
    .to('#begin .toran', { yPercent: 0, opacity: 1, duration: 1.8, ease: 'elastic.out(1,.6)' }, 0)
    .to('#begin .om', { opacity: 1, scale: 1, y: 0, duration: 1.8 }, .3)
    .to('#begin .sri', { opacity: 1, duration: 1.2 }, .9)
    .add(async () => { await typeInto(mantraEl, mantraText, 40); typeInto(translitEl, translitText, 14); }, 1.2)
    .to('#begin .altar > *', { opacity: 1, y: 0, duration: 1.6, stagger: .15 }, 1.6)
    .add(() => { altar.classList.remove('unlit'); $$('.altar .diya').forEach(d => { const r = d.getBoundingClientRect(); FX.embers(r.left + r.width * .41, r.top + r.height * .2, 18, .5); }); }, 2.7)
    .to('#begin .meaning', { opacity: 1, duration: 1.4 }, 4)
    .to('#begin .jay', { opacity: 1, duration: 1.4 }, 4.4)
    .to('#begin .cue', { opacity: 1, duration: 1 }, 4.8);
}

/* ═════════ MENU ═════════ */
const Menu = (() => {
  const m = $('#menu'), btn = $('#menuBtn'), lbl = $('#menuLbl'), tor = $('.menu .toran');
  let open = false, tl = null;
  gsap.set('.menu__nav a>span', { yPercent: 110 });
  gsap.set(tor, { yPercent: -60 });
  function show() {
    open = true; html.classList.add('menu-open'); btn.setAttribute('aria-expanded', 'true'); lbl.textContent = 'Close';
    lenis && lenis.stop();
    tl && tl.kill();
    tl = gsap.timeline();
    tl.set(m, { visibility: 'visible' }).add(() => sizeToran(tor))
      .to('.menu__bg', { clipPath: 'inset(0 0 0% 0)', duration: RM ? .01 : 1, ease: 'expo.inOut' })
      .to(tor, { opacity: 1, yPercent: 0, duration: 1.4, ease: 'elastic.out(1,.6)' }, .5)
      .to('.menu__nav a>span', { yPercent: 0, duration: 1.1, stagger: .05 }, .45)
      .to('.menu__foot', { opacity: 1, duration: .8 }, .8);
    setTimeout(() => $('.menu__nav a').focus({ preventScroll: true }), 600);
  }
  function close(cb) {
    open = false; html.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false'); lbl.textContent = 'Menu';
    tl && tl.kill();
    tl = gsap.timeline({ onComplete: () => { gsap.set(m, { visibility: 'hidden' }); gsap.set('.menu__nav a>span', { yPercent: 110 }); gsap.set(tor, { yPercent: -60, opacity: 0 }); lenis && lenis.start(); cb && cb(); } });
    tl.to('.menu__nav a>span', { yPercent: -110, duration: .5, stagger: .025, ease: 'power3.in' })
      .to(['.menu__foot', tor], { opacity: 0, duration: .3 }, 0)
      .to('.menu__bg', { clipPath: 'inset(0 0 100% 0)', duration: RM ? .01 : .9, ease: 'expo.inOut' }, .2);
  }
  btn.addEventListener('click', () => open ? close() : show());
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) close(); });
  return { close };
})();

/* ═════════ 2 · NAMES: the film behind a window in the card; scrolling zooms through it ═════════ */
(() => {
  const stage = $('#namesStage'), zoom = $('#namesZoom'), win = $('#win'), frameEl = $('#winFrame'), vid = $('#heroVideo'), film = $('#film'), V = CONFIG.heroVideo || {};
  if (V.poster) vid.poster = V.poster;

  /* film: downloaded whole, then seeked with the scroll */
  let dur = 0, cur = 0, seeking = false, pending = null, ready = false, visible = false;
  const st = { v: RM ? 1 : 0 };
  const seekTo = t => {
    if (seeking) { pending = t; return; }
    if (Math.abs(vid.currentTime - t) < .015) return;
    seeking = true; try { vid.currentTime = t; } catch (e) { seeking = false; }
  };
  vid.addEventListener('seeked', () => { seeking = false; if (pending !== null) { const t = pending; pending = null; seekTo(t); } });
  vid.addEventListener('loadedmetadata', () => { dur = vid.duration || 0; });
  vid.addEventListener('loadeddata', () => {
    ready = true; film.classList.add('vid-ready');
    const pr = vid.play(); if (pr && pr.then) pr.then(() => { vid.pause(); seekTo(cur); }).catch(() => {});
  });
  (async () => {
    for (const url of [V.src, V.fallback].filter(Boolean)) {
      try {
        const r = await fetch(url, { mode: 'cors' }); if (!r.ok) continue;
        const blob = await r.blob(); if (!/^video\//.test(blob.type) && blob.size < 100000) continue;
        vid.src = URL.createObjectURL(blob); return;
      } catch (e) { /* CORS or network: stream it instead */ }
    }
    vid.addEventListener('error', () => { if (V.fallback && vid.currentSrc !== V.fallback) vid.src = V.fallback; }, { once: true });
    vid.src = V.src || V.fallback || '';
  })();
  new IntersectionObserver(([e]) => visible = e.isIntersecting, { rootMargin: '200px' }).observe(stage);
  gsap.ticker.add(() => {
    if (!ready || !dur || !visible) return;
    const target = clamp(st.v) * (dur - .05);
    cur += (target - cur) * (RM ? 1 : .22);
    if (Math.abs(target - cur) < .003) cur = target;
    seekTo(cur);
  });

  /* the window: cut through the card, framed in zari, and the zoom that carries you through it */
  const Z = { s: 4, dx: 0, dy: 0 };
  function measure() {
    const w = win.offsetWidth, h = win.offsetHeight; if (!w || !h) return;
    let x = 0, y = 0, el = win;
    while (el && el !== zoom) { x += el.offsetLeft; y += el.offsetTop; const p = el.offsetParent; if (!p) break; if (p !== zoom) { x += p.clientLeft; y += p.clientTop; } el = p; }
    const arch = Orn.archPath(w, h).d;
    const W = zoom.offsetWidth, H = zoom.offsetHeight;
    zoom.style.clipPath = `path(evenodd, "M0 0H${W}V${H}H0Z${Zari.shift(arch, x, y)}")`;
    placeFrame(win, frameEl, 24);
    // aim the zoom at a point low in the arch, and find how far to scale so the window fills the screen
    const ox = x + w / 2, oy = y + Math.max(h - w * .62, h * .55), sw = stage.clientWidth, sh = stage.clientHeight;
    Z.dx = sw / 2 - ox; Z.dy = sh / 2 - oy;
    const pts = s => { const out = []; for (let i = 0; i <= 8; i++) { const u = i / 8; out.push([u * sw, 0], [u * sw, sh], [0, u * sh], [sw, u * sh]); } return out.map(([px, py]) => [ox - x + (px - sw / 2) / s, oy - y + (py - sh / 2) / s]); };
    let lo = 1, hi = 80;
    for (let i = 0; i < 26; i++) { const mid = (lo + hi) / 2; if (Zari.inside(arch, pts(mid))) hi = mid; else lo = mid; }
    Z.s = hi * 1.06;
    gsap.set(zoom, { transformOrigin: `${f2(ox)}px ${f2(oy)}px` });
  }
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  document.fonts.ready.then(() => { win._m = 0; measure(); });

  const texts = $$('.nm text'), smalls = $$('.nm small');
  if (RM) {
    gsap.set(texts, { strokeDashoffset: 0, fillOpacity: 1 }); gsap.set(smalls, { opacity: 1 }); gsap.set('.nm svg', { '--wp': '0%' });
    gsap.set(zoom, { autoAlpha: 0 }); gsap.set('#filmShade', { opacity: 1 });
    return;
  }
  // as the card arrives: the frame and elephants settle in, then the names are written in gold
  gsap.set('#winFrame', { opacity: 0, scale: .96, transformOrigin: '50% 100%' });
  gsap.set('.ele--l', { xPercent: -40, opacity: 0 }); gsap.set('.ele--r', { xPercent: 40, opacity: 0 });
  gsap.set('#namesMeta > *', { opacity: 0, y: 20 });
  const arrive = gsap.timeline({ paused: true })
    .to('#winFrame', { opacity: 1, scale: 1, duration: 1.6 }, 0)
    .to('.ele--l, .ele--r', { xPercent: 0, opacity: 1, duration: 2.2, ease: 'power3.out', stagger: .1 }, .2);
  [['.nm--a', .5], ['.nm--b', 1.5]].forEach(([s, at]) => {
    arrive.fromTo(`${s} svg`, { '--wp': '100%' }, { '--wp': '0%', duration: 1.8, ease: 'power1.inOut' }, at)
      .to(`${s} text`, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' }, at)
      .to(`${s} text`, { fillOpacity: 1, duration: .9, ease: 'power1.out' }, at + 1.3)
      .to(`${s} small`, { opacity: 1, duration: .9 }, at + 1.6);
  });
  arrive.to('#namesMeta > *', { opacity: 1, y: 0, duration: 1.2, stagger: .12 }, 2.6);
  ScrollTrigger.create({ trigger: stage, start: 'top 62%', once: true, onEnter: () => arrive.play() });

  // pinned: the film plays with your scroll while the card flies past and the window becomes the screen
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: stage, start: 'top top', end: '+=320%', pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true, onEnter: () => arrive.progress() < .6 && arrive.progress(1) } })
    .to(st, { v: 1, duration: 1 }, 0)
    .fromTo(vid, { scale: 1.06 }, { scale: 1.3, duration: 1 }, 0)
    .to(zoom, { x: () => Z.dx, y: () => Z.dy, scale: () => Z.s, duration: .5, ease: 'power3.in' }, .04)
    .to(zoom, { autoAlpha: 0, duration: .03 }, .53)
    .to('#filmShade', { opacity: 1, duration: .14 }, .48)
    .fromTo('#namesOver > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .1, stagger: .035, ease: 'power2.out' }, .6)
    .to({}, { duration: .001 }, 1);
})();

/* ═════════ 3 · THE INVITATION: a gatefold that opens as you scroll ═════════ */
(() => {
  const inv = $('#inv'), body = document.createElement('div');
  body.className = 'inv__body';
  [...inv.children].forEach(c => body.appendChild(c));
  inv.appendChild(body);
  const fit = () => {
    body.style.transform = 'none';
    const cs = getComputedStyle(inv), avH = inv.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom), avW = inv.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const k = Math.min(1, avH / body.offsetHeight, avW / body.offsetWidth);
    body.style.transform = k < 1 ? `scale(${k.toFixed(3)})` : 'none';
  };
  document.fonts.ready.then(fit); addEventListener('resize', fit); fit();
  const items = $$('.inv__body > *');
  if (RM) { gsap.set('#flapL', { rotateY: -178 }); gsap.set('#flapR', { rotateY: 178 }); $('#gateHint').style.visibility = 'hidden'; return; }
  gsap.set(items, { opacity: 0, y: 16 });
  gsap.set('.gate__art', { scale: .92, opacity: .4 });
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#inviteStage', start: 'top top', end: '+=210%', pin: true, scrub: .8, anticipatePin: 1 } })
    .to('#gateHint', { opacity: 0, duration: .06 }, 0)
    .to('#flapL', { rotateY: -178, duration: .42, ease: 'power2.inOut' }, .04)
    .to('#flapR', { rotateY: 178, duration: .42, ease: 'power2.inOut' }, .07)
    .to('.gate__art', { scale: 1, opacity: 1, duration: .3, ease: 'power2.out' }, .22)
    .to(items, { opacity: 1, y: 0, duration: .1, stagger: .022, ease: 'power2.out' }, .3)
    .to({}, { duration: .001 }, 1);
  gsap.from('#gate', { rotateX: 12, y: 60, scale: .94, transformPerspective: 1800, duration: 1.6, scrollTrigger: { trigger: '#inviteStage', start: 'top 80%', once: true } });
})();

/* ═════════ cards land on the velvet as they arrive ═════════ */
const once = (el, start = 'top 86%') => ({ trigger: el, start, once: true });
if (!RM) {
  $$('#couple .card, #day .card, #venue .card, #rsvp .card').forEach(card => {
    gsap.from(card, { y: 110, rotateX: 10, scale: .95, opacity: 0, transformPerspective: 1800, transformOrigin: '50% 0%', duration: 1.7, ease: 'expo.out', clearProps: 'transform', scrollTrigger: once(card, 'top 94%') });
  });
  $$('[data-rise]').forEach((el, i) => gsap.from(el, { opacity: 0, y: 46, duration: 1.5, delay: (i % 2) * .12, scrollTrigger: once(el, 'top 90%') }));
  $$('.sec-title').forEach(el => gsap.from(el, { opacity: 0, y: 26, scale: .97, duration: 1.6, scrollTrigger: once(el, 'top 90%') }));
  $$('.sec-sub').forEach(el => gsap.from(el, { opacity: 0, letterSpacing: '.55em', duration: 1.8, scrollTrigger: once(el, 'top 92%') }));
}

/* ═════════ 4 · COUPLE ═════════ */
if (!RM) {
  gsap.from('.duo__and', { scale: .5, opacity: 0, rotate: -15, duration: 1.6, ease: 'back.out(2)', scrollTrigger: once('.duo__and', 'top 85%') });
  gsap.from('.medal__img', { clipPath: 'circle(0% at 50% 50%)', duration: 1.8, ease: 'expo.inOut', stagger: .2, scrollTrigger: once('.duo', 'top 80%') });
  gsap.from('.medal__img img', { scale: 1.5, duration: 2.4, ease: 'expo.out', stagger: .2, scrollTrigger: once('.duo', 'top 80%') });
  gsap.from('.medal__ring', { scale: .85, opacity: 0, rotate: -20, duration: 1.8, stagger: .2, scrollTrigger: once('.duo', 'top 80%') });
  gsap.from('#pond', { y: 40, opacity: 0, duration: 1.6, scrollTrigger: once('#pond', 'top 96%') });
}

/* ═════════ 5 · THE DAY: calendar, panchang, countdown ═════════ */
const [Y, Mo, Da] = (CONFIG.date || '2026-12-06').split('-').map(Number);
const hasTime = /^\d{1,2}:\d{2}$/.test(CONFIG.time || '');
const [hh, mm] = hasTime ? CONFIG.time.split(':').map(Number) : [0, 0];
const startUTC = Date.UTC(Y, Mo - 1, Da, hh, mm) - 330 * 60000; // IST = UTC+5:30
const timeLabel = hasTime ? new Date(Date.UTC(2000, 0, 1, hh, mm)).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '';
if (hasTime) {
  $$('#namesMeta .date, .names__when').forEach(e => e.textContent = `Sunday, 6 December 2026 · ${timeLabel} · Bhubaneswar`);
  $('.inv__when').innerHTML = `Sunday, 6 December 2026, from ${timeLabel}<br>Hotel Pal Heights, Jayadev Vihar<br>Bhubaneswar`;
}
(() => {
  const grid = $('#calGrid'), first = new Date(Date.UTC(Y, Mo - 1, 1)).getUTCDay(), days = new Date(Date.UTC(Y, Mo, 0)).getUTCDate();
  let h = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<b>${d}</b>`).join('');
  for (let i = 0; i < first; i++) h += '<span></span>';
  for (let d = 1; d <= days; d++) {
    const sun = (first + d - 1) % 7 === 0;
    if (d === Da) h += `<span class="the${sun ? ' sun' : ''}">${d}<svg class="cal__heart" viewBox="-60 -60 120 120" aria-hidden="true"><path pathLength="1" d="M3 33C-20 16-46 0-41-23C-36-44-10-45 0-23C7-45 36-48 43-27C50-6 27 14-1 36C-6 40-13 38-11 31"/></svg></span>`;
    else h += `<span${sun ? ' class="sun"' : ''}>${d}</span>`;
  }
  grid.innerHTML = h;
  const heart = $('.cal__heart path', grid), mw = $$('.day__mandala .w'), md = $$('.day__mandala .dot');
  if (RM) { gsap.set(heart, { strokeDashoffset: 0 }); gsap.set(mw, { strokeDashoffset: 0 }); gsap.set(md, { opacity: 1 }); return; }
  gsap.from('#calGrid span', { opacity: 0, scale: .6, duration: .9, stagger: { each: .016, from: Da + first - 1 }, ease: 'back.out(2)', scrollTrigger: once(grid, 'top 80%') });
  gsap.to(heart, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', delay: .9, scrollTrigger: once(grid, 'top 80%') });
  gsap.from('.day__num', { scale: 1.3, opacity: 0, duration: 2, scrollTrigger: once('.day__num', 'top 85%') });
  gsap.from('.day__wd, .day__month', { opacity: 0, y: 20, duration: 1.4, stagger: .15, scrollTrigger: once('.day__num', 'top 85%') });
  gsap.to(mw, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', stagger: { amount: .8 }, scrollTrigger: once('.day__big', 'top 75%') });
  gsap.to(md, { opacity: 1, duration: .6, stagger: { amount: .8 }, delay: 1.6, scrollTrigger: once('.day__big', 'top 75%') });
})();
$$('[data-type]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => typeInto(el, el.dataset.type, 44) }));
(() => {
  const odos = Object.fromEntries($$('.odo').map(e => [e.dataset.k, e]));
  const build = (el, n) => { el.innerHTML = Array.from({ length: n }, () => `<span class="odo__s">${Array.from({ length: 10 }, (_, i) => `<span>${i}</span>`).join('')}</span>`).join(''); };
  const set = (k, v) => {
    const s = String(v).padStart(2, '0'), el = odos[k];
    if (el.childElementCount !== s.length) build(el, s.length);
    [...el.children].forEach((c, i) => c.style.transform = `translateY(${-+s[i]}em)`);
  };
  function upd() {
    let ms = startUTC - Date.now();
    if (ms <= 0) { const end = startUTC + (hasTime ? CONFIG.durationHours || 4 : 24) * 3600000; $('#cdTitle').textContent = Date.now() < end ? 'Today is the day' : 'Thank you for celebrating with us'; ms = 0; }
    const s = Math.floor(ms / 1000);
    set('d', Math.floor(s / 86400)); set('h', Math.floor(s % 86400 / 3600)); set('m', Math.floor(s % 3600 / 60)); set('s', s % 60);
  }
  upd(); setInterval(upd, 1000);
  const pad = n => String(n).padStart(2, '0');
  const fmt = t => { const d = new Date(t); return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`; };
  const title = 'Asish & Ipsita: Nirbandha (engagement)', details = 'The engagement of Asish Sahoo and Ipsita Senapati. Margashirsha Krishna Trayodashi, Ravi Pradosh.';
  const day = `${Y}${pad(Mo)}${pad(Da)}`, nx = new Date(Date.UTC(Y, Mo - 1, Da + 1)), nextDay = `${nx.getUTCFullYear()}${pad(nx.getUTCMonth() + 1)}${pad(nx.getUTCDate())}`;
  const dur = (CONFIG.durationHours || 4) * 3600000;
  const dates = hasTime ? `${fmt(startUTC)}/${fmt(startUTC + dur)}` : `${day}/${nextDay}`;
  const loc = CONFIG.venue.name + ', ' + CONFIG.venue.address;
  $('#gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + dates + '&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(loc);
  $('#ics').addEventListener('click', () => {
    const esc = s => s.replace(/,/g, '\\,');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Asish and Ipsita//Engagement//EN', 'BEGIN:VEVENT', 'UID:asish-ipsita-20261206@engagement', 'DTSTAMP:' + fmt(Date.now()),
      ...(hasTime ? ['DTSTART:' + fmt(startUTC), 'DTEND:' + fmt(startUTC + dur)] : ['DTSTART;VALUE=DATE:' + day, 'DTEND;VALUE=DATE:' + nextDay]),
      'SUMMARY:' + esc(title), 'DESCRIPTION:' + esc(details), 'LOCATION:' + esc(loc), 'END:VEVENT', 'END:VCALENDAR'];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    const a = document.createElement('a'); a.href = url; a.download = 'asish-ipsita-engagement.ics'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
})();

/* ═════════ 6 · MOMENTS: a sphere of photographs ═════════ */
const Sphere = (() => {
  const stage = $('#sphere'), M = CONFIG.moments || [], DEG = Math.PI / 180;
  if (!M.length) return { pause() {} };
  const N = innerWidth < 700 ? 46 : 70, GA = Math.PI * (3 - Math.sqrt(5)), r = rng(42);
  const pts = Array.from({ length: N }, (_, i) => {
    const y = 1 - (i + .5) / N * 2, rad = Math.sqrt(1 - y * y), t = i * GA;
    const a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1), R = 2.2 + r();
    return { x: Math.cos(t) * rad, y, z: Math.sin(t) * rad, sx: R * Math.sin(b) * Math.cos(a), sy: R * Math.cos(b), sz: R * Math.sin(b) * Math.sin(a), dl: r() * .6 };
  });
  const nodes = pts.map((q, i) => {
    const m = M[i % M.length], b = document.createElement('button');
    b.className = 'hn'; b.type = 'button'; b.dataset.i = i % M.length; b.setAttribute('aria-label', 'Open photo: ' + m.title);
    if (i >= M.length) b.tabIndex = -1;
    b.innerHTML = `<img src="${thumb(m.src)}" alt="" decoding="async" draggable="false">`;
    stage.appendChild(b); return b;
  });
  let S = 0, Rr = 0, Pp = 0, half = 0, rotY = 0, rotX = -14, vY = 0, vX = 0, dragging = false, moved = 0, lx = 0, ly = 0, visible = false, raf = 0, t0 = 0, last = 0, assembled = RM, paused = false;
  function size() { S = stage.clientWidth; Rr = S * .4; Pp = Rr * 3.4; const s = Math.round(S * (innerWidth < 700 ? .105 : .1)); half = s / 2; stage.style.setProperty('--s', s + 'px'); }
  size(); addEventListener('resize', size);
  function frame(now) {
    raf = 0; if (!visible || paused) return;
    if (!t0) t0 = now; const el = (now - t0) / 1000, k = last ? clamp((now - last) / 16.67, .5, 3) : 1; last = now;
    if (!dragging) {
      rotY += (vY + (RM ? 0 : .14)) * k; rotX += vX * k; vY *= Math.pow(.95, k); vX *= Math.pow(.95, k);
      rotX += (-14 - rotX) * .02 * k;
    }
    rotX = clamp(rotX, -60, 60);
    const cy = Math.cos(rotY * DEG), sy = Math.sin(rotY * DEG), cx = Math.cos(rotX * DEG), sx = Math.sin(rotX * DEG), c = S / 2;
    for (let i = 0; i < N; i++) {
      const q = pts[i]; let x = q.x, y = q.y, z = q.z, op = 1;
      if (!assembled) { const e = easeOut(clamp((el - q.dl) / 1.8)); x = lerp(q.sx, x, e); y = lerp(q.sy, y, e); z = lerp(q.sz, z, e); op = e; }
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const fz = Pp / (Pp - z2 * Rr), X = c + x1 * Rr * fz, Yy = c + y2 * Rr * fz, depth = clamp((z2 + 1) / 2), sc = fz * (.55 + .5 * depth);
      const n = nodes[i];
      n.style.transform = `translate3d(${(X - half).toFixed(1)}px,${(Yy - half).toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
      n.style.opacity = ((.22 + .78 * sm(-.55, .35, z2)) * op).toFixed(3);
      n.style.zIndex = 1000 + Math.round(z2 * 400);
    }
    if (!assembled && el > 2.6) assembled = true;
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: .1 }).observe(stage);
  stage.addEventListener('pointerdown', e => { dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; vX = vY = 0; });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    vY = clamp(dx * .3, -8, 8); vX = e.pointerType === 'mouse' ? clamp(-dy * .3, -6, 6) : 0; rotY += vY; rotX += vX;
  }, { passive: true });
  const end = () => { dragging = false; };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  stage.addEventListener('click', e => { const b = e.target.closest('.hn'); if (!b) return; if (moved > 8) { e.preventDefault(); return; } Lightbox.open(+b.dataset.i, b); });
  return { pause: v => { paused = v; if (!v) start(); } };
})();

const Lightbox = (() => {
  const lb = $('#lb'), img = $('#lbImg'), M = CONFIG.moments || []; let i = 0, last = null;
  function show(k, animate) {
    i = (k + M.length) % M.length;
    const put = () => { img.src = M[i].src; img.alt = M[i].title; $('#lbTitle').textContent = M[i].title; $('#lbCap').textContent = M[i].caption || CONFIG.momentCaption || ''; $('#lbN').textContent = `${String(i + 1).padStart(2, '0')} of ${String(M.length).padStart(2, '0')}`; };
    if (!animate || RM) return put();
    gsap.to('.lb__img img,.lb__cap h3,.lb__cap p:not(.n)', { opacity: 0, duration: .25, onComplete: () => { put(); gsap.fromTo('.lb__img img', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1 }); gsap.to('.lb__cap h3,.lb__cap p', { opacity: 1, duration: .6 }); } });
  }
  function open(k, from) {
    last = document.activeElement; show(k); lb.hidden = false; Sphere.pause(true); lenis && lenis.stop(); html.classList.add('is-locked');
    gsap.to('.lb__bg', { opacity: 1, duration: .6, ease: 'power2.out' });
    if (from && !RM) {
      const a = from.getBoundingClientRect(), b = $('.lb__img').getBoundingClientRect();
      gsap.fromTo('.lb__img', { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scale: a.width / b.width }, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'expo.out' });
    } else if (!RM) gsap.fromTo('.lb__img', { scale: .9, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 });
    gsap.fromTo('.lb__cap > *', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: .06, duration: 1, delay: .3 });
    gsap.fromTo('.lb__close', { opacity: 0 }, { opacity: 1, duration: .6, delay: .3 });
    setTimeout(() => $('.lb__close').focus(), 60);
  }
  function close() {
    gsap.to('.lb__bg,.lb__fig,.lb__close', { opacity: 0, duration: .4, onComplete: () => { lb.hidden = true; gsap.set('.lb__fig,.lb__close', { opacity: 1 }); } });
    Sphere.pause(false); lenis && lenis.start(); html.classList.remove('is-locked');
    last && last.focus && last.focus({ preventScroll: true });
  }
  lb.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  $('#lbPrev').addEventListener('click', () => show(i - 1, true)); $('#lbNext').addEventListener('click', () => show(i + 1, true));
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1, true); if (e.key === 'ArrowRight') show(i + 1, true);
    if (e.key === 'Tab') { const fb = $$('button', lb), first = fb[0], lastB = fb[fb.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastB.focus(); } else if (!e.shiftKey && document.activeElement === lastB) { e.preventDefault(); first.focus(); } }
  });
  return { open };
})();

/* ═════════ 7 · VENUE ═════════ */
$('#dirBtn').href = CONFIG.venue.maps;
$('#copyAddr').addEventListener('click', async e => {
  const b = e.currentTarget, t = b.textContent;
  try { await navigator.clipboard.writeText(CONFIG.venue.name + ', ' + CONFIG.venue.address); b.textContent = 'Address copied'; } catch (_) { b.textContent = 'Copy failed, long-press the address'; }
  setTimeout(() => b.textContent = t, 2200);
});
(() => {
  const V = CONFIG.venue, el = $('#vmap'), chips = $('#chips');
  const places = [{ name: V.name, at: V.pin || [20.2984, 85.8231], venue: true }, ...(V.landmarks || [])];
  chips.innerHTML = places.map((p, i) => `<button class="chip${i ? '' : ' on'}" type="button" data-i="${i}"><i></i>${p.name}</button>`).join('');
  let map = null, want = false;
  function init() {
    if (map || !want || !window.L) return;
    el.innerHTML = '';
    map = L.map(el, { scrollWheelZoom: false, dragging: !L.Browser.mobile, tap: false, zoomSnap: .25, zoomControl: false });
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
    places.forEach((p, i) => {
      const html = p.venue ? `<div class="pin pin--venue"><img src="assets/art/seal.webp" alt=""><span>${p.name}</span></div>` : `<div class="pin${p.side ? ' pin--' + p.side : ''}"><i></i><span>${p.name}</span></div>`;
      p.m = L.marker(p.at, { icon: L.divIcon({ className: 'pin-wrap', html, iconSize: [0, 0] }), keyboard: false, zIndexOffset: p.venue ? 1000 : 0, title: p.name }).addTo(map);
      p.m.on('click', () => focus(i));
    });
    fitAll();
    new ResizeObserver(() => map.invalidateSize()).observe(el);
  }
  const fitAll = () => map.fitBounds(L.latLngBounds(places.map(p => p.at)), innerWidth < 700 ? { paddingTopLeft: [50, 110], paddingBottomRight: [50, 60] } : { paddingTopLeft: [110, 120], paddingBottomRight: [110, 70] });
  function focus(i) {
    $$('.chip', chips).forEach((c, k) => c.classList.toggle('on', k === i));
    if (!map) return;
    map.flyTo(places[i].at, i ? 15 : 16, { duration: RM ? 0 : 1.4 });
  }
  chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) focus(+b.dataset.i); });
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { want = true; init(); } }, { rootMargin: '600px' }).observe(el);
  addEventListener('load', init);
})();

/* ═════════ 8 · KINDLY REPLY ═════════ */
const DIYA = '<span class="diya"><i class="diya__flame"><i></i></i><img class="art" src="assets/art/diya.webp" alt="" width="179" height="82"></span>';
(() => {
  const sec = $('#rsvp'), card = $('#rsvp .card'), form = $('#rform'), name = $('#rname'), note = $('#rnote'), err = $('#rerr'), out = $('#gcount'), guests = $('#guests'), diyas = $('#rdone .diyas');
  let n = 1;
  [['#fName', name], ['#fNote', note]].forEach(([w, i]) => i.addEventListener('input', () => $(w).classList.toggle('filled', !!i.value)));
  $$('.step button').forEach(b => b.addEventListener('click', () => { n = clamp(n + +b.dataset.step, 1, 12); out.textContent = n; if (!RM) gsap.fromTo(out, { yPercent: +b.dataset.step > 0 ? 40 : -40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5 }); }));
  $$('input[name="att"]').forEach(r => r.addEventListener('change', () => guests.classList.toggle('off', form.att.value === 'no')));
  const flipTo = on => {
    if (RM) { sec.classList.toggle('done', on); diyas.classList.toggle('unlit', !on); return; }
    gsap.to(card, { rotateY: 90, transformPerspective: 1800, duration: .5, ease: 'power2.in', onComplete: () => {
      sec.classList.toggle('done', on); diyas.classList.add('unlit'); ScrollTrigger.refresh();
      gsap.fromTo(card, { rotateY: -90 }, { rotateY: 0, duration: .9, ease: 'power3.out', clearProps: 'transform', onComplete: () => { if (on) { diyas.classList.remove('unlit'); const r = diyas.getBoundingClientRect(); FX.embers(r.left + r.width / 2, r.top + r.height * .2, 36, 2.4); } } });
    } });
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const who = name.value.trim();
    if (!who) { err.textContent = 'Add your name so the family knows who is coming.'; name.focus(); return; }
    err.textContent = '';
    const yes = form.att.value === 'yes';
    const msg = [`Namaskar! RSVP for Asish & Ipsita's engagement (Sunday, 6 December 2026, ${CONFIG.venue.name}, Bhubaneswar).`, '', `Name: ${who}`,
      yes ? 'Attending: Yes, joyfully' : 'Attending: Sending blessings from afar', yes ? `Guests (including me): ${n}` : '', note.value.trim() ? `Note: ${note.value.trim()}` : ''].filter((l, i) => l || i === 1).join('\n');
    const url = (CONFIG.rsvpWhatsApp ? `https://wa.me/${String(CONFIG.rsvpWhatsApp).replace(/\D/g, '')}` : 'https://wa.me/') + '?text=' + encodeURIComponent(msg);
    $('#waAgain').href = url;
    window.open(url, '_blank', 'noopener');
    const b = $('#sendBtn').getBoundingClientRect();
    if (!RM) gsap.fromTo('#sendBtn', { scale: .82, rotate: -10 }, { scale: 1, rotate: 0, duration: 1, ease: 'elastic.out(1,.4)' });
    FX.burst(b.left + b.width / 2, b.top + b.height / 2, 56, .8);
    setTimeout(() => { flipTo(true); Lake.boat(who); }, RM ? 0 : 700);
  });
  $('#editRsvp').addEventListener('click', () => { flipTo(false); setTimeout(() => name.focus({ preventScroll: true }), RM ? 0 : 1300); });
})();

/* ═════════ the lake below the temples ═════════ */
const Temples = (() => {
  const P = pts => 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + 'Z';
  const mirror = (L, x) => L.concat(L.slice(0, -1).reverse().map(([px, py]) => [2 * x - px, py]));
  function rekha(x, base, w, h, flagDir = 1) {
    const hw = w / 2, L = [], yPl = base - h * .035, yM = base - h * .13, yB = base - h * .27, yG = base - h * .8;
    L.push([x - hw * 1.12, base], [x - hw * 1.12, yPl], [x - hw * 1.02, yPl], [x - hw * 1.02, yM], [x - hw * 1.08, yM], [x - hw * 1.08, yM - h * .016], [x - hw, yM - h * .016], [x - hw, yB], [x - hw * 1.05, yB], [x - hw * 1.05, yB - h * .012]);
    const N = 14, y0 = yB - h * .012;
    for (let i = 0; i <= N; i++) { const u = i / N, k = 1 - .45 * Math.pow(u, 2.15), y = y0 - (y0 - yG) * u; L.push([x - hw * k * 1.04, y]); if (i < N) L.push([x - hw * k * 1.04, y - (y0 - yG) / N * .35], [x - hw * k, y - (y0 - yG) / N * .35]); }
    const yN = yG - h * .02; L.push([x - hw * .4, yG], [x - hw * .4, yN]);
    const ry = h * .028, rx = hw * .72, ya = yN - ry;
    for (let i = 0; i <= 18; i++) { const a = Math.PI / 2 + Math.PI * i / 18, rr = 1 + .05 * Math.sin(a * 14); L.push([x + rx * rr * Math.cos(a), ya + ry * Math.sin(a)]); }
    const yK = ya - ry, dh = h * .03;
    for (let i = 0; i <= 8; i++) { const a = Math.PI + Math.PI / 2 * i / 8; L.push([x + hw * .34 * Math.cos(a), yK + dh * Math.sin(a)]); }
    let s = `<path d="${P(mirror(L, x))}"/>`;
    const top = yK - dh, kr = Math.max(2, hw * .13), pole = h * .08, pw = Math.max(1.2, w * .014);
    s += `<circle cx="${x}" cy="${top - kr * .8}" r="${kr}"/><rect x="${x - pw / 2}" y="${top - kr * 1.6 - pole}" width="${pw}" height="${pole}"/>`;
    const fy = top - kr * 1.6 - pole, fl = h * .045;
    s += `<path d="M${x} ${fy}l${flagDir * fl} ${fl * .3}l${-flagDir * fl * .15} ${fl * .3}l${flagDir * fl * .15} ${fl * .3}L${x} ${fy + fl * .55}z"/>`;
    return s;
  }
  function pidha(x, base, w, h, tiers = 3) {
    const hw = w / 2, L = [], yB = base - h * .4;
    L.push([x - hw * 1.06, base], [x - hw * 1.06, base - h * .04], [x - hw, base - h * .04], [x - hw, yB]);
    const th = h * .1, kg = h * .028;
    for (let k = 0; k < tiers; k++) { const y0 = yB - k * (th + kg), wide = hw * (1.2 - k * .2), nar = hw * (.98 - k * .2); L.push([x - wide, y0], [x - nar * .94, y0 - th], [x - nar * .8, y0 - th], [x - nar * .8, y0 - th - kg]); }
    const yT = yB - tiers * (th + kg), bw = hw * .58, bh = h * .14;
    L.push([x - bw, yT]);
    for (let i = 0; i <= 10; i++) { const a = Math.PI + Math.PI / 2 * i / 10; L.push([x + bw * Math.cos(a), yT + bh * Math.sin(a) * (1 - .15 * Math.cos(a))]); }
    let s = `<path d="${P(mirror(L, x))}"/>`;
    const top = yT - bh, kr = Math.max(1.8, hw * .1);
    s += `<ellipse cx="${x}" cy="${top}" rx="${bw * .55}" ry="${h * .018}"/><circle cx="${x}" cy="${top - h * .018 - kr * .8}" r="${kr}"/><rect x="${x - .7}" y="${top - kr * 2 - h * .08}" width="1.4" height="${h * .08}"/>`;
    return s;
  }
  return { rekha, pidha };
})();

const Lake = (() => {
  const lake = $('#lake'), shore = $('#shore'), ref = $('#lakeRef');
  const boatSVG = `<div class="bob"><svg width="86" height="72" viewBox="0 0 70 58" aria-hidden="true"><path d="M35 6c-4 6-4 10 0 12 4-2 4-6 0-12z" fill="#FFC845"/><circle cx="35" cy="16" r="11" fill="rgba(255,190,80,.22)"/><path d="M26 22h18l-2 5H28z" fill="#6a3a22"/><path d="M10 30h50l-8 14H18z" fill="#F6EEE3"/><path d="M10 30l25-6 25 6z" fill="#E4CC9F"/><path d="M18 44h34" stroke="#A3242C" stroke-width="1.5"/></svg><span class="boat__name"></span></div>`;
  function spawn(h, x, y, dur, dx) {
    const fl = $$('.float', lake); if (fl.length > 30) fl[0].remove();
    const el = document.createElement('div'); el.className = 'float'; el.innerHTML = h; el.style.left = x + 'px'; el.style.top = y + 'px'; lake.appendChild(el);
    if (RM) return el;
    gsap.fromTo(el, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' });
    gsap.to(el, { x: dx, y: -16, duration: dur, ease: 'none', onComplete: () => el.remove() });
    gsap.to(el, { opacity: 0, duration: 2, delay: dur - 2 });
    return el;
  }
  function boat(name) { const el = spawn(boatSVG, -90, lake.clientHeight * .32, 26, lake.clientWidth + 180); $('.boat__name', el).textContent = name; }
  function diya(x, y) { spawn(`<div class="bob">${DIYA}</div>`, x - 26, y - 34, 15, 120 + Math.random() * 160); }
  lake.addEventListener('click', e => { const r = lake.getBoundingClientRect(); diya(e.clientX - r.left, e.clientY - r.top); });
  lake.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); diya(lake.clientWidth * (.2 + Math.random() * .6), lake.clientHeight * (.3 + Math.random() * .4)); } });
  ScrollTrigger.create({ trigger: lake, start: 'top 85%', once: true, onEnter: () => [0, 1300, 2700, 4200].forEach((t, k) => setTimeout(() => diya(lake.clientWidth * (.12 + k * .22), lake.clientHeight * (.3 + (k % 2) * .2)), t)) });
  function drawShore() {
    const W = shore.parentNode.clientWidth, H = shore.parentNode.clientHeight; if (!W || !H) return;
    const r = rng(5); let g = '';
    for (let x = 14; x < W; x += 40 + r() * 92) { const h = H * (.32 + r() * .66); g += r() < .65 ? Temples.rekha(x, H, h * .34, h, r() < .5 ? 1 : -1) : Temples.pidha(x, H, h * .9, h * .78); }
    g += `<rect x="0" y="${H - 3}" width="${W}" height="3"/>`;
    [shore, ref].forEach(el => { el.setAttribute('viewBox', `0 0 ${W} ${H}`); el.setAttribute('height', H); el.innerHTML = g; });
  }
  drawShore(); addEventListener('resize', () => { clearTimeout(drawShore.t); drawShore.t = setTimeout(drawShore, 150); });
  return { boat };
})();

/* footer: the names written out in gold */
if (!RM) {
  gsap.fromTo('#footMark', { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 2.6, ease: 'power2.inOut', scrollTrigger: once('#footMark', 'top 95%') });
  gsap.from('.foot > p, .foot > .btn', { opacity: 0, y: 20, duration: 1.4, stagger: .12, scrollTrigger: once('#footMark', 'top 95%') });
}

ScrollTrigger.sort();
addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
