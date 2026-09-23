"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Alert from "../components/alert";
import Button from "../components/button";
import Card from "../components/card";
import Input from "../components/input";
import Spinner from "../components/spinner";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { homePathFor } from "../lib/session";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Pesan saat pengguna dilempar ke sini karena sesinya habis.
  const sessionExpired = searchParams.get("reason") === "expired";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Cegah pengiriman ganda kalau tombol tertekan dua kali.
    if (submitting) return;

    const validation = validate(email, password);
    setFieldErrors(validation);
    setErrors([]);

    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);

    try {
      const user = await login(email, password);

      router.push(safeRedirect(searchParams.get("next"), homePathFor(user.role)));
      // Supaya proxy menilai ulang sesi yang baru saja dibuat.
      router.refresh();
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? error.messages
          : ["Terjadi kesalahan yang tidak terduga. Coba lagi."]
      );
      // Password dikosongkan supaya tidak tertinggal di layar setelah gagal.
      setPassword("");
      setSubmitting(false);
    }
  }

  return (
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
      {sessionExpired && (
        <Alert variant="info" className="mb-4">
          Sesi kamu sudah berakhir. Silakan masuk lagi untuk melanjutkan.
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert title="Gagal masuk" messages={errors} className="mb-4" />
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          disabled={submitting}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={submitting}
          required
        />

        <Button type="submit" fullWidth className="mt-2" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner label="Sedang masuk" />
              Memproses…
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>
    </Card>
  );
}

/** Pemeriksaan ringan di browser, supaya tidak perlu bolak-balik ke server. */
function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};

  if (!email.trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Format email tidak valid";
  }

  if (!password) {
    errors.password = "Password wajib diisi";
  }

  return errors;
}

/**
 * Hanya mengizinkan path internal. Tanpa pemeriksaan ini, tautan seperti
 * `/login?next=https://situs-jahat.com` bisa dipakai mengalihkan pengguna
 * ke luar setelah mereka login (open redirect).
 */
function safeRedirect(target: string | null, fallback: string): string {
  if (!target) return fallback;
  if (!target.startsWith("/") || target.startsWith("//")) return fallback;
  return target;
}
