import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';

/**
 * POST /api/products/[slug]/view
 *
 * Fire-and-forget endpoint called from ProductDetailClient on mount.
 * Rate-limiting is enforced on the CLIENT side via sessionStorage so that
 * one page visit = one increment, regardless of re-renders.
 *
 * The endpoint itself is intentionally lightweight (no auth required) because
 * view counts are low-sensitivity data — a highly-skewed count is a cosmetic
 * issue, not a security one.  For future hardening, add a unique constraint
 * on (product_id, session_id, date) in a product_view_events table and
 * aggregate from there — that also unlocks time-windowed trending.
 *
 * NOTE: React StrictMode double-fires effects in dev, but the client-side
 * sessionStorage guard already prevents the second call from reaching this
 * endpoint, so dev counts stay accurate.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 });
  }

  const supabase = createPublicClient();
  await supabase.rpc('increment_view_count', { product_slug: slug });

  return NextResponse.json({ ok: true });
}
