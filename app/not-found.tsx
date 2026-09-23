import Link from "next/link";
import { buttonStyles } from "./components/button";
import Card from "./components/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <Card variant="soft" className="text-center">
        <p className="text-5xl" aria-hidden="true">
          🔍
        </p>
        <h1 className="mt-4 text-xl font-bold text-cocoa-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-cocoa-500">
          Alamat yang kamu buka tidak ada. Mungkin tautannya salah ketik, atau
          halamannya sudah dipindahkan.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonStyles({ size: "sm" })}>
            Ke beranda
          </Link>
          <Link
            href="/products"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Lihat menu
          </Link>
        </div>
      </Card>
    </main>
  );
}
