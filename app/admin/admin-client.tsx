"use client";

import { useState } from "react";
import Alert from "../components/alert";
import { buttonStyles } from "../components/button";
import Card from "../components/card";
import OrderStatusBadge from "../components/order-status-badge";
import { Skeleton } from "../components/spinner";
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

export default function AdminClient() {
  const { status, user } = useAuth();
  const [filter, setFilter] = useState<Filter>("ALL");

  // Path berubah saat filter diganti, dan hook otomatis mengambil ulang datanya.
  const path =
    filter === "ALL" ? "/orders?limit=50" : `/orders?limit=50&status=${filter}`;

  const { data, error, loading, reload } = useApiResource<Paginated<Order>>(
    path,
    { enabled: status === "authenticated" }
  );

  const orders = data?.data ?? [];
  const isBusy = status === "loading" || loading;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-cocoa-900">Dashboard Admin</h1>
        <p className="mt-1 text-cocoa-500">
          Semua pesanan yang masuk{user ? `, dikelola oleh ${user.name}` : ""}.
        </p>
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
          </p>

          <ul className="mt-4 flex flex-col gap-4">
            {orders.map((order) => (
              <li key={order.id}>
                <AdminOrderCard order={order} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function AdminOrderCard({ order }: { order: Order }) {
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
        </Card>
      ))}
    </div>
  );
}
