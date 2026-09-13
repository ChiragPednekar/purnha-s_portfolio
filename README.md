# Pūrnah — Culinary Wellness

Landing page for **Pūrnah** (Purna Chitalia) — a plant-based kitchen, pantry and table in
Pali Hill, Mumbai.

Static HTML/CSS/JS. No React, no build step, no package manager.

```
index.html        — the site (all CSS in <style>, all JS in <script> IIFEs)
case-study.html   — reusable story template, driven by ?p=<slug>
apps-script.gs    — paste into the Google Sheet to receive enquiries (see below)
assets/fonts/     — drop your licensed PP fonts here (see below)
assets/images/    — 19 .webp
assets/video/     — 5 .mp4
.backup/          — the original Pragadheesh Raj demo build, before the rebrand
```

## Live

| | |
| --- | --- |
| Production | https://purnah-portfolio.vercel.app |
| Repo | https://github.com/ChiragPednekar/purnha-s_portfolio |
| Vercel project | `purnah-portfolio` (Hobby) — linked to `main` |

Every push to `main` redeploys automatically. `vercel.json` sets baseline security
headers and nothing else — the site is static, so there is no build step.

## Run it locally


Must be served over HTTP — the OGL WebGL layer is an ES module, so `file://` will not work.

```bash
python3 -m http.server 4321
```

Then open <http://localhost:4321>.

## Content source

All copy, names, links and the dish list come from the public Instagram accounts
**@be.purnah** and **@purnahkitchen** (extracted 12 Sep 2026):

| | |
| --- | --- |
| Founder | Purna Chitalia |
| Tagline | "Rebuild your relationship with food without turning health into a full-time job" |
| Address | Shop No. 4, Bajaj Arcade, Pali Hill Rd, Union Park, Khar West, Mumbai 400052 |
| Ordering | Swiggy `menu/1294611` · Zomato `onelink.me/xqzv/pltjc3sj` |
| Recognition | The Restore Awards® — Nominee, Green Nutrition Champion |
| Socials | Instagram ×2, Threads |

The **"On the Plate"** index is a real Pūrnah thali, with each dish's stated nutritional
reasoning: suran (slow starch), arbi & patra (root and leaf fibre), unpolished Ambe Mohr rice
(whole grain), tindora (gentler glucose curve), lacto-fermented mango, baked kantola
(monsoon bitters), prickly pear injipuli, pineapple chilli (bromelain).

A second pass added detail read off screenshots of the grid (13 Sep 2026):

| | |
| --- | --- |
| Purna's own title | **culinary medicine practitioner** (her words, to camera) |
| Campaign line | "This is real medicine" / "Let food be thy medicine" |
| Third handle | @purnahfoodie |
| Sunday stall | Farmers' Market, YMCA Bandra — Matla Undhiyu in winter, limited pre-booked portions |
| Supper club | Pūrnah:Tables at **Next Door, Bandra** — 7-course and 10-course Korean Family Feasts, both sold out |
| Café | "At our space in Bandra, we're reimagining how people experience food" |
| Corrected | the pickle is lacto-fermented **baby** mango |
| Testimonials | five real, attributed comments — now the "In Their Words" section |

Her published topics, now woven into the `guidance` story: the psychology of eating, soil
depletion and nutrient absorption, whey versus sattu, refined oils and hormonal health,
vegan versus plant-based, traditional wisdom versus modern trends.

Named dishes picked up along the way: Matla Undhiyu, baked millet sev puri on a bhakri base,
Amritsari chole with jowar-and-sattu sourdough kulcha, Bhappa Mishti Doi crème brûlée,
cashew chaas, pineapple-turmeric juice, tadgola coconut drinks.

### Still needed from you

- **Photography — the one real blocker.** Screenshots pasted into a chat can't be turned into
  image files, and each tile in a grid screenshot is a ~250px thumbnail with Instagram's
  play/pin icons burned into it, so it would look poor at hero size anyway. What works: save
  the original photos into `assets/images/` using the filenames in the table below. Each
  placeholder is now labelled with the *specific shot from your grid* that belongs in that slot,
  so it should be obvious which is which. Send full-resolution originals, not screenshots.
- **Phone numbers — please confirm before these go in.** Two are legible in the screenshots but
  both were read off low-resolution images, so neither is on the site yet: `+91 7400174901`
  (on a Pūrnah bottle label, next to @purnah-kitchen) and `+91 86270 02075` (a Pūrnah:Tables
  booking line). Confirm the digits and which is public, and I'll add them.
- **An email address**, if you want one. There is no public email on either account, so I did
  not invent one — the footer CTA is the Instagram handle instead.
- **Opening hours**, if you want them in the footer. Not stated publicly.
- **Upcoming events.** The Korean Family Feast dates and prices visible in the grid
  (14 Sept 2024; 25–27 Oct; INR 2700 / 1330++ / 700+) are all **past**, so they are written up as
  past editions rather than as live booking. Send current dates and I'll add a real events block.

## Enquiry form → Google Sheet

The site ends with an **Enquire** section. Submissions append a row to
[the `purnha` sheet](https://docs.google.com/spreadsheets/d/1O1vsjvjFvq5suX0ay-Ic1Ug6OqPF-lPjeqWZ8iG5jKw/edit).

**Status: live.** The Apps Script is deployed and the form writes real rows — verified
end-to-end on 13 Sep 2026.

| | |
| --- | --- |
| Script project | **Purnah enquiry form** (bound to the sheet — Extensions → Apps Script) |
| Deployment | Web app, Version 2, Execute as *Me*, Access *Anyone* |
| Endpoint | `.../macros/s/AKfycbwo7yhc…scog-GA/exec` — already in `index.html` |
| Scope granted | Google Sheets only. **"Send email as you" was deliberately declined** |

Health check: open the `/exec` URL in a browser — it returns
`{"ok":true,"message":"Purnah enquiry endpoint is live",...,"rows":N}`.

### Changing the script later

Edit in the Apps Script editor, then **Deploy → Manage deployments → pencil → Version:
New version → Deploy**. Skipping that leaves the live URL running the old code. The
deployment ID (and therefore the URL in `index.html`) stays the same, so the site needs
no change.

### Turning on email alerts

`NOTIFY_TO` at the bottom of the script is empty, so no mail is sent — that is why the
"Send email as you" scope was declined at the consent screen. If you set an address there,
Google will prompt you to re-authorise and grant that scope before alerts work.

### Columns written

`Timestamp · Name · Email · Phone · Enquiry Type · Message · Submission ID · Source Page · User Agent`

The header row is created and frozen automatically on the first submission — the sheet is
empty right now and needs no preparation.

### What the form does

- Validates in the browser: name, a well-formed email, a category, and a message.
  Errors clear as the visitor types.
- Carries a hidden `company` honeypot field. Bots fill it; the script silently discards those.
- Sends a `submissionId` with every enquiry, and the script ignores an id it has already seen —
  so a double-click or a retry cannot create two rows.
- Optional email alerts: put your address in `NOTIFY_TO` at the bottom of `apps-script.gs`.

### One honest limitation

Apps Script web apps can't return CORS headers a browser will accept cross-origin, so the form
posts in `no-cors` mode. That delivers the data reliably, but the **response is opaque** — the
page cannot tell a success from a server error, and shows "Thank you" once the request has been
sent. Verified in testing: a submission against a URL returning HTTP 501 still resolved and
showed the success panel. So treat the sheet, not the page, as the record of truth. If you'd
rather have true confirmation, that needs a real endpoint (a Cloudflare Worker or similar) in
place of Apps Script — say the word and I'll swap it.

## Fonts — action required

The two Pangram Pangram retail faces are **not** included. The `@font-face` rules are wired up
and waiting; until you drop the files in, both fall back (`Times New Roman` / `Host Grotesk`)
and the console shows 404s for them. That is the only expected error in a clean load.

Drop these into `assets/fonts/` (`.woff2` preferred, `.otf` is the declared fallback):

```
PPNeueMontreal-Book.woff2             → weight 400
PPNeueMontreal-Medium.woff2           → weight 500
PPNeueMontreal-Bold.woff2             → weights 700 and 800
PPEditorialNew-UltralightItalic.woff2 → weight 200 italic
PPEditorialNew-Italic.woff2           → weight 400 italic
```

## Assets — placeholders in place

Every file holds a labelled placeholder so the site runs end to end. Replace them in place;
no markup changes needed. Filenames are the contract.

**Images — 19 `.webp`** (`assets/images/`)

| File | Slot | Crop |
| --- | --- | --- |
| `hero-portrait.webp` | hero tile, Purna | portrait ~2:3 |
| `hero-ml` `hero-mc` `hero-mr` | hero small tiles — dish detail, ferment jar, herbs | portrait |
| `hero-br.webp` | hero tile — the kitchen | portrait |
| `feat-01..04.webp` | Tables · Kitchen · Pantry · Workshops | **3:2 landscape** |
| `work-01..08.webp` | the eight thali dishes, in menu order | ~16:10 landscape |
| `undhiyu.webp` | Matla Undhiyu (unused slot, ready if you want it) | landscape |
| `about-portrait.webp` | About Purna | 4:5 portrait |

**Video — 5 `.mp4`** (`assets/video/`) — all muted, looped, `playsinline`:
`hero-01..04.mp4` (hero tiles tl / tr / bl / bc) and `studio-loop.mp4` (About).

The preloader counts all 23 in use and nothing loads before it finishes — every asset sits behind
`data-src`.

## Adding a story

Everything lives in the `window.CASES` object near the bottom of `case-study.html`. Current
slugs: `tables`, `kitchen`, `pantry`, `workshops`, `guidance`, `founder`. Add an entry and link
to `./case-study.html?p=<slug>`. Each needs exactly 3 images and 3 metrics, and `next` must name
another existing slug (the chain currently loops). An unknown `?p=` falls back to the first.

## Notes on three judgement calls

**1 · iOS motion permission gate.** The spec gates the panel on
`typeof DeviceOrientationEvent.requestPermission === 'function'` alone. Some desktop Chromium
builds also expose that function, so on a laptop the panel appeared over the site. The check
now also requires a real touch device (`maxTouchPoints > 0`), keeping it iOS-only as intended.

**2 · Featured grid flex transition.** The spec asks for both a CSS `transition: flex` *and* a
GSAP tween on flex. Left as is, the CSS transition re-eases every per-frame value GSAP writes
and the expansion drags. GSAP now adds `.is-animating` (`transition: none`) for the duration of
its tween, so the CSS rule remains the non-JS fallback while GSAP owns the motion.

**3 · Word breaking in split headings.** Splitting text into per-character `inline-block` spans
lets a line break *inside* a word — "In S / mall Batches". Each word now gets a `nowrap`
wrapper (`.sh-word`) in the hero, case-study title and section headings. The arc stagger still
runs across the flat letter array, so the animation is unchanged.

## Spec coverage

Sections 0–7 of the original brief are implemented to the stated numbers. The brief was cut off
mid-sentence in section 7 (mobile card parallax, at `prog`), so the following were designed to
match the established system rather than to a given spec: the mobile parallax formula, the
On the Plate index, About, Punchline and Footer sections, the OGL hover preview, and the
case-study template. `#shared-preview-img` (z-index 51) is wired as the non-WebGL fallback for
the index hover preview.
