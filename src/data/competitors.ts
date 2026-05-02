import { z } from "zod";
import { validateAll } from "./types";

// `/compare/[competitor]` is more bespoke than the data-driven programmatic
// pages — each comparison is a hand-curated narrative + feature matrix.
// This file is the source of truth for which competitors have a /compare/
// page, with metadata used by the template (canonical name, sameAs URL,
// pricing snapshot, feature matrix). Per playbook §6.0 the first 10 ship
// during M3.3 pilot and the broader content cadence.

export const CompetitorSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  /** Optional canonical URL for Review.itemReviewed.sameAs. */
  sameAs: z.url().optional(),
  /** True until the comparison narrative + feature matrix has been written. */
  placeholder: z.boolean(),
  /** One-line tagline used as <meta description> + Review.reviewBody seed. */
  tagline: z.string().min(1),
  /** Pricing snapshot used as a comparison row + visible on the page. */
  pricingSnapshot: z.string().min(1),
});

export type CompetitorData = z.infer<typeof CompetitorSchema>;

// Competitors per playbook §6.0 60-article topic mix → "Additional /compare/* pages":
// Avail, Baselane, Landlord Studio, Landlordy, Rentec Direct, RentRedi,
// Google Sheets, Excel, Wave, FreshBooks. Stessa added (canonical RE-tracking
// competitor in the AI wedge). QuickBooks added per playbook §M2.2 Slot 2.
// Placeholders ship `placeholder: true` so the template can filter them
// until comparison content is written; once a hand-written narrative lands
// in src/content/compare/<slug>.mdx the route renders that body and the
// page becomes indexable regardless of this flag.
const COMPETITORS: CompetitorData[] = [
  {
    slug: "quickbooks",
    name: "QuickBooks",
    sameAs: "https://quickbooks.intuit.com/",
    placeholder: false,
    tagline:
      "Intuit's general-business accounting platform — built for service businesses and SMBs, occasionally retrofitted for rentals via class/location tracking on the Plus and Advanced tiers.",
    pricingSnapshot:
      "Simple Start $38/mo, Essentials $75/mo, Plus $115/mo, Advanced $275/mo (verified 2026-05-01)",
  },
  {
    slug: "stessa",
    name: "Stessa",
    sameAs: "https://www.stessa.com/",
    placeholder: true,
    tagline:
      "Free real-estate accounting platform from Roofstock — bank-syncing dashboard for portfolio landlords.",
    pricingSnapshot: "Free tier; paid Pro ~$20/mo (verify before publish)",
  },
  {
    slug: "avail",
    name: "Avail",
    sameAs: "https://www.avail.co/",
    placeholder: true,
    tagline:
      "Realtor.com-owned tenant-portal-first platform with rent collection, lease templates, and credit reporting.",
    pricingSnapshot:
      "Free Unlimited tier; Plus ~$9/unit/mo (verify before publish)",
  },
  {
    slug: "baselane",
    name: "Baselane",
    sameAs: "https://www.baselane.com/",
    placeholder: true,
    tagline:
      "Banking-first stack for landlords — built around an FDIC-insured business checking account with bookkeeping bolted on.",
    pricingSnapshot:
      "Free; banking-product-led monetization (verify before publish)",
  },
  {
    slug: "landlord-studio",
    name: "Landlord Studio",
    sameAs: "https://www.landlordstudio.com/",
    placeholder: true,
    tagline:
      "Mobile-first landlord accounting with receipt scanning, mileage tracking, and a tenant portal.",
    pricingSnapshot:
      "Free up to 3 units; paid tiers from $12/mo (verify before publish)",
  },
  {
    slug: "landlordy",
    name: "Landlordy",
    sameAs: "https://landlordy.com/",
    placeholder: true,
    tagline:
      "Long-running iOS-first landlord app — closest existing analog to RentLedger's positioning, but aging and no Schedule E export.",
    pricingSnapshot: "Lifetime $39.99 IAP (verify before publish)",
  },
  {
    slug: "rentec-direct",
    name: "Rentec Direct",
    sameAs: "https://www.rentecdirect.com/",
    placeholder: true,
    tagline:
      "Property-management software aimed at mid-portfolio landlords — heavier feature set, web-only, monthly subscription.",
    pricingSnapshot: "From $45/mo for first 10 units (verify before publish)",
  },
  {
    slug: "rentredi",
    name: "RentRedi",
    sameAs: "https://rentredi.com/",
    placeholder: true,
    tagline:
      "Tenant-screening + rent-collection platform with mobile apps; partnered with REI Hub for accounting.",
    pricingSnapshot:
      "From $20/mo annual / $30/mo monthly (verify before publish)",
  },
  {
    slug: "google-sheets",
    name: "Google Sheets",
    placeholder: true,
    tagline:
      "The default spreadsheet most landlords start with — free, flexible, and exactly the workflow RentLedger replaces.",
    pricingSnapshot: "Free with a Google account",
  },
  {
    slug: "excel",
    name: "Microsoft Excel",
    placeholder: true,
    tagline:
      "The spreadsheet landlords graduate to when Sheets stops scaling — desktop-grade formulas, no built-in tax-form workflow.",
    pricingSnapshot: "$70/yr Microsoft 365 Personal (verify before publish)",
  },
  {
    slug: "wave",
    name: "Wave",
    sameAs: "https://www.waveapps.com/",
    placeholder: true,
    tagline:
      "Free small-business accounting platform with bank sync — built for service businesses, occasionally repurposed for rentals.",
    pricingSnapshot:
      "Free; paid add-ons for payroll + payments (verify before publish)",
  },
  {
    slug: "freshbooks",
    name: "FreshBooks",
    sameAs: "https://www.freshbooks.com/",
    placeholder: true,
    tagline:
      "Cloud accounting for service-business owners — invoicing-first, tracks expenses, lacks rental-specific Schedule E mapping.",
    pricingSnapshot: "From $19/mo Lite (verify before publish)",
  },
];

const _competitorsRecord: Record<string, CompetitorData> = Object.fromEntries(
  COMPETITORS.map((c) => [c.slug, c]),
);

export const competitors = validateAll(
  _competitorsRecord,
  (entry) => CompetitorSchema.parse(entry),
  "competitors.ts",
);
