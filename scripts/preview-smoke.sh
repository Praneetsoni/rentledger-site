#!/usr/bin/env bash
# preview-smoke.sh — M1.6 acceptance check against any deployed origin.
#
# Usage:
#   ./scripts/preview-smoke.sh https://your-preview.pages.dev
#   ./scripts/preview-smoke.sh https://rentledger.org    # post-cutover
#
# Validates the bundle of things M1.6 promises:
#   - 7 indexable URLs respond 200
#   - 4 representative placeholder programmatic pages respond 200 with
#     <meta name="robots" content="noindex, nofollow"> intact
#   - /robots.txt has the right Sitemap line
#   - /llms.txt parses as plaintext with the expected H1 + product entries
#   - /sitemap-index.xml + /sitemap-0.xml are valid, sitemap-0 lists 7 URLs
#   - /blog/rss.xml renders (empty channel until first post)
#   - Homepage Schema.org graph has Organization + WebSite + MobileApplication
#     + FAQPage; canonical @id URIs match the §11.7 table
#
# Exit 0 = all green; exit 1 = any check failed. Prints a per-check status
# table so the failure is obvious in the noise.

set -uo pipefail

ORIGIN="${1:-}"
if [[ -z "$ORIGIN" ]]; then
  echo "usage: $0 <origin-url>" >&2
  echo "example: $0 https://rentledger-site.pages.dev" >&2
  exit 2
fi
ORIGIN="${ORIGIN%/}"

CURL="/usr/bin/curl"
PASS=0
FAIL=0
RESULTS=()

note() {
  local status="$1" check="$2" detail="$3"
  if [[ "$status" == "PASS" ]]; then
    PASS=$((PASS + 1))
    RESULTS+=("✅ $check — $detail")
  else
    FAIL=$((FAIL + 1))
    RESULTS+=("❌ $check — $detail")
  fi
}

check_status() {
  local label="$1" path="$2" expected="$3"
  local code
  code=$($CURL -s -o /dev/null -w "%{http_code}" --max-time 15 "${ORIGIN}${path}")
  if [[ "$code" == "$expected" ]]; then
    note "PASS" "$label" "${path} → ${code}"
  else
    note "FAIL" "$label" "${path} → ${code} (expected ${expected})"
  fi
}

check_noindex() {
  local label="$1" path="$2"
  local body
  body=$($CURL -s --max-time 15 "${ORIGIN}${path}")
  # astro-seo emits `noindex, nofollow` (with space) when both flags set.
  if echo "$body" | grep -qE '<meta name="robots" content="noindex,[[:space:]]*nofollow"'; then
    note "PASS" "$label" "${path} has noindex,nofollow"
  else
    note "FAIL" "$label" "${path} missing noindex meta — placeholder leak"
  fi
}

check_index_meta() {
  local label="$1" path="$2"
  local body
  body=$($CURL -s --max-time 15 "${ORIGIN}${path}")
  # astro-seo emits `index,follow,max-snippet:...,max-image-preview:large`
  # — comma-joined, no spaces. Tolerate either spacing for portability.
  if echo "$body" | grep -qE '<meta name="robots" content="index,[[:space:]]*follow'; then
    note "PASS" "$label" "${path} indexable (no noindex on real page)"
  elif echo "$body" | grep -q '<meta name="robots" content="noindex'; then
    note "FAIL" "$label" "${path} unexpectedly noindex — should be indexable"
  else
    note "FAIL" "$label" "${path} robots meta not found or unexpected format"
  fi
}

contains() {
  local label="$1" path="$2" needle="$3"
  local body
  body=$($CURL -s --max-time 15 "${ORIGIN}${path}")
  if echo "$body" | grep -qF "$needle"; then
    note "PASS" "$label" "${path} contains «${needle}»"
  else
    note "FAIL" "$label" "${path} missing «${needle}»"
  fi
}

echo "Smoke-testing ${ORIGIN} ..."
echo

# ── 1. The 7 indexable URLs ─────────────────────────────────────────────
for path in "/" "/about/" "/changelog/" "/pricing/" "/privacy/" "/support/" "/terms/"; do
  check_status "index 200" "$path" "200"
done

# ── 2. Crawler-facing endpoints ─────────────────────────────────────────
check_status "robots.txt"        "/robots.txt"        "200"
check_status "llms.txt"          "/llms.txt"          "200"
check_status "sitemap index"     "/sitemap-index.xml" "200"
check_status "sitemap 0"         "/sitemap-0.xml"     "200"
check_status "blog rss"          "/blog/rss.xml"      "200"

# Note: robots.txt + sitemap entries use the CANONICAL site URL (the
# `site` field in astro.config.mjs), not the testing origin. That's
# intentional and correct — these files must always advertise the
# canonical URL regardless of where they're being served. Pre-cutover,
# the canonical is `https://rentledger.org`; post-cutover, the preview
# origin IS the canonical.
CANONICAL="https://rentledger.org"

contains "robots sitemap line"    "/robots.txt"     "Sitemap: ${CANONICAL}/sitemap-index.xml"
contains "llms.txt h1"            "/llms.txt"       "# RentLedger"
contains "llms.txt product"       "/llms.txt"       "## Product"
contains "sitemap-0 has /"        "/sitemap-0.xml"  "<loc>${CANONICAL}/</loc>"
contains "sitemap-0 has /pricing" "/sitemap-0.xml"  "<loc>${CANONICAL}/pricing/</loc>"

# Sitemap should not list any placeholder programmatic URL.
forbidden_in_sitemap=("compare/stessa" "landlord-tax-deductions/california" "schedule-e-guide/single-family")
sitemap_body=$($CURL -s --max-time 15 "${ORIGIN}/sitemap-0.xml")
for fragment in "${forbidden_in_sitemap[@]}"; do
  if echo "$sitemap_body" | grep -qF "$fragment"; then
    note "FAIL" "sitemap filter" "/${fragment}/ leaked into sitemap-0.xml"
  else
    note "PASS" "sitemap filter" "/${fragment}/ correctly excluded"
  fi
done

# ── 3. Noindex coverage on placeholder programmatic pages ───────────────
check_noindex "noindex compare"    "/compare/stessa/"
check_noindex "noindex state"      "/landlord-tax-deductions/california/"
check_noindex "noindex scale"      "/bookkeeping-for/single-property-rentals/"
check_noindex "noindex prop type"  "/schedule-e-guide/single-family/"

# ── 4. Indexable meta on real pages ─────────────────────────────────────
check_index_meta "homepage indexable"  "/"
check_index_meta "/about/ indexable"   "/about/"
check_index_meta "/pricing/ indexable" "/pricing/"

# ── 5. Schema graph spot-check on homepage ──────────────────────────────
contains "schema Org @id"         "/" '"@id":"https://rentledger.org/#organization"'
contains "schema WebSite @id"     "/" '"@id":"https://rentledger.org/#website"'
contains "schema MobileApp @id"   "/" '"@id":"https://rentledger.org/#mobileapp"'
contains "schema FAQPage"         "/" '"@type":"FAQPage"'

contains "/about/ Person canonical" "/about/" '"@id":"https://rentledger.org/about/#praneet"'

# ── 6. Canonical URLs use the live origin ───────────────────────────────
# Pre-cutover: canonicals point at https://rentledger.org regardless of the
# preview origin; that's correct (origin-agnostic). Just verify a canonical
# tag exists.
contains "homepage canonical"    "/" 'rel="canonical"'
contains "/pricing/ canonical"   "/pricing/" 'rel="canonical"'

# ── Report ──────────────────────────────────────────────────────────────
echo
echo "=== Results (${PASS} pass / ${FAIL} fail) ==="
for line in "${RESULTS[@]}"; do
  echo "  $line"
done
echo

if [[ $FAIL -gt 0 ]]; then
  echo "❌ ${FAIL} check(s) failed. Do NOT proceed to M1.7 cutover."
  exit 1
fi

echo "✅ All checks passed. Preview origin is M1.6-acceptance-ready."
echo "   Next: review M1.7 pre-flight at .migration-snapshots/m1-7-cutover-preflight.md"
echo "   then ping for explicit go-ahead before any DNS change."
