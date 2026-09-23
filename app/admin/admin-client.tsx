"use client";

import Link from "next/link";
import { useState } from "react";
import Alert from "../components/alert";
import Button, { buttonStyles } from "../components/button";
import Card from "../components/card";
import OrderStatusBadge from "../components/order-status-badge";
import Spinner, { Skeleton } from "../components/spinner";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { formatPickupDate, formatPrice } from "../lib/format";
import type { Order, OrderStatus, Paginated } from "../lib/types";
import { useApiResource } from "../lib/use-api-resource";

type Filter = "ALL" | OrderStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "CONFIRMED", label: "Dikonfirmasi" },
  { value: "READY", label: "Siap diambil" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

/**
 * Perpindahan status yang diizinkan — disalin dari aturan di backend supaya
 * tombol yang pasti ditolak tidak perlu ditampilkan sejak awal. Backend tetap
 * memeriksa ulang, jadi daftar ini murni soal tampilan.
 */
const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

/** Label tombol ditulis sebagai perintah, bukan nama status. */
const actionLabels: Record<OrderStatus, string> = {
  PENDING: "Kembalikan ke menunggu",
  CONFIRMED: "Konfirmasi pesanan",
  READY: "Tandai siap diambil",
  COMPLETED: "Tandai selesai",
  CANCELLED: "Batalkan",
};

export default function AdminClient() {
  const { status, user } = useAuth();
  const [filter, setFilter] = useState<Filter>("ALL");

  // Path berubah saat filter diganti, dan hook otomatis mengambil ulang datanya.
  const path =
    filter === "ALL" ? "/orders?limit=50" : `/orders?limit=50&status=${filter}`;

  const { data, error, initialLoading, refreshing, reload } =
    useApiResource<Paginated<Order>>(path, {
      enabled: status === "authenticated",
    });

  const orders = data?.data ?? [];
  const isBusy = status === "loading" || initialLoading;

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-cocoa-900">Dashboard Admin</h1>
          <p className="mt-1 text-cocoa-500">
            Semua pesanan yang masuk{user ? `, dikelola oleh ${user.name}` : ""}.
          </p>
        </div>
        <Link
          href="/admin/menu"
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Kelola menu →
        </Link>
      </header>

      {/* ---------- Filter status ---------- */}
      <nav aria-label="Filter status pesanan" className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            disabled={isBusy}
            className={buttonStyles({
              variant: filter === item.value ? "primary" : "outline",
              size: "sm",
            })}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {error && (
        <Alert
          title="Gagal memuat pesanan"
          messages={error.messages}
          onRetry={reload}
          className="mt-5"
        />
      )}

      {isBusy && <AdminSkeleton />}

      {!isBusy && !error && orders.length === 0 && (
        <Card variant="soft" className="mt-5 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">
            📋
          </p>
          <h2 className="mt-3 font-semibold text-cocoa-900">
            {filter === "ALL"
              ? "Belum ada pesanan masuk"
              : "Tidak ada pesanan dengan status ini"}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-cocoa-500">
            {filter === "ALL"
              ? "Pesanan dari customer akan muncul di sini begitu mereka memesan."
              : "Coba pilih status lain untuk melihat pesanan yang ada."}
          </p>
        </Card>
      )}

      {!isBusy && orders.length > 0 && (
        <>
          <p className="mt-5 text-sm text-cocoa-500">
            Menampilkan {orders.length} dari {data?.meta.total ?? orders.length}{" "}
            pesanan
            {refreshing && <span className="ml-2">· memperbarui…</span>}
          </p>

          <ul className="mt-4 flex flex-col gap-4">
            {orders.map((order) => (
              <li key={order.id}>
                <AdminOrderCard order={order} onChanged={reload} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function AdminOrderCard({
  order,
  onChanged,
}: {
  order: Order;
  onChanged: () => void;
}) {
  const { request } = useAuth();

  /** Status yang sedang dikirim ke server, dipakai menandai tombol mana yang sibuk. */
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  /** Pembatalan bersifat final, jadi minta penegasan dulu. */
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const allowed = nextStatuses[order.status] ?? [];

  async function changeStatus(nextStatus: OrderStatus) {
    if (pending) return;

    setPending(nextStatus);
    setErrors([]);

    try {
      await request(`/orders/${order.id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });

      setConfirmingCancel(false);
      // Ambil ulang daftarnya: status baru bisa membuat pesanan ini keluar
      // dari filter yang sedang aktif.
      onChanged();
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? error.messages
          : ["Gagal mengubah status. Coba lagi."]
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-cocoa-900">
            {order.orderNumber}
          </p>
          <p className="mt-0.5 truncate text-sm text-cocoa-700">
            {order.user.name}
          </p>
          <p className="truncate text-xs text-cocoa-500">
            {order.user.phone ?? order.user.email}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 rounded-2xl bg-cream-100 px-4 py-3 text-sm">
        <div>
          <dt className="text-xs text-cocoa-500">Diambil pada</dt>
          <dd className="font-semibold text-cocoa-900">
            {formatPickupDate(order.pickupDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-cocoa-500">Total</dt>
          <dd className="font-semibold text-strawberry-700">
            {formatPrice(order.totalPrice)}
          </dd>
        </div>
      </dl>

      <ul className="mt-4 flex flex-wrap gap-2">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="rounded-full bg-cream-200 px-3 py-1 text-xs text-cocoa-700"
          >
            <span aria-hidden="true">{item.product.emoji}</span>{" "}
            {item.product.name} ×{item.quantity}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-4 rounded-2xl border border-cream-300 px-4 py-3 text-sm text-cocoa-500">
          <span className="font-semibold text-cocoa-700">Catatan: </span>
          {order.notes}
        </p>
      )}

      {errors.length > 0 && (
        <Alert
          title="Status gagal diubah"
          messages={errors}
          className="mt-4"
        />
      )}

      {/* ---------- Tombol ubah status ---------- */}
      <div className="mt-4 border-t border-cream-300 pt-4">
        {allowed.length === 0 ? (
          <p className="text-sm text-cocoa-500">
            Pesanan ini sudah{" "}
            {order.status === "COMPLETED" ? "selesai" : "dibatalkan"}, statusnya
            tidak bisa diubah lagi.
          </p>
        ) : confirmingCancel ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-cocoa-700">
              Batalkan pesanan ini? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={pending !== null}
                onClick={() => changeStatus("CANCELLED")}
              >
                {pending === "CANCELLED" ? (
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
                disabled={pending !== null}
                onClick={() => setConfirmingCancel(false)}
              >
                Tidak
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowed.map((nextStatus) => {
              const isCancel = nextStatus === "CANCELLED";

              return (
                <Button
                  key={nextStatus}
                  size="sm"
                  variant={isCancel ? "outline" : "primary"}
                  disabled={pending !== null}
                  onClick={() =>
                    isCancel
                      ? setConfirmingCancel(true)
                      : changeStatus(nextStatus)
                  }
                >
                  {pending === nextStatus ? (
                    <>
                      <Spinner label="Menyimpan" />
                      Memproses…
                    </>
                  ) : (
                    actionLabels[nextStatus]
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function AdminSkeleton() {
  return (
    <div className="mt-5 flex flex-col gap-4" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-14" />
          <Skeleton className="mt-4 h-7 w-56" />
          <Skeleton className="mt-4 h-9 w-64 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
