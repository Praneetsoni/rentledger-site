---
layout: ../layouts/ProseLayout.astro
title: Changelog
titleFull: "Changelog — RentLedger"
description: "RentLedger release notes and product updates. Recurring rent, backup/restore, improved receipt OCR, Lifetime pricing, and more."
canonicalPath: /changelog/
---

# Changelog

RentLedger ships updates every couple of weeks. Below is a human-readable summary of recent work — grouped by release month rather than granular commit. A Lifetime purchase includes every update below *and* every update to come.

---

## April 2026 — Backup & schema

- **Local backup and restore.** A new `.rentledger` archive bundles your full database plus receipt files into a single file you can save to iCloud Drive, AirDrop to another phone, or email yourself as an extra copy.
- **Safer schema migrations.** A composable migration chain means future data-model changes can roll forward without surprising you or risking your records.
- **Tighter Keychain behavior.** Subscription state and anonymous installation IDs now survive edge cases more cleanly (restored devices, revoked purchases, background launches).

## March 2026 — Recurring payments & tenant lifecycle

- **Recurring rent templates.** Set up a template once; monthly rent generates automatically. Edit or skip individual months as needed.
- **Tenant move-out with prorated rent.** When a tenant moves out mid-month, RentLedger handles the calendar-day proration so your reports stay accurate.
- **Dashboard: Record Payment FAB.** A floating action button for the most common action — logging a rent payment — lives in the bottom-right of the dashboard.
- **Dashboard: month/year filter.** Scope the dashboard to any past month or year without leaving the screen.
- **Tappable payment cards.** Every recent-payment card on the dashboard is now tappable to jump into edit.

## March 2026 — Better receipt scanning

- **Upgraded OCR engine.** Receipt scanning now uses Apple's `RecognizeDocumentsRequest`, which extracts vendor, date, and amount more reliably — especially on crumpled, angled, or dim receipts.
- **PDF import.** Email receipts and digital invoices can come in as PDFs directly (not just photos).
- **Photo library import.** Already snapped the receipt with Camera? Import from the photo library instead of re-shooting.
- **Unified OCR across add and edit flows.** Scan on an existing expense the same way you'd scan on a new one.

## March 2026 — Pricing & paywall

- **Lifetime purchase added.** A one-time $79.99 option joined Monthly and Annual subscriptions. Pay once, own the app, get every future update.
- **Upgrade path from subscription to Lifetime.** Existing monthly/annual subscribers can upgrade to Lifetime without losing entitlement, then cancel the subscription.
- **Unified Pro gating.** Every gated feature (tax reports, receipt scanning, CSV export, property creation, and more) now checks entitlement through one canonical code path, so Pro access is consistent everywhere.

## March 2026 — App Store compliance + privacy

- **Privacy manifest.** Apple's required `PrivacyInfo.xcprivacy` now ships with the app, declaring every data category collected (spoiler: none personally identifiable, only anonymous analytics).
- **Biometric label detection.** The in-app lock correctly shows "Face ID" or "Touch ID" based on the actual iPhone hardware — no more generic "biometric" copy.
- **Crash diagnostics via MetricKit.** iOS-level crash and hang reports flow into the app so issues get caught without relying on users reporting them.
- **In-app bug reporting.** A Settings → Report an Issue flow pre-fills an email with device model, iOS version, and app version.
- **iPhone-only designation.** Removed iPad support so the app can ship a UI tuned specifically for iPhone ergonomics.

---

## Earlier work

RentLedger has been under active development since late 2025. Earlier releases focused on the data model (Property → Unit → Tenant → Payment, plus standalone Expense and Vendor models), Schedule E reporting, CSV export, and the core paywall. If you have a specific question about when a feature landed, [email support](mailto:support@rentledger.org).

---

## A note on versioning

This changelog groups work by release month because most improvements ship continuously as Test Flight and App Store updates, not as big numbered releases. The App Store listing shows the current build version. If you want to know what's queued for the next release, the public list lives here — if it's on this page it's in your current app.
