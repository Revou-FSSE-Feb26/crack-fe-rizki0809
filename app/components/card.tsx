import type { ReactNode } from "react";
import { cn } from "./cn";

export type CardVariant = "solid" | "soft" | "outline";

type CardProps = {
  children?: ReactNode;
  /** Optional heading row above the content. */
  title?: ReactNode;
  description?: ReactNode;
  /** Optional row below the content, separated by a hairline. */
  footer?: ReactNode;
  variant?: CardVariant;
  className?: string;
};

const variantStyles: Record<CardVariant, string> = {
  solid: "border-cream-400 bg-cream-50 shadow-sm",
  soft: "border-strawberry-100 bg-strawberry-50",
  outline: "border-cream-400 bg-transparent",
};

export default function Card({
  children,
  title,
  description,
  footer,
  variant = "solid",
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl border p-6",
        variantStyles[variant],
        className
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-cocoa-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-cocoa-500">{description}</p>
          )}
        </div>
      )}

      {children}

      {footer && (
        <div className="mt-5 border-t border-cream-300 pt-4">{footer}</div>
      )}
    </div>
  );
}
