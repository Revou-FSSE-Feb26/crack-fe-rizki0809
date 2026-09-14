import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "../components/button";
import Card from "../components/card";

export const metadata: Metadata = {
  title: "Tentang Kami — Hadish Cake",
  description:
    "Cerita di balik Hadish Cake: dari dapur rumah di Jakarta sampai ribuan kue yang sudah diantar.",
};

const values = [
  {
    title: "Jujur soal bahan",
    description:
      "Kami tulis semua bahan apa adanya. Tanpa pemanis buatan, tanpa pengawet tambahan.",
    emoji: "🧾",
    tone: "bg-butter-200",
  },
  {
    title: "Porsi kecil, rasa serius",
    description:
      "Setiap batch dibuat terbatas supaya kualitasnya bisa kami jaga satu per satu.",
    emoji: "👩‍🍳",
    tone: "bg-pistachio-200",
  },
  {
    title: "Ramah ke pelanggan",
    description:
      "Salah kirim atau kue tidak sesuai? Kami ganti tanpa banyak tanya.",
    emoji: "💝",
    tone: "bg-blueberry-200",
  },
];

const milestones = [
  {
    year: "2019",
    title: "Mulai dari dapur rumah",
    description:
      "Hadish Cake lahir dari resep brownies keluarga yang dijual ke tetangga.",
  },
  {
    year: "2021",
    title: "Pindah ke dapur produksi",
    description:
      "Permintaan naik, kami sewa dapur kecil di Jakarta Selatan dan merekrut dua orang.",
  },
  {
    year: "2023",
    title: "1.000 pesanan terkirim",
    description:
      "Custom cake jadi layanan paling diminati, terutama untuk ulang tahun anak.",
  },
  {
    year: "2025",
    title: "Buka toko online",
    description:
      "Sekarang kamu bisa pesan langsung dari website tanpa perlu chat dulu.",
  },
];

const team = [
  { name: "Hadish", role: "Founder & Head Baker", emoji: "👩‍🍳" },
  { name: "Rizki", role: "Operasional & Pengiriman", emoji: "🛵" },
  { name: "Nadia", role: "Desain Kue Custom", emoji: "🎨" },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* ---------- Hero ---------- */}
      <section className="bg-gradient-to-b from-strawberry-50 to-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-butter-200 px-4 py-1.5 text-xs font-semibold text-cocoa-700">
                Sejak 2019
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-cocoa-900 sm:text-4xl">
                Dari dapur rumah, untuk{" "}
                <span className="text-strawberry-700">momen kamu</span>
              </h1>
              <p className="mt-4 max-w-md text-cocoa-500">
                Hadish Cake bukan pabrik kue. Kami tim kecil yang percaya kue
                paling enak itu yang dibuat perlahan, dengan bahan yang kami
                sendiri mau makan.
              </p>
            </div>

            {/* Placeholder visual — ganti dengan <Image> foto dapur/tim */}
            <div
              className="relative mx-auto aspect-square w-full max-w-sm"
              aria-hidden="true"
            >
              <div className="absolute inset-0 rounded-[3rem] bg-pistachio-100" />
              <div className="absolute inset-10 rounded-[2rem] bg-strawberry-100" />
              <div className="absolute inset-0 flex items-center justify-center text-[7rem]">
                👩‍🍳
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Nilai kami ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-cocoa-900">Yang kami pegang</h2>
        <p className="mt-1 text-sm text-cocoa-500">
          Tiga hal yang tidak kami kompromikan sejak hari pertama.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title} variant="outline">
              <span
                className={`inline-block rounded-2xl ${value.tone} p-3 text-2xl`}
              >
                {value.emoji}
              </span>
              <h3 className="mt-4 font-semibold text-cocoa-900">
                {value.title}
              </h3>
              <p className="mt-1 text-sm text-cocoa-500">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- Perjalanan ---------- */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-cocoa-900">
            Perjalanan kami
          </h2>

          <ol className="mt-8 border-l-2 border-cream-400">
            {milestones.map((milestone) => (
              <li key={milestone.year} className="relative pb-8 pl-8 last:pb-0">
                <span
                  className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-cream-200 bg-strawberry-400"
                  aria-hidden="true"
                />
                <p className="text-sm font-bold text-strawberry-700">
                  {milestone.year}
                </p>
                <h3 className="mt-1 font-semibold text-cocoa-900">
                  {milestone.title}
                </h3>
                <p className="mt-1 text-sm text-cocoa-500">
                  {milestone.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Tim ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-cocoa-900">Tim kami</h2>
        <p className="mt-1 text-sm text-cocoa-500">
          Orang-orang di balik setiap kotak kue yang sampai ke kamu.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {team.map((member) => (
            <Card key={member.name} className="text-center">
              <span
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cream-200 text-4xl"
                aria-hidden="true"
              >
                {member.emoji}
              </span>
              <h3 className="mt-4 font-semibold text-cocoa-900">
                {member.name}
              </h3>
              <p className="mt-1 text-sm text-cocoa-500">{member.role}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Card variant="soft" className="px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-cocoa-900">
            Mau kue untuk acara kamu?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cocoa-500">
            Ceritakan idenya, kami bantu wujudkan. Pesanan custom sebaiknya
            dibuat H-3.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products" className={buttonStyles()}>
              Lihat Menu
            </Link>
            <a
              href="https://wa.me/6281234567890"
              className={buttonStyles({ variant: "outline" })}
            >
              Chat WhatsApp
            </a>
          </div>
        </Card>
      </section>
    </main>
  );
}
