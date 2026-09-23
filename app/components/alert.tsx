import type { ReactNode } from "react";
import { cn } from "./cn";

export type AlertVariant = "error" | "success" | "info";

type AlertProps = {
  variant?: AlertVariant;
  title?: ReactNode;
  children?: ReactNode;
  /** Beberapa pesan sekaligus — cocok untuk error validasi dari backend. */
  messages?: string[];
  /** Kalau diisi, tombol "Coba lagi" ditampilkan. */
  onRetry?: () => void;
  className?: string;
};

const variantStyles: Record<AlertVariant, string> = {
  error: "border-strawberry-200 bg-strawberry-50 text-strawberry-800",
  success: "border-pistachio-200 bg-pistachio-100 text-cocoa-700",
  info: "border-blueberry-200 bg-blueberry-100 text-cocoa-700",
};

const variantIcons: Record<AlertVariant, string> = {
  error: "⚠️",
  success: "✅",
  info: "ℹ️",
};

export default function Alert({
  variant = "error",
  title,
  children,
  messages,
  onRetry,
  className,
}: AlertProps) {
  const list = messages?.filter(Boolean) ?? [];

  return (
    <div
      // `alert` membuat pembaca layar langsung membacakannya saat muncul.
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-sm",
        variantStyles[variant],
        className
      )}
    >
      <span aria-hidden="true">{variantIcons[variant]}</span>

      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}

        {children && <div className={cn(title ? "mt-1" : undefined)}>{children}</div>}

        {list.length === 1 && <p className={cn(title ? "mt-1" : undefined)}>{list[0]}</p>}

        {list.length > 1 && (
          <ul className={cn("list-inside list-disc space-y-0.5", title ? "mt-1" : undefined)}>
            {list.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 cursor-pointer rounded-full border border-current px-3 py-1 text-xs font-semibold transition duration-300 hover:opacity-70"
          >
            Coba lagi
          </button>
        )}
      </div>
    </div>
  );
}
