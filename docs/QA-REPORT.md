# QA & UX audit — 18 Oct 2026

Tested at 1440×900 (desktop), 768×1024 (tablet) and 375×812 (phone) in the in-app Chromium browser.

## Passed on all sizes
- No horizontal overflow; no element bleeds past the viewport.
- No console errors or failed requests after a full scroll, the menu, the booking flow and the planner.
- All videos, posters, models and the night-Earth texture load; lazy videos attach only near the viewport.
- DM Sans loads locally; no italic text anywhere.
- Every in-page anchor resolves; every control has an accessible name.
- Booking flow completes end to end (journey → aircraft → details → confirmation) with validation.

## Found and fixed
| # | Issue | Size | Fix |
|---|---|---|---|
| 1 | Clicking a placeholder link (`href="#"`) threw a JS error in the smooth-scroll handler | All | Handler ignores `#` |
| 2 | Typing an exact airport code (e.g. “GVA”) and pressing Continue failed validation unless the field had lost focus | All | Continue resolves exact codes and single matches first |
| 3 | Grey second sentences in headings were 2.0:1 contrast (needs 3:1 for large text) | All | `--faint` darkened to 3.1–3.4:1 |
| 4 | Muted labels were 4.4:1 (needs 4.5:1) | All | `--muted` darkened to 5.3:1 |
| 5 | Fleet and Experience had no section heading in the outline; card titles were H2s | All | Section intros are H2, aircraft/chapter titles H3 |
| 6 | Tap targets under 44 px: chapter tabs, slider, class chips, Reserve buttons, footer links, phone link | Phone | All raised to ≥ 44 px |
| 7 | Empty-legs rows crammed into three columns; aircraft names wrapped to three lines | Phone | Two-column cards with a full-width Reserve button |
| 8 | Contact buttons stacked at different widths | Phone | Equal, full-width buttons |
| 9 | Booking “Continue” was a small right-aligned button | Phone | Full-width thumb-reach buttons |
| 10 | Booking title used the old uppercase eyebrow style | All | Uses the site’s “(—) Label” style |
| 11 | “Drag to turn” hint collided with fleet copy | Tablet | Hidden on touch-size screens |
| 12 | Reveal animations were slow enough that sections looked empty for a beat after a menu jump | All | Shorter durations, earlier triggers |

## Final pass — 10 pages × 3 sizes
Homepage, four aircraft pages and five legal pages, checked at 375, 768 and 1440 for overflow, broken files and anchors, image loading and alt text, duplicate IDs, one H1 per page, accessible names, italics, small text and touch targets.

| # | Issue | Pages | Fix |
|---|---|---|---|
| 13 | Cabin gallery parallax was barely noticeable | Home | Three layers: frames open from an inset crop, photos drift ±9% inside, and the two frames move at different speeds; halved on phones, off with reduced motion |
| 14 | Eight footer links went nowhere (About, Sustainability, Careers, Press, Q&A, Travel documents, Pets, Members' login) | All 10 | Replaced with real destinations: Our belief, Safety, Operator disclosure, Privacy, Call the concierge, Request a quote, Empty-leg alerts, Email us |
| 15 | “How we vet operators” footer link was a 23 px target | All, phone | 44 px |
| 16 | Floor-plan labels (11 px) and fleet tab labels (11.5 px) were below 12 px | Aircraft pages, home | 12 px and 12.5 px |
| 17 | Cabin photos on aircraft pages popped in hard over their placeholder | Aircraft pages | Fade in on load (never left hidden if a load fails) |
| 18 | Homepage gallery photos could show empty frames after a fast jump | Home | Fetched up front at low priority |

Re-run after fixes: zero findings on all pages; no console errors. Inline text links inside paragraphs stay text-sized, which WCAG 2.5.8 allows.

## Open items (need content, not code)
- Safety, Privacy, Cookies, Terms of carriage and Operator disclosure use fictional demo entities and numbers; replace with the real operator's details and legal review before launch.
- Placeholder phone, email and WhatsApp.
- Alerts sign-up and booking form are front-end only.
