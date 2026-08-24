/**
 * WCAG contrast audit for the design tokens.
 * Tokens are authored in OKLCH; this converts OKLCH -> sRGB -> relative luminance
 * and asserts every foreground/background pair the site actually uses.
 * Run: npm run contrast
 */

// --- OKLCH -> linear sRGB -------------------------------------------------
function oklchToLinearSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function relativeLuminance(L, C, h) {
  const [r, g, b] = oklchToLinearSrgb(L, C, h).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toHex(L, C, h) {
  const enc = (v) => {
    v = clamp01(v);
    const s = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(s * 255).toString(16).padStart(2, "0");
  };
  const [r, g, b] = oklchToLinearSrgb(L, C, h);
  return `#${enc(r)}${enc(g)}${enc(b)}`;
}

function ratio(a, b) {
  const la = relativeLuminance(...a), lb = relativeLuminance(...b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// --- Tokens (must mirror src/app/globals.css) -----------------------------
export const TOKENS = {
  paper:        [0.985, 0.004, 75],
  "paper-sunk": [0.955, 0.008, 68],
  ink:          [0.175, 0.014, 42],
  "ink-soft":   [0.365, 0.012, 45],
  "ink-faint":  [0.505, 0.010, 48],
  line:         [0.865, 0.010, 60],
  accent:       [0.556, 0.196, 30],
  "accent-ink": [0.496, 0.176, 30],
  "accent-lift":[0.742, 0.152, 45],
};

// foreground, background, required ratio, where it is used
const PAIRS = [
  ["ink", "paper", 4.5, "body copy + headings on paper"],
  ["ink", "paper-sunk", 4.5, "body copy on sunk surface"],
  ["ink-soft", "paper", 4.5, "secondary paragraph on paper"],
  ["ink-soft", "paper-sunk", 4.5, "secondary paragraph on sunk surface"],
  ["ink-faint", "paper", 4.5, "eyebrow / meta labels on paper"],
  ["accent-ink", "paper", 4.5, "accent text + links on paper"],
  ["accent-ink", "paper-sunk", 4.5, "accent text on sunk surface"],
  ["paper", "accent", 4.5, "label on accent fill (buttons)"],
  ["paper", "ink", 4.5, "copy on ink surface (footer, curtain)"],
  ["paper-sunk", "ink", 4.5, "secondary copy on ink surface"],
  ["accent-lift", "ink", 4.5, "accent text on ink surface"],
  ["line", "paper", 1.0, "hairline rule (non-text, informational only)"],
  ["accent", "paper", 3.0, "non-text UI: focus ring, active indicator"],
  ["accent", "ink", 3.0, "non-text UI on ink surface"],
];

let failed = 0;
console.log("token          hex       role");
console.log("-".repeat(64));
for (const [name, v] of Object.entries(TOKENS)) {
  console.log(name.padEnd(14), toHex(...v).padEnd(9), `oklch(${v[0]} ${v[1]} ${v[2]})`);
}
console.log("\nratio   need  status  pair");
console.log("-".repeat(78));
for (const [fg, bg, need, use] of PAIRS) {
  const r = ratio(TOKENS[fg], TOKENS[bg]);
  const ok = r >= need;
  if (!ok) failed++;
  console.log(
    `${r.toFixed(2).padStart(6)}  ${String(need).padStart(4)}  ${(ok ? "PASS" : "FAIL").padEnd(6)}  ${fg} on ${bg}  -- ${use}`
  );
}
console.log("-".repeat(78));
console.log(failed === 0 ? `All ${PAIRS.length} pairs pass.` : `${failed} FAILING pair(s).`);
process.exit(failed === 0 ? 0 : 1);
