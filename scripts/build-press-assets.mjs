#!/usr/bin/env node
// build-press-assets.mjs — regenerates downloadable press kit assets from
// the canonical source SVG (public/favicon.svg). Re-run whenever the brand
// mark changes. Output lands in public/press/assets/ (committed) so the
// /press/ page always serves the current brand without needing a runtime
// image pipeline. Per SEO-PLAYBOOK §M2.1.

import sharp from "sharp";
import { mkdir, readFile, copyFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const src = join(root, "public/favicon.svg");
const out = join(root, "public/press/assets");

await mkdir(out, { recursive: true });
const svgBuf = await readFile(src);

// 1. Vector source — the canonical logo file.
await copyFile(src, join(out, "rentledger-logo.svg"));

// 2. Transparent-canvas PNGs — the icon as-is, no padding. Drops onto any
//    background. 512 + 1024 covers Twitter Card, OG, App Store guidelines.
for (const size of [512, 1024]) {
  await sharp(svgBuf, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(out, `rentledger-icon-${size}.png`));
}

// 3. Light + dark canvas variants — for press contexts where journalists
//    want the mark sitting on a flat color with breathing room (e.g. logo
//    grids, slide decks). 12% padding around the rounded square.
const variants = [
  { name: "light", bg: { r: 255, g: 255, b: 255, alpha: 1 } },
  { name: "dark", bg: { r: 15, g: 15, b: 20, alpha: 1 } },
];
for (const { name, bg } of variants) {
  for (const size of [512, 1024]) {
    const padding = Math.round(size * 0.12);
    const innerSize = size - padding * 2;
    const iconBuf = await sharp(svgBuf, { density: 384 })
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: bg },
    })
      .composite([{ input: iconBuf, top: padding, left: padding }])
      .png({ compressionLevel: 9 })
      .toFile(join(out, `rentledger-logo-${name}-${size}.png`));
  }
}

// 4. App-icon naming alias (PNGs identical to icon-{size} above; named for
//    journalists looking for "app icon" specifically).
for (const size of [512, 1024]) {
  await copyFile(
    join(out, `rentledger-icon-${size}.png`),
    join(out, `rentledger-app-icon-${size}.png`),
  );
}

// 5. Apple's official "Download on the App Store" badge — kept in this
//    directory so the press page link works offline and survives any change
//    to Apple's CDN path. Source:
//    https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg
//    Re-pull manually if Apple updates its brand guidelines:
//      curl -sL https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg \
//        > public/press/assets/download-on-the-app-store.svg

// 6. Asset manifest — keeps the /press/ page in sync without hand-listing.
const manifest = {
  generated: new Date().toISOString(),
  source: "public/favicon.svg",
  files: [
    {
      path: "rentledger-logo.svg",
      label: "Logo (SVG, vector source)",
      kind: "vector",
    },
    {
      path: "rentledger-icon-512.png",
      label: "Icon, 512×512 (transparent)",
      kind: "png",
    },
    {
      path: "rentledger-icon-1024.png",
      label: "Icon, 1024×1024 (transparent)",
      kind: "png",
    },
    {
      path: "rentledger-logo-light-512.png",
      label: "Logo on light, 512×512",
      kind: "png",
    },
    {
      path: "rentledger-logo-light-1024.png",
      label: "Logo on light, 1024×1024",
      kind: "png",
    },
    {
      path: "rentledger-logo-dark-512.png",
      label: "Logo on dark, 512×512",
      kind: "png",
    },
    {
      path: "rentledger-logo-dark-1024.png",
      label: "Logo on dark, 1024×1024",
      kind: "png",
    },
    {
      path: "rentledger-app-icon-512.png",
      label: "App icon, 512×512",
      kind: "png",
    },
    {
      path: "rentledger-app-icon-1024.png",
      label: "App icon, 1024×1024",
      kind: "png",
    },
    {
      path: "download-on-the-app-store.svg",
      label: "Apple App Store badge (SVG)",
      kind: "vector",
    },
    {
      path: "rentledger-screenshots.zip",
      label: "App screenshots (zip, 6 WebP)",
      kind: "zip",
    },
  ],
};
await writeFile(
  join(out, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

console.log(`✅ Press assets written to ${out}`);
