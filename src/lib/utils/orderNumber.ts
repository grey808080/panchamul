/**
 * Generate a unique order number in the format PB-YYYY-XXXX
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PB-${year}-${random}`;
}
