import Link from "next/link";
import Button, { buttonStyles } from "./components/button";
import Card from "./components/card";
import Input from "./components/input";

const stats = [
  { value: "500+", label: "Pelanggan senang" },
  { value: "20+", label: "Varian kue" },
  { value: "4.9", label: "Rating pembeli" },
];

const categories = [
  { name: "Birthday Cake", emoji: "🎂", tone: "bg-strawberry-100" },
  { name: "Cupcake", emoji: "🧁", tone: "bg-butter-100" },
  { name: "Pastry", emoji: "🥐", tone: "bg-pistachio-100" },
  { name: "Custom Cake", emoji: "🍰", tone: "bg-blueberry-100" },
];

const products = [
  {
    name: "Strawberry Shortcake",
    price: "Rp 185.000",
    emoji: "🍰",
    tone: "bg-strawberry-100",
  },
  {
    name: "Vanilla Cupcake",
    price: "Rp 25.000",
    emoji: "🧁",
    tone: "bg-butter-100",
  },
  {
    name: "Matcha Roll Cake",
    price: "Rp 150.000",
    emoji: "🍵",
    tone: "bg-pistachio-100",
  },
  {
    name: "Blueberry Cheesecake",
    price: "Rp 210.000",
    emoji: "🫐",
    tone: "bg-blueberry-100",
  },
];

const features = [
  {
    title: "Bahan premium",
    description:
      "Butter asli, telur segar, dan cokelat pilihan. Tanpa pengawet tambahan.",
    emoji: "🧈",
    tone: "bg-butter-200",
  },
  {
    title: "Dipanggang hari ini",
    description:
      "Semua pesanan dibuat di hari pengiriman, jadi kue sampai dalam kondisi fresh.",
    emoji: "⏰",
    tone: "bg-pistachio-200",
  },
  {
    title: "Antar tepat waktu",
    description:
      "Gratis ongkir area Jakarta untuk pembelian di atas Rp 200.000.",
    emoji: "🚚",
    tone: "bg-blueberry-200",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* ---------- Hero ---------- */}
      <section className="bg-gradient-to-b from-strawberry-50 to-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-butter-200 px-4 py-1.5 text-xs font-semibold text-cocoa-700">
                🍓 Fresh dari oven setiap pagi
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-cocoa-900 sm:text-5xl">
                Kue manis untuk{" "}
                <span className="text-strawberry-700">momen manis</span> kamu
              </h1>
              <p className="mt-4 max-w-md text-cocoa-500">
                Dari ulang tahun sampai syukuran kecil di rumah. Pesan hari ini,
                kami panggang dan antar sampai depan pintu.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/products" className={buttonStyles({ size: "lg" })}>
                  Pesan Sekarang
                </Link>
                <Link
                  href="/about"
                  className={buttonStyles({ variant: "outline", size: "lg" })}
                >
                  Lihat Cerita Kami
                </Link>
              </div>

              <dl className="mt-10 flex flex-wrap gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-2xl font-bold text-strawberry-700">
                      {stat.value}
                    </dt>
                    <dd className="text-sm text-cocoa-500">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Placeholder visual — ganti dengan <Image> foto kue asli */}
            <div
              className="relative mx-auto aspect-square w-full max-w-sm"
              aria-hidden="true"
            >
              <div className="absolute inset-0 rounded-full bg-strawberry-100" />
              <div className="absolute inset-10 rounded-full bg-butter-100" />
              <div className="absolute inset-0 flex items-center justify-center text-[8rem]">
                🎂
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Kategori ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-cocoa-900">Pilih kategori</h2>
        <p className="mt-1 text-sm text-cocoa-500">
          Cari yang paling pas untuk acara kamu.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.name} href="/products" className="group">
              <Card
                variant="soft"
                className="text-center transition duration-300 group-hover:border-strawberry-300"
              >
                <span className={`inline-block rounded-2xl ${category.tone} p-4 text-3xl`}>
                  {category.emoji}
                </span>
                <p className="mt-3 font-semibold text-cocoa-900">
                  {category.name}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Best seller ---------- */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-cocoa-900">Best seller</h2>
              <p className="mt-1 text-sm text-cocoa-500">
                Yang paling sering dipesan bulan ini.
              </p>
            </div>
            <Link
              href="/products"
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Lihat semua →
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Card key={product.name} className="flex flex-col">
                <div
                  className={`flex aspect-[4/3] items-center justify-center rounded-2xl text-5xl ${product.tone}`}
                  aria-hidden="true"
                >
                  {product.emoji}
                </div>
                <h3 className="mt-4 font-semibold text-cocoa-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-strawberry-700">
                  {product.price}
                </p>
                <Button variant="outline" size="sm" fullWidth className="mt-4">
                  Tambah ke keranjang
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Kenapa kami ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-cocoa-900">
          Kenapa Hadish Cake?
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} variant="outline">
              <span className={`inline-block rounded-2xl ${feature.tone} p-3 text-2xl`}>
                {feature.emoji}
              </span>
              <h3 className="mt-4 font-semibold text-cocoa-900">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-cocoa-500">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- Newsletter ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Card variant="soft" className="px-6 py-10 text-center">
          <h2 className="text-2xl font-bold text-cocoa-900">
            Dapat info promo duluan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cocoa-500">
            Daftar newsletter dan dapatkan diskon 10% untuk pesanan pertama
            kamu.
          </p>

          <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                type="email"
                name="email"
                placeholder="nama@email.com"
                aria-label="Alamat email"
                required
              />
            </div>
            <Button type="submit">Daftar</Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
