import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { notifyNewOrder } from '@/lib/notifications/orderNotification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, payment_method, order_number, total } = body;

    if (!customer?.name || !customer?.phone || !customer?.address || !items?.length || !order_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allowedMethods = new Set(['cod', 'esewa', 'khalti', 'bank_transfer']);
    if (!allowedMethods.has(payment_method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Get user_id from session cookie (null for guests)
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();

    const supabase = createAdminClient();

    const normalizedItems = items.map(
      (item: { product_id: string; name_en: string; name_np?: string; quantity: number; price: number }) => ({
        product_id: item.product_id,
        name_en: item.name_en,
        name_np: item.name_np || null,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unit_price: Number(item.price) || 0,
      })
    );

    const subtotal = normalizedItems.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) => sum + item.quantity * item.unit_price,
      0
    );

    const finalTotal = Number(total);
    if (!Number.isFinite(finalTotal) || finalTotal < 0 || Math.abs(finalTotal - subtotal) > 0.01) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        user_id: user?.id ?? null,
        customer_name: customer.name,
        customer_phone: customer.phone,
        delivery_address: customer.address,
        delivery_city: customer.city,
        items: normalizedItems,
        subtotal,
        delivery_charge: 0,
        total: finalTotal,
        notes: customer.notes || null,
        payment_method,
        status: 'received',
      })
      .select('order_number, id')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Atomically decrement stock. decrement_stock is a custom Postgres function
    // not in the generated types, so we cast to any for the rpc call only.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    await Promise.all(
      normalizedItems.map((item: { product_id: string; quantity: number }) =>
        db.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        })
      )
    );

    // Fire-and-forget notification — never blocks the order response
    notifyNewOrder({
      order_number: order.order_number,
      customer_name: customer.name,
      customer_phone: customer.phone,
      total: finalTotal,
      payment_method,
      items_count: normalizedItems.length,
    }).catch((err) => console.error('[Notification] Unhandled error:', err));

    return NextResponse.json({ order_number: order.order_number, id: order.id });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}