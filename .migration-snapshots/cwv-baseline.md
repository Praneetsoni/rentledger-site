# Pre-migration Lighthouse baseline

*Captured 2026-04-25. Authoritative source: PageSpeed Insights mobile reports linked below (extracted via Playwright). Field/CrUX data unavailable — site lacks real-user traffic for the Chrome User Experience Report. These are PSI lab numbers; post-migration must match or beat.*

## PSI lab data (authoritative — mobile)

| URL | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | TTI |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | **84** | 100 | 100 | 100 | 2.4 s | **3.8 s** | 0 ms | 0 | 4.4 s | 3.8 s |
| `/pricing/` | 95 | 98 | 100 | 100 | 2.1 s | 2.6 s | 0 ms | 0 | 2.7 s | 2.6 s |
| `/support/` | **98** | 100 | 100 | 100 | 1.2 s | 2.3 s | 0 ms | 0.02 | 1.2 s | 2.3 s |

PSI report URLs (re-runnable):
- `/` → https://pagespeed.web.dev/analysis/https-rentledger-org/tnf98vsnb9?form_factor=mobile
- `/pricing/` → https://pagespeed.web.dev/analysis/https-rentledger-org-pricing/4awush2q86?form_factor=mobile
- `/support/` → https://pagespeed.web.dev/analysis/https-rentledger-org-support/n6vvy9w20t?form_factor=mobile

## Notes

- **Site is in good shape overall.** A11y, BP, SEO all at 98–100 across the board. Don't regress these.
- **Homepage is the weakest spot:** Perf 84, LCP 3.8s vs CWV "good" threshold of 2.5s. Hero phone screenshot trio is a large LCP candidate. Astro's static optimization + better image preload + dropping any unused JS should push this to 90+.
- **`/pricing/` is the second-weakest:** Perf 95 (already great) but A11y 98 (one issue to investigate during M1.5 — probably color contrast on a CTA or missing label).
- **`/support/` is excellent.** Perf 98, LCP 2.3s, CLS 0.02. Just don't regress.
- **Best Practices = 100 everywhere.** Cloudflare's email-decode script + everything else is fine. Preserve.

## Acceptance criteria for M1.5 (post-migration local Lighthouse, mobile)

- `/` LCP < 3.8 s, Perf ≥ 84 (target 90+ given Astro static optimization)
- `/pricing/` Perf ≥ 95, LCP ≤ 2.6 s, A11y back to 100 if the contrast/label issue is found
- `/support/` Perf ≥ 98, LCP ≤ 2.3 s, CLS ≤ 0.025
- A11y, BP, SEO must stay ≥ 98 on every page
- All three scores must match or beat their PSI baseline above

## Local Lighthouse cross-check (informational only)

Ran `npx lighthouse` locally same day; produced harsher numbers due to slower local CPU + network simulation than PSI's data center. Reference only — **do not use these as the baseline.**

| URL | Perf (local) | Perf (PSI) | LCP (local) | LCP (PSI) | BP (local) | BP (PSI) |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 68 | **84** | 4.5 s | **3.8 s** | 81 | **100** |
| `/pricing/` | 92 | **95** | 2.7 s | **2.6 s** | 81 | **100** |
| `/support/` | 93 | **98** | 2.3 s | **2.3 s** | 81 | **100** |

Raw local JSON: `.migration-snapshots/lh-{home,pricing,support}.json` (gitignored).
