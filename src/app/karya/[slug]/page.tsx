import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { caseStudies, getCaseStudy, getService } from "@/data/content";

type Params = { params: Promise<{ slug: string }> };

/** Every case study is known at build time, so all detail pages are static. */
export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Studi kasus tidak ditemukan" };

  return {
    title: `${study.title} — Contoh studi kasus`,
    description: `${study.summary} Contoh susunan studi kasus branding untuk kategori ${study.sector.toLowerCase()}.`,
    alternates: { canonical: `/karya/${study.slug}` },
  };
}

/** Fixed three-part structure, identical on every case study page. */
const SECTIONS = [
  { key: "challenge", label: "Tantangan", heading: "Kondisi yang dihadapi" },
  { key: "approach", label: "Pendekatan", heading: "Cara pekerjaan disusun" },
  { key: "result", label: "Hasil", heading: "Yang berubah setelahnya" },
] as const;

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const disciplines = study.disciplines
    .map((id) => getService(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <>
      <PageHeader
        label={`Karya — ${study.sector}`}
        headline={study.title}
        description={study.summary}
        cta={
          study.isSample ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-meta uppercase tracking-[0.1em] text-ink-faint">
              Contoh susunan, bukan pekerjaan klien
            </p>
          ) : undefined
        }
      />

      {/* Artwork. Both layers of the same geometry, shown side by side here so
          the detail page never depends on a hover to explain the pairing. */}
      <section className="shell pb-block-tight" aria-labelledby="visual-heading">
        <h2 id="visual-heading" className="visually-hidden">
          Visual studi kasus
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <figure className="m-0">
            <Image
              src={`/art/${study.art}-finish.svg`}
              alt={`Komposisi geometris untuk contoh studi kasus ${study.sector.toLowerCase()}, versi hasil akhir.`}
              width={1200}
              height={900}
              className="w-full rounded-sm"
              priority
            />
            <figcaption className="mt-3 text-meta text-ink-faint">Hasil</figcaption>
          </figure>
          <figure className="m-0">
            <Image
              src={`/art/${study.art}-process.svg`}
              alt={`Komposisi yang sama ditampilkan sebagai garis konstruksi, untuk contoh studi kasus ${study.sector.toLowerCase()}.`}
              width={1200}
              height={900}
              className="w-full rounded-sm border border-line"
            />
            <figcaption className="mt-3 text-meta text-ink-faint">
              Konstruksi. {study.processNote}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Fixed structure: tantangan, pendekatan, hasil. */}
      <section className="shell pb-block" aria-labelledby="struktur-heading">
        <h2 id="struktur-heading" className="visually-hidden">
          Tantangan, pendekatan, dan hasil
        </h2>

        <div className="border-t border-line">
          {SECTIONS.map((section, i) => (
            <Reveal key={section.key} delay={i * 80}>
              <div className="grid gap-5 border-b border-line py-10 md:grid-cols-[14rem_1fr] md:gap-12">
                <div>
                  <p className="eyebrow">{section.label}</p>
                </div>
                <div>
                  <h3 className="text-h3 headline">{section.heading}</h3>
                  <p className="mt-4 measure text-lede text-ink-soft">
                    {study[section.key]}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="grid gap-5 border-b border-line py-10 md:grid-cols-[14rem_1fr] md:gap-12">
            <div>
              <p className="eyebrow">Ruang lingkup</p>
            </div>
            <div>
              <h3 className="text-h3 headline">Yang dikerjakan dalam contoh ini</h3>
              <ul className="mt-5 flex flex-col gap-2.5">
                {study.scope.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-soft">
                    <span aria-hidden="true" className="mt-2.5 h-px w-4 flex-none bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-meta uppercase tracking-[0.12em] text-ink-faint">
                Lini layanan terkait
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {disciplines.map((service) => (
                  <li key={service.id}>
                    <TransitionLink
                      href="/layanan"
                      className="inline-flex rounded-full border border-line px-3.5 py-1.5 text-meta text-ink-soft hover:border-ink hover:text-ink"
                    >
                      {service.name}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {study.isSample ? (
          <p className="mt-10 measure text-meta text-ink-faint">
            Catatan: seluruh isi halaman ini adalah contoh susunan. Tidak ada nama
            perusahaan, angka, testimoni, atau hasil kampanye yang dicantumkan,
            karena tidak ada yang dapat diverifikasi pada saat halaman ini dibuat.
          </p>
        ) : null}
      </section>

      {/* Next study. */}
      <section className="bg-paper-sunk py-block" aria-labelledby="berikutnya-heading">
        <div className="shell">
          <SectionHeader
            headingId="berikutnya-heading"
            label="Berikutnya"
            headline={next.title}
            description={next.summary}
            inlineCta
            cta={
              <div className="flex flex-wrap gap-3">
                <TransitionLink href={`/karya/${next.slug}`} className="btn btn-outline">
                  Baca studi kasus
                </TransitionLink>
                <WhatsAppLink
                  label={`Studi kasus ${study.slug} — Tanya pendekatan`}
                  className="btn btn-solid"
                >
                  Tanya pendekatan
                </WhatsAppLink>
              </div>
            }
          />
        </div>
      </section>
    </>
  );
}
