const BANKE_CITIES = [
  'kohalpur', 'nepalgunj', 'narainapur', 'rapti sonari',
  'janki', 'duduwa', 'baijanath', 'khajura', 'banke',
  'baijapur', 'nawabi'
];

/**
 * Check if a city/address is within the Kohalpur/Banke delivery zone
 */
export function isInDeliveryZone(city: string): boolean {
  const normalized = city.toLowerCase().trim();
  return BANKE_CITIES.some(c => normalized.includes(c));
}

/**
 * Get delivery charge (free for now)
 */
export function getDeliveryCharge(_city: string): number {
  // Free delivery within Banke district
  return 0;
}
