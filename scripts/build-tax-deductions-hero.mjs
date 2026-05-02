#!/usr/bin/env node
// build-tax-deductions-hero.mjs — generates a placeholder hero image for
// /blog/landlord-tax-deductions/ until a real designed asset replaces it.
// Renders a stylized text-based 1200x630 OG-sized image so the page can
// ship today; replace by dropping a real .webp in public/images/blog/.

import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 1200;
const H = 630;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1A24"/>
      <stop offset="100%" stop-color="#0F0F14"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#CC7A40"/>
      <stop offset="50%" stop-color="#FFB688"/>
      <stop offset="100%" stop-color="#CC7A40"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="80" y="240" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#DDD8F0" font-style="italic">Rental Property</text>
  <text x="80" y="320" font-family="Georgia, serif" font-size="64" font-weight="700" fill="url(#accent)" font-style="italic">Tax Deductions</text>
  <text x="80" y="400" font-family="-apple-system, sans-serif" font-size="28" fill="#9C99B0">Schedule E · 15 categories · 2026 guide</text>
  <line x1="80" y1="460" x2="220" y2="460" stroke="url(#accent)" stroke-width="3"/>
  <text x="80" y="510" font-family="-apple-system, sans-serif" font-size="20" fill="#6E6B85">RentLedger · rentledger.org</text>
</svg>`;

const buf = Buffer.from(svg);

await sharp(buf, { density: 96 })
  .resize(W, H)
  .webp({ quality: 90 })
  .toFile("public/images/blog/landlord-tax-deductions-hero.webp");

console.log(
  "✅ Hero placeholder written to public/images/blog/landlord-tax-deductions-hero.webp",
);
