import { PageHeader } from "@/components/PageHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { nav } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <PageHeader
        label="404"
        headline="Halaman ini tidak ditemukan"
        description="Tautannya mungkin sudah berubah atau salah ketik. Berikut halaman yang tersedia."
        cta={
          <TransitionLink href="/" className="btn btn-solid">
            Kembali ke beranda
          </TransitionLink>
        }
      />

      <section className="shell pb-block" aria-labelledby="daftar-halaman">
        <h2 id="daftar-halaman" className="text-meta uppercase tracking-[0.12em] text-ink-faint">
          Semua halaman
        </h2>
        <ul className="mt-6 border-t border-line">
          {nav.map((item) => (
            <li key={item.href} className="border-b border-line">
              <TransitionLink
                href={item.href}
                className="link-draw block py-5 text-h3"
              >
                {item.label}
              </TransitionLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
