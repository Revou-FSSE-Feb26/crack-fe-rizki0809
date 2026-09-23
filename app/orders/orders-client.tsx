"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Alert from "../components/alert";
import { buttonStyles } from "../components/button";
import Card from "../components/card";
import OrderStatusBadge from "../components/order-status-badge";
import { Skeleton } from "../components/spinner";
import { useAuth } from "../lib/auth-context";
import { formatPickupDate, formatPrice, formatShortDate } from "../lib/format";
import type { Order, Paginated } from "../lib/types";
import { useApiResource } from "../lib/use-api-resource";

export default function OrdersClient() {
  const { status, user } = useAuth();
  const searchParams = useSearchParams();

  // Backend otomatis membatasi hasilnya ke pesanan milik yang login.
  const { data, error, loading, reload } = useApiResource<Paginated<Order>>(
    "/orders?limit=50",
    { enabled: status === "authenticated" }
  );

  // Dikirim proxy.ts saat customer mencoba membuka halaman admin.
  const wasForbidden = searchParams.get("error") === "forbidden";

  const orders = data?.data ?? [];
  const isBusy = status === "loading" || loading;

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
          </p>

          <ul className="flex flex-col gap-4">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function OrderCard({ order }: { order: Order }) {
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
