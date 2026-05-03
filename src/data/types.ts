import { z } from "zod";

// Per SEO-PLAYBOOK §12.1: every factual claim on a programmatic or content
// page is a typed VerifiedField. Build fails if any field is malformed,
// missing a source URL, or older than 365 days.
//
// The page template references a field's `value` in prose and emits a
// numbered citation with `source` URL in the page footer. `verified` and
// `verifiedBy` feed Article.dateModified and Article.reviewedBy schema.
//
// Two staleness thresholds:
//   - default 365 days for stable factual data (IRS Pub references, etc.)
//   - 90 days for `kind: "pricing"` per §12.7.3 — competitor pricing pages
//     change frequently, and stale price claims are the most common path
//     to a "false advertising" complaint.

const VerifiedFieldBase = z.object({
  value: z.string().min(1),
  source: z.url(),
  verified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "verified must be ISO date (YYYY-MM-DD)",
  }),
  verifiedBy: z.enum(["praneet", "claude"]),
  notes: z.string().optional(),
  /** Tag for category-specific staleness rules. Pricing fields use a 90-day
   * threshold (§12.7.3); state-tax fields use 180 days (§12.7.4); default
   * is 365 days. Add new kinds sparingly — the goal is to encode policy in
   * code, not to proliferate classifications. */
  kind: z.enum(["pricing", "state-tax"]).optional(),
});

function stalenessThresholdDays(kind: VerifiedField["kind"]): number {
  switch (kind) {
    case "pricing":
      return 90;
    case "state-tax":
      return 180;
    default:
      return 365;
  }
}

export const VerifiedFieldSchema = VerifiedFieldBase.refine(
  (d) => {
    const daysOld = (Date.now() - new Date(d.verified).getTime()) / 86_400_000;
    return daysOld <= stalenessThresholdDays(d.kind);
  },
  {
    // Zod v4 requires a static error message; runtime kind-specific
    // thresholds (90 / 180 / 365 days) are documented inline so the
    // message is informative even though it's static. Re-verify per
    // §12.7.3 (pricing) / §12.7.4 (state-tax) / §12.4 (default).
    message:
      "VerifiedField is stale: pricing > 90 days, state-tax > 180 days, default > 365 days. Re-verify against the primary source per SEO-PLAYBOOK §12.0 / §12.4 / §12.7.3.",
  },
);

export type VerifiedField = z.infer<typeof VerifiedFieldBase>;

/**
 * Validates a VerifiedField at module-evaluation time. Used by data files
 * (states.ts, property-types.ts, unit-counts.ts) so any stale or malformed
 * entry fails the build the moment Astro imports the data file.
 */
export function vf(field: VerifiedField): VerifiedField {
  return VerifiedFieldSchema.parse(field);
}

/**
 * Pricing-specific factory — sets `kind: "pricing"` so the 90-day staleness
 * threshold from §12.7.3 applies. Use this for every `$N` price claim on
 * the site (RentLedger or competitor); never hard-code prices in prose.
 */
export function pricingVerifiedField(
  field: Omit<VerifiedField, "kind">,
): VerifiedField {
  return VerifiedFieldSchema.parse({ ...field, kind: "pricing" as const });
}

/** Per SEO-PLAYBOOK §12.1 / §12.7.3 / §12.7.4: warn when a field is within
 * ~80% of its kind-specific staleness threshold (still valid, stale soon),
 * fail at the threshold (Zod refine). Logged once per field at module load. */
function warnIfAging(field: VerifiedField, location: string): void {
  const daysOld =
    (Date.now() - new Date(field.verified).getTime()) / 86_400_000;
  const max = stalenessThresholdDays(field.kind);
  const warnFloor = Math.floor(max * 0.8); // 365→292, 180→144, 90→72
  if (daysOld > warnFloor && daysOld <= max) {
    // eslint-disable-next-line no-console
    console.warn(
      `[VerifiedField] ${location} verified ${field.verified} (${Math.floor(daysOld)} days old, kind=${field.kind ?? "default"}) — re-verify before it crosses ${max} days.`,
    );
  }
}

/**
 * Validates an entire data record (e.g. all 50 states) up front so a build
 * never half-renders pages from broken data. Also runs the 300-day staleness
 * warning per §12.1 — visible in build logs.
 */
export function validateAll<T extends Record<string, unknown>>(
  records: T,
  perRecordValidator: (entry: T[keyof T]) => void,
  location: string,
): T {
  for (const [key, entry] of Object.entries(records)) {
    try {
      perRecordValidator(entry as T[keyof T]);
    } catch (err) {
      throw new Error(
        `[VerifiedField] entry '${key}' in ${location} failed validation: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    // Walk every field on the record; if it parses as a VerifiedField, check age.
    if (entry && typeof entry === "object") {
      for (const [fieldName, fieldValue] of Object.entries(entry)) {
        const parsed = VerifiedFieldSchema.safeParse(fieldValue);
        if (parsed.success) {
          warnIfAging(parsed.data, `${location}.${key}.${fieldName}`);
        }
      }
    }
  }
  return records;
}
