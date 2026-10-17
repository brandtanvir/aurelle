// Privacy-first cookie consent. Essential storage only until the visitor says
// otherwise; rejecting takes one click, the same as accepting. The choice is kept
// in localStorage (itself essential storage) and asked again after twelve months.
//
// Analytics hook: load any optional script inside whenAllowed('analytics', ...)
// so it never runs before consent and stops being loaded once consent is withdrawn.

const KEY = 'aurelle.consent.v1';
const MAX_AGE = 365 * 24 * 3600 * 1000;
// Optional categories. Add one entry per purpose when you add a tool for it.
const OPTIONAL = [
  { id: 'analytics', name: 'Visit statistics', note: 'Anonymous counts of pages viewed, so we can see what is useful. No advertising, no profiles.' },
];
// While no optional tool is installed, set ASK to false: the banner then stays
// hidden and the Cookies page alone offers the setting.
const ASK = true;

const $ = (s, r = document) => r.querySelector(s);
const listeners = [];

function read() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    if (c && c.v === 1 && Date.now() - Date.parse(c.at) < MAX_AGE) return c;
  } catch {}
  return null;
}
function write(choices, source = 'banner') {
  const c = { v: 1, at: new Date().toISOString(), source, ...Object.fromEntries(OPTIONAL.map((o) => [o.id, !!choices[o.id]])) };
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  state = c;
  [...listeners].forEach((fn) => fn(c));
  dispatchEvent(new CustomEvent('aurelle:consent', { detail: c }));
  syncInline();
  return c;
}

let state = read();
// Global Privacy Control counts as a refusal, so we do not ask.
if (!state && navigator.globalPrivacyControl === true) state = write({}, 'gpc');

export const get = () => ({ essential: true, ...Object.fromEntries(OPTIONAL.map((o) => [o.id, !!state?.[o.id]])) });
export const decided = () => !!state;
export function whenAllowed(id, fn) {
  if (get()[id]) { fn(); return; }
  const once = (c) => { if (c[id]) { listeners.splice(listeners.indexOf(once), 1); fn(); } };
  listeners.push(once);
}

/* ---------- Banner ---------- */
let banner = null;
function build() {
  banner = document.createElement('section');
  banner.className = 'consent';
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.setAttribute('data-lenis-prevent', '');
  banner.hidden = true;
  banner.innerHTML = `
    <p class="label"><span class="num">(—)</span>Your privacy</p>
    <p class="consent__copy">We use only what this site needs to work. With your permission we would also count visits, anonymously, to improve it. <a href="${new URL('../cookies.html', import.meta.url).pathname}">Cookie policy</a></p>
    <div class="consent__prefs" data-consent-prefs hidden>
      <div class="consent__opt"><b>Essential</b><small>Remembers this choice. Always on.</small><span class="switch"><input type="checkbox" checked disabled aria-label="Essential storage, always on" /><i></i></span></div>
      ${OPTIONAL.map((o) => `<div class="consent__opt"><b id="consent-${o.id}">${o.name}</b><small>${o.note}</small><span class="switch"><input type="checkbox" data-consent-opt="${o.id}" aria-labelledby="consent-${o.id}" /><i></i></span></div>`).join('')}
    </div>
    <div class="consent__actions">
      <button type="button" class="btn btn--ghost" data-consent="reject">Essential only</button>
      <button type="button" class="btn btn--ghost" data-consent="accept">Allow all</button>
    </div>
    <button type="button" class="consent__more" data-consent="prefs" aria-expanded="false">Choose for yourself</button>`;
  document.body.append(banner);

  banner.addEventListener('click', (e) => {
    const b = e.target.closest('[data-consent]');
    if (!b) return;
    const act = b.dataset.consent;
    if (act === 'prefs') return showPrefs(true);
    if (act === 'reject') write({});
    if (act === 'accept') write(Object.fromEntries(OPTIONAL.map((o) => [o.id, true])));
    if (act === 'save') write(Object.fromEntries([...banner.querySelectorAll('[data-consent-opt]')].map((i) => [i.dataset.consentOpt, i.checked])));
    hide();
  });
}
function showPrefs(on) {
  const prefs = $('[data-consent-prefs]', banner);
  const more = $('[data-consent="prefs"]', banner);
  const accept = $('[data-consent="accept"], [data-consent="save"]', banner);
  prefs.hidden = !on;
  more.hidden = on;
  more.setAttribute('aria-expanded', String(on));
  accept.dataset.consent = on ? 'save' : 'accept';
  accept.textContent = on ? 'Save choices' : 'Allow all';
  const cur = get();
  banner.querySelectorAll('[data-consent-opt]').forEach((i) => (i.checked = cur[i.dataset.consentOpt]));
  if (on) $('[data-consent-opt]', banner)?.focus();
}
export function open(withPrefs = true) {
  if (!banner) build();
  showPrefs(withPrefs);
  banner.hidden = false;
  void banner.offsetWidth; // commit the hidden state so the entrance transition runs
  banner.classList.add('is-on');
  if (withPrefs) $('[data-consent-opt]', banner)?.focus();
}
function hide() {
  banner.classList.remove('is-on');
  setTimeout(() => (banner.hidden = true), 600);
}

/* ---------- Inline settings (Cookies page) and footer link ---------- */
function syncInline() {
  document.querySelectorAll('[data-consent-inline]').forEach((box) => {
    const on = get().analytics;
    $('[data-consent-status]', box).textContent = !state
      ? 'You have not made a choice yet. Until you do, only essential storage is used.'
      : on ? 'Visit statistics are allowed. You can withdraw this at any time.' : 'Essential only. No optional storage is in use.';
    box.querySelectorAll('[data-consent-set]').forEach((b) => b.setAttribute('aria-pressed', String(!!state && (b.dataset.consentSet === 'accept') === on)));
  });
}
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-consent-open]');
  if (opener) { e.preventDefault(); open(true); return; }
  const set = e.target.closest('[data-consent-set]');
  if (set) {
    write(set.dataset.consentSet === 'accept' ? Object.fromEntries(OPTIONAL.map((o) => [o.id, true])) : {}, 'settings');
    if (banner && !banner.hidden) hide();
  }
});
syncInline();

// Wait for the homepage intro to finish before asking.
function afterIntro(fn) {
  if (!$('.loader')) return setTimeout(fn, 700);
  let t;
  const go = () => { mo.disconnect(); clearTimeout(t); setTimeout(fn, 500); };
  const mo = new MutationObserver(() => { if (!$('.loader')) go(); });
  mo.observe(document.body, { childList: true });
  t = setTimeout(go, 6000);
}
if (ASK && !state) afterIntro(() => { if (!state && (!banner || banner.hidden)) open(false); });

window.AurelleConsent = { get, decided, open, whenAllowed };
