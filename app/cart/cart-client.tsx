"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import Alert from "../components/alert";
import Button, { buttonStyles } from "../components/button";
import Card from "../components/card";
import Input from "../components/input";
import Spinner, { Skeleton } from "../components/spinner";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import {
  MAX_QUANTITY_PER_ITEM,
  useCart,
  type CartItem,
} from "../lib/cart";
import { earliestPickupDate, formatPrice } from "../lib/format";
import type { Order, Paginated, Product } from "../lib/types";
import { usePublicResource } from "../lib/use-api-resource";

const MAX_NOTES_LENGTH = 255;

export default function CartClient() {
  const router = useRouter();
  const { status, request } = useAuth();
  const { items, totalQuantity, isEmpty, ready, clear, removeItem } =
    useCart();

  /**
   * Isi keranjang disimpan di browser, jadi bisa saja sudah basi: menunya
   * dihapus admin, disembunyikan, atau harganya berubah. Katalog terbaru
   * diambil untuk membandingkannya sebelum pesanan dikirim.
   */
  const catalog = usePublicResource<Paginated<Product>>("/products?limit=100");

  const availableById = useMemo(() => {
    const map = new Map<string, Product>();
    catalog.data?.data.forEach((product) => map.set(product.id, product));
    return map;
  }, [catalog.data]);

  // Selama katalog belum termuat, jangan dulu menuduh ada item bermasalah.
  const catalogReady = catalog.data !== null;
  const unavailableItems = catalogReady
    ? items.filter((item) => !availableById.has(item.productId))
    : [];

  /** Harga tampilan selalu memakai angka terbaru dari katalog kalau ada. */
  const priceOf = (productId: string, fallback: number) =>
    availableById.get(productId)?.price ?? fallback;

  const estimatedTotal = items.reduce(
    (sum, item) => sum + priceOf(item.productId, item.price) * item.quantity,
    0
  );

  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [dateError, setDateError] = useState<string | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const earliest = earliestPickupDate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setErrors([]);
    setDateError(undefined);

    if (!pickupDate) {
      setDateError("Pilih tanggal pengambilan dulu");
      return;
    }
    if (pickupDate < earliest) {
      setDateError(`Paling cepat ${earliest} — pesanan dibuat H-1`);
      return;
    }

    setSubmitting(true);

    try {
      // Hanya id dan jumlah yang dikirim. Harga dan total dihitung ulang
      // server dari database, jadi tidak bisa dimanipulasi dari sini.
      const order = await request<Order>("/orders", {
        method: "POST",
        body: {
          pickupDate,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      });

      clear();
      router.push(`/orders?baru=${order.orderNumber}`);
      router.refresh();
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? error.messages
          : ["Terjadi kesalahan yang tidak terduga. Coba lagi."]
      );
      setSubmitting(false);
    }
  }

  // Menunggu isi keranjang selesai dibaca dari penyimpanan browser.
  if (!ready) {
    return <CartSkeleton />;
  }

  if (isEmpty) {
    return (
      <Card variant="soft" className="py-12 text-center">
        <p className="text-4xl" aria-hidden="true">
          🛒
        </p>
        <h2 className="mt-3 font-semibold text-cocoa-900">
          Keranjang kamu masih kosong
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-cocoa-500">
          Pilih kue favoritmu dulu, nanti muncul di sini.
        </p>
        <Link
          href="/products"
          className={buttonStyles({ size: "sm", className: "mt-5" })}
        >
          Lihat menu kue
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      {/* ---------- Daftar isi keranjang ---------- */}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.productId}>
            <CartRow
              item={item}
              currentPrice={priceOf(item.productId, item.price)}
              unavailable={unavailableItems.some(
                (candidate) => candidate.productId === item.productId
              )}
              disabled={submitting}
            />
          </li>
        ))}
      </ul>

      {/* ---------- Ringkasan & form pemesanan ---------- */}
      <Card className="lg:sticky lg:top-20">
        <h2 className="font-bold text-cocoa-900">Ringkasan pesanan</h2>

        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-cocoa-500">Jumlah kue</dt>
            <dd className="text-cocoa-700">{totalQuantity}</dd>
          </div>
          <div className="flex justify-between border-t border-cream-300 pt-2">
            <dt className="font-semibold text-cocoa-700">Perkiraan total</dt>
            <dd className="text-lg font-bold text-strawberry-700">
              {formatPrice(estimatedTotal)}
            </dd>
          </div>
        </dl>

        <p className="mt-2 text-xs text-cocoa-500">
          Total final dihitung ulang oleh server saat pesanan dibuat.
        </p>

        {unavailableItems.length > 0 && (
          <Alert
            title="Ada menu yang sudah tidak tersedia"
            className="mt-4"
            messages={unavailableItems.map(
              (item) => `${item.name} sudah tidak dijual lagi`
            )}
          >
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() =>
                unavailableItems.forEach((item) => removeItem(item.productId))
              }
            >
              Hapus {unavailableItems.length} item tersebut
            </Button>
          </Alert>
        )}

        {status === "unauthenticated" ? (
          <div className="mt-5 border-t border-cream-300 pt-5">
            <p className="text-sm text-cocoa-500">
              Masuk dulu untuk menyelesaikan pesanan. Isi keranjangmu tetap
              tersimpan.
            </p>
            <Link
              href="/login?next=/cart"
              className={buttonStyles({ fullWidth: true, className: "mt-3" })}
            >
              Masuk untuk memesan
            </Link>
          </div>
        ) : (
          <form
            className="mt-5 flex flex-col gap-4 border-t border-cream-300 pt-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {errors.length > 0 && (
              <Alert title="Pesanan gagal dibuat" messages={errors} />
            )}

            <Input
              label="Tanggal pengambilan"
              name="pickupDate"
              type="date"
              value={pickupDate}
              min={earliest}
              onChange={(event) => {
                setPickupDate(event.target.value);
                setDateError(undefined);
              }}
              error={dateError}
              hint={`Paling cepat ${earliest}, karena kue dibuat H-1.`}
              disabled={submitting || status === "loading"}
              required
            />

            <label className="block w-full">
              <span className="mb-1.5 block text-sm font-semibold text-cocoa-700">
                Catatan{" "}
                <span className="font-normal text-cocoa-500">(opsional)</span>
              </span>
              <textarea
                name="notes"
                rows={3}
                maxLength={MAX_NOTES_LENGTH}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={submitting}
                placeholder="Contoh: tulis &quot;Happy Birthday Rani&quot; di atas kue."
                className="w-full rounded-2xl border border-cream-400 bg-cream-50 px-4 py-3 text-sm text-cocoa-900 transition duration-300 placeholder:text-cocoa-300 hover:border-cream-300 focus:outline-2 focus:outline-offset-2 focus:outline-strawberry-300 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:opacity-60"
              />
              <span className="mt-1.5 block text-right text-xs text-cocoa-500">
                {notes.length}/{MAX_NOTES_LENGTH}
              </span>
            </label>

            <Button
              type="submit"
              fullWidth
              disabled={
                submitting ||
                status === "loading" ||
                unavailableItems.length > 0
              }
            >
              {submitting ? (
                <>
                  <Spinner label="Mengirim pesanan" />
                  Memproses…
                </>
              ) : (
                "Buat pesanan"
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

function CartRow({
  item,
  currentPrice,
  unavailable,
  disabled,
}: {
  item: CartItem;
  currentPrice: number;
  unavailable: boolean;
  disabled: boolean;
}) {
  const { setQuantity, removeItem } = useCart();

  return (
    <Card
      className={`flex flex-wrap items-center gap-4${unavailable ? " border-strawberry-300 bg-strawberry-50" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-14 shrink-0 place-items-center rounded-2xl text-2xl ${item.tone}`}
      >
        {item.emoji}
      </span>

      <div className="min-w-32 flex-1">
        <p className="font-semibold text-cocoa-900">{item.name}</p>
        <p className="text-sm text-cocoa-500">
          {formatPrice(currentPrice)} / kue
          {currentPrice !== item.price && (
            <span className="ml-2 text-xs text-strawberry-700">
              harga diperbarui
            </span>
          )}
        </p>
        {unavailable && (
          <p className="mt-1 text-xs font-semibold text-strawberry-700">
            Menu ini sudah tidak tersedia
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          aria-label={`Kurangi jumlah ${item.name}`}
          disabled={disabled}
          onClick={() => setQuantity(item.productId, item.quantity - 1)}
          className="size-9 p-0"
        >
          −
        </Button>

        <input
          type="number"
          inputMode="numeric"
          aria-label={`Jumlah ${item.name}`}
          value={item.quantity}
          min={1}
          max={MAX_QUANTITY_PER_ITEM}
          disabled={disabled}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            // Input kosong atau bukan angka dibiarkan apa adanya sampai
            // pengguna selesai mengetik, jangan langsung menghapus itemnya.
            if (Number.isNaN(parsed)) return;
            setQuantity(item.productId, parsed);
          }}
          className="w-14 rounded-xl border border-cream-400 bg-cream-50 py-1.5 text-center text-sm text-cocoa-900 focus:outline-2 focus:outline-offset-2 focus:outline-strawberry-300"
        />

        <Button
          variant="outline"
          size="sm"
          aria-label={`Tambah jumlah ${item.name}`}
          disabled={disabled || item.quantity >= MAX_QUANTITY_PER_ITEM}
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
          className="size-9 p-0"
        >
          +
        </Button>
      </div>

      <div className="ml-auto text-right">
        <p className="font-bold text-strawberry-700">
          {formatPrice(currentPrice * item.quantity)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => removeItem(item.productId)}
          className="mt-1 px-2 py-1 text-xs"
        >
          Hapus
        </Button>
      </div>
    </Card>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]" aria-busy="true">
      <div className="flex flex-col gap-3">
        {[0, 1].map((index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
