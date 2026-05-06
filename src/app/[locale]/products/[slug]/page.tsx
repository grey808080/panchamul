import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*, categories(name, name_np, slug)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch related products from same category
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('active', true)
    .limit(4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts || []}
    />
  );
}
