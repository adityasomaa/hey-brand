import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { process, services } from "@/data/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Tiga lini layanan branding: strategy, identity, dan social media management. Cakupan kerja untuk brand di Jakarta dan Tangerang, dibahas lewat konsultasi.",
  alternates: { canonical: "/layanan" },
};

export default function LayananPage() {
  return (
    <>
      <PageHeader
        label="Layanan"
        headline="Strategy, identity, social media management"
        description={`Tiga lini ini yang kami kerjakan. Cakupannya disesuaikan per brand, jadi ruang lingkup dan biayanya ditetapkan setelah percakapan awal, bukan dari daftar paket. Kami melayani area ${site.areaLabel}.`}
        cta={
          <TransitionLink href="/kontak" className="btn btn-solid">
            Bahas kebutuhan Anda
          </TransitionLink>
        }
      />

      {/* --- three service lines -------------------------------------------- */}
      <section className="shell pb-block" aria-labelledby="lini-heading">
        <h2 id="lini-heading" className="visually-hidden">
          Tiga lini layanan
        </h2>

        <div className="border-t border-line">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 80}>
              <article className="grid gap-6 border-b border-line py-12 md:grid-cols-[15rem_1fr] md:gap-12 lg:grid-cols-[22rem_1fr]">
                <div>
                  <p className="text-meta tracking-[0.14em] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h2 headline">{service.name}</h3>
                </div>

                <div>
                  <p className="measure text-lede text-ink">{service.summary}</p>
                  <p className="mt-5 measure text-ink-soft">{service.body}</p>

                  <h4 className="mt-8 text-meta uppercase tracking-[0.12em] text-ink-faint">
                    Yang biasanya dihasilkan
                  </h4>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex gap-3 text-ink-soft">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-px w-4 flex-none bg-accent"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <WhatsAppLink
                      label={`Layanan — ${service.name}`}
                      className="link-draw text-accent-ink"
                    >
                      Tanya soal {service.name}
                    </WhatsAppLink>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- how the work runs ---------------------------------------------- */}
      <section className="bg-paper-sunk py-block" aria-labelledby="cara-kerja-heading">
        <div className="shell">
          <Reveal>
            <SectionHeader
              headingId="cara-kerja-heading"
              label="Cara kerja"
              headline="Empat tahap yang sama untuk setiap pekerjaan"
              description="Urutan ini berlaku baik untuk satu lini saja maupun ketiganya sekaligus. Durasi dan kedalaman tiap tahap menyesuaikan ruang lingkup yang disepakati."
              inlineCta
              cta={
                <TransitionLink href="/kontak" className="btn btn-outline">
                  Mulai dari percakapan
                </TransitionLink>
              }
            />
          </Reveal>

          <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((step, i) => (
              <li key={step.step}>
                <Reveal delay={i * 70}>
                  <div className="border-t border-ink pt-5">
                    <p className="text-meta tracking-[0.14em] text-accent-ink">
                      {step.step}
                    </p>
                    <h3 className="mt-3 text-h3">{step.title}</h3>
                    <p className="mt-3 text-ink-soft">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --- pricing note ---------------------------------------------------- */}
      <section className="shell py-block" aria-labelledby="biaya-heading">
        <Reveal>
          <SectionHeader
            headingId="biaya-heading"
            label="Biaya"
            headline="Tidak ada daftar harga di halaman ini"
            description="Ruang lingkup tiap brand berbeda, jadi angka yang dipasang di muka hampir selalu meleset. Biaya ditetapkan setelah kebutuhan jelas, dan disampaikan tertulis sebelum pengerjaan dimulai."
            cta={
              <WhatsAppLink label="Layanan — Tanya estimasi" className="btn btn-solid">
                Tanya estimasi
              </WhatsAppLink>
            }
          />
        </Reveal>
      </section>
    </>
  );
}
