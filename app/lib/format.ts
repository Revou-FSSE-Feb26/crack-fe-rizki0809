/**
 * Semua format di sini ditulis manual (bukan `Intl`) supaya hasilnya identik
 * di server dan di browser, jadi tidak memicu hydration mismatch.
 */

/** 185000 -> "Rp 185.000" */
export function formatPrice(value: number): string {
  return `Rp ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * "2026-09-25T00:00:00.000Z" -> "Kamis, 25 September 2026"
 *
 * Dibaca sebagai UTC karena backend menyimpan pickupDate sebagai tanggal saja
 * (tengah malam UTC). Kalau dibaca sebagai waktu lokal, tanggalnya bisa
 * bergeser sehari bagi pengguna di zona waktu negatif.
 */
export function formatPickupDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  const day = DAY_NAMES[date.getUTCDay()];
  const month = MONTH_NAMES[date.getUTCMonth()];

  return `${day}, ${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}

/** "2026-09-18T14:41:31.000Z" -> "18 September 2026" */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Tanggal paling awal yang boleh dipilih untuk pengambilan: besok, sesuai
 * aturan toko bahwa pesanan dibuat paling lambat H-1. Dihitung dari waktu
 * lokal pengguna; server tetap memeriksa ulang dan jadi penentu akhir.
 */
export function earliestPickupDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

/** Mengubah Date atau string ISO menjadi "YYYY-MM-DD" untuk <input type="date">. */
export function toDateInputValue(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  // String ISO dari backend adalah tanggal saja pada tengah malam UTC, jadi
  // dibaca sebagai UTC agar tidak bergeser sehari.
  return typeof value === "string"
    ? `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
    : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
