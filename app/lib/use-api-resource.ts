"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";
import { useAuth } from "./auth-context";

type ResourceState<T> = {
  data: T | null;
  error: ApiError | null;
  /** True saat pengambilan data pertama maupun saat "Coba lagi" ditekan. */
  loading: boolean;
  reload: () => void;
};

type Result<T> = {
  /** Penanda request yang menghasilkan data ini. */
  key: string;
  data: T | null;
  error: ApiError | null;
};

const emptyResult: Result<never> = { key: "", data: null, error: null };

/**
 * Mengambil data dari API yang butuh login, lengkap dengan status loading,
 * error, dan tombol muat ulang.
 *
 * Tiga hal yang dijaga di sini:
 * - request dibatalkan saat komponen dilepas atau saat path berubah, supaya
 *   jawaban request lama tidak menimpa hasil request yang lebih baru;
 * - selama sesi belum diketahui (`enabled` masih false), request ditahan dulu
 *   agar tidak terkirim tanpa token lalu gagal 401;
 * - `loading` diturunkan dari hasil terakhir, bukan di-set di dalam effect,
 *   sehingga tidak memicu render berantai.
 */
export function useApiResource<T>(
  path: string,
  { enabled = true }: { enabled?: boolean } = {}
): ResourceState<T> {
  const { request } = useAuth();

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

    request<T>(path, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({ key, data, error: null });
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;

        setResult({
          key,
          data: null,
          error:
            caught instanceof ApiError
              ? caught
              : new ApiError(0, ["Terjadi kesalahan yang tidak terduga."]),
        });
      });

    return () => controller.abort();
  }, [path, enabled, key, request]);

  return { data: result.data, error: result.error, loading, reload };
}
