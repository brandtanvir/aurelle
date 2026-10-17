// Sub-pages (safety, legal): nav, menu and footer only. No smooth scroll, no WebGL.
import './consent.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Nav & menu ---------- */
const nav = $('[data-nav]');
const menu = $('#menu');
const burger = $('[data-menu-open]');
function openMenu() {
  menu.hidden = false;
  void menu.offsetWidth;
  menu.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  nav.classList.add('is-menu');
  document.body.classList.add('is-locked');
}
function closeMenu() {
  if (menu.hidden) return;
  menu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('is-menu');
  document.body.classList.remove('is-locked');
  setTimeout(() => (menu.hidden = true), 900);
}
burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// Over the dark footer the nav turns white; it hides while scrolling down.
const footer = $('.footer');
let lastY = scrollY;
const syncNav = () => {
  const y = scrollY;
  nav.classList.toggle('is-scrolled', y > 40);
  const r = footer.getBoundingClientRect();
  nav.classList.toggle('is-dark', r.top < nav.offsetHeight / 2);
  nav.classList.toggle('is-hidden', y > lastY && y > innerHeight * 0.6 && menu.hidden);
  lastY = y;
};
addEventListener('scroll', syncNav, { passive: true });
syncNav();

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
  // Hook for the mailing list provider goes here (same as js/main.js).
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


// Footer links to pages not built yet stay put instead of jumping to the top.
document.addEventListener('click', (e) => { if (e.target.closest('a[href="#"]')) e.preventDefault(); });
