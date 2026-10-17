# Aurelle case study — layout spec (v2)

54 slides, 1920 × 1080, editorial grid, device mockups and a brand toolkit.

## What's in this folder
| File | Use |
|---|---|
| `Aurelle-Case-Study.pdf` | The presentation (54 pages, text stays selectable) |
| `slides/01.png … 54.png` | One image per slide, for Behance modules or tracing in Figma |
| `deck.html` + `deck.css` | Source. Opens in any browser; all paths are inside this folder |
| `deck-standalone.html` | The same deck as **one file** (CSS, font and images inlined, 13 MB) for Figma Make or html.to.design |
| `marketing/marketing.html` | Source of every social and print asset |
| `marketing/*.jpg, *.png` | Exported assets at real size (list below) |
| `tools/build-standalone.py` | Rebuilds `deck-standalone.html` after you edit the deck |

## Getting it into Figma
1. **Editable layers (best):** install the *html.to.design* plugin and its Chrome extension, open `deck-standalone.html` in Chrome, and import the page. Every slide comes in as a frame with real text, auto-layout and images.
2. **Figma Make:** start a new Make file, attach `deck-standalone.html` and prompt: “Recreate this 54-slide 1920×1080 presentation exactly, one component per slide, keeping fonts, colours and positions.” If the attachment is too large, attach `deck.html` + `deck.css` and the `slides/` PNGs as references instead.
3. **Manual rebuild:** use sections 1–5 below with the `slides/` PNG placed under each frame at 30% opacity.

## 1. Frame and grid
- Frame 1920 × 1080. Layout grid: 12 columns, margin **96**, gutter **24**, column **122**. Baseline 8 px.
- Content box: top **140**, bottom **96**. Running header at y 44, hairline at y 76.
- Column x-positions: 96, 242, 388, 534, 680, 826, 972, 1118, 1264, 1410, 1556, 1702.
- Labels always start at column 1; headlines at column 4 (x 534).

## 2. Colour
| Name | Value | Use |
|---|---|---|
| Paper | `#FAFBFC` | default slide |
| Mist | `#EEF3F8` | alternate slide, image placeholders |
| Ink | `#0E1B2A` | text, buttons |
| Ink 2 | `#3A4757` | body copy |
| Muted | `#5E6A77` | captions, running header |
| Grey | `#808B97` | second sentence of every headline |
| Navy | `#0B1A2B` | dark slides |
| Deep (gradient) | radial at 70% 20%: `#1B3657` → `#0B1A2B` 62% | dark hero slides |
| Sky (gradient) | 180°: `#8EC5F0` → `#CFE5F7` 58% → `#F4F8FC` | device showcases, identity divider |
| On dark | White 100 / 74 / 54 / 16% | heading / body / tone / hairline |

Text is two-tone only (ink + grey, or white + white 54%). No blue text, no italics.

## 3. Type — DM Sans (natural tracking)
| Style | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| Mega | 260–300 | 400 | 86% | −3.5% |
| Display 1 | 168 | 400 | 92% | −3% |
| Display 2 | 112 | 400 | 98% | −2.5% |
| H1 | 80–96 | 400 | 102% | −2% |
| H2 | 56 | 400 | 108% | −1.5% |
| H3 | 36 | 400 | 118% | −1% |
| Lead | 30 | 400 | 140% | −0.5% |
| Body | 22 | 400 | 155% | 0 |
| Small | 17 | 400 | 150% | 0 |
| Label | 16 | 500 (number 400, Grey) | auto | 0 |
| Caption | 15 | 400 | auto | 0 |
| Divider numeral | 760 | 300 | 80% | −4%, white 8% |

v1 used −4.5% to −6% on large type, which looked cramped. Don't go tighter than these values.

## 4. Components
1. **Running header**: wordmark (cols 1–3), section (cols 4–9), folio “07 / 54” (cols 10–12, right). Hairline below. Light and dark variants.
2. **Label**: “(2.1)  Competitor audit”, with the number in Grey.
3. **Chapter divider**: full-bleed photo or gradient, label + Display 1 title bottom-left (x 96, bottom 120), giant numeral bottom-right, clipped.
4. **Laptop**: lid `#0C0E11`, radius 2.4% of width, bezel 1.9%, screen 16:10. Base 2.2% high, aluminium gradient `#D9DDE2 → #9AA1A9`, 7.2% wider than the lid on each side, with a centre notch.
5. **Phone**: 433 × 892, radius 76, 20 px bezel `#16181C` with a 3 px `#3B3F45` edge. Screen 393 × 852, radius 56. Dynamic Island 124 × 36 at top 12.
6. **Browser**: radius 14, 44 px top bar `#F3F5F8` with three 12 px dots and a centred address pill.
7. **Isometric field**: grid of screenshots rotated X 54°, Z −38°, 40 gap, shadow −30/40/60.
8. **Callout**: 28 px numbered dot with a 6 px halo and a 16 px label. Four per slide at most.
9. **Instagram profile / story UI**: built at 393 pt inside the phone (see `.ig` and `.story` in deck.css).
10. **Table, numbered list, chip, sitemap node**: as in deck.css.

Shadow for floating objects: `0 60 120 −50 rgba(6,18,32,.55)` + `0 18 40 −24 rgba(6,18,32,.35)`.

## 5. Slide list
| # | Slide | Background |
|---|---|---|
| 01 | Cover: “Aurelle”, laptop + phone | horizon photo |
| 02 | Project statement + facts | Paper |
| 03 | Contents | Deep |
| 04 | At a glance: laptop + 2 tilted phones | Sky |
| 05 | Chapter 01 The brief | window at dusk |
| 06 | The brief: quote + references | Paper |
| 07 | Three tensions | Mist |
| 08 | Feasibility numbers | Deep |
| 09 | Chapter 02 Research | dark window |
| 10 | Competitor positioning map | Paper |
| 11 | The gap equation | Deep |
| 12 | Personas with photos | Paper |
| 13 | Insights → decisions | Mist |
| 14 | Chapter 03 Strategy | lounge photo |
| 15 | Added / left out | Paper |
| 16 | Principles | Deep |
| 17 | Sitemap | Paper |
| 18 | Key journeys | Mist |
| 19 | Chapter 04 Identity & system | Sky + giant wordmark |
| 20 | Wordmark + clear space | Paper |
| 21 | Colour | Paper |
| 22 | Typography “Aa” | Deep |
| 23 | Grid overlay in a browser | Paper |
| 24 | Components anatomy | Mist |
| 25 | Iterations: serif → DM Sans | Paper |
| 26 | Six reversals | Mist |
| 27 | Chapter 06 The product, isometric screens | Deep |
| 28 | Hero annotated | full-bleed capture |
| 29 | Window transition, two laptops | Sky |
| 30 | Fleet viewer laptop | Deep |
| 31 | Cabin parallax, browser | Paper |
| 32 | Experience filmstrip | Navy |
| 33 | Membership laptop + Jet Card | Mist |
| 34 | Globe annotated | full-bleed capture |
| 35 | Empty legs laptop + phone | Sky |
| 36 | Booking in 60 s, cascading browsers | Paper |
| 37 | Aircraft page, long browser + phone | Mist |
| 38 | Footer laptop | Deep |
| 39 | Five phones | Sky |
| 40 | Motion: easing + timing | Paper |
| 41 | Hero choreography | Mist |
| 42 | Chapter 08 Brand in the world | stratosphere photo + posts |
| 43 | Voice: we say / we never say | Paper |
| 44 | Instagram profile + avatars | Sky |
| 45 | Nine-post feed | Paper |
| 46 | Three hero posts | Deep |
| 47 | Stories in three phones | Mist |
| 48 | LinkedIn / X / YouTube covers | Paper |
| 49 | Jet Cards: pearl, navy, graphite | Deep |
| 50 | Flight confirmation + email | Mist |
| 51 | Billboard + airport lightbox | Navy |
| 52 | QA and performance | Paper |
| 53 | Launch targets | Deep |
| 54 | Close: “Time, returned.” + credits | jet photo |

## 6. Marketing assets (`marketing/`)
| Asset | Size |
|---|---|
| `avatar-navy.png`, `avatar-sky.png` | 1080 × 1080, circle-safe |
| `ig-01 … ig-09.jpg` | 1080 × 1350 feed posts |
| `story-01 … story-03.jpg` | 1080 × 1920 |
| `cover-linkedin.jpg` | 1584 × 396 |
| `cover-x.jpg` | 1500 × 500 |
| `cover-youtube.jpg` | 2560 × 1440 (text in the 1546 × 423 safe area) |
| `card-pearl / navy / graphite.png` | 1012 × 638 (85.6 × 54 mm), transparent corners |
| `pass.png` | 1600 × 620 flight confirmation |
| `poster-lightbox.jpg` | 1200 × 1800 |
| `billboard.jpg` | 3000 × 1000 |
| `email.jpg` | 600 × 1300 |

The scan code on the pass is decorative. Prices, members and routes are fictional, because this is a concept brand.

## 7. Behance
- Upload `slides/*.png` as image modules in order, or group them: cover → brief/research → system → product → brand → outcome.
- Behance project cover (808 × 632): crop slide 01 or 44.
- Mark this project as a concept, and credit Pexels, NASA and the CC BY 3D authors (see slide 54).
