/**
 * GET /api/payment/khalti/verify
 *
 * Khalti redirects here after the user completes (or cancels) payment.
 * Query params from Khalti:
 *   pidx        — payment identifier
 *   status      — "Completed" | "User canceled" | "Pending" etc.
 *   transaction_id
 *   tidx
 *   amount      — in paisa
 *   mobile
 *   purchase_order_id  — our order_number
 *   purchase_order_name
 *
 * Flow:
 *   1. Extract pidx from query params
 *   2. Call Khalti lookup API to verify (never trust client-side status)
 *   3. Find the order by order_number (purchase_order_id)
 *   4. If Completed: mark payment_status=paid, order status=processing
 *   5. Redirect to order confirmation page
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { lookupKhaltiPayment } from '@/lib/payment/khalti';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pidx = searchParams.get('pidx');
  const purchaseOrderId = searchParams.get('purchase_order_id'); // our order_number
  const clientStatus = searchParams.get('status');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Determine locale from referer or default to 'en'
  const locale = 'en';

  if (!pidx || !purchaseOrderId) {
    return NextResponse.redirect(
      `${siteUrl}/${locale}/checkout?payment_error=invalid_callback`
    );
  }

  // User cancelled — redirect back to checkout without marking as failed
  if (clientStatus === 'User canceled') {
    return NextResponse.redirect(
      `${siteUrl}/${locale}/checkout?payment_error=cancelled`
    );
  }

  try {
    const supabase = createAdminClient();

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total, payment_status')
      .eq('order_number', purchaseOrderId)
      .single();

    if (orderError || !order) {
      console.error('[Khalti verify] Order not found:', purchaseOrderId);
      return NextResponse.redirect(
        `${siteUrl}/${locale}/checkout?payment_error=order_not_found`
      );
    }

    // Already paid — idempotent redirect
    if (order.payment_status === 'paid') {
      return NextResponse.redirect(
        `${siteUrl}/${locale}/orders/${order.order_number}?payment=success`
      );
    }

    // Verify with Khalti server-side — never trust the client-side status param
    const lookup = await lookupKhaltiPayment(pidx);

    if (lookup.status === 'Completed') {
      // Verify amount matches (Khalti returns paisa, we store NPR)
      const paidAmountNPR = lookup.total_amount / 100;
      const expectedNPR = Number(order.total);

      if (Math.abs(paidAmountNPR - expectedNPR) > 1) {
        // Amount mismatch — flag for manual review
        console.error(
          `[Khalti verify] Amount mismatch for ${order.order_number}: ` +
          `expected ${expectedNPR}, got ${paidAmountNPR}`
        );
        await supabase
          .from('orders')
          .update({ payment_status: `khalti_amount_mismatch:${pidx}` })
          .eq('id', order.id);

        return NextResponse.redirect(
          `${siteUrl}/${locale}/orders/${order.order_number}?payment=review`
        );
      }

      // All good — mark as paid and move to processing
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
        })
        .eq('id', order.id);

      return NextResponse.redirect(
        `${siteUrl}/${locale}/orders/${order.order_number}?payment=success`
      );
    }

    // Payment not completed (Pending, Expired, etc.)
    await supabase
      .from('orders')
      .update({ payment_status: `khalti_${lookup.status.toLowerCase().replace(' ', '_')}` })
      .eq('id', order.id);

    return NextResponse.redirect(
      `${siteUrl}/${locale}/orders/${order.order_number}?payment=failed`
    );
  } catch (error: unknown) {
    console.error('[Khalti verify] Error:', error);
    return NextResponse.redirect(
      `${siteUrl}/${locale}/checkout?payment_error=verification_failed`
    );
  }
}
