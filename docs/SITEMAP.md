# Aurelle — Sitemap

```
aurelle.com
│
├── /  Home  (v1 — built)                         ← the immersive story
│   ├── #top          Hero — "Out of the clouds" (WebGL jet + clouds)
│   ├── #manifesto    Manifesto (word-by-word reveal)
│   ├── #numbers      Proof in numbers
│   ├── #fleet        Fleet viewer — Light · Midsize · Ultra-long-range · Flagship
│   ├── #experience   The experience — Discretion · Dining · Pets · Concierge
│   ├── #membership   Membership — Reserve · Signature · Sovereign + loyalty calculator
│   ├── #reach        Global reach — 3D globe route planner
│   ├── #empty-legs   Empty legs board
│   └── #contact      Final call + concierge contacts
│
├── #book  Booking overlay  (v1 — built, deep-linkable from anywhere)
│   ├── 1 Journey     trip type, from, to, date(s), passengers
│   ├── 2 Aircraft    class, indicative price, flight time
│   ├── 3 Details     contact, preferences, notes
│   └── 4 Confirmed   reference + next steps
│
├── /fleet/{aircraft}         Aircraft detail (v2)
├── /membership               Membership detail, FAQs, contract terms (v2)
├── /empty-legs               Full live board with filters & alerts (v2)
├── /safety                   Safety & operator credentials — ARGUS, Wyvern, IS-BAO (v2)
├── /about                    Story, leadership, bases (v2)
├── /members                  Member portal — hours, trips, invoices (v3)
│
└── Legal (footer)
    ├── /privacy
    ├── /terms-of-carriage
    └── /operator-disclosure
```

## Navigation

**Desktop nav (persistent, hides on scroll-down, returns on scroll-up)**
`Aurelle` wordmark · Fleet · Experience · Membership · Empty legs · Reach · ◐ theme · **Book a flight**

**Mobile nav**
Wordmark · ◐ · ☰ → full-screen menu: the same links in large serif, concierge phone & WhatsApp, **Book a flight**.

## Primary user paths
| Persona | Path |
|---|---|
| Principal (judgement) | Hero → Manifesto → Fleet → Experience → (forwards link to assistant) |
| Gatekeeper (task) | Any page → **Book a flight** → 4 steps → Confirmed  *(or)* Menu → phone |
| Aspirant (education) | Hero → Membership calculator → Empty legs → Book prefilled |
| Planner (curiosity) | Global reach → pick route → "Continue to booking" (prefilled) |
