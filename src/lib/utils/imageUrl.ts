/**
 * Build an optimized image URL for Supabase Storage.
 *
 * Supabase Storage supports image transformations via the `render/image` endpoint:
 * https://supabase.com/docs/guides/storage/serving/image-transformations
 *
 * Usage:
 *   getImageUrl(product.images[0], { width: 400, quality: 75 })
 *
 * Falls back to the original URL if the input is not a Supabase Storage URL
 * or if no transform options are provided.
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  /** 'origin' preserves original format; default is webp */
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

export function getImageUrl(
  url: string | null | undefined,
  options: ImageTransformOptions = {}
): string {
  if (!url) return '/placeholder-product.png';

  // Only transform Supabase Storage public URLs
  const isSupabaseStorage = url.includes('/storage/v1/object/public/');
  if (!isSupabaseStorage || Object.keys(options).length === 0) return url;

  // Convert /object/public/ → /render/image/public/ for transform endpoint
  const transformUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format) params.set('format', options.format);
  if (options.resize) params.set('resize', options.resize);

  return `${transformUrl}?${params.toString()}`;
}

/** Preset: product card thumbnail (400px wide, 75 quality) */
export function productThumbUrl(url: string | null | undefined): string {
  return getImageUrl(url, { width: 400, quality: 75, resize: 'cover' });
}

/** Preset: product detail main image (900px wide, 85 quality) */
export function productDetailUrl(url: string | null | undefined): string {
  return getImageUrl(url, { width: 900, quality: 85, resize: 'cover' });
}

/** Preset: product thumbnail strip (160px wide, 75 quality) */
export function productThumbStripUrl(url: string | null | undefined): string {
  return getImageUrl(url, { width: 160, quality: 75, resize: 'cover' });
}
