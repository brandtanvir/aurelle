// Four-step quote request in a full-screen dialog. Nothing leaves the browser in v1.
import { AIRPORTS, FLEET, flightPlan, bestClass, fmtHours, fmtMoney, fmtKm } from './data.js';

const LABELS = ['Continue', 'Continue', 'Send request', 'Close'];
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const fmtDate = (s) => new Date(s + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const airportLabel = (a) => `${a.city} · ${a.code}`;

// Indicative: block hours × rate, return ≈ 1.85×; one-way range covers positioning.
export function quote(f, hours, ret) {
  const base = hours * f.rate * (ret ? 1.85 : 1);
  const r100 = (n) => Math.round(n / 100) * 100;
  return { lo: r100(base * 0.95), hi: r100(base * (ret ? 1.12 : 1.35)) };
}

export function initBooking({ lenis } = {}) {
  const root = document.querySelector('[data-booking]');
  const form = root.querySelector('[data-booking-form]');
  const steps = [...root.querySelectorAll('[data-step]')];
  const crumbs = [...root.querySelectorAll('[data-steps] li')];
  const next = root.querySelector('[data-next]');
  const prev = root.querySelector('[data-prev]');
  const estimate = root.querySelector('[data-estimate]');
  const classesEl = root.querySelector('[data-classes]');
  const state = { step: 0, from: null, to: null, cls: null };
  let lastFocus = null;

  const $ = (name) => form.elements[name];
  const today = iso(new Date());
  $('date').min = today;
  $('returnDate').min = today;

  // ----- Autocomplete -----
  function autocomplete(key) {
    const wrap = root.querySelector(`[data-ac="${key}"]`);
    const input = wrap.querySelector('input');
    const list = wrap.querySelector('ul');
    let items = [], active = -1;

    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
    const choose = (a) => {
      state[key] = a;
      input.value = airportLabel(a);
      setError(wrap, '');
      close();
      updateEstimate();
    };
    const render = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { close(); return; }
      items = AIRPORTS
        .map((a) => {
          const code = a.code.toLowerCase(), city = a.city.toLowerCase();
          const score = code === q ? 0 : city.startsWith(q) ? 1 : code.startsWith(q) ? 2 : (a.name + ' ' + a.country).toLowerCase().includes(q) || city.includes(q) ? 3 : 9;
          return { a, score };
        })
        .filter((x) => x.score < 9)
        .sort((x, y) => x.score - y.score)
        .slice(0, 6)
        .map((x) => x.a);
      list.innerHTML = items.length
        ? items.map((a, i) => `<li role="option" id="${key}-opt-${i}" aria-selected="false" data-i="${i}"><b>${a.code}</b><span>${a.city}</span><small>${a.name} · ${a.country}</small></li>`).join('')
        : '<li aria-disabled="true"><span></span><small>No match. Your concierge can arrange any airport.</small></li>';
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      active = -1;
    };
    const highlight = (i) => {
      const opts = [...list.querySelectorAll('[role="option"]')];
      if (!opts.length) return;
      active = (i + opts.length) % opts.length;
      opts.forEach((o, j) => o.setAttribute('aria-selected', String(j === active)));
      input.setAttribute('aria-activedescendant', opts[active].id);
      opts[active].scrollIntoView({ block: 'nearest' });
    };

    input.addEventListener('input', () => { state[key] = null; render(); updateEstimate(); });
    input.addEventListener('focus', () => { if (!state[key]) render(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) render(); highlight(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - 1); }
      else if (e.key === 'Enter' && !list.hidden && items.length) { e.preventDefault(); choose(items[Math.max(0, active)]); }
      else if (e.key === 'Escape' && !list.hidden) { e.stopPropagation(); close(); }
    });
    // Accept an exact IATA code or a single remaining match without picking from the list.
    const resolve = () => {
      close();
      if (state[key]) return;
      const q = input.value.trim().toUpperCase();
      const exact = AIRPORTS.find((a) => a.code === q) || (items.length === 1 ? items[0] : null);
      if (exact) choose(exact);
    };
    input.addEventListener('blur', () => setTimeout(resolve, 120));
    list.addEventListener('mousedown', (e) => {
      const li = e.target.closest('[role="option"]');
      if (!li) return;
      e.preventDefault();
      choose(items[+li.dataset.i]);
    });
    return { resolve, set: (a) => (a ? choose(a) : ((state[key] = null), (input.value = ''))) };
  }
  const acFrom = autocomplete('from');
  const acTo = autocomplete('to');

  // ----- Trip type & passengers -----
  const returnField = root.querySelector('[data-return-field]');
  form.addEventListener('change', (e) => {
    if (e.target.name === 'trip') {
      returnField.hidden = e.target.value !== 'return';
      updateEstimate();
    }
    if (e.target.name === 'cls') {
      state.cls = FLEET.find((f) => f.id === e.target.value);
      root.querySelector('[data-class-err]').textContent = '';
      updateEstimate();
    }
    if (e.target.name === 'pax') clampPax();
  });
  const clampPax = () => { const p = $('pax'); p.value = Math.min(19, Math.max(1, parseInt(p.value, 10) || 1)); };
  root.querySelectorAll('[data-pax]').forEach((b) => b.addEventListener('click', () => {
    $('pax').value = (parseInt($('pax').value, 10) || 1) + +b.dataset.pax;
    clampPax();
  }));

  // ----- Validation -----
  function setError(fieldOrWrap, msg) {
    const f = fieldOrWrap.closest ? fieldOrWrap.closest('.field') || fieldOrWrap : fieldOrWrap;
    f.classList.toggle('is-invalid', !!msg);
    const err = f.querySelector('.field__err');
    if (err) err.textContent = msg;
    const input = f.querySelector('input');
    if (input) input.setAttribute('aria-invalid', String(!!msg));
  }
  function validate(step) {
    const errs = [];
    const check = (el, ok, msg) => { setError(el, ok ? '' : msg); if (!ok) errs.push(el); };
    if (step === 0) {
      check($('from'), !!state.from, 'Choose a departure airport from the list.');
      check($('to'), !!state.to && state.to !== state.from, state.to === state.from && state.to ? 'Destination must differ from departure.' : 'Choose a destination from the list.');
      check($('date'), $('date').value && $('date').value >= today, 'Choose a date from today onward.');
      if (form.trip.value === 'return') check($('returnDate'), $('returnDate').value && $('returnDate').value >= $('date').value, 'Return must be on or after departure.');
    }
    if (step === 1 && !state.cls) {
      root.querySelector('[data-class-err]').textContent = 'Select an aircraft class to continue.';
      errs.push(classesEl.querySelector('input:not(:disabled)'));
    }
    if (step === 2) {
      check($('name'), $('name').value.trim().length > 1, 'Please tell us your name.');
      check($('email'), /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('email').value.trim()), 'Enter a valid email address.');
      check($('phone'), $('phone').value.replace(/\D/g, '').length >= 7, 'Enter a phone number we can call.');
    }
    errs[0]?.focus();
    return !errs.length;
  }

  // ----- Aircraft step -----
  function renderClasses() {
    const pax = +$('pax').value;
    const ret = form.trip.value === 'return';
    const plan0 = flightPlan(state.from, state.to, FLEET[0]);
    root.querySelector('[data-route-summary]').textContent =
      `${state.from.city} → ${state.to.city} · ${fmtKm(plan0.km)} · ${pax} passenger${pax > 1 ? 's' : ''}${ret ? ' · return' : ''}`;
    const rec = FLEET.find((f) => f.pax >= pax && plan0.km <= f.rangeKm * 0.9) || bestClass(plan0.km);
    if (!state.cls || state.cls.pax < pax) state.cls = rec.pax >= pax ? rec : null;
    classesEl.innerHTML = FLEET.map((f) => {
      const plan = flightPlan(state.from, state.to, f);
      const disabled = f.pax < pax;
      const price = quote(f, plan.hours, ret);
      return `<label class="cls">
        <input type="radio" name="cls" value="${f.id}" ${disabled ? 'disabled' : ''} ${state.cls?.id === f.id ? 'checked' : ''} />
        <span class="cls__card">
          <span class="cls__top"><span class="cls__name">${f.label}</span><span class="cls__price">${fmtMoney(price.lo)}+</span></span>
          <span class="cls__model">${f.model} or similar</span>
          <span class="cls__meta"><span>${fmtHours(plan.hours)}${plan.stops ? ` · ${plan.stops} fuel stop` : ' · non-stop'}</span><span>Up to ${f.pax} guests</span></span>
          ${disabled ? `<span class="cls__why">Seats up to ${f.pax}</span>` : f === rec ? '<span class="cls__why">Recommended for this route</span>' : ''}
        </span>
      </label>`;
    }).join('');
  }

  function updateEstimate() {
    if (!state.from || !state.to || state.from === state.to) { estimate.innerHTML = ''; return; }
    const ret = form.trip.value === 'return';
    const f = state.cls || bestClass(flightPlan(state.from, state.to, FLEET[0]).km);
    const plan = flightPlan(state.from, state.to, f);
    const q = quote(f, plan.hours, ret);
    estimate.innerHTML = `Indicative · ${f.label} · ${fmtHours(plan.hours)}<strong>${fmtMoney(q.lo)} – ${fmtMoney(q.hi)}</strong>`;
  }

  // ----- Navigation -----
  function go(i) {
    state.step = i;
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    crumbs.forEach((c, j) => { c.classList.toggle('is-active', j === i); c.classList.toggle('is-done', j < i); });
    prev.hidden = i === 0 || i === 3;
    next.textContent = LABELS[i];
    estimate.hidden = i === 3;
    root.scrollTo({ top: 0, behavior: 'smooth' });
    const focusEl = steps[i].querySelector('legend');
    focusEl.setAttribute('tabindex', '-1');
    focusEl.focus({ preventScroll: true });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = state.step;
    if (s === 3) return close(true);
    if (s === 0) { acFrom.resolve(); acTo.resolve(); }
    if (!validate(s)) return;
    if (s === 0) renderClasses();
    if (s === 2) finish();
    go(s + 1);
    updateEstimate();
  });
  prev.addEventListener('click', () => go(Math.max(0, state.step - 1)));

  function finish() {
    const ref = 'AUR-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + String(Date.now()).slice(-3);
    root.querySelector('[data-ref]').textContent = ref;
    const ret = form.trip.value === 'return';
    const plan = flightPlan(state.from, state.to, state.cls);
    const q = quote(state.cls, plan.hours, ret);
    const rows = [
      ['Route', `${airportLabel(state.from)} → ${airportLabel(state.to)}`],
      ['Departure', fmtDate($('date').value)],
      ['Return', ret ? fmtDate($('returnDate').value) : 'One way'],
      ['Aircraft', `${state.cls.label}, ${state.cls.model}`],
      ['Passengers', $('pax').value],
      ['Indicative', `${fmtMoney(q.lo)} – ${fmtMoney(q.hi)}`],
    ];
    root.querySelector('[data-summary]').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    // Hook for a real backend: POST Object.fromEntries(new FormData(form)) with ref.
  }

  // ----- Open / close -----
  function open(prefill = {}) {
    if (prefill.from) acFrom.set(prefill.from);
    if (prefill.to) acTo.set(prefill.to);
    if (prefill.date) $('date').value = iso(prefill.date);
    if (prefill.pax) $('pax').value = prefill.pax;
    if (prefill.cls) state.cls = prefill.cls;
    if (!$('date').value) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      $('date').value = iso(d);
    }
    updateEstimate();
    lastFocus = document.activeElement;
    root.hidden = false;
    root.offsetHeight; // commit before transition
    root.classList.add('is-open');
    document.body.classList.add('is-locked');
    lenis?.stop();
    if (location.hash !== '#book') history.replaceState(null, '', '#book');
    go(prefill.from && prefill.to ? (prefill.cls ? 1 : 0) : 0);
    if (state.step === 1) renderClasses();
    setTimeout(() => (prefill.from ? next : $('from')).focus({ preventScroll: true }), 350);
  }

  function close(reset) {
    root.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    lenis?.start();
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => {
      root.hidden = true;
      if (reset) {
        form.reset();
        acFrom.set(null);
        acTo.set(null);
        state.cls = null;
        returnField.hidden = true;
        go(0);
      }
    }, 900);
    lastFocus?.focus?.({ preventScroll: true });
  }

  root.querySelector('[data-booking-close]').addEventListener('click', () => close(state.step === 3));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close(state.step === 3);
    if (e.key === 'Tab') {
      const f = [...root.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea')].filter((el) => !el.disabled && el.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  return { open };
}
