// Aircraft detail pages (fleet/*.html): one class per page, chosen by <body data-class>.
import * as THREE from 'three';
import { loadModel } from './fleet.js';
import { createJet } from './jet.js';
import { initBooking, quote } from './booking.js';
import { renderPlan, planFor } from './floorplan.js';
import { FLEET, airportByCode, flightPlan, fmtHours, fmtMoney, fmtKm } from './data.js';
import { createRenderer, studioEnvironment, runScene } from './gl.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
html.classList.add('js');
if (reduce) html.classList.add('reduce');

// Lazy images fade in instead of popping over their placeholder.
if (!reduce) {
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    if (img.complete) return;
    img.classList.add('is-fading');
    const show = () => img.classList.remove('is-fading');
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', show, { once: true });
  });
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EASE = 'expo.out';

const cls = FLEET.find((f) => f.id === document.body.dataset.class) || FLEET[0];

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToY = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) }) : scrollTo({ top: typeof y === 'number' ? y : y.getBoundingClientRect().top + scrollY }));

/* ---------- Booking: every request on this page starts with this class ---------- */
const booking = initBooking({ lenis });
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-book]');
  if (b) { e.preventDefault(); closeMenu(); booking.open({ cls }); }
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

// White nav over the navy stages, ink nav over the light sections.
const darkZones = $$('[data-nav-dark]');
const syncNav = () => {
  nav.classList.toggle('is-scrolled', scrollY > 40);
  const probe = nav.offsetHeight / 2;
  nav.classList.toggle('is-dark', darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
};
addEventListener('scroll', syncNav, { passive: true });
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onRefresh: syncNav,
  onUpdate(self) {
    syncNav();
    nav.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > innerHeight * 0.6 && menu.hidden);
  },
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.hasAttribute('data-book')) return;
  const id = a.getAttribute('href');
  if (id === '#') { e.preventDefault(); return; } // placeholder pages, not built yet
  const target = id === '#top' ? 0 : $(id);
  if (target === null) return;
  e.preventDefault();
  closeMenu();
  scrollToY(target);
});

/* ---------- Reveals ---------- */
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(' ');
          const w = document.createElement('span');
          w.className = 'w';
          const i = document.createElement('span');
          i.textContent = part;
          w.append(i);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return $$('.w > span', el);
}
if (!reduce) {
  $$('[data-split]').forEach((el) => {
    gsap.from(splitWords(el), { yPercent: 110, duration: 1.05, ease: EASE, stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 94%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.06 }),
  });
}

/* ---------- Hero: the class's model on a navy turntable ---------- */
function initStage(canvas) {
  const renderer = createRenderer(canvas, { alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xf4f9ff, 0x9fb4c8, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(6, 10, 8);
  const rim = new THREE.DirectionalLight(0xcfe6ff, 1.6);
  rim.position.set(-8, 3, -8);
  scene.add(key, rim);

  const turn = new THREE.Group();
  const float = new THREE.Group();
  float.add(turn);
  scene.add(float);
  let tickJet = () => {};

  // Same file and pearl treatment as the homepage fleet viewer; the procedural jet if it fails.
  loadModel(cls.glb).then((model) => {
    if (model) $$(`[data-model-credit="${cls.glb}"]`).forEach((el) => (el.hidden = false));
    const jet = model ? null : createJet();
    const group = model || jet.group;
    if (jet) tickJet = jet.tick;
    turn.add(group);
    if (!reduce) gsap.from(group.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.4, ease: EASE, onUpdate: loop.renderOnce });
    loop.renderOnce();
  });

  // Turntable with drag + inertia; scrolling away tilts the camera toward the top-down plan below.
  const st = { angle: -0.75, vel: 0, dragging: false, lastX: 0, auto: reduce ? 0 : 0.1, dist: 21, tilt: 0 };
  canvas.addEventListener('pointerdown', (e) => { st.dragging = true; st.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!st.dragging) return;
    st.vel = (e.clientX - st.lastX) * 0.006;
    st.lastX = e.clientX;
    st.angle += st.vel;
  });
  const end = () => { st.dragging = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // Keep the jet in the upper part of the stage, clear of the title and facts below it.
  const target = new THREE.Vector3(0, -1.4, 0);
  const onResize = (w, h) => {
    const aspect = w / h;
    st.dist = aspect < 1.2 ? Math.min(40, 20 * (1.35 / Math.max(aspect, 0.55))) : aspect < 1.5 ? 25 : 23;
    target.y = aspect < 1.2 ? -0.4 : aspect < 1.5 ? -2.2 : -1.4;
  };
  const onFrame = (dt, t) => {
    if (!st.dragging) {
      st.vel *= Math.pow(0.04, dt);
      st.angle += st.vel + st.auto * dt;
    }
    turn.rotation.y = st.angle;
    float.position.y = Math.sin(t * 0.8) * 0.08;
    float.rotation.z = Math.sin(t * 0.6) * 0.02;
    const pitch = 0.3 + st.tilt * 0.9;
    camera.position.set(0, st.dist * pitch, st.dist * (1 - st.tilt * 0.35));
    camera.lookAt(target);
    tickJet(t, camera);
    renderer.render(scene, camera);
  };
  const loop = runScene(canvas, { renderer, camera, onResize, onFrame });
  if (!reduce) {
    ScrollTrigger.create({ trigger: '.ac-hero', start: 'top top', end: 'bottom top', onUpdate: (s) => { st.tilt = s.progress; loop.renderOnce(); } });
  }
}
initStage($('[data-ac-canvas]'));

if (!reduce) {
  gsap.from('.ac-hero__title > span', { yPercent: 105, duration: 1.6, ease: EASE, delay: 0.15 });
  gsap.from('[data-hero-fade]', { opacity: 0, y: 18, duration: 1.4, ease: EASE, stagger: 0.08, delay: 0.4 });
}

/* ---------- Facts and specification ---------- */
const c = cls.cabin;
const num = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
$('[data-facts]').innerHTML = [
  ['Range', num(cls.rangeKm), 'km'],
  ['Passengers', cls.pax, 'up to'],
  ['Cruise', num(cls.speedKmh), 'km/h'],
  ['Indicative from', fmtMoney(cls.rate), '/ hour'],
].map(([k, v, u]) => `<div><dt>${k}</dt><dd>${v}<small>${u}</small></dd></div>`).join('');

$('[data-specs]').innerHTML = [
  ['Typical aircraft', `${cls.model} or similar`],
  ['Passengers', `Up to ${cls.pax}`],
  ['Sleeps', c.sleeps ? `${c.sleeps} guests` : 'Seats recline; no flat beds'],
  ['Living areas', c.zones === 1 ? 'One cabin' : `${c.zones} areas`],
  ['Range', `${num(cls.rangeKm)} km non-stop`],
  ['Cruise speed', `${num(cls.speedKmh)} km/h`],
  ['Maximum altitude', `${num(c.ceiling)} ft`],
  ['Cabin height', `${num(cls.cabinH, 2)} m`],
  ['Cabin width', `${num(c.width, 2)} m`],
  ['Cabin length', `${num(c.length, 2)} m`],
  ['Baggage', `${num(c.baggage, 1)} m³`],
  ['Indicative rate', `${fmtMoney(cls.rate)} per flight hour`],
].map(([k, v]) => `<div class="spec"><dt>${k}</dt><dd>${v}</dd></div>`).join('');

/* ---------- Cabin plan ---------- */
const plan = planFor(cls.id);
const planEl = $('[data-plan]');
const legendEl = $('[data-legend]');
legendEl.innerHTML = plan.zones.map((z, i) => `<li data-zone="${i}"><span class="legend__n">${String(i + 1).padStart(2, '0')}</span><span><strong>${z.name}</strong>${z.copy}</span></li>`).join('');
const wideQ = matchMedia('(min-width: 1081px)');
const drawPlan = () => {
  const vertical = !wideQ.matches;
  const out = renderPlan(cls.id, cls.cabin, { vertical });
  planEl.innerHTML = out.html;
  planEl.style.aspectRatio = out.ratio.toFixed(4);
  planEl.style.setProperty('--ratio', out.ratio.toFixed(4));
  planEl.classList.toggle('is-vertical', vertical);
  $('[data-plan-cap]').textContent = `Top-down plan, nose ${vertical ? 'at the top' : 'to the left'}. Typical layout; yours is confirmed with the aircraft.`;
};
drawPlan();
wideQ.addEventListener('change', drawPlan);
// Pointing at a legend row lights its area in the plan.
const hot = (i) => $$('[data-zone]', $('[data-cabin]')).forEach((el) => el.classList.toggle('is-hot', el.dataset.zone === i));
legendEl.addEventListener('pointerover', (e) => { const li = e.target.closest('li'); if (li) hot(li.dataset.zone); });
legendEl.addEventListener('pointerleave', () => hot(null));

/* ---------- Typical routes, timed from data.js ---------- */
const routes = cls.routes.map(([a, b]) => {
  const from = airportByCode(a), to = airportByCode(b);
  return { from, to, plan: flightPlan(from, to, cls) };
});
$('[data-routes]').innerHTML = routes.map(({ from, to, plan: p }, i) => `
  <div class="board__row" role="row">
    <div class="route" role="cell">
      <span><span class="route__code">${from.code}</span><span class="route__city">${from.city}</span></span>
      <span class="route__arrow" aria-hidden="true"></span>
      <span><span class="route__code">${to.code}</span><span class="route__city">${to.city}</span></span>
    </div>
    <div class="board__cell r-time" role="cell"><strong>${fmtHours(p.hours)}</strong>Flight time</div>
    <div class="board__cell r-dist" role="cell"><strong>${fmtKm(p.km)}</strong>Distance</div>
    <div class="board__cell r-stops" role="cell"><strong>${p.stops ? `${p.stops} fuel stop` : 'Non-stop'}</strong>${p.stops ? 'Adds about an hour' : 'Direct'}</div>
    <div class="board__cell price" role="cell"><strong>${fmtMoney(quote(cls, p.hours, false).lo)}</strong>One way, from</div>
    <div class="b-action" role="cell"><button type="button" class="btn btn--ghost btn--sm" data-route="${i}">Request<span class="sr"> ${from.city} to ${to.city}</span></button></div>
  </div>`).join('');
$('[data-routes]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-route]');
  if (!b) return;
  const r = routes[+b.dataset.route];
  booking.open({ from: r.from, to: r.to, cls });
});
if (!reduce) {
  $$('[data-routes] .board__row').forEach((row, i) => {
    gsap.from(row, { opacity: 0, y: 24, duration: 1.1, ease: EASE, delay: (i % 4) * 0.05, scrollTrigger: { trigger: row, start: 'top 92%', once: true } });
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

const fitWord = () => {
  const el = $('[data-fit]');
  el.style.fontSize = '100px';
  const w = el.getBoundingClientRect().width;
  if (w) el.style.fontSize = (100 * el.parentElement.getBoundingClientRect().width / w).toFixed(2) + 'px';
};
document.fonts.ready.then(() => { fitWord(); ScrollTrigger.refresh(); });
addEventListener('resize', fitWord);

if (location.hash === '#book') booking.open({ cls });
addEventListener('load', () => ScrollTrigger.refresh());
