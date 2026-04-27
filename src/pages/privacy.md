---
layout: ../layouts/ProseLayout.astro
title: Privacy Policy
titleFull: "Privacy Policy — RentLedger"
description: "RentLedger's privacy policy. Your rental data stays on your device — no servers, no user accounts, no personal data collected. Local-first financial privacy for landlords."
canonicalPath: /privacy/
breadcrumbs:
  - name: Home
    path: /
  - name: Privacy Policy
---

# Privacy Policy

*Last updated: April 16, 2026*

This privacy policy applies to the RentLedger app (hereby referred to as "Application") for iOS devices that was created by RentLedger (hereby referred to as "Service Provider") as a Freemium service. This service is intended for use "AS IS".

## Your Data Stays on Your Device

RentLedger is a local-first application. All financial data you enter — including payments, expenses, vendors, tax reports, and receipt images — is stored exclusively on your device using Apple's SwiftData framework. The Service Provider does not operate servers, does not maintain user accounts, and has no ability to access, view, or retrieve your data.

The following small, non-financial items are stored securely in the device Keychain: your biometric lock preference, the anonymous installation identifier described below, and a cached Apple in-app-purchase transaction identifier (used only to recognize your subscription across reinstalls). None of these items contain your financial data and none are synced to iCloud.

Receipt files (images and PDFs) you capture or import are stored locally in the Application's sandbox on your device and are never transmitted to any server. Receipt files (images and PDFs) may contain personally identifiable information such as vendor names, transaction amounts, and partial account numbers. This information remains on your device and is not accessed, collected, or processed by the Service Provider.

## Data Export and Backup

The Application includes features that let you export your data so you can back it up, share it with your accountant, or move it to another device:

- **Backup archives (`.rentledger` files):** You can create a single archive containing all of your payments, expenses, vendors, properties, tenants, and receipt images. This file is created on your device and offered via the iOS share sheet — you choose where it goes (e.g., Files app, iCloud Drive, email, AirDrop).
- **CSV exports:** You can export payment, expense, and vendor data as CSV files packaged in a ZIP archive. The vendor CSV includes information you have entered about third parties (vendor names, addresses, phone numbers, and 1099 tracking status).
- **PDF reports:** You can share Schedule E and 1099-NEC reports as PDF files.

Once you export a file, it leaves the Application's sandbox and is subject to the privacy policy and security of wherever you store or send it. For example, if you save a backup to iCloud Drive, Apple's privacy practices and your iCloud security settings apply. The Service Provider has no ability to access, monitor, or delete exported files.

You are responsible for protecting exported files. Backup archives and CSV exports contain sensitive financial data — including third-party vendor contact information — in a single file. We recommend storing exports only in trusted, encrypted locations and deleting old exports you no longer need.

## Information Collection and Use

The Application collects only the following limited, anonymous information:

- **Crash diagnostics:** The Application uses Apple's MetricKit framework to collect anonymous crash reports and performance metrics. This data is not linked to your identity.
- **Anonymous analytics:** The Application uses TelemetryDeck to collect anonymous usage analytics. TelemetryDeck does not collect personally identifiable information, does not track users across apps, and does not use the data for advertising. For more information, see [TelemetryDeck's Privacy Policy](https://telemetrydeck.com/privacy/).
- **Anonymous installation identifier:** On first launch, the Application generates a random, anonymous identifier (a UUID) and stores it in the device Keychain. This identifier is attached to anonymous analytics events as a session key so we can distinguish "one user launched the app five times" from "five different users." It is not your Apple ID, device serial number, advertising identifier, or identifier for vendors (IDFV). It cannot be used to identify you personally or track you across other apps. The identifier stays on your device — it is not synced to iCloud. You can reset it at any time by using "Delete All Data" in the Application's Settings, or by uninstalling the Application.

The Application does not collect your IP address, location, browsing activity, or any personally identifiable information. The Application uses Apple's Vision framework to extract text from receipt images; this processing happens entirely on your device and no images or extracted text are sent to any server or external AI service. The Application does not use cloud-based AI services or large language models.

The Service Provider does not and cannot contact you for marketing purposes, as no contact information is collected.

## In-App Purchases and Subscriptions

The Application offers optional premium features via auto-renewable subscriptions (monthly and annual) and a lifetime purchase, managed entirely through Apple's App Store. The Service Provider does not process payments directly and does not have access to your payment information. Subscription management, billing, and renewal are handled by Apple in accordance with [Apple's Terms and Conditions](https://www.apple.com/legal/internet-services/itunes/).

## Third-Party Services

The Application uses the following third-party services:

- **TelemetryDeck** — anonymous analytics ([Privacy Policy](https://telemetrydeck.com/privacy/))
- **Apple StoreKit** — in-app purchases and subscriptions ([Apple Privacy Policy](https://www.apple.com/legal/privacy/))
- **Apple MetricKit** — crash and performance diagnostics (system-level, not linked to identity)

No user data is sold, shared with advertisers, or transferred to data brokers.

The Service Provider may disclose information as required by law, such as to comply with a subpoena or similar legal process, or when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.

## Data Deletion

You may delete all of your data at any time by deleting the Application from your device. Since all data is stored locally, uninstalling the Application permanently removes all associated data. You may also use the "Delete All Data" option within the Application's Settings, which additionally clears the anonymous installation identifier and cached Apple transaction identifier from the Keychain so the next launch starts fresh.

## Opt-Out Rights

You can stop all collection of anonymous analytics and crash data by uninstalling the Application.

## Data Retention Policy

Because all user data is stored locally on your device, the Service Provider does not retain any of your data on external servers. When you delete the Application, all data is permanently removed.

## Children

The Application does not knowingly collect personally identifiable information from children under the age of 13. The Application does not collect personally identifiable information from any user. If you have concerns, please contact the Service Provider at support@rentledger.org.

## California Privacy Rights (CCPA)

If you are a California resident, the California Consumer Privacy Act ("CCPA") provides you with specific rights regarding your personal information. The Service Provider does not sell, rent, or share personal information as defined under the CCPA. The Application does not collect personal information that is transmitted to or stored on external servers. All data remains on your device under your sole control. Because the Service Provider does not collect, store, or have access to your personal information, there is no data to disclose, delete, or opt out of on the Service Provider's end. You may delete all locally stored data at any time by using the "Delete All Data" option in the Application's Settings or by uninstalling the Application.

## Security

The Service Provider takes the security of your data seriously. Financial data stored on-device is protected using iOS file protection (NSFileProtectionComplete), meaning it is encrypted while your device is locked. Receipt files and in-app data are stored in the Application's sandbox. Files you export from the Application (backups, CSVs, PDFs) are no longer under the Application's control once saved or shared; their security depends on the destination you choose. Biometric authentication (Face ID or Touch ID, with passcode fallback) is available to restrict access to the Application. Sensitive items stored in the Keychain — including your anonymous installation identifier and cached Apple transaction identifier — use the "after first unlock, this device only" accessibility class, meaning they are readable only after the device has been unlocked at least once since restart and are never synced to iCloud.

## Changes

This Privacy Policy may be updated from time to time. The Service Provider will notify you of any changes by updating this page with the new Privacy Policy and revising the "Last updated" date above. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.

## Your Consent

By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by the Service Provider.

## Contact Us

If you have any questions regarding privacy while using the Application, please contact the Service Provider via email at support@rentledger.org.
