/**
 * Pilihan warna latar untuk kartu menu.
 *
 * Nilainya disimpan di database sebagai nama kelas Tailwind, lalu dipakai
 * langsung sebagai `className`. Tailwind hanya membuat kelas yang ia temukan
 * di kode sumber — jadi daftar ini bukan sekadar pilihan untuk formulir, tapi
 * juga yang membuat kelas-kelas tersebut benar-benar ada di CSS hasil build.
 *
 * Konsekuensinya: menambah warna baru harus lewat berkas ini, bukan dengan
 * mengetik nama kelas bebas di form admin.
 */
export const TONE_OPTIONS = [
  { value: "bg-strawberry-100", label: "Pink stroberi" },
  { value: "bg-butter-100", label: "Kuning mentega" },
  { value: "bg-butter-200", label: "Kuning tua" },
  { value: "bg-pistachio-100", label: "Hijau pistachio" },
  { value: "bg-blueberry-100", label: "Ungu blueberry" },
  { value: "bg-cream-300", label: "Krem" },
] as const;

export const DEFAULT_TONE = TONE_OPTIONS[0].value;

/** Warna di luar daftar dikembalikan ke warna bawaan agar tidak tampil kosong. */
export function safeTone(tone: string): string {
  return TONE_OPTIONS.some((option) => option.value === tone)
    ? tone
    : DEFAULT_TONE;
}
