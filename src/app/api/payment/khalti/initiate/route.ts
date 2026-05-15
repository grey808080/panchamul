/**
 * POST /api/payment/khalti/initiate
 *
 * Called from the checkout page when the user selects Khalti.
 * Creates the order first (status=received, payment_status=pending),
 * then initiates a Khalti payment and returns the payment_url.
 *
 * Body: {
 *   order_id: string        — internal UUID of the already-created order
 *   order_number: string    — public order number (PB-2026-XXXXXXXX)
 *   amount: number          — total in NPR
 *   customer_name: string
 *   customer_phone: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initiateKhaltiPayment } from '@/lib/payment/khalti';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, order_number, amount, customer_name, customer_phone } = body;

    if (!order_id || !order_number || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the order belongs to this user
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

    // Initiate Khalti payment
    const khaltiResponse = await initiateKhaltiPayment({
      return_url: `${siteUrl}/api/payment/khalti/verify`,
      website_url: siteUrl,
      // Khalti requires amount in paisa (NPR × 100)
      amount: Math.round(amount * 100),
      purchase_order_id: order_number,
      purchase_order_name: `Panchamul Bijuli Order ${order_number}`,
      customer_info: {
        name: customer_name,
        phone: customer_phone,
      },
    });

    // Store the pidx in payment_status temporarily so we can verify later.
    // Format: "khalti_pidx:{pidx}" — parsed in the verify route.
    // NOTE: Add a dedicated `payment_pidx text` column to orders for cleaner storage.
    await supabase
      .from('orders')
      .update({ payment_status: `khalti_pidx:${khaltiResponse.pidx}` })
      .eq('id', order_id);

    return NextResponse.json({
      pidx: khaltiResponse.pidx,
      payment_url: khaltiResponse.payment_url,
    });
  } catch (error: unknown) {
    console.error('[Khalti initiate]', error);
    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
