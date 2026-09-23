import { cn } from "./cn";

type SpinnerProps = {
  className?: string;
  /** Teks untuk pembaca layar. */
  label?: string;
};

/** Lingkaran berputar kecil, dipakai di dalam tombol saat menunggu server. */
export default function Spinner({
  className,
  label = "Memuat",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}

/**
 * Kotak abu-abu berdenyut sebagai pengganti konten yang sedang dimuat.
 * Memakai bentuk yang mirip kontennya membuat halaman tidak "melompat"
 * saat datanya akhirnya muncul.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-2xl bg-cream-300", className)}
    />
  );
}
