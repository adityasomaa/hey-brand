/**
 * SectionHeader — the fixed four-part opening every section on this site uses.
 *
 *   1. label       small uppercase section name
 *   2. headline    the section's heading
 *   3. description one short neutral paragraph
 *   4. cta         a link out of the section
 *
 * Every section renders this component. Nothing hand-rolls its own heading
 * block, which is what keeps the vertical rhythm identical from page to page.
 *
 * `headingLevel` exists because the heading level is a document-structure
 * decision, not a styling one: the hero owns the h1 on each page, so section
 * headings below it are h2, and headings inside a section are h3.
 */

import type { ReactNode } from "react";

type SectionHeaderProps = {
  label: string;
  headline: string;
  description?: ReactNode;
  cta?: ReactNode;
  headingLevel?: 1 | 2 | 3;
  /** Lets the enclosing <section> point aria-labelledby at the real heading
   *  instead of duplicating its text in a hidden element. */
  headingId?: string;
  /** Wider measure for headlines that genuinely need two lines on desktop. */
  wide?: boolean;
  tone?: "on-paper" | "on-ink";
  className?: string;
  /** Puts the CTA on the same row as the headline at desktop widths. */
  inlineCta?: boolean;
};

export function SectionHeader({
  label,
  headline,
  description,
  cta,
  headingLevel = 2,
  headingId,
  wide = false,
  tone = "on-paper",
  className = "",
  inlineCta = false,
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";
  const sizeClass =
    headingLevel === 1 ? "text-h1" : headingLevel === 2 ? "text-h2" : "text-h3";
  const bodyTone = tone === "on-ink" ? "text-paper/75" : "text-ink-soft";

  return (
    <div className={className}>
      <p className={`eyebrow ${tone === "on-ink" ? "eyebrow-onink" : ""}`}>{label}</p>

      <div
        className={
          inlineCta
            ? "mt-4 flex flex-col gap-8 md:mt-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16"
            : "mt-4 md:mt-6"
        }
      >
        <div className={inlineCta ? "min-w-0 flex-1" : ""}>
          <Heading
            id={headingId}
            className={`${sizeClass} ${wide ? "headline-long" : "headline"}`}
          >
            {headline}
          </Heading>

          {description ? (
            <div className={`mt-4 measure text-lede md:mt-5 ${bodyTone}`}>{description}</div>
          ) : null}
        </div>

        {cta ? (
          <div className={inlineCta ? "flex-none lg:pb-1" : "mt-6 md:mt-8"}>{cta}</div>
        ) : null}
      </div>
    </div>
  );
}
