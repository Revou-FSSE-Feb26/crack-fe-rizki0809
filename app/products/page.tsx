import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "../components/card";
import { Skeleton } from "../components/spinner";
import ProductsClient from "./products-client";

export const metadata: Metadata = {
  title: "Menu Kue — Hadish Cake",
  description:
    "Semua pilihan kue Hadish Cake: birthday cake, cupcake, pastry, dan custom cake.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsClient />
    </Suspense>
  );
}

function ProductsPageSkeleton() {
  return (
    <main className="flex-1" aria-busy="true">
      <section className="bg-gradient-to-b from-strawberry-50 to-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-full" />
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Card key={index}>
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-4 h-6 w-28" />
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
