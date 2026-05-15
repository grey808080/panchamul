/**
 * POST /api/payment/esewa/initiate
 *
 * Called from checkout when the user selects eSewa.
 * Returns signed form fields for POST redirect to eSewa ePay v2.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  buildEsewaPaymentFields,
  generateEsewaTransactionUuid,
} from '@/lib/payment/esewa';

export async function POST(request: NextRequest) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, order_number, amount } = body;

    if (!order_id || !order_number || amount == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total, payment_status')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const transactionUuid = generateEsewaTransactionUuid(order_number);

    const { form_action, fields } = buildEsewaPaymentFields({
      amount: Number(amount),
      transactionUuid,
      successUrl: `${siteUrl}/api/payment/esewa/success`,
      failureUrl: `${siteUrl}/api/payment/esewa/failure`,
    });

    await supabase
      .from('orders')
      .update({ payment_status: `esewa_txn:${transactionUuid}` })
      .eq('id', order_id);

    return NextResponse.json({
      form_action,
      fields,
      transaction_uuid: transactionUuid,
    });
  } catch (error: unknown) {
    console.error('[eSewa initiate]', error);
    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
