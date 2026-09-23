"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiError, apiFetch } from "./api";
import {
  clearTokenCookie,
  decodeSession,
  readTokenCookie,
  readValidSession,
  writeTokenCookie,
} from "./session";
import type { AuthResponse, User } from "./types";

/**
 * `loading` muncul saat halaman pertama kali dibuka dan kita belum tahu
 * pengguna sudah login atau belum. Membedakannya dari `unauthenticated`
 * mencegah tampilan berkedip: "belum login" sekejap, lalu berubah jadi login.
 */
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: (options?: { reason?: "expired" }) => void;
  /**
   * Request ke API yang sudah membawa token, dan otomatis mengakhiri sesi
   * kalau server menjawab 401. Dipakai halaman-halaman yang butuh login.
   */
  request: <T>(
    path: string,
    options?: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; signal?: AbortSignal }
  ) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  /** Timer yang mengakhiri sesi tepat saat token kedaluwarsa. */
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(() => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    expiryTimer.current = null;

    clearTokenCookie();
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const logout = useCallback(
    (options?: { reason?: "expired" }) => {
      clearSession();
      router.push(options?.reason === "expired" ? "/login?reason=expired" : "/");
      router.refresh();
    },
    [clearSession, router]
  );

  /**
   * Menjadwalkan logout otomatis saat token habis masa berlakunya, supaya tab
   * yang dibiarkan terbuka berhari-hari tidak menampilkan data basi dengan
   * token yang sebenarnya sudah mati.
   */
  const scheduleExpiry = useCallback(
    (accessToken: string) => {
      if (expiryTimer.current) clearTimeout(expiryTimer.current);

      const payload = decodeSession(accessToken);
      if (!payload) return;

      const msLeft = payload.exp * 1000 - Date.now();
      // setTimeout tidak bisa menangani delay yang terlalu besar; token 7 hari
      // masih jauh di bawah batasnya, tapi tetap dijaga agar aman.
      if (msLeft <= 0 || msLeft > 2_147_483_647) return;

      expiryTimer.current = setTimeout(() => logout({ reason: "expired" }), msLeft);
    },
    [logout]
  );

  const startSession = useCallback(
    (accessToken: string, nextUser: User) => {
      writeTokenCookie(accessToken);
      setToken(accessToken);
      setUser(nextUser);
      setStatus("authenticated");
      scheduleExpiry(accessToken);
    },
    [scheduleExpiry]
  );

  // ---- Memulihkan sesi saat halaman pertama dimuat -----------------------
  useEffect(() => {
    const controller = new AbortController();

    async function restore() {
      const savedToken = readTokenCookie();
      const session = readValidSession(savedToken);

      // Tidak ada token, atau tokennya sudah kedaluwarsa.
      if (!savedToken || !session) {
        if (savedToken) clearTokenCookie();
        setStatus("unauthenticated");
        return;
      }

      try {
        // Ambil data lengkap (nama, telepon) yang tidak ada di dalam token,
        // sekaligus memastikan akunnya memang masih ada di server.
        const profile = await apiFetch<User>("/auth/me", {
          token: savedToken,
          signal: controller.signal,
        });

        setToken(savedToken);
        setUser(profile);
        setStatus("authenticated");
        scheduleExpiry(savedToken);
      } catch (error) {
        if (controller.signal.aborted) return;

        // Token ditolak server (dicabut, akun dihapus) — sesi harus diakhiri.
        if (error instanceof ApiError && error.isUnauthorized) {
          clearTokenCookie();
          setStatus("unauthenticated");
          return;
        }

        // Server sedang tidak bisa dihubungi. Tokennya sendiri masih sah, jadi
        // sesi tetap dipertahankan memakai data seadanya dari dalam token —
        // pengguna tidak dipaksa login ulang hanya karena internet terputus.
        setToken(savedToken);
        setUser({
          id: session.sub,
          name: session.email.split("@")[0],
          email: session.email,
          phone: null,
          role: session.role,
        });
        setStatus("authenticated");
        scheduleExpiry(savedToken);
      }
    }

    void restore();
    return () => controller.abort();
  }, [scheduleExpiry]);

  // Bersihkan timer saat provider dilepas.
  useEffect(() => {
    return () => {
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });

      startSession(result.accessToken, result.user);
      return result.user;
    },
    [startSession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          password: input.password,
          // Kirim phone hanya kalau diisi; backend menolak string kosong.
          ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
        },
      });

      startSession(result.accessToken, result.user);
      return result.user;
    },
    [startSession]
  );

  const request = useCallback(
    async <T,>(
      path: string,
      options?: {
        method?: "GET" | "POST" | "PATCH" | "DELETE";
        body?: unknown;
        signal?: AbortSignal;
      }
    ): Promise<T> => {
      try {
        return await apiFetch<T>(path, { ...options, token });
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          logout({ reason: "expired" });
        }
        throw error;
      }
    },
    [token, logout]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      request,
    }),
    [user, token, status, login, register, logout, request]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }

  return context;
}
