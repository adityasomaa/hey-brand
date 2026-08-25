import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { WorkCard } from "@/components/WorkCard";
import { caseStudies, services } from "@/data/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — Agensi Branding Jakarta dan Tangerang`,
  description:
    "Agensi branding di Jakarta dan Tangerang. Mengerjakan brand strategy, brand identity, dan social media management untuk brand yang sedang tumbuh.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const featured = caseStudies.slice(0, 3);

  return (
    <>
      <Hero
        label="Agensi branding"
        headline="Agensi branding di Jakarta dan Tangerang"
        description="Strategy, identity, dan social media management, disusun sebagai satu sistem supaya brand terbaca sama di mana pun ia muncul."
      />

      {/* --- karya ---------------------------------------------------------- */}
      <section className="shell py-block" aria-labelledby="karya-heading">
        <Reveal>
          <SectionHeader
            headingId="karya-heading"
            label="Karya"
            headline="Bentuk pekerjaan yang biasa kami kerjakan"
            description="Setiap studi kasus disusun dengan struktur yang sama: tantangan, pendekatan, dan hasil. Halaman berikut berisi contoh susunan, bukan pekerjaan klien."
            inlineCta
            cta={
              <TransitionLink href="/karya" className="btn btn-outline">
                Lihat semua karya
              </TransitionLink>
            }
          />
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((study, i) => (
            <Reveal key={study.slug} delay={i * 90}>
              <WorkCard study={study} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- layanan -------------------------------------------------------- */}
      <section className="bg-paper-sunk py-block" aria-labelledby="layanan-heading">
        <div className="shell">
          <Reveal>
            <SectionHeader
              headingId="layanan-heading"
              label="Layanan"
              headline="Tiga lini yang kami kerjakan"
              description="Ketiganya bisa dikerjakan terpisah, tetapi paling berguna ketika berurutan: menetapkan arah, menyusun sistem visualnya, lalu menjalankannya di media sosial."
              inlineCta
              cta={
                <TransitionLink href="/layanan" className="btn btn-outline">
                  Lihat detail layanan
                </TransitionLink>
              }
            />
          </Reveal>

          <ul className="mt-14 border-t border-line">
            {services.map((service, i) => (
              <li key={service.id}>
                <Reveal delay={i * 80}>
                  <div className="grid gap-4 border-b border-line py-8 md:grid-cols-[auto_1fr_1.2fr] md:items-baseline md:gap-10">
                    <span className="text-meta tracking-[0.12em] text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-h3">{service.name}</h3>
                    <p className="measure text-ink-soft">{service.summary}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
