# v2 Design Migration — Notes

Implementation notes for the v2 marketing-site port. Reference files live under `_design/{index,pricing,about,support}.html` (gitignored-for-publication but kept for provenance).

## Where each section lives

| Page | File | Notable sections |
|---|---|---|
| Home | `/index.md` | `.hero` (3-phone gallery) → `.band-flow` (receipts → SVG arrow → Schedule E doc) → `#features` → `.band-privacy` → `#faq` → `.band-pricing` |
| Pricing | `/pricing.md` | 3 plan cards (Lifetime featured) → `.value-grid` (every-plan feature grid) → Pricing FAQ (+ restore-purchase FAQ, preserved from v1) → end-CTA |
| About | `/about.md` | Hero → `.about-grid` (3 outcome-led stories + `.principles` aside) → end-CTA. **Timeline section dropped** in favor of a tighter conversion-focused page. |
| Support | `/support.md` | Hero → `.supp-grid` (sticky sidebar + 4 FAQ sections + bug-report form + contact cards) |
| Prose | `/privacy.md`, `/terms.md`, `/changelog.md` | Long-form markdown under `layout: prose` |
| 404 | `/404.html` | Uses `layout: default`, styled with `--rl-*` tokens |

## Layout + include structure

```
_layouts/
  default.html     — full-bleed marketing (4 design pages + 404)
  prose.html       — narrow reading column (privacy/terms/changelog)
_includes/
  head.html        — shared <head>: meta, OG, Twitter, per-page JSON-LD via `page.schema_json`, optional `page.preload_image`
  nav.html         — nav + mobile hamburger (inert-toggled), inline SVG logo, skip-link
  footer.html      — 4-col grid + "Made for iOS" tag
  fonts.html       — Google Fonts preconnect + stylesheet link
```

## Asset layout

```
assets/
  css/site.css           — 57 KB uncompressed, ~12 KB gzipped; union of every <style> block from all 4 reference pages, deduped, preceded by accessibility primitives (visually-hidden, touch-action, img default, skip-link, mobile-nav)
  js/reveals.js          — shared IntersectionObserver: handles [data-reveal-group] staggering + home flow-scene selectors; respects prefers-reduced-motion
  img/screens/           — 6 WebPs extracted from _design/index.html base64 (470 KB total, vs ~3 MB base64)
favicon.svg              — kept at root (convention + external-crawler cache safety)
og-image.webp            — kept at root (social-share cache safety)
```

## Token reference

CSS variables canonicalize on the `--rl-*` prefix, matching the iOS app's `DesignSystem.swift`. Full definitions live at the top of `assets/css/site.css` (`:root` block after the accessibility primitives).

| Token | Value | Use |
|---|---|---|
| `--rl-bg` | `#0F0F14` | Obsidian page background |
| `--rl-surface` | `#1A1A24` | Card surface (feat-card, plan, val-card, contact-card, faq-item bg) |
| `--rl-surface-elevated` | `#2A292F` | Rarely used; modals, elevated popovers |
| `--rl-border` | `#2A2A3A` | Card + section-separator borders |
| `--ghost-border` | `rgba(200,191,255,0.08)` | Nav, trust-strip, faq default border (subtle lavender tint) |
| `--rl-text` | `#E4E1E9` | Primary body text |
| `--rl-text-secondary` | `#CAC3D8` | Subheadings, lede, card body |
| `--rl-text-tertiary` | `#B0AAC0` | Captions, meta, section-tag |
| `--rl-primary` | `#C8BFFF` | Lavender accent — italic em in headings, active nav state, `.accent` inline |
| `--rl-primary-fill` | `#715CE4` | Violet CTA fill (btn-primary bg, plan-feature border, flow-tag-after) |
| `--rl-primary-gradient-end` | `#726BA5` | Gradient tail for primary halos |
| `--rl-accent` | `#FFB688` | Warm copper — ribbon, btn-accent, trust-strip svg, "Best value" |
| `--rl-success` | `#4ADE80` | Pulse dot, Schedule-E net income, check icons |
| `--rl-warning` | `#FBBF24` | dot-amber state |
| `--rl-danger` | `#FF6B6B` | dot-red state |
| `--rl-info` | `#60A5FA` | Reserved |
| `--rl-primary-10` | `rgba(200,191,255,0.10)` | Section-tag bg, supp-nav hover/active bg, val-card icn bg |
| `--rl-primary-20` | `rgba(200,191,255,0.20)` | Card hover border, `::selection` |
| `--rl-primary-fill-30` | `rgba(113,92,228,0.30)` | `--shadow-primary-glow` tail |
| `--rl-accent-10` | `rgba(255,182,136,0.10)` | `.plan-feature` bg tint |
| `--rl-accent-30` | `rgba(255,182,136,0.30)` | Accent button hover shadow, contact-card hover border |
| `--rl-success-10` | `rgba(74,222,128,0.12)` | Bug-report chk icon bg |

Type families:
- `--font-body` — Fira Sans (all UI + body copy)
- `--font-mono` — Fira Code (eyebrow, section-tag, stat numbers, code)
- `--font-display` — Libre Baskerville italic (hero h1, band h2, flow-headline, end-cta h2)
- `--font-section` — Playfair Display (h3, h4, footer h4, ftr column titles)

Spacing + type scales (`--space-1` through `--space-10`, `--text-xs` through `--text-5xl`) and shadow scale (`--shadow-sm` through `--shadow-xl`, `--shadow-primary-glow`) match the iOS app's scales.

## Animation timing reference

| Animation | Duration | Delay | Easing | Triggered by |
|---|---|---|---|---|
| `heroRise` (eyebrow) | 900 ms | 60 ms | `cubic-bezier(.2,.7,.2,1)` | Page load |
| `heroRise` (hero-sub) | 900 ms | 240 ms | same | Page load |
| `heroRise` (hero-cta) | 900 ms | 380 ms | same | Page load |
| `heroRise` (cta-note) | 900 ms | 480 ms | same | Page load |
| `heroRise` (trust-strip) | 900 ms | 580 ms | same | Page load |
| `heroTitleSettle` (h1) | 700 ms | 0 ms | `cubic-bezier(.2,.7,.2,1)` | Page load |
| `heroPhoneIn` (center) | 1100 ms | 700 ms | `cubic-bezier(.2,.7,.2,1)` | Page load |
| `heroPhoneInLeft` / `Right` | 1100 ms | 900 ms | same | Page load |
| `heroFloat` (center, infinite) | 7 s | 1800 ms | `ease-in-out` | Page load |
| `heroFloatSideL` | 8 s | 2000 ms | `ease-in-out` | Page load, infinite |
| `heroFloatSideR` | 8 s | 2200 ms | `ease-in-out` | Page load, infinite |
| `heroRise` (phones-caption) | 900 ms | 1400 ms | `cubic-bezier(.2,.7,.2,1)` | Page load |
| `glowPulse` (phones::before) | 9 s | 0 ms | `ease-in-out` | Page load, infinite |
| `pulse` (.dot-green) | 2.4 s | 0 ms | `ease-in-out` | Page load, infinite |
| `receiptShake` (receipt-1..5) | 600 ms | 200 / 280 / 360 / 440 / 520 ms | `cubic-bezier(.36,.07,.19,.97)` | `.flow-before.in-view` (IO) |
| Arrow stroke draw | 1200 ms | 800 ms | `cubic-bezier(.2,.7,.2,1)` | `.flow-scene.in-view` (IO) |
| Arrowhead fade | 400 ms | 1800 ms | linear | `.flow-scene.in-view` (IO) |
| Schedule E reveal | 700 ms | 1400 ms | `cubic-bezier(.2,.7,.2,1)` | `.flow-after.in-view` (IO) |
| Flow-step reveal | 700 ms | 0 / 100 / 200 ms | `cubic-bezier(.2,.7,.2,1)` | `.flow-step.in-view` (IO) |
| `[data-reveal]` generic | 700 ms | 0 / 70 / 140 / 210… ms | `cubic-bezier(.2,.7,.2,1)` | IO intersects; children of `[data-reveal-group]` get auto-staggered |

All animations are neutralised by `@media (prefers-reduced-motion: reduce)` (site-wide rule sets `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important`). The reveals script also takes the short-circuit path when `matchMedia('(prefers-reduced-motion: reduce)').matches`.

## Deviations from the reference

Every deviation below is intentional. Locked during the planning pass (questions A–I, then E-addendum).

### Dropped from the reference
1. **Preview-host chrome (A)** — the `claude.ai` postMessage bridge, the Tweaks panel CSS + init script, and the `html,body{background:transparent}` reset. Production has no need for these; the bridge in particular is a cross-origin code-execution surface.
2. **`@import url(...)` for Google Fonts (D)** — replaced with `<link rel="preconnect">` + `<link rel="stylesheet">` in `_includes/fonts.html`. Saves 1–2 RTTs vs the reference's in-CSS import. Also removed the unused Fira Sans weight 300 (never referenced in any rule, ~20 KB saved).
3. **Cloudflare email obfuscation** in support.html's contact link — replaced with plain `mailto:support@rentledger.org`.

### Preserved from the v1 site (not in v2 reference)
Preserved per the E-locking decision (conversion + self-serve value, not deliberately removed by the designer):
1. **Restore-purchase FAQ** on pricing — added as the 6th FAQ item ("How do I restore a purchase on a new iPhone?") between "Can I switch plans later?" and "What does 'Lifetime' actually mean?". Content from v1 pricing page verbatim.
2. **Tax-advice FAQ** on support — added to `#faq-account` ("Does RentLedger provide tax advice?"). Content from v1 support page.
3. **Offline FAQ** on support — added to `#faq-device` ("Does the app work offline?"). Content from v1 support page.
4. **Bug-report card** on support — new `#faq-bug` section (sidebar nav gains a "Bug report" link). Reuses v1's 5-item checklist verbatim.
5. **Response-time card** on support — added as a second card in `#faq-contact` alongside the primary email card. Passive "Most emails are answered…" rewritten to active first-person "I answer most emails…" (applied from every-style-editor review, aligns with the about page's first-person voice).

### Dropped from the v1 site (per E-locking decision)
1. **Break-even math callout** on pricing — redundant with the Lifetime card's "pays for itself in year 2" subtext and feature bullet.
2. **12-row compare table** on pricing — the new `.value-grid` "One feature set. No tiers, no add-ons." band asserts the same promise (whole app at every tier) with less repetition.
3. **Category-card grid** on support — replaced by the sidebar-nav pattern, which keeps topic orientation without requiring a full page-top grid.

### About page — second-pass conversion rewrite
After the initial port, about.md was rewritten for conversion. Changes:
- **Timeline section removed entirely.** The 5-entry "How we got here" timeline (`.timeline` markup, ~80 lines) was cut. Founder origin story was already telegraphed in the hero subtitle; the timeline was scenery, not value.
- **"Why" sections reframed from defense to benefit.** Headings changed from `Why local-first` / `Why iOS-only` / `Why manual entry` (defensive product rationale) to outcome-led phrasing: `Your data never leaves your iPhone.` / `iPhone-only, on purpose.` / `Manual entry. About a minute a month.`
- **Brand voice unified to "we" team voice.** All first-person "I" references removed (the page now reads as company voice, matching the support page). Founder origin story remains in third-person past tense ("a tax season that ate the same April weekend every year") — keeps the relatable hook without breaking the team illusion.
- **Body copy tightened** with `every-style-editor` polish pass. "absolute privacy" → "to keep your data on your phone" (specific over marketing-claim). End-of-paragraph payoffs name concrete outcomes ("tax season collapses to a two-tap export").

### Support page — contact card voice
Initial port had first-person "I answer most emails…" copy; reverted to v1 team voice ("we typically respond within 48 hours" / "Most emails are answered within one business day") to maintain the small-team illusion. Helpful for trust + removes the awkward founder reveal on the page where users actually need support.

### Heading-hierarchy bridges (a11y)
To satisfy Lighthouse's `heading-order` audit without changing the visual hierarchy:
- `pricing.md` — `<h1 class="visually-hidden">RentLedger pricing</h1>` at page top; `<h3 class="visually-hidden">What every plan includes</h3>` before `.value-grid`.
- `about.md` — `<h2 class="visually-hidden">Why RentLedger is built this way</h2>` before `.about-grid`.
- `support.md` — `<h2 class="visually-hidden">Help topics</h2>` before the first supp-sec.

### `.btn-primary` text color
Changed from `#E4E1E9` → `#FFFFFF` on `#715CE4` background. Reference's original 4.37:1 contrast ratio failed WCAG AA (4.5:1); the new 5.18:1 passes. Visually near-identical; improves Lighthouse accessibility from 88 to 98–100 across pricing/about.

### Hero-feature image reuse
Feature card slot 2 ("Every lost receipt is a missed deduction.") reuses `/assets/img/screens/hero-phone-left.webp` — the reference designer used the same base64 blob for both the hero left-side phone and the receipt-logging feature card. Captured in `_design/image-manifest.json`.

## Verification results

### Lighthouse (local, headless Chrome, desktop profile)

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 94 | 100 | 100 | 100 |
| Pricing | 99 | 98 | 100 | 100 |
| About | 100 | 98 | 100 | 100 |
| Support | 99 | 100 | 100 | 100 |

Home's LCP is 3.0 s — a `<link rel="preload" as="image" fetchpriority="high">` hint on `hero-phone-center.webp` (managed via `page.preload_image` front-matter) brings it down from 3.6 s.

### html-proofer
Passes cleanly. 49 internal links, 8 pages, no warnings.

## Scripts + provenance

- `_design/extract-images.rb` — one-shot script that reads `_design/index.html`, dedupes base64 blobs by sha1, slugs them by DOM context (hero phones vs feat cards), converts PNG→WebP with `cwebp -q 82`, writes to `/assets/img/screens/`, and emits a manifest.
- `_design/image-manifest.json` — sha1 → final-path mapping. Feature slot 2's reuse of the hero-left image is recorded here as a `dup` entry.
- `_design/{index,pricing,about,support}.html` — source-of-truth reference files. Excluded from the built site by `_config.yml`'s `exclude:` list.
- `_design/body-{pricing,about,support}.html`, `_design/tails/*.css`, `_design/index-body.html` — intermediate artifacts from the extraction scripts. Kept for provenance only.
