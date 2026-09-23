import type { ApiErrorBody } from "./types";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

/**
 * Backend gratisan "tidur" saat lama tidak dipakai, dan request pertama bisa
 * makan waktu beberapa detik untuk membangunkannya. Batas waktunya dibuat
 * longgar supaya request pertama tidak keburu dibatalkan.
 */
const REQUEST_TIMEOUT_MS = 30_000;

/** Status buatan untuk kegagalan yang tidak pernah sampai ke server. */
export const NETWORK_ERROR_STATUS = 0;

/**
 * Satu bentuk error untuk semua kegagalan request, supaya komponen cukup
 * menangani satu jenis saja — entah itu error validasi, ditolak server,
 * koneksi putus, atau server tidak menjawab.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Bisa lebih dari satu karena ValidationPipe mengirim array pesan. */
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? "Terjadi kesalahan");
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
  }

  /** Token tidak ada, kedaluwarsa, atau tidak valid. */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** Sudah login, tapi tidak berhak. */
  get isForbidden() {
    return this.status === 403;
  }

  /** Request tidak pernah sampai ke server. */
  get isNetworkError() {
    return this.status === NETWORK_ERROR_STATUS;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Token JWT; kalau diisi, dikirim sebagai header Authorization. */
  token?: string | null;
  /** Untuk membatalkan request saat komponen dilepas. */
  signal?: AbortSignal;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token, signal }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: mergeSignals(signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)),
      // Data pesanan harus selalu yang terbaru, jangan diambil dari cache.
      cache: "no-store",
    });
  } catch (error) {
    throw describeNetworkFailure(error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, extractMessages(payload, response));
  }

  return payload as T;
}

/** Membaca body sebagai JSON, mentolerir body kosong atau bukan JSON. */
async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // Misalnya halaman error HTML dari platform hosting, bukan dari aplikasi.
    return null;
  }
}

/** Mengubah body error backend menjadi daftar pesan yang siap ditampilkan. */
function extractMessages(payload: unknown, response: Response): string[] {
  const body = payload as ApiErrorBody | null;

  if (body && typeof body === "object" && "message" in body) {
    const { message } = body;
    if (Array.isArray(message) && message.length > 0) return message;
    if (typeof message === "string" && message) return [message];
  }

  return [fallbackMessageFor(response.status)];
}

function fallbackMessageFor(status: number): string {
  if (status === 401) return "Sesi kamu sudah berakhir. Silakan masuk lagi.";
  if (status === 403) return "Kamu tidak punya akses ke bagian ini.";
  if (status === 404) return "Data yang dicari tidak ditemukan.";
  if (status >= 500) return "Server sedang bermasalah. Coba lagi sebentar lagi.";
  return "Permintaan gagal diproses.";
}

/**
 * Membedakan "server tidak menjawab dalam batas waktu" dari "tidak bisa
 * menghubungi server sama sekali", karena solusinya berbeda bagi pengguna.
 */
function describeNetworkFailure(error: unknown): ApiError {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new ApiError(NETWORK_ERROR_STATUS, [
      "Server terlalu lama menjawab. Mungkin sedang aktif kembali dari mode tidur — coba lagi sebentar lagi.",
    ]);
  }

  // Request sengaja dibatalkan (komponen dilepas, pengguna pindah halaman).
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError(NETWORK_ERROR_STATUS, ["Permintaan dibatalkan."]);
  }

  return new ApiError(NETWORK_ERROR_STATUS, [
    "Tidak bisa terhubung ke server. Periksa koneksi internetmu, lalu coba lagi.",
  ]);
}

/** `AbortSignal.any` menggabungkan pembatalan manual dengan batas waktu. */
function mergeSignals(
  signal: AbortSignal | undefined,
  timeout: AbortSignal
): AbortSignal {
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}
