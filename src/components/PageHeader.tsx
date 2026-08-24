/**
 * PageHeader — the opening block of every page except Home, which has the hero.
 *
 * It is SectionHeader at h1 size with the page's top padding, so the four-part
 * structure (label, headline, description, CTA) is identical everywhere and
 * nothing hand-rolls its own page opening.
 *
 * Deliberately not one viewport tall: only the home hero gets a full screen.
 * On inner pages the first case study or the first field should already be
 * visible without scrolling.
 */

import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

type PageHeaderProps = {
  label: string;
  headline: string;
  description?: ReactNode;
  cta?: ReactNode;
  headingId?: string;
};

export function PageHeader({
  label,
  headline,
  description,
  cta,
  headingId = "page-heading",
}: PageHeaderProps) {
  return (
    <section className="shell pt-28 pb-block-tight md:pt-36" aria-labelledby={headingId}>
      <SectionHeader
        headingLevel={1}
        headingId={headingId}
        label={label}
        headline={headline}
        description={description}
        cta={cta}
        wide
      />
    </section>
  );
}
