"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Alert from "../components/alert";
import { buttonStyles } from "../components/button";
import Card from "../components/card";
import ProductCard from "../components/product-card";
import { Skeleton } from "../components/spinner";
import type { Category, Paginated, Product } from "../lib/types";
import { usePublicResource } from "../lib/use-api-resource";

type CategoryWithCount = Category & { _count: { products: number } };

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("kategori") ?? undefined;
  const onlyBestSeller = searchParams.get("favorit") === "1";

  const categories = usePublicResource<CategoryWithCount[]>("/categories");

  // Backend yang memfilter, jadi tidak ada data menu yang tidak perlu dikirim.
  const query = new URLSearchParams({ limit: "50" });
  if (activeSlug) query.set("category", activeSlug);
  if (onlyBestSeller) query.set("bestSeller", "true");

  const products = usePublicResource<Paginated<Product>>(
    `/products?${query.toString()}`
  );

  const activeCategory = categories.data?.find(
    (category) => category.slug === activeSlug
  );
  const list = products.data?.data ?? [];

  return (
    <main className="flex-1">
      {/* ---------- Judul halaman ---------- */}
      <section className="bg-gradient-to-b from-strawberry-50 to-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-cocoa-900 sm:text-4xl">
            {onlyBestSeller
              ? "Best Seller"
              : activeCategory
                ? activeCategory.name
                : "Semua Kue"}
          </h1>
          <p className="mt-2 max-w-lg text-cocoa-500">
            {onlyBestSeller
              ? "Menu yang paling sering dipesan pelanggan kami."
              : activeCategory
                ? `Pilihan ${activeCategory.name.toLowerCase()} yang kami panggang segar setiap hari.`
                : "Semua kue dibuat di hari pengambilan. Pesan paling lambat H-1."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ---------- Filter kategori ---------- */}
        {categories.initialLoading ? (
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-9 w-28 rounded-full" />
            ))}
          </div>
        ) : (
          <nav aria-label="Filter kategori" className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className={buttonStyles({
                variant: activeSlug || onlyBestSeller ? "outline" : "primary",
                size: "sm",
              })}
            >
              Semua
            </Link>
            <Link
              href="/products?favorit=1"
              className={buttonStyles({
                variant: onlyBestSeller ? "primary" : "outline",
                size: "sm",
              })}
            >
              ⭐ Best Seller
            </Link>
            {(categories.data ?? []).map((category) => (
              <Link
                key={category.slug}
                href={`/products?kategori=${category.slug}`}
                className={buttonStyles({
                  variant:
                    !onlyBestSeller && activeSlug === category.slug
                      ? "primary"
                      : "outline",
                  size: "sm",
                })}
              >
                {category.emoji} {category.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Kategori gagal dimuat bukan alasan menyembunyikan menunya. */}
        {categories.error && (
          <Alert
            variant="info"
            messages={["Daftar kategori gagal dimuat, jadi filternya tidak tampil."]}
            onRetry={categories.reload}
            className="mt-5"
          />
        )}

        {products.error && (
          <Alert
            title="Gagal memuat menu"
            messages={products.error.messages}
            onRetry={products.reload}
            className="mt-5"
          />
        )}

        {products.loading && <ProductsSkeleton />}

        {!products.loading && !products.error && (
          <>
            <p className="mt-5 text-sm text-cocoa-500">
              Menampilkan {list.length} dari {products.data?.meta.total ?? 0} kue
            </p>

            {list.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
                  Coba lihat kategori lain, atau hubungi kami untuk pesanan
                  khusus.
                </p>
                <Link
                  href="/products"
                  className={buttonStyles({ size: "sm", className: "mt-5" })}
                >
                  Lihat semua kue
                </Link>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function ProductsSkeleton() {
  return (
    <div aria-busy="true">
      <Skeleton className="mt-5 h-5 w-48" />
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Card key={index}>
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-4 h-6 w-28" />
            <Skeleton className="mt-3 h-9 rounded-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
