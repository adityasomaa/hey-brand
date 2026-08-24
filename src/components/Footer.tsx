"use client";

/**
 * Footer — every page ends with a call to action.
 *
 * The CTA swaps target automatically when the visitor is already on the page
 * it would otherwise point at. Sending someone to the page they are reading is
 * a dead end, so the resolver walks an ordered list of destinations and takes
 * the first one that is not the current route. The WhatsApp button never
 * swaps, because it always leads somewhere else by definition.
 */

import { usePathname } from "next/navigation";
import { legalNav, nav, site } from "@/lib/site";
import { SectionHeader } from "./SectionHeader";
import { TransitionLink } from "./TransitionLink";
import { WhatsAppLink } from "./WhatsAppLink";
import { Wordmark } from "./Wordmark";

/** Ordered by preference. The first entry that is not the current page wins. */
const CTA_TARGETS = [
  { href: "/kontak", label: "Kirim brief", headline: "Punya brand yang perlu dibenahi?" },
  { href: "/karya", label: "Lihat karya", headline: "Lihat dulu bentuk pekerjaannya." },
  { href: "/layanan", label: "Lihat layanan", headline: "Lihat cakupan tiap lini layanan." },
] as const;

function resolveCta(pathname: string) {
  const match = CTA_TARGETS.find(
    (t) => !(pathname === t.href || pathname.startsWith(`${t.href}/`))
  );
  return match ?? CTA_TARGETS[0];
}

export function Footer() {
  const pathname = usePathname() || "/";
  const cta = resolveCta(pathname);
  const year = 2026;

  return (
    <footer className="bg-ink text-paper">
      <div className="shell py-block">
        <SectionHeader
          tone="on-ink"
          label="Langkah berikutnya"
          headline={cta.headline}
          description={`Ceritakan kondisi brand-nya sekarang dan apa yang ingin dicapai. Kami melayani area ${site.areaLabel}.`}
          cta={
            <div className="flex flex-wrap items-center gap-3">
              <TransitionLink href={cta.href} className="btn btn-solid">
                {cta.label}
              </TransitionLink>
              <WhatsAppLink label="Footer — Chat WhatsApp" className="btn btn-onink">
                Chat WhatsApp
              </WhatsAppLink>
            </div>
          }
        />

        <hr className="mt-block-tight border-0 border-t border-paper/15" />

        <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <TransitionLink
              href="/"
              className="text-[1.25rem] leading-none tracking-[-0.03em]"
              aria-label={`${site.name} — beranda`}
            >
              <Wordmark text={site.name} tone="on-ink" flat />
            </TransitionLink>
            <p className="mt-4 max-w-[34ch] text-paper/70">
              Agensi branding yang mengerjakan strategy, identity, dan social media
              management untuk brand di {site.areaLabel}.
            </p>
          </div>

          <nav aria-label="Navigasi footer">
            <h2 className="text-meta uppercase tracking-[0.12em] text-paper/55">
              Halaman
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    markCurrent
                    className="link-draw text-paper/85 hover:text-paper"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Informasi hukum">
            <h2 className="text-meta uppercase tracking-[0.12em] text-paper/55">
              Informasi
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    markCurrent
                    className="link-draw text-paper/85 hover:text-paper"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
              {/* Rendered only when an address is actually configured. */}
              {site.email ? (
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="link-draw text-paper/85 hover:text-paper"
                  >
                    {site.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>

        <p className="mt-12 text-meta text-paper/55">
          &copy; {year} {site.name}. {site.areaLabel}.
        </p>
      </div>
    </footer>
  );
}
