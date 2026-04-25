---
layout: default
title: "Support & FAQ"
title_full: "Support & FAQ — RentLedger"
description: "Help, FAQs, and contact for RentLedger — the rental property tracker for iOS. Get answers on tax reports, subscriptions, data export, and troubleshooting."
permalink: /support/
nav_active: support
schema_json: |
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How do I cancel my subscription?", "acceptedAnswer": { "@type": "Answer", "text": "Cancellations go through Apple ID settings: Settings → [Your Name] → Subscriptions → RentLedger → Cancel. Your data stays on your device; nothing is deleted when a subscription lapses." }},
      { "@type": "Question", "name": "What does the free trial include?", "acceptedAnswer": { "@type": "Answer", "text": "Every feature is unlocked during the trial. You're not charged until the trial ends, and you can cancel anytime in Apple ID settings to avoid the charge." }},
      { "@type": "Question", "name": "How do I back up my data?", "acceptedAnswer": { "@type": "Answer", "text": "Standard iPhone iCloud and device backups already include your RentLedger data. CSV exports from the reports tab give you a second portable copy whenever you want one." }},
      { "@type": "Question", "name": "Does RentLedger provide tax advice?", "acceptedAnswer": { "@type": "Answer", "text": "No. RentLedger is a record-keeping tool that helps you organize rental income and expenses. It generates Schedule E and 1099-NEC reports based on the data you enter, but does not provide financial, tax, or legal advice. Always review your filings with a qualified CPA or tax preparer." }},
      { "@type": "Question", "name": "Does the app work offline?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. RentLedger works entirely offline. All data is stored on-device and all features — including receipt scanning, report generation, and CSV export — work without an internet connection." }},
      { "@type": "Question", "name": "Is RentLedger on Android?", "acceptedAnswer": { "@type": "Answer", "text": "No — RentLedger is iOS-only. Going all-in on iPhone is how we ship a genuinely local-first app. Android isn't on the roadmap." }}
    ]
  }
---

<style>
  .supp-nav a.active, .supp-nav a[aria-current="true"] { color: var(--rl-primary); }
  .bug-card { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; background: var(--rl-surface); border: 1px solid var(--rl-border); border-radius: 14px; padding: 28px; margin-top: 16px; align-items: start; }
  .bug-card-text p { color: var(--rl-text-secondary); font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
  .bug-checklist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .bug-checklist li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--rl-text-secondary); line-height: 1.5; }
  .bug-checklist .chk { width: 18px; height: 18px; border-radius: 5px; background: var(--rl-success-10); color: var(--rl-success); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
  .contact-card { background: var(--rl-surface); border: 1px solid var(--rl-border); border-radius: 14px; padding: 24px; }
  .contact-card h4 { font-family: var(--font-section); font-size: 16px; color: var(--rl-text); margin-bottom: 10px; }
  .contact-card p { color: var(--rl-text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
  .contact-card .contact-note { font-family: var(--font-mono); font-size: 12.5px; color: var(--rl-success); margin-bottom: 0; }
  @media (max-width: 720px) { .bug-card, .contact-grid { grid-template-columns: 1fr; } }
</style>

<section class="band" style="padding-top: 120px; padding-bottom: 40px;">
    <div class="container">
      <span class="section-tag">Support</span>
      <h1 class="hero-title" style="text-align: left; max-width: 920px; margin-top: 24px;">How can we <em>help</em>?</h1>
      <p class="lede" style="max-width: 600px;">Answers to the questions we get most — billing, backups, data export, and cancellation.</p>
    </div>
  </section>
  <section class="band" style="padding-top: 40px;">
    <div class="container supp-grid">
      <aside class="supp-nav">
        <a href="#faq-billing" class="active">Billing</a>
        <a href="#faq-data">Data &amp; backup</a>
        <a href="#faq-account">Account</a>
        <a href="#faq-device">Device &amp; iOS</a>
        <a href="#faq-bug">Bug report</a>
        <a href="#faq-contact">Contact</a>
      </aside>
      <div data-reveal-group>
        <h2 class="visually-hidden">Help topics</h2>
        <section id="faq-billing" class="supp-sec">
          <h3>Billing</h3><p class="sub">Subscriptions, trials, cancellations, refunds.</p>
          <details open><summary><span>How do I cancel my subscription?</span><span class="chev"></span></summary><p>Cancellations go through Apple ID settings: Settings → [Your Name] → Subscriptions → RentLedger → Cancel. Your data stays on your device; nothing is deleted when a subscription lapses.</p></details>
          <details><summary><span>What does the free trial include?</span><span class="chev"></span></summary><p>Every feature is unlocked during the trial. You're not charged until the trial ends, and you can cancel anytime in Apple ID settings to avoid the charge.</p></details>
          <details><summary><span>Can I switch between Monthly, Annual, and Lifetime?</span><span class="chev"></span></summary><p>Yes. Downgrades take effect at the end of the current billing period. Lifetime upgrades are one-time purchases and replace any active subscription.</p></details>
          <details><summary><span>Do you offer refunds?</span><span class="chev"></span></summary><p>Refunds are handled by Apple via reportaproblem.apple.com. We don't process payments directly, so we can't issue refunds ourselves.</p></details>
        </section>
        <section id="faq-data" class="supp-sec">
          <h3>Data &amp; backup</h3><p class="sub">How your data is stored, exported, and moved.</p>
          <details><summary><span>How do I back up my data?</span><span class="chev"></span></summary><p>Standard iPhone iCloud and device backups already include your RentLedger data. CSV exports from the reports tab give you a second portable copy whenever you want one.</p></details>
          <details><summary><span>How do I export my data?</span><span class="chev"></span></summary><p>Reports tab → Export. Schedule E summaries come out as PDFs, transaction-level data as CSVs, and 1099-NEC vendor totals as PDFs.</p></details>
          <details><summary><span>How do I move data to a new iPhone?</span><span class="chev"></span></summary><p>Restore from an iCloud or device backup and RentLedger data comes with it. No account migration needed.</p></details>
          <details><summary><span>Can I delete my data?</span><span class="chev"></span></summary><p>Delete the app and your data is gone — there are no servers holding copies.</p></details>
        </section>
        <section id="faq-account" class="supp-sec">
          <h3>Account</h3><p class="sub">Why there's no account, and what that means.</p>
          <details><summary><span>Why is there no account?</span><span class="chev"></span></summary><p>Your rental data never touches a server, so there's no account to create, no breach to worry about, and nothing subpoena-able sitting in a database.</p></details>
          <details><summary><span>Can I share my data across devices?</span><span class="chev"></span></summary><p>iCloud device backups include RentLedger data, so restoring to a new device brings everything with it. There's no cross-device live sync.</p></details>
          <details><summary><span>Does RentLedger provide tax advice?</span><span class="chev"></span></summary><p>No. RentLedger is a record-keeping tool that helps you organize rental income and expenses. It generates Schedule E and 1099-NEC reports based on the data you enter, but does not provide financial, tax, or legal advice. Always review your filings with a qualified CPA or tax preparer.</p></details>
        </section>
        <section id="faq-device" class="supp-sec">
          <h3>Device &amp; iOS</h3><p class="sub">System requirements and platform availability.</p>
          <details><summary><span>What iOS version do I need?</span><span class="chev"></span></summary><p>iOS 26 or later. RentLedger uses SwiftData, Vision OCR, and modern SwiftUI APIs that only ship on iOS 26+.</p></details>
          <details><summary><span>Is RentLedger on Android?</span><span class="chev"></span></summary><p>No — RentLedger is iOS-only. Going all-in on iPhone is how we ship a genuinely local-first app. Android isn't on the roadmap.</p></details>
          <details><summary><span>Does it work on iPad?</span><span class="chev"></span></summary><p>Yes, RentLedger runs on iPad with the same feature set.</p></details>
          <details><summary><span>Does the app work offline?</span><span class="chev"></span></summary><p>Yes. RentLedger works entirely offline. All data is stored on-device and all features — including receipt scanning, report generation, and CSV export — work without an internet connection.</p></details>
        </section>
                <section id="faq-bug" class="supp-sec">
          <h3>Bug report</h3><p class="sub">Help us reproduce issues fast.</p>
          <div class="bug-card">
            <div class="bug-card-text">
              <p>The more detail you include, the faster we can reproduce and resolve the issue. Email us with the items below and we'll dig in.</p>
              <a class="btn btn-primary" href="mailto:support@rentledger.org?subject=Bug%20Report">Report a bug</a>
            </div>
            <ul class="bug-checklist">
              <li><span class="chk"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>App version (found in Settings)</li>
              <li><span class="chk"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>iPhone model and iOS version</li>
              <li><span class="chk"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>Steps to reproduce the issue</li>
              <li><span class="chk"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>What you expected to happen</li>
              <li><span class="chk"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>Screenshots or screen recordings</li>
            </ul>
          </div>
        </section>
        <section id="faq-contact" class="supp-sec">
          <h3>Contact</h3><p class="sub">Still stuck? Real humans reply.</p>
          <div class="contact-grid">
            <div class="contact-card">
              <h4>Email support</h4>
              <p>Questions, feature requests, or anything else — we typically respond within 48 hours.</p>
              <a class="btn btn-accent" href="mailto:support@rentledger.org">support@rentledger.org</a>
            </div>
            <div class="contact-card">
              <h4>Response time</h4>
              <p>Most emails are answered within one business day. Complex issues may take up to 48 hours.</p>
              <p class="contact-note">No bots, no tickets — just a real reply.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>

<script>
(function () {
  var links = document.querySelectorAll('.supp-nav a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (target) map[id] = a;
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove('active'); });
      var a = map[e.target.id];
      if (a) a.classList.add('active');
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
  Object.keys(map).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();
</script>
