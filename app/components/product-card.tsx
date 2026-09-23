"use client";

import { useEffect, useRef, useState } from "react";
import {
  MAX_DISTINCT_ITEMS,
  MAX_QUANTITY_PER_ITEM,
  useCart,
} from "../lib/cart";
import { formatPrice } from "../lib/format";
import type { Product } from "../lib/types";
import Button from "./button";
import Card from "./card";

type Feedback = { tone: "success" | "error"; message: string };

export default function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  /** Versi ringkas tanpa deskripsi, dipakai di beranda. */
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bersihkan timer kalau komponennya keburu dilepas.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function showFeedback(next: Feedback) {
    setFeedback(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFeedback(null), 2500);
  }

  function handleAdd() {
    const result = addItem(product);

    if (result.ok) {
      showFeedback({ tone: "success", message: "Ditambahkan ke keranjang" });
      return;
    }

    showFeedback({
      tone: "error",
      message:
        result.reason === "quantity-limit"
          ? `Maksimal ${MAX_QUANTITY_PER_ITEM} per menu`
          : `Maksimal ${MAX_DISTINCT_ITEMS} jenis menu per pesanan`,
    });
  }

  return (
    <Card className="flex flex-col">
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-2xl text-5xl ${product.tone}`}
        aria-hidden="true"
      >
        {product.emoji}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-cocoa-900">{product.name}</h3>
        {product.bestSeller && (
          <span className="shrink-0 rounded-full bg-butter-200 px-2.5 py-1 text-[11px] font-semibold text-cocoa-700">
            Best seller
          </span>
        )}
      </div>

      {!compact && (
        <p className="mt-1 text-sm text-cocoa-500">{product.description}</p>
      )}

      {/* mt-auto menjaga harga & tombol tetap rata bawah antar kartu */}
      <p className="mt-auto pt-4 text-lg font-bold text-strawberry-700">
        {formatPrice(product.price)}
      </p>

      <Button
        variant="outline"
        size="sm"
        fullWidth
        className="mt-3"
        onClick={handleAdd}
      >
        Tambah ke keranjang
      </Button>

      {/* aria-live membuat pembaca layar mengumumkan hasilnya tanpa
          memindahkan fokus dari tombol. */}
      <p
        aria-live="polite"
        className={`mt-2 min-h-4 text-center text-xs ${
          feedback?.tone === "error"
            ? "text-strawberry-700"
            : "text-cocoa-700"
        }`}
      >
        {feedback?.message ?? ""}
      </p>
    </Card>
  );
}
