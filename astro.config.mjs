import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { competitors } from "./src/data/competitors.ts";
import { states } from "./src/data/states.ts";
import { propertyTypes } from "./src/data/property-types.ts";
import { scales } from "./src/data/unit-counts.ts";

const SITE = "https://rentledger.org";

// Per SEO-PLAYBOOK §M1.4: exclude noindex pages from the sitemap so search
// engines don't see URLs the rendered HTML tells them to ignore (mixed
// signals slow indexing). The set is computed at build time from the same
// data files that drive each programmatic template's `noindex` prop, so
// the sitemap stays in sync with the rendered <meta name="robots"> tag
// without per-page wiring.
//
// What gets excluded:
// - /404/ (always noindex)
// - any /compare/[slug]/ where the competitor is `placeholder: true`
// - any /landlord-tax-deductions/[slug]/ where the state is `placeholder: true`
// - any /bookkeeping-for/[slug]-rentals/ where the scale is `placeholder: true`
// - any /schedule-e-guide/[slug]/ where the property type is `placeholder: true`
// - parent index pages (/blog/, /compare/, /landlord-tax-deductions/,
//   /bookkeeping-for/, /schedule-e-guide/) while their underlying data is
//   all-placeholder. They auto-flip to indexable as soon as a non-placeholder
//   entry exists, mirroring the runtime noindex behavior.
const noindexUrls = new Set([`${SITE}/404/`]);

for (const c of Object.values(competitors)) {
  if (c.placeholder) noindexUrls.add(`${SITE}/compare/${c.slug}/`);
}
for (const [slug, s] of Object.entries(states)) {
  if (s.placeholder)
    noindexUrls.add(`${SITE}/landlord-tax-deductions/${slug}/`);
}
for (const s of Object.values(scales)) {
  if (s.placeholder)
    noindexUrls.add(`${SITE}/bookkeeping-for/${s.slug}-rentals/`);
}
for (const [slug, t] of Object.entries(propertyTypes)) {
  if (t.placeholder) noindexUrls.add(`${SITE}/schedule-e-guide/${slug}/`);
}

const allCompetitorsPlaceholder = Object.values(competitors).every(
  (c) => c.placeholder,
);
const allStatesPlaceholder = Object.values(states).every((s) => s.placeholder);
const allScalesPlaceholder = Object.values(scales).every((s) => s.placeholder);
const allPropertyTypesPlaceholder = Object.values(propertyTypes).every(
  (t) => t.placeholder,
);

if (allCompetitorsPlaceholder) noindexUrls.add(`${SITE}/compare/`);
if (allStatesPlaceholder) noindexUrls.add(`${SITE}/landlord-tax-deductions/`);
if (allScalesPlaceholder) noindexUrls.add(`${SITE}/bookkeeping-for/`);
if (allPropertyTypesPlaceholder) noindexUrls.add(`${SITE}/schedule-e-guide/`);

// /blog/ is noindex while no PUBLISHED (non-draft) posts exist. The sitemap
// integration runs at config-resolve time, before the content layer is
// initialized — `getCollection` isn't available here. To stay in sync with
// the runtime check (`blog/index.astro` uses `posts.length === 0` after the
// `!data.draft` filter), we walk the blog source directory ourselves and
// parse just enough frontmatter to honor `draft: true`. Mirrors the
// content-collection schema in src/content.config.ts.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const blogDir = new URL("./src/content/blog", import.meta.url).pathname;

function blogHasPublishedPosts(dir) {
  if (!existsSync(dir)) return false;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (blogHasPublishedPosts(full)) return true;
      continue;
    }
    if (!/\.(md|mdx)$/.test(entry)) continue;
    const src = readFileSync(full, "utf8");
    // Frontmatter block: between the first two `---` lines.
    const fm = src.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    // Match `draft: true` (with optional surrounding whitespace) on its own line.
    // Anything else — `draft: false`, missing field, quoted variations — is
    // treated as published, matching the Zod schema's `.default(false)`.
    const isDraft = /^[ \t]*draft:[ \t]*true[ \t]*$/m.test(fm[1]);
    if (!isDraft) return true;
  }
  return false;
}

if (!blogHasPublishedPosts(blogDir)) noindexUrls.add(`${SITE}/blog/`);

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [
    sitemap({
      filter: (page) => !noindexUrls.has(page),
    }),
    mdx(),
  ],
});
