/**
 * Lightweight className merger — joins truthy strings and filters falsy values.
 * Avoids adding clsx/tailwind-merge as a dependency for simple use cases.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
