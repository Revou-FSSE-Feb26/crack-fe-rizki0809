import Link from "next/link";
import Image from "next/image";
import { buttonStyles } from "./button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-cream-400 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center font-bold text-strawberry-700"
          >
            <span className="mx-1 inline-block rounded-lg bg-strawberry-700 px-2 py-1 text-cream-50">
              Hadish
            </span>
            Cake
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Keranjang belanja"
              className="rounded-full p-2 transition duration-300 hover:bg-cream-200"
            >
              <Image src="/trolley.png" alt="" width={24} height={24} />
            </button>
            <Link href="/login" className={buttonStyles({ size: "sm" })}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
