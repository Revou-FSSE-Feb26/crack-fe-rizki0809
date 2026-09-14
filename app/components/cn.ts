type ClassValue = string | false | null | undefined;

/** Joins class names, dropping anything falsy. */
export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}
