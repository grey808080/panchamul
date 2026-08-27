/**
 * Format a number as NPR currency
 * @example formatPrice(1200) => "Rs 1,200"
 */
export function formatPrice(amount: number, locale: string = 'en'): string {
  const formatted = new Intl.NumberFormat(locale === 'np' ? 'ne-NP' : 'en-IN').format(amount);
  return `Rs ${formatted}`;
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
