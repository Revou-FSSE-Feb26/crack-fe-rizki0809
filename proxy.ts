import { NextResponse, type NextRequest } from "next/server";
import { homePathFor, readValidSession, SESSION_COOKIE } from "@/app/lib/session";

/**
 * Sejak Next.js 16, Middleware bernama Proxy. Fungsinya sama: berjalan sebelum
 * halaman dirender, jadi pengguna yang tidak berhak sudah dialihkan lebih dulu
 * tanpa sempat melihat isi halamannya.
 *
 * Yang dilakukan di sini hanyalah pemeriksaan optimistis: token dibaca dari
 * cookie, tapi tanda tangannya tidak diverifikasi. Penjagaan yang sebenarnya
 * ada di backend, yang memeriksa setiap token pada setiap request. Jadi
 * memalsukan cookie di sini paling banter membuka halaman kosong yang semua
 * datanya gagal dimuat.
 */

/** Wajib login. */
const protectedPrefixes = ["/orders", "/admin"];

/** Wajib login DAN ber-role ADMIN. */
const adminPrefixes = ["/admin"];

/** Hanya untuk yang belum login — percuma membuka login saat sudah masuk. */
const guestOnlyPrefixes = ["/login", "/register"];

function matches(path: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = readValidSession(request.cookies.get(SESSION_COOKIE)?.value);

  // --- Belum login tapi membuka halaman terlindungi ---------------------
  if (!session && matches(path, protectedPrefixes)) {
    const loginUrl = new URL("/login", request.url);
    // Disimpan supaya setelah login pengguna kembali ke halaman yang dituju.
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // --- Sudah login tapi bukan admin, membuka halaman admin ---------------
  if (session && session.role !== "ADMIN" && matches(path, adminPrefixes)) {
    const fallback = new URL(homePathFor(session.role), request.url);
    fallback.searchParams.set("error", "forbidden");
    return NextResponse.redirect(fallback);
  }

  // --- Sudah login tapi membuka halaman login/register -------------------
  if (session && matches(path, guestOnlyPrefixes)) {
    return NextResponse.redirect(new URL(homePathFor(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Lewati aset internal Next dan berkas statis — tidak ada gunanya diperiksa.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$).*)"],
};
