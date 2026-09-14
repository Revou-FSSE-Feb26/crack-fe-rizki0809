import type { Metadata } from "next";
import Link from "next/link";
import Button, { buttonStyles } from "../components/button";
import Card from "../components/card";
import { categories, formatPrice, products } from "../data/products";

export const metadata: Metadata = {
  title: "Menu Kue — Hadish Cake",
  description:
    "Semua pilihan kue Hadish Cake: birthday cake, cupcake, pastry, dan custom cake.",
};

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const { kategori } = await searchParams;
  const activeSlug = typeof kategori === "string" ? kategori : undefined;

  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const visibleProducts = activeSlug
    ? products.filter((product) => product.category === activeSlug)
    : products;

  return (
    <main className="flex-1">
      {/* ---------- Judul halaman ---------- */}
      <section className="bg-gradient-to-b from-strawberry-50 to-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-cocoa-900 sm:text-4xl">
            {activeCategory ? activeCategory.name : "Semua Kue"}
          </h1>
          <p className="mt-2 max-w-lg text-cocoa-500">
            {activeCategory
              ? `Pilihan ${activeCategory.name.toLowerCase()} yang kami panggang segar setiap hari.`
              : "Semua kue dibuat di hari pengiriman. Pesan H-1 untuk hasil terbaik."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ---------- Filter kategori ---------- */}
        <nav aria-label="Filter kategori" className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className={buttonStyles({
              variant: activeSlug ? "outline" : "primary",
              size: "sm",
            })}
          >
            Semua
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?kategori=${category.slug}`}
              className={buttonStyles({
                variant: activeSlug === category.slug ? "primary" : "outline",
                size: "sm",
              })}
            >
              {category.emoji} {category.name}
            </Link>
          ))}
        </nav>

        <p className="mt-5 text-sm text-cocoa-500">
          Menampilkan {visibleProducts.length} dari {products.length} kue
        </p>

        {/* ---------- Grid produk ---------- */}
        {visibleProducts.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <Card key={product.name} className="flex flex-col">
                <div
                  className={`flex aspect-[4/3] items-center justify-center rounded-2xl text-5xl ${product.tone}`}
                  aria-hidden="true"
                >
                  {product.emoji}
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-cocoa-900">
                    {product.name}
                  </h2>
                  {product.bestSeller && (
                    <span className="shrink-0 rounded-full bg-butter-200 px-2.5 py-1 text-[11px] font-semibold text-cocoa-700">
                      Best seller
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-cocoa-500">
                  {product.description}
                </p>

                {/* mt-auto menjaga harga & tombol tetap rata bawah antar kartu */}
                <p className="mt-auto pt-4 text-lg font-bold text-strawberry-700">
                  {formatPrice(product.price)}
                </p>
                <Button variant="outline" size="sm" fullWidth className="mt-3">
                  Tambah ke keranjang
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="soft" className="mt-5 py-12 text-center">
            <p className="text-4xl" aria-hidden="true">
              🍽️
            </p>
            <h2 className="mt-3 font-semibold text-cocoa-900">
              Belum ada kue di kategori ini
            </h2>
            <p className="mt-1 text-sm text-cocoa-500">
              Coba lihat kategori lain, atau hubungi kami untuk pesanan khusus.
            </p>
            <Link
              href="/products"
              className={buttonStyles({ size: "sm", className: "mt-5" })}
            >
              Lihat semua kue
            </Link>
          </Card>
        )}
      </div>
    </main>
  );
}
