"use client";

import { useEffect } from "react";
import Button from "./components/button";
import Card from "./components/card";

/**
 * Jaring pengaman terakhir: menangkap error yang tidak tertangani di halaman
 * mana pun, supaya pengguna melihat halaman yang rapi — bukan layar putih.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Di produksi ini tempat mengirim error ke layanan pemantauan.
    console.error("Halaman gagal dirender:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <Card variant="soft" className="text-center">
        <p className="text-5xl" aria-hidden="true">
          🍰
        </p>
        <h1 className="mt-4 text-xl font-bold text-cocoa-900">
          Ada yang tidak beres
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-cocoa-500">
          Halaman ini gagal ditampilkan. Coba muat ulang — kalau masih sama,
          tunggu sebentar lalu coba lagi.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-cocoa-300">
            Kode: {error.digest}
          </p>
        )}

        <Button className="mt-6" onClick={reset}>
          Muat ulang halaman
        </Button>
      </Card>
    </main>
  );
}
