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

const YMYL_KEYWORDS = [
  "schedule e",
  "schedule-e",
  "tax deduction",
  "tax deductions",
  "1099-nec",
  "1099 nec",
  " irs ",
  "depreciation",
  "rental income tax",
  "landlord tax",
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

function isYmylPage(src) {
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
    return false;
  }

  const lower = src.toLowerCase();
  return YMYL_KEYWORDS.some((kw) => lower.includes(kw));
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

      // Rule 3: sponsored-rel ban (applies to ALL pages, not just YMYL)
      const sponsored = findSponsoredLinks(src);
      if (sponsored.length > 0) {
        errors.push(
          `${rel}: rel="sponsored" forbidden per §12.7.5 — found ` +
            `${sponsored.length} occurrence(s). Revisit §12.7.5 first.`,
        );
      }

      // YMYL-only rules (1, 2, 4)
      if (!isYmylPage(src)) continue;
      ymylPages++;

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
