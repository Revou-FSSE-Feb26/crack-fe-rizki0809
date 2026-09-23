import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "../components/button";
import Card from "../components/card";

export const metadata: Metadata = {
  title: "Bantuan — Hadish Cake",
  description:
    "Cara memesan kue di Hadish Cake, aturan pengambilan, dan jawaban pertanyaan yang sering muncul.",
};

const steps = [
  {
    title: "Pilih kue",
    description:
      "Buka halaman Menu, lalu tambahkan kue yang kamu mau ke keranjang.",
    emoji: "🍰",
  },
  {
    title: "Tentukan tanggal ambil",
    description:
      "Di keranjang, pilih tanggal pengambilan. Paling cepat besok, karena kue dibuat H-1.",
    emoji: "📅",
  },
  {
    title: "Buat pesanan",
    description:
      "Masuk ke akunmu, lalu tekan Buat pesanan. Kamu akan dapat nomor pesanan.",
    emoji: "✅",
  },
  {
    title: "Ambil di toko",
    description:
      "Tunggu status berubah jadi Siap diambil, lalu datang ke toko sambil menyebut nomor pesanan.",
    emoji: "🏪",
  },
];

const statuses = [
  {
    label: "Menunggu konfirmasi",
    description: "Pesanan sudah masuk dan sedang kami periksa.",
  },
  {
    label: "Dikonfirmasi",
    description: "Pesanan kami terima dan kuenya masuk jadwal produksi.",
  },
  {
    label: "Siap diambil",
    description: "Kue sudah jadi dan menunggu kamu jemput di toko.",
  },
  { label: "Selesai", description: "Kue sudah kamu ambil. Terima kasih!" },
  {
    label: "Dibatalkan",
    description: "Pesanan dibatalkan olehmu atau oleh kami.",
  },
];

const faqs = [
  {
    question: "Kenapa saya tidak bisa memesan untuk hari ini?",
    answer:
      "Semua kue dipanggang khusus untuk pesananmu, dan itu butuh waktu sehari. Karena itu tanggal pengambilan paling cepat adalah besok.",
  },
  {
    question: "Bisakah saya mengubah tanggal pengambilan?",
    answer:
      "Bisa, selama status pesanannya masih Menunggu konfirmasi atau Dikonfirmasi. Buka halaman Pesanan Saya, lalu tekan Ganti tanggal.",
  },
  {
    question: "Bagaimana kalau saya ingin membatalkan?",
    answer:
      "Selama kuenya belum mulai disiapkan, kamu bisa membatalkan sendiri lewat halaman Pesanan Saya. Setelah status Siap diambil, hubungi kami lewat WhatsApp.",
  },
  {
    question: "Apakah harga bisa berubah setelah saya memesan?",
    answer:
      "Tidak. Harga dikunci saat pesanan dibuat, jadi perubahan harga menu setelahnya tidak memengaruhi pesananmu.",
  },
  {
    question: "Apakah ada pengantaran?",
    answer:
      "Belum. Saat ini semua pesanan diambil sendiri di toko pada tanggal yang kamu pilih.",
  },
  {
    question: "Saya mau pesan kue custom atau jumlah banyak.",
    answer:
      "Hubungi kami lewat WhatsApp supaya bisa kami bantu sesuaikan bentuk, ukuran, dan jadwalnya.",
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cocoa-900">Bantuan</h1>
        <p className="mt-1 text-cocoa-500">
          Cara memesan, aturan pengambilan, dan pertanyaan yang sering muncul.
        </p>
      </header>

      {/* ---------- Cara pesan ---------- */}
      <section id="cara-pesan" className="scroll-mt-20">
        <h2 className="text-xl font-bold text-cocoa-900">Cara pesan</h2>

        <ol className="mt-4 flex flex-col gap-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-2xl bg-strawberry-100 text-xl"
                >
                  {step.emoji}
                </span>
                <div>
                  <p className="font-semibold text-cocoa-900">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-sm text-cocoa-500">
                    {step.description}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <Link
          href="/products"
          className={buttonStyles({ className: "mt-5" })}
        >
          Mulai pilih kue
        </Link>
      </section>

      {/* ---------- Pengambilan ---------- */}
      <section id="pengiriman" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-bold text-cocoa-900">Pengambilan pesanan</h2>
        <p className="mt-2 text-sm text-cocoa-500">
          Hadish Cake belum melayani pengantaran. Semua pesanan diambil sendiri
          di toko pada tanggal yang kamu pilih saat memesan.
        </p>

        <Card variant="soft" className="mt-4">
          <p className="text-sm font-semibold text-cocoa-900">
            Arti setiap status pesanan
          </p>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            {statuses.map((status) => (
              <div
                key={status.label}
                className="flex flex-wrap gap-x-3 gap-y-1"
              >
                <dt className="font-semibold text-cocoa-700">
                  {status.label}
                </dt>
                <dd className="flex-1 text-cocoa-500">{status.description}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-bold text-cocoa-900">
          Pertanyaan yang sering muncul
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          {faqs.map((faq) => (
            // <details> memberi buka-tutup bawaan browser, tanpa JavaScript.
            <details
              key={faq.question}
              className="rounded-3xl border border-cream-400 bg-cream-50 p-5"
            >
              <summary className="cursor-pointer font-semibold text-cocoa-900 marker:text-strawberry-700">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm text-cocoa-500">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Kontak ---------- */}
      <section id="kontak" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-bold text-cocoa-900">Masih bingung?</h2>

        <Card variant="soft" className="mt-4">
          <p className="text-sm text-cocoa-500">
            Chat kami lewat WhatsApp. Pesan yang masuk dibalas pada jam buka
            toko, Senin sampai Sabtu, 08.00 - 17.00 WIB.
          </p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ size: "sm", className: "mt-4" })}
          >
            Chat WhatsApp
          </a>
        </Card>
      </section>
    </main>
  );
}
