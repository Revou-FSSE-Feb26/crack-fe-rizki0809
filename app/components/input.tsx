import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Rendered above the field. The whole thing is wrapped in a `<label>`, so no `id` is needed. */
  label?: ReactNode;
  /** Helper text below the field. Hidden while `error` is set. */
  hint?: ReactNode;
  /** Error message below the field. Also turns the field red. */
  error?: ReactNode;
};

const fieldStyles =
  "w-full rounded-2xl border bg-cream-50 px-4 py-3 text-sm text-cocoa-900 transition duration-300 placeholder:text-cocoa-300 focus:outline-2 focus:outline-offset-2 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:opacity-60";

export default function Input({
  label,
  hint,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <label className="block w-full">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-cocoa-700">
          {label}
        </span>
      )}

      <input
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldStyles,
          error
            ? "border-strawberry-400 focus:outline-strawberry-400"
            : "border-cream-400 hover:border-cream-300 focus:outline-strawberry-300",
          className
        )}
        {...props}
      />

      {(error || hint) && (
        <span
          className={cn(
            "mt-1.5 block text-xs",
            error ? "text-strawberry-700" : "text-cocoa-500"
          )}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}
