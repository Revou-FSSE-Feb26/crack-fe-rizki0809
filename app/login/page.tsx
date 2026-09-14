import Link from "next/link";
import Navbar from "../components/navbar";
import Button from "../components/button";
import Card from "../components/card";
import Input from "../components/input";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Card
          title="Selamat datang kembali"
          description="Masuk untuk melihat pesanan kue kamu."
          footer={
            <p className="text-center text-sm text-cocoa-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-strawberry-700 hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          }
        >
          <form className="flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              hint="Minimal 8 karakter."
              required
            />
            <Button type="submit" fullWidth className="mt-2">
              Masuk
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}
