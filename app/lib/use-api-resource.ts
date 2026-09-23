"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "./api";
import { useAuth } from "./auth-context";

type ResourceState<T> = {
  data: T | null;
  error: ApiError | null;
  /** True selama request berjalan, termasuk saat memuat ulang. */
  loading: boolean;
  /** True hanya saat pemuatan pertama, waktu belum ada data sama sekali. */
  initialLoading: boolean;
  /** True saat memuat ulang sementara data lama masih ditampilkan. */
  refreshing: boolean;
  reload: () => void;
};

type Result<T> = {
  /** Penanda request yang menghasilkan data ini. */
  key: string;
  data: T | null;
  error: ApiError | null;
};

const emptyResult: Result<never> = { key: "", data: null, error: null };

type Fetcher = <T>(path: string, options: { signal: AbortSignal }) => Promise<T>;

/**
 * Inti dari kedua hook di bawah.
 *
 * Empat hal yang dijaga di sini:
 * - request dibatalkan saat komponen dilepas atau saat path berubah, supaya
 *   jawaban request lama tidak menimpa hasil request yang lebih baru;
 * - `loading` diturunkan dari hasil terakhir, bukan di-set di dalam effect,
 *   sehingga tidak memicu render berantai;
 * - data lama tetap dipegang selama memuat ulang, jadi layar tidak berkedip
 *   kosong setiap kali daftar disegarkan;
 * - `enabled` menahan request selama syaratnya belum siap (misalnya sesi
 *   belum diketahui), supaya tidak terkirim tanpa token lalu gagal 401.
 */
function useResource<T>(
  path: string,
  fetcher: Fetcher,
  enabled: boolean
): ResourceState<T> {
  // Dinaikkan oleh reload() untuk memicu pengambilan ulang path yang sama.
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T>>(emptyResult);

  const key = `${attempt}:${path}`;

  // Selama hasil yang tersimpan belum berasal dari request saat ini,
  // berarti datanya masih dalam perjalanan.
  const loading = enabled && result.key !== key;

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    fetcher<T>(path, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({ key, data, error: null });
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setResult({
          key,
          // Data lama dibuang saat error, supaya tidak ada informasi basi
          // yang tampil bersamaan dengan pesan kegagalan.
          data: null,
          error:
            caught instanceof ApiError
              ? caught
              : new ApiError(0, ["Terjadi kesalahan yang tidak terduga."]),
        });
      });

    return () => controller.abort();
  }, [path, enabled, key, fetcher]);

  return {
    data: result.data,
    error: result.error,
    loading,
    initialLoading: loading && result.data === null,
    refreshing: loading && result.data !== null,
    reload,
  };
}

/** Untuk endpoint yang butuh login. Token dan penanganan 401 sudah diurus. */
export function useApiResource<T>(
  path: string,
  { enabled = true }: { enabled?: boolean } = {}
): ResourceState<T> {
  const { request } = useAuth();
  return useResource<T>(path, request as Fetcher, enabled);
}

/**
 * Untuk endpoint publik seperti katalog menu. Sengaja tidak lewat auth context
 * agar datanya tidak diambil ulang hanya karena status login berubah.
 */
export function usePublicResource<T>(
  path: string,
  { enabled = true }: { enabled?: boolean } = {}
): ResourceState<T> {
  return useResource<T>(path, publicFetcher, enabled);
}

const publicFetcher: Fetcher = (path, options) =>
  apiFetch(path, { signal: options.signal });
