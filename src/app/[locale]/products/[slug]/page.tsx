import { createPublicClient } from '@/lib/supabase/server';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = createPublicClient();

  const { data: product } = await supabase
    .from('products')
    .select('name_en, name_np, description_en, description_np, images')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
  const description =
    (locale === 'np' && product.description_np
      ? product.description_np
      : product.description_en) ?? `Buy ${product.name_en} at Panchamul Bijuli, Kohalpur.`;

  return {
    title: `${name} | Panchamul Bijuli`,
    description: description.slice(0, 160),
    openGraph: {
      title: name,
      description: description.slice(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

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
