/**
 * Format a number as NPR currency
 * @example formatPrice(1200) => "रु 1,200"
 */
export function formatPrice(amount: number, locale: string = 'en'): string {
  const formatted = new Intl.NumberFormat('ne-NP').format(amount);
  return `रु ${formatted}`;
}

/**
 * Format as NPR with label
 */
export function formatPriceWithLabel(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN').format(amount);
  return `NPR ${formatted}`;
}

/**
 * Calculate discount percentage
 */
export function discountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
