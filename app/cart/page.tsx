import type { Metadata } from "next";
import CartClient from "./cart-client";

export const metadata: Metadata = {
  title: "Keranjang — Hadish Cake",
  description: "Periksa pesanan kue kamu sebelum dibuat.",
};

/**
 * Keranjang sengaja bisa dibuka tanpa login — isinya tersimpan di browser.
 * Yang butuh login hanyalah tombol membuat pesanan, supaya pengunjung tidak
 * dipaksa mendaftar hanya untuk melihat-lihat.
 */
export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-cocoa-900">Keranjang</h1>
        <p className="mt-1 text-cocoa-500">
          Periksa pesananmu, lalu pilih tanggal pengambilannya.
        </p>
      </header>

      <CartClient />
    </main>
  );
}
