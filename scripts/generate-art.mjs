/**
 * ============================================================================
 * Deterministic artwork generator.
 * ============================================================================
 *
 * Every graphic on this site is produced here. Nothing is stock, nothing is
 * fetched from a placeholder service, and nothing pretends to be a real piece
 * of design work, a real office, or a real person.
 *
 * Deterministic by construction: the only source of variation is a seeded
 * PRNG keyed off the composition id, so `npm run art` always emits
 * byte-identical files. Regenerate freely; the diff will be empty unless the
 * source changed.
 *
 * Each case study gets TWO files:
 *
 *   <id>-finish.svg   the resolved composition — flat shapes, one accent
 *   <id>-process.svg  the same geometry rendered as construction: hairlines,
 *                     centre marks, radii, the scaffolding under the finish
 *
 * The work card cross-fades between the two. That is the whole point of the
 * pairing: the geometry is identical, so the transition reads as peeling a
 * layer off one object rather than swapping two unrelated pictures.
 *
 * House rules for every composition:
 *   - flat vector only. No grain, no noise, no speckle, no film texture.
 *     Depth comes from contrast, overlap, hairlines and negative space.
 *   - exactly one accent hue.
 *   - each id must be structurally distinct so the cards never read as twins.
 *
 * Run: npm run art   (also runs automatically before `next build`)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "public", "art");

/* --- palette: mirrors the tokens in src/app/globals.css ------------------ */
const C = {
  paper: "#fcfaf7",
  sunk: "#f4efeb",
  ink: "#160f0c",
  inkSoft: "#443d39",
  line: "#d8d1cc",
  accent: "#cd2f20",
};

const W = 1200;
const H = 900;

/* --- seeded PRNG --------------------------------------------------------- */
function seedFrom(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (n) => Math.round(n * 100) / 100;

/* --- construction-layer helpers ------------------------------------------ */
const guide = (d) =>
  `<path d="${d}" fill="none" stroke="${C.inkSoft}" stroke-width="1.25" stroke-dasharray="7 6" opacity="0.55"/>`;

const hair = (d, opacity = 0.9) =>
  `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="1.5" opacity="${opacity}"/>`;

const crosshair = (x, y, s = 16) =>
  `<g stroke="${C.accent}" stroke-width="1.5" opacity="0.95">` +
  `<path d="M${r2(x - s)} ${r2(y)}H${r2(x + s)}"/>` +
  `<path d="M${r2(x)} ${r2(y - s)}V${r2(y + s)}"/>` +
  `</g>`;

const tick = (x, y, len, angle) => {
  const rad = (angle * Math.PI) / 180;
  return `<path d="M${r2(x)} ${r2(y)}L${r2(x + Math.cos(rad) * len)} ${r2(
    y + Math.sin(rad) * len
  )}" stroke="${C.inkSoft}" stroke-width="1.25" opacity="0.7"/>`;
};

const circleGuide = (cx, cy, rr) =>
  `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(
    rr
  )}" fill="none" stroke="${C.inkSoft}" stroke-width="1.25" stroke-dasharray="7 6" opacity="0.5"/>`;

/* ==========================================================================
   Compositions
   Each returns { finish: [...svg strings], process: [...svg strings] }
   ========================================================================== */

const COMPOSITIONS = {
  /* Concentric arcs cut by offset discs. Reads as a rotating dial. */
  orbit(rand) {
    const cx = W * 0.5;
    const cy = H * 0.5;
    const finish = [];
    const process = [];

    const rings = 5;
    for (let i = 0; i < rings; i++) {
      const rr = 90 + i * 74;
      const start = rand() * 360;
      const sweep = 120 + rand() * 150;
      const a0 = (start * Math.PI) / 180;
      const a1 = ((start + sweep) * Math.PI) / 180;
      const large = sweep > 180 ? 1 : 0;
      const d =
        `M${r2(cx + Math.cos(a0) * rr)} ${r2(cy + Math.sin(a0) * rr)}` +
        `A${r2(rr)} ${r2(rr)} 0 ${large} 1 ${r2(cx + Math.cos(a1) * rr)} ${r2(
          cy + Math.sin(a1) * rr
        )}`;
      const isAccent = i === 2;
      finish.push(
        `<path d="${d}" fill="none" stroke="${
          isAccent ? C.accent : C.ink
        }" stroke-width="${isAccent ? 34 : 16}" stroke-linecap="butt"/>`
      );
      process.push(circleGuide(cx, cy, rr));
      process.push(hair(d, isAccent ? 1 : 0.55));
    }

    finish.push(
      `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="52" fill="${C.ink}"/>`,
      `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="20" fill="${C.paper}"/>`
    );
    process.push(crosshair(cx, cy, 46));
    for (let a = 0; a < 360; a += 30) {
      const rad = (a * Math.PI) / 180;
      process.push(
        tick(cx + Math.cos(rad) * 400, cy + Math.sin(rad) * 400, 26, a)
      );
    }
    return { finish, process };
  },

  /* Horizontal bands, each offset from the one below. Reads as a stack. */
  strata(rand) {
    const finish = [];
    const process = [];
    const rows = 7;
    const gap = 14;
    const bandH = (H - 160 - gap * (rows - 1)) / rows;
    const accentRow = 2;

    for (let i = 0; i < rows; i++) {
      const y = 80 + i * (bandH + gap);
      const inset = 90 + rand() * 260;
      const x = i % 2 === 0 ? 80 : 80 + inset;
      const w = i % 2 === 0 ? W - 160 - inset : W - 160 - inset;
      const isAccent = i === accentRow;
      finish.push(
        `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(
          bandH
        )}" fill="${isAccent ? C.accent : i % 3 === 1 ? C.inkSoft : C.ink}"/>`
      );
      process.push(
        `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(
          bandH
        )}" fill="none" stroke="${
          isAccent ? C.accent : C.ink
        }" stroke-width="1.5" opacity="${isAccent ? 1 : 0.6}"/>`,
        guide(`M80 ${r2(y)}H${W - 80}`)
      );
    }
    process.push(
      guide(`M${r2(80)} 60V${H - 60}`),
      guide(`M${r2(W - 80)} 60V${H - 60}`)
    );
    process.push(crosshair(W * 0.5, H * 0.5, 30));
    return { finish, process };
  },

  /* Vertical bars at varying heights on a shared baseline. Reads as rhythm. */
  cadence(rand) {
    const finish = [];
    const process = [];
    const cols = 13;
    const gap = 12;
    const pad = 100;
    const bw = (W - pad * 2 - gap * (cols - 1)) / cols;
    const base = H - 140;
    const accentCol = 4;

    for (let i = 0; i < cols; i++) {
      const x = pad + i * (bw + gap);
      const h = 90 + rand() * 520;
      const isAccent = i === accentCol || i === accentCol + 5;
      finish.push(
        `<rect x="${r2(x)}" y="${r2(base - h)}" width="${r2(bw)}" height="${r2(
          h
        )}" fill="${isAccent ? C.accent : C.ink}"/>`
      );
      process.push(
        `<rect x="${r2(x)}" y="${r2(base - h)}" width="${r2(bw)}" height="${r2(
          h
        )}" fill="none" stroke="${
          isAccent ? C.accent : C.ink
        }" stroke-width="1.5" opacity="${isAccent ? 1 : 0.55}"/>`,
        guide(`M${r2(x + bw / 2)} ${r2(base)}V${r2(base - h - 26)}`)
      );
    }
    finish.push(
      `<rect x="${pad}" y="${r2(base + 26)}" width="${r2(
        W - pad * 2
      )}" height="8" fill="${C.ink}"/>`
    );
    process.push(hair(`M${pad} ${r2(base + 30)}H${W - pad}`));
    for (let i = 0; i <= 4; i++) {
      const y = base - (i * (base - 120)) / 4;
      process.push(guide(`M${pad - 30} ${r2(y)}H${W - pad + 30}`));
    }
    return { finish, process };
  },

  /* Two rotated squares overlapping into an aperture. Reads as two into one. */
  aperture(rand) {
    const finish = [];
    const process = [];
    const cx = W * 0.5;
    const cy = H * 0.5;
    const size = 300;

    const sq = (angle, scale) => {
      const pts = [];
      for (let i = 0; i < 4; i++) {
        const a = ((angle + i * 90) * Math.PI) / 180;
        pts.push(
          `${r2(cx + Math.cos(a) * size * scale)},${r2(
            cy + Math.sin(a) * size * scale
          )}`
        );
      }
      return pts.join(" ");
    };

    const angleA = 45 + rand() * 12;
    const angleB = rand() * 14;

    finish.push(
      `<polygon points="${sq(angleA, 1)}" fill="${C.ink}"/>`,
      `<polygon points="${sq(angleB, 0.94)}" fill="${C.accent}" opacity="0.92"/>`,
      `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="86" fill="${C.paper}"/>`,
      `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="34" fill="${C.ink}"/>`
    );

    process.push(
      `<polygon points="${sq(angleA, 1)}" fill="none" stroke="${
        C.ink
      }" stroke-width="1.5" opacity="0.7"/>`,
      `<polygon points="${sq(angleB, 0.94)}" fill="none" stroke="${
        C.accent
      }" stroke-width="1.5"/>`,
      circleGuide(cx, cy, size),
      circleGuide(cx, cy, 86),
      guide(`M${r2(cx - 440)} ${r2(cy)}H${r2(cx + 440)}`),
      guide(`M${r2(cx)} ${r2(cy - 380)}V${r2(cy + 380)}`),
      crosshair(cx, cy, 40)
    );

    for (let i = 0; i < 4; i++) {
      const a = ((angleA + i * 90) * Math.PI) / 180;
      process.push(crosshair(cx + Math.cos(a) * size, cy + Math.sin(a) * size, 12));
    }
    return { finish, process };
  },

  /* Grid of intersecting lines with solid nodes. Reads as a rule set. */
  lattice(rand) {
    const finish = [];
    const process = [];
    const cols = 6;
    const rows = 5;
    const pad = 120;
    const cw = (W - pad * 2) / (cols - 1);
    const ch = (H - pad * 2) / (rows - 1);

    for (let i = 0; i < cols; i++) {
      const x = pad + i * cw;
      finish.push(
        `<rect x="${r2(x - 3)}" y="${pad - 40}" width="6" height="${r2(
          H - pad * 2 + 80
        )}" fill="${C.ink}" opacity="0.9"/>`
      );
      process.push(guide(`M${r2(x)} ${pad - 60}V${r2(H - pad + 60)}`));
    }
    for (let j = 0; j < rows; j++) {
      const y = pad + j * ch;
      finish.push(
        `<rect x="${pad - 40}" y="${r2(y - 3)}" width="${r2(
          W - pad * 2 + 80
        )}" height="6" fill="${C.ink}" opacity="0.9"/>`
      );
      process.push(guide(`M${pad - 60} ${r2(y)}H${r2(W - pad + 60)}`));
    }

    const nodes = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (rand() > 0.72) nodes.push([pad + i * cw, pad + j * ch]);
      }
    }
    // Guarantee a stable minimum so a low-variance seed cannot empty the field.
    if (nodes.length < 5) {
      nodes.push(
        [pad + cw, pad + ch],
        [pad + cw * 3, pad + ch * 2],
        [pad + cw * 4, pad + ch * 3]
      );
    }
    nodes.forEach(([x, y], idx) => {
      const isAccent = idx % 3 === 0;
      finish.push(
        `<circle cx="${r2(x)}" cy="${r2(y)}" r="${
          isAccent ? 40 : 26
        }" fill="${isAccent ? C.accent : C.ink}"/>`
      );
      process.push(
        `<circle cx="${r2(x)}" cy="${r2(y)}" r="${
          isAccent ? 40 : 26
        }" fill="none" stroke="${
          isAccent ? C.accent : C.ink
        }" stroke-width="1.5"/>`,
        crosshair(x, y, isAccent ? 20 : 13)
      );
    });
    return { finish, process };
  },
};

/* --- assembly ------------------------------------------------------------ */
function wrap(children, { background }) {
  const bg = background
    ? `<rect width="${W}" height="${H}" fill="${background}"/>`
    : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ` +
    `width="${W}" height="${H}" role="presentation" aria-hidden="true">` +
    bg +
    children.join("") +
    `</svg>\n`
  );
}

mkdirSync(OUT, { recursive: true });

const ids = Object.keys(COMPOSITIONS);
for (const id of ids) {
  const rand = mulberry32(seedFrom(`hey-brand::${id}`));
  const { finish, process } = COMPOSITIONS[id](rand);
  writeFileSync(join(OUT, `${id}-finish.svg`), wrap(finish, { background: C.sunk }));
  writeFileSync(
    join(OUT, `${id}-process.svg`),
    wrap(process, { background: C.paper })
  );
}

/* --- site icon -----------------------------------------------------------
   Built from the distinctive glyph cluster in the name itself: dot, bar, dot.
   No background rect at all, so the icon is genuinely transparent and sits on
   whatever the browser tab or bookmark bar happens to be.
   -------------------------------------------------------------------------- */
const icon =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
  `<title>Hey._.Brand!</title>` +
  `<circle cx="12" cy="32" r="9" fill="${C.accent}"/>` +
  `<rect x="26" y="27" width="12" height="10" rx="2" fill="${C.ink}"/>` +
  `<circle cx="52" cy="32" r="9" fill="${C.accent}"/>` +
  `</svg>\n`;
writeFileSync(join(HERE, "..", "src", "app", "icon.svg"), icon);

console.log(
  `art: wrote ${ids.length * 2} composition files (${ids.join(", ")}) + icon.svg`
);
