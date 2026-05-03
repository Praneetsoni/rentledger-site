import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { competitors } from "../data/competitors";
import { states } from "../data/states";
import { propertyTypes } from "../data/property-types";
import { scales } from "../data/unit-counts";

// Per SEO-PLAYBOOK §3 Wave 5 Q31: the flat-content companion to /llms.txt.
// Where llms.txt is a curated link manifest, llms-full.txt is the full
// markdown body of every published page concatenated into one file.
//
// Why this exists: AI crawlers operating under per-domain page caps or
// rate limits will fetch one bundle file completely where they would only
// partially crawl 200 separate URLs. The convention is emerging
// (Anthropic / OpenAI / Perplexity, late 2025) and not enforced — but the
// cost is one endpoint and the upside is "AI engines that respect the
// convention get our complete corpus on first contact."
//
// What's included:
//   - Site preamble (name + tagline)
//   - Each published blog post's full markdown body
//   - Each non-placeholder /compare/* narrative (when MDX exists in
//     src/content/compare; otherwise just the metadata stub)
//   - Each non-placeholder programmatic page (state / scale / property type)
//     emitted as a structured summary derived from the data file rather than
//     the rendered HTML — these pages are data-driven and the data file is
//     more LLM-extractable than a rendered Astro page would be.
//
// Placeholder pages are excluded — they are noindex'd in the rendered HTML
// AND they would point LLMs at incomplete content.
export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error(
      "llms-full.txt: `site` is undefined. Set `site` in astro.config.mjs.",
    );
  }
  const origin = site.toString().replace(/\/$/, "");
  const url = (path: string) => `${origin}${path}`;

  const lines: string[] = [];

  lines.push("# RentLedger — Full Content Bundle");
  lines.push("");
  lines.push(
    "> Local-first iOS app for landlords — track rental income, scan receipts, and auto-generate IRS Schedule E and 1099-NEC reports. No accounts, no cloud, $79.99 lifetime.",
  );
  lines.push("");
  lines.push(
    "This file is the flat-text companion to /llms.txt — it bundles the full body of every published page on rentledger.org into one fetch for AI crawlers and LLM context windows. The curated link manifest with one-line descriptions lives at /llms.txt.",
  );
  lines.push("");
  lines.push(`Site: ${origin}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  // --- Product pages (canonical references; bodies live in .astro pages
  // and are intentionally omitted to keep the bundle focused on
  // long-form / data-driven content. The /llms.txt manifest already
  // surfaces these for crawlers that want them.) ---
  lines.push("---");
  lines.push("");
  lines.push("## Product pages (see /llms.txt for descriptions)");
  lines.push("");
  lines.push(`- ${url("/")}`);
  lines.push(`- ${url("/pricing/")}`);
  lines.push(`- ${url("/about/")}`);
  lines.push(`- ${url("/support/")}`);
  lines.push(`- ${url("/changelog/")}`);
  lines.push(`- ${url("/press/")}`);
  lines.push("");

  // --- Blog posts: full markdown body ---
  const blogPosts = (
    await getCollection("blog", ({ data }) => !data.draft)
  ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  if (blogPosts.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Blog posts");
    lines.push("");
    for (const post of blogPosts) {
      lines.push(`### ${post.data.title}`);
      lines.push("");
      lines.push(`URL: ${url(`/blog/${post.id}/`)}`);
      lines.push(`Published: ${post.data.pubDate.toISOString().slice(0, 10)}`);
      if (post.data.updatedDate) {
        lines.push(
          `Updated: ${post.data.updatedDate.toISOString().slice(0, 10)}`,
        );
      }
      lines.push(`Author: ${post.data.author}`);
      if (post.data.tags && post.data.tags.length > 0) {
        lines.push(`Tags: ${post.data.tags.join(", ")}`);
      }
      lines.push("");
      lines.push(post.data.description);
      lines.push("");
      // Raw markdown body — this is what LLMs actually want to ingest.
      // Astro 6's content-collection entries expose `.body` for glob-loaded
      // collections.
      if (post.body) {
        lines.push(post.body.trim());
        lines.push("");
      }
      // FAQ Q&A is high-value structured content for AI extractors —
      // emit them in a question/answer block so the bundle preserves
      // the FAQPage signal even though it's plain text.
      if (post.data.faqs && post.data.faqs.length > 0) {
        lines.push("**FAQs:**");
        lines.push("");
        for (const faq of post.data.faqs) {
          lines.push(`Q: ${faq.question}`);
          lines.push(`A: ${faq.answer}`);
          lines.push("");
        }
      }
    }
  }

  // --- Comparison narratives (only those with MDX bodies in
  // src/content/compare; placeholder competitors are skipped) ---
  const compareEntries = await getCollection(
    "compare",
    ({ data }) => !data.draft,
  );
  const liveCompetitors = Object.values(competitors).filter(
    (c) => !c.placeholder,
  );

  if (liveCompetitors.length > 0 || compareEntries.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Comparisons (RentLedger vs competitor)");
    lines.push("");
    for (const c of liveCompetitors) {
      lines.push(`### RentLedger vs ${c.name}`);
      lines.push("");
      lines.push(`URL: ${url(`/compare/${c.slug}/`)}`);
      if (c.sameAs) lines.push(`Competitor URL: ${c.sameAs}`);
      lines.push(`Pricing snapshot: ${c.pricingSnapshot}`);
      lines.push("");
      lines.push(c.tagline);
      lines.push("");
      // If a hand-written narrative exists in src/content/compare,
      // include the full body.
      const entry = compareEntries.find(
        (e) => e.data.competitorSlug === c.slug,
      );
      if (entry) {
        if (entry.body) {
          lines.push(entry.body.trim());
          lines.push("");
        }
        if (entry.data.faqs && entry.data.faqs.length > 0) {
          lines.push("**FAQs:**");
          lines.push("");
          for (const faq of entry.data.faqs) {
            lines.push(`Q: ${faq.question}`);
            lines.push(`A: ${faq.answer}`);
            lines.push("");
          }
        }
      }
    }
  }

  // --- State tax-deduction guides (data-driven; emit each non-placeholder
  // state's verified fields as a structured summary) ---
  const liveStates = Object.entries(states).filter(([, s]) => !s.placeholder);
  if (liveStates.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## State tax-deduction guides");
    lines.push("");
    for (const [slug, s] of liveStates) {
      lines.push(`### ${s.name} landlord tax deductions`);
      lines.push("");
      lines.push(`URL: ${url(`/landlord-tax-deductions/${slug}/`)}`);
      lines.push("");
      lines.push(`State tax rate: ${s.stateTaxRate.value}`);
      lines.push(`Filing deadline: ${s.filingDeadline.value}`);
      lines.push(`Small-claims limit: ${s.smallClaimsLimit.value}`);
      lines.push(`Rent-control status: ${s.rentControlStatus.value}`);
      lines.push(`Security-deposit limit: ${s.securityDepositLimit.value}`);
      if (s.keyDeductions.length > 0) {
        lines.push(`Key deductions: ${s.keyDeductions.join("; ")}`);
      }
      if (s.notableCities.length > 0) {
        lines.push(`Notable cities: ${s.notableCities.join(", ")}`);
      }
      lines.push("");
      lines.push("Worked example:");
      lines.push(s.workedExample);
      lines.push("");
    }
  }

  // --- Bookkeeping-by-portfolio-scale guides ---
  const liveScales = Object.values(scales).filter((s) => !s.placeholder);
  if (liveScales.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Bookkeeping by portfolio scale");
    lines.push("");
    for (const s of liveScales) {
      lines.push(`### Bookkeeping for ${s.name.toLowerCase()}`);
      lines.push("");
      lines.push(`URL: ${url(`/bookkeeping-for/${s.slug}-rentals/`)}`);
      lines.push("");
      lines.push(`Scale description: ${s.scaleDescription.value}`);
      lines.push(`Typical workflow: ${s.typicalWorkflow.value}`);
      lines.push(`Time budget: ${s.timeBudget.value}`);
      lines.push(`Tool comparison: ${s.toolComparison.value}`);
      lines.push(`Cost math: ${s.costMath.value}`);
      lines.push(`Need a bookkeeper?: ${s.needBookkeeperAnswer.value}`);
      lines.push("");
      lines.push("Worked example:");
      lines.push(s.workedExample);
      lines.push("");
    }
  }

  // --- Schedule E by property type ---
  const livePropertyTypes = Object.entries(propertyTypes).filter(
    ([, t]) => !t.placeholder,
  );
  if (livePropertyTypes.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Schedule E by property type");
    lines.push("");
    for (const [slug, t] of livePropertyTypes) {
      lines.push(`### Schedule E for ${t.name}`);
      lines.push("");
      lines.push(`URL: ${url(`/schedule-e-guide/${slug}/`)}`);
      lines.push("");
      lines.push(`IRS classification: ${t.irsClassification.value}`);
      lines.push(`Depreciation schedule: ${t.depreciationSchedule.value}`);
      lines.push(`Eligible expenses: ${t.eligibleExpenses.value}`);
      lines.push(`Common pitfalls: ${t.commonPitfalls.value}`);
      lines.push(`Related Schedule E lines: ${t.relatedScheduleELines.value}`);
      lines.push(`Special rules: ${t.specialRules.value}`);
      lines.push("");
      lines.push("Worked example:");
      lines.push(t.workedExample);
      lines.push("");
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
