---
layout: default
title: "RentLedger: Rental Property Tracker for Landlords"
title_full: "RentLedger: Rental Property Tracker for Landlords — iOS App"
description: "The iPhone app for landlords to track rental income, log expenses, and auto-generate Schedule E and 1099-NEC reports at tax time. Private, offline, no accounts."
keywords: "rental property tracker, landlord app, rental income tracker, Schedule E app, 1099-NEC tracker, rental expense tracker, iOS landlord app, iPhone rent tracker"
permalink: /
nav_active: home
preload_image: /assets/img/screens/hero-phone-center.webp
schema_json: |
  {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "RentLedger",
    "description": "The iPhone app for landlords to track rental income, log expenses, and auto-generate Schedule E and 1099-NEC reports at tax time. Private, offline, no accounts.",
    "url": "https://rentledger.org/",
    "downloadUrl": "https://apps.apple.com/us/app/rentledger-rental-expense-log/id6761083476",
    "installUrl": "https://apps.apple.com/us/app/rentledger-rental-expense-log/id6761083476",
    "applicationCategory": "FinanceApplication",
    "applicationSubCategory": "Rental Property Management",
    "operatingSystem": "iOS 26.0",
    "featureList": [
      "Track rental income and expenses",
      "Generate IRS Schedule E PDF reports",
      "1099-NEC vendor tracking",
      "Receipt scanning with on-device OCR",
      "Biometric lock (Face ID or Touch ID)",
      "Local-first data storage",
      "CSV export for payments, expenses, and vendors"
    ],
    "offers": [
      { "@type": "Offer", "name": "Monthly Subscription", "price": "4.99", "priceCurrency": "USD", "category": "subscription" },
      { "@type": "Offer", "name": "Annual Subscription", "price": "39.99", "priceCurrency": "USD", "category": "subscription" },
      { "@type": "Offer", "name": "Lifetime Purchase", "price": "79.99", "priceCurrency": "USD", "category": "one-time" }
    ],
    "publisher": { "@type": "Organization", "name": "RentLedger", "url": "https://rentledger.org/" }
  }
---

<!-- Hero -->
  <section class="hero">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="container hero-inner">
      <span class="eyebrow"><span class="dot dot-green"></span>Rental income + Schedule E tracking · iOS</span>
      <h1 class="hero-title">Ditch the <em>Spreadsheet.</em></h1>
      <p class="hero-sub">One iPhone app for rent payments, receipts, and Schedule E reports. So tax season stops eating your weekends — and your receipts stop living in a kitchen drawer.</p>
      <div class="hero-cta">
        <a class="btn btn-accent" href="https://apps.apple.com/us/app/rentledger-rental-expense-log/id6761083476">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          Download on App Store
        </a>
        <a class="btn btn-ghost" href="#how-it-works">See how it works</a>
      </div>
      <p class="cta-note">Free to start. No account required.</p>
      <ul class="trust-strip">
        <li><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z"/></svg>Local-First</li>
        <li><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>No Accounts</li>
        <li><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Audit-Ready</li>
        <li><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Tax-Ready</li>
      </ul>
    </div>

    <!-- Real app screenshots in iPhone frames -->
    <div class="container">
      <div class="phones" aria-hidden="true">
        <div class="phone side left">
          <div class="phone-screen">
            <img src="/assets/img/screens/hero-phone-left.webp" alt="" width="368" height="800" loading="eager" decoding="async">
            <div class="phone-status">
              <span class="time">9:41</span>
              <span class="island"></span>
              <span class="icons">
                <svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".5"/><rect x="5" y="5" width="3" height="7" rx=".5"/><rect x="10" y="2" width="3" height="10" rx=".5"/><rect x="15" y="0" width="3" height="12" rx=".5" opacity=".5"/></svg>
                <svg viewBox="0 0 16 12" fill="currentColor"><path d="M8 2c2.2 0 4.2.9 5.7 2.3l-1.4 1.4C11.2 4.6 9.7 4 8 4s-3.2.6-4.3 1.7L2.3 4.3C3.8 2.9 5.8 2 8 2zm0 4c1.1 0 2.1.4 2.8 1.2L9.4 8.6C9 8.2 8.5 8 8 8s-1 .2-1.4.6L5.2 7.2C5.9 6.4 6.9 6 8 6zm0 4c.8 0 1.4.6 1.4 1.4S8.8 12.8 8 12.8s-1.4-.6-1.4-1.4S7.2 10 8 10z"/></svg>
                <svg viewBox="0 0 24 12" fill="currentColor"><rect x="1" y="1.5" width="19" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1"/><rect x="2.5" y="3" width="16" height="6" rx="1"/><rect x="21" y="4" width="1.5" height="4" rx=".5"/></svg>
              </span>
            </div>
          </div>
        </div>
        <div class="phone center">
          <div class="phone-screen">
            <img src="/assets/img/screens/hero-phone-center.webp" alt="RentLedger dashboard" width="368" height="800" loading="eager" decoding="async" fetchpriority="high">
            <div class="phone-status">
              <span class="time">9:41</span>
              <span class="island"></span>
              <span class="icons">
                <svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".5"/><rect x="5" y="5" width="3" height="7" rx=".5"/><rect x="10" y="2" width="3" height="10" rx=".5"/><rect x="15" y="0" width="3" height="12" rx=".5" opacity=".5"/></svg>
                <svg viewBox="0 0 16 12" fill="currentColor"><path d="M8 2c2.2 0 4.2.9 5.7 2.3l-1.4 1.4C11.2 4.6 9.7 4 8 4s-3.2.6-4.3 1.7L2.3 4.3C3.8 2.9 5.8 2 8 2zm0 4c1.1 0 2.1.4 2.8 1.2L9.4 8.6C9 8.2 8.5 8 8 8s-1 .2-1.4.6L5.2 7.2C5.9 6.4 6.9 6 8 6zm0 4c.8 0 1.4.6 1.4 1.4S8.8 12.8 8 12.8s-1.4-.6-1.4-1.4S7.2 10 8 10z"/></svg>
                <svg viewBox="0 0 24 12" fill="currentColor"><rect x="1" y="1.5" width="19" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1"/><rect x="2.5" y="3" width="16" height="6" rx="1"/><rect x="21" y="4" width="1.5" height="4" rx=".5"/></svg>
              </span>
            </div>
          </div>
        </div>
        <div class="phone side right">
          <div class="phone-screen">
            <img src="/assets/img/screens/hero-phone-right.webp" alt="" width="368" height="800" loading="eager" decoding="async">
            <div class="phone-status">
              <span class="time">9:41</span>
              <span class="island"></span>
              <span class="icons">
                <svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".5"/><rect x="5" y="5" width="3" height="7" rx=".5"/><rect x="10" y="2" width="3" height="10" rx=".5"/><rect x="15" y="0" width="3" height="12" rx=".5" opacity=".5"/></svg>
                <svg viewBox="0 0 16 12" fill="currentColor"><path d="M8 2c2.2 0 4.2.9 5.7 2.3l-1.4 1.4C11.2 4.6 9.7 4 8 4s-3.2.6-4.3 1.7L2.3 4.3C3.8 2.9 5.8 2 8 2zm0 4c1.1 0 2.1.4 2.8 1.2L9.4 8.6C9 8.2 8.5 8 8 8s-1 .2-1.4.6L5.2 7.2C5.9 6.4 6.9 6 8 6zm0 4c.8 0 1.4.6 1.4 1.4S8.8 12.8 8 12.8s-1.4-.6-1.4-1.4S7.2 10 8 10z"/></svg>
                <svg viewBox="0 0 24 12" fill="currentColor"><rect x="1" y="1.5" width="19" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1"/><rect x="2.5" y="3" width="16" height="6" rx="1"/><rect x="21" y="4" width="1.5" height="4" rx=".5"/></svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      <p class="phones-caption">Built by a landlord, <em>for landlords.</em></p>
    </div>
  </section>

  <!-- How It Works -->
  <section id="how-it-works" class="band band-flow" aria-labelledby="how-heading">
    <div class="container flow-wrap">
      <header class="flow-head">
        <span class="section-tag">How it works</span>
        <h2 id="how-heading" class="flow-headline">From kitchen drawer<br><em>to Schedule E</em> in three taps.</h2>
      </header>

      <!-- The scene: receipts on the left → arrow → tax form on the right -->
      <figure class="flow-scene" aria-hidden="true">
        <!-- LEFT: a chaotic pile of receipts -->
        <div class="flow-side flow-before">
          <span class="flow-tag flow-tag-before">Before</span>
          <div class="receipt-stack">
            <div class="receipt receipt-1">
              <div class="r-hd">HOME DEPOT</div>
              <div class="r-ln"><span>2x4 lumber</span><span>$32.18</span></div>
              <div class="r-ln"><span>Door hinges</span><span>$14.50</span></div>
              <div class="r-ln"><span>Paint, white</span><span>$28.74</span></div>
              <div class="r-tot"><span>TOTAL</span><span>$87.42</span></div>
              <div class="r-meta">04/14/2025  ·  Card ••4421</div>
              <div class="r-perf"></div>
            </div>
            <div class="receipt receipt-2">
              <div class="r-hd">CITY HARDWARE</div>
              <div class="r-ln"><span>Plumber's putty</span><span>$6.99</span></div>
              <div class="r-ln"><span>Faucet aerator</span><span>$12.40</span></div>
              <div class="r-tot"><span>TOTAL</span><span>$19.39</span></div>
              <div class="r-meta">03/22/2025</div>
              <div class="r-perf"></div>
            </div>
            <div class="receipt receipt-3">
              <div class="r-hd">ACME PLUMBING</div>
              <div class="r-ln"><span>Service call</span><span>$95.00</span></div>
              <div class="r-ln"><span>Drain repair</span><span>$140.00</span></div>
              <div class="r-tot"><span>TOTAL</span><span>$235.00</span></div>
              <div class="r-meta">02/08/2025</div>
              <div class="r-perf"></div>
            </div>
            <div class="receipt receipt-4">
              <div class="r-hd">LOWE'S</div>
              <div class="r-ln"><span>Smoke detector</span><span>$24.99</span></div>
              <div class="r-tot"><span>TOTAL</span><span>$24.99</span></div>
              <div class="r-meta">01/30/2025</div>
              <div class="r-perf"></div>
            </div>
            <div class="receipt receipt-5">
              <div class="r-hd faded">·· ·· ··</div>
              <div class="r-ln dim"><span>illegible…</span></div>
              <div class="r-perf"></div>
            </div>
          </div>
        </div>

        <!-- ARROW: animated SVG that draws in on scroll -->
        <div class="flow-arrow">
          <svg viewBox="0 0 200 80" preserveAspectRatio="none" role="presentation">
            <defs>
              <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#C8BFFF" stop-opacity="0"></stop>
                <stop offset="50%" stop-color="#C8BFFF" stop-opacity="1"></stop>
                <stop offset="100%" stop-color="#C8BFFF" stop-opacity="1"></stop>
              </linearGradient>
            </defs>
            <path class="arrow-line" d="M 8 40 Q 80 20, 130 40 T 188 40" fill="none" stroke="url(#arrowGrad)" stroke-width="1.5" stroke-linecap="round"></path>
            <path class="arrow-head" d="M 178 32 L 192 40 L 178 48" fill="none" stroke="#C8BFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>

        <!-- RIGHT: clean Schedule E document -->
        <div class="flow-side flow-after">
          <span class="flow-tag flow-tag-after">After</span>
          <div class="schedule-e">
            <!-- Title block: matches the app's actual export -->
            <div class="se-doc-head">
              <div class="se-doc-title">Schedule&nbsp;E Summary Report — 2025</div>
              <div class="se-doc-sub">Supplemental Income and Loss (Summary) — Page&nbsp;1 of&nbsp;2</div>
            </div>

            <!-- Property column headers -->
            <div class="se-prop-row">
              <div class="se-prop-spacer"></div>
              <div class="se-prop-col">
                <div class="se-prop-name">Maple Street</div>
                <div class="se-prop-addr">123 Maple St, Austin TX</div>
                <div class="se-prop-type">Type 1: Single Family</div>
              </div>
              <div class="se-prop-col">
                <div class="se-prop-name">Oak Avenue</div>
                <div class="se-prop-addr">456 Oak Ave, Austin TX</div>
                <div class="se-prop-type">Type 1: Single Family</div>
              </div>
              <div class="se-prop-col">
                <div class="se-prop-name">Birch Lane</div>
                <div class="se-prop-addr">789 Birch Ln, Austin TX</div>
                <div class="se-prop-type">Type 3: Vacation</div>
              </div>
            </div>

            <!-- Income / Expenses table -->
            <table class="se-table" aria-label="Schedule E figures">
              <tbody>
                <tr class="se-section"><td colspan="4">Income:</td></tr>
                <tr>
                  <td class="se-label"><span class="se-ln">3</span> Rents received</td>
                  <td class="se-amt">$24,000</td>
                  <td class="se-amt">$18,600</td>
                  <td class="se-amt">$21,300</td>
                </tr>
                <tr class="se-section"><td colspan="4">Expenses:</td></tr>
                <tr>
                  <td class="se-label"><span class="se-ln">5</span> Advertising</td>
                  <td class="se-amt">$120</td>
                  <td class="se-amt">$85</td>
                  <td class="se-amt">$0</td>
                </tr>
                <tr>
                  <td class="se-label"><span class="se-ln">14</span> Repairs</td>
                  <td class="se-amt">$2,847</td>
                  <td class="se-amt">$1,108</td>
                  <td class="se-amt">$3,212</td>
                </tr>
                <tr>
                  <td class="se-label"><span class="se-ln">16</span> Utilities</td>
                  <td class="se-amt">$1,440</td>
                  <td class="se-amt">$1,200</td>
                  <td class="se-amt">$1,560</td>
                </tr>
                <tr class="se-rule"><td colspan="4"></td></tr>
                <tr class="se-strong">
                  <td class="se-label"><span class="se-ln">20</span> Total expenses</td>
                  <td class="se-amt">$8,247</td>
                  <td class="se-amt">$6,193</td>
                  <td class="se-amt">$7,812</td>
                </tr>
                <tr class="se-strong se-net">
                  <td class="se-label"><span class="se-ln">26</span> Net income</td>
                  <td class="se-amt">$15,753</td>
                  <td class="se-amt">$12,407</td>
                  <td class="se-amt">$13,488</td>
                </tr>
              </tbody>
            </table>

            <div class="se-stamp">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Ready for your CPA
            </div>
          </div>
        </div>
      </figure>

      <!-- Three soft labels beneath -->
      <ol class="flow-steps" aria-label="Three taps">
        <li class="flow-step">
          <span class="fs-num">01</span>
          <div class="fs-body">
            <div class="fs-h">Snap</div>
            <div class="fs-p">Receipt photo. OCR reads vendor, date, amount on-device.</div>
          </div>
        </li>
        <li class="flow-step">
          <span class="fs-num">02</span>
          <div class="fs-body">
            <div class="fs-h">Tag</div>
            <div class="fs-p">Pick a Schedule E category. Attach to the right property.</div>
          </div>
        </li>
        <li class="flow-step">
          <span class="fs-num">03</span>
          <div class="fs-body">
            <div class="fs-h">Export</div>
            <div class="fs-p">Schedule E PDF, 1099-NEC totals, ready to email your CPA.</div>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <!-- Features -->
  <section id="features" class="band">
    <div class="container">
      <header class="band-head">
        <span class="section-tag">Capabilities</span>
        <h2>Every unit. Every month. At a glance.</h2>
      </header>
      <div class="feat-grid">
        <article class="feat">
          <div class="feat-phone"><div class="phone-screen"><img src="/assets/img/screens/feat-heatmap.webp" alt="Rent collection heatmap" width="368" height="800" loading="lazy" decoding="async"></div></div>
          <div class="feat-body">
            <h3>Stop texting "hey, did you Venmo yet?"</h3>
            <p>One heatmap shows every unit, every month — paid, partial, late, or vacant. Spot the problem tenant in two seconds, not ten texts.</p>
          </div>
        </article>
        <article class="feat">
          <div class="feat-phone"><div class="phone-screen"><img src="/assets/img/screens/hero-phone-left.webp" alt="Expenses list" width="368" height="800" loading="lazy" decoding="async"></div></div>
          <div class="feat-body">
            <h3>Every lost receipt is a missed deduction.</h3>
            <p>Log expenses against IRS Schedule E categories as they happen — utilities, repairs, management fees, insurance. Your shoebox becomes a searchable, filterable record.</p>
          </div>
        </article>
        <article class="feat">
          <div class="feat-phone"><div class="phone-screen"><img src="/assets/img/screens/feat-cashflow.webp" alt="Cash flow chart" width="368" height="800" loading="lazy" decoding="async"></div></div>
          <div class="feat-body">
            <h3>See the money — not a spreadsheet.</h3>
            <p>Net cash flow, income, and expenses visualized by month, quarter, and year. Income drops on a bad month show up instantly instead of surfacing in April.</p>
          </div>
        </article>
        <article class="feat">
          <div class="feat-phone"><div class="phone-screen"><img src="/assets/img/screens/feat-1099.webp" alt="Vendors list" width="368" height="800" loading="lazy" decoding="async"></div></div>
          <div class="feat-body">
            <h3>1099 vendors tracked automatically.</h3>
            <p>Tag vendors once. RentLedger watches the thresholds and flags who needs a 1099-NEC come January — no more hunting through a year of receipts.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Privacy -->
  <section class="band band-privacy">
    <div class="container privacy-grid">
      <div>
        <span class="section-tag">Privacy first</span>
        <h2 style="margin-top:24px;">Your data, your control</h2>
        <p class="lede">Face ID protected. No ads. No personal data collected. Your financial data belongs to you — there are no servers, no accounts, and no way for anyone to access your information.</p>
      </div>
      <ul class="priv-list">
        <li><span class="icn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg></span><span>All data stored locally using Apple's SwiftData</span></li>
        <li><span class="icn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M5 5l14 14"/></svg></span><span>No user accounts, no sign-up, no cloud sync</span></li>
        <li><span class="icn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg></span><span>Receipt images never leave your device</span></li>
        <li><span class="icn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg></span><span>Biometric lock with Face ID or Touch ID (passcode fallback)</span></li>
        <li><span class="icn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg></span><span>Anonymous analytics only — no personal data collected</span></li>
      </ul>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="band">
    <div class="container faq-grid">
      <header>
        <span class="section-tag">FAQ</span>
        <h2 style="margin-top:24px;">Answers before you install.</h2>
        <p class="lede">The questions landlords ask most often before downloading. Looking for billing, backup, or account help? See the <a class="inline-link" href="/support/#faq-data">full support FAQ</a>.</p>
      </header>
      <div>
        <details>
          <summary><span>Is RentLedger available on Android?</span><span class="chev"></span></summary>
          <p>No — RentLedger is iOS-only and requires iOS 26 or later. Going all-in on iPhone is how we ship a genuinely local-first app: SwiftData, on-device Vision OCR, and Face ID all live on Apple's stack. Android isn't on the roadmap.</p>
        </details>
        <details>
          <summary><span>Does RentLedger sync across devices or to iCloud?</span><span class="chev"></span></summary>
          <p>No, and that's on purpose. Your rental data never touches a server, so there's no account to create, no breach to worry about, and nothing subpoena-able sitting in a database. Standard iPhone iCloud and device backups already include your data; CSV exports give you a second copy whenever you want one.</p>
        </details>
        <details>
          <summary><span>Does RentLedger integrate with Stripe, Zelle, Venmo, or Plaid?</span><span class="chev"></span></summary>
          <p>No, and it's a deliberate trade-off. Bank syncing means open-banking permissions, third-party data sharing, and a remote database holding your financial trail. RentLedger trades automation for absolute privacy: you enter payments manually (about a minute a month) and nothing about your rentals leaves your phone.</p>
        </details>
        <details>
          <summary><span>How accurate are the Schedule E and 1099-NEC reports?</span><span class="chev"></span></summary>
          <p>Expense categories map one-for-one to IRS Schedule E lines 5–19 — advertising, cleaning, insurance, mortgage interest, repairs, supplies, taxes, utilities, depreciation, and more. Vendor payments roll up against 1099-NEC thresholds so the forms you owe are already summed. That said, RentLedger is record-keeping, not tax advice. Always have a qualified CPA or tax preparer review your return before you file.</p>
        </details>
        <p class="faq-more">More questions on billing, backups, data export, and cancellation? <a class="inline-link" href="/support/">See the full support FAQ →</a></p>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="band band-pricing">
    <div class="container">
      <header class="band-head">
        <span class="section-tag">Pricing</span>
        <h2>Stop managing rentals in spreadsheets</h2>
        <p class="lede">Same app, same features, three ways to pay. A free trial unlocks everything before you're charged a cent.</p>
      </header>
      <div class="plans">
        <article class="plan">
          <header><h3>Monthly</h3><div class="price"><span class="pcur">$</span><span class="pnum">4.99</span></div><p class="psub">billed monthly</p></header>
          <ul class="pfeat">
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Everything unlocked</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Cancel any month, no lock-in</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Free trial before you're charged</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Ideal if you only need it at tax time</li>
          </ul>
          <a class="btn btn-ghost" href="https://apps.apple.com/us/app/rentledger-rental-expense-log/id6761083476">Start Free Trial</a>
        </article>
        <article class="plan">
          <header><h3>Annual</h3><div class="price"><span class="pcur">$</span><span class="pnum">39.99</span></div><p class="psub">$3.33/mo — <span class="accent">save 33%</span></p></header>
          <ul class="pfeat">
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Everything unlocked</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Save ~$20/yr vs monthly</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Free trial before you're charged</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Best for landlords who track year-round</li>
          </ul>
          <a class="btn btn-ghost" href="https://apps.apple.com/us/app/rentledger-rental-expense-log/id6761083476">Start Free Trial</a>
        </article>
        <article class="plan plan-feature">
          <span class="ribbon">Best value</span>
          <header><h3>Lifetime</h3><div class="price"><span class="pcur">$</span><span class="pnum">79.99</span></div><p class="psub">one-time — pays for itself in year 2</p></header>
          <ul class="pfeat">
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Everything unlocked, forever</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Every future update included</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>Pays for itself after year 2</li>
            <li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>No renewals, no billing emails, no drama</li>
          </ul>
          <a class="btn btn-accent" href="https://apps.apple.com/us/app/rentledger-rental-expense-log/id6761083476">Buy Lifetime</a>
        </article>
      </div>
      <p class="legal">Free trial available for new subscribers. Subscriptions auto-renew and can be canceled anytime via Apple ID settings.</p>
    </div>
  </section>
