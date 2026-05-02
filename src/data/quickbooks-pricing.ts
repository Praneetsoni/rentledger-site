import { pricingVerifiedField, type VerifiedField } from "./types";

// Per SEO-PLAYBOOK §12.0 + §12.7.3: every QuickBooks price quoted on
// /compare/quickbooks is a typed VerifiedField with a 90-day staleness
// threshold. Re-verify quarterly per §12.4 — when the quarterly cadence
// fires this file is the single point of edit.
//
// Source provenance: prices captured from the live QuickBooks Online
// pricing page (quickbooks.intuit.com/pricing) via web.archive.org snapshot
// dated 2026-05-01. The live page geo-rate-limits scrapers, so the archive
// snapshot is the verifier-of-record for this draft cycle. The canonical
// `source` URL still points to the live page (which is what readers should
// visit for current pricing); the snapshot URL goes in `notes` for
// traceability.
//
// Prices are REGULAR monthly rates (not promotional first-3-months pricing).
// Promo prices are time-bounded and would mislead readers who land on the
// page after the promo expires; the page narrative quotes regular pricing
// throughout, with a single qualitative aside that Intuit runs frequent
// 50%-off promotions on annual signups.

const ARCHIVE_SNAPSHOT =
  "https://web.archive.org/web/20260501115228/https://quickbooks.intuit.com/pricing/";

export const QUICKBOOKS_PRICING: Record<string, VerifiedField> = {
  simpleStart: pricingVerifiedField({
    value: "$38/mo",
    source: "https://quickbooks.intuit.com/pricing/",
    verified: "2026-05-01",
    verifiedBy: "claude",
    notes: `Regular monthly rate for QuickBooks Online Simple Start. Archive snapshot: ${ARCHIVE_SNAPSHOT}`,
  }),
  essentials: pricingVerifiedField({
    value: "$75/mo",
    source: "https://quickbooks.intuit.com/pricing/",
    verified: "2026-05-01",
    verifiedBy: "claude",
    notes: `Regular monthly rate for QuickBooks Online Essentials. Archive snapshot: ${ARCHIVE_SNAPSHOT}`,
  }),
  plus: pricingVerifiedField({
    value: "$115/mo",
    source: "https://quickbooks.intuit.com/pricing/",
    verified: "2026-05-01",
    verifiedBy: "claude",
    notes: `Regular monthly rate for QuickBooks Online Plus. First tier with class/location tracking. Archive snapshot: ${ARCHIVE_SNAPSHOT}`,
  }),
  advanced: pricingVerifiedField({
    value: "$275/mo",
    source: "https://quickbooks.intuit.com/pricing/",
    verified: "2026-05-01",
    verifiedBy: "claude",
    notes: `Regular monthly rate for QuickBooks Online Advanced. Archive snapshot: ${ARCHIVE_SNAPSHOT}`,
  }),
};

// RentLedger's own published pricing — same VerifiedField discipline so the
// /compare/quickbooks comparison table renders both sides through the same
// component and the build catches drift if RentLedger ever changes its
// price without updating this file.
export const RENTLEDGER_PRICING: Record<string, VerifiedField> = {
  monthly: pricingVerifiedField({
    value: "$4.99/mo",
    source: "https://rentledger.org/pricing/",
    verified: "2026-05-02",
    verifiedBy: "praneet",
  }),
  annual: pricingVerifiedField({
    value: "$39.99/yr",
    source: "https://rentledger.org/pricing/",
    verified: "2026-05-02",
    verifiedBy: "praneet",
  }),
  lifetime: pricingVerifiedField({
    value: "$79.99 once",
    source: "https://rentledger.org/pricing/",
    verified: "2026-05-02",
    verifiedBy: "praneet",
  }),
};
