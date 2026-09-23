"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Alert from "../components/alert";
import Button from "../components/button";
import Card from "../components/card";
import Input from "../components/input";
import Spinner from "../components/spinner";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { homePathFor } from "../lib/session";

type Fields = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const emptyFields: Fields = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [fields, setFields] = useState<Fields>(emptyFields);
  const [fieldErrors, setFieldErrors] = useState<Partial<Fields>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [emailTaken, setEmailTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    // Hapus error field begitu pengguna memperbaikinya.
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const validation = validate(fields);
    setFieldErrors(validation);
    setErrors([]);
    setEmailTaken(false);

    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);

    try {
      const user = await register({
        name: fields.name,
        email: fields.email,
        password: fields.password,
        phone: fields.phone,
      });

      router.push(homePathFor(user.role));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        // 409 berarti emailnya sudah terdaftar — arahkan ke login saja.
        if (error.status === 409) setEmailTaken(true);
        setErrors(error.messages);
      } else {
        setErrors(["Terjadi kesalahan yang tidak terduga. Coba lagi."]);
      }

      // Password dikosongkan; sisa isian dibiarkan agar tidak perlu diketik ulang.
      setFields((current) => ({ ...current, password: "", confirmPassword: "" }));
      setSubmitting(false);
    }
  }

  return (
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
      {errors.length > 0 && (
        <Alert title="Gagal mendaftar" messages={errors} className="mb-4">
          {emailTaken && (
            <p className="mt-2">
              <Link href="/login" className="font-semibold underline">
                Masuk dengan akun tersebut
              </Link>
            </p>
          )}
        </Alert>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nama lengkap"
          name="name"
          type="text"
          placeholder="Rizki Ramadhan"
          autoComplete="name"
          value={fields.name}
          onChange={(event) => update("name", event.target.value)}
          error={fieldErrors.name}
          disabled={submitting}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          value={fields.email}
          onChange={(event) => update("email", event.target.value)}
          error={fieldErrors.email}
          disabled={submitting}
          required
        />
        <Input
          label="Nomor WhatsApp"
          name="phone"
          type="tel"
          placeholder="08123456789"
          autoComplete="tel"
          hint="Dipakai untuk konfirmasi pesanan."
          value={fields.phone}
          onChange={(event) => update("phone", event.target.value)}
          error={fieldErrors.phone}
          disabled={submitting}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          hint="Minimal 8 karakter."
          value={fields.password}
          onChange={(event) => update("password", event.target.value)}
          error={fieldErrors.password}
          disabled={submitting}
          required
        />
        <Input
          label="Konfirmasi password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={fields.confirmPassword}
          onChange={(event) => update("confirmPassword", event.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={submitting}
          required
        />

        <Button type="submit" fullWidth className="mt-2" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner label="Sedang mendaftar" />
              Memproses…
            </>
          ) : (
            "Daftar"
          )}
        </Button>
      </form>
    </Card>
  );
}

/** Aturannya dibuat sama dengan DTO di backend, supaya tidak ada kejutan. */
function validate(fields: Fields): Partial<Fields> {
  const errors: Partial<Fields> = {};

  if (!fields.name.trim()) {
    errors.name = "Nama wajib diisi";
  } else if (fields.name.trim().length > 100) {
    errors.name = "Nama maksimal 100 karakter";
  }

  if (!fields.email.trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Format email tidak valid";
  }

  if (!fields.phone.trim()) {
    errors.phone = "Nomor WhatsApp wajib diisi";
  } else if (!/^[0-9+\-\s()]{8,20}$/.test(fields.phone.trim())) {
    errors.phone = "Nomor hanya boleh angka dan simbol telepon, 8-20 karakter";
  }

  if (fields.password.length < 8) {
    errors.password = "Password minimal 8 karakter";
  } else if (fields.password.length > 72) {
    errors.password = "Password maksimal 72 karakter";
  }

  if (fields.confirmPassword !== fields.password) {
    errors.confirmPassword = "Konfirmasi password tidak sama";
  }

  return errors;
}
