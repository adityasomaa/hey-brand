import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description:
    "Ketentuan penggunaan situs Hey._.Brand! dan hal-hal yang perlu diketahui sebelum memulai pekerjaan branding.",
  alternates: { canonical: "/ketentuan-layanan" },
};

/**
 * Standard, neutral wording. No figures, no revision counts, no payment terms,
 * no turnaround promises: none of those were confirmed, so stating them here
 * would be inventing a contract on the agency's behalf.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader
        label="Informasi"
        headline="Ketentuan Layanan"
        description="Halaman ini menjelaskan ketentuan penggunaan situs, serta hal-hal umum yang berlaku sebelum sebuah pekerjaan disepakati secara tertulis."
      />

      <section className="shell pb-block">
        <div className="prose-legal measure">
          <h2>Penggunaan situs</h2>
          <p>
            Situs ini disediakan sebagai informasi mengenai layanan {site.name}.
            Anda dapat membaca, membagikan tautannya, dan menghubungi kami melalui
            saluran yang tersedia. Anda tidak diperkenankan menggunakan situs ini
            untuk kegiatan yang melanggar hukum, mengganggu pengoperasian situs,
            atau mengakses bagian yang tidak ditujukan untuk umum.
          </p>

          <h2>Isi halaman karya</h2>
          <p>
            Studi kasus yang ditampilkan pada halaman karya adalah contoh susunan
            dan ditandai sebagai contoh. Isinya tidak menggambarkan pekerjaan pada
            klien tertentu, tidak memuat nama perusahaan, dan tidak menyatakan
            hasil kampanye. Contoh tersebut dimaksudkan untuk menunjukkan struktur
            penyajian sebuah pekerjaan, bukan sebagai janji hasil.
          </p>

          <h2>Informasi pada situs</h2>
          <p>
            Keterangan layanan pada situs ini bersifat umum. Ruang lingkup,
            keluaran, jadwal, dan biaya untuk suatu pekerjaan ditetapkan
            tersendiri dan disepakati tertulis sebelum pengerjaan dimulai. Tidak
            ada bagian dari situs ini yang merupakan penawaran yang mengikat.
          </p>

          <h2>Kekayaan intelektual</h2>
          <p>
            Nama, tanda, tata letak, tulisan, dan materi visual pada situs ini
            merupakan milik pemiliknya masing-masing dan tidak boleh digunakan
            ulang tanpa izin. Ketentuan mengenai kepemilikan hasil kerja pada
            sebuah proyek diatur dalam kesepakatan proyek tersebut, bukan di
            halaman ini.
          </p>

          <h2>Tautan ke pihak ketiga</h2>
          <p>
            Situs ini memuat tautan ke layanan pihak ketiga, antara lain WhatsApp.
            Kami tidak mengendalikan layanan tersebut dan tidak bertanggung jawab
            atas isi maupun ketentuan yang berlaku di dalamnya.
          </p>

          <h2>Batasan tanggung jawab</h2>
          <p>
            Situs ini disediakan sebagaimana adanya. Kami berupaya menjaga
            informasi tetap akurat dan situs tetap dapat diakses, namun tidak
            menjamin situs bebas dari gangguan atau kekeliruan. Penggunaan
            informasi pada situs ini menjadi tanggung jawab pengguna.
          </p>

          <h2>Privasi</h2>
          <p>
            Penjelasan mengenai data yang diproses situs ini tersedia pada{" "}
            <TransitionLink
              href="/kebijakan-privasi"
              className="link-draw text-accent-ink"
            >
              Kebijakan Privasi
            </TransitionLink>
            .
          </p>

          <h2>Perubahan</h2>
          <p>
            Ketentuan pada halaman ini dapat disesuaikan sewaktu-waktu. Versi yang
            berlaku adalah versi yang tampil di halaman ini. Pertanyaan dapat
            disampaikan melalui{" "}
            <TransitionLink href="/kontak" className="link-draw text-accent-ink">
              halaman kontak
            </TransitionLink>
            .
          </p>
        </div>
      </section>
    </>
  );
}
