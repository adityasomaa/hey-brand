import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TransitionLink } from "@/components/TransitionLink";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Penjelasan data apa saja yang diproses situs Hey._.Brand!, bagaimana penyimpanan lokal digunakan, dan bagaimana pilihan Anda diterapkan.",
  alternates: { canonical: "/kebijakan-privasi" },
};

/**
 * Written to describe what this site actually does, and nothing more. No dates,
 * no retention periods in days, no company registration details, no third-party
 * processor list beyond the ones genuinely involved — none of that was
 * confirmed, so none of it is stated.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        label="Informasi"
        headline="Kebijakan Privasi"
        description="Halaman ini menjelaskan data apa yang diproses ketika Anda membuka situs ini, dan apa yang terjadi pada pilihan yang Anda buat di banner penyimpanan lokal."
      />

      <section className="shell pb-block">
        <div className="prose-legal measure">
          <h2>Ringkasan</h2>
          <p>
            Situs ini tidak memiliki akun pengguna, tidak memasang pelacak iklan,
            dan tidak mengirimkan isian formulir ke server kami. Satu-satunya data
            yang mungkin disimpan di peramban Anda adalah catatan pilihan pada
            banner penyimpanan lokal, dan draf formulir kontak apabila Anda
            mengizinkannya.
          </p>

          <h2>Data yang diproses</h2>
          <h3>Isian formulir kontak</h3>
          <p>
            Ketika Anda mengisi formulir kontak, isian tersebut diperiksa
            kelengkapannya, lalu dirangkum menjadi satu pesan WhatsApp. Pesan itu
            tidak terkirim dengan sendirinya. Pesan hanya terkirim apabila Anda
            menekan tombol kirim di dalam aplikasi WhatsApp Anda. Sampai titik itu,
            isian tersebut tidak berpindah ke pihak mana pun.
          </p>

          <h3>Penyimpanan lokal di peramban</h3>
          <p>
            Situs ini dapat menyimpan dua hal di peramban Anda:
          </p>
          <ul>
            <li>
              Catatan pilihan Anda pada banner penyimpanan lokal. Catatan ini
              disimpan agar banner tidak muncul berulang kali.
            </li>
            <li>
              Draf formulir kontak, apabila Anda memilih Izinkan. Draf ini
              berguna supaya isian tidak hilang ketika halaman dimuat ulang.
            </li>
          </ul>
          <p>
            Apabila Anda memilih Tolak, draf tidak disimpan sama sekali, dan draf
            yang sebelumnya tersimpan akan dihapus dari peramban Anda saat itu
            juga. Kedua data ini berada di perangkat Anda dan tidak dikirimkan ke
            mana pun.
          </p>

          <h3>Data teknis</h3>
          <p>
            Seperti umumnya situs web, penyedia hosting dapat mencatat data teknis
            permintaan seperti alamat IP dan jenis peramban untuk keperluan
            pengoperasian dan keamanan layanan. Pencatatan tersebut dilakukan oleh
            penyedia hosting, bukan oleh kami, dan tidak kami gunakan untuk
            membentuk profil pengunjung.
          </p>

          <h2>Layanan pihak ketiga</h2>
          <p>
            Tombol WhatsApp pada situs ini mengarahkan Anda ke aplikasi atau situs
            WhatsApp. Setelah Anda berpindah ke sana, pemrosesan data mengikuti
            ketentuan WhatsApp, bukan halaman ini.
          </p>

          <h2>Mengubah pilihan Anda</h2>
          <p>
            Anda dapat mengubah pilihan penyimpanan lokal kapan saja dengan
            menghapus data situs ini melalui pengaturan peramban Anda. Setelah
            dihapus, banner akan muncul kembali dan Anda dapat memilih ulang.
          </p>

          <h2>Pertanyaan</h2>
          <p>
            Pertanyaan mengenai halaman ini dapat disampaikan melalui{" "}
            <TransitionLink href="/kontak" className="link-draw text-accent-ink">
              halaman kontak
            </TransitionLink>
            . Kami melayani area {site.areaLabel}.
          </p>

          <h2>Perubahan</h2>
          <p>
            Ketentuan pada halaman ini dapat disesuaikan apabila cara kerja situs
            berubah. Versi yang berlaku adalah versi yang tampil di halaman ini.
          </p>
        </div>
      </section>
    </>
  );
}
