/**
 * Screenshot harness. Renders real pixels from a real Chrome so the design can
 * be reviewed, and so motion states can be captured mid-transition.
 *
 * node scripts/shots.mjs <baseUrl> <outDir>
 */

import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4317";
const OUT = process.argv[3] ?? "shots";
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { name: "home-desktop", route: "/", w: 1440, h: 900, full: false },
  { name: "home-desktop-full", route: "/", w: 1440, h: 900, full: true },
  { name: "karya-desktop", route: "/karya", w: 1440, h: 900, full: true },
  { name: "case-desktop", route: "/karya/kedai-kopi-spesialti", w: 1440, h: 900, full: true },
  { name: "layanan-desktop", route: "/layanan", w: 1440, h: 900, full: true },
  { name: "kontak-desktop", route: "/kontak", w: 1440, h: 900, full: true },
  { name: "privasi-desktop", route: "/kebijakan-privasi", w: 1440, h: 900, full: false },
  { name: "home-mobile", route: "/", w: 375, h: 812, full: false, mobile: true },
  { name: "home-mobile-full", route: "/", w: 375, h: 812, full: true, mobile: true },
  { name: "karya-mobile", route: "/karya", w: 375, h: 812, full: true, mobile: true },
  { name: "kontak-mobile", route: "/kontak", w: 375, h: 812, full: true, mobile: true },
  { name: "home-tablet", route: "/", w: 768, h: 1024, full: true },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

for (const shot of SHOTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: shot.w,
    height: shot.h,
    isMobile: !!shot.mobile,
    hasTouch: !!shot.mobile,
    deviceScaleFactor: 1,
  });
  await page.goto(`${BASE}${shot.route}`, { waitUntil: "networkidle2", timeout: 45000 });
  // Past the boot curtain, with reveals settled.
  await new Promise((r) => setTimeout(r, 3200));
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: shot.full });
  console.log(`${shot.name}.png`);
  await page.close();
}

await browser.close();
console.log("done");
