"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Product } from "./types";

/**
 * Batasan ini disamakan dengan DTO di backend, supaya pengguna diberi tahu
 * lebih awal daripada baru ditolak saat menekan tombol pesan.
 */
export const MAX_QUANTITY_PER_ITEM = 50;
export const MAX_DISTINCT_ITEMS = 20;

const STORAGE_KEY = "hadish_cart";

/**
 * Isi keranjang menyimpan salinan nama dan harga hanya untuk ditampilkan.
 * Saat memesan, yang dikirim ke server cuma `productId` dan `quantity` —
 * harga finalnya dihitung ulang oleh backend dari database.
 */
export type CartItem = {
  productId: string;
  name: string;
  emoji: string;
  tone: string;
  price: number;
  quantity: number;
};

export type AddResult =
  | { ok: true }
  | { ok: false; reason: "too-many-items" | "quantity-limit" };

type CartState = {
  items: CartItem[];
  /** False sampai isi keranjang selesai dibaca dari localStorage. */
  ready: boolean;
};

// --------------------------------------------------------------------------
// Penyimpanan keranjang hidup di luar React.
//
// localStorage baru bisa dibaca setelah komponen tampil di browser, sedangkan
// halaman ini juga dirender di server. Pola `useState` + `useEffect` untuk
// kasus begini memicu render berantai; `useSyncExternalStore` adalah cara
// React membaca sumber data di luar dirinya — sekaligus memberi sinkronisasi
// antar-tab secara gratis lewat event `storage`.
// --------------------------------------------------------------------------

const emptyState: CartState = { items: [], ready: false };

let state: CartState = emptyState;
const listeners = new Set<() => void>();

function setState(next: CartState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Pembaca pertama memicu pemuatan isi keranjang yang tersimpan.
  if (!state.ready) {
    setState({ items: readStoredCart(), ready: true });
  }

  // Keranjang diubah di tab lain — ikut menyesuaikan.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    setState({ items: readStoredCart(), ready: true });
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => state;

/**
 * Di server keranjang selalu dianggap kosong dan belum siap, supaya hasil
 * render server dan browser sama persis pada render pertama.
 */
const getServerSnapshot = () => emptyState;

function persist(items: CartItem[]) {
  setState({ items, ready: true });

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Mode penyamaran atau penyimpanan penuh. Keranjang tetap berfungsi
    // selama tab ini terbuka, hanya tidak bertahan setelah ditutup.
  }
}

// --------------------------------------------------------------------------
// Aksi
// --------------------------------------------------------------------------

function addItem(product: Product, quantity = 1): AddResult {
  const current = state.items;
  const existing = current.find((item) => item.productId === product.id);

  if (existing) {
    const nextQuantity = existing.quantity + quantity;

    if (nextQuantity > MAX_QUANTITY_PER_ITEM) {
      return { ok: false, reason: "quantity-limit" };
    }

    persist(
      current.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
    return { ok: true };
  }

  if (current.length >= MAX_DISTINCT_ITEMS) {
    return { ok: false, reason: "too-many-items" };
  }

  persist([
    ...current,
    {
      productId: product.id,
      name: product.name,
      emoji: product.emoji,
      tone: product.tone,
      price: product.price,
      quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
    },
  ]);
  return { ok: true };
}

function setQuantity(productId: string, quantity: number) {
  // Kuantitas 0 atau kurang berarti menghapus item dari keranjang.
  if (quantity < 1) {
    removeItem(productId);
    return;
  }

  const safeQuantity = Math.min(quantity, MAX_QUANTITY_PER_ITEM);

  persist(
    state.items.map((item) =>
      item.productId === productId ? { ...item, quantity: safeQuantity } : item
    )
  );
}

function removeItem(productId: string) {
  persist(state.items.filter((item) => item.productId !== productId));
}

function clear() {
  persist([]);
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

export function useCart() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return useMemo(() => {
    const totalQuantity = snapshot.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    // Perkiraan saja — total yang mengikat tetap hasil hitungan server.
    const totalPrice = snapshot.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items: snapshot.items,
      ready: snapshot.ready,
      isEmpty: snapshot.items.length === 0,
      totalQuantity,
      totalPrice,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [snapshot]);
}

/** Membaca keranjang tersimpan, mengabaikan isi yang rusak atau bukan bentuk yang benar. */
function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartItem).slice(0, MAX_DISTINCT_ITEMS);
  } catch {
    return [];
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.emoji === "string" &&
    typeof item.tone === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}
