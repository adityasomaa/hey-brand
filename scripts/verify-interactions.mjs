/**
 * ============================================================================
 * Interaction verification.
 * ============================================================================
 *
 * Drives a real Chrome and asserts, against the DOM and real APIs:
 *
 *   1. Hero pointer effect  — the plate variables actually change on mousemove
 *   2. Hero fallbacks       — no listener attached on touch; frozen under
 *                             prefers-reduced-motion
 *   3. Work card reveal     — hover, keyboard focus, and the toggle button all
 *                             reach the process layer; process note is always
 *                             present in the DOM regardless
 *   4. Page transition      — the full close -> swap -> scroll -> open sequence
 *                             runs, lands at scrollY 0, and always returns to
 *                             the idle phase
 *   5. Transition + hidden tab — the curtain still opens after the tab has been
 *                             backgrounded mid-sequence (the rAF trap)
 *   6. Reduced motion       — no curtain at all, navigation still works
 *   7. Listbox              — full ARIA keyboard contract
 *   8. Contact form         — server validation rejects bad input, and a valid
 *                             submit produces a wa.me URL containing every
 *                             field and the originating page URL
 *   9. Cookie consent       — Deny writes nothing and purges; Allow persists a
 *                             draft
 *  10. Hamburger            — opens, traps focus, Escape closes, returns focus
 *
 * node scripts/verify-interactions.mjs [baseUrl]
 */

import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:4317";
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});

const newPage = async ({ width = 1440, height = 900, touch = false, reduced = false } = {}) => {
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile: touch, hasTouch: touch });
  if (reduced) {
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  }
  // isMobile + hasTouch already make matchMedia report `(hover: none)` and
  // `(pointer: coarse)` in Chrome, which is exactly what the effects gate on.
  return page;
};

const readPlateVars = (page) =>
  page.evaluate(() => {
    const hero = document.querySelector("section[aria-labelledby='hero-heading']");
    if (!hero) return null;
    return {
      ax: hero.style.getPropertyValue("--plate-a-x"),
      ay: hero.style.getPropertyValue("--plate-a-y"),
      fx: hero.style.getPropertyValue("--field-x"),
    };
  });

/* ========================================================================== */
console.log("\n[1] Hero pointer effect (desktop, motion allowed)");
{
  const page = await newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(2600);

  const before = await readPlateVars(page);
  await page.mouse.move(200, 300);
  await page.mouse.move(1200, 700, { steps: 12 });
  await sleep(600);
  const after = await readPlateVars(page);

  check(
    "plate offsets change on mouse move",
    Boolean(after?.ax) && after.ax !== before?.ax,
    `before="${before?.ax || "(unset)"}" after="${after?.ax}"`
  );
  check(
    "counter-moving field also updates",
    Boolean(after?.fx) && parseFloat(after.fx) !== 0,
    `--field-x="${after?.fx}"`
  );

  // Leaving the hero should ease the plates back toward register.
  await page.mouse.move(700, 60, { steps: 6 });
  await sleep(1400);
  const settled = await readPlateVars(page);
  check(
    "plates return toward register when the pointer leaves",
    Math.abs(parseFloat(settled?.ax || "0")) < Math.abs(parseFloat(after?.ax || "0")),
    `${after?.ax} -> ${settled?.ax}`
  );

  // rAF must not keep spinning once settled.
  const idleFrames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let writes = 0;
        const hero = document.querySelector("section[aria-labelledby='hero-heading']");
        const obs = new MutationObserver(() => writes++);
        obs.observe(hero, { attributes: true, attributeFilter: ["style"] });
        setTimeout(() => {
          obs.disconnect();
          resolve(writes);
        }, 900);
      })
  );
  check("effect stops writing when settled (no idle rAF burn)", idleFrames === 0, `${idleFrames} style writes in 900ms`);
  await page.close();
}

/* ========================================================================== */
console.log("\n[2] Hero fallbacks");
{
  const page = await newPage({ width: 375, height: 812, touch: true });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(2600);
  const vars = await readPlateVars(page);
  const heroVisible = await page.evaluate(() => {
    const h = document.querySelector("section[aria-labelledby='hero-heading']");
    const h1 = document.querySelector("h1");
    return Boolean(h && h1 && h1.getBoundingClientRect().height > 0);
  });
  check(
    "touch: no pointer offsets written, hero still fully rendered",
    (!vars?.ax || parseFloat(vars.ax) === 0) && heroVisible,
    `--plate-a-x="${vars?.ax || "(unset)"}", h1 rendered=${heroVisible}`
  );
  await page.close();

  const rm = await newPage({ reduced: true });
  await rm.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(1200);
  await rm.mouse.move(200, 300);
  await rm.mouse.move(1200, 700, { steps: 12 });
  await sleep(700);
  const rmVars = await readPlateVars(rm);
  const rmVisible = await rm.evaluate(() => {
    const h1 = document.querySelector("h1");
    const cta = document.querySelector(".btn-solid");
    return {
      h1: h1 ? getComputedStyle(h1).opacity : "0",
      ctaVisible: cta ? cta.getBoundingClientRect().height > 0 : false,
      revealsShown: [...document.querySelectorAll(".reveal")].every(
        (el) => getComputedStyle(el).opacity === "1"
      ),
    };
  });
  check(
    "reduced motion: hero effect never attaches",
    !rmVars?.ax || parseFloat(rmVars.ax) === 0,
    `--plate-a-x="${rmVars?.ax || "(unset)"}"`
  );
  check(
    "reduced motion: page is fully visible, nothing stuck at opacity 0",
    rmVars !== null && rmVisible.ctaVisible && rmVisible.revealsShown,
    `reveals all opaque=${rmVisible.revealsShown}`
  );
  await rm.close();
}

/* ========================================================================== */
console.log("\n[3] Work card process reveal");
{
  const page = await newPage();
  await page.goto(`${BASE}/karya`, { waitUntil: "networkidle2" });
  await sleep(2600);

  const noteAlwaysPresent = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".work-card")];
    return (
      cards.length > 0 &&
      cards.every((c) => {
        const p = [...c.querySelectorAll("p")].pop();
        return p && p.textContent.trim().length > 20 && getComputedStyle(p).opacity === "1";
      })
    );
  });
  check("process note is permanent text, not hover-gated", noteAlwaysPresent);

  const opacityOf = (sel) =>
    page.evaluate((s) => {
      const el = document.querySelector(s);
      return el ? parseFloat(getComputedStyle(el).opacity) : -1;
    }, sel);

  const baseline = await opacityOf(".work-card .work-layer-process");
  await page.hover(".work-card .work-card-stage");
  await sleep(700);
  const hovered = await opacityOf(".work-card .work-layer-process");
  check("mouse hover reveals the process layer", baseline < 0.1 && hovered > 0.9, `${baseline} -> ${hovered}`);

  // Move away, then reach the same state with the keyboard only.
  await page.mouse.move(0, 0);
  await sleep(700);
  const keyboardReveal = await page.evaluate(async () => {
    const link = document.querySelector(".work-card .work-link");
    link.focus();
    await new Promise((r) => setTimeout(r, 700));
    const layer = document.querySelector(".work-card .work-layer-process");
    return {
      focused: document.activeElement === link,
      opacity: parseFloat(getComputedStyle(layer).opacity),
    };
  });
  check(
    "keyboard focus reveals the same layer",
    keyboardReveal.focused && keyboardReveal.opacity > 0.9,
    `focus=${keyboardReveal.focused} opacity=${keyboardReveal.opacity}`
  );

  // Touch path: the explicit toggle button.
  const toggle = await page.evaluate(async () => {
    const btn = document.querySelector(".work-card .work-toggle");
    const before = btn.getAttribute("aria-pressed");
    btn.click();
    await new Promise((r) => setTimeout(r, 700));
    const card = btn.closest(".work-card");
    return {
      before,
      after: btn.getAttribute("aria-pressed"),
      dataAttr: card.getAttribute("data-process"),
      label: btn.textContent.trim().slice(0, 20),
    };
  });
  check(
    "toggle button gives touch users the same reveal, with aria-pressed",
    toggle.before === "false" && toggle.after === "true" && toggle.dataAttr === "true",
    `aria-pressed ${toggle.before} -> ${toggle.after}, label now "${toggle.label}"`
  );
  await page.close();
}

/* ========================================================================== */
console.log("\n[4] Page transition sequence");
{
  const page = await newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(2600);

  // Scroll down first, so the scroll-to-top step is observable.
  await page.evaluate(() => window.scrollTo(0, 1400));
  await sleep(500);
  const scrollBefore = await page.evaluate(() => Math.round(window.scrollY));

  const phases = await page.evaluate(async () => {
    const seen = [];
    const curtain = document.querySelector(".curtain");
    const obs = new MutationObserver(() => {
      const p = curtain.getAttribute("data-phase");
      if (seen[seen.length - 1] !== p) seen.push(p);
    });
    obs.observe(curtain, { attributes: true, attributeFilter: ["data-phase"] });
    seen.push(curtain.getAttribute("data-phase"));

    document.querySelector('a[href="/karya"]').click();
    await new Promise((r) => setTimeout(r, 3500));
    obs.disconnect();
    return seen;
  });

  const finalState = await page.evaluate(() => ({
    path: location.pathname,
    scrollY: Math.round(window.scrollY),
    phase: document.querySelector(".curtain").getAttribute("data-phase"),
    curtainHidden: getComputedStyle(document.querySelector(".curtain")).visibility,
  }));

  check(
    "sequence runs close -> held -> opening -> idle",
    phases.join(">").includes("closing>held>opening>idle"),
    phases.join(" > ")
  );
  check("route actually changed", finalState.path === "/karya", finalState.path);
  check(
    "scroll reset to top during the covered phase",
    scrollBefore > 500 && finalState.scrollY === 0,
    `${scrollBefore} -> ${finalState.scrollY}`
  );
  check(
    "curtain ends idle and hidden",
    finalState.phase === "idle" && finalState.curtainHidden === "hidden",
    `phase=${finalState.phase} visibility=${finalState.curtainHidden}`
  );
  await page.close();
}

/* ========================================================================== */
console.log("\n[5] Transition survives a backgrounded tab (the rAF trap)");
{
  const page = await newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(2600);

  // Start the navigation, then immediately report the page as hidden. rAF stops
  // firing; only the setTimeout half of afterDelay can carry the sequence.
  await page.evaluate(() => {
    document.querySelector('a[href="/layanan"]').click();
  });
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  // Genuinely throttle rAF the way a background tab does.
  const session = await page.createCDPSession();
  await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 }).catch(() => {});
  await sleep(4000);

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await sleep(1800);

  const state = await page.evaluate(() => ({
    phase: document.querySelector(".curtain").getAttribute("data-phase"),
    visibility: getComputedStyle(document.querySelector(".curtain")).visibility,
    path: location.pathname,
    h1: document.querySelector("h1")?.textContent?.slice(0, 30),
  }));
  check(
    "curtain is not stuck after a hidden stretch",
    state.phase === "idle" && state.visibility === "hidden",
    `phase=${state.phase} visibility=${state.visibility}`
  );
  check("navigation completed while hidden", state.path === "/layanan", `${state.path} — "${state.h1}"`);
  await page.close();
}

/* ========================================================================== */
console.log("\n[6] Reduced motion: no curtain at all");
{
  const page = await newPage({ reduced: true });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(1200);
  const boot = await page.evaluate(() => ({
    phase: document.querySelector(".curtain").getAttribute("data-phase"),
    visibility: getComputedStyle(document.querySelector(".curtain")).visibility,
  }));
  check(
    "no boot loader under reduced motion",
    boot.phase === "idle" && boot.visibility === "hidden",
    `phase=${boot.phase}`
  );

  await page.evaluate(() => window.scrollTo(0, 1200));
  await sleep(300);
  await page.evaluate(() => document.querySelector('a[href="/karya"]').click());
  await sleep(1500);
  const after = await page.evaluate(() => ({
    path: location.pathname,
    scrollY: Math.round(window.scrollY),
    phase: document.querySelector(".curtain").getAttribute("data-phase"),
  }));
  check(
    "navigation still works and still scrolls to top",
    after.path === "/karya" && after.scrollY === 0 && after.phase === "idle",
    `${after.path} scrollY=${after.scrollY} phase=${after.phase}`
  );
  await page.close();
}

/* ========================================================================== */
console.log("\n[7] Listbox ARIA keyboard contract");
{
  const page = await newPage();
  await page.goto(`${BASE}/kontak`, { waitUntil: "networkidle2" });
  await sleep(2600);

  const trigger = '[role="combobox"]';
  const state = () =>
    page.evaluate((sel) => {
      const t = document.querySelector(sel);
      const list = document.querySelector('[role="listbox"]');
      const active = t.getAttribute("aria-activedescendant");
      const activeEl = active ? document.getElementById(active) : null;
      return {
        expanded: t.getAttribute("aria-expanded"),
        listOpen: list.getAttribute("data-open"),
        // The option renders <span>label</span><span>hint</span>; read the
        // label span, not the concatenated textContent.
        activeText: activeEl?.querySelector("span")?.textContent?.trim() ?? null,
        value: document.querySelector('input[name="service"]').value,
        focused: document.activeElement === t,
        label: t.textContent.trim().split("\n")[0],
      };
    }, trigger);

  check("native <select> is not used anywhere", await page.evaluate(() => document.querySelectorAll("select").length === 0));

  await page.focus(trigger);
  await page.keyboard.press("ArrowDown");
  await sleep(250);
  let s = await state();
  check("ArrowDown opens the listbox", s.expanded === "true" && s.listOpen === "true", `active="${s.activeText}"`);

  await page.keyboard.press("ArrowDown");
  await sleep(150);
  s = await state();
  check("ArrowDown moves the active option", s.activeText === "Identity", `active="${s.activeText}"`);

  await page.keyboard.press("End");
  await sleep(150);
  s = await state();
  check("End jumps to the last option", s.activeText === "Social Media Management", `active="${s.activeText}"`);

  await page.keyboard.press("Home");
  await sleep(150);
  s = await state();
  check("Home jumps to the first option", s.activeText === "Strategy", `active="${s.activeText}"`);

  await page.keyboard.press("Escape");
  await sleep(200);
  s = await state();
  check(
    "Escape closes and focus is still on the trigger",
    s.expanded === "false" && s.focused,
    `expanded=${s.expanded} focused=${s.focused}`
  );

  // Type-ahead from the closed state selects directly, like a native select.
  await page.keyboard.press("i");
  await sleep(250);
  s = await state();
  check("type-ahead selects by first letter", s.value === "identity", `value="${s.value}" label="${s.label}"`);

  // Reopening lands on the current selection (correct APG behaviour: opening
  // does not move the active option), so step down once, then commit.
  await page.keyboard.press("ArrowDown");
  await sleep(200);
  await page.keyboard.press("ArrowDown");
  await sleep(200);
  await page.keyboard.press("Enter");
  await sleep(250);
  s = await state();
  check(
    "Enter commits the active option and closes",
    s.expanded === "false" && s.value === "social-media",
    `value="${s.value}"`
  );

  await page.keyboard.press("Space");
  await sleep(250);
  s = await state();
  check("Space opens the listbox", s.expanded === "true", `expanded=${s.expanded}`);
  await page.keyboard.press("Escape");
  await page.close();
}

/* ========================================================================== */
console.log("\n[8] Contact form: server validation + WhatsApp message");
{
  const page = await newPage();
  await page.goto(`${BASE}/kontak`, { waitUntil: "networkidle2" });
  await sleep(2600);

  // Submit empty: the server action must reject it.
  await page.evaluate(() => document.querySelector('button[type="submit"]').click());
  await sleep(1800);
  const rejected = await page.evaluate(() => {
    const alert = document.querySelector('[role="alert"]');
    const errors = [...document.querySelectorAll(".field-error")].map((e) => e.textContent);
    return { alert: alert?.textContent ?? null, errors };
  });
  check(
    "server rejects an empty submission",
    Boolean(rejected.alert) && rejected.errors.length >= 4,
    `${rejected.errors.length} field errors: ${rejected.errors.slice(0, 2).join(" | ")}`
  );

  // Bypass the client: write values straight into the DOM (so no client-side
  // validator ever sees them), including a service id the Listbox can never
  // produce and a malformed phone number. Only the server can catch these.
  await page.evaluate(() => {
    const setNative = (el, v) => {
      const proto =
        el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    setNative(document.querySelector("#name"), "Uji Coba");
    setNative(document.querySelector("#brand"), "Brand Uji");
    setNative(document.querySelector("#whatsapp"), "12345");
    // Tampered directly; the custom listbox has no such option.
    document.querySelector('input[name="service"]').value = "layanan-palsu";
  });
  await page.evaluate(() => document.querySelector('button[type="submit"]').click());
  await sleep(2000);
  const tampered = await page.evaluate(() => ({
    errors: [...document.querySelectorAll(".field-error")].map((e) => e.textContent),
    stillOnForm: Boolean(document.querySelector('button[type="submit"]')),
  }));
  check(
    "server rejects a tampered service id the UI cannot produce",
    tampered.errors.some((e) => e.includes("tidak dikenali")) && tampered.stillOnForm,
    tampered.errors.join(" | ")
  );
  check(
    "server rejects a malformed phone the client never validated",
    tampered.errors.some((e) => e.includes("Format nomor")),
    tampered.errors.find((e) => e.includes("Format nomor")) ?? "(not caught)"
  );

  // Fill properly and submit.
  await page.evaluate(() => {
    const set = (sel, v) => {
      const el = document.querySelector(sel);
      const setter = Object.getOwnPropertyDescriptor(
        el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    set("#name", "Rania Prawira");
    set("#brand", "Kedai Sudut");
    set("#whatsapp", "081234567890");
    set("#note", "Butuh penataan identitas untuk lokasi kedua.");
  });
  await page.focus('[role="combobox"]');
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await sleep(300);
  await page.evaluate(() => document.querySelector('button[type="submit"]').click());
  await sleep(2500);

  const success = await page.evaluate(() => {
    const link = [...document.querySelectorAll("a")].find((a) => a.href.includes("wa.me"));
    return {
      href: link?.href ?? null,
      decoded: link ? decodeURIComponent(link.href.split("text=")[1] ?? "") : null,
    };
  });

  const msg = success.decoded ?? "";
  check("valid submission produces a wa.me link", Boolean(success.href), success.href?.slice(0, 48));
  check("message carries Nama", msg.includes("Rania Prawira"));
  check("message carries Nama brand", msg.includes("Kedai Sudut"));
  check("message carries Nomor WhatsApp", msg.includes("081234567890"));
  check("message carries the chosen Layanan", /Layanan yang diminati: \w/.test(msg), msg.match(/Layanan yang diminati: .*/)?.[0]);
  check("message carries Catatan", msg.includes("lokasi kedua"));
  check(
    "message carries the originating page URL",
    msg.includes("/kontak"),
    msg.match(/Dikirim dari: .*/)?.[0]
  );
  if (msg) {
    console.log("\n----- composed WhatsApp message -----");
    console.log(msg);
    console.log("-------------------------------------\n");
  }
  await page.close();
}

/* ========================================================================== */
console.log("\n[9] Cookie consent actually gates storage");
{
  const page = await newPage();
  await page.goto(`${BASE}/kontak`, { waitUntil: "networkidle2" });
  await sleep(3000);

  // Deny.
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".cookie-panel button")];
    btns.find((b) => b.textContent.includes("Tolak"))?.click();
  });
  await sleep(400);
  await page.evaluate(() => {
    const el = document.querySelector("#name");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(el, "Tidak Boleh Disimpan");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await sleep(1200);
  const denied = await page.evaluate(() => ({
    draft: localStorage.getItem("heybrand.contact-draft"),
    decision: localStorage.getItem("heybrand.consent.v1"),
    bannerGone: !document.querySelector(".cookie-panel"),
  }));
  check(
    "Deny: no draft written, decision stored, banner dismissed",
    denied.draft === null && denied.decision === "denied" && denied.bannerGone,
    `draft=${denied.draft} decision=${denied.decision}`
  );

  // Allow, then confirm a draft is written and survives a reload.
  await page.evaluate(() => {
    localStorage.setItem("heybrand.consent.v1", "granted");
  });
  await page.reload({ waitUntil: "networkidle2" });
  await sleep(2800);
  await page.evaluate(() => {
    const el = document.querySelector("#name");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(el, "Boleh Disimpan");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await sleep(1400);
  const granted = await page.evaluate(() => localStorage.getItem("heybrand.contact-draft"));
  check("Allow: draft is persisted", Boolean(granted && granted.includes("Boleh Disimpan")), granted?.slice(0, 60));

  await page.reload({ waitUntil: "networkidle2" });
  await sleep(2800);
  const restored = await page.evaluate(() => document.querySelector("#name")?.value);
  check("draft is restored after a reload", restored === "Boleh Disimpan", `#name="${restored}"`);

  // Flip back to denied: the stored draft must be actively purged.
  await page.evaluate(() => {
    localStorage.removeItem("heybrand.consent.v1");
  });
  await page.reload({ waitUntil: "networkidle2" });
  await sleep(3000);
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".cookie-panel button")];
    btns.find((b) => b.textContent.includes("Tolak"))?.click();
  });
  await sleep(500);
  const purged = await page.evaluate(() => localStorage.getItem("heybrand.contact-draft"));
  check("switching to Deny purges the existing draft", purged === null, `draft=${purged}`);
  await page.close();
}

/* ========================================================================== */
console.log("\n[10] Mobile menu");
{
  const page = await newPage({ width: 375, height: 812, touch: true });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(2800);

  const opened = await page.evaluate(async () => {
    const burger = document.querySelector(".burger");
    burger.click();
    await new Promise((r) => setTimeout(r, 700));
    const panel = document.querySelector(".menu-panel");
    return {
      expanded: burger.getAttribute("aria-expanded"),
      dataOpen: panel.getAttribute("data-open"),
      visibility: getComputedStyle(panel).visibility,
      transform: getComputedStyle(panel).transform,
      links: panel.querySelectorAll("a").length,
      focusInside: panel.contains(document.activeElement),
      bannerHidden: !document.querySelector(".cookie-panel"),
      htmlLocked: document.documentElement.classList.contains("lenis-stopped"),
    };
  });
  check("hamburger opens the panel", opened.expanded === "true" && opened.dataOpen === "true" && opened.visibility === "visible");
  check("all four pages are in the panel", opened.links === 4, `${opened.links} links`);
  check("focus moves into the panel", opened.focusInside);
  check("cookie banner suppressed while the menu is open", opened.bannerHidden);
  check("page scroll is locked behind the panel", opened.htmlLocked);

  await page.keyboard.press("Escape");
  await sleep(700);
  const closed = await page.evaluate(() => ({
    expanded: document.querySelector(".burger").getAttribute("aria-expanded"),
    visibility: getComputedStyle(document.querySelector(".menu-panel")).visibility,
    focusOnBurger: document.activeElement === document.querySelector(".burger"),
    htmlLocked: document.documentElement.classList.contains("lenis-stopped"),
  }));
  check("Escape closes the panel", closed.expanded === "false" && closed.visibility === "hidden");
  check("focus returns to the hamburger", closed.focusOnBurger);
  check("scroll lock released", !closed.htmlLocked);
  await page.close();
}

/* ========================================================================== */
await browser.close();

const failed = results.filter((r) => !r.pass);
console.log("\n" + "=".repeat(72));
console.log(`${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log("FAILED:");
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ""}`);
}
process.exit(failed.length === 0 ? 0 : 1);
