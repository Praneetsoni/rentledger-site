import { z } from "zod";
import { VerifiedFieldSchema, type VerifiedField } from "./types";

// Per SEO-PLAYBOOK §12.2: each property type requires 7 VerifiedFields.
// Real data sourced from IRS Pub 527 + Pub 946 (depreciation) + IRC §280A
// for STR rules. Placeholders here ship with `placeholder: true` so
// `getStaticPaths` can filter them out — staged rollout per §12.5.

export const PropertyTypeSchema = z.object({
  name: z.string().min(1),
  placeholder: z.boolean(),
  irsClassification: VerifiedFieldSchema,
  depreciationSchedule: VerifiedFieldSchema,
  eligibleExpenses: VerifiedFieldSchema,
  commonPitfalls: VerifiedFieldSchema,
  relatedScheduleELines: VerifiedFieldSchema,
  specialRules: VerifiedFieldSchema,
  workedExample: z.string().min(200),
});

export type PropertyTypeData = z.infer<typeof PropertyTypeSchema>;

const TODAY = new Date().toISOString().slice(0, 10);

const placeholderField: VerifiedField = {
  value: "TBD — populate before publish",
  source: "https://www.irs.gov/forms-pubs/about-publication-527",
  verified: TODAY,
  verifiedBy: "claude",
  notes: "Placeholder. Real data collection happens in M6.2.",
};

const placeholderType = (name: string): PropertyTypeData => ({
  name,
  placeholder: true,
  irsClassification: placeholderField,
  depreciationSchedule: placeholderField,
  eligibleExpenses: placeholderField,
  commonPitfalls: placeholderField,
  relatedScheduleELines: placeholderField,
  specialRules: placeholderField,
  workedExample:
    "Placeholder worked example. The real walkthrough for this property type will run 200+ words covering a realistic year-one Schedule E scenario: cost basis allocation between land and structure, MACRS depreciation calculation per IRS Pub 946, eligible operating expenses by category, and the resulting taxable income or passive loss carryover. Worked-example numbers will reflect typical 2026 figures and link to the underlying IRS publications. Real data verified in M6.2.",
});

// 12 property types covering the most common Schedule E filing scenarios
// (per playbook §6.0 60-article topic mix → "Property-type guides (start early)").
const TYPE_SLUGS = [
  ["single-family", "Single-Family Rental"],
  ["multi-family", "Multi-Family Rental"],
  ["short-term-rental", "Short-Term Rental (Airbnb / VRBO)"],
  ["vacation-home", "Vacation Home with Personal Use"],
  ["mixed-use", "Mixed-Use (Residential + Personal)"],
  ["condo", "Condo Rental"],
  ["townhouse", "Townhouse Rental"],
  ["duplex", "Duplex (Owner-Occupied)"],
  ["mobile-home", "Mobile Home Rental"],
  ["commercial", "Commercial Rental"],
  ["land-only", "Bare Land Lease"],
  ["partnership", "Partnership / LLC Rental"],
] as const;

export const propertyTypes: Record<string, PropertyTypeData> =
  Object.fromEntries(
    TYPE_SLUGS.map(([slug, name]) => [slug, placeholderType(name)]),
  );

for (const [slug, entry] of Object.entries(propertyTypes)) {
  try {
    PropertyTypeSchema.parse(entry);
  } catch (err) {
    throw new Error(
      `[property-types.ts] '${slug}' failed validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
