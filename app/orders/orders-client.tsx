"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Alert from "../components/alert";
import Button, { buttonStyles } from "../components/button";
import Card from "../components/card";
import Input from "../components/input";
import OrderStatusBadge from "../components/order-status-badge";
import Spinner, { Skeleton } from "../components/spinner";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import {
  earliestPickupDate,
  formatPickupDate,
  formatPrice,
  formatShortDate,
  toDateInputValue,
} from "../lib/format";
import type { Order, OrderStatus, Paginated } from "../lib/types";
import { useApiResource } from "../lib/use-api-resource";

export default function OrdersClient() {
  const { status, user } = useAuth();
  const searchParams = useSearchParams();

  // Backend otomatis membatasi hasilnya ke pesanan milik yang login.
  const { data, error, initialLoading, refreshing, reload } =
    useApiResource<Paginated<Order>>("/orders?limit=50", {
      enabled: status === "authenticated",
    });

  // Dikirim proxy.ts saat customer mencoba membuka halaman admin.
  const wasForbidden = searchParams.get("error") === "forbidden";
  // Dikirim halaman keranjang setelah pesanan berhasil dibuat.
  const newOrderNumber = searchParams.get("baru");

  const orders = data?.data ?? [];
  const isBusy = status === "loading" || initialLoading;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-cocoa-900">Pesanan Saya</h1>
        <p className="mt-1 text-cocoa-500">
          {user
            ? `Riwayat pesanan atas nama ${user.name}.`
            : "Riwayat pesanan kamu."}
        </p>
      </header>

      {newOrderNumber && (
        <Alert variant="success" title="Pesanan berhasil dibuat" className="mb-5">
          Nomor pesananmu <strong>{newOrderNumber}</strong>. Kami akan
          mengonfirmasinya sebentar lagi — pantau statusnya di daftar bawah ini.
        </Alert>
      )}

      {wasForbidden && (
        <Alert variant="info" className="mb-5">
          Halaman itu khusus admin. Kami bawa kamu kembali ke pesananmu.
        </Alert>
      )}

      {error && (
        <Alert
          title="Gagal memuat pesanan"
          messages={error.messages}
          onRetry={reload}
          className="mb-5"
        />
      )}

      {isBusy && <OrdersSkeleton />}

      {/* Sudah selesai memuat, tidak error, tapi memang belum ada pesanan. */}
      {!isBusy && !error && orders.length === 0 && (
        <Card variant="soft" className="py-12 text-center">
          <p className="text-4xl" aria-hidden="true">
            🧁
          </p>
          <h2 className="mt-3 font-semibold text-cocoa-900">
            Belum ada pesanan
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-cocoa-500">
            Pesanan yang kamu buat akan muncul di sini, lengkap dengan status
            dan tanggal pengambilannya.
          </p>
          <Link
            href="/products"
            className={buttonStyles({ size: "sm", className: "mt-5" })}
          >
            Lihat menu kue
          </Link>
        </Card>
      )}

      {!isBusy && orders.length > 0 && (
        <>
          <p className="mb-4 text-sm text-cocoa-500">
            Menampilkan {orders.length} dari {data?.meta.total ?? orders.length}{" "}
            pesanan
            {refreshing && <span className="ml-2">· memperbarui…</span>}
          </p>

          <ul className="flex flex-col gap-4">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} onChanged={reload} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

/** Status yang isinya masih boleh diubah customer, sesuai aturan backend. */
const editableStatuses: OrderStatus[] = ["PENDING", "CONFIRMED"];

function OrderCard({
  order,
  onChanged,
}: {
  order: Order;
  onChanged: () => void;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-cocoa-900">
            {order.orderNumber}
          </p>
          <p className="mt-0.5 text-xs text-cocoa-500">
            Dipesan {formatShortDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-cocoa-500">Diambil pada</dt>
          <dd className="font-semibold text-cocoa-900">
            {formatPickupDate(order.pickupDate)}
          </dd>
        </div>
      </dl>

      <ul className="mt-4 flex flex-col gap-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className={`grid size-9 shrink-0 place-items-center rounded-xl text-lg ${item.product.tone}`}
            >
              {item.product.emoji}
            </span>
            <span className="min-w-0 flex-1 truncate text-cocoa-700">
              {item.product.name}
            </span>
            <span className="shrink-0 text-cocoa-500">×{item.quantity}</span>
            <span className="shrink-0 font-medium text-cocoa-900">
              {formatPrice(item.subtotal)}
            </span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-4 rounded-2xl border border-cream-300 px-4 py-3 text-sm text-cocoa-500">
          <span className="font-semibold text-cocoa-700">Catatan: </span>
          {order.notes}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-cream-300 pt-4">
        <span className="text-sm text-cocoa-500">Total</span>
        <span className="text-lg font-bold text-strawberry-700">
          {formatPrice(order.totalPrice)}
        </span>
      </div>

      <OrderActions order={order} onChanged={onChanged} />
    </Card>
  );
}

/** Bentuknya menyerupai kartu pesanan agar tata letak tidak melompat. */
function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-12" />
          <Skeleton className="mt-4 h-9" />
          <Skeleton className="mt-4 h-9" />
        </Card>
      ))}
    </div>
  );
}

/**
 * Tombol aksi milik customer: mengganti tanggal pengambilan dan membatalkan
 * pesanan. Keduanya hanya berlaku selama pesanan belum diproses lebih jauh —
 * aturan yang sama juga ditegakkan backend.
 */
function OrderActions({
  order,
  onChanged,
}: {
  order: Order;
  onChanged: () => void;
}) {
  const { request } = useAuth();

  const [mode, setMode] = useState<"idle" | "reschedule" | "confirm-cancel">(
    "idle"
  );
  const [pickupDate, setPickupDate] = useState(() =>
    toDateInputValue(order.pickupDate)
  );
  const [busy, setBusy] = useState<"date" | "cancel" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const earliest = earliestPickupDate();

  if (!editableStatuses.includes(order.status)) {
    return (
      <p className="mt-4 border-t border-cream-300 pt-4 text-sm text-cocoa-500">
        {order.status === "CANCELLED"
          ? "Pesanan ini sudah dibatalkan."
          : order.status === "COMPLETED"
            ? "Pesanan ini sudah selesai. Terima kasih!"
            : "Pesanan sedang disiapkan, jadi tanggalnya tidak bisa diubah lagi."}
      </p>
    );
  }

  async function run(
    action: "date" | "cancel",
    send: () => Promise<unknown>
  ) {
    if (busy) return;

    setBusy(action);
    setErrors([]);

    try {
      await send();
      setMode("idle");
      onChanged();
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? error.messages
          : ["Terjadi kesalahan. Coba lagi."]
      );
    } finally {
      setBusy(null);
    }
  }

  function saveDate() {
    if (pickupDate < earliest) {
      setErrors([
        `Tanggal paling cepat ${earliest}, karena kue dibuat H-1.`,
      ]);
      return;
    }

    void run("date", () =>
      request(`/orders/${order.id}/pickup-date`, {
        method: "PATCH",
        body: { pickupDate },
      })
    );
  }

  return (
    <div className="mt-4 border-t border-cream-300 pt-4">
      {errors.length > 0 && (
        <Alert messages={errors} className="mb-3" />
      )}

      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setErrors([]);
              setPickupDate(toDateInputValue(order.pickupDate));
              setMode("reschedule");
            }}
          >
            Ganti tanggal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setErrors([]);
              setMode("confirm-cancel");
            }}
          >
            Batalkan pesanan
          </Button>
        </div>
      )}

      {mode === "reschedule" && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Input
              label="Tanggal pengambilan baru"
              name="pickupDate"
              type="date"
              value={pickupDate}
              min={earliest}
              onChange={(event) => {
                setPickupDate(event.target.value);
                setErrors([]);
              }}
              hint={`Paling cepat ${earliest}.`}
              disabled={busy !== null}
            />
          </div>
          <div className="flex gap-2 pb-6">
            <Button size="sm" disabled={busy !== null} onClick={saveDate}>
              {busy === "date" ? (
                <>
                  <Spinner label="Menyimpan" />
                  Menyimpan…
                </>
              ) : (
                "Simpan"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => {
                setMode("idle");
                setErrors([]);
              }}
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {mode === "confirm-cancel" && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-cocoa-700">
            Batalkan pesanan ini? Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy !== null}
              onClick={() =>
                void run("cancel", () =>
                  request(`/orders/${order.id}/cancel`, { method: "PATCH" })
                )
              }
            >
              {busy === "cancel" ? (
                <>
                  <Spinner label="Membatalkan" />
                  Memproses…
                </>
              ) : (
                "Ya, batalkan"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => setMode("idle")}
            >
              Tidak
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
