// Renders the capybara into app icons. Run once with: node scripts/make-icons.mjs
import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const capy = `<g transform="translate(0 0)">
<circle cx="14" cy="21" r="6" fill="#8a5a3b"/><circle cx="50" cy="21" r="6" fill="#8a5a3b"/>
<circle cx="14" cy="21" r="3" fill="#d9ab84"/><circle cx="50" cy="21" r="3" fill="#d9ab84"/>
<ellipse cx="32" cy="37" rx="25" ry="21" fill="#b07d56"/>
<rect x="17" y="33" width="30" height="21" rx="11" fill="#d9ab84"/>
<ellipse cx="27.5" cy="39" rx="1.8" ry="2.4" fill="#4a3226"/><ellipse cx="36.5" cy="39" rx="1.8" ry="2.4" fill="#4a3226"/>
<circle cx="22" cy="29" r="2.6" fill="#3a2a22"/><circle cx="42" cy="29" r="2.6" fill="#3a2a22"/>
<circle cx="22.8" cy="28.2" r="0.8" fill="#fff"/><circle cx="42.8" cy="28.2" r="0.8" fill="#fff"/>
<path d="M28 46q4 3 8 0" stroke="#4a3226" stroke-width="1.8" stroke-linecap="round" fill="none"/>
<circle cx="32" cy="14.5" r="6" fill="#f2a33a"/><path d="M32 9c1.5-3 4-3.5 6-3-1 2.5-3.5 3.5-6 3z" fill="#5d9a4f"/></g>`;

// scale: share of the icon the capybara fills (maskable icons keep it inside the safe zone)
const svg = (size, scale) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#7a4a30"/><g transform="translate(${32 - 32 * scale} ${32 - 32 * scale}) scale(${scale})">${capy}</g></svg>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = (f) => path.join(here, "..", "public", "icons", f);
  for (const [file, size, scale] of [["icon-192.png", 192, 0.9], ["icon-512.png", 512, 0.9], ["maskable-512.png", 512, 0.62], ["apple-touch-icon.png", 180, 0.9]]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<body style="margin:0">${svg(size, scale)}</body>`);
    await page.screenshot({ path: out(file) });
  }
  await browser.close();
})();
