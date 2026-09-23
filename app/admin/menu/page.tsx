import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "../../components/button";
import MenuClient from "./menu-client";

export const metadata: Metadata = {
  title: "Kelola Menu — Hadish Cake",
  description: "Tambah dan hapus menu kue Hadish Cake.",
};

/** Hanya untuk ADMIN — dijaga `proxy.ts` lewat awalan /admin. */
export default function AdminMenuPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-cocoa-900">Kelola Menu</h1>
          <p className="mt-1 text-cocoa-500">
            Tambah menu baru, ubah yang sudah ada, sembunyikan sementara,
            atau hapus.
          </p>
        </div>
        <Link
          href="/admin"
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          ← Ke pesanan
        </Link>
      </header>

      <MenuClient />
    </main>
  );
}
