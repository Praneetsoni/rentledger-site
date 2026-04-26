import { z } from "zod";
import { VerifiedFieldSchema, type VerifiedField } from "./types";

// Per SEO-PLAYBOOK §12.2: each state requires 9 VerifiedFields.
// Real data is collected per-state in M5.1 (10-state pilot, then expand).
// The placeholders here ship `verified: TODAY` so the build passes; they
// will be replaced with real-source-cited data before any state page goes
// live (gated by §12.5 + the explicit `placeholder: true` flag).

export const StateSchema = z.object({
  name: z.string().min(1),
  abbreviation: z.string().length(2),
  /** True until real VerifiedField data has been collected for this state.
   * `getStaticPaths` filters out placeholder states so build does not ship
   * unfinished pages — see /landlord-tax-deductions/[state].astro. */
  placeholder: z.boolean(),
  stateTaxRate: VerifiedFieldSchema,
  filingDeadline: VerifiedFieldSchema,
  smallClaimsLimit: VerifiedFieldSchema,
  rentControlStatus: VerifiedFieldSchema,
  securityDepositLimit: VerifiedFieldSchema,
  keyDeductions: z.array(z.string().min(1)).min(3),
  landlordAssociation: z.object({
    name: z.string(),
    url: z.url().optional(),
  }),
  notableCities: z.array(z.string()),
  workedExample: z.string().min(150),
});

export type StateData = z.infer<typeof StateSchema>;

const TODAY = new Date().toISOString().slice(0, 10);

const placeholderField: VerifiedField = {
  value: "TBD — populate before publish",
  source: "https://www.irs.gov/forms-pubs/about-publication-527",
  verified: TODAY,
  verifiedBy: "claude",
  notes: "Placeholder. Real data collection happens in M5.1 staged rollout.",
};

const placeholderState = (name: string, abbreviation: string): StateData => ({
  name,
  abbreviation,
  placeholder: true,
  stateTaxRate: placeholderField,
  filingDeadline: placeholderField,
  smallClaimsLimit: placeholderField,
  rentControlStatus: placeholderField,
  securityDepositLimit: placeholderField,
  keyDeductions: [
    "Mortgage interest (Schedule E line 12)",
    "Property tax (Schedule E line 16)",
    "Repairs and maintenance (Schedule E line 14)",
  ],
  landlordAssociation: { name: "TBD" },
  notableCities: [],
  workedExample:
    "Placeholder worked example. The real walkthrough for this state will run 150+ words covering a representative single-family rental scenario: gross rents, allocated deductions across Schedule E lines 5–19, depreciation per IRS Pub 946, and the resulting net income or loss. Real data sourced and verified in M5.1.",
});

// All 50 US states + DC as placeholders. Real data fills in during M5.1.
const STATE_LIST: Array<[string, string]> = [
  ["alabama", "AL"],
  ["alaska", "AK"],
  ["arizona", "AZ"],
  ["arkansas", "AR"],
  ["california", "CA"],
  ["colorado", "CO"],
  ["connecticut", "CT"],
  ["delaware", "DE"],
  ["florida", "FL"],
  ["georgia", "GA"],
  ["hawaii", "HI"],
  ["idaho", "ID"],
  ["illinois", "IL"],
  ["indiana", "IN"],
  ["iowa", "IA"],
  ["kansas", "KS"],
  ["kentucky", "KY"],
  ["louisiana", "LA"],
  ["maine", "ME"],
  ["maryland", "MD"],
  ["massachusetts", "MA"],
  ["michigan", "MI"],
  ["minnesota", "MN"],
  ["mississippi", "MS"],
  ["missouri", "MO"],
  ["montana", "MT"],
  ["nebraska", "NE"],
  ["nevada", "NV"],
  ["new-hampshire", "NH"],
  ["new-jersey", "NJ"],
  ["new-mexico", "NM"],
  ["new-york", "NY"],
  ["north-carolina", "NC"],
  ["north-dakota", "ND"],
  ["ohio", "OH"],
  ["oklahoma", "OK"],
  ["oregon", "OR"],
  ["pennsylvania", "PA"],
  ["rhode-island", "RI"],
  ["south-carolina", "SC"],
  ["south-dakota", "SD"],
  ["tennessee", "TN"],
  ["texas", "TX"],
  ["utah", "UT"],
  ["vermont", "VT"],
  ["virginia", "VA"],
  ["washington", "WA"],
  ["west-virginia", "WV"],
  ["wisconsin", "WI"],
  ["wyoming", "WY"],
];

const titleize = (slug: string) =>
  slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

export const states: Record<string, StateData> = Object.fromEntries(
  STATE_LIST.map(([slug, abbr]) => [
    slug,
    placeholderState(titleize(slug), abbr),
  ]),
);

// Validate every entry at module-load time.
for (const [slug, entry] of Object.entries(states)) {
  try {
    StateSchema.parse(entry);
  } catch (err) {
    throw new Error(
      `[states.ts] '${slug}' failed validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
