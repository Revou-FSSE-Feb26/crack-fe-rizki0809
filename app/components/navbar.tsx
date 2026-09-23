"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart";
import Button, { buttonStyles } from "./button";
import { cn } from "./cn";
import { Skeleton } from "./spinner";

const baseLinks = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/products" },
  { label: "Tentang", href: "/about" },
  { label: "Bantuan", href: "/help" },
];

export default function Navbar() {
  const { user, status, isAdmin, logout } = useAuth();
  const { totalQuantity, ready: cartReady } = useCart();
  const pathname = usePathname();

  /**
   * Yang disimpan bukan "terbuka atau tidak", melainkan di halaman mana menu
   * itu dibuka. Begitu pengguna pindah halaman, nilainya tidak lagi cocok
   * dengan pathname sehingga menu tertutup dengan sendirinya — tanpa perlu
   * effect yang memanggil setState dan memicu render berantai.
   */
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);

  const menuOpen = menuOpenAt === pathname;
  const mobileOpen = mobileOpenAt === pathname;

  const setMenuOpen = (open: boolean) => setMenuOpenAt(open ? pathname : null);
  const setMobileOpen = (open: boolean) =>
    setMobileOpenAt(open ? pathname : null);

  /** Tautan yang muncul mengikuti role pengguna. */
  const roleLinks = isAdmin
    ? [{ label: "Dashboard Admin", href: "/admin" }]
    : status === "authenticated"
      ? [{ label: "Pesanan Saya", href: "/orders" }]
      : [];

  const allLinks = [...baseLinks, ...roleLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-cream-400 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          <Link
            href="/"
            className="flex shrink-0 items-center font-bold text-strawberry-700"
          >
            <span className="mr-1 inline-block rounded-lg bg-strawberry-700 px-2 py-1 text-cream-50">
              Hadish
            </span>
            Cake
          </Link>

          {/* ---------- Navigasi layar lebar ---------- */}
          <nav className="hidden items-center gap-6 md:flex">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition duration-300 hover:text-strawberry-700",
                  pathname === link.href
                    ? "text-strawberry-700"
                    : "text-cocoa-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/cart"
              aria-label={
                totalQuantity > 0
                  ? `Keranjang belanja, ${totalQuantity} item`
                  : "Keranjang belanja"
              }
              className="relative rounded-full p-2 transition duration-300 hover:bg-cream-200"
            >
              <Image src="/trolley.png" alt="" width={24} height={24} />

              {/* Penanda hanya muncul setelah isi keranjang selesai dibaca,
                  supaya angkanya tidak sempat salah saat halaman baru dimuat. */}
              {cartReady && totalQuantity > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-strawberry-700 px-1.5 text-[11px] font-bold text-cream-50">
                  {totalQuantity > 99 ? "99+" : totalQuantity}
                </span>
              )}
            </Link>

            {/* Selama sesi belum diketahui, tampilkan placeholder seukuran
                tombol supaya navbar tidak berkedip ganti-ganti isi. */}
            {status === "loading" && (
              <Skeleton className="h-9 w-20 rounded-full sm:w-24" />
            )}

            {status === "unauthenticated" && (
              <Link href="/login" className={buttonStyles({ size: "sm" })}>
                Login
              </Link>
            )}

            {status === "authenticated" && user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-cream-400 p-1.5 transition duration-300 hover:border-strawberry-300 sm:pr-3"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-7 place-items-center rounded-full bg-strawberry-100 text-xs font-bold text-strawberry-700"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {/* Nama disembunyikan di layar sempit agar navbar tidak sesak. */}
                  <span className="hidden max-w-24 truncate text-sm font-medium text-cocoa-700 sm:inline">
                    {user.name}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    {/* Lapisan tak terlihat: klik di mana saja untuk menutup. */}
                    <button
                      type="button"
                      aria-label="Tutup menu"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setMenuOpen(false)}
                    />

                    <div
                      role="menu"
                      className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-cream-400 bg-cream-50 p-2 shadow-lg"
                    >
                      <div className="border-b border-cream-300 px-3 py-2">
                        <p className="truncate text-sm font-semibold text-cocoa-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-cocoa-500">
                          {user.email}
                        </p>
                        <span className="mt-1.5 inline-block rounded-full bg-butter-200 px-2 py-0.5 text-[11px] font-semibold text-cocoa-700">
                          {isAdmin ? "Admin" : "Customer"}
                        </span>
                      </div>

                      <Link
                        href={isAdmin ? "/admin" : "/orders"}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="mt-1 block rounded-xl px-3 py-2 text-sm text-cocoa-700 transition duration-300 hover:bg-cream-200"
                      >
                        {isAdmin ? "Dashboard Admin" : "Pesanan Saya"}
                      </Link>

                      <Link
                        href="/account"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-cocoa-700 transition duration-300 hover:bg-cream-200"
                      >
                        Akun Saya
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        role="menuitem"
                        className="mt-1 justify-start"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                      >
                        Keluar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ---------- Tombol menu untuk layar sempit ---------- */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="menu-utama"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              className="cursor-pointer rounded-full p-2 transition duration-300 hover:bg-cream-200 md:hidden"
            >
              <span aria-hidden="true" className="block text-xl leading-none">
                {mobileOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {/* ---------- Panel navigasi layar sempit ---------- */}
        {mobileOpen && (
          <nav
            id="menu-utama"
            className="border-t border-cream-300 py-3 md:hidden"
          >
            <ul className="flex flex-col">
              {allLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-medium transition duration-300 hover:bg-cream-200",
                      pathname === link.href
                        ? "bg-cream-200 text-strawberry-700"
                        : "text-cocoa-700"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              {status === "authenticated" && (
                <li>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-cocoa-700 transition duration-300 hover:bg-cream-200"
                  >
                    Akun Saya
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
