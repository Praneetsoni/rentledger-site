import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

// Per SEO-PLAYBOOK §M1.3: every page in a content collection has typed
// frontmatter. Build fails if a page is missing required fields or if a
// field doesn't match the schema. This is the gate that prevents silent
// schema drift like the v2 redesign caused on /support/ FAQs.
//
// Astro 6 collection loaders read content from explicit paths; we keep
// the playbook's directory layout via `base: "./src/content/blog"` etc.

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const breadcrumbSchema = z.object({
  name: z.string().min(1),
  /** Path relative to site root, e.g. "/compare/". Omit for current page. */
  path: z.string().optional(),
});

// Editorial blog posts — guides, niche pages, launch posts. Live at /blog/[slug].
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Hero image relative to site root, e.g. "/images/blog/foo-hero.webp".
     * Used for OG preview AND Article.image. */
    heroImage: z.string().optional(),
    /** Always Praneet for v1 per Q5; field exists so future contributors can
     * be wired in without changing the schema. */
    author: z.string().default("Praneet Soni"),
    tags: z.array(z.string()).default([]),
    /**
     * Overrides the default schema type emitted on the rendered page.
     * Per SEO-PLAYBOOK §M1.3 frontmatter spec.
     * - `Article` (default) — standard editorial post; emits Article schema
     * - `HowTo` — step-by-step guide; renderer pulls steps from a `steps` field
     * - `Review` — comparison or review; renderer pulls itemReviewed from frontmatter
     * The default Article path covers ~95% of content. Override only when
     * the post's structure genuinely fits HowTo or Review.
     */
    schemaType: z.enum(["Article", "HowTo", "Review"]).default("Article"),
    /** Required when schemaType="HowTo". Optional when "Article" — when
     * provided alongside Article, layout emits both Article and HowTo
     * schema (used for guide-shaped articles like Slot 1 keystone).
     * Step text + optional image/url. */
    steps: z
      .array(
        z.object({
          name: z.string().min(1),
          text: z.string().min(1),
          image: z.string().optional(),
          url: z.string().optional(),
        }),
      )
      .optional(),
    /** Optional override for HowTo schema name when emitted alongside Article. */
    howToName: z.string().optional(),
    /** Optional override for HowTo schema description when emitted alongside Article. */
    howToDescription: z.string().optional(),
    /** True when Praneet has spot-checked the data per §12.3. Sets
     * Article.reviewedBy in the rendered schema. */
    reviewed: z.boolean().default(false),
    /** Optional FAQs rendered + emitted as FAQPage JSON-LD. */
    faqs: z.array(faqSchema).optional(),
    breadcrumbs: z.array(breadcrumbSchema).optional(),
    /** Optional integer count rendered in the article header chip row
     * (e.g., for stats roundups). Omit for posts without a count. */
    dataPoints: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

// Per-competitor narrative content for /compare/[competitor]. The competitor
// list itself lives in src/data/competitors.ts; the .mdx body here is the
// hand-written comparison narrative.
const compare = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/compare" }),
  schema: z.object({
    /** Must match a slug in src/data/competitors.ts. */
    competitorSlug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    /** Body of the review used as Review.reviewBody. */
    reviewBody: z.string().min(1),
    /** Optional rating block — only emit when honest, sourced rating exists. */
    reviewRating: z
      .object({
        ratingValue: z.number(),
        bestRating: z.number().optional(),
        worstRating: z.number().optional(),
      })
      .optional(),
    faqs: z.array(faqSchema).optional(),
    reviewed: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// The three programmatic-page templates (state, scale, property-type) read
// their data from src/data/*.ts rather than content collections — collections
// are reserved for hand-authored long-form content.

export const collections = { blog, compare };
