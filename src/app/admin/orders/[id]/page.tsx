import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import OrderDetailClient from './OrderDetailClient';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !order) notFound();

  // Backfill product names for old orders that don't have them
  const items = order.items as any[];
  const missingNames = items.filter(i => !i.name_en && i.product_id);

  if (missingNames.length > 0) {
    const productIds = missingNames.map(i => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name_en, name_np')
      .in('id', productIds);

    if (products) {
      const productMap = Object.fromEntries(products.map(p => [p.id, p]));
      order.items = items.map(item => ({
        ...item,
        name_en: item.name_en || productMap[item.product_id]?.name_en || 'Unknown Product',
        name_np: item.name_np || productMap[item.product_id]?.name_np || null,
      }));
    }
  }

  return <OrderDetailClient order={order} />;
}