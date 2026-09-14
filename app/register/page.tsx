import Link from "next/link";
import Button from "../components/button";
import Card from "../components/card";
import Input from "../components/input";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <Card
        title="Buat akun baru"
        description="Daftar untuk memesan kue dan melacak pesanan kamu."
        footer={
          <p className="text-center text-sm text-cocoa-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-strawberry-700 hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        }
      >
        <form className="flex flex-col gap-4">
          <Input
            label="Nama lengkap"
            name="name"
            type="text"
            placeholder="Rizki Ramadhan"
            autoComplete="name"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />
          <Input
            label="Nomor WhatsApp"
            name="phone"
            type="tel"
            placeholder="08123456789"
            autoComplete="tel"
            hint="Dipakai untuk konfirmasi pesanan."
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            hint="Minimal 8 karakter."
            minLength={8}
            required
          />
          <Input
            label="Konfirmasi password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Button type="submit" fullWidth className="mt-2">
            Daftar
          </Button>
        </form>
      </Card>
    </main>
  );
}
