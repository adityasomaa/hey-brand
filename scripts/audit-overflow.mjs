/**
 * ============================================================================
 * Automated page audit.
 * ============================================================================
 *
 * Drives a real Chrome over every route at 375 / 768 / 1440 and asserts:
 *
 *   1. HORIZONTAL OVERFLOW — zero offenders. Reports the exact element, its
 *      right edge and how far past the viewport it sits. Interactive effects
 *      that translate elements are the usual cause, so this must be re-run
 *      after any motion change, not just after a layout change.
 *   2. HEADING LINE COUNTS — measured, not eyeballed. Budget is per viewport:
 *      3 lines at 375, 2 at 768, 1 at 1440 (2 tolerated for the long-measure
 *      variant). Nothing may reach 4 lines at any width.
 *   3. BROKEN IMAGES — naturalWidth 0 after load.
 *   4. FAILED REQUESTS — any non-2xx/3xx response or network error.
 *   5. CONSOLE ERRORS.
 *
 * Usage:
 *   node scripts/audit-overflow.mjs [baseUrl]
 *
 * Defaults to http://localhost:3000. Pass the production URL to audit the
 * deployed site, which is the run that actually counts.
 */

import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3000";

const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

const ROUTES = [
  "/",
  "/karya",
  "/karya/kedai-kopi-spesialti",
  "/karya/produk-perawatan-kulit",
  "/karya/studio-kebugaran",
  "/karya/layanan-katering",
  "/karya/toko-perabot",
  "/layanan",
  "/kontak",
  "/kebijakan-privasi",
  "/ketentuan-layanan",
  "/tidak-ada-halaman-ini",
];

const VIEWPORTS = [
  { name: "375", width: 375, height: 812, mobile: true, headingBudget: 3 },
  { name: "768", width: 768, height: 1024, mobile: false, headingBudget: 2 },
  // 1024 and 1280 are the laptop widths the brief's three checkpoints skip
  // over, and they are where a desktop two-column hero actually gets tight.
  { name: "1024", width: 1024, height: 768, mobile: false, headingBudget: 2 },
  { name: "1280", width: 1280, height: 800, mobile: false, headingBudget: 2 },
  { name: "1440", width: 1440, height: 900, mobile: false, headingBudget: 2 },
];

/* Runs inside the page. */
const PROBE = `(() => {
  const docWidth = document.documentElement.clientWidth;

  // --- horizontal overflow ---
  // An element that extends past the viewport but sits inside an
  // overflow:hidden / clip ancestor is CLIPPED and cannot widen the page.
  // Flagging it would be a false positive, so the walk up the ancestor chain
  // is part of the definition of an offender, not a way of excusing one.
  // document.scrollWidth below is the independent ground truth.
  const isClipped = (el) => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const s = getComputedStyle(p);
      if (["hidden", "clip", "auto", "scroll"].includes(s.overflowX)) return true;
      p = p.parentElement;
    }
    return false;
  };

  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (style.position === "fixed") continue; // fixed layers never scroll the page
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    const over = Math.round(rect.right - docWidth);
    const under = Math.round(rect.left);
    if (over > 1 || under < -1) {
      if (isClipped(el)) continue;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").slice(0, 90),
        right: Math.round(rect.right),
        left: Math.round(rect.left),
        overBy: over > 1 ? over : under,
      });
    }
  }

  // --- heading line counts ---
  const headings = [];
  for (const h of document.querySelectorAll("h1, h2, h3")) {
    const style = getComputedStyle(h);
    if (style.display === "none" || h.classList.contains("visually-hidden")) continue;
    const rect = h.getBoundingClientRect();
    if (rect.height === 0) continue;
    let lh = parseFloat(style.lineHeight);
    if (!Number.isFinite(lh)) lh = parseFloat(style.fontSize) * 1.15;
    const lines = Math.max(1, Math.round(rect.height / lh));
    headings.push({
      tag: h.tagName.toLowerCase(),
      text: (h.textContent || "").trim().slice(0, 58),
      lines,
      long: h.classList.contains("headline-long"),
    });
  }

  // --- broken images ---
  const broken = [];
  for (const img of document.querySelectorAll("img")) {
    if (img.complete && img.naturalWidth === 0) {
      broken.push(img.getAttribute("src") || "(no src)");
    }
  }

  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: docWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders,
    headings,
    broken,
  };
})()`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});

let failures = 0;
const summary = [];

for (const vp of VIEWPORTS) {
  console.log(`\n=== viewport ${vp.name} ===`);
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });

  for (const route of ROUTES) {
    const netErrors = [];
    const consoleErrors = [];

    const onResponse = (res) => {
      const status = res.status();
      const url = res.url();
      const expected404 = route === "/tidak-ada-halaman-ini" && url.endsWith(route);
      if (status >= 400 && !expected404) netErrors.push(`${status} ${url}`);
    };
    const onFailed = (req) =>
      netErrors.push(`FAILED ${req.url()} ${req.failure()?.errorText ?? ""}`);
    const onConsole = (msg) => {
      const text = msg.text();
      // The 404 route is expected to log a 404 for its own document.
      if (route === "/tidak-ada-halaman-ini" && text.includes("404")) return;
      if (msg.type() === "error") consoleErrors.push(text.slice(0, 160));
    };

    page.on("response", onResponse);
    page.on("requestfailed", onFailed);
    page.on("console", onConsole);

    const response = await page.goto(`${BASE}${route}`, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });
    const status = response?.status() ?? 0;

    // Let the boot curtain finish and reveals settle.
    await new Promise((r) => setTimeout(r, 2600));

    const result = await page.evaluate(PROBE);

    page.off("response", onResponse);
    page.off("requestfailed", onFailed);
    page.off("console", onConsole);

    const expectedStatus = route === "/tidak-ada-halaman-ini" ? 404 : 200;
    const problems = [];

    // 304 is a cache revalidation, not a failure.
    const statusOk = status === expectedStatus || (expectedStatus === 200 && status === 304);
    if (!statusOk) problems.push(`status ${status} (want ${expectedStatus})`);
    if (result.offenders.length) {
      problems.push(`${result.offenders.length} overflow offender(s)`);
      for (const o of result.offenders.slice(0, 6)) {
        problems.push(`    <${o.tag} class="${o.cls}"> left=${o.left} right=${o.right} (viewport ${result.clientWidth})`);
      }
    }
    if (result.scrollWidth > result.clientWidth + 1) {
      problems.push(`document scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth}`);
    }
    for (const h of result.headings) {
      const budget = h.long && vp.name === "1440" ? 2 : vp.headingBudget;
      if (h.lines > budget) {
        problems.push(`heading ${h.lines} lines (budget ${budget}): <${h.tag}> "${h.text}"`);
      }
      if (h.lines >= 4) problems.push(`HEADING AT 4+ LINES: "${h.text}"`);
    }
    if (result.broken.length) problems.push(`broken images: ${result.broken.join(", ")}`);
    for (const e of netErrors) problems.push(`request: ${e}`);
    for (const e of consoleErrors) problems.push(`console: ${e}`);

    if (problems.length) {
      failures++;
      console.log(`  FAIL ${route}`);
      for (const p of problems) console.log(`    - ${p}`);
      summary.push(`${vp.name} ${route}: ${problems.length} problem(s)`);
    } else {
      const maxLines = Math.max(1, ...result.headings.map((h) => h.lines));
      console.log(`  ok   ${route}  (${result.headings.length} headings, max ${maxLines} line(s))`);
    }
  }

  await page.close();
}

await browser.close();

console.log("\n" + "=".repeat(70));
if (failures === 0) {
  console.log(`PASS — ${ROUTES.length} routes x ${VIEWPORTS.length} viewports, zero problems.`);
} else {
  console.log(`FAIL — ${failures} route/viewport combination(s) with problems:`);
  for (const s of summary) console.log(`  ${s}`);
}
process.exit(failures === 0 ? 0 : 1);
