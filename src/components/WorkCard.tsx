"use client";

/**
 * ============================================================================
 * INTERACTIVE MOMENT 2 — work cards show the construction under the finish.
 * ============================================================================
 *
 * Each card holds two renderings of the SAME geometry: the resolved
 * composition, and the construction lines it was built from. Hovering or
 * focusing the card cross-fades between them. Because the geometry is
 * identical, it reads as lifting a layer off one object rather than swapping
 * two pictures — which is the point for an audience that thinks in artboards.
 *
 * NO CONTENT IS BEHIND THE HOVER. The process note is permanent, visible text
 * under the title on every device. The interaction changes the picture, not
 * the information. That is the difference between a reveal and a trap.
 *
 * THREE INPUT PATHS
 *   - mouse:    :hover on the card
 *   - keyboard: :focus-within, triggered by tabbing to the title link
 *   - touch:    an explicit toggle button, which also works with a keyboard
 *               and is announced with aria-pressed
 *
 * The toggle is a real button, so the card container is a div and the title
 * carries the link with a stretched hit area. A button inside an anchor would
 * be invalid, and on touch it would be unreachable.
 *
 * Under prefers-reduced-motion the cross-fade duration collapses to nothing
 * via the global rule; the swap still happens, it just does not animate.
 */

import Image from "next/image";
import { useState } from "react";
import type { CaseStudy } from "@/data/content";
import { getService } from "@/data/content";
import { TransitionLink } from "./TransitionLink";

type WorkCardProps = {
  study: CaseStudy;
  /** Stagger index, used only for the reveal delay. */
  index?: number;
};

export function WorkCard({ study }: WorkCardProps) {
  const [showProcess, setShowProcess] = useState(false);
  const disciplines = study.disciplines
    .map((id) => getService(id)?.name)
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className="work-card group relative flex flex-col"
      data-process={showProcess ? "true" : "false"}
    >
      <div className="work-card-stage relative overflow-hidden rounded-sm bg-paper-sunk">
        {/* Resolved composition. */}
        <Image
          src={`/art/${study.art}-finish.svg`}
          alt=""
          aria-hidden="true"
          width={1200}
          height={900}
          className="work-layer work-layer-finish"
          priority={false}
        />
        {/* Construction of the same geometry. */}
        <Image
          src={`/art/${study.art}-process.svg`}
          alt=""
          aria-hidden="true"
          width={1200}
          height={900}
          className="work-layer work-layer-process"
          priority={false}
        />

        {study.isSample ? (
          <p className="work-flag">Contoh susunan</p>
        ) : null}

        {/* Touch + keyboard path to the same reveal. Sits above the stretched
            link so a tap on it toggles rather than navigates. */}
        <button
          type="button"
          className="work-toggle z-raised"
          aria-pressed={showProcess}
          onClick={() => setShowProcess((v) => !v)}
        >
          {showProcess ? "Lihat hasil" : "Lihat proses"}
          <span className="visually-hidden"> untuk {study.title}</span>
        </button>
      </div>

      <div className="mt-5">
        <p className="text-meta uppercase tracking-[0.12em] text-ink-faint">
          {study.sector}
          {disciplines ? <span aria-hidden="true"> — {disciplines}</span> : null}
        </p>

        <h3 className="mt-2 text-h3">
          <TransitionLink
            href={`/karya/${study.slug}`}
            className="work-link link-draw"
          >
            {study.title}
          </TransitionLink>
        </h3>

        <p className="mt-3 measure text-ink-soft">{study.summary}</p>

        {/* Permanent. Never hidden behind the hover state. */}
        <p className="mt-3 measure text-meta text-ink-faint">{study.processNote}</p>
      </div>
    </article>
  );
}
