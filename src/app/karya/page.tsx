import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { WorkCard } from "@/components/WorkCard";
import { caseStudies } from "@/data/content";

export const metadata: Metadata = {
  title: "Karya",
  description:
    "Contoh susunan studi kasus branding: tantangan, pendekatan, dan hasil, untuk pekerjaan strategy, identity, dan social media management di Jakarta dan Tangerang.",
  alternates: { canonical: "/karya" },
};

export default function KaryaPage() {
  return (
    <>
      <PageHeader
        label="Karya"
        headline="Studi kasus dan cara kami menyusunnya"
        description="Halaman ini berisi contoh susunan studi kasus, bukan pekerjaan klien. Nama perusahaan, angka, dan hasil kampanye sengaja tidak dicantumkan. Yang ditunjukkan adalah strukturnya: bagaimana sebuah pekerjaan dijelaskan dari tantangan sampai hasil."
        cta={
          <WhatsAppLink label="Karya — Tanya proses kerja" className="btn btn-solid">
            Tanya proses kerja
          </WhatsAppLink>
        }
      />

      <section className="shell pb-block" aria-labelledby="daftar-karya">
        <h2 id="daftar-karya" className="visually-hidden">
          Daftar studi kasus
        </h2>

        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {caseStudies.map((study, i) => (
            <Reveal key={study.slug} delay={(i % 2) * 90}>
              <WorkCard study={study} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper-sunk py-block" aria-labelledby="catatan-contoh">
        <div className="shell">
          <Reveal>
            <SectionHeader
              headingId="catatan-contoh"
              label="Catatan"
              headline="Kenapa isinya contoh"
              description="Kami tidak menampilkan nama klien atau hasil kampanye tanpa izin dan tanpa data yang bisa diverifikasi. Sampai keduanya tersedia, halaman ini memakai contoh susunan agar strukturnya tetap bisa dinilai."
              cta={
                <TransitionLink href="/layanan" className="btn btn-outline">
                  Lihat layanan
                </TransitionLink>
              }
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
