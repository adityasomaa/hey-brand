/**
 * ============================================================================
 * Motion frame capture.
 * ============================================================================
 *
 * Captures frames DURING the animations rather than after they settle, so the
 * motion can be checked as pixels instead of inferred from DOM state. Every
 * frame is written with the phase the state machine was in when it was taken,
 * which makes it obvious if the visual and the state ever disagree.
 *
 * Covers: the boot loader (plates arriving out of register, then converging),
 * the hero at both pointer extremes, the work card mid cross-fade, and the
 * page-transition curtain sampled right through close -> held -> open.
 *
 * node scripts/capture-motion.mjs <baseUrl> <outDir>
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "https://hey-brand.vercel.app";
const OUT = process.argv[3] ?? "frames";
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

/* --- boot loader, sampled while it runs -------------------------------- */
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
for (const [i, t] of [180, 500, 900, 1250, 1600].entries()) {
  await sleep(i === 0 ? t : t - [180, 500, 900, 1250, 1600][i - 1]);
  const phase = await page
    .evaluate(() => document.querySelector(".curtain")?.getAttribute("data-phase"))
    .catch(() => "?");
  await page.screenshot({ path: `${OUT}/boot-${String(t).padStart(4, "0")}-${phase}.png` });
  console.log(`boot ${t}ms phase=${phase}`);
}

await sleep(1500);

/* --- hero plates at two pointer extremes -------------------------------- */
await page.mouse.move(120, 700, { steps: 5 });
await sleep(900);
await page.screenshot({ path: `${OUT}/hero-pointer-left.png` });
const left = await page.evaluate(() =>
  document
    .querySelector("section[aria-labelledby='hero-heading']")
    .style.getPropertyValue("--plate-a-x")
);
await page.mouse.move(1200, 200, { steps: 20 });
await sleep(900);
await page.screenshot({ path: `${OUT}/hero-pointer-right.png` });
const right = await page.evaluate(() =>
  document
    .querySelector("section[aria-labelledby='hero-heading']")
    .style.getPropertyValue("--plate-a-x")
);
console.log(`hero plate offset: left=${left} right=${right}`);

/* --- work card mid cross-fade ------------------------------------------- */
await page.goto(`${BASE}/karya`, { waitUntil: "networkidle2" });
await sleep(2800);
await page.hover(".work-card .work-card-stage");
await sleep(200);
await page.screenshot({ path: `${OUT}/card-midfade.png` });
await sleep(600);
await page.screenshot({ path: `${OUT}/card-process.png` });
console.log("card frames captured");

/* --- page transition, sampled through the whole sequence ---------------- */
await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await sleep(2800);
await page.evaluate(() => document.querySelector('a[href="/layanan"]').click());
for (const t of [150, 350, 600, 800, 1000, 1250, 1500]) {
  await sleep(t === 150 ? 150 : 200);
  const phase = await page
    .evaluate(() => document.querySelector(".curtain")?.getAttribute("data-phase"))
    .catch(() => "?");
  await page.screenshot({ path: `${OUT}/nav-${String(t).padStart(4, "0")}-${phase}.png` });
  console.log(`nav ${t}ms phase=${phase}`);
}

await browser.close();
console.log("done");
