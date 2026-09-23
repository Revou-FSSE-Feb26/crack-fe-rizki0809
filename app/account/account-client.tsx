"use client";

import { useState, type FormEvent } from "react";
import Alert from "../components/alert";
import Button from "../components/button";
import Card from "../components/card";
import Input from "../components/input";
import Spinner, { Skeleton } from "../components/spinner";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";

type Fields = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyFields: Fields = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function AccountClient() {
  const { user, status, isAdmin, request } = useAuth();

  const [fields, setFields] = useState<Fields>(emptyFields);
  const [fieldErrors, setFieldErrors] = useState<Partial<Fields>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const validation = validate(fields);
    setFieldErrors(validation);
    setErrors([]);
    setSuccess(false);

    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);

    try {
      await request("/users/me/password", {
        method: "PATCH",
        body: {
          currentPassword: fields.currentPassword,
          newPassword: fields.newPassword,
        },
      });

      setFields(emptyFields);
      setSuccess(true);
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? error.messages
          : ["Terjadi kesalahan yang tidak terduga. Coba lagi."]
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || !user) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-48" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Data akun ---------- */}
      <Card title="Data akun">
        <dl className="flex flex-col gap-3 text-sm">
          <Row label="Nama" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Nomor WhatsApp" value={user.phone ?? "Belum diisi"} />
          <Row label="Tipe akun" value={isAdmin ? "Admin" : "Customer"} />
        </dl>
      </Card>

      {/* ---------- Ganti password ---------- */}
      <Card
        title="Ganti password"
        description="Password saat ini wajib dimasukkan sebagai bukti bahwa ini benar kamu."
      >
        {success && (
          <Alert variant="success" className="mb-4">
            Password berhasil diganti. Pakai password baru saat login berikutnya.
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert title="Gagal mengganti password" messages={errors} className="mb-4" />
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Password saat ini"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={fields.currentPassword}
            onChange={(event) => update("currentPassword", event.target.value)}
            error={fieldErrors.currentPassword}
            disabled={submitting}
            required
          />
          <Input
            label="Password baru"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            hint="Minimal 8 karakter."
            value={fields.newPassword}
            onChange={(event) => update("newPassword", event.target.value)}
            error={fieldErrors.newPassword}
            disabled={submitting}
            required
          />
          <Input
            label="Konfirmasi password baru"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={fields.confirmPassword}
            onChange={(event) => update("confirmPassword", event.target.value)}
            error={fieldErrors.confirmPassword}
            disabled={submitting}
            required
          />

          <Button type="submit" className="mt-2 self-start" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner label="Menyimpan" />
                Menyimpan…
              </>
            ) : (
              "Simpan password baru"
            )}
          </Button>
        </form>

        <p className="mt-4 text-xs text-cocoa-500">
          Catatan: perangkat lain yang sedang login tetap bisa dipakai sampai
          sesinya berakhir sendiri.
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-cream-300 pb-3 last:border-0 last:pb-0">
      <dt className="text-cocoa-500">{label}</dt>
      <dd className="font-medium text-cocoa-900">{value}</dd>
    </div>
  );
}

function validate(fields: Fields): Partial<Fields> {
  const errors: Partial<Fields> = {};

  if (!fields.currentPassword) {
    errors.currentPassword = "Password saat ini wajib diisi";
  }

  if (fields.newPassword.length < 8) {
    errors.newPassword = "Password baru minimal 8 karakter";
  } else if (fields.newPassword.length > 72) {
    errors.newPassword = "Password baru maksimal 72 karakter";
  } else if (fields.newPassword === fields.currentPassword) {
    errors.newPassword = "Password baru harus berbeda dari yang sekarang";
  }

  if (fields.confirmPassword !== fields.newPassword) {
    errors.confirmPassword = "Konfirmasi password tidak sama";
  }

  return errors;
}
