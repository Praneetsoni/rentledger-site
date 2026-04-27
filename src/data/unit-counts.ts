import { z } from "zod";
import { VerifiedFieldSchema, validateAll, type VerifiedField } from "./types";

// Per SEO-PLAYBOOK §12.2: each scale bucket requires 7 VerifiedFields.
// `/bookkeeping-for/[scale]-rentals` is the M3.3 pilot template — these
// are the first 5 programmatic pages that will go live in production.
// Real data is collected during M3.3 staged rollout per §12.5.

export const ScaleSchema = z.object({
  /** URL slug, e.g. "single-property", "5-to-9". Used for `/bookkeeping-for/[scale]-rentals/`. */
  slug: z.string().min(1),
  /** Display title used in <h1>, e.g. "Single Property". */
  name: z.string().min(1),
  placeholder: z.boolean(),
  scaleDescription: VerifiedFieldSchema,
  typicalWorkflow: VerifiedFieldSchema,
  timeBudget: VerifiedFieldSchema,
  toolComparison: VerifiedFieldSchema,
  costMath: VerifiedFieldSchema,
  needBookkeeperAnswer: VerifiedFieldSchema,
  workedExample: z.string().min(150),
});

export type ScaleData = z.infer<typeof ScaleSchema>;

const TODAY = new Date().toISOString().slice(0, 10);

const placeholderField: VerifiedField = {
  value: "TBD — populate before publish",
  source: "https://www.bls.gov/oes/current/oes433031.htm",
  verified: TODAY,
  verifiedBy: "claude",
  notes: "Placeholder. Real data collection happens in M3.3 pilot.",
};

const placeholderScale = (slug: string, name: string): ScaleData => ({
  slug,
  name,
  placeholder: true,
  scaleDescription: placeholderField,
  typicalWorkflow: placeholderField,
  timeBudget: placeholderField,
  toolComparison: placeholderField,
  costMath: placeholderField,
  needBookkeeperAnswer: placeholderField,
  workedExample:
    "Placeholder worked example. The real version will run 150+ words walking through monthly + year-end bookkeeping at this scale: hours per month, tooling cost stack (RentLedger vs spreadsheet vs QuickBooks vs CPA-on-retainer), break-even math against bookkeeper rates from BLS data, and a representative end-to-end workflow. Real data verified during M3.3 pilot.",
});

// 5 scale buckets per playbook §M1.3 / §12.2 spec.
const SCALES: Array<[string, string]> = [
  ["single-property", "Single Property"],
  ["2-to-4", "2 to 4 Units"],
  ["5-to-9", "5 to 9 Units"],
  ["10-plus", "10 or More Units"],
  ["accidental", "Accidental Landlord"],
];

const _scalesRecord: Record<string, ScaleData> = Object.fromEntries(
  SCALES.map(([slug, name]) => [slug, placeholderScale(slug, name)]),
);

export const scales = validateAll(
  _scalesRecord,
  (entry) => ScaleSchema.parse(entry),
  "unit-counts.ts",
);
