#!/usr/bin/env node
// Per SEO-PLAYBOOK §3 Wave 5 Q32: IndexNow ping on every successful build.
// Reads the just-built dist/sitemap-0.xml, extracts every <loc> URL, and
// POSTs the list to https://api.indexnow.org/indexnow. Bing + Yandex (and
// downstream Bing-derived AI crawlers) re-index the listed URLs within
// hours instead of waiting for their next scheduled crawl.
//
// Self-published key verification (per IndexNow spec): the host serves a
// plaintext file at /<key>.txt containing exactly the key string. The
// IndexNow service fetches this file to confirm we own the host before
// honoring submitted URLs. The key file lives at public/<key>.txt.
//
// Failure modes (intentional non-fatal handling):
// - sitemap missing → log + exit 0 (build hasn't run yet)
// - network/HTTP failure → log + exit 0 (don't break a successful build
//   over a flaky third-party POST)
// - non-2xx response → log + exit 0
// Manual re-run anytime: `node scripts/indexnow-ping.mjs`.
//
// To skip in environments where this is undesirable (e.g. previews):
//   INDEXNOW_SKIP=1 node scripts/indexnow-ping.mjs

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const KEY = "9d5d448a2d994049bac73e32b3564aa3";
const HOST = "rentledger.org";
const SITEMAP = join(process.cwd(), "dist", "sitemap-0.xml");
const ENDPOINT = "https://api.indexnow.org/indexnow";

if (process.env.INDEXNOW_SKIP === "1") {
  console.log("[indexnow] Skipped (INDEXNOW_SKIP=1).");
  process.exit(0);
}

if (!existsSync(SITEMAP)) {
  console.warn(
    `[indexnow] No sitemap at ${SITEMAP} — skipping (run after \`astro build\`).`,
  );
  process.exit(0);
}

const sitemapXml = readFileSync(SITEMAP, "utf8");
// Pull every <loc>...</loc> URL. The sitemap is small (< 100 URLs) so a
// regex is fine; an XML parser would be overkill.
const urls = Array.from(
  sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g),
  (m) => m[1],
).filter((u) => u.startsWith(`https://${HOST}`));

if (urls.length === 0) {
  console.warn("[indexnow] Sitemap parsed but no URLs found — skipping.");
  process.exit(0);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: urls,
};

console.log(
  `[indexnow] Submitting ${urls.length} URL${urls.length === 1 ? "" : "s"} to ${ENDPOINT}…`,
);

try {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    console.log(`[indexnow] OK — HTTP ${res.status}.`);
  } else {
    const text = await res.text().catch(() => "");
    console.warn(
      `[indexnow] HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""} — non-fatal, continuing.`,
    );
  }
} catch (err) {
  console.warn(
    `[indexnow] Network error: ${err?.message ?? err} — non-fatal, continuing.`,
  );
}

// Always exit 0 — see "Failure modes" comment at top.
process.exit(0);
