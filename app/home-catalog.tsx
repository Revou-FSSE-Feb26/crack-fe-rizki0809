"use client";

import Link from "next/link";
import Alert from "./components/alert";
import Card from "./components/card";
import ProductCard from "./components/product-card";
import { Skeleton } from "./components/spinner";
import type { Category, Paginated, Product } from "./lib/types";
import { usePublicResource } from "./lib/use-api-resource";

type CategoryWithCount = Category & { _count: { products: number } };

/** Grid kategori di beranda. Datanya sama dengan yang dipakai halaman menu. */
export function CategoryGrid() {
  const { data, error, loading, reload } =
    usePublicResource<CategoryWithCount[]>("/categories");

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-36 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        title="Gagal memuat kategori"
        messages={error.messages}
        onRetry={reload}
        className="mt-6"
      />
    );
  }

  const categories = data ?? [];

  if (categories.length === 0) {
    return (
      <p className="mt-6 text-sm text-cocoa-500">Kategori belum tersedia.</p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/products?kategori=${category.slug}`}
          className="group"
        >
          <Card
            variant="soft"
            className="text-center transition duration-300 group-hover:border-strawberry-300"
          >
            <span
              className={`inline-block rounded-2xl ${category.tone} p-4 text-3xl`}
            >
              {category.emoji}
            </span>
            <p className="mt-3 font-semibold text-cocoa-900">{category.name}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}

/** Menu favorit di beranda, lengkap dengan tombol tambah ke keranjang. */
export function BestSellers() {
  const { data, error, loading, reload } = usePublicResource<Paginated<Product>>(
    "/products?bestSeller=true&limit=4"
  );

  if (loading) {
    return (
      <div
        className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        aria-busy="true"
      >
        {[0, 1, 2, 3].map((index) => (
          <Card key={index}>
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-3 h-6 w-24" />
            <Skeleton className="mt-4 h-9 rounded-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        title="Gagal memuat menu favorit"
        messages={error.messages}
        onRetry={reload}
        className="mt-6"
      />
    );
  }

  const products = data?.data ?? [];

  if (products.length === 0) {
    return (
      <p className="mt-6 text-sm text-cocoa-500">
        Belum ada menu yang ditandai favorit.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact />
      ))}
    </div>
  );
}
