import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import OrderDetailClient from './OrderDetailClient';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('id', id)
    .single();

  if (error || !order) notFound();

  return <OrderDetailClient order={order} />;
}
