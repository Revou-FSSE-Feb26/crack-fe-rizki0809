import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "../components/card";
import { Skeleton } from "../components/spinner";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Masuk — Hadish Cake",
  description: "Masuk ke akun Hadish Cake untuk memesan dan melacak pesanan.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      {/* Formulirnya membaca query string (`next`, `reason`), jadi harus
          dibungkus Suspense agar sisa halaman tetap bisa dirender lebih dulu. */}
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

function LoginFormSkeleton() {
  return (
    <Card title="Selamat datang kembali" description="Menyiapkan formulir…">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="mt-2 h-12 rounded-full" />
      </div>
    </Card>
  );
}
