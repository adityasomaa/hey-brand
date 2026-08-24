/**
 * ============================================================================
 * CONTENT — the only file you need to edit to change what the site says.
 * ============================================================================
 *
 * Two collections live here:
 *
 *   1. `services`  — the three service lines. These are the lines Hey._.Brand!
 *                    named themselves. Do not add a fourth line here unless
 *                    the agency actually offers it; the services page, the
 *                    home summary and the contact form dropdown all read from
 *                    this array, so an invented entry would spread everywhere.
 *
 *   2. `caseStudies` — SAMPLE case studies. Read this before editing:
 *
 *        Every entry below is a STRUCTURAL EXAMPLE. No real client, brand,
 *        company or campaign is described. There are no names, no metrics, no
 *        outcome figures and no testimonials, because none were confirmed.
 *        The point of these entries is to show the shape a real case study
 *        would take: challenge, approach, result, each written as description
 *        rather than as a claim.
 *
 *        The UI labels every one of these as a sample in three places: on the
 *        card, at the top of the detail page, and in a closing note. If you
 *        replace one with real work, remove its `isSample: true` flag and the
 *        labels disappear for that entry only.
 *
 *        `art` picks which generated SVG composition the card and detail page
 *        use. The compositions are produced by `npm run art` from
 *        scripts/generate-art.mjs — deterministic, so regenerating gives you
 *        byte-identical files. Each slug gets a visibly different geometry so
 *        the cards never read as duplicates of one another.
 */

export type ServiceId = "strategy" | "identity" | "social-media";

export type Service = {
  id: ServiceId;
  /** Short name used in nav, dropdowns and cards. */
  name: string;
  /** One-line description. Appears under the name on the services page. */
  summary: string;
  /** Two or three sentences. Explains what the work is and who it is for. */
  body: string;
  /** What is typically produced. Descriptive, never a fixed package list. */
  deliverables: string[];
};

export const services: Service[] = [
  {
    id: "strategy",
    name: "Strategy",
    summary:
      "Menetapkan posisi brand, audiens yang dituju, dan pesan yang dipakai sebelum masuk ke eksekusi visual.",
    body:
      "Tahap ini menjawab pertanyaan dasar: brand ini untuk siapa, apa bedanya dengan yang lain di kategori yang sama, dan bagaimana cara bicaranya. Hasilnya dipakai sebagai acuan bersama, supaya keputusan desain dan konten setelahnya punya dasar yang sama dan tidak berubah arah setiap minggu.",
    deliverables: [
      "Pemetaan audiens dan kategori",
      "Positioning dan pembeda utama",
      "Kerangka pesan dan tone of voice",
      "Arahan penerapan untuk tim internal",
    ],
  },
  {
    id: "identity",
    name: "Identity",
    summary:
      "Menyusun sistem visual brand: logo, tipografi, warna, dan aturan pemakaiannya.",
    body:
      "Identitas dikerjakan sebagai sistem, bukan satu gambar. Selain logo, yang disusun adalah aturan mainnya: bagaimana tipografi bekerja di ukuran besar dan kecil, warna mana yang boleh berpasangan, dan seperti apa tampilannya saat dipakai di kemasan, dokumen, atau layar. Tujuannya supaya brand tetap terlihat konsisten ketika yang mengerjakan bukan lagi kami.",
    deliverables: [
      "Logo dan varian penggunaannya",
      "Skala tipografi dan palet warna",
      "Elemen grafis pendukung",
      "Panduan penerapan brand",
    ],
  },
  {
    id: "social-media",
    name: "Social Media Management",
    summary:
      "Mengelola kehadiran brand di media sosial: perencanaan konten, produksi, dan penjadwalan.",
    body:
      "Pengelolaan media sosial dijalankan mengikuti strategi dan identitas yang sudah disepakati, supaya feed tidak terasa lepas dari brand-nya. Cakupannya mulai dari menyusun rencana konten, memproduksi materinya, sampai menjadwalkan unggahan dan merapikan arsipnya. Ruang lingkup dan ritme unggahan disesuaikan per brand, dibahas di awal.",
    deliverables: [
      "Rencana konten berkala",
      "Produksi materi visual dan caption",
      "Penjadwalan dan pengarsipan unggahan",
      "Peninjauan berkala bersama klien",
    ],
  },
];

export type CaseStudy = {
  slug: string;
  /** Sector label, not a company. Kept generic on purpose. */
  sector: string;
  /** The headline of the case study. */
  title: string;
  /** One-line summary used on the card. */
  summary: string;
  /** Which service lines the sample touches. */
  disciplines: ServiceId[];
  /** Generated artwork id. See scripts/generate-art.mjs. */
  art: string;
  /**
   * Caption for the "behind the finish" layer that the card reveals on hover,
   * focus or tap. Describes the construction, not a claim about results.
   */
  processNote: string;
  /** Fixed three-part structure. Description only, deliberately no figures. */
  challenge: string;
  approach: string;
  result: string;
  /** Bullet list of what the sample scope would cover. */
  scope: string[];
  /** Marks the entry as an example. Remove when real work replaces it. */
  isSample: boolean;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "kedai-kopi-spesialti",
    sector: "Kedai kopi",
    title: "Identitas kedai kopi untuk dua lokasi",
    summary:
      "Contoh penyusunan identitas untuk kedai kopi yang tampilannya berbeda di setiap lokasi.",
    disciplines: ["strategy", "identity"],
    art: "orbit",
    processNote:
      "Susunan awal: logo diuji lebih dulu pada ukuran terkecil, papan nama dan cangkir, sebelum dipakai di ukuran besar.",
    challenge:
      "Sebuah kedai kopi membuka lokasi kedua dan mendapati kedua tempat itu terasa seperti dua usaha berbeda. Papan nama, menu, dan kemasan dibuat pada waktu yang berbeda oleh orang yang berbeda, tanpa acuan tertulis. Pemiliknya kesulitan menjelaskan kepada tim baru seperti apa tampilan yang benar.",
    approach:
      "Kerja dimulai dari perumusan posisi: kepada siapa kedai ini berbicara dan apa yang membedakannya dari kedai lain di sekitarnya. Setelah itu identitas disusun sebagai sistem, dengan logo yang diuji terlebih dahulu pada penerapan terkecil seperti cangkir dan papan nama, baru dinaikkan ke ukuran besar. Aturan pemakaian ditulis dalam bahasa yang bisa langsung dipakai staf, bukan hanya oleh desainer.",
    result:
      "Kedua lokasi memakai satu set aturan yang sama, sehingga materi baru bisa dibuat tanpa menunggu persetujuan visual satu per satu. Pemilik punya dokumen acuan untuk diberikan ke vendor cetak dan ke staf yang baru bergabung.",
    scope: [
      "Perumusan posisi dan audiens",
      "Sistem logo dan varian ukuran kecil",
      "Palet warna dan tipografi",
      "Panduan penerapan untuk staf",
    ],
    isSample: true,
  },
  {
    slug: "produk-perawatan-kulit",
    sector: "Produk perawatan kulit",
    title: "Menata arsitektur brand lini produk",
    summary:
      "Contoh penataan hubungan antara brand induk dan sub-lini produk yang tumbuh tanpa aturan.",
    disciplines: ["strategy", "identity"],
    art: "strata",
    processNote:
      "Susunan awal: setiap sub-lini dipetakan sebagai lapisan, lalu diuji apakah masih terbaca sebagai satu keluarga di rak.",
    challenge:
      "Sebuah brand perawatan kulit menambah varian produk lebih cepat daripada kemampuannya menata kemasan. Setiap varian baru dibuat mengikuti tren saat itu, sehingga di rak produk-produknya tidak terbaca sebagai satu keluarga. Tim penjualan kesulitan menjelaskan urutan pemakaian antar produk.",
    approach:
      "Yang dipetakan lebih dulu adalah hubungan antar produk: mana yang berdiri sendiri, mana yang merupakan turunan, dan mana yang seharusnya digabung. Dari peta itu disusun sistem kemasan berlapis, dengan elemen tetap yang menandai brand induk dan elemen berubah yang menandai varian. Sistemnya diuji dengan menempatkan varian yang sudah ada dan varian yang belum dibuat di satu bidang yang sama.",
    result:
      "Varian baru bisa masuk ke sistem tanpa desain ulang dari nol, dan urutan pemakaian produk terbaca dari kemasannya sendiri. Brand induk tetap terlihat ketika produk dipajang berdampingan dengan merek lain.",
    scope: [
      "Pemetaan arsitektur brand",
      "Sistem kemasan berlapis",
      "Aturan penamaan varian",
      "Uji keterbacaan di rak",
    ],
    isSample: true,
  },
  {
    slug: "studio-kebugaran",
    sector: "Studio kebugaran",
    title: "Menyeragamkan suara brand di media sosial",
    summary:
      "Contoh penyusunan kerangka konten agar unggahan harian tetap terdengar seperti satu brand.",
    disciplines: ["strategy", "social-media"],
    art: "cadence",
    processNote:
      "Susunan awal: konten dipilah ke dalam beberapa jenis tetap, supaya jadwal unggah tidak dimulai dari halaman kosong.",
    challenge:
      "Sebuah studio kebugaran mengelola media sosialnya secara bergantian antar staf. Karena tidak ada acuan, nada bicaranya berubah-ubah, kadang formal kadang sangat santai, dan format unggahannya berbeda setiap minggu. Pengikut sulit mengenali unggahan studio ini di antara unggahan lain.",
    approach:
      "Nada bicara dirumuskan lebih dulu dalam bentuk contoh kalimat, bukan kata sifat, sehingga bisa langsung ditiru. Konten kemudian dipilah menjadi beberapa jenis tetap dengan format yang sudah ditentukan, agar penyusun jadwal tidak mulai dari halaman kosong setiap kali. Rencana konten disusun berkala dan ditinjau bersama.",
    result:
      "Unggahan harian dibuat lebih cepat karena formatnya sudah tersedia, dan siapa pun yang menyusun jadwal menghasilkan nada yang sama. Studio punya acuan untuk menilai apakah sebuah unggahan sudah sesuai sebelum tayang.",
    scope: [
      "Kerangka pesan dan tone of voice",
      "Jenis konten dan format tetap",
      "Rencana konten berkala",
      "Peninjauan berkala",
    ],
    isSample: true,
  },
  {
    slug: "layanan-katering",
    sector: "Layanan katering",
    title: "Satu identitas untuk dua jenis pemesan",
    summary:
      "Contoh penyusunan identitas yang harus bekerja untuk pemesan perorangan dan korporat sekaligus.",
    disciplines: ["strategy", "identity", "social-media"],
    art: "aperture",
    processNote:
      "Susunan awal: satu sistem, dua tingkat formalitas, diuji berdampingan agar keduanya tetap terlihat satu brand.",
    challenge:
      "Sebuah layanan katering melayani dua jenis pemesan dengan kebutuhan yang berbeda: perorangan untuk acara keluarga, dan perusahaan untuk acara kantor. Materi promosinya dibuat terpisah untuk keduanya, dan lama-lama keduanya tidak lagi terlihat berasal dari usaha yang sama.",
    approach:
      "Alih-alih membuat dua brand, disusun satu sistem dengan dua tingkat formalitas: susunan tipografi dan warna yang sama, dengan pengaturan yang lebih tenang untuk materi korporat dan lebih hangat untuk materi perorangan. Kedua penerapan diuji berdampingan pada tahap perancangan agar perbedaannya terasa disengaja, bukan seperti dua brand yang tidak sengaja bertabrakan.",
    result:
      "Materi untuk kedua jenis pemesan tetap terbaca sebagai satu brand, dan tim bisa menyiapkan penawaran baru tanpa memutuskan ulang tampilannya setiap kali. Akun media sosialnya memakai acuan yang sama.",
    scope: [
      "Positioning untuk dua segmen",
      "Sistem identitas dengan dua tingkat formalitas",
      "Template materi penawaran",
      "Penerapan di media sosial",
    ],
    isSample: true,
  },
  {
    slug: "toko-perabot",
    sector: "Toko perabot",
    title: "Panduan brand yang bisa dijalankan vendor",
    summary:
      "Contoh penyusunan panduan yang bisa dijalankan pihak ketiga tanpa pendampingan.",
    disciplines: ["identity"],
    art: "lattice",
    processNote:
      "Susunan awal: setiap aturan ditulis sebagai contoh benar dan salah berdampingan, bukan sebagai paragraf penjelasan.",
    challenge:
      "Sebuah toko perabot bekerja dengan banyak vendor luar untuk cetak, pameran, dan foto produk. Setiap vendor menerima berkas logo tanpa penjelasan, sehingga hasilnya berbeda-beda: proporsi berubah, warna bergeser, dan jarak aman diabaikan. Perbaikan dilakukan setelah materi tercetak.",
    approach:
      "Panduan disusun untuk pembaca yang tidak hadir dalam rapat. Setiap aturan ditulis berpasangan sebagai contoh benar dan contoh salah, sehingga bisa dinilai sekilas tanpa membaca paragraf. Berkas dikemas per keperluan, dengan format dan ruang warna yang sudah sesuai, agar vendor tidak perlu mengonversi sendiri.",
    result:
      "Vendor bisa mengerjakan materi baru langsung dari paket yang diberikan, dan koreksi berpindah dari tahap setelah cetak ke tahap sebelum cetak. Toko punya satu berkas yang bisa dikirim ulang setiap kali bekerja dengan vendor baru.",
    scope: [
      "Panduan penerapan logo",
      "Aturan warna dan jarak aman",
      "Paket berkas per keperluan",
      "Contoh benar dan salah",
    ],
    isSample: true,
  },
];

/** Helper used by the detail route and the sitemap. */
export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getService(id: ServiceId): Service | undefined {
  return services.find((s) => s.id === id);
}

/**
 * How the work is run. Deliberately process description, not a promise about
 * timelines or outcomes, because neither was confirmed.
 */
export const process = [
  {
    step: "01",
    title: "Percakapan awal",
    body:
      "Membahas kondisi brand sekarang, apa yang ingin dicapai, dan apa yang sudah pernah dicoba. Dari sini terlihat pekerjaan mana yang sebenarnya dibutuhkan.",
  },
  {
    step: "02",
    title: "Ruang lingkup",
    body:
      "Menetapkan apa yang dikerjakan, apa yang tidak, dan bentuk hasil akhirnya. Ruang lingkup disepakati tertulis sebelum pengerjaan dimulai.",
  },
  {
    step: "03",
    title: "Pengerjaan",
    body:
      "Pekerjaan berjalan bertahap dengan titik peninjauan yang sudah dijadwalkan, supaya arah bisa dikoreksi lebih awal, bukan di akhir.",
  },
  {
    step: "04",
    title: "Serah terima",
    body:
      "Berkas dan acuan diserahkan dalam bentuk yang bisa dipakai tim internal maupun vendor luar, disertai penjelasan pemakaiannya.",
  },
];
