import { z } from "zod";

// Per SEO-PLAYBOOK §12.1: every factual claim on a programmatic or content
// page is a typed VerifiedField. Build fails if any field is malformed,
// missing a source URL, or older than 365 days.
//
// The page template references a field's `value` in prose and emits a
// numbered citation with `source` URL in the page footer. `verified` and
// `verifiedBy` feed Article.dateModified and Article.reviewedBy schema.
export const VerifiedFieldSchema = z
  .object({
    value: z.string().min(1),
    source: z.url(),
    verified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "verified must be ISO date (YYYY-MM-DD)",
    }),
    verifiedBy: z.enum(["praneet", "claude"]),
    notes: z.string().optional(),
  })
  .refine(
    (d) => {
      const daysOld =
        (Date.now() - new Date(d.verified).getTime()) / 86_400_000;
      return daysOld <= 365;
    },
    {
      message:
        "VerifiedField is stale (> 365 days old). Re-verify before build.",
    },
  );

export type VerifiedField = z.infer<typeof VerifiedFieldSchema>;

/**
 * Validates a VerifiedField at module-evaluation time. Used by data files
 * (states.ts, property-types.ts, unit-counts.ts) so any stale or malformed
 * entry fails the build the moment Astro imports the data file.
 */
export function vf(field: VerifiedField): VerifiedField {
  return VerifiedFieldSchema.parse(field);
}

/** Per SEO-PLAYBOOK §12.1: warn at > 300 days (still valid, but stale soon),
 * fail at > 365 days (Zod refine). Logged once per field at module load. */
function warnIfAging(field: VerifiedField, location: string): void {
  const daysOld =
    (Date.now() - new Date(field.verified).getTime()) / 86_400_000;
  if (daysOld > 300 && daysOld <= 365) {
    // eslint-disable-next-line no-console
    console.warn(
      `[VerifiedField] ${location} verified ${field.verified} (${Math.floor(daysOld)} days old) — re-verify before it crosses 365 days.`,
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
