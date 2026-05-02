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
//   5. Trade-libel forbidden phrasings (§12.7.2 / Slot 2 enforcement) —
//      "[competitor] is unreliable", "don't use [competitor]", "[competitor]
//      is a scam". Markdown-blockquote escape hatch (`> ...` lines) — quoted
//      observation is protected, asserted-as-fact is not.
//   6. PTIN-classification safety (§12.7.9 / Slot 2 enforcement) — substring
//      scan for "auto-files", "auto-prepares", "automatically calculates
//      your taxes". Marketing copy that crosses this line risks classifying
//      RentLedger as a tax-return-preparer under IRS Circular 230.
//   7. /compare/* title pattern (§12.7.10 / Slot 2 enforcement) — the
//      rendered <title> for any comparison page must contain "vs RentLedger"
//      or "alternative". Audit checks frontmatter `title` / `titleFull`
//      first, falls back to the first H1 (#) in the body. Forbidden: titles
//      like "The Best [Competitor]…" that suggest endorsement-by-association.
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
  "Praneet Soni is not a licensed tax professional and is not liable",
];

// Trade-libel forbidden phrasings per §12.7.2. Each entry is matched against
// the literal page source with the competitor token interpolated. Hit = ship
// block (UNLESS the line is a markdown blockquote, per §12.7.2 escape hatch:
// quoted prose is observation, not assertion).
const TRADE_LIBEL_TEMPLATES = [
  "{COMPETITOR} is unreliable",
  "don't use {COMPETITOR}",
  "do not use {COMPETITOR}",
  "{COMPETITOR} is a scam",
  "{COMPETITOR} is dishonest",
  "avoid {COMPETITOR}",
];

// Names that paired with the templates produce ship-blocking phrasings. Keep
// in sync with COMPETITOR_DOMAINS — the matcher is case-insensitive.
const COMPETITOR_NAMES = [
  "QuickBooks",
  "Stessa",
  "Avail",
  "Baselane",
  "Landlord Studio",
  "Landlordy",
  "Rentec Direct",
  "RentRedi",
  "Wave",
  "FreshBooks",
  "Intuit",
  "TurboTenant",
  "DoorLoop",
  "Buildium",
  "AppFolio",
  "REI Hub",
  "Azibo",
];

// PTIN-classification safety phrasings per §12.7.9. Substring-match
// (case-insensitive) against the literal source. Hit = ship block.
const PTIN_FORBIDDEN_PHRASES = [
  "auto-files your tax",
  "auto-files your taxes",
  "auto-prepares your tax",
  "auto-prepares your schedule",
  "automatically calculates your tax",
  "automatically calculates your taxes",
  "rentledger files your 1099",
];

// /compare/* title-pattern allowed substrings per §12.7.10. The rendered
// <title> must contain at least one of these (case-insensitive substring
// match). Anything else risks suggesting endorsement-by-association.
const COMPARE_TITLE_REQUIRED_TOKENS = ["vs rentledger", "alternative"];

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

function isYmylPage(src, file) {
  // Layouts and components are infrastructure, not user-facing pages.
  // They ship the disclaimer components for content pages to import.
  // Audit logic applies at the page-level (src/pages/, src/content/),
  // never at the infrastructure-level. Otherwise a layout that imports
  // the Article schema component AND mentions a tax keyword in a doc
  // comment (e.g., "see /blog/landlord-tax-deductions") false-positives.
  if (file && /src\/(layouts|components)\//.test(file)) return false;

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
    // competitor claims, so treat as YMYL. Path-based — must test `file`,
    // not `src` (the body); previous regex tested src and silently
    // misclassified every compare page as non-YMYL until M2.2 Slot 2.
    // The /compare/ directory landing (`src/pages/compare/index.astro`)
    // is a nav hub, not a comparison page — exclude it.
    if (file && isComparePage(file)) return true;
    return false;
  }

  return matchesYmylKeyword(src);
}

function isComparePage(file) {
  // Comparison pages need EditorialOnlyNotice per §12.7.5. The /compare/
  // directory landing (`src/pages/compare/index.astro`) is a nav hub, not
  // a comparison page; exclude it so it doesn't false-positive against the
  // §12.7 component-import rules.
  if (/src\/pages\/compare\/index\.(astro|md|mdx)$/.test(file)) return false;
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

function findTradeLibelHits(src) {
  // §12.7.2 — substring scan across forbidden_template × competitor_name.
  // Skip lines that start with `>` (markdown blockquote), per the §12.7.2
  // escape hatch. Returns array of { phrase, line } for each hit.
  const hits = [];
  const lines = src.split("\n");
  for (const competitor of COMPETITOR_NAMES) {
    for (const template of TRADE_LIBEL_TEMPLATES) {
      const phrase = template.replace("{COMPETITOR}", competitor).toLowerCase();
      for (const line of lines) {
        const trimmed = line.trim();
        // Markdown blockquote escape hatch — quoted observation is allowed
        // (e.g., "BiggerPockets users wrote: > QuickBooks is unreliable for
        // rentals"). The blockquote framing makes it an observation about
        // user reports, not an asserted-as-fact claim.
        if (trimmed.startsWith(">")) continue;
        // Also skip explicit code fences / inline code blocks.
        if (trimmed.startsWith("```")) continue;
        if (line.toLowerCase().includes(phrase)) {
          hits.push({
            phrase: template.replace("{COMPETITOR}", competitor),
            line: trimmed.slice(0, 140),
          });
        }
      }
    }
  }
  return hits;
}

function findPtinHits(src) {
  // §12.7.9 — substring scan, case-insensitive. No blockquote escape hatch:
  // even quoted "RentLedger auto-files your taxes" copy is dangerous if
  // re-published from this site, because Circular 230 cares about the
  // marketing assertion regardless of attribution.
  const lower = src.toLowerCase();
  return PTIN_FORBIDDEN_PHRASES.filter((p) => lower.includes(p));
}

function checkCompareTitlePattern(src, file) {
  // §12.7.10 — title must contain "vs RentLedger" or "alternative".
  // For an Astro page (src/pages/compare/*.astro), look at frontmatter
  // `title` / `titleFull` and any literal `<title>` block inside the file.
  // For a content collection MDX file (src/content/compare/*.mdx), look at
  // the frontmatter `title` / `titleFull`.
  //
  // Astro template strings in the dynamic [competitor].astro page don't
  // have a static title to check — we let those through and rely on the
  // collection-entry's frontmatter title (which IS static) being audited.
  const frontmatterTitle = frontmatterValue(src, "title");
  const frontmatterTitleFull = frontmatterValue(src, "titleFull");
  const candidates = [];
  if (frontmatterTitle) candidates.push(frontmatterTitle);
  if (frontmatterTitleFull) candidates.push(frontmatterTitleFull);

  // Fall back to first H1 in the body (`# ...`).
  const h1 = src.match(/^#\s+(.+)$/m);
  if (h1) candidates.push(h1[1]);

  // Fall back to a literal `<title>...</title>` if present (rare in pages
  // that delegate to layouts).
  const literalTitle = src.match(/<title>([^<]+)<\/title>/);
  if (literalTitle) candidates.push(literalTitle[1]);

  if (candidates.length === 0) {
    // Nothing to check — likely the dynamic [competitor].astro file itself,
    // which delegates title to the collection entry (audited separately).
    return null;
  }

  const allTitlesLower = candidates.join(" || ").toLowerCase();
  const hasRequiredToken = COMPARE_TITLE_REQUIRED_TOKENS.some((tok) =>
    allTitlesLower.includes(tok),
  );
  if (!hasRequiredToken) {
    return candidates[0];
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
      if (!isYmylPage(src, file)) continue;
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

        // Rule TITLE: §12.7.10 — comparison-page titles must contain "vs
        // RentLedger" or "alternative". Audit checks the static title fields
        // (frontmatter / H1 / literal <title>); the dynamic [competitor].astro
        // page delegates title to the collection entry, which IS audited.
        const failingTitle = checkCompareTitlePattern(src, file);
        if (failingTitle) {
          errors.push(
            `${rel}: comparison-page title "${failingTitle}" does not ` +
              `contain "vs RentLedger" or "alternative" (§12.7.10). ` +
              `Comparison pages must signal context in the title to ` +
              `defeat any "endorsement by association" implication.`,
          );
        }
      }

      // Rule TRADE-LIBEL: §12.7.2 — forbidden phrasings about competitors.
      // Applies to all YMYL pages, since YMYL captures /compare/* + any
      // page making competitor claims. Markdown blockquote escape hatch
      // built into the matcher.
      const tradeLibelHits = findTradeLibelHits(src);
      if (tradeLibelHits.length > 0) {
        for (const hit of tradeLibelHits) {
          errors.push(
            `${rel}: forbidden phrasing per §12.7.2 — "${hit.phrase}". ` +
              `Soften to observation framing ("we found", "users have ` +
              `reported", "in our view"). Line: ${hit.line}`,
          );
        }
      }

      // Rule PTIN: §12.7.9 — phrasings that imply RentLedger prepares
      // taxes on the user's behalf risk reclassifying the app as a tax-
      // return-preparer under IRS Circular 230 + 26 USC §7701(a)(36).
      const ptinHits = findPtinHits(src);
      if (ptinHits.length > 0) {
        for (const phrase of ptinHits) {
          errors.push(
            `${rel}: forbidden marketing phrasing per §12.7.9 — "${phrase}". ` +
              `Use "generates a Schedule E PDF from data you've entered" or ` +
              `equivalent. RentLedger formats and transmits; the user is the ` +
              `preparer of record.`,
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
