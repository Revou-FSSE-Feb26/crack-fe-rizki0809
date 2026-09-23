import type { Metadata } from "next";
import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "Dashboard Admin — Hadish Cake",
  description: "Kelola pesanan yang masuk ke Hadish Cake.",
};

/**
 * Hanya untuk role ADMIN. Dijaga dua lapis:
 * 1. `proxy.ts` mengalihkan customer sebelum halaman ini dirender;
 * 2. backend menolak `/api/orders` milik orang lain, jadi walaupun seseorang
 *    memalsukan cookie di browser, datanya tetap tidak bisa diambil.
 */
export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <AdminClient />
    </main>
  );
}
