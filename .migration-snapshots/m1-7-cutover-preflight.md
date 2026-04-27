# M1.7 — DNS cutover pre-flight checklist

*Drafted 2026-04-26 against `astro-migration` branch (PR #2). One-way step.
Do NOT execute any item below until M1.6 is fully green and Praneet has
given explicit go-ahead for cutover.*

This document is the cutover runbook. Read it top-to-bottom before touching
DNS. Each row gates the next — a "hold" anywhere means stop and resolve.

---

## Pre-cutover gates (every box must be ✅ before DNS change)

| # | Gate | How to verify | Expected outcome |
|---|---|---|---|
| 1 | M1.6 preview deploy is live | Cloudflare Pages → rentledger-site → Latest deployment shows "Success" | `*.pages.dev` URL serves the build |
| 2 | Smoke test green on preview URL | `./scripts/preview-smoke.sh https://<preview>.pages.dev` | 34/34 pass, exit 0 |
| 3 | CI green on PR #2 (latest commit) | `gh pr checks 2 --repo Praneetsoni/rentledger-site` | build-and-validate: pass |
| 4 | PSI lab data on preview URL — **diagnostic only** | Run PSI on `<preview>.pages.dev/`, `/pricing/`, `/support/` | Use to detect catastrophic regressions only. **Do NOT compare to baseline** — `*.pages.dev` does not receive the zone-level Cloudflare Fonts auto-rewrite (it's an `rentledger.org`-specific zone setting). Real PSI numbers come post-cutover. See "Cloudflare Fonts caveat" below for the diagnosis trail. |
| 4b | **Post-cutover PSI ≥ baseline (HARD GATE)** | Within 15 min of Step 4 (DNS swap), re-run PSI on `https://rentledger.org/`, `/pricing/`, `/support/` | `/` Perf ≥ 84, LCP ≤ 3.8 s; `/pricing/` Perf ≥ 95, LCP ≤ 2.6 s; `/support/` Perf ≥ 98, LCP ≤ 2.3 s; A11y/BP/SEO ≥ 98 everywhere. **If this fails, execute rollback within 20 min — the assumption that Cloudflare Fonts kicks in post-cutover would be wrong.** |
| 5 | Google Rich Results Test passes on `/` | https://search.google.com/test/rich-results — paste preview URL | "Page is eligible for rich results" with MobileApplication + FAQPage detected |
| 6 | Schema.org validator clean | https://validator.schema.org — paste rendered HTML of `/`, `/about/`, `/compare/stessa/`, `/landlord-tax-deductions/california/` | Zero errors per page |
| 7 | DNS access ready | `dig rentledger.org A +short` returns `172.67.176.80` and `104.21.88.102` (Cloudflare proxy) | Confirms zone is on Cloudflare DNS, ready for record swap |
| 8 | ~~Cloudflare Pages custom domain provisioned~~ — **folded into Step 3 of cutover sequence** | When Cloudflare Pages and the DNS zone are on the same CF account, the "Add custom domain" UI atomically swaps DNS. No way to pre-stage the cert without doing the swap. Decision recorded 2026-04-26: register the custom domain DURING M1.7, not as a pre-flight gate. | n/a (handled by Step 3 below) |
| 9 | Praneet has explicit go-ahead window | Block 1 hour calendar — cutover + smoke + monitor | Calendar event live |

---

## Cutover sequence (execute top-to-bottom; ~30 minutes wall-clock)

**Time budget:** ~5 minutes of changes + 1–3 minutes DNS+cert propagation + 10 minutes verification.

### Step 1 — Merge `astro-migration` → `main`

```bash
gh pr merge 2 --merge --repo Praneetsoni/rentledger-site
```

Use `--merge` (not squash) to preserve the milestone-by-milestone commit history. Cloudflare Pages will auto-deploy from `main` post-merge; takes ~60 s.

**Verify:**
```bash
gh run watch --repo Praneetsoni/rentledger-site
```
Wait for build-and-validate to pass on the post-merge `main` push.

### Step 2 — Flip Cloudflare Pages production branch to `main`

Cloudflare Pages → rentledger-site → Settings → Builds & deployments → Production branch → change from `astro-migration` to `main` → Save. Trigger a fresh production deployment (or push a no-op commit if the UI doesn't auto-trigger). Wait until the new `main`-built deployment shows "Success" with a commit SHA matching the merge commit.

**Hold if:** the production deployment fails. Diagnose before proceeding. Live site is still fine on GitHub Pages because we haven't touched DNS yet.

### Step 3 — Add custom domain in Cloudflare Pages (this IS the DNS swap)

Cloudflare Pages → rentledger-site → **Custom domains** → **Set up a custom domain** → enter `rentledger.org` → **Continue**.

The next screen shows the DNS diff:
- **Existing:** `CNAME @ → praneetsoni.github.io` (current GH Pages CNAME)
- **New:** `CNAME @ → rentledger-site.pages.dev`

**Click "Activate domain".** This atomically:
1. Registers `rentledger.org` as a Pages custom domain
2. Triggers Let's Encrypt cert provisioning (~30–90 s background)
3. Replaces the apex CNAME — DNS now resolves to Cloudflare Pages

There is NO way to do (1) without (2)+(3) when the zone is on the same Cloudflare account. The conflation is intentional in CF's UX.

Then repeat the flow for `www.rentledger.org`:
- Custom domains → Set up a custom domain → enter `www.rentledger.org` → Activate domain.

**Hold if:** the DNS swap fails or cert provisioning errors out. The custom-domains tab will show "Verification failed" with a reason. Most common: SSL/TLS mode mismatch — keep zone setting "Full (strict)"; Pages targets terminate TLS internally.

### Step 4 — Wait 1–3 min for cert + DNS propagation

```bash
# Watch DNS settle in real time
until dig rentledger.org +short | grep -q rentledger-site.pages.dev; do
  echo "$(date +%H:%M:%S) — still resolving to old origin..."
  sleep 30
done
echo "DNS swap complete"

# Watch cert provisioning — should hit Active within 90 s of Step 3
until /usr/bin/curl -sI https://rentledger.org/ 2>&1 | head -1 | grep -q "200"; do
  echo "$(date +%H:%M:%S) — cert/SSL not ready yet..."
  sleep 15
done
echo "TLS handshake clean"
```

During this window the live site may serve a brief TLS error (typically < 90 s). Acceptable per playbook M1.7 § "Hard rollback trigger" — only escalate if the error persists beyond 5 minutes after Step 3.

### Step 5 — Smoke test + Cloudflare Fonts verification

```bash
# 34-check smoke test against the live origin (covers all 7 indexable URLs,
# crawler endpoints, noindex coverage, schema @id resolution).
./scripts/preview-smoke.sh https://rentledger.org

# Confirm Cloudflare Fonts auto-rewrite kicked in — this is the diagnosis
# from the "Cloudflare Fonts caveat" section. If 0/0/3+ instead of
# 68/68/0, Gate 4b will fail the next PSI run.
echo "@font-face count: $(/usr/bin/curl -s https://rentledger.org/ | grep -c '@font-face')"
echo "cf-fonts paths:   $(/usr/bin/curl -s https://rentledger.org/ | grep -oc 'cf-fonts')"
echo "googleapis refs:  $(/usr/bin/curl -s https://rentledger.org/ | grep -oc 'fonts\.googleapis')"
```

Expected:
- Smoke test: **34/34 pass** (any failure → JUMP to **Rollback** below)
- `@font-face count: 68`, `cf-fonts paths: 68`, `googleapis refs: 0`

### Step 6 — Post-cutover PSI (Gate 4b hard rollback trigger)

Within 15 minutes of Step 3, run PSI on three URLs (use the saved analysis IDs in `cwv-baseline.md` for re-runnable links):

- `https://rentledger.org/`
- `https://rentledger.org/pricing/`
- `https://rentledger.org/support/`

Acceptance per Gate 4b:
- `/` Perf ≥ 84, LCP ≤ 3.8 s
- `/pricing/` Perf ≥ 95, LCP ≤ 2.6 s
- `/support/` Perf ≥ 98, LCP ≤ 2.3 s
- A11y / BP / SEO ≥ 98 everywhere

**If any score misses baseline, execute Rollback within 20 min.** The diagnosis (Cloudflare Fonts kicks in at the zone edge post-cutover) was wrong if this fires.

---

## Post-cutover (within 24 hours — runs into M1.8)

| Task | Why |
|---|---|
| Submit `https://rentledger.org/sitemap-index.xml` to Google Search Console | New sitemap, new structure — refresh GSC's understanding |
| Submit same sitemap to Bing Webmaster Tools | Same |
| Run Google Rich Results Test on `/` + one comparison + one blog | Live URL validates schema — defers gate G4 from M1.4 |
| Watch Cloudflare Pages 404 logs for 48 h | Catch any URL that broke despite the smoke test |
| Watch GSC Coverage report for 7 days | Indexed-page count should hold steady or grow |
| **DO NOT delete `.github/workflows/` Jekyll deployment for 7 days** | Rollback fallback per playbook |

After 7 days clean:

| Task | Why |
|---|---|
| Flip `rentledger-site` repo to private | Removes the public-by-default exposure now that GH Pages is no longer the origin |
| Remove `CNAME` file from repo | Stale GH-Pages-specific artifact |
| Remove `.github/workflows/` Jekyll deployment if any | Stale (CI workflow stays — that's the post-Astro CI) |
| Bump DNS TTL back to 3600 s | Default; fast-cutover TTL no longer needed |

---

## Rollback (if Step 6/7/8 fails)

If the live origin is broken after cutover and you can't immediately fix it forward:

1. **Revert DNS in Cloudflare:**
   ```
   Replace the new CNAMEs with:
     A     rentledger.org   172.67.176.80
     A     rentledger.org   104.21.88.102
     CNAME www              praneetsoni.github.io
   ```
2. **Wait 5 min** for propagation. GitHub Pages is still serving from `main` (we didn't disable it during cutover).
3. **Verify revert:** `dig rentledger.org +short` — should show GH-Pages-bound Cloudflare IPs.
4. **Revert the merge commit on `main`:**
   ```bash
   gh pr revert <pr-number-for-the-merge>   # or `git revert -m 1 <merge-sha>`
   ```
   GitHub Pages re-builds the Jekyll site from the reverted main; site is back to pre-cutover state within 5–10 min total.
5. **Diagnose Astro/Pages breakage** offline. Re-cutover only when fixed and re-verified end-to-end.

**Rollback budget:** rollback should complete within 20 min from the first failed verification. After 20 min of broken-live-origin, you're past the point where users will notice. Don't try to "just fix it forward" if rollback is faster.

---

## Cloudflare Fonts caveat (recorded 2026-04-26 from M1.6 PSI run)

The first M1.6 PSI sweep against `https://rentledger-site.pages.dev/` showed
across-the-board performance regression vs M1.1 baseline (`/` Perf 84→80,
`/pricing/` 95→87, `/support/` 98→89; FCP/LCP up 0.3–1.8 s on every page).

Diagnosis: zone-level Cloudflare Fonts auto-rewrite is a **rentledger.org**
zone setting. It does not apply to `*.pages.dev` requests.

Direct evidence captured 2026-04-26:

| Origin | inlined `@font-face` | `cf-fonts` paths | `fonts.googleapis.com` requests |
|---|---:|---:|---:|
| `https://rentledger.org/` (Jekyll, Cloudflare Fonts active) | 68 | 68 | 0 |
| `https://rentledger-site.pages.dev/` (Pages, no rewrite) | 0 | 0 | 3 |

The preview origin makes the browser fetch render-blocking
`fonts.googleapis.com` CSS + 4 woff2 binaries on Slow 4G — entire perf gap
explained by that single round-trip pattern.

Why this resolves itself at cutover: Cloudflare Fonts intercepts at the
**zone edge**, before reaching origin. After DNS swap, requests hitting
`rentledger.org/...` are still served by Cloudflare Pages content but the
edge applies the zone setting first. Same 68 `@font-face` inlines, no
Google Fonts round-trip. Numbers should snap back to (or beat) baseline.

If they don't — Gate 4b in the table above is the rollback trigger.

## Critical-path inputs Praneet still needs to supply

| Input | Needed for | Status |
|---|---|---|
| Cloudflare account access | M1.6 (Pages project setup) | ⏸ pending |
| Founder headshot at `public/images/founder.webp` | Person.image schema completeness | ⏸ pending — graceful-degrade until provided |
| Explicit M1.7 cutover go-ahead | Step 1 (merge) | ⏸ pending — gate on Step 4 PSI run |
| GSC + Bing Webmaster Tools access | Post-cutover sitemap submission | ⏸ pending |

None of these block M1.6 setup or smoke testing — they just block the actual cutover and post-cutover steps.
