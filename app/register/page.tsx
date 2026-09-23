import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Daftar — Hadish Cake",
  description: "Buat akun Hadish Cake untuk memesan kue dan melacak pesanan.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <RegisterForm />
    </main>
  );
}
