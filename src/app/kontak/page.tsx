import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { services } from "@/data/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Hey._.Brand! untuk membahas kebutuhan branding: strategy, identity, atau social media management. Melayani area Jakarta dan Tangerang.",
  alternates: { canonical: "/kontak" },
};

export default function KontakPage() {
  return (
    <>
      <PageHeader
        label="Kontak"
        headline="Ceritakan brand yang ingin dibenahi"
        description="Isi formulir di bawah dan isiannya akan dirangkum menjadi satu pesan WhatsApp yang siap Anda kirim, lengkap dengan halaman asal pengiriman. Belum tahu layanan mana yang dibutuhkan juga tidak masalah, itu bagian dari percakapan awal."
      />

      <section className="shell pb-block" aria-labelledby="form-heading">
        <div className="grid gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-20">
          <div>
            <h2 id="form-heading" className="text-h3 headline">
              Formulir kontak
            </h2>
            <p className="mt-4 measure text-ink-soft">
              Tanda bintang tidak dipakai di sini; semua kolom kecuali catatan wajib
              diisi, dan kesalahan pengisian ditandai langsung di kolomnya.
            </p>

            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <Reveal>
            <aside className="rounded-lg border border-line bg-paper-sunk p-6 md:p-8">
              <h2 className="text-h3 headline">Sebelum mengirim</h2>

              <dl className="mt-6 flex flex-col gap-6">
                <div>
                  <dt className="text-meta uppercase tracking-[0.12em] text-ink-faint">
                    Area layanan
                  </dt>
                  <dd className="mt-1.5 text-ink">{site.areaLabel}</dd>
                </div>

                <div>
                  <dt className="text-meta uppercase tracking-[0.12em] text-ink-faint">
                    Lini layanan
                  </dt>
                  <dd className="mt-1.5 text-ink">
                    {services.map((s) => s.name).join(", ")}
                  </dd>
                </div>

                <div>
                  <dt className="text-meta uppercase tracking-[0.12em] text-ink-faint">
                    Biaya
                  </dt>
                  <dd className="mt-1.5 text-ink-soft">
                    Ditetapkan setelah ruang lingkup jelas, dan disampaikan tertulis
                    sebelum pengerjaan.
                  </dd>
                </div>

                {/* Rendered only when an address has actually been configured. */}
                {site.email ? (
                  <div>
                    <dt className="text-meta uppercase tracking-[0.12em] text-ink-faint">
                      Email
                    </dt>
                    <dd className="mt-1.5">
                      <a
                        href={`mailto:${site.email}`}
                        className="link-draw text-accent-ink"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>

              <hr className="rule my-7" />

              <p className="text-ink-soft">
                Lebih suka langsung mengetik sendiri? Buka WhatsApp dengan pesan
                pembuka yang sudah terisi.
              </p>
              <WhatsAppLink
                label="Kontak — Chat langsung"
                className="btn btn-outline mt-5"
              >
                Chat langsung
              </WhatsAppLink>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
