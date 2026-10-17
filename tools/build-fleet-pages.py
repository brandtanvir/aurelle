# Writes fleet/*.html. Nav, menu, footer and booking overlay are lifted from index.html so they match exactly;
# per-class copy lives in PAGES below. Run after changing either:  python3 tools/build-fleet-pages.py .
import re, sys, os
ROOT = sys.argv[1]
src = open(os.path.join(ROOT, 'index.html')).read()

def between(a, b):
    i = src.index(a); j = src.index(b, i)
    return src[i:j]

head_icon = re.search(r'<link rel="icon"[^>]*/>', src).group(0)
navmenu = between('  <!-- Navigation -->', '  <main id="main">')
footer = between('  <footer class="footer"', '  <!-- Booking overlay -->')
booking = between('  <!-- Booking overlay -->', '  <script defer')

# Pages live one folder down: homepage anchors point back to index.html, relative pages get ../
def relink(s):
    s = re.sub(r'href="#(fleet|experience|membership|empty-legs|reach|belief)"', r'href="../index.html#\1"', s)
    s = re.sub(r'href="(?!#|\.\./|[a-z]+:)([^"]+)"', r'href="../\1"', s)
    return s

navmenu = relink(navmenu).replace('<a href="#top" class="nav__brand" aria-label="Aurelle, back to top">', '<a href="../index.html" class="nav__brand" aria-label="Aurelle, home">')
navmenu = navmenu.replace('<header class="nav is-dark" data-nav>', '<header class="nav is-dark" data-nav>')
footer = relink(footer).replace('<span class="num">(09)</span>', '<span class="num">(07)</span>')

PAGES = [
  dict(id='light', photos=[('meeting', 2000, 1333, 'Two passengers talking across a walnut table between cream leather club seats, oval windows behind them', 'Club four, set for a working flight.', '50% 50%'), ('reading', 2000, 1333, 'A passenger reading a magazine in a cream leather armchair beside a row of oval windows', 'A window beside every seat.', '45% 50%')], file='light.html', label='Light', n=1, model='Embraer Phenom 300E',
       line='The quickest way between two cities.',
       desc='The Light jet: seven seats, 3,650 km of range and access to short runways like Courchevel, St. Barths and Aspen. See the cabin, the specification and typical flight times.',
       spec=('Small enough for Courchevel. ', 'Fast enough for a day trip.'),
       spec_lede='Agile and fast for short hops, and it reaches runways the big jets can’t: Courchevel, St. Barths, Aspen.',
       cabin=('Six leather seats and a private lavatory. ', 'Every seat at a window.'),
       cabin_lede='The cabin is 1.5 m high, so you sit rather than stand, and large windows make it feel brighter than its size. Ideal for up to four guests with luggage, or six on shorter hops.',
       routes=('City to city, door to door. ', 'Most flights under three hours.'),
       cta='Fly the Light.'),
  dict(id='midsize', photos=[('quiet-cabin', 2000, 1333, 'A passenger in a cream knit sweater checking his phone in a quilted leather seat by an oval window', 'Quiet enough to take a call.', '50% 50%'), ('aisle', 1500, 2000, 'Looking down the aisle past a cream quilted divan and leather club seats to the galley', 'The divan converts to a bed.', '50% 60%')], file='midsize.html', label='Midsize', n=2, model='Bombardier Challenger 350',
       line='Coast to coast. A cabin you can stand in.',
       desc='The Midsize jet: nine seats, a stand-up cabin and 5,926 km of range, non-stop across North America or London to the Gulf. See the cabin, the specification and typical flight times.',
       spec=('A cabin you can stand in. ', 'Range for a whole continent.'),
       spec_lede='A stand-up cabin and a flat floor. Flies non-stop across North America or from London to the Gulf.',
       cabin=('Nine seats in two rooms. ', 'Four of them become beds.'),
       cabin_lede='At 1.83 m high and 2.19 m wide, the cabin has a flat floor and room to walk upright. The forward club works as an office; the rear room has a table and a divan for overnight flights.',
       routes=('Coast to coast, non-stop. ', 'London to the Gulf in under seven hours.'),
       cta='Fly the Midsize.'),
  dict(id='ulr', photos=[('lounge', 2000, 1500, 'A long cabin in warm evening light, with a cream leather divan on one side and club seats around a walnut table on the other', 'The lounge, with the divan made up for the evening.', '50% 55%'), ('window', 1500, 2000, 'A cabin window looking out over a layer of cloud in a clear blue sky', 'Forty-one thousand feet, any hour.', '50% 50%')], file='ultra-long-range.html', label='Ultra-long-range', n=3, model='Gulfstream G700',
       line='New York to Tokyo, uninterrupted.',
       desc='The Ultra-long-range jet: thirteen seats in four living areas, a bedroom and 13,890 km of range. See the cabin, the specification and typical flight times.',
       spec=('Four living areas and a bedroom. ', 'Half the world without a stop.'),
       spec_lede='Four living areas, a bedroom with a full bed and a shower option. Wherever you are going, one stop or none.',
       cabin=('Thirteen seats across four rooms. ', 'A real bed behind a closing door.'),
       cabin_lede='Seventeen metres of cabin at 1.91 m high, with a window at every seat. Guests move from club to dining to lounge, and the principal sleeps in a private bedroom at the rear.',
       routes=('Twelve hours or more, non-stop. ', 'Arrive rested, not just early.'),
       cta='Fly the Ultra-long-range.'),
  dict(id='flagship', photos=[('club-seating', 2000, 1500, 'Four cream leather club seats around a polished walnut table, with more seating beyond in a long, softly lit cabin', 'The club, before the dining room and suite.', '50% 55%'), ('aperitif', 2000, 1333, 'A passenger holding a glass in a cream leather armchair beside oval windows, papers on the table in front of her', 'An aperitif before dinner.', '60% 50%')], file='flagship.html', label='Flagship', n=4, model='Bombardier Global 7500',
       line='A residence that crosses oceans.',
       desc='The Flagship jet: fourteen seats, a principal suite with a shower, a dining room for six and 14,260 km of range. See the cabin, the specification and typical flight times.',
       spec=('The longest range we fly. ', 'The smoothest ride we offer.'),
       spec_lede='The longest range in business aviation. A dedicated suite, a dining room for six and the smoothest ride we offer.',
       cabin=('Four living spaces and a private suite. ', 'A dining room for six.'),
       cabin_lede='Sixteen and a half metres of cabin, divided into rooms rather than rows. A dedicated crew suite keeps service discreet, and the principal suite has a full-size bed and its own bathroom with a shower.',
       routes=('São Paulo to Dubai, non-stop. ', 'Two continents, usually without a stop.'),
       cta='Fly the Flagship.'),
]

def gallery(p):
    out = []
    for i, (f, w, h, alt, cap, pos) in enumerate(p['photos']):
        kind = 'photo--lead' if i == 0 else 'photo--side'
        shape = ' is-portrait' if h > w else ''
        out.append(f'''          <figure class="photo {kind}{shape}" data-reveal>
            <div class="photo__frame"><img src="../media/interiors/{f}.webp" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async" style="object-position: {pos}" /></div>
            <figcaption class="photo__cap">{cap}</figcaption>
          </figure>''')
    return '\n'.join(out)

def others(p):
    out = []
    for q in PAGES:
        if q is p: continue
        out.append(f'''          <a class="peer" href="{q['file']}" data-reveal>
            <span class="peer__n">0{q['n']}</span>
            <span class="peer__label">{q['label']}</span>
            <span class="peer__model">{q['model']} or similar</span>
            <span class="peer__line">{q['line']}</span>
            <span class="peer__go" aria-hidden="true"></span>
          </a>''')
    return '\n'.join(out)

TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>{label} jet · Aurelle Private Aviation</title>
  <meta name="description" content="{desc}" />
  <meta name="theme-color" content="#0B1A2B" />
  {icon}
  <link rel="preload" href="../fonts/DMSans-Variable.ttf" as="font" type="font/ttf" crossorigin />
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="stylesheet" href="../css/consent.css" />
  <script type="importmap">
    {{
      "imports": {{
        "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"
      }}
    }}
  </script>
</head>
<body class="page-aircraft" data-class="{id}">
  <!-- Generated from index.html (nav, menu, footer, booking) plus per-class copy. Keep the four pages in step. -->
  <a class="skip" href="#main">Skip to content</a>

{navmenu}  <main id="main">
    <!-- 01 · Hero: the aircraft on a navy stage -->
    <section class="ac-hero" id="top" aria-label="{label} jet" data-nav-dark>
      <div class="ac-hero__stage">
        <canvas class="ac-hero__canvas" data-ac-canvas aria-hidden="true"></canvas>
        <div class="fleet__shadow ac-hero__shadow" aria-hidden="true"></div>
        <p class="fleet__hint ac-hero__hint" aria-hidden="true">Drag to turn</p>
      </div>
      <div class="ac-hero__ui wrap grid">
        <p class="label label--light ac-hero__label"><span class="num">(01)</span>The fleet</p>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="../index.html#fleet">Fleet</a><span aria-hidden="true">/</span><span aria-current="page">{label}</span></nav>
        <p class="ac-hero__count"><span>0{n}</span> / 04</p>
        <div class="ac-hero__text">
          <h1 class="ac-hero__title"><span>{label}</span></h1>
          <p class="ac-hero__model" data-hero-fade>{model} or similar</p>
          <p class="ac-hero__line" data-hero-fade>{line}</p>
        </div>
        <div class="ac-hero__cta" data-hero-fade>
          <a href="#book" class="btn btn--light" data-book>Request this aircraft</a>
          <a href="#cabin" class="btn btn--outline-light">See the cabin</a>
        </div>
        <dl class="ac-hero__facts" data-facts data-hero-fade></dl>
      </div>
    </section>

    <!-- 02 · Specification -->
    <section class="ac-section wrap" id="specification" aria-label="Specification">
      <header class="sh grid">
        <p class="label" data-reveal><span class="num">(02)</span>Specification</p>
        <h2 class="sh__title" data-split>{spec0}<span class="tone">{spec1}</span></h2>
        <p class="sh__lede" data-reveal>{spec_lede}</p>
      </header>
      <div class="grid">
        <dl class="specs" data-specs data-reveal></dl>
        <p class="specs__note" data-reveal>Typical figures for this class. The exact aircraft, and its range with your passengers and bags, is confirmed by your concierge.</p>
      </div>
    </section>

    <!-- 03 · Cabin -->
    <section class="ac-section ac-section--tint" id="cabin" aria-label="The cabin">
      <div class="wrap">
        <header class="sh grid">
          <p class="label" data-reveal><span class="num">(03)</span>The cabin</p>
          <h2 class="sh__title" data-split>{cabin0}<span class="tone">{cabin1}</span></h2>
          <p class="sh__lede" data-reveal>{cabin_lede}</p>
        </header>
        <div class="photos grid">
{gallery}
          <p class="photos__note">Representative interiors for this class. Finishes vary by aircraft.</p>
        </div>
        <div class="cabin grid" data-cabin>
          <figure class="cabin__plan" data-reveal>
            <div class="plan" data-plan role="img" aria-label="Top-down floor plan of the {label} cabin, nose first, with numbered areas described in the list"></div>
            <figcaption class="cabin__cap" data-plan-cap>Top-down plan. Typical layout; yours is confirmed with the aircraft.</figcaption>
          </figure>
          <ol class="legend" data-legend aria-label="Cabin areas, front to rear"></ol>
        </div>
      </div>
    </section>

    <!-- 04 · Typical routes -->
    <section class="ac-section wrap" id="routes" aria-label="Typical routes">
      <header class="sh grid">
        <p class="label" data-reveal><span class="num">(04)</span>Typical routes</p>
        <h2 class="sh__title" data-split>{routes0}<span class="tone">{routes1}</span></h2>
      </header>
      <div class="board board--routes" role="table" aria-label="Typical routes for the {label} jet">
        <div class="board__row board__row--head" role="row">
          <span role="columnheader">Route</span><span role="columnheader">Flight time</span><span role="columnheader">Distance</span><span role="columnheader">Stops</span><span role="columnheader">Indicative</span><span role="columnheader"><span class="sr">Action</span></span>
        </div>
        <div role="rowgroup" data-routes></div>
      </div>
      <p class="specs__note routes__note">Great-circle distance at typical cruise speed, plus taxi and climb. Prices are one way for this class, before positioning and fees. Your concierge confirms exact times.</p>
    </section>

    <!-- 05 · Rest of the fleet -->
    <section class="ac-section ac-section--peers wrap" aria-label="Other aircraft">
      <header class="sh grid">
        <p class="label" data-reveal><span class="num">(05)</span>The rest of the fleet</p>
        <h2 class="sh__title" data-split>Need more range, or fewer seats? <span class="tone">Compare the other classes.</span></h2>
      </header>
      <div class="peers grid">
{others}
      </div>
    </section>

    <!-- 06 · Request -->
    <section class="cta cta--plain" id="contact" aria-label="Request this aircraft" data-nav-dark>
      <div class="cta__inner wrap grid">
        <p class="label label--light" data-reveal><span class="num">(06)</span>Request</p>
        <h2 class="cta__title" data-split>{cta}</h2>
        <p class="cta__sub" data-reveal>Tell us where and when. Your concierge confirms the aircraft and the price within ten minutes, and nothing is booked until you approve.</p>
        <div class="cta__actions" data-reveal>
          <a href="#book" class="btn btn--light btn--lg" data-book>Request this aircraft</a>
          <a href="tel:+442000000000" class="btn btn--outline-light btn--lg">+44 20 0000 0000</a>
        </div>
      </div>
    </section>
  </main>

{footer}{booking}  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script defer src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
  <script type="module" src="../js/aircraft.js"></script>
  <script type="module" src="../js/consent.js"></script>
</body>
</html>
'''

os.makedirs(os.path.join(ROOT, 'fleet'), exist_ok=True)
for p in PAGES:
    out = TEMPLATE.format(icon=head_icon, navmenu=navmenu, footer=footer, booking=booking, others=others(p), gallery=gallery(p),
        spec0=p['spec'][0], spec1=p['spec'][1], cabin0=p['cabin'][0], cabin1=p['cabin'][1],
        routes0=p['routes'][0], routes1=p['routes'][1], **{k: v for k, v in p.items() if k not in ('spec', 'cabin', 'routes', 'photos')})
    open(os.path.join(ROOT, 'fleet', p['file']), 'w').write(out)
    print('wrote', p['file'], len(out))
