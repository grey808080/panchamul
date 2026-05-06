import { createPublicClient } from '@/lib/supabase/server';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name_en, name_np, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id!)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={related || []}
    />
  );
}