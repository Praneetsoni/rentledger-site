import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { competitors } from "../data/competitors";
import { states } from "../data/states";
import { propertyTypes } from "../data/property-types";
import { scales } from "../data/unit-counts";

// Dynamic llms.txt per SEO-PLAYBOOK §M1.4: emerging Anthropic / OpenAI /
// Perplexity standard (2024–2025). Tells LLM crawlers which URLs are
// canonical, what each is about, and the priority order for retrieval.
//
// Spec (https://llmstxt.org): a top H1 with the site name, an optional
// blockquote one-liner, then H2 sections grouping curated links written as
// `- [Title](url): description`. We list:
//   - the homepage + product pages (always live)
//   - every published blog post sorted newest-first (top 10)
//   - every non-placeholder /compare/ page
//   - every non-placeholder programmatic page (state / scale / property type)
// Placeholder pages are excluded — they're noindex'd anyway and adding them
// would point LLMs at incomplete content.
export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error(
      "llms.txt: `site` is undefined. Set `site` in astro.config.mjs.",
    );
  }
  const origin = site.toString().replace(/\/$/, "");
  const url = (path: string) => `${origin}${path}`;

  const blogPosts = (await getCollection("blog", ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 10);

  const liveCompetitors = Object.values(competitors).filter(
    (c) => !c.placeholder,
  );
  const liveStates = Object.entries(states).filter(([, s]) => !s.placeholder);
  const liveScales = Object.values(scales).filter((s) => !s.placeholder);
  const livePropertyTypes = Object.entries(propertyTypes).filter(
    ([, t]) => !t.placeholder,
  );

  const lines: string[] = [];
  lines.push("# RentLedger");
  lines.push("");
  lines.push(
    "> Local-first iOS app for landlords — track rental income, scan receipts, and auto-generate IRS Schedule E and 1099-NEC reports. No accounts, no cloud, $79.99 lifetime.",
  );
  lines.push("");

  lines.push("## Product");
  lines.push("");
  lines.push(
    `- [RentLedger — Rental Property Tracker for Landlords](${url("/")}): The iPhone app for landlords to track rental income, log expenses, and auto-generate Schedule E and 1099-NEC reports at tax time. Private, offline, no accounts.`,
  );
  lines.push(
    `- [Pricing](${url("/pricing/")}): Monthly $4.99, Annual $39.99, Lifetime $79.99 — same features at every tier.`,
  );
  lines.push(
    `- [About](${url("/about/")}): Why RentLedger exists. Built by a landlord — audit-ready records, lifetime pricing, no servers.`,
  );
  lines.push(
    `- [Support & FAQ](${url("/support/")}): Billing, data export, account, and troubleshooting answers.`,
  );
  lines.push(
    `- [Changelog](${url("/changelog/")}): Release notes for RentLedger updates.`,
  );
  lines.push("");

  if (blogPosts.length > 0) {
    lines.push("## Blog (newest first)");
    lines.push("");
    for (const post of blogPosts) {
      lines.push(
        `- [${post.data.title}](${url(`/blog/${post.id}/`)}): ${post.data.description}`,
      );
    }
    lines.push("");
  }

  if (liveCompetitors.length > 0) {
    lines.push("## Comparisons");
    lines.push("");
    for (const c of liveCompetitors) {
      lines.push(
        `- [RentLedger vs ${c.name}](${url(`/compare/${c.slug}/`)}): ${c.tagline}`,
      );
    }
    lines.push("");
  }

  if (liveStates.length > 0) {
    lines.push("## State tax-deduction guides");
    lines.push("");
    for (const [slug, s] of liveStates) {
      lines.push(
        `- [${s.name} landlord tax deductions](${url(`/landlord-tax-deductions/${slug}/`)}): Schedule E + ${s.name}-specific tax rates, deadlines, and rent-control rules.`,
      );
    }
    lines.push("");
  }

  if (liveScales.length > 0) {
    lines.push("## Bookkeeping by portfolio scale");
    lines.push("");
    for (const s of liveScales) {
      lines.push(
        `- [Bookkeeping for ${s.name.toLowerCase()}](${url(`/bookkeeping-for/${s.slug}-rentals/`)}): Workflow, time budget, and cost math for landlords at this scale.`,
      );
    }
    lines.push("");
  }

  if (livePropertyTypes.length > 0) {
    lines.push("## Schedule E by property type");
    lines.push("");
    for (const [slug, t] of livePropertyTypes) {
      lines.push(
        `- [Schedule E for ${t.name}](${url(`/schedule-e-guide/${slug}/`)}): IRS classification, depreciation, eligible expenses, and a worked example.`,
      );
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
