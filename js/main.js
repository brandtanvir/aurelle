import { initFleet } from './fleet.js';
import { initBooking } from './booking.js';
import { FLEET, ROUTE_HUBS, airportByCode, emptyLegs, flightPlan, bestClass, fmtHours, fmtMoney, fmtKm } from './data.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
html.classList.add('js');
if (reduce) html.classList.add('reduce');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EASE = 'expo.out';

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollToY = (y, opts = {}) => (lenis ? lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts }) : scrollTo({ top: typeof y === 'number' ? y : y.getBoundingClientRect().top + scrollY }));

/* ---------- Booking ---------- */
const booking = initBooking({ lenis });
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-book]');
  if (b) { e.preventDefault(); closeMenu(); booking.open(); }
});

/* ---------- Nav & menu ---------- */
const nav = $('[data-nav]');
const menu = $('#menu');
const burger = $('[data-menu-open]');
function openMenu() {
  menu.hidden = false;
  requestAnimationFrame(() => menu.classList.add('is-open'));
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  nav.classList.add('is-menu');
  lenis?.stop();
}
function closeMenu() {
  if (menu.hidden) return;
  menu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('is-menu');
  lenis?.start();
  setTimeout(() => (menu.hidden = true), 900);
}
burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// White nav over footage and the dark fleet; ink nav everywhere else.
const darkZones = $$('[data-nav-dark]');
const syncNav = () => {
  nav.classList.toggle('is-scrolled', scrollY > 40);
  const probe = nav.offsetHeight / 2;
  let dark = false;
  for (const z of darkZones) {
    const r = z.getBoundingClientRect();
    if (r.top > probe || r.bottom < probe) continue;
    // Past ~35% of the hero the footage has closed into a window and the page behind is light.
    dark = !(z.classList.contains('hero') && -r.top > (z.offsetHeight - innerHeight) * 0.35);
    break;
  }
  nav.classList.toggle('is-dark', dark);
};
addEventListener('scroll', syncNav, { passive: true });
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onRefresh: syncNav,
  onUpdate(self) {
    const y = self.scroll();
    syncNav();
    nav.classList.toggle('is-hidden', self.direction === 1 && y > innerHeight * 0.6 && menu.hidden);
  },
});

$$('.nav__links a').forEach((a) => {
  const sec = $(a.getAttribute('href'));
  if (!sec) return;
  ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.hasAttribute('data-book') || a.hasAttribute('data-plan-book')) return;
  const id = a.getAttribute('href');
  if (id === '#') { e.preventDefault(); return; } // placeholder pages, not built yet
  const target = id === '#top' ? 0 : $(id);
  if (target === null) return;
  e.preventDefault();
  closeMenu();
  scrollToY(target);
});

/* ---------- Split text ---------- */
function splitWords(el, cls = 'w') {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(' ');
          const w = document.createElement('span');
          w.className = cls;
          if (cls === 'w') {
            const i = document.createElement('span');
            i.textContent = part;
            w.append(i);
          } else w.textContent = part;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return cls === 'w' ? $$('.w > span', el) : $$('.' + cls, el);
}

/* ---------- Reveals ---------- */
if (!reduce) {
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, { yPercent: 110, duration: 1.05, ease: EASE, stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 94%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.06 }),
  });

  // Manifesto: words brighten as you read.
  const mw = splitWords($('[data-manifesto]'), 'mw');
  gsap.to(mw, {
    opacity: 1, ease: 'none', stagger: 0.12,
    scrollTrigger: { trigger: '[data-manifesto]', start: 'top 78%', end: 'bottom 42%', scrub: 0.6 },
  });
} else {
  $$('.manifesto__text').forEach((el) => splitWords(el, 'mw').forEach((w) => (w.style.opacity = 1)));
}

/* ---------- Counters ---------- */
$$('[data-count]').forEach((el) => {
  const end = +el.dataset.count;
  const fmt = (v) => (el.hasAttribute('data-sep') ? Math.round(v).toLocaleString('en-US') : Math.round(v));
  if (reduce) { el.textContent = fmt(end); return; }
  const o = { v: 0 };
  gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
});

/* ---------- Videos ---------- */
// Sources are attached only when a video nears the viewport; off-screen videos pause.
const mobileQ = matchMedia('(max-width: 760px)');
const srcFor = (v) => (mobileQ.matches && v.dataset.srcMobile) || v.dataset.src;
const attach = (v) => { if (!v.getAttribute('src')) v.src = srcFor(v); };
const play = (v) => { attach(v); if (!reduce && v.paused) v.play().catch(() => {}); };
if (reduce) $$('video[autoplay]').forEach((v) => v.removeAttribute('autoplay'));
const videoIO = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? play(e.target) : e.target.pause())), { rootMargin: '250px 0px' });
$$('video[data-src]:not(.chapters__video)').forEach((v) => videoIO.observe(v));

/* ---------- Hero ---------- */
// The full-bleed footage closes into a cabin window as you scroll.
const windowInset = () => (mobileQ.matches ? 'inset(15% 11% 22% 11% round 150px)' : 'inset(12% 35% 18% 35% round 240px)');
function heroScroll() {
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true } })
    .fromTo('[data-hero-media]', { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: windowInset, ease: 'none', duration: 0.7 }, 0)
    .fromTo('.hero__video', { scale: 1 }, { scale: 1.22, ease: 'none', duration: 0.7 }, 0)
    .to('.hero__shade', { opacity: 0, ease: 'none', duration: 0.5 }, 0.15)
    .to('[data-hero-content]', { opacity: 0, y: () => -innerHeight * 0.08, ease: 'none', duration: 0.32 }, 0)
    .fromTo('[data-hero-caption]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'none', duration: 0.2 }, 0.62)
    .to({}, { duration: 0.18 });
}

/* ---------- Ticker ---------- */
const tickerRoutes = [['GVA', 'DXB'], ['TEB', 'FAB'], ['LBG', 'JMK'], ['VNY', 'ASE'], ['SIN', 'MLE'], ['HND', 'HNL']];
const ticker = $('[data-ticker]');
let tk = 0;
const tickerText = ([a, b]) => {
  const A = airportByCode(a), B = airportByCode(b);
  const cls = bestClass(flightPlan(A, B, FLEET[0]).km);
  return `${A.city} → ${B.city} · ${fmtHours(flightPlan(A, B, cls).hours)}`;
};
ticker.textContent = tickerText(tickerRoutes[0]);
setInterval(() => {
  if (document.hidden) return;
  tk = (tk + 1) % tickerRoutes.length;
  gsap.to(ticker, { opacity: 0, y: -6, duration: 0.4, ease: 'power2.in', onComplete: () => {
    ticker.textContent = tickerText(tickerRoutes[tk]);
    gsap.fromTo(ticker, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE });
  } });
}, 4200);

/* ---------- Fleet ---------- */
const fleet = initFleet($('[data-fleet-canvas]'));
const tabsEl = $('[data-fleet-tabs]');
tabsEl.innerHTML = FLEET.map((f, i) => `<button class="fleet__tab" role="tab" type="button" aria-selected="${i === 0}" data-i="${i}"><span class="bar"><i></i></span><span><span class="lbl">0${i + 1} · </span>${f.label}</span></button>`).join('');
const tabs = $$('.fleet__tab', tabsEl);
const specEls = Object.fromEntries($$('[data-spec]').map((el) => [el.dataset.spec, el]));
const specVals = { range: 0, pax: 0, speed: 0, cabin: 0, rate: 0 };
let fleetIdx = -1;

function showFleet(i) {
  if (i === fleetIdx) return;
  const first = fleetIdx === -1;
  fleetIdx = i;
  const f = FLEET[i];
  fleet.setClass(i);
  tabs.forEach((t, j) => t.setAttribute('aria-selected', String(j === i)));
  $('[data-fleet-index]').textContent = '0' + (i + 1);
  const txt = () => {
    $('[data-fleet-label]').textContent = f.label;
    $('[data-fleet-model]').textContent = f.model + ' or similar';
    $('[data-fleet-line]').textContent = f.line;
    $('[data-fleet-copy]').textContent = f.copy;
    $('[data-fleet-more]').textContent = `Explore the ${f.label} cabin`;
    $$('[data-fleet-link]').forEach((a) => (a.href = f.page));
  };
  const info = $('.fleet__info');
  if (first || reduce) txt();
  else gsap.timeline()
    .to(info, { opacity: 0, y: -14, duration: 0.35, ease: 'power2.in', onComplete: txt })
    .fromTo(info, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: EASE });
  const target = { range: f.rangeKm, pax: f.pax, speed: f.speedKmh, cabin: f.cabinH, rate: f.rate };
  gsap.to(specVals, {
    ...target, duration: first || reduce ? 0 : 1.2, ease: 'power3.out',
    onUpdate() {
      specEls.range.textContent = Math.round(specVals.range).toLocaleString('en-US');
      specEls.pax.textContent = Math.round(specVals.pax);
      specEls.speed.textContent = Math.round(specVals.speed);
      specEls.cabin.textContent = specVals.cabin.toFixed(2);
      specEls.rate.textContent = fmtMoney(specVals.rate);
    },
  });
}
showFleet(0);

let fleetST = null;
if (!reduce) {
  fleetST = ScrollTrigger.create({
    trigger: '.fleet', start: 'top top', end: 'bottom bottom',
    onUpdate(s) {
      const p = s.progress * 4;
      showFleet(Math.min(3, Math.floor(p)));
      tabs.forEach((t, j) => (t.querySelector('i').style.transform = `scaleX(${Math.min(1, Math.max(0, p - j))})`));
    },
  });
}
tabs.forEach((t, i) => t.addEventListener('click', () => {
  if (!fleetST) return showFleet(i);
  scrollToY(fleetST.start + ((i + 0.5) / 4) * (fleetST.end - fleetST.start), { duration: 1.2 });
}));

/* ---------- Cabin gallery: layered parallax ---------- */
// Three depths: each frame opens as it enters, the photo drifts inside it,
// and the two frames travel at different speeds so they separate in space.
if (!reduce) {
  const k = () => (mobileQ.matches ? 0.5 : 1);
  $$('.cabin__fig').forEach((fig) => {
    const frame = $('.cabin__img', fig);
    const img = $('img', frame);
    const tall = fig.classList.contains('cabin__fig--tall');
    gsap.fromTo(frame, { clipPath: 'inset(12% 6% 12% 6%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top 98%', end: 'top 40%', scrub: 0.6 },
    });
    gsap.fromTo(img, { yPercent: -9, scale: 1.12 }, {
      yPercent: 9, scale: 1, ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo(fig, { y: () => innerHeight * (tall ? 0.16 : 0.05) * k() }, {
      y: () => -innerHeight * (tall ? 0.16 : 0.05) * k(), ease: 'none',
      scrollTrigger: { trigger: '.cabin__grid', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });
}

/* ---------- Experience: full-screen chapters ---------- */
// Scroll wipes each film up over the last; the type changes as the wipe passes halfway.
const chVideos = $$('.chapters__video');
const chArts = $$('[data-chapter]');
const chTabs = $$('.chapters__tab');
const CH = chVideos.length;
let chActive = 0;
let chInView = false;
let chTop = 0;
const chReveal = chVideos.map((_, j) => (j === 0 ? 1 : 0));

function showChapter(i) {
  if (i === chActive) return;
  const prev = chArts[chActive];
  const next = chArts[i];
  chActive = i;
  $('[data-ch-index]').textContent = '0' + (i + 1);
  chTabs.forEach((t, j) => t.setAttribute('aria-current', String(j === i)));
  chArts.forEach((a, j) => a.setAttribute('aria-hidden', String(j !== i)));
  if (reduce) {
    prev.classList.remove('is-on');
    next.classList.add('is-on');
    return;
  }
  gsap.killTweensOf([prev, next]);
  gsap.to(prev, { opacity: 0, y: -16, duration: 0.35, ease: 'power2.in', onComplete: () => prev.classList.remove('is-on') });
  next.classList.add('is-on');
  gsap.set(next, { opacity: 1, y: 0 });
  gsap.fromTo($('.chapter__mask > span', next), { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: EASE, delay: 0.12 });
  gsap.fromTo($$('.chapter__copy, .chapter__place', next), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: EASE, delay: 0.25, stagger: 0.06 });
}

function syncChapterVideos() {
  chVideos.forEach((v, j) => {
    if (v.tagName !== 'VIDEO') return; // stills need no playback
    const showing = j === chTop || (j === chTop + 1 && chReveal[j] > 0);
    if (chInView && showing) play(v);
    else v.pause();
  });
  const next = chVideos[Math.min(CH - 1, chTop + 1)];
  if (next.tagName === 'VIDEO') attach(next); // prefetch the next film
}

function setChapterProgress(c) {
  let top = 0;
  chVideos.forEach((v, j) => {
    if (j === 0) return;
    const r = Math.min(1, Math.max(0, (c - j + 0.3) / 0.45));
    v.style.clipPath = `inset(${((1 - r) * 100).toFixed(2)}% 0 0 0)`;
    v.style.transform = `scale(${(1.1 - 0.1 * r).toFixed(4)})`;
    chReveal[j] = r;
    if (r >= 1) top = j;
  });
  chTop = top;
  syncChapterVideos();
  showChapter(Math.min(CH - 1, Math.floor(c + 0.08)));
  chTabs.forEach((t, j) => (t.querySelector('i').style.transform = `scaleX(${Math.min(1, Math.max(0, c - j))})`));
}

new IntersectionObserver(([e]) => { chInView = e.isIntersecting; syncChapterVideos(); }, { rootMargin: '200px 0px' }).observe($('.chapters'));
if (chVideos[0].tagName === 'VIDEO') attach(chVideos[0]);

let chST = null;
if (!reduce) {
  chST = ScrollTrigger.create({
    trigger: '.chapters', start: 'top top', end: 'bottom bottom',
    onUpdate: (st) => setChapterProgress(Math.min(CH - 0.001, st.progress * CH)),
  });
}
chTabs.forEach((t, i) => t.addEventListener('click', () => {
  if (chST) return scrollToY(chST.start + ((i + 0.55) / CH) * (chST.end - chST.start), { duration: 1.4 });
  chVideos.forEach((v, j) => { v.style.clipPath = j === i ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)'; chReveal[j] = j === i ? 1 : 0; });
  chTop = i;
  if (chVideos[i].tagName === 'VIDEO') attach(chVideos[i]);
  showChapter(i);
}));
chTabs[0].setAttribute('aria-current', 'true');

/* ---------- Membership calculator ---------- */
const calcHours = $('[data-calc-hours]');
const calcClass = $('[data-calc-class]');
calcClass.insertAdjacentHTML('beforeend', FLEET.map((f, i) => `<label><input type="radio" name="calc-class" value="${i}" ${i === 1 ? 'checked' : ''} /><span>${f.label}</span></label>`).join(''));
const calcOut = { y1: 0, y3: 0 };
function tierFor(h) {
  if (h >= 100) return { name: 'Sovereign', d: 0.14 };
  if (h >= 50) return { name: 'Signature', d: 0.1 };
  return { name: 'Reserve', d: 0.06 };
}
function updateCalc(animate = true) {
  const h = +calcHours.value;
  const f = FLEET[+calcClass.querySelector('input:checked').value];
  const tier = tierFor(h);
  const volume = Math.min(0.04, (h / 300) * 0.04);
  const d1 = tier.d + volume;
  const loyalty = Math.min(0.15, 0.03 + ((h * 2) / 400) * 0.08);
  const d3 = d1 + loyalty;
  $('[data-calc-hours-out]').textContent = h;
  calcHours.style.setProperty('--p', ((h - 10) / 290) * 100 + '%');
  $('[data-calc-tier]').textContent = tier.name;
  $('[data-calc-save]').textContent = Math.round(d3 * 100) + '%';
  $('[data-calc-bar]').style.width = Math.min(100, (d3 / 0.32) * 100) + '%';
  gsap.to(calcOut, {
    y1: f.rate * (1 - d1), y3: f.rate * (1 - d3), duration: animate && !reduce ? 0.8 : 0, ease: 'power3.out',
    onUpdate: () => {
      $('[data-calc-y1]').textContent = fmtMoney(Math.round(calcOut.y1 / 10) * 10);
      $('[data-calc-y3]').textContent = fmtMoney(Math.round(calcOut.y3 / 10) * 10);
    },
  });
}
calcHours.addEventListener('input', () => updateCalc());
calcClass.addEventListener('change', () => updateCalc());
updateCalc(false);

/* ---------- Global reach planner ---------- */
const fromSel = $('[data-plan-from]');
const toSel = $('[data-plan-to]');
const opts = ROUTE_HUBS.map((c) => airportByCode(c)).sort((a, b) => a.city.localeCompare(b.city))
  .map((a) => `<option value="${a.code}">${a.city} · ${a.code}</option>`).join('');
fromSel.innerHTML = opts;
toSel.innerHTML = opts;
fromSel.value = 'TEB';
toSel.value = 'FAB';
let globe = null;
function updatePlan() {
  const A = airportByCode(fromSel.value), B = airportByCode(toSel.value);
  if (A === B) {
    $('[data-plan-km]').textContent = '—';
    $('[data-plan-time]').textContent = '—';
    $('[data-plan-class]').textContent = 'Pick two cities';
    return;
  }
  const cls = bestClass(flightPlan(A, B, FLEET[0]).km);
  const plan = flightPlan(A, B, cls);
  $('[data-plan-km]').textContent = fmtKm(plan.km);
  $('[data-plan-time]').textContent = fmtHours(plan.hours);
  $('[data-plan-class]').textContent = cls.label;
  globe?.setRoute(A, B);
}
fromSel.addEventListener('change', updatePlan);
toSel.addEventListener('change', updatePlan);
$('[data-plan-swap]').addEventListener('click', () => { [fromSel.value, toSel.value] = [toSel.value, fromSel.value]; updatePlan(); });
$('[data-plan-book]').addEventListener('click', (e) => {
  e.preventDefault();
  const A = airportByCode(fromSel.value), B = airportByCode(toSel.value);
  booking.open(A !== B ? { from: A, to: B } : {});
});
updatePlan();
// Load the globe (and its map data) only when the section approaches.
let globeLoading = false;
const loadGlobe = () => {
  if (globeLoading) return;
  globeLoading = true;
  import('./globe.js').then((m) => m.initGlobe($('[data-globe-canvas]'), $$('[data-globe-tag]'))).then((g) => { globe = g; updatePlan(); })
    .catch((err) => console.warn('Globe unavailable', err));
};
ScrollTrigger.create({ trigger: '.reach', start: 'top 250%', once: true, onEnter: loadGlobe });
setTimeout(loadGlobe, 5000);

/* ---------- Empty legs board ---------- */
const board = $('[data-board]');
const legs = emptyLegs(new Date());
const fmtDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
board.innerHTML = legs.map((l, i) => `
  <div class="board__row" role="row">
    <div class="route" role="cell">
      <span><span class="route__code" data-flap="${l.from.code}">${l.from.code}</span><span class="route__city">${l.from.city}</span></span>
      <span class="route__arrow" aria-hidden="true"></span>
      <span><span class="route__code" data-flap="${l.to.code}">${l.to.code}</span><span class="route__city">${l.to.city}</span></span>
    </div>
    <div class="board__cell b-date" role="cell"><strong>${fmtDay(l.date)}</strong>${fmtHours(flightPlan(l.from, l.to, l.cls).hours)}</div>
    <div class="board__cell b-aircraft" role="cell"><strong>${l.cls.label}</strong>${l.cls.model}</div>
    <div class="board__cell b-seats" role="cell"><strong>${l.seats}</strong>seats</div>
    <div class="board__cell price" role="cell"><strong>${fmtMoney(l.price)}</strong><s>${fmtMoney(l.was)}</s><span class="off">−${Math.round((1 - l.price / l.was) * 100)}%</span></div>
    <div class="b-action" role="cell"><button type="button" class="btn btn--ghost btn--sm" data-leg="${i}">Reserve<span class="sr"> ${l.from.city} to ${l.to.city}</span></button></div>
  </div>`).join('');
board.addEventListener('click', (e) => {
  const b = e.target.closest('[data-leg]');
  if (!b) return;
  const l = legs[+b.dataset.leg];
  booking.open({ from: l.from, to: l.to, date: l.date, cls: l.cls, pax: Math.min(l.seats, 2) });
});

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function flap(el) {
  const final = el.dataset.flap;
  let n = 0;
  const id = setInterval(() => {
    n++;
    el.textContent = final.split('').map((c, i) => (n > 6 + i * 3 ? c : CHARS[(Math.random() * 26) | 0])).join('');
    if (n > 6 + final.length * 3) clearInterval(id);
  }, 45);
}
if (!reduce) {
  $$('.board__row:not(.board__row--head)').forEach((row, i) => {
    gsap.from(row, { opacity: 0, y: 24, duration: 1.1, ease: EASE, delay: (i % 4) * 0.05, scrollTrigger: { trigger: row, start: 'top 92%', once: true, onEnter: () => $$('[data-flap]', row).forEach(flap) } });
  });
}

/* ---------- Footer: base clocks, alerts sign-up, wordmark ---------- */
const clocks = $$('[data-tz]');
const tick = () => clocks.forEach((el) => (el.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: el.dataset.tz }).format(new Date())));
tick();
setInterval(tick, 15000);
$('[data-year]').textContent = new Date().getFullYear();

const brief = $('[data-brief]');
brief.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('input', brief);
  const msg = $('[data-brief-msg]', brief);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
    msg.textContent = 'Please enter a valid email address.';
    input.focus();
    return;
  }
  // Hook for the mailing list provider goes here.
  msg.textContent = 'Thank you. We will write only when a flight fits.';
  input.value = '';
});

// Size the wordmark so it spans the content width exactly.
const fitWord = () => {
  const el = $('[data-fit]');
  const box = el.parentElement;
  el.style.fontSize = '100px';
  const w = el.getBoundingClientRect().width;
  const avail = box.getBoundingClientRect().width;
  if (w) el.style.fontSize = (100 * avail / w).toFixed(2) + 'px';
};
document.fonts.ready.then(fitWord);
addEventListener('resize', fitWord);

/* ---------- Magnetic buttons ---------- */
if (finePointer && !reduce) {
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.22);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- Intro ---------- */
async function intro() {
  const minDelay = new Promise((r) => setTimeout(r, reduce ? 200 : 1500));
  await Promise.race([Promise.all([document.fonts.ready, minDelay]), new Promise((r) => setTimeout(r, 3500))]);
  html.classList.add('is-loaded');
  const loader = $('.loader');
  if (reduce) {
    loader.remove();
    lenis?.start();
    if (location.hash === '#book') booking.open();
    return;
  }
  gsap.set('.hero__line > span', { yPercent: 105 });
  gsap.set('[data-hero-fade]', { opacity: 0, y: 18 });
  gsap.set(nav, { yPercent: -100, opacity: 0 });
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.3, ease: 'expo.inOut', onComplete: () => loader.remove() })
    .fromTo('[data-hero-media]', { scale: 1.12 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0.4)
    .to('.hero__line > span', { yPercent: 0, duration: 1.6, stagger: 0.12 }, 0.75)
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.4, stagger: 0.08 }, 1.1)
    .to(nav, { yPercent: 0, opacity: 1, duration: 1.4 }, 1.2)
    .add(() => {
      heroScroll();
      lenis?.start();
      ScrollTrigger.refresh();
      if (location.hash === '#book') booking.open();
    }, 2.9);
}
gsap.set('.loader', { clipPath: 'inset(0% 0% 0% 0%)' });
intro();

addEventListener('load', () => ScrollTrigger.refresh());
