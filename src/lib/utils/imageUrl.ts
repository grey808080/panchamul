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
  // options kept for API compatibility — transforms disabled (requires Supabase Pro)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: ImageTransformOptions = {}
): string {
  if (!url) return '/placeholder-product.png';

  // ⚠️  The Supabase /render/image/public/ transform endpoint requires a Pro plan.
  // On the free tier it returns an error, which breaks images in Vercel production
  // even though they appear fine on localhost.
  // Fix: always serve the plain /object/public/ URL and let Next.js <Image>
  // handle optimisation on its side (it already does width/quality via its own CDN).
  //
  // To re-enable Supabase transforms after upgrading to Pro, restore the logic below:
  //   const transformUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  //   const params = new URLSearchParams(); ...
  return url;
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