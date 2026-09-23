import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "../components/card";
import { Skeleton } from "../components/spinner";
import OrdersClient from "./orders-client";

export const metadata: Metadata = {
  title: "Pesanan Saya — Hadish Cake",
  description: "Riwayat pesanan kue kamu di Hadish Cake.",
};

/**
 * Halaman ini hanya bisa dibuka setelah login — dijaga `proxy.ts` di root
 * project, jadi pengunjung yang belum masuk sudah dialihkan ke /login
 * sebelum halaman ini sempat dirender.
 */
export default function OrdersPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<OrdersPageSkeleton />}>
        <OrdersClient />
      </Suspense>
    </main>
  );
}

function OrdersPageSkeleton() {
  return (
    <div aria-busy="true">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-2 h-5 w-72" />
      <div className="mt-6 flex flex-col gap-4">
        {[0, 1].map((index) => (
          <Card key={index}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-12" />
            <Skeleton className="mt-4 h-9" />
          </Card>
        ))}
      </div>
    </div>
  );
}
