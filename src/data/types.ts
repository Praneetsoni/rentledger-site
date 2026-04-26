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

/**
 * Validates an entire data record (e.g. all 50 states) up front so a build
 * never half-renders pages from broken data.
 */
export function validateAll<T extends Record<string, unknown>>(
  records: T,
  perRecordValidator: (entry: T[keyof T]) => void,
): T {
  for (const [key, entry] of Object.entries(records)) {
    try {
      perRecordValidator(entry as T[keyof T]);
    } catch (err) {
      throw new Error(
        `[VerifiedField] entry '${key}' failed validation: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return records;
}
