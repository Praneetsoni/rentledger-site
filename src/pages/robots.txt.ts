import type { APIRoute } from "astro";

// Dynamic robots.txt per SEO-PLAYBOOK §M1.4: generates from `Astro.site` so
// the sitemap URL can never drift from the configured site origin. Allows
// every UA, disallows the future `/drafts/` folder used to stage unpublished
// content during the daily-cadence editorial flow (§6.0). The sitemap is
// emitted by @astrojs/sitemap as `/sitemap-index.xml` (with a child
// `/sitemap-0.xml`), so we point crawlers at the index.
export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error(
      "robots.txt: `site` is undefined. Set `site` in astro.config.mjs.",
    );
  }

  const origin = site.toString().replace(/\/$/, "");

  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /drafts/",
    "",
    `Sitemap: ${origin}/sitemap-index.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
