// Top-down cabin plans drawn from simple layouts in metres. Nose to the left on wide screens, up on phones.
// x runs aft from the forward cabin bulkhead, y across the cabin from the left wall. Indicative, not to certified drawings.

// Zones are numbered in the plan and described in the legend.
// seat: face 'aft' looks toward the tail, 'fwd' toward the nose, 'side' across the aisle.
const PLANS = {
  light: {
    seat: 0.6,
    zones: [
      { to: 0.95, name: 'Refreshment centre', copy: 'Chilled drinks, coffee and snacks within reach of every seat.' },
      { to: 3.05, name: 'Club four', copy: 'Four seats facing in pairs, with fold-out tables for work or a meal.' },
      { to: 4.0, name: 'Forward-facing pair', copy: 'Two more seats with their own windows and reading lights.' },
      { to: 5.23, name: 'Lavatory', copy: 'Private and enclosed at the rear, with an external service door.' },
    ],
    items: [
      ['galley', 0.1, 0.06, 0.75, 0.46],
      ['seat', 0.25, 0.89, 'side'],
      ['seat', 1.05, 0.06, 'aft'], ['seat', 1.05, 0.89, 'aft'],
      ['table', 1.7, 0.12, 0.55, 0.42], ['table', 1.7, 1.01, 0.55, 0.42],
      ['seat', 2.3, 0.06, 'fwd'], ['seat', 2.3, 0.89, 'fwd'],
      ['seat', 3.2, 0.06, 'fwd'], ['seat', 3.2, 0.89, 'fwd'],
      ['wall', 4.05],
      ['lav', 4.15, 0.06, 1.0, 1.43],
    ],
  },
  midsize: {
    zones: [
      { to: 1.15, name: 'Galley', copy: 'Hot meals, espresso and a chilled bar, with a coat closet opposite.' },
      { to: 3.45, name: 'Club four', copy: 'Four wide seats that recline and swivel, and two flat berths at night.' },
      { to: 6.0, name: 'Conference and divan', copy: 'A facing pair at a table for work, and a three-seat divan that sleeps one.' },
      { to: 7.68, name: 'Lavatory', copy: 'Full-width at the rear, with a vanity and walk-in access to the baggage hold.' },
    ],
    items: [
      ['galley', 0.1, 0.06, 0.95, 0.55],
      ['cabinet', 0.1, 1.55, 0.7, 0.58, 'Closet'],
      ['seat', 1.3, 0.06, 'aft'], ['seat', 1.3, 1.47, 'aft'],
      ['table', 2.01, 0.12, 0.6, 0.54], ['table', 2.01, 1.53, 0.6, 0.54],
      ['seat', 2.66, 0.06, 'fwd'], ['seat', 2.66, 1.47, 'fwd'],
      ['seat', 3.6, 0.06, 'aft'],
      ['table', 4.31, 0.12, 0.6, 0.54],
      ['seat', 4.96, 0.06, 'fwd'],
      ['divan', 3.6, 1.47, 2.05, 'right'],
      ['wall', 6.05],
      ['lav', 6.15, 0.06, 1.43, 2.07],
    ],
  },
  ulr: {
    zones: [
      { to: 2.35, name: 'Galley and crew rest', copy: 'A full galley with an oven and espresso, and a private bunk for the relief crew.' },
      { to: 3.5, name: 'Forward lavatory', copy: 'For guests in the front of the cabin, with a coat closet opposite.' },
      { to: 6.05, name: 'Club', copy: 'Four deep seats facing in pairs. Most guests spend take-off here.' },
      { to: 8.85, name: 'Dining', copy: 'A table that joins across the aisle and seats four for a proper meal.' },
      { to: 11.75, name: 'Lounge', copy: 'A three-seat divan facing a pair at a table. Converts to two beds.' },
      { to: 15.5, name: 'Bedroom', copy: 'A full bed behind a closing door, with storage and its own climate control.' },
      { to: 17.35, name: 'Lavatory and shower', copy: 'The principal bathroom, with an optional stand-up shower.' },
    ],
    items: [
      ['bunk', 0.1, 0.06, 1.8, 0.72, 'Crew rest'],
      ['galley', 0.1, 1.73, 2.1, 0.7],
      ['wall', 2.3],
      ['lav', 2.45, 0.06, 0.95, 1.15],
      ['cabinet', 2.45, 1.83, 0.7, 0.6, 'Closet'],
      ['wall', 3.5],
      ['seat', 3.65, 0.06, 'aft'], ['seat', 3.65, 1.77, 'aft'],
      ['table', 4.42, 0.12, 0.6, 0.54], ['table', 4.42, 1.83, 0.6, 0.54],
      ['seat', 5.09, 0.06, 'fwd'], ['seat', 5.09, 1.77, 'fwd'],
      ['wall', 6.05],
      ['seat', 6.2, 0.06, 'aft'], ['seat', 6.2, 1.77, 'aft'],
      ['table', 6.97, 0.12, 0.8, 2.25],
      ['seat', 7.84, 0.06, 'fwd'], ['seat', 7.84, 1.77, 'fwd'],
      ['wall', 8.85],
      ['divan', 9.05, 0.06, 2.1, 'left'],
      ['seat', 9.05, 1.77, 'aft'],
      ['table', 9.82, 1.83, 0.6, 0.54],
      ['seat', 10.49, 1.77, 'fwd'],
      ['wall', 11.75],
      ['bed', 12.1, 0.06, 2.1, 1.45],
      ['cabinet', 12.3, 1.93, 1.5, 0.5, 'Storage'],
      ['wall', 15.5],
      ['lav', 15.6, 0.06, 1.67, 2.37],
      ['shower', 16.6, 1.34, 0.62, 1.09],
    ],
  },
  flagship: {
    zones: [
      { to: 2.4, name: 'Galley and crew suite', copy: 'A chef-grade galley and a dedicated crew suite, so the crew rests out of sight.' },
      { to: 3.55, name: 'Forward lavatory', copy: 'For guests in the front three rooms, with a coat closet opposite.' },
      { to: 5.9, name: 'Club', copy: 'Four deep seats facing in pairs, with fold-out tables.' },
      { to: 9.05, name: 'Dining for six', copy: 'A full-width table for six. Breakfast, a working lunch or dinner over the Atlantic.' },
      { to: 11.9, name: 'Media room', copy: 'A three-seat divan facing a large screen. Converts to a second bed.' },
      { to: 15.05, name: 'Principal suite', copy: 'A full-size bed, a lounge chair and a wardrobe behind a closing door.' },
      { to: 16.59, name: 'En-suite with shower', copy: 'A private bathroom with a stand-up shower, for the suite alone.' },
    ],
    items: [
      ['bunk', 0.1, 0.06, 1.85, 0.72, 'Crew suite'],
      ['galley', 0.1, 1.68, 2.2, 0.7],
      ['wall', 2.4],
      ['lav', 2.5, 0.06, 0.95, 1.15],
      ['cabinet', 2.5, 1.78, 0.7, 0.6, 'Closet'],
      ['wall', 3.55],
      ['seat', 3.7, 0.06, 'aft'], ['seat', 3.7, 1.72, 'aft'],
      ['table', 4.47, 0.12, 0.6, 0.54], ['table', 4.47, 1.78, 0.6, 0.54],
      ['seat', 5.14, 0.06, 'fwd'], ['seat', 5.14, 1.72, 'fwd'],
      ['wall', 5.9],
      ['seat', 6.05, 0.06, 'aft'], ['seat', 6.05, 0.89, 'aft'], ['seat', 6.05, 1.72, 'aft'],
      ['table', 6.82, 0.14, 1.36, 2.16],
      ['seat', 8.25, 0.06, 'fwd'], ['seat', 8.25, 0.89, 'fwd'], ['seat', 8.25, 1.72, 'fwd'],
      ['wall', 9.05],
      ['divan', 9.3, 0.06, 2.1, 'left'],
      ['cabinet', 9.6, 1.94, 1.5, 0.44, 'Screen'],
      ['wall', 11.9],
      ['bed', 12.2, 0.06, 2.1, 1.5],
      ['seat', 12.45, 1.72, 'fwd'],
      ['cabinet', 13.5, 1.88, 1.3, 0.5, 'Wardrobe'],
      ['wall', 15.05],
      ['lav', 15.15, 0.06, 1.36, 2.32],
      ['shower', 15.9, 1.3, 0.55, 1.08],
    ],
  },
};

export const planFor = (id) => PLANS[id];

const NOSE = 1.9, TAIL = 1.5; // drawn beyond the cabin: flight deck and aft baggage

// Draws in centimetres. `vertical` swaps the axes so the nose points up. Text and zone pins are HTML laid over
// the drawing in percentages, so they stay legible at any size and never mirror.
export function renderPlan(id, cabin, { vertical = false } = {}) {
  const plan = PLANS[id];
  const seat = (plan.seat || 0.66) * 100, back = 14;
  const L = cabin.length * 100, W = cabin.width * 100;
  const cm = (m) => +(m * 100).toFixed(1);
  const P = (x, y) => (vertical ? [y, x] : [x, y]);
  const pad = 46;
  const span = [L + (NOSE + TAIL) * 100, W + 120];
  const [vw, vh] = vertical ? [span[1] + pad * 2, span[0] + pad * 2] : [span[0] + pad * 2, span[1] + pad * 2];
  const ox = NOSE * 100 + pad, oy = 60 + pad; // cabin origin inside the drawing

  const rect = (x, y, w, h, cls, rx = 6) => {
    const [ax, ay] = P(x, y);
    const [bw, bh] = vertical ? [h, w] : [w, h];
    return `<rect class="${cls}" x="${ax.toFixed(1)}" y="${ay.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${rx}" />`;
  };
  const line = (x1, y1, x2, y2, cls) => {
    const [a, b] = P(x1, y1), [c, d] = P(x2, y2);
    return `<line class="${cls}" x1="${a}" y1="${b}" x2="${c}" y2="${d}" />`;
  };
  const notes = [];
  const pct = (x, y) => { const [a, b] = P(x, y); return `left:${((a / vw) * 100).toFixed(2)}%;top:${((b / vh) * 100).toFixed(2)}%`; };
  const text = (x, y, s, cls = '') => notes.push(`<span class="plan__note ${cls}" style="${pct(x, y)}">${s}</span>`);
  // Labels inside long, narrow units turn with the unit when the plan stands upright.
  const turn = (w, h) => (vertical && w > h * 1.4 ? 'plan__note--turn' : '');

  // Fuselage: a long capsule with a pointed nose and a tapering tail.
  const t = (x, y) => P(ox + x, oy + y).map((v) => v.toFixed(1)).join(' ');
  const N = NOSE * 100, T = TAIL * 100;
  const hull = `M${t(-N, W / 2)} C${t(-N * 0.94, W * 0.1)} ${t(-N * 0.62, -60)} ${t(0, -60)}
    L${t(L, -60)} C${t(L + T * 0.55, -60)} ${t(L + T * 0.96, W * 0.22)} ${t(L + T, W / 2)}
    C${t(L + T * 0.96, W * 0.78)} ${t(L + T * 0.55, W + 60)} ${t(L, W + 60)}
    L${t(0, W + 60)} C${t(-N * 0.62, W + 60)} ${t(-N * 0.94, W * 0.9)} ${t(-N, W / 2)} Z`;

  const out = [];
  const zoneRects = [];
  let from = 0;
  plan.zones.forEach((z, i) => {
    zoneRects.push(rect(ox + cm(from), oy, cm(z.to - from), W, 'fp-zone', 0).replace('<rect', `<rect data-zone="${i}"`));
    from = z.to;
  });

  for (const [type, ...a] of plan.items) {
    const x = ox + cm(a[0]), y = oy + cm(a[1] ?? 0);
    if (type === 'wall') {
      // Partition with a door gap on the aisle.
      out.push(line(x, oy, x, oy + W * 0.36, 'fp-wall'), line(x, oy + W * 0.64, x, oy + W, 'fp-wall'));
    } else if (type === 'seat') {
      const face = a[2];
      out.push(rect(x, y, seat, seat, 'fp-seat', 10));
      if (face === 'aft') out.push(rect(x, y, back, seat, 'fp-back', 5));
      if (face === 'fwd') out.push(rect(x + seat - back, y, back, seat, 'fp-back', 5));
      if (face === 'side') out.push(rect(x, y + seat - back, seat, back, 'fp-back', 5));
    } else if (type === 'divan') {
      const len = cm(a[2]);
      const wallSide = a[3] === 'left' ? y : y + 52;
      out.push(rect(x, y, len, 66, 'fp-seat', 10), rect(x, wallSide, len, 14, 'fp-back', 5));
      for (let k = 1; k < 3; k++) out.push(line(x + (len * k) / 3, y + (a[3] === 'left' ? 14 : 0), x + (len * k) / 3, y + (a[3] === 'left' ? 66 : 52), 'fp-seam'));
    } else if (type === 'table') {
      out.push(rect(x, y, cm(a[2]), cm(a[3]), 'fp-table', 8));
    } else if (type === 'galley' || type === 'cabinet') {
      out.push(rect(x, y, cm(a[2]), cm(a[3]), 'fp-unit', 4));
      text(x + cm(a[2]) / 2, y + cm(a[3]) / 2, type === 'galley' ? 'Galley' : a[4], turn(a[2], a[3]));
    } else if (type === 'lav') {
      const w = cm(a[2]), h = cm(a[3]);
      out.push(rect(x, y, w, h, 'fp-room', 4));
      const [cx, cy] = P(x + w * 0.62, y + 32);
      out.push(`<ellipse class="fp-fixture" cx="${cx}" cy="${cy}" rx="${vertical ? 16 : 22}" ry="${vertical ? 22 : 16}" />`);
      out.push(rect(x + 10, y + h - 46, Math.min(w - 20, 70), 36, 'fp-fixture', 6));
    } else if (type === 'shower') {
      const w = cm(a[2]), h = cm(a[3]);
      out.push(rect(x, y, w, h, 'fp-shower', 4));
      text(x + w / 2, y + h / 2, 'Shower');
    } else if (type === 'bed' || type === 'bunk') {
      const w = cm(a[2]), h = cm(a[3]);
      out.push(rect(x, y, w, h, 'fp-bed', 10));
      const pillows = type === 'bed' ? 2 : 1;
      for (let k = 0; k < pillows; k++) out.push(rect(x + 10, y + 10 + k * ((h - 20) / pillows), 34, (h - 20) / pillows - 8, 'fp-pillow', 6));
      out.push(line(x + w * 0.62, y + 6, x + w * 0.62, y + h - 6, 'fp-seam'));
      text(x + w * (a[4] ? 0.74 : 0.8), y + h / 2, a[4] || 'Bed', turn(w, h));
    }
  }

  // Zone numbers sit outside the hull, on the window line, so they never cover furniture.
  from = 0;
  const pins = plan.zones.map((z, i) => {
    const html = `<span class="plan__pin" data-zone="${i}" style="${pct(ox + cm((from + z.to) / 2), oy - 60 - 30)}" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>`;
    from = z.to;
    return html;
  });
  text(ox - NOSE * 100 * 0.5, oy + W / 2, 'Flight deck', 'plan__note--end');
  text(ox + L + TAIL * 100 * 0.42, oy + W / 2, 'Baggage', 'plan__note--end');

  const svg = `<svg class="fp" viewBox="0 0 ${vw.toFixed(0)} ${vh.toFixed(0)}" aria-hidden="true" focusable="false">
    <path class="fp-hull" d="${hull}" />
    ${zoneRects.join('')}
    ${line(ox, oy, ox + L, oy, 'fp-wallside')}${line(ox, oy + W, ox + L, oy + W, 'fp-wallside')}
    ${out.join('')}
  </svg>`;
  return { html: svg + notes.join('') + pins.join(''), ratio: vw / vh };
}
