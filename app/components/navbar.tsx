"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import Button, { buttonStyles } from "./button";
import { Skeleton } from "./spinner";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/products" },
  { label: "Tentang", href: "/about" },
];

export default function Navbar() {
  const { user, status, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cream-400 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center font-bold text-strawberry-700"
          >
            <span className="mr-1 inline-block rounded-lg bg-strawberry-700 px-2 py-1 text-cream-50">
              Hadish
            </span>
            Cake
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-cocoa-700 transition duration-300 hover:text-strawberry-700"
              >
                {link.label}
              </Link>
            ))}

            {/* Tautan berikut hanya muncul sesuai role. */}
            {status === "authenticated" && !isAdmin && (
              <Link
                href="/orders"
                className="text-sm font-medium text-cocoa-700 transition duration-300 hover:text-strawberry-700"
              >
                Pesanan Saya
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-cocoa-700 transition duration-300 hover:text-strawberry-700"
              >
                Dashboard Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Keranjang belanja"
              className="rounded-full p-2 transition duration-300 hover:bg-cream-200"
            >
              <Image src="/trolley.png" alt="" width={24} height={24} />
            </button>

            {/* Selama sesi belum diketahui, tampilkan placeholder seukuran
                tombol supaya navbar tidak berkedip ganti-ganti isi. */}
            {status === "loading" && <Skeleton className="h-9 w-24 rounded-full" />}

            {status === "unauthenticated" && (
              <Link href="/login" className={buttonStyles({ size: "sm" })}>
                Login
              </Link>
            )}

            {status === "authenticated" && user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-cream-400 py-1.5 pl-1.5 pr-3 transition duration-300 hover:border-strawberry-300"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-7 place-items-center rounded-full bg-strawberry-100 text-xs font-bold text-strawberry-700"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-24 truncate text-sm font-medium text-cocoa-700">
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
          </div>
        </div>
      </div>
    </header>
  );
}
