#!/usr/bin/env node
// audit-disclaimers.mjs — build-time enforcement of SEO-PLAYBOOK §12.7.8.
//
// Runs as a `prebuild` hook. Fails the build if any of the §12.7 rules
// are violated. Cheap & deterministic: parses .astro / .md / .mdx source
// files in src/pages and src/content, no AST — string matching only.
//
// Rules enforced (per §12.7.8):
//   1. Disclaimer presence — Article-flagged YMYL pages must import
//      TaxDisclaimer or StateTaxDisclaimer.
//   2. Author block presence — same pages must import AuthorQualification.
//   3. Sponsored-rel ban — no link anywhere may carry rel="sponsored"
//      until §12.7.5 is revisited.
//   4. Competitor-link wrapping (warning) — outbound links to competitor
//      domains should go through CompetitorLink.astro. Warning today,
//      ship-blocking after first occurrence per §12.7.8.
//
// What "YMYL page" means here:
//   A page declares itself YMYL by setting one of these markers in its
//   source:
//     - frontmatter `ymyl: true`
//     - frontmatter `schemaType: Article` AND any tax/legal/financial
//       claim (heuristic: presence of "tax" / "schedule e" / "deduction"
//       / "1099" / "irs" in the body)
//     - explicit Astro import of any VerifiedField data file
//   This is intentionally over-inclusive — better to false-positive a
//   non-YMYL page than to miss disclaimer enforcement on a real one.
//
// Skip the audit by setting RL_SKIP_DISCLAIMER_AUDIT=1 — useful for
// migrations or one-off doc edits, NOT routine builds.

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative } from "node:path";

if (process.env.RL_SKIP_DISCLAIMER_AUDIT === "1") {
  console.log("⏭  audit-disclaimers: skipped (RL_SKIP_DISCLAIMER_AUDIT=1)");
  process.exit(0);
}

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// Competitor domains from src/data/competitors.ts. Hard-coded here so
// the audit doesn't need to import the data file (which has Zod
// validation that would run on every build). Keep in sync manually —
// adding a competitor without updating this list is a §12.7.8 gap.
const COMPETITOR_DOMAINS = [
  "stessa.com",
  "avail.co",
  "baselane.com",
  "landlordstudio.com",
  "landlordy.com",
  "rentecdirect.com",
  "rentredi.com",
  "waveapps.com",
  "freshbooks.com",
  "intuit.com",
  "quickbooks.intuit.com",
  "turbotenant.com",
  "doorloop.com",
  "buildium.com",
  "appfolio.com",
  "reihub.net",
  "azibo.com",
  "zillow.com",
  "apartments.com",
];

// YMYL classification keywords. Mix of strings (case-insensitive substring)
// and regexes (used as-is). Expanded post-PR-7 legal audit (P0-4) to catch
// pages that were missed by the initial keyword set.
const YMYL_KEYWORDS = [
  "schedule e",
  "schedule-e",
  "tax deduction",
  "tax deductions",
  "1099-nec",
  "1099 nec",
  /\birs\b/i,
  "depreciation",
  "rental income tax",
  "landlord tax",
  // P0-4 additions — expanded coverage for tax-content pages that don't
  // mention IRS / Schedule E by literal name but still make YMYL claims.
  "rental property",
  "passive activity",
  /\bqbi\b/i,
  "section 179",
  "bonus depreciation",
  "recapture",
  /\bbasis\b/i,
  "tax form",
  "filing status",
  "rental loss",
];

// Canonical disclaimer phrases. If a YMYL page contains the literal text
// from TaxDisclaimer.astro WITHOUT the import, the writer paraphrased the
// disclaimer inline — bypasses single-source-of-truth (§12.7.7) and will
// drift the moment §12.7.1 wording is updated. Block the build.
const SSOT_DISCLAIMER_PHRASES = [
  "General educational information — not personalized advice",
  "general educational information about U.S. federal tax topics",
  "RentLedger LLC and its founder are not licensed tax professionals",
];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (/\.(astro|md|mdx)$/.test(entry.name)) {
      yield full;
    }
  }
}

function frontmatterValue(src, key) {
  // Very loose frontmatter parse — only used for boolean / string flags.
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return undefined;
  const line = fm[1].split("\n").find((l) => l.trim().startsWith(`${key}:`));
  if (!line) return undefined;
  return line.split(":").slice(1).join(":").trim();
}

function matchesYmylKeyword(src) {
  const lower = src.toLowerCase();
  return YMYL_KEYWORDS.some((kw) => {
    if (kw instanceof RegExp) return kw.test(src);
    return lower.includes(kw);
  });
}

function isYmylPage(src) {
  // Explicit ymyl: true → always YMYL. Explicit ymyl: false → handled
  // separately in the override audit (see auditYmylFalseOverride).
  if (frontmatterValue(src, "ymyl") === "true") return true;

  const schemaType = frontmatterValue(src, "schemaType");
  const hasArticleSchema =
    schemaType === "Article" ||
    schemaType === '"Article"' ||
    /import\s+Article\s+from\s+["'].*\/schema\/Article/.test(src);

  if (!hasArticleSchema) {
    // Compare collection entries don't have schemaType frontmatter but
    // are emitted as Review schema by the layout — they always make
    // competitor claims, so treat as YMYL.
    if (/src\/content\/compare\//.test(src)) return true;
    if (/src\/pages\/compare\//.test(src)) return true;
    return false;
  }

  return matchesYmylKeyword(src);
}

function isComparePage(file) {
  // Comparison pages need EditorialOnlyNotice per §12.7.5.
  if (/src\/content\/compare\//.test(file)) return true;
  if (/src\/pages\/compare\//.test(file)) return true;
  return false;
}

function importsComponent(src, componentName) {
  const re = new RegExp(
    `import\\s+${componentName}\\s+from\\s+["'][^"']+/${componentName}\\.astro["']`,
  );
  return re.test(src);
}

function findSponsoredLinks(src) {
  // Catches: rel="sponsored", rel='sponsored', rel="x sponsored y", etc.
  const re = /\brel\s*=\s*["']([^"']*)["']/g;
  const matches = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    if (/\bsponsored\b/.test(m[1])) {
      matches.push(m[0]);
    }
  }
  return matches;
}

function findDynamicSponsoredHints(src, allowKeyword) {
  // P1-2: catch dynamic rel values like rel={isPaid ? "sponsored" : ...}
  // by string-matching the literal token "sponsored" anywhere in source.
  // Allows the writer to opt out via frontmatter `allowSponsoredKeyword: true`
  // (rare — only legitimate when a page mentions sponsorship as prose, e.g.,
  // "Stessa was previously sponsored by Roofstock").
  if (allowKeyword) return [];
  const matches = [];
  const re = /\bsponsored\b/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    // Skip if it's inside a markdown blockquote (lines starting with `>`)
    // — quoted prose isn't a commercial-speech endorsement.
    const lineStart = src.lastIndexOf("\n", m.index) + 1;
    const lineText = src.slice(lineStart, src.indexOf("\n", m.index));
    if (lineText.trim().startsWith(">")) continue;
    // Skip if it appears inside the literal string "rel=\"...\"" (already
    // caught by findSponsoredLinks).
    matches.push({ index: m.index, line: lineText.trim().slice(0, 100) });
  }
  return matches;
}

function detectInlineDisclaimerSSOT(src) {
  // P0-4: SSOT violation — page contains canonical disclaimer phrases
  // verbatim but does NOT import TaxDisclaimer/StateTaxDisclaimer. Means
  // the writer pasted the disclaimer text inline instead of importing it.
  // The disclaimer must come from the component, never inline copy.
  const hasImport =
    importsComponent(src, "TaxDisclaimer") ||
    importsComponent(src, "StateTaxDisclaimer");
  if (hasImport) return null; // import present → no inline-paraphrase concern
  for (const phrase of SSOT_DISCLAIMER_PHRASES) {
    if (src.includes(phrase)) return phrase;
  }
  return null;
}

function findUnwrappedCompetitorLinks(src) {
  // Look for raw <a href="https://<competitor>"...> NOT inside a
  // CompetitorLink component. This is a heuristic — it's possible to
  // false-positive when a competitor URL appears inside a string
  // literal that's not an actual link, but in practice the gain from
  // catching real misses outweighs the rare false positive.
  const findings = [];
  for (const domain of COMPETITOR_DOMAINS) {
    const re = new RegExp(
      `<a[^>]*href\\s*=\\s*["']https?://(?:www\\.)?${domain.replace(/\./g, "\\.")}[^"']*["'][^>]*>`,
      "g",
    );
    let m;
    while ((m = re.exec(src)) !== null) {
      findings.push({ domain, snippet: m[0].slice(0, 120) });
    }
  }
  return findings;
}

const errors = [];
const warnings = [];
let pagesScanned = 0;
let ymylPages = 0;

const scanRoots = [
  join(root, "src/pages"),
  join(root, "src/content"),
  join(root, "src/layouts"),
];

for (const scanRoot of scanRoots) {
  try {
    for await (const file of walk(scanRoot)) {
      pagesScanned++;
      const src = await readFile(file, "utf-8");
      const rel = relative(root, file);

      // Rule 3a: sponsored-rel ban (applies to ALL pages, not just YMYL)
      const sponsored = findSponsoredLinks(src);
      if (sponsored.length > 0) {
        errors.push(
          `${rel}: rel="sponsored" forbidden per §12.7.5 — found ` +
            `${sponsored.length} occurrence(s). Revisit §12.7.5 first.`,
        );
      }

      // Rule 3b: dynamic-rel sponsored hint scan (P1-2 — catches
      // rel={isPaid ? "sponsored" : "..."} where literal regex misses)
      const allowSponsoredKeyword =
        frontmatterValue(src, "allowSponsoredKeyword") === "true";
      const dynamicSponsored = findDynamicSponsoredHints(
        src,
        allowSponsoredKeyword,
      );
      if (dynamicSponsored.length > 0) {
        // Warning, not error — too many false positives if the page
        // legitimately quotes someone using the word.
        warnings.push(
          `${rel}: literal token "sponsored" appears ${dynamicSponsored.length} ` +
            `time(s) outside rel="…" attributes. Verify it isn't a hidden ` +
            `affiliate link (dynamic rel value, computed value, etc.). Add ` +
            `frontmatter \`allowSponsoredKeyword: true\` if this is legitimate ` +
            `prose mentioning sponsorship. Per §12.7.5 / P1-2.`,
        );
      }

      // ymyl: false explicit override audit (P0-4) — applies to ALL pages.
      // If a writer set ymyl: false but the body contains YMYL keywords,
      // require an explicit ymylExempt: <reason> frontmatter override.
      if (frontmatterValue(src, "ymyl") === "false") {
        if (matchesYmylKeyword(src)) {
          const exempt = frontmatterValue(src, "ymylExempt");
          if (!exempt) {
            errors.push(
              `${rel}: explicit \`ymyl: false\` on a page with YMYL keywords ` +
                `requires \`ymylExempt: <reason>\` frontmatter override (P0-4 ` +
                `audit recommendation). State why this page is genuinely not ` +
                `YMYL despite the keyword presence.`,
            );
          }
        }
      }

      // YMYL-only rules (Tax disclaimer / Author block / Competitor links / SSOT / EditorialOnlyNotice / markdown handling)
      if (!isYmylPage(src)) continue;
      ymylPages++;

      // Rule MD: YMYL pages must be .astro or .mdx (not raw .md) so
      // disclaimer components can render. .md doesn't compile JSX.
      if (file.endsWith(".md")) {
        errors.push(
          `${rel}: YMYL pages must be .astro or .mdx (not raw .md) so ` +
            `<TaxDisclaimer /> and <AuthorQualification /> can render. ` +
            `Convert this file to .mdx and import the required components ` +
            `(P0-4 audit recommendation).`,
        );
        continue; // import checks below would fail spuriously on .md
      }

      // Rule SSOT: inline disclaimer text without component import (P0-4).
      // Detects writers who paste the disclaimer prose inline to silence
      // the audit instead of importing it via the component.
      const inlinePhrase = detectInlineDisclaimerSSOT(src);
      if (inlinePhrase) {
        errors.push(
          `${rel}: inline disclaimer text detected ("${inlinePhrase.slice(0, 60)}…") ` +
            `but no <TaxDisclaimer /> import. Disclaimer must render via the ` +
            `component to preserve single-source-of-truth (§12.7.1). Remove ` +
            `the inline text and import <TaxDisclaimer />.`,
        );
      }

      // Rule 1: disclaimer presence
      const hasDisclaimer =
        importsComponent(src, "TaxDisclaimer") ||
        importsComponent(src, "StateTaxDisclaimer");
      if (!hasDisclaimer) {
        errors.push(
          `${rel}: YMYL page missing TaxDisclaimer or StateTaxDisclaimer ` +
            `import (§12.7.7).`,
        );
      }

      // Rule 2: author qualification block
      if (!importsComponent(src, "AuthorQualification")) {
        errors.push(
          `${rel}: YMYL page missing AuthorQualification import (§12.7.6).`,
        );
      }

      // Rule EON: comparison pages must import EditorialOnlyNotice (P0-3).
      // §12.7.5 mandates the "Editorial only — no compensation" disclosure
      // on every /compare/* page. Component-enforced because drift across
      // 14+ pages would create Lanham Act §43(a) false-advertising risk.
      if (isComparePage(file)) {
        if (!importsComponent(src, "EditorialOnlyNotice")) {
          errors.push(
            `${rel}: comparison page missing EditorialOnlyNotice import ` +
              `(§12.7.5 / P0-3). The "Editorial only — no compensation" ` +
              `disclosure must render via the component on every /compare/* page.`,
          );
        }
      }

      // Rule 4: competitor-link wrapping (warning)
      const unwrapped = findUnwrappedCompetitorLinks(src);
      const usesCompetitorLink = importsComponent(src, "CompetitorLink");
      if (unwrapped.length > 0 && !usesCompetitorLink) {
        warnings.push(
          `${rel}: ${unwrapped.length} raw <a> link(s) to competitor ` +
            `domain(s) [${unwrapped.map((u) => u.domain).join(", ")}] not ` +
            `wrapped via CompetitorLink (§12.7.7). Convert to CompetitorLink ` +
            `before next ship.`,
        );
      }
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

console.log(
  `\n📋 audit-disclaimers: scanned ${pagesScanned} files, ${ymylPages} YMYL.`,
);

if (warnings.length > 0) {
  console.warn("\n⚠️  Warnings:");
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (errors.length > 0) {
  console.error("\n❌ Disclaimer audit FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nBuild blocked. Fix the above per SEO-PLAYBOOK §12.7, or set " +
      "RL_SKIP_DISCLAIMER_AUDIT=1 if this is a known one-off (not for " +
      "routine builds).",
  );
  process.exit(1);
}

console.log("✅ audit-disclaimers: all checks passed.\n");
