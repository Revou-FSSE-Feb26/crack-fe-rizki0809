import type { Metadata } from "next";
import AccountClient from "./account-client";

export const metadata: Metadata = {
  title: "Akun Saya — Hadish Cake",
  description: "Kelola data akun dan password Hadish Cake kamu.",
};

/** Wajib login — dijaga `proxy.ts` di root project. */
export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-cocoa-900">Akun Saya</h1>
        <p className="mt-1 text-cocoa-500">
          Data akun dan pengaturan keamanannya.
        </p>
      </header>

      <AccountClient />
    </main>
  );
}
