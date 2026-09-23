import type { OrderStatus } from "../lib/types";
import { cn } from "./cn";

/** Label bahasa Indonesia + warna untuk tiap status pesanan. */
const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Menunggu konfirmasi",
    className: "bg-butter-200 text-cocoa-700",
  },
  CONFIRMED: {
    label: "Dikonfirmasi",
    className: "bg-blueberry-200 text-cocoa-700",
  },
  READY: {
    label: "Siap diambil",
    className: "bg-pistachio-200 text-cocoa-700",
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-cream-300 text-cocoa-700",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-strawberry-100 text-strawberry-800",
  },
};

export default function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const style = statusStyles[status];

  // Status tak dikenal (misalnya backend menambah status baru) tetap tampil
  // apa adanya, bukan membuat halaman error.
  if (!style) {
    return (
      <span className={cn("rounded-full bg-cream-300 px-3 py-1 text-xs font-semibold text-cocoa-700", className)}>
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}
