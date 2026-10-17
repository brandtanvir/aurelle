# Aurelle — Strategy, UX Research & PRD

*Private aviation for people whose time is the scarcest asset they own.*

---

## 1. Feasibility analysis

**Verdict: feasible and commercially sound — as a website. The business behind it is the hard part, and the website should be honest about how that business actually works.**

| Question | Answer |
|---|---|
| Is there a market? | Yes. Private aviation is a ~$35–40B/yr market. Charter + jet-card demand stayed structurally higher after 2020. Ultra-high-net-worth population (>$30M) is ~400k people globally and growing. |
| Can a website sell a $40k–$250k flight? | Not by itself. At this price point the website's job is **trust + desire + a frictionless first contact**. The sale closes with a human concierge. Every leading operator (VistaJet, NetJets, Flexjet, Jesko Jets) works this way. |
| Do we need to own jets? | No. Most "operators" sell charter on aircraft they manage or broker under a certified operator's AOC (Air Operator Certificate). The site must not overclaim ownership; "our fleet" is fine for managed aircraft. |
| Can the site book & take payment instantly? | It shouldn't. Pricing depends on positioning, crew duty, slots, overflight permits and catering. The right UX is: **instant indicative estimate → concierge confirms a firm quote in minutes**. That is what v1 builds. |
| "Anywhere in the world"? | Realistically: anywhere with a suitable runway, subject to permits and sanctions. Copy says "190+ countries", not "everywhere". |
| Is the immersive experience feasible on mobile? | Yes, if engineered for it: WebGL with capped pixel-ratio, renderers that pause off-screen, reduced cloud counts on phones, and a full `prefers-reduced-motion` fallback. |
| Legal | Needs privacy policy, terms of carriage, operator disclosure ("flights operated by …, AOC no. …"), and in the US the DOT Part 295 broker disclosure. Placeholders included. |

### Risks & mitigations
- **Trust is the conversion bottleneck.** Billionaires buy from referrals. → Safety credentials (ARGUS / Wyvern / IS-BAO), discretion promise, a real named concierge, and response-time guarantee on-site.
- **Price transparency is a double-edged sword.** Too precise looks cheap and becomes a promise; too vague feels evasive. → Show *indicative* ranges with the method ("hours × class rate, incl. positioning"), never a firm price.
- **Performance vs. spectacle.** Heavy WebGL can feel cheap if it stutters. → Spectacle is concentrated in two scenes (hero, globe). Everything else is type, space and motion.

---

## 2. Elaborating the idea — what to add, what to omit

### Add
1. **Jet Card membership with a rate that improves with loyalty.** Your reference image says *"A discount that gets better and better."* This is the strongest commercial idea in the brief: prepaid hours, guaranteed availability, and an hourly rate that drops as lifetime hours accrue. It turns one-off charter into recurring revenue.
2. **Empty legs board.** Repositioning flights at up to ~75% off. It's the one place price *can* be shown openly, it creates urgency, and it's a perfect gateway for the "aspirational wealthy" who later become charter clients.
3. **Route planner on a 3D globe.** Pick two cities → see the great-circle route, flight time and recommended aircraft class. It turns the "wow" scene into a booking tool.
4. **The 60-second quote request.** Four steps, airport autocomplete, live estimate, confirmation reference. No account required.
5. **Concierge-first contact.** Phone, WhatsApp, email with a stated response time ("A concierge replies within 10 minutes, 24/7").
6. **Discretion as a feature.** NDAs for crew, private terminals (FBOs), no passenger manifests shared. This audience values privacy above Wi-Fi.

### Omit (on purpose)
- **Accounts / logins / dashboards on v1.** UHNW clients don't create accounts; their assistants call. Members get a portal later.
- **Real-time instant booking & card payment.** Wrong for the price point (see feasibility).
- **Blog, newsroom, press logos wall.** Noise. Apple and Amex don't lead with these.
- **Stock-photo smiling people with champagne.** The cliché of the category. We show aircraft, sky, light and time.
- **Chatbots and pop-ups.** Instant cheapening of the brand.
- **Ambient audio.** Never auto-play sound for this audience.

---

## 3. UX research

### 3.1 Competitive audit

| Site | What works | What doesn't |
|---|---|---|
| **Jesko Jets** (reference) | Restraint; huge type; scroll-scrubbed 3D; one aircraft at a time; numbers as design; accordion services | No booking path beyond email; no pricing signal at all; accessibility weak (low contrast, motion-only content) |
| **VistaJet** | Membership framing ("Program"), global footprint, consistent livery | Corporate, dense navigation, lots of copy |
| **NetJets** | Trust through scale & safety; clear product tiers (share, lease, card) | Feels like an insurance company |
| **Wheels Up / Flexjet** | Clear quote flow, app-like booking | Mass-market feel, discount energy |
| **Apple / Amex Centurion** | Silence, rhythm, one idea per screen, product as hero | — the tone benchmark |

**Gap Aurelle fills:** Jesko's cinematic restraint **+** a genuinely useful, transparent booking path **+** a loyalty membership.

### 3.2 Personas

**1. The Principal — "Elena", 54, founder, $2B net worth**
Flies 150–250 hrs/yr. Never books herself. Cares about: privacy, reliability, the same crew, zero friction. Visits the site once, on a phone, to decide whether the brand is "her level." *Design for a 20-second judgement.*

**2. The Gatekeeper — "Marcus", 36, chief of staff / EA**
Books the flights. Cares about: speed, a firm quote fast, someone who answers at 3 a.m., paperwork handled. *Design for task completion: quote form, phone number, response time.*

**3. The Aspirant — "Ryan", 41, tech exec, $30M**
Charters 2–4 times a year, curious about a jet card. Compares prices. *Design for education: membership calculator, empty legs, what's included.*

### 3.3 Key insights → design decisions

| Insight | Decision |
|---|---|
| The principal judges brand level in seconds, often on mobile | Hero is one sentence + one image. Mobile hero is designed, not shrunk. |
| Assistants need the shortest route to a human | "Book a flight" is in the nav on every scroll position; phone number in menu and footer. |
| Price opacity reads as "if you have to ask…" but kills the aspirant segment | Indicative estimates in the planner and booking flow, clearly labelled. Empty legs show real prices. |
| Privacy matters more than features | A dedicated *Discretion* chapter; form asks for the minimum. |
| Many visitors are older, on high-end devices, in bright environments | Light theme first, high-contrast text (WCAG AA), large tap targets, no hover-only info. |
| Motion sickness and accessibility | Everything works with `prefers-reduced-motion`: scrubbed scenes become static compositions. |

### 3.4 Principles
1. **One idea per screen.** If a section needs two headlines it's two sections.
2. **Silence is a material.** Whitespace is budgeted, not leftover.
3. **Motion explains, never decorates.** Every animation reveals hierarchy, space, or cause-and-effect.
4. **Function in the beautiful parts.** The globe plans routes, the membership section calculates, the board books.
5. **Under-promise in copy.** Quiet confidence: no exclamation marks, no superlatives stacked.

---

## 4. PRD — Aurelle website v1

### 4.1 Goals & success metrics
| Goal | Metric (target) |
|---|---|
| Convert interest into conversations | Quote-request completion ≥ 35% of starts; ≥ 3% of sessions start a request |
| Signal "top of category" | Avg. engaged time ≥ 90 s; scroll depth to Fleet ≥ 60% |
| Grow membership pipeline | ≥ 15% of membership-section viewers use the calculator |
| Feel premium on every device | 60 fps on recent iPhone/MacBook; LCP < 2.5 s; CLS < 0.05; Lighthouse a11y ≥ 95 |

### 4.2 Scope (v1 — this build)
**Global**
- Light & dark themes; light default; manual toggle persisted; animated circular theme transition.
- Smooth scroll (Lenis) synced to GSAP ScrollTrigger.
- Fully responsive 360 px → 2560 px; dedicated mobile menu.
- Reduced-motion mode; keyboard accessible; semantic landmarks; visible focus.
- Preloader that gates on WebGL readiness (max ~1.5 s).

**Home narrative (single long-form page)**
1. **Hero — "Out of the clouds."** Real-time WebGL: an Aurelle jet emerges from volumetric clouds and banks across the frame as you scroll; headline splits apart.
2. **Manifesto.** One sentence revealed word by word.
3. **Proof in numbers.** 190+ countries · 7,000+ airports · 10-min response · 24/7.
4. **Fleet.** Pinned 3D viewer; four classes (Light, Midsize, Ultra-long-range, Flagship); the jet transforms between them; specs animate.
5. **The experience.** Accordion (Discretion, Onboard dining, Pets, 24/7 concierge) beside a cabin window whose sky changes per item.
6. **Membership.** Three tiers + an hours slider showing the loyalty-adjusted hourly rate.
7. **Global reach.** 3D dot-matrix globe; pick origin & destination → great-circle arc, distance, flight time, suggested class, "Continue to booking."
8. **Empty legs.** Departure-board list with split-flap animation; book prefilled.
9. **Final call.** Concierge contacts + CTA.

**Booking flow (full-screen overlay, deep-linkable via `#book`)**
1. Journey: one-way / return, from, to (autocomplete over 60+ airports), date(s), passengers.
2. Aircraft: class cards with indicative price & flight time (disabled if range or seats insufficient).
3. Details: name, email, phone, optional preferences (pets, catering, ground transport), notes.
4. Confirmation: reference number, summary, "A concierge will call within 10 minutes."
- Inline validation, no data leaves the browser in v1 (ready for email/CRM hookup).

### 4.3 Out of scope (v2+)
Member portal, live availability/pricing API, payments, CMS, multilingual (EN/AR/ZH/FR/RU priority), aircraft-sales listings, individual aircraft pages.

### 4.4 Visual system
- **Palette — Ivory & Graphite**
  - Light: bg `#F4F1EC`, surface `#ECE7DF`, ink `#1B1C1E`, muted `#8A8478`, accent `#B08D57`
  - Dark: bg `#0C0C0D`, surface `#151517`, ink `#ECE8E1`, muted `#7D786F`, accent `#C9A46A`
  - The accent is used **sparingly**: the engine glow, one word per section, active states.
- **Type** — *Cormorant Garamond* (light/italic) for display moments; *Inter Tight* for UI & body. Display sizes are fluid (`clamp`), tracking tightened at large sizes; small caps-style eyebrow labels with wide tracking.
- **Grid** — 12 columns desktop, 4 mobile, 16 px mobile gutters.
- **Motion** — easing `cubic-bezier(.16,1,.3,1)` ("expo-out") for reveals; 0.9–1.4 s durations for large moves, 0.25–0.4 s for UI. Scroll-linked scenes are scrubbed with inertia.

### 4.5 Technical
- No build step: ES modules + import map; GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13, Three.js r169 from pinned CDNs. Static hosting anywhere (Netlify, Vercel, S3).
- WebGL: DPR capped at 1.75 (1.5 mobile); renderers pause when off-screen or tab hidden; cloud instancing scales with device.
- Theme stored in `localStorage` (guarded), applied before first paint to avoid flash.

### 4.6 Acceptance criteria
- Hero renders and animates at 60 fps on M-series Mac / recent iPhone; no layout shift on load.
- Theme toggle switches every surface including WebGL scenes, without reload.
- Booking flow can be completed with keyboard only; errors are announced.
- With reduced motion: no scrubbed or parallax animation, all content visible.
- No horizontal scroll at 360 px.
