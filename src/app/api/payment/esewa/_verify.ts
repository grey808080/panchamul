/**
 * Shared eSewa callback verification for success/failure routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  checkEsewaTransactionStatus,
  decodeEsewaCallbackData,
  getEsewaMerchantCode,
  verifyEsewaCallbackSignature,
  type EsewaCallbackData,
} from '@/lib/payment/esewa';

const LOCALE = 'en';

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

function redirectToOrder(orderNumber: string, payment: 'success' | 'failed' | 'review') {
  return NextResponse.redirect(
    `${siteUrl()}/${LOCALE}/orders/${orderNumber}?payment=${payment}`
  );
}

function redirectToCheckout(error: string) {
  return NextResponse.redirect(`${siteUrl()}/${LOCALE}/checkout?payment_error=${error}`);
}

async function findOrderByTransactionUuid(transactionUuid: string) {
  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, total, payment_status')
    .eq('payment_status', `esewa_txn:${transactionUuid}`)
    .maybeSingle();

  if (order) return { order, supabase };

  // Fallback: payment_status may have been partially updated
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, payment_status')
    .like('payment_status', `esewa_%${transactionUuid}%`);

  const match = orders?.find(
    (o) =>
      o.payment_status === `esewa_txn:${transactionUuid}` ||
      o.payment_status?.includes(transactionUuid)
  );

  return { order: match ?? null, supabase };
}

async function processVerifiedPayment(
  order: { id: string; order_number: string; total: number | string; payment_status: string | null },
  transactionUuid: string,
  supabase: ReturnType<typeof createAdminClient>
): Promise<NextResponse> {
  if (order.payment_status === 'paid') {
    return redirectToOrder(order.order_number, 'success');
  }

  const expectedNPR = Number(order.total);
  const productCode = getEsewaMerchantCode();

  const statusResponse = await checkEsewaTransactionStatus(
    transactionUuid,
    expectedNPR,
    productCode
  );

  const paidAmount =
    statusResponse.totalAmount ?? statusResponse.total_amount ?? expectedNPR;

  if (statusResponse.status === 'COMPLETE') {
    if (Math.abs(paidAmount - expectedNPR) > 1) {
      console.error(
        `[eSewa verify] Amount mismatch for ${order.order_number}: ` +
          `expected ${expectedNPR}, got ${paidAmount}`
      );
      await supabase
        .from('orders')
        .update({ payment_status: `esewa_amount_mismatch:${transactionUuid}` })
        .eq('id', order.id);

      return redirectToOrder(order.order_number, 'review');
    }

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
      })
      .eq('id', order.id);

    return redirectToOrder(order.order_number, 'success');
  }

  const statusKey = statusResponse.status.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  await supabase
    .from('orders')
    .update({ payment_status: `esewa_${statusKey}` })
    .eq('id', order.id);

  return redirectToOrder(order.order_number, 'failed');
}

async function handleCallbackData(
  decoded: EsewaCallbackData,
  expectComplete: boolean
): Promise<NextResponse> {
  if (!verifyEsewaCallbackSignature(decoded)) {
    console.error('[eSewa verify] Invalid callback signature');
    return redirectToCheckout('verification_failed');
  }

  const { transaction_uuid: transactionUuid } = decoded;
  if (!transactionUuid) {
    return redirectToCheckout('invalid_callback');
  }

  const { order, supabase } = await findOrderByTransactionUuid(transactionUuid);

  if (!order) {
    console.error('[eSewa verify] Order not found for txn:', transactionUuid);
    return redirectToCheckout('order_not_found');
  }

  if (decoded.status !== 'COMPLETE' && expectComplete) {
    const statusKey = decoded.status.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    await supabase
      .from('orders')
      .update({ payment_status: `esewa_${statusKey}` })
      .eq('id', order.id);

    return redirectToOrder(order.order_number, 'failed');
  }

  return processVerifiedPayment(order, transactionUuid, supabase);
}

export async function handleEsewaCallback(
  request: NextRequest,
  expectComplete: boolean
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data');

  if (!data) {
    if (!expectComplete) {
      return redirectToCheckout('cancelled');
    }
    return redirectToCheckout('invalid_callback');
  }

  try {
    const decoded = decodeEsewaCallbackData(data);
    return handleCallbackData(decoded, expectComplete);
  } catch (error: unknown) {
    console.error('[eSewa verify] Error:', error);
    return redirectToCheckout('verification_failed');
  }
}
