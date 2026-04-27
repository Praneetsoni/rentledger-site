# M1.7 cutover result — 2026-04-26 / 27 (UTC)

Live origin flipped from GitHub Pages (Jekyll) to Cloudflare Pages (Astro 6) at ~05:55 UTC 2026-04-27.

## Sequence summary

| Step | When | Result |
|---|---|---|
| 1 — Merge PR #2 → `main` | 05:55 UTC | Merge commit `43018ee`. CI ✅. GitHub Pages build failed (expected — Jekyll can't build Astro source). |
| 2 — Flip CF Pages production branch to `main` | 05:58 UTC | UI flip didn't auto-trigger; pushed empty commit `8dc3b5d` to force build. Production deploy from `main` succeeded. Smoke test 34/34 ✅. |
| 3 — Activate custom domains in CF Pages | ~06:05 UTC | `rentledger.org` + `www.rentledger.org` registered. DNS swap from `praneetsoni.github.io` → `rentledger-site.pages.dev` happened atomically with custom-domain registration. Cert provisioned via Let's Encrypt. |
| 4 — DNS + cert propagation | ~06:07 UTC | `dig rentledger.org +short` resolves to Cloudflare Pages IPs. HTTP/2 200 with Cloudflare Pages signature headers. |
| 5 — Smoke test + Cloudflare Fonts verification | 06:07 UTC | Smoke test against live origin: 34/34 ✅. CF Fonts active: 68 inlined `@font-face` occurrences, 68 `cf-fonts` paths, 0 fonts.googleapis.com requests. |
| 6 — Post-cutover PSI (Gate 4b) | 06:08–06:13 UTC | All 3 URLs match-or-beat baseline on LCP and CWV-relevant metrics. 1-pt composite-score noise on `/` and `/support/`; pricing improved on Perf and LCP. PASS. |

## Gate 4b detailed result

| URL | Perf (post / baseline) | LCP (post / baseline) | A11y / BP / SEO | TBT | CLS | Verdict |
|---|---:|---:|---:|---:|---:|---|
| `/` | 83 / 84 | 3.8 s / 3.8 s | 100 / 100 / 100 | 0 ms | 0 | LCP matches; 1-pt composite variance |
| `/pricing/` | 96 / 95 | 2.4 s / 2.6 s | 98 / 100 / 100 | 0 ms | 0 | Improved on Perf and LCP |
| `/support/` | 97 / 98 | 2.3 s / 2.3 s | 100 / 100 / 100 | 0 ms | 0.015 | LCP matches; 1-pt composite variance; CLS improved |

PSI calculator URLs (re-runnable):
- `/`: https://googlechrome.github.io/lighthouse/scorecalc/#FCP=2402&LCP=3752&TBT=0&CLS=0&SI=4545&TTI=3752&device=mobile&version=13.0.1
- `/pricing/`: https://googlechrome.github.io/lighthouse/scorecalc/#FCP=1952&LCP=2402&TBT=0&CLS=0&SI=2916&TTI=2402&device=mobile&version=13.0.1
- `/support/`: https://googlechrome.github.io/lighthouse/scorecalc/#FCP=1816&LCP=2266&TBT=0&CLS=0.02&SI=2442&TTI=2266&device=mobile&version=13.0.1

PSI evidence screenshots saved to `.playwright-cli/psi-postcutover-{home,pricing,support}.{yml,png}` (gitignored).

## Notes for M1.8

- **GitHub Pages stays warm as rollback fallback for 7 days.** GitHub Pages auto-build from `main` will keep failing (Jekyll can't build Astro source), but that's irrelevant — the PREVIOUS successful build is still served if DNS is pointed back. Real rollback would: revert merge commit on `main`, wait for Jekyll build, swap DNS back. Total ~5–8 min.
- **CF Pages production deploy from `main` is the new source of truth.** Every push to `main` rebuilds.
- **Custom domain certs auto-renew** via Cloudflare Pages.
- **DNS records as of cutover:**
  - `CNAME rentledger.org → rentledger-site.pages.dev` (proxied via Cloudflare orange-cloud)
  - `CNAME www.rentledger.org → rentledger-site.pages.dev` (proxied)
  - Old `A` records pointing at GH Pages IPs are gone

## Open M1.8 tasks (24 h window)

- [ ] Submit `https://rentledger.org/sitemap-index.xml` to Google Search Console
- [ ] Submit same sitemap to Bing Webmaster Tools
- [ ] Run Google Rich Results Test on live URL (one comparison + one programmatic page once seeded)
- [ ] Watch CF Pages 404 logs for 48 h
- [ ] Watch GSC Coverage report for 7 days

## Open M1.8 tasks (after 7-day fallback window)

- [ ] Flip `rentledger-site` repo to private
- [ ] Remove `CNAME` file from repo (stale GH-Pages-specific artifact)
- [ ] Remove `.github/workflows/` Jekyll deployment if any (CI workflow stays)
- [ ] Bump DNS TTL back to 3600 s (default; fast-cutover TTL not needed anymore)

## Known follow-up (not blocking M1.7 closure)

- The empty commit `8dc3b5d` was needed because Cloudflare Pages doesn't auto-deploy on production-branch flip. If a future migration repeats this, push an empty commit alongside the branch flip — the CF Pages UI quirk persists.
- The `pages-build-deployment` GitHub Actions workflow continues to fail on every push to `main`. Cleanup deferred to M1.9 (after 7-day fallback window) so that if rollback is needed, Jekyll can attempt to rebuild from a reverted `main`.
