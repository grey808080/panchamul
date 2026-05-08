/**
 * Generate a unique order number in the format PB-YYYY-XXXXXXXX.
 *
 * Uses the first 8 hex characters of a crypto.randomUUID() to give
 * ~4 billion possible values per year, making collisions negligible
 * without requiring a database sequence.
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  // crypto.randomUUID is available in all modern browsers and Node 14.17+
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `PB-${year}-${suffix}`;
}
