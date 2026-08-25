# Hey._.Brand!

An interactive website preview for **Hey._.Brand!**, a branding agency working across Jakarta and Tangerang on strategy, identity, and social media management.

Live at **https://hey-brand.vercel.app** and **https://heybrand.onyxcreative.asia**

---

## What this is, and what it could become instead

Hey._.Brand! posted looking for someone who can build an interactive website. That post did not say **whose** site it is — most likely it is for one of their clients, and we do not know which client.

So this preview is built for **the agency itself**. That is the one subject we actually have information about, and it doubles as the demonstration: rather than describing what we could build, the site is the thing.

**This direction can be pivoted the moment you tell us who the client is.** The structural work carries over intact — the transition system, the design tokens, the section architecture, the form, the accessibility work, the audit scripts. What changes is content and palette, and content already lives in one file (`src/data/content.ts`) with configuration in another (`src/lib/site.ts`). Nothing about the client's identity is baked into components.

---

## Things this site deliberately does not say

Every one of the following was unknown at build time, so none of it appears anywhere — not in copy, not in metadata, not in structured data:

- founding year, team size, team member names
- number of clients, number of projects
- client names or logos
- testimonials, ratings, awards
- prices, packages, or rate cards
- campaign results, percentages, or any performance figure
- street address, opening hours, phone number

The only confirmed facts used are: the agency name, the three service lines they named themselves, and the service area (Jakarta and Tangerang).

The work page carries **sample case studies**, labelled as samples in three separate places on every entry (a badge on the card, a note under the page title, and a closing paragraph). They exist to show the *structure* a real case study would take — challenge, approach, result — written as description rather than as claims. No company is named and no figure appears. The agency mentioned one client publicly, but we do not have permission to use that name, so it is not here.

### Fill these in when you have them

Both live in `src/lib/site.ts`. Each is empty on purpose, and the UI simply omits whatever depends on it — nothing renders a placeholder and nothing breaks.

| Field | Effect once filled |
|---|---|
| `whatsappNumber` | Every WhatsApp button addresses that number directly. While it is empty they use `wa.me/?text=…`, WhatsApp's own supported "pre-filled message, choose your recipient" form, so the composed message is already complete and correct. |
| `email` | An email row appears in the footer and on the contact page. While empty, neither renders. |
| `social.threads` / `social.instagram` | Added to the footer and to the `sameAs` array in the Organization structured data. |

---

## The three interactive moments

The brief asked for *interactive*, done properly: a few moments taken all the way rather than a pile of effects. Three were chosen, one per job the visitor has to do — **arriving**, **browsing**, and **moving between pages** — instead of stacking everything onto the home screen.

### 1. The hero responds to the pointer, or to device tilt
`src/components/Hero.tsx`

The hero is a set of printing plates sitting slightly out of register — an accent disc, an ink square, and a fixed outline plate they are measured against. Moving the pointer pulls them further apart or eases them back together, and a field of hairlines behind them drifts the opposite way.

Why this one: it is a printing metaphor, legible to people who work in identity, rather than generic parallax. And the amplitude is deliberately tiny — 16px at peak — because a branding agency will read a swooping 3D tilt as a template.

**Fallbacks.** On touch devices no pointer listener is attached at all; where the device exposes orientation without a permission prompt, gentle tilt drives the same two variables, and where it does not, the plates rest in register — which is the composition's resolved state, not a broken one. Under `prefers-reduced-motion` nothing is attached whatsoever. With JavaScript off, the identical still composition is server-rendered. No content is inside the effect.

### 2. Work cards show the construction under the finish
`src/components/WorkCard.tsx`

Each card holds two renderings of **the same geometry**: the resolved composition, and the construction lines it was built from. Hovering or focusing cross-fades between them. Because the geometry is identical, it reads as lifting a layer off one object rather than swapping two pictures.

Why this one: it answers the question an agency actually asks a studio — *do you understand how this was made* — using the artwork itself rather than a claim.

**Three input paths, one result.** Mouse gets `:hover`, keyboard gets `:focus-within` by tabbing to the title, touch gets an explicit toggle button that reports `aria-pressed`. On `(hover: none)` devices the hover rule is switched off entirely, so a tap cannot latch the card into the process state.

**No content sits behind the interaction.** The process note is permanent, visible text under every card title on every device. The interaction changes the picture, not the information.

### 3. Page transitions that feel continuous
`src/components/TransitionProvider.tsx`, `src/lib/timing.ts`

Two loaders, as asked. A **boot loader** for first paint and for any navigation to Home, where the wordmark's plates drift into register. A shorter **curtain** for every other navigation: four plates sweeping in with a stagger, one of them the accent.

The sequence is strictly: **page closes → content changes → scroll resets to top → page opens.** The route change and the scroll reset both happen while the screen is fully covered, so the jump is never seen.

Why this one: it is the moment that makes a four-page site feel like one object instead of four documents, and it is the hardest of the three to get right.

**The part that matters most.** No step in the sequence is chained on `requestAnimationFrame` alone. rAF freezes the instant a tab is backgrounded, and a curtain half-closed at that moment would never reopen — on a site selling interactivity, that is the single most embarrassing failure available. `afterDelay()` races a `setTimeout` against an rAF deadline and resolves on whichever lands first: rAF when visible (frame-accurate), `setTimeout` when hidden (throttled, but it fires). On top of that there is a watchdog that force-opens the curtain after 4.2s, and a `visibilitychange` handler that settles an overdue phase the moment the tab returns. Three independent ways out of a stuck state.

Under `prefers-reduced-motion` there is no curtain at all: navigation is instant, the scroll reset still happens, and nothing is left mid-animation.

---

## Design system

No style guide page — the system is visible in the work. This is the reference.

### Colour

Authored in OKLCH, neutrals tinted warm toward the accent hue. One accent, used with real surface area rather than only on buttons.

| Token | OKLCH | Hex | Role |
|---|---|---|---|
| `--color-paper` | `0.985 0.004 75` | `#fcfaf7` | page background |
| `--color-paper-sunk` | `0.955 0.008 68` | `#f4efeb` | alternating section background, cards |
| `--color-ink` | `0.175 0.014 42` | `#160f0c` | body text, footer surface, curtain plates |
| `--color-ink-soft` | `0.365 0.012 45` | `#443d39` | secondary paragraphs |
| `--color-ink-faint` | `0.505 0.010 48` | `#6a6360` | eyebrows, meta labels |
| `--color-line` | `0.865 0.010 60` | `#d8d1cc` | hairlines, field grid, input borders |
| `--color-accent` | `0.556 0.196 30` | `#cd2f20` | fills, buttons, one curtain plate |
| `--color-accent-ink` | `0.496 0.176 30` | `#b02619` | accent as **text** on light surfaces |
| `--color-accent-lift` | `0.742 0.152 45` | `#f88954` | accent as text on ink surfaces |

The accent exists in three values because one value cannot be both a legible text colour on paper and a legible text colour on ink. `npm run contrast` asserts all fourteen pairs the UI actually uses; every text pair clears 4.5:1 and every non-text UI pair clears 3:1. Lowest text pair is `paper on accent` at **4.99:1**.

### Type

One family, self-hosted: **Neue Montreal**, converted from the supplied TTFs to WOFF2 (23KB + 24KB). Regular 400 for body, Medium 500 for headings and labels — both from the folder provided. Modular scale, ≥1.25 between steps, fluid via `clamp()`.

| Token | Range | Use |
|---|---|---|
| `--text-display` | 2.75 → 7rem | reserved |
| `--text-h1` | 2.25 → 4rem | page titles |
| `--text-h2` | 1.75 → 3rem | section headlines |
| `--text-h3` | 1.25 → 1.75rem | card and sub-section titles |
| `--text-lede` | 1.0625 → 1.25rem | opening paragraphs |
| `--text-body` | 1rem | body |
| `--text-meta` | 0.8125rem | eyebrows, labels, captions |

**Heading line budget** is enforced per viewport and measured, not eyeballed: **3 lines at 375, 2 everywhere above it**, nothing at 4 lines anywhere. It is controlled by font size and per-breakpoint `max-width` in `ch` (`.headline`, `.headline-long`) — never by hard line breaks, so each width finds its own break points.

`npm run overflow` measures every heading on every route at **375 / 768 / 1024 / 1280 / 1440** and fails if any budget is exceeded. The two laptop widths are in there deliberately: the brief named three checkpoints, but a two-column desktop hero is tightest at 1024–1280, and the home `h1` did overrun to three lines there until the copy column was widened and the `h1` cap brought down to 3.75rem. It would have passed a three-width audit while being wrong on the most common laptop screens.

One outcome worth naming rather than hiding: the home `h1` is **two lines on desktop**, not one. The hero is a two-column composition and the right column belongs to the interactive plates; forcing one line would mean dropping the headline to about 40px and losing its presence. Every other desktop heading resolves to one line.

### Spacing

4px base. Named steps so section rhythm is a decision, not an accident.

| Token | Value | Use |
|---|---|---|
| `--spacing-gutter` | `clamp(1.25rem, 5vw, 3.5rem)` | page inline padding (`.shell`) |
| `--spacing-block` | `clamp(4rem, 9vw, 9rem)` | section vertical rhythm (`py-block`) |
| `--spacing-block-tight` | `clamp(2.5rem, 5vw, 4.5rem)` | sub-section rhythm |

Plus Tailwind's numeric scale for local spacing.

### Layer scale

One scale, defined once, used everywhere. **There is not a single raw `z-index` in the codebase** — verified by grep.

```
content (0) < raised (10) < header (100) < menu (200) < modal (300) < cookie (400) < skip link (500)
```

The cookie banner sits above the menu on the scale but **suppresses itself** whenever a blocking overlay is open, so it can never appear on top of the mobile menu. Its fixed wrapper is `pointer-events: none` with only the panel itself interactive, so it cannot swallow a tap meant for anything else near the bottom edge. It also measures its own height and publishes it as `--cookie-h`, which the hero reserves — that is why the primary call to action is never underneath it, at any viewport height.

### Reused components

| Component | Used by |
|---|---|
| `SectionHeader` | **every** section on the site. Fixed four-part structure: label → headline → description → CTA. Nothing hand-rolls its own heading block. |
| `PageHeader` | every page except Home; `SectionHeader` at `h1` size with the page's top rhythm |
| `WhatsAppLink` | **every** WhatsApp button, including the contact form's result. The only place a `wa.me` URL is assembled. Automatically attaches the absolute URL of the page it sits on and its own button label. |
| `TransitionLink` | every internal link. Routes through the curtain, and falls through to native behaviour for modifier-click, middle-click, `target`, and external hrefs. |
| `Reveal` | every scroll-in block |
| `Listbox` | the contact form's service field |
| `Wordmark` | header, footer, boot loader, OG image |
| `WorkCard` | home work snippet and the work index |
| `Hero` | home only |

`SectionHeader` is why the vertical rhythm is identical from page to page, and `WhatsAppLink` is why the message format cannot drift between the hero button, the footer button and the form.

### Structure

Four pages, as briefed: **Home, Karya, Layanan, Kontak**, plus a case study detail route and two legal pages. Ordering is work first, then services, then how the work runs — no manifesto anywhere, and Home carries only hero, work snippet, service summary, and the closing CTA.

Every page ends with a CTA in the footer, and that CTA **swaps target automatically** when the visitor is already on the page it would otherwise point at: it walks an ordered list of destinations and takes the first that is not the current route.

---

## Performance

Interactive sites get heavy easily. What was done to keep this one light:

- **Transform and opacity only.** No effect animates a property that triggers layout or paint. Verified by reading the CSS: the animated properties across the whole site are `transform`, `opacity`, and colour on hover.
- **React is not in the interaction loop.** The hero effect writes CSS custom properties onto one DOM node from a single rAF loop. No `setState` runs during pointer movement, so nothing re-renders while the plates move.
- **One listener, one loop.** A single `pointermove` handler records coordinates; the rAF loop is the only thing that touches the DOM.
- **The loop stops.** When the eased value converges, the loop cancels itself instead of spinning forever. Verified: **zero style writes in 900ms** once settled.
- **Off-screen means off.** An `IntersectionObserver` tears down the listener *and* the loop completely when the hero leaves the viewport, and rebuilds them when it returns. The plates are reset to register on teardown so an off-screen hero is never parked mid-effect.
- **`will-change` only where something actually moves** — the plates, the hairline field, the curtain plates, the menu panel. Not sprinkled.
- **Lenis is desktop-only.** Not mounted below 1024px, not on coarse pointers, not under reduced motion, and stopped (not merely ignored) whenever an overlay is open. Phones and tablets keep native scrolling, which is what their compositors are tuned for.
- **Everything static.** All 17 routes prerender at build time. No client data fetching.
- **Artwork is SVG**, generated at build time — ten files, all under 4KB. `images.unoptimized` is on, so nothing routes through the image optimizer.
- **Fonts self-hosted**, two WOFF2 files, 47KB total, `font-display: swap`.
- **No animation library on the critical path.** The curtain, the reveals, and the card cross-fade are CSS transitions driven by data attributes, so the state machine and the DOM cannot disagree.

---

## Accessibility

- Every colour pair asserted at ≥4.5:1 (non-text UI at ≥3:1). `npm run contrast` fails on regression.
- `prefers-reduced-motion` respected in **every** effect, with no exceptions: the hero attaches nothing, the curtain does not run, reveals render visible rather than stuck at `opacity: 0`, and a global backstop collapses any remaining transition.
- Every interactive moment has a keyboard path, and no content is reachable only by hover.
- The service dropdown is a real ARIA select-only combobox, not a styled `<select>`: arrow keys, `Home`/`End`, `PageUp`/`PageDown`, type-ahead (with repeated-letter cycling), `Enter`/`Space`, `Escape`, and `Tab`-commits. Focus never leaves the trigger; the active option is announced via `aria-activedescendant`.
- Mobile menu traps focus, closes on `Escape`, returns focus to the hamburger, and is `inert` plus `aria-hidden` when closed.
- Skip link, one consistent `:focus-visible` treatment, landmarks, and an error summary that takes focus on a failed submit.
- Split-text animation is not used; had it been, the parent would carry a single `aria-label` with the letters `aria-hidden`.

---

## Forms

The contact form collects **nama, nama brand, nomor WhatsApp, layanan yang diminati, catatan**, then composes a single WhatsApp message containing every field plus the URL of the page it was submitted from.

Validation runs **twice**. Inline on blur for feedback, and again in the server action, which is the one that decides — same rules, same file (`src/lib/validation.ts`), so a request that never touched the browser UI is checked identically. Verified by tampering: writing a service id the listbox cannot produce, and a malformed phone the client never validated, are both rejected server-side.

The honeypot is hidden with `clip-path`, not `position: absolute; left: -9999px` — an absolute offset without a positioned ancestor escapes the layout and is a classic source of horizontal overflow.

## Cookie consent

The banner controls something real. Granting consent lets the contact form keep a draft in `localStorage` so a half-written brief survives a refresh. Denying writes nothing beyond the decision itself and **actively deletes** any draft stored under a previous grant. `useConsentStorage` is the only path to `localStorage` in the app, which is what makes the banner enforceable rather than decorative.

---

## Running it

```bash
npm install
npm run dev
```

| Script | What it does |
|---|---|
| `npm run art` | regenerates every SVG composition and the site icon (deterministic — same bytes every time) |
| `npm run contrast` | audits all colour token pairs against WCAG, exits non-zero on failure |
| `npm run overflow -- <url>` | drives Chrome over every route at 375 / 768 / 1024 / 1280 / 1440: horizontal overflow, heading line budgets, broken images, failed requests, console errors |
| `npm run verify -- <url>` | 50 assertions across all three interactive moments, their fallbacks, the transition (including the backgrounded-tab case), the listbox keyboard contract, server-side validation, the WhatsApp message, consent storage, and the mobile menu |
| `npm run motion -- <url> <dir>` | captures frames *during* the animations, each labelled with the state-machine phase it was taken in, so motion can be checked as pixels rather than inferred |
| `npm run shots -- <url> <dir>` | renders settled screenshots at every breakpoint |

`npm run build` runs `npm run art` first, so the artwork can never drift from its source.

## Editing content

- **`src/data/content.ts`** — the three service lines, the sample case studies, and the four process steps. Commented in place. Remove an entry's `isSample: true` and its sample labels disappear for that entry alone.
- **`src/lib/site.ts`** — name, canonical URL, WhatsApp number, email, service area, navigation, and the route table the sitemap is built from.

Changing `site.url` updates metadata, canonical tags, `sitemap.xml`, `robots.txt`, and the OG image URL together.

## Artwork

Every graphic is generated by `scripts/generate-art.mjs` from a seeded PRNG keyed off the composition id, so regenerating produces byte-identical files. Five compositions — `orbit`, `strata`, `cadence`, `aperture`, `lattice` — each structurally distinct so the cards never read as twins, and each rendered twice: once resolved, once as construction lines.

Nothing is stock, nothing comes from a placeholder service, and nothing imitates a real piece of design work, a real office, or a person's face.

**No grain, no noise, no film texture, anywhere on this site.** Depth comes from overlap, hairlines, negative space, and contrast. The OG image is the wordmark set in Neue Montreal on the same plate geometry; the site icon is the `._.` cluster from the name itself, on a genuinely transparent background.

## Deployment

| | |
|---|---|
| Repository | `adityasomaa/hey-brand` |
| Vercel project | `hey-brand`, team **Onyx Creative Asia** |
| Canonical URL | `https://hey-brand.vercel.app` |
| Custom domain | `heybrand.onyxcreative.asia` (CNAME to `a15b4b3c17b26361.vercel-dns-017.com`, DNS managed in Hostinger hPanel) |

Two deployment notes worth keeping:

- **Vercel Authentication is off.** New projects in a team scope get "Require Log In" enabled by default, which makes the production URL prompt for a Vercel login. It is disabled for this project, so every URL is publicly reachable.
- **The short `hey-brand.vercel.app` alias is claimed.** A team-scoped project otherwise answers only on `hey-brand-onyx-creative-asia.vercel.app`. The short name was assigned to this project at creation; the canonical tag, sitemap, robots and OG URLs all derive from `site.url`, so they point at it consistently.
- **`hey-brand.vercel.app` is the canonical, not the custom domain.** Both URLs serve the identical site, and the custom domain emits a canonical tag pointing at the vercel.app one, so search engines see a single address rather than duplicate content. The vercel.app name was chosen as canonical deliberately: `onyxcreative.asia` is a different agency's domain, and a Hey._.Brand! preview reading as canonically hosted there would be the wrong signal. To flip it, change `site.url` in `src/lib/site.ts` to `https://heybrand.onyxcreative.asia` — metadata, canonical tags, sitemap, robots and the OG image URL all follow from that one line.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Lenis · self-hosted Neue Montreal. All routes static.

`images.unoptimized` is set in `next.config.ts` on purpose: the Vercel Image Optimization quota on this account is exhausted, and with the optimizer on every image returns 402 and production renders blank.
