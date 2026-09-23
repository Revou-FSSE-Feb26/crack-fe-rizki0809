import type { Role } from "./types";

/**
 * Sesi disimpan di cookie (bukan localStorage) supaya `proxy.ts` bisa ikut
 * membacanya dan memblokir halaman terlarang sebelum halamannya sempat dirender.
 *
 * Cookie ini sengaja TIDAK httpOnly, karena token yang sama juga dibutuhkan
 * kode di browser untuk mengisi header `Authorization`. Konsekuensinya sama
 * seperti localStorage: kalau ada celah XSS, token bisa terbaca. Pertahanan
 * sebenarnya tetap ada di backend, yang memverifikasi setiap token.
 */
export const SESSION_COOKIE = "hadish_session";

/** Isi token JWT yang diterbitkan backend. */
export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  /** Detik sejak epoch, bukan milidetik. */
  exp: number;
};

/**
 * Membaca isi JWT **tanpa memverifikasi tanda tangannya.**
 *
 * Ini cukup untuk keperluan tampilan dan pengalihan halaman (siapa yang login,
 * apa rolenya). Jangan pernah dijadikan satu-satunya penjaga: backend yang
 * benar-benar memverifikasi token pada setiap request.
 */
export function decodeSession(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1])) as SessionPayload;

    // Token tanpa identitas atau tanpa masa berlaku dianggap tidak sah.
    if (!payload?.sub || typeof payload.exp !== "number") return null;

    return payload;
  } catch {
    return null;
  }
}

export function isExpired(payload: SessionPayload, now = Date.now()): boolean {
  return payload.exp * 1000 <= now;
}

/** Mengembalikan sesi hanya kalau tokennya bisa dibaca dan belum kedaluwarsa. */
export function readValidSession(
  token: string | undefined | null
): SessionPayload | null {
  if (!token) return null;

  const payload = decodeSession(token);
  return payload && !isExpired(payload) ? payload : null;
}

/** Halaman default sesuai role, dipakai setelah login. */
export function homePathFor(role: Role): string {
  return role === "ADMIN" ? "/admin" : "/orders";
}

// --------------------------------------------------------------------------
// Fungsi di bawah ini hanya boleh dipanggil dari browser.
// --------------------------------------------------------------------------

export function readTokenCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE}=`));

  return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null;
}

export function writeTokenCookie(token: string) {
  if (typeof document === "undefined") return;

  const payload = decodeSession(token);
  // Umur cookie disamakan dengan umur token, supaya tidak ada cookie basi yang
  // tertinggal setelah tokennya sendiri kedaluwarsa.
  const maxAge = payload
    ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
    : 0;

  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "path=/",
    `max-age=${maxAge}`,
    "samesite=lax",
  ];

  if (window.location.protocol === "https:") {
    attributes.push("secure");
  }

  document.cookie = attributes.join("; ");
}

export function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Decode base64url (varian base64 yang dipakai JWT: `-` dan `_` menggantikan
 * `+` dan `/`, dan tanda `=` dihilangkan).
 */
function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  // Lewat TextDecoder supaya karakter non-ASCII tidak rusak.
  return new TextDecoder().decode(bytes);
}
