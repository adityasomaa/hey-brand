/**
 * Open Graph image — the wordmark, set in Neue Montreal, on the site's own
 * plate geometry. No stock photography, no faces, no imitation of anyone
 * else's design work.
 *
 * Rendered with next/og so the real self-hosted typeface is used rather than a
 * fallback: the font is read off disk at build time and handed to satori.
 */

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const alt = `${site.name} — Agensi branding Jakarta dan Tangerang`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fcfaf7";
const INK = "#160f0c";
const ACCENT = "#cd2f20";
const LINE = "#d8d1cc";

export default async function OpengraphImage() {
  const [medium, regular] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/NeueMontreal-Medium.ttf")),
    readFile(join(process.cwd(), "src/assets/NeueMontreal-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px 80px",
          fontFamily: "Neue Montreal",
          position: "relative",
        }}
      >
        {/* Plate geometry, echoing the hero. */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -110,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: ACCENT,
            opacity: 0.92,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 130,
            right: 120,
            width: 250,
            height: 250,
            background: INK,
            transform: "rotate(14deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -60,
            width: 600,
            height: 600,
            borderRadius: 600,
            border: `2px solid ${INK}`,
            opacity: 0.45,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#6a6360",
              fontWeight: 400,
            }}
          >
            <div style={{ width: 44, height: 2, background: ACCENT, display: "flex" }} />
            Agensi Branding
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          {/* The wordmark, with its offset plate. */}
          <div style={{ display: "flex", position: "relative", height: 132 }}>
            <div
              style={{
                position: "absolute",
                left: -10,
                top: 6,
                fontSize: 116,
                fontWeight: 500,
                letterSpacing: -4,
                color: ACCENT,
                display: "flex",
              }}
            >
              {site.name}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontSize: 116,
                fontWeight: 500,
                letterSpacing: -4,
                color: INK,
                display: "flex",
              }}
            >
              {site.name}
            </div>
          </div>

          <div style={{ display: "flex", width: "100%", height: 1, background: LINE, marginTop: 34 }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 26,
              fontSize: 27,
              color: "#443d39",
              fontWeight: 400,
            }}
          >
            <div style={{ display: "flex" }}>
              Strategy · Identity · Social Media Management
            </div>
            <div style={{ display: "flex", color: "#6a6360" }}>
              {site.areaLabel}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Neue Montreal", data: medium, weight: 500, style: "normal" },
        { name: "Neue Montreal", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
