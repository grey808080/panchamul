import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, payment_method, order_number, total } = body;

    if (!customer || !items?.length || !order_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allowedMethods = new Set(['cod', 'esewa', 'khalti', 'bank_transfer']);
    if (!allowedMethods.has(payment_method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

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

    // Keep server total consistent with submitted payload to avoid silent mismatches.
    const finalTotal = Number(total);
    if (!Number.isFinite(finalTotal) || finalTotal < 0 || Math.abs(finalTotal - subtotal) > 0.01) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const createOrder = async () => {
      const modernInsert = await supabase
        .from('orders')
        .insert({
          order_number,
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
        .select()
        .single();

      if (!modernInsert.error) return modernInsert;

      // Backward compatibility for older schema deployments.
      return supabase
        .from('orders')
        .insert({
          order_number,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_address: customer.address,
          customer_city: customer.city,
          total_amount: finalTotal,
          notes: customer.notes || null,
          payment_method,
          status: 'received',
        } as any)
        .select()
        .single();
    };

    const { data: order, error: orderError } = await createOrder();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Best-effort stock decrement for Phase 1 checkout.
    for (const item of normalizedItems) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_qty')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        console.error('Product fetch error:', productError);
        continue;
      }

      const currentStock = product.stock_qty ?? 0;
      const nextStock = Math.max(0, currentStock - item.quantity);

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_qty: nextStock })
        .eq('id', item.product_id);

      if (stockError) {
        console.error('Stock update error:', stockError);
      }
    }

    return NextResponse.json({ order_number: order.order_number, id: order.id });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
